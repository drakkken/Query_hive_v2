import LeftSideBar from "@/components/navigation/LeftSideBar";
import Navbar from "@/components/navigation/navbar/index";
import RightSideBar from "@/components/navigation/RightSideBar";
import LocalSearch from "@/components/search/LocalSearch";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="background-light850_dark100 relative">
      {" "}
      <Navbar />
      <div className="flex">
        <LeftSideBar />
        <section className="min-h-screen flex flex-1 flex-col px-6 pb-6 pt-36 max-md:pb-14 sm:px-14">
          {children}
        </section>
        <RightSideBar />
      </div>
    </div>
  );
};

export default MainLayout;
