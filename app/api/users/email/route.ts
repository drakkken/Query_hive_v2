import { NextResponse } from "next/server";

import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-error";

import { UserSchema } from "@/lib/validations";
import { PrismaClient } from "@/lib/generated/prisma";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validatedData = UserSchema.safeParse(body);

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const { email, username } = validatedData.data;

    const existingUser = await prisma.user.findFirst({
      where: { email },
    });
    if (existingUser) throw new Error("User already exists");

    const existingUsername = await prisma.user.findFirst({
      where: { username },
    });
    if (existingUsername) throw new Error("Username already exists");

    const newUser = await prisma.user.create({
      data: validatedData.data,
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
