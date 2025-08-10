import { NextResponse } from "next/server";
import slugify from "slugify";

import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-error";

import { SignInWithOAuthSchema } from "@/lib/validations";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { name, username, email, image } = user;
    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    const result = await prisma.$transaction(async (tx) => {
      // Check if user exists
      let existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (!existingUser) {
        // Create new user
        existingUser = await tx.user.create({
          data: {
            name,
            username: slugifiedUsername,
            email,
            image,
          },
        });
      } else {
        // Update user if needed
        const updatedData: { name?: string; image?: string } = {};
        if (existingUser.name !== name) updatedData.name = name;
        if (existingUser.image !== image) updatedData.image = image;

        if (Object.keys(updatedData).length > 0) {
          existingUser = await tx.user.update({
            where: { id: existingUser.id },
            data: updatedData,
          });
        }
      }

      // Check if account exists
      const existingAccount = await tx.account.findFirst({
        where: {
          userId: existingUser.id,
          provider,
          providerAccountId,
        },
      });

      if (!existingAccount) {
        // Create new account
        await tx.account.create({
          data: {
            userId: existingUser.id,
            name,
            image,
            provider,
            providerAccountId,
          },
        });
      }

      return existingUser;
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
