import { NextResponse } from "next/server";
import handleError from "@/lib/handlers/error";
import { UserSchema } from "@/lib/validations";
import { NotFoundError } from "@/lib/http-error";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET /api/users/[id]
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (!id || isNaN(id)) throw new NotFoundError("User");

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new NotFoundError("User");
    return NextResponse.json({ success: true, data: user }, { status: 200 });
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
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User");
    const deletedUser = await prisma.user.delete({ where: { id } });

    return NextResponse.json(
      { success: true, data: deletedUser },
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

  if (!id || isNaN(id)) throw new NotFoundError("User");

  try {
    const body = await request.json();
    const validatedData = UserSchema.partial().parse(body);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError("User");
    const updatedUser = await prisma.user.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(
      { success: true, data: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
