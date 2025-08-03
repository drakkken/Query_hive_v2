import { auth } from "@/auth";
import LocalSearch from "@/components/search/LocalSearch";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

import React from "react";

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
      HomeFilter
      <div className="mt-10 flex wifull flex-col gap-6">
        <p>Question 1</p>
        <p>Question 1</p>
        <p>Question 1</p>
        <p>Question 1</p>
      </div>
    </>
  );
};

export default page;
