import { ModeToggle } from "@/components/Theme.jsx";
import Image from "next/image.js";
import Link from "next/link.js";
import React from "react";

const Navbar = () => {
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5  p-6 shadow-light-300 dark:shadow-none sm:px-12">
      {" "}
      <Link href={"/"} className="flex items-center gap-1">
        <Image src="/assets/logo.png" width={50} height={50} alt=" Logo" />

        <p className="h2-bold font-space-grotesk text-dark-100 dark:text-light-900 max-sm:hidden">
          Query<span className="text-primary-500">Hive</span>
        </p>
      </Link>
      <p>Global search</p>
      <div className="flex-between gap-5">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
