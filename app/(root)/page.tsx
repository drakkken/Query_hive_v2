import { auth } from "@/auth";

import React from "react";

const page = async () => {
  const session = await auth();
  console.log(session);

  return <div>home page</div>;
};

export default page;
