"use server";

import bcrypt from "bcryptjs";

import { signIn } from "@/auth";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { NotFoundError } from "../http-error";
import { SignInSchema, SignUpSchema } from "../validations";
// import { PrismaClient } from "../generated/prisma";
import prisma from "../prisma";

export async function signUpWithCredentials(
  params: AuthCredentials
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignUpSchema });

  if (validationResult instanceof Error) {
    console.log("error here");

    return handleError(validationResult) as ErrorResponse;
  }

  const { name, username, email, password } = validationResult.params!;

  // Check for existing user BEFORE transaction
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return handleError(new Error("User already exists")) as ErrorResponse;
  }
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });
  if (existingUsername) {
    return handleError(new Error("Username already exists")) as ErrorResponse;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await tx.user.create({
        data: { username, name, email },
      });

      await tx.account.create({
        data: {
          userId: newUser.id,
          name,
          provider: "credentials",
          providerAccountId: email,
          password: hashedPassword,
        },
      });

      return newUser;
    });

    // Sign in the user
    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  const validationResult = await action({ params, schema: SignInSchema });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { email, password } = validationResult.params!;

  try {
    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new NotFoundError("User");
    }

    // Find associated credentials account
    const existingAccount = await prisma.account.findFirst({
      where: {
        provider: "credentials",
        providerAccountId: email,
      },
    });

    if (!existingAccount) {
      throw new NotFoundError("Account");
    }
    if (!existingAccount.password) {
      throw new Error("Account password not found");
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password
    );

    if (!passwordMatch) {
      throw new Error("Password does not match");
    }

    // Sign in the user
    await signIn("credentials", { email, password, redirect: false });

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

// export async function signInWithCredentials(
//   params: Pick<AuthCredentials, "email" | "password">
// ): Promise<ActionResponse> {
//   const validationResult = await action({ params, schema: SignInSchema });

//   if (validationResult instanceof Error) {
//     return handleError(validationResult) as ErrorResponse;
//   }

//   const { email, password } = validationResult.params!;

//   try {
//     const existingUser = await User.findOne({ email });

//     if (!existingUser) throw new NotFoundError("User");

//     const existingAccount = await Account.findOne({
//       provider: "credentials",
//       providerAccountId: email,
//     });

//     if (!existingAccount) throw new NotFoundError("Account");

//     const passwordMatch = await bcrypt.compare(
//       password,
//       existingAccount.password
//     );

//     if (!passwordMatch) throw new Error("Password does not match");

//     await signIn("credentials", { email, password, redirect: false });

//     return { success: true };
//   } catch (error) {
//     return handleError(error) as ErrorResponse;
//   }
// }
