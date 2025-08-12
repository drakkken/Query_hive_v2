"use server";

import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import prisma from "@/lib/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CollectionBaseSchema,
  PaginatedSearchParamsSchema,
} from "../validations";

export async function toggleSaveQuestion(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) },
    });

    if (!question) throw new Error("Question not found");

    // Check if collection already exists
    const collection = await prisma.collection.findUnique({
      where: {
        authorId_questionId: {
          authorId: parseInt(userId!),
          questionId: parseInt(questionId),
        },
      },
    });

    if (collection) {
      // Remove from collection
      await prisma.collection.delete({
        where: { id: collection.id },
      });

      revalidatePath(ROUTES.QUESTION(questionId));

      return {
        success: true,
        data: {
          saved: false,
        },
      };
    }

    // Add to collection
    await prisma.collection.create({
      data: {
        authorId: parseInt(userId!),
        questionId: parseInt(questionId),
      },
    });

    revalidatePath(ROUTES.QUESTION(questionId));

    return {
      success: true,
      data: {
        saved: true,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasSavedQuestion(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const collection = await prisma.collection.findUnique({
      where: {
        authorId_questionId: {
          authorId: parseInt(userId!),
          questionId: parseInt(questionId),
        },
      },
    });

    return {
      success: true,
      data: {
        saved: !!collection,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getSavedQuestions(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const userId = validationResult.session?.user?.id;
  const { page = 1, pageSize = 10, query, filter } = params;

  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  // Define sort options
  let orderBy: any = { createdAt: "desc" }; // Default sorting

  switch (filter) {
    case "mostrecent":
      orderBy = { question: { createdAt: "desc" } };
      break;
    case "oldest":
      orderBy = { question: { createdAt: "asc" } };
      break;
    case "mostvoted":
      orderBy = { question: { upvotes: "desc" } };
      break;
    case "mostviewed":
      orderBy = { question: { views: "desc" } };
      break;
    case "mostanswered":
      orderBy = { question: { answers: "desc" } };
      break;
  }

  try {
    // Build where clause
    const whereClause: any = {
      authorId: parseInt(userId!),
    };

    // Add search query if provided
    if (query) {
      whereClause.question = {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      };
    }

    // Get total count
    const totalCount = await prisma.collection.count({
      where: whereClause,
    });

    // Get saved questions with related data
    const collections = await prisma.collection.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        question: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Transform the data to flatten the tag structure
    const transformedCollections = collections.map((collection) => ({
      ...collection,
      question: {
        ...collection.question,
        tags: collection.question.tags.map((tagRelation) => tagRelation.tag),
      },
    }));

    const isNext = totalCount > skip + collections.length;

    return {
      success: true,
      data: {
        collection: transformedCollections,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
