import Navbar from "@/components/navigation/navbar/index.jsx";
import React from "react";

const MainLayout = ({ children }) => {
  return (
    <div>
      {" "}
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;
