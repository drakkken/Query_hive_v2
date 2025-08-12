import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { redirect } from "next/navigation";
import React from "react";

const page = async () => {
  const session = await auth();
  if (!session) return redirect("/Sign-in");
  return (
    <div>
      <QuestionForm />{" "}
    </div>
  );
};

export default page;
