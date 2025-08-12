"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import prisma from "@/lib/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";
// import { createInteraction } from "./interaction.action";
import { createInteraction } from "./interaction.action";

async function updateVoteCount(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationResult.params!;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";
  console.log("cehcking");
  try {
    let result;

    if (targetType === "question") {
      result = await prisma.question.update({
        where: { id: parseInt(targetId) },
        data: {
          [voteField]: {
            increment: change,
          },
        },
      });
    } else {
      result = await prisma.answer.update({
        where: { id: parseInt(targetId) },
        data: {
          [voteField]: {
            increment: change,
          },
        },
      });
    }

    if (!result) throw new Error("Failed to update vote count");

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  if (!userId) return handleError(new Error("Unauthorized")) as ErrorResponse;

  try {
    // Use Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the content to get author info
      let contentDoc: any;
      const targetIdInt = parseInt(targetId);

      if (targetType === "question") {
        contentDoc = await tx.question.findUnique({
          where: { id: targetIdInt },
          select: { authorId: true },
        });
      } else {
        contentDoc = await tx.answer.findUnique({
          where: { id: targetIdInt },
          select: { authorId: true },
        });
      }

      if (!contentDoc) throw new Error("Content not found");

      const contentAuthorId = contentDoc.authorId.toString();

      // Check for existing vote
      const existingVote = await tx.vote.findUnique({
        where: {
          authorId_actionId_actionType: {
            authorId: parseInt(userId!),
            actionId: parseInt(targetId),
            actionType: targetType === "question" ? "question" : "answer",
          },
        },
      });

      if (existingVote) {
        if (existingVote.voteType === voteType) {
          // Remove the vote if same vote type
          await tx.vote.delete({
            where: { id: existingVote.id },
          });

          // Update vote count (decrement)
          await updateVoteCount({
            targetId: parseInt(targetId),
            targetType,
            voteType,
            change: -1,
          });
        } else {
          // Change vote type
          await tx.vote.update({
            where: { id: existingVote.id },
            data: { voteType: voteType === "upvote" ? "upvote" : "downvote" },
          });

          // Decrement old vote type
          await updateVoteCount({
            targetId: parseInt(targetId),
            targetType,
            voteType: existingVote.voteType,
            change: -1,
          });

          // Increment new vote type
          await updateVoteCount({
            targetId: parseInt(targetId),
            targetType,
            voteType,
            change: 1,
          });
        }
      } else {
        // Create new vote
        await tx.vote.create({
          data: {
            authorId: parseInt(userId),
            actionId: parseInt(targetId),
            actionType: targetType === "question" ? "question" : "answer",
            voteType: voteType === "upvote" ? "upvote" : "downvote",
          },
        });

        // Increment vote count
        await updateVoteCount({
          targetId: parseInt(targetId),
          targetType,
          voteType,
          change: 1,
        });
      }

      return { contentAuthorId };
    });

    // Log the interaction (outside transaction)
    after(async () => {
      await createInteraction({
        action: voteType,
        actionId: parseInt(targetId),
        actionTarget: targetType,
        authorId: result.contentAuthorId,
      });
    });

    revalidatePath(`/questions/${targetId}`);

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await prisma.vote.findUnique({
      where: {
        authorId_actionId_actionType: {
          authorId: parseInt(userId!),
          actionId: parseInt(targetId),
          actionType: targetType === "question" ? "question" : "answer",
        },
      },
    });

    if (!vote) {
      return {
        success: true,
        data: {
          hasUpvoted: false,
          hasDownvoted: false,
        },
      };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
