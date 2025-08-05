import { auth } from "@/auth";
import HomeFilter from "@/components/filters/HomeFilter";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

import React from "react";
const questions = [
  {
    id: "3",
    title: "Best practices for React state management?",
    description:
      "I'm building a large React application and struggling with state management. Should I use Redux, Context API, or something else? What are the pros and cons?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "3", name: "Redux" },
      { _id: "4", name: "State Management" },
    ],
    author: { _id: "2", name: "Sarah Wilson" },
    upvotes: 23,
    answers: 8,
    views: 245,
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "How to optimize database queries in MongoDB?",
    description:
      "My MongoDB queries are running very slowly on large collections. I have around 1 million documents and need to improve performance. Any indexing strategies or query optimization tips?",
    tags: [
      { _id: "5", name: "MongoDB" },
      { _id: "6", name: "Database" },
      { _id: "7", name: "Performance" },
    ],
    author: { _id: "3", name: "Mike Chen" },
    upvotes: 15,
    answers: 12,
    views: 320,
    createdAt: new Date(),
  },
  {
    id: "5",
    title: "CSS Grid vs Flexbox - when to use which?",
    description:
      "I'm confused about when to use CSS Grid versus Flexbox for layouts. Can someone explain the key differences and provide examples of when each is most appropriate?",
    tags: [
      { _id: "8", name: "CSS" },
      { _id: "9", name: "Grid" },
      { _id: "10", name: "Flexbox" },
    ],
    author: { _id: "4", name: "Emma Rodriguez" },
    upvotes: 31,
    answers: 6,
    views: 180,
    createdAt: new Date(),
  },
];
const page = async () => {
  return (
    <>
      <section className="flex w-full flex-col-reverse sm:flex-row justify-between gap-4  sm:items-center ">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900 "
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a question</Link>
        </Button>
      </section>
      <section className="mt-11 ">
        <LocalSearch
          route={ROUTES.HOME}
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          iconPosition="left"
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex wifull flex-col gap-6">
        {questions.map((question) => (
          <h1 key={question.id}>{question.title}</h1>
        ))}
      </div>
    </>
  );
};

export default page;
