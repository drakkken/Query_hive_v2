import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";

import React from "react";
import TagCard from "../cards/TagCard";
const hotQuestions = [
  {
    id: "1",
    title: "How to implement authentication in Next.js?",
  },
  {
    id: "2",
    title: "What's the difference between SSR and SSG?",
  },
  {
    id: "3",
    title: "How to optimize React component performance?",
  },
  {
    id: "4",
    title: "Best practices for TypeScript in React?",
  },
];

const popularTags = [
  {
    id: "1",
    name: "react",
    questions: 100,
  },
  {
    id: "2",
    name: "tailwind",
    questions: 100,
  },
  {
    id: "3",
    name: "denus",
    questions: 100,
  },
];

const RightSideBar = () => {
  return (
    <section className="pt-36 custom-scrollbar background-light900_dark300 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden ">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {hotQuestions.map(({ id, title }) => (
            <Link
              key={id}
              href={ROUTES.QUESTION(id)}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700 line-clamp-2">
                {title}
              </p>

              <Image
                src="/icons/chevron-right.svg"
                alt="Chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-16 ">
        <h3 className="h3-bold text-dark200_light900">Popular tagss</h3>
        <div className="mt-7 flex flex-col gap-4 ">
          {popularTags.map(({ id, name, questions }) => (
            <TagCard
              key={id}
              id={id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSideBar;
