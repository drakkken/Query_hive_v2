// import { PrismaClient } from "@/lib/generated/prisma";
import handleError from "@/lib/handlers/error";
import { ForbiddenError, ValidationError } from "@/lib/http-error";
import prisma from "@/lib/prisma";
import { AccountSchema, UserSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

// const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const accounts = await prisma.account.findMany();
    return NextResponse.json(
      { success: true, data: accounts },
      { status: 200 }
    );
  } catch (e) {
    return handleError(e, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = AccountSchema.parse(body);
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: validatedData.provider,
        providerAccountId: validatedData.providerAccountId,
      },
    });

    if (existingAccount) {
      throw new ForbiddenError(
        "An account with the same provider already exists"
      );
    }

    const newAccount = await prisma.account.create({
      data: validatedData,
    });

    return NextResponse.json(
      { success: true, data: newAccount },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
