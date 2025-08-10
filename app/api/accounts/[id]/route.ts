import { NextResponse } from "next/server";
import handleError from "@/lib/handlers/error";
import { AccountSchema, UserSchema } from "@/lib/validations";
import { NotFoundError, ValidationError } from "@/lib/http-error";
import prisma from "@/lib/prisma";
// import { PrismaClient } from "@/lib/generated/prisma";

// const prisma = new PrismaClient();

// GET /api/users/[id]
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (!id || isNaN(id)) throw new NotFoundError("Account");

  try {
    const account = await prisma.account.findUnique({
      where: { id },
    });
    if (!account) throw new NotFoundError("Account");
    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (!id || isNaN(id)) throw new NotFoundError("User");

  try {
    const account = await prisma.account.findUnique({ where: { id } });
    if (!account) throw new NotFoundError("Account");
    const deletedAccount = await prisma.user.delete({ where: { id } });

    return NextResponse.json(
      { success: true, data: deletedAccount },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (!id || isNaN(id)) throw new NotFoundError("Account");

  try {
    const body = await request.json();
    const validatedData = AccountSchema.partial().safeParse(body);
    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }
    const account = await prisma.user.findUnique({ where: { id } });
    if (!account) throw new NotFoundError("Account");
    const updatedAccount = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(
      { success: true, data: updatedAccount },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
