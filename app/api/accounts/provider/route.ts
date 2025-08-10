import { NextResponse } from "next/server";

import handleError from "@/lib/handlers/error";
import { NotFoundError, ValidationError } from "@/lib/http-error";

import { AccountSchema, UserSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
// import { PrismaClient } from "@/lib/generated/prisma";
// const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { provider, providerAccountId } = await request.json();

    const validatedData = AccountSchema.safeParse({
      provider,
      providerAccountId,
    });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }
    ///////

    const account = await prisma.account.findFirst({
      where: { providerAccountId },
    });
    if (!account) throw new NotFoundError("Account");
    return NextResponse.json(
      {
        success: true,
        data: account,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
