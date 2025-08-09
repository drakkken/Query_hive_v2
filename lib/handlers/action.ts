"use server";

import { Session } from "next-auth";
import { ZodError, ZodSchema } from "zod";
import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "../http-error";
import prisma from "@/lib/prisma"; // Import your existing Prisma client

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  authorize?: boolean;
};

// 1. Checking whether the schema and params are provided and validated.
// 2. Checking whether the user is authorized.
// 3. Returning the params, session, and prisma client with Accelerate extension.
// 4. No need for database connection as Prisma handles it automatically.
async function action<T>({
  params,
  schema,
  authorize = false,
}: ActionOptions<T>) {
  // Schema validation
  if (schema && params) {
    try {
      schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        return new ValidationError(
          error.flatten().fieldErrors as Record<string, string[]>
        );
      } else {
        return new Error("Schema validation failed");
      }
    }
  }

  // Authorization check
  let session: Session | null = null;
  if (authorize) {
    session = await auth();
    if (!session) {
      return new UnauthorizedError();
    }
  }

  // Return the validated params, session, and prisma client
  return { params, session, prisma };
}

export default action;
// No need to export prisma separately since we're importing from prisma.ts
