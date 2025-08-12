import prisma from "@/lib/prisma";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateInteractionSchema } from "../validations";

export async function createInteraction(params: any): Promise<any> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId, // person who owns the content (question/answer)
  } = validationResult.params!;

  const userId = validationResult.session?.user?.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create interaction
      const interaction = await tx.interaction.create({
        data: {
          userId: parseInt(userId!),
          action: actionType,
          actionId,
          actionType: actionTarget === "question" ? "question" : "answer",
        },
      });

      // Update reputation for both the performer and the content author
      await updateReputation({
        interaction,
        tx,
        performerId: userId!,
        authorId,
      });

      return interaction;
    });

    return { success: true, data: result };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

interface UpdateReputationParams {
  interaction: any;
  tx: any;
  performerId: string;
  authorId: string;
}

async function updateReputation(params: UpdateReputationParams) {
  const { interaction, tx, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = actionType === "question" ? 5 : 10;
      break;
    case "delete":
      authorPoints = actionType === "question" ? -5 : -10;
      break;
  }

  const performerIdInt = parseInt(performerId);
  const authorIdInt = parseInt(authorId);

  // If same person, only update once with author points
  if (performerIdInt === authorIdInt) {
    await tx.user.update({
      where: { id: performerIdInt },
      data: {
        reputation: {
          increment: authorPoints,
        },
      },
    });
    return;
  }

  // Update both users' reputation
  await Promise.all([
    tx.user.update({
      where: { id: performerIdInt },
      data: {
        reputation: {
          increment: performerPoints,
        },
      },
    }),
    tx.user.update({
      where: { id: authorIdInt },
      data: {
        reputation: {
          increment: authorPoints,
        },
      },
    }),
  ]);
}
