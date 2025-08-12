import UserAvatar from "@/components/UserAvatar";
import Votes from "@/components/votes/Votes";
import ROUTES from "@/constants/routes";
import { getQuestion, incrementViews } from "@/lib/actions/question.action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { after } from "next/server";
import React, { Suspense } from "react";
import { hasVoted } from "@/lib/actions/vote.action";
import { hasSavedQuestion } from "@/lib/actions/collection.action";
import SaveQuestion from "@/components/questions/SaveQuestion";
import Metric from "@/components/Metric";
import { formatNumber, getTimeStamp } from "@/lib/utils";
import TagCard from "@/components/cards/TagCard";

export async function generateMetaData({ params }: RouteParams) {
  const { id } = await params;
  const { success, data: question } = await getQuestion({
    questionId: parseInt(id),
  });
  if (!success || !question) {
    return {
      title: "Question not found",
      description: "This question does not exist.",
    };
  }
  return {
    title: question.title,
    description: question.content.slice(0, 100),
    twitter: {
      card: "summary_large_image",
      title: question.title,
      description: question.content.slice(0, 100),
    },
  };
}

const QuestionDetails = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, filter } = await searchParams;
  const { success, data: question } = await getQuestion({
    questionId: parseInt(id),
  });
  after(async () => {
    await incrementViews({ questionId: parseInt(id) });
  });
  if (!success || !question) return redirect("/404");
  // const {
  //   success: areAnswersLoaded,
  //   data: answersResult,
  //   error: answersError,
  // } = await getAnswers({
  //   questionId: id,
  //   page: Number(page) || 1,
  //   pageSize: Number(pageSize) || 10,
  //   filter,
  // });

  const hasVotedPromise = hasVoted({
    targetId: question.id,
    targetType: "question",
  });
  const hasSavedQuestionPromise = hasSavedQuestion({
    questionId: question.id,
  });

  const { author, createdAt, answers, views, tags, content, title } = question;
  console.log("hello from page" + JSON.stringify(tags));

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author.id.toString()}
              name={author.name}
              imageUrl={author.image}
              className="size-[22px]"
              fallbackClassName="text-[10px]"
            />
            <Link href={ROUTES.PROFILE(`${author.id}`)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>
          <div className="flex items-center justify-end gap-4">
            <Suspense fallback={<div>Loading...</div>}>
              <Votes
                targetType="question"
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                targetId={question.id.toString()}
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>

            <Suspense fallback={<div>Loading...</div>}>
              <SaveQuestion
                questionId={question.id.toString()}
                hasSavedQuestionPromise={hasSavedQuestionPromise}
              />
            </Suspense>
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>
      {/* <Preview content={content} /> */}
      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: any) => (
          <TagCard
            key={tag.tagId}
            id={tag.tagId as string}
            name={tag.tag.name}
            compact
          />
        ))}
      </div>
      {/* <section className="my-5">
        <AllAnswers
          page={Number(page) || 1}
          isNext={answersResult?.isNext || false}
          data={answersResult?.answers}
          success={areAnswersLoaded}
          error={answersError}
          totalAnswers={answersResult?.totalAnswers || 0}
        />
      </section>

      <section className="my-5">
        <AnswerForm
          questionId={question._id}
          questionTitle={question.title}
          questionContent={question.content}
        />
      </section> */}
    </>
  );
};
export default QuestionDetails;
