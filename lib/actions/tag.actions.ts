import { Prisma } from "../generated/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validations";
import prisma from "@/lib/prisma";

export const getTags = async (params: any): Promise<any> => {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const whereClause: any = {};

  if (query) {
    whereClause.name = {
      contains: query,
      mode: "insensitive",
    };
  }

  let orderBy: any = {};

  switch (filter) {
    case "popular":
      orderBy = { questions: "desc" }; // Using the questions count field
      break;
    case "recent":
      orderBy = { createdAt: "desc" };
      break;
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    default:
      orderBy = { questions: "desc" }; // Using the questions count field
      break;
  }

  try {
    const totalTags = await prisma.tag.count({
      where: whereClause,
    });

    const tags = await prisma.tag.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
    });

    const isNext = totalTags > skip + tags.length;

    return {
      success: true,
      data: {
        tags,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const getTagQuestions = async (params: any): Promise<any> => {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { tagId, page = 1, pageSize = 10, query } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) throw new Error("Tag not found");

    const whereClause: any = {
      tags: {
        some: {
          tagId: tagId, // Using the junction table relationship
        },
      },
    };

    if (query) {
      whereClause.title = {
        contains: query,
        mode: "insensitive",
      };
    }

    const totalQuestions = await prisma.question.count({
      where: whereClause,
    });

    const questions = await prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        views: true,
        answers: true,
        upvotes: true,
        downvotes: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the questions to flatten the tag structure
    const transformedQuestions = questions.map((question) => ({
      ...question,
      tags: question.tags.map((tagRelation) => tagRelation.tag),
    }));

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        tag,
        questions: transformedQuestions,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
