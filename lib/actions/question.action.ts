"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { cache } from "react";

import { auth } from "@/auth";
import prisma from "../prisma";
import action from "@/lib/handlers/action";
import handleError from "@/lib/handlers/error";
import {
  AskQuestionSchema,
  DeleteQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "@/lib/validations";

// import { createInteraction } from "./interaction.action";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<any>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = parseInt(validationResult.session?.user?.id!);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create the question
      const question = await tx.question.create({
        data: {
          title,
          content,
          authorId: userId,
        },
      });

      // Process tags
      const tagOperations = tags.map(async (tagName) => {
        // Find or create tag
        const tag = await tx.tag.upsert({
          where: {
            name: tagName.toLowerCase(),
          },
          create: {
            name: tagName,
            questions: 1,
          },
          update: {
            questions: {
              increment: 1,
            },
          },
        });

        // Create tag-question relationship using QuestionTag
        await tx.questionTag.create({
          data: {
            tagId: tag.id,
            questionId: question.id,
          },
        });

        return tag.id;
      });

      await Promise.all(tagOperations);

      // Return question with relations
      const updatedQuestion = await tx.question.findUnique({
        where: { id: question.id },
        include: {
          tags: {
            include: {
              tag: {
                select: { id: true, name: true },
              },
            },
          },
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });

      return updatedQuestion;
    });

    // Log the interaction outside transaction
    // after(async () => {
    //   await createInteraction({
    //     action: "post",
    //     actionId: result!.id.toString(),
    //     actionTarget: "question",
    //     authorId: userId.toString(),
    //   });
    // });

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = parseInt(validationResult.session?.user?.id!);
  const questionIdInt = questionId;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get question with current tags
      const question = await tx.question.findUnique({
        where: { id: questionIdInt },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!question) throw new Error("Question not found");
      if (question.authorId !== userId) {
        throw new Error("You are not authorized to edit this question");
      }

      // Update question title and content if changed
      if (question.title !== title || question.content !== content) {
        await tx.question.update({
          where: { id: questionIdInt },
          data: { title, content },
        });
      }

      // Get current tag names
      const currentTagNames = question.tags.map((qt) =>
        qt.tag.name.toLowerCase()
      );
      const newTagNames = tags.map((tag) => tag.toLowerCase());

      // Find tags to add and remove
      const tagsToAdd = newTagNames.filter(
        (tag) => !currentTagNames.includes(tag)
      );
      const tagsToRemove = currentTagNames.filter(
        (tag) => !newTagNames.includes(tag)
      );

      // Remove old tags
      if (tagsToRemove.length > 0) {
        const tagsToRemoveIds = question.tags
          .filter((qt) => tagsToRemove.includes(qt.tag.name.toLowerCase()))
          .map((qt) => qt.tag.id);

        // Decrement questions count for removed tags
        await tx.tag.updateMany({
          where: { id: { in: tagsToRemoveIds } },
          data: { questions: { decrement: 1 } },
        });

        // Remove QuestionTag relationships
        await tx.questionTag.deleteMany({
          where: {
            tagId: { in: tagsToRemoveIds },
            questionId: questionIdInt,
          },
        });
      }

      // Add new tags
      if (tagsToAdd.length > 0) {
        const newTagOperations = tagsToAdd.map(async (tagName) => {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName, questions: 1 },
            update: { questions: { increment: 1 } },
          });

          await tx.questionTag.create({
            data: {
              tagId: tag.id,
              questionId: questionIdInt,
            },
          });

          return tag.id;
        });

        await Promise.all(newTagOperations);
      }

      // Return updated question
      return await tx.question.findUnique({
        where: { id: questionIdInt },
        include: {
          tags: {
            include: {
              tag: {
                select: { id: true, name: true },
              },
            },
          },
          author: {
            select: { id: true, name: true, image: true },
          },
        },
      });
    });

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export const getQuestion = cache(async function getQuestion(
  params: GetQuestionParams
): Promise<ActionResponse<Question>> {
  const validationResult = await action({
    params,
    schema: GetQuestionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const questionIdInt = questionId;

  try {
    const question = await prisma.question.findUnique({
      where: { id: questionIdInt },
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!question) throw new Error("Question not found");

    return { success: true, data: JSON.parse(JSON.stringify(question)) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
});

export async function getRecommendedQuestions({
  userId,
  query,
  skip,
  limit,
}: RecommendationParams) {
  const userIdInt = userId;

  // Get user interactions
  const interactions = await prisma.interaction.findMany({
    where: {
      userId: userIdInt,
      actionType: "question",
      action: { in: ["view", "upvote", "bookmark", "post"] },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const interactedQuestionIds = interactions.map((i) => parseInt(i.actionId));

  // Get tags from interacted questions
  const interactedQuestions = await prisma.question.findMany({
    where: { id: { in: interactedQuestionIds } },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  const allTagIds = interactedQuestions.flatMap((q) =>
    q.tags.map((qt) => qt.tag.id)
  );
  const uniqueTagIds = [...new Set(allTagIds)];

  // Build where clause for recommendations
  const whereClause: any = {
    id: { notIn: interactedQuestionIds },
    authorId: { not: userIdInt },
    tags: { some: { tagId: { in: uniqueTagIds } } },
  };

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  const total = await prisma.question.count({ where: whereClause });

  const questions = await prisma.question.findMany({
    where: whereClause,
    include: {
      tags: {
        include: {
          tag: {
            select: { name: true },
          },
        },
      },
      author: { select: { name: true, image: true } },
    },
    orderBy: [{ upvotes: "desc" }, { views: "desc" }],
    skip,
    take: limit,
  });

  return {
    questions: JSON.parse(JSON.stringify(questions)),
    isNext: total > skip + questions.length,
  };
}

export async function getQuestions(params: PaginatedSearchParams): Promise<
  ActionResponse<{
    questions: Question[];
    isNext: boolean;
  }>
> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { page = 1, pageSize = 10, query, filter } = params;
  const skip = (Number(page) - 1) * pageSize;
  const limit = pageSize;

  try {
    // Handle recommendations
    if (filter === "recommended") {
      const session = await auth();
      //   const userId = session?.user?.id;
      //   let userIdInt;
      //   if (userId) userIdInt = parseInt(userId);
      const userId = session?.user?.id ? Number(session.user.id) : null;

      if (!userId) {
        return { success: true, data: { questions: [], isNext: false } };
      }

      const recommended = await getRecommendedQuestions({
        userId,
        query,
        skip,
        limit,
      });

      return { success: true, data: recommended };
    }

    // Build where clause
    const whereClause: any = {};
    let orderBy: any = { createdAt: "desc" };

    // Search functionality
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ];
    }

    // Apply filters
    switch (filter) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "unanswered":
        whereClause.answers = 0;
        orderBy = { createdAt: "desc" };
        break;
      case "popular":
        orderBy = { upvotes: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const totalQuestions = await prisma.question.count({ where: whereClause });

    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        tags: {
          include: {
            tag: {
              select: { name: true },
            },
          },
        },
        author: { select: { name: true, image: true } },
      },
      orderBy,
      skip,
      take: limit,
    });

    const isNext = totalQuestions > skip + questions.length;

    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function incrementViews(
  params: IncrementViewsParams
): Promise<ActionResponse<{ views: number }>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const questionIdInt = questionId;

  try {
    const question = await prisma.question.update({
      where: { id: questionIdInt },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return {
      success: true,
      data: { views: question.views },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getHotQuestions(): Promise<ActionResponse<Question[]>> {
  try {
    const questions = await prisma.question.findMany({
      orderBy: [{ views: "desc" }, { upvotes: "desc" }],
      take: 5,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(questions)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteQuestion(
  params: DeleteQuestionParams
): Promise<ActionResponse> {
  const validationResult = await action({
    params,
    schema: DeleteQuestionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const { user } = validationResult.session!;
  const questionIdInt = questionId;
  const userIdInt = parseInt(user?.id!);

  try {
    await prisma.$transaction(async (tx) => {
      // Get question to verify ownership
      const question = await tx.question.findUnique({
        where: { id: questionIdInt },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!question) throw new Error("Question not found");
      if (question.authorId !== userIdInt) {
        throw new Error("You are not authorized to delete this question");
      }

      // Delete collections
      await tx.collection.deleteMany({
        where: { questionId: questionIdInt },
      });

      // Delete QuestionTag relationships
      await tx.questionTag.deleteMany({
        where: { questionId: questionIdInt },
      });

      // Decrement tag question counts
      if (question.tags.length > 0) {
        await tx.tag.updateMany({
          where: { id: { in: question.tags.map((qt) => qt.tag.id) } },
          data: { questions: { decrement: 1 } },
        });
      }

      // Remove question votes
      await tx.vote.deleteMany({
        where: {
          actionId: questionIdInt.toString(),
          actionType: "question",
        },
      });

      // Get and delete answers with their votes
      const answers = await tx.answer.findMany({
        where: { questionId: questionIdInt },
        select: { id: true },
      });

      if (answers.length > 0) {
        const answerIds = answers.map((answer) => answer.id.toString());

        await tx.vote.deleteMany({
          where: {
            actionId: { in: answerIds },
            actionType: "answer",
          },
        });

        await tx.answer.deleteMany({
          where: { questionId: questionIdInt },
        });
      }

      // Finally delete the question (cascade will handle QuestionTag due to onDelete: Cascade)
      await tx.question.delete({
        where: { id: questionIdInt },
      });
    });

    // Log interaction outside transaction
    // after(async () => {
    //   await createInteraction({
    //     action: "delete",
    //     actionId: questionId,
    //     actionTarget: "question",
    //     authorId: user?.id as string,
    //   });
    // });

    revalidatePath(`/profile/${user?.id}`);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
