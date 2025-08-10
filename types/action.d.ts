interface SignInWithOAuthParams {
  provider: "github" | "google";
  providerAccountId: string;
  user: {
    name: string;
    username: string;
    email: string;
    image: string;
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface CreateQuestionParams {
  title: string;
  content: string;
  tags: string[];
}

interface EditQuestionParams extends CreateQuestionParams {
  questionId: number;
}

interface GetQuestionParams {
  questionId: number;
}

interface GetTagQuestionsParams extends Omit<PaginatedSearchParams, "filter"> {
  tagId: number;
}

interface IncrementViewsParams {
  questionId: number;
}

interface CreateAnswerParams {
  content: string;
  questionId: number;
}

interface GetAnswersParams extends PaginatedSearchParams {
  questionId: number;
}

interface CreateVoteParams {
  targetId: number;
  targetType: "question" | "answer";
  voteType: "upvote" | "downvote";
}

interface UpdateVoteCountParams extends CreateVoteParams {
  change: 1 | -1;
}

type HasVotedParams = Pick<CreateVoteParams, "targetId" | "targetType">;

interface HasVotedResponse {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

interface CollectionBaseParams {
  questionId: number;
}

interface GetUserParams {
  userId: number;
}

interface GetUserQuestionsParams
  extends Omit<PaginatedSearchParams, "query | filter | sort"> {
  userId: number;
}

interface GetUserAnswersParams extends PaginatedSearchParams {
  userId: number;
}

interface GetUserTagsParams {
  userId: number;
}

interface DeleteQuestionParams {
  questionId: number;
}

interface DeleteAnswerParams {
  answerId: number;
}

interface CreateInteractionParams {
  action:
    | "view"
    | "upvote"
    | "downvote"
    | "bookmark"
    | "post"
    | "edit"
    | "delete"
    | "search";
  actionId: number;
  authorId: number;
  actionTarget: "question" | "answer";
}

interface UpdateReputationParams {
  interaction: IInteractionDoc;
  session: mongoose.ClientSession;
  performerId: number;
  authorId: number;
}

interface RecommendationParams {
  userId: number;
  query?: string;
  skip: number;
  limit: number;
}

interface JobFilterParams {
  query: string;
  page: string;
}

interface UpdateUserParams {
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  password?: string;
}

interface GlobalSearchParams {
  query: string;
  type: string | null;
}
