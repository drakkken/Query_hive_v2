import React from "react";

const QuestionDetails = async ({ params }: RouteParams) => {
  const { id } = await params;
  //   console.log(id);
  return <div>QuestionDetails</div>;
};

export default QuestionDetails;
