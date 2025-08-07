import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDevIconsClassName(techName: string) {
  const normalizedTech = techName.replace(/[ .]/g, "").toLowerCase();

  const techMap: { [key: string]: string } = {
    javascript: "devicon-javascript-plain",
    js: "devicon-javascript-plain",

    typescript: "devicon-typescript-plain",
    ts: "devicon-typescript-plain",

    react: "devicon-react-original",
    reactjs: "devicon-react-original",

    nextjs: "devicon-nextjs-plain",
    next: "devicon-nextjs-plain",

    nodejs: "devicon-nodejs-plain",
    node: "devicon-nodejs-plain",

    bun: "devicon-bun-plain",
    bunjs: "devicon-bun-plain",

    deno: "devicon-denojs-original",
    denojs: "devicon-denojs-plain",

    python: "devicon-python-plain",

    java: "devicon-java-plain",

    "c++": "devicon-cplusplus-plain",
    cpp: "devicon-cplusplus-plain",

    "c#": "devicon-csharp-plain",
    csharp: "devicon-csharp-plain",

    php: "devicon-php-plain",

    html: "devicon-html5-plain",
    html5: "devicon-html5-plain",

    css: "devicon-css3-plain",
    css3: "devicon-css3-plain",

    git: "devicon-git-plain",

    docker: "devicon-docker-plain",

    mongodb: "devicon-mongodb-plain",
    mongo: "devicon-mongodb-plain",

    mysql: "devicon-mysql-plain",

    postgresql: "devicon-postgresql-plain",
    postgres: "devicon-postgresql-plain",

    aws: "devicon-amazonwebservices-original",
    "amazon web services": "devicon-amazonwebservices-original",

    tailwind: "devicon-tailwindcss-original",
    tailwindcss: "devicon-tailwindcss-original",
  };
  return `${techMap[normalizedTech] || "devicon-devicon-plain"} colored`;
}

export function formatNumber(number: number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K";
  } else {
    return number.toString();
  }
}

export const getTimeStamp = (createdAt: Date): string => {
  const date = new Date(createdAt);
  const now = new Date();

  const diffMilliseconds = now.getTime() - date.getTime();
  const diffSeconds = Math.round(diffMilliseconds / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds} seconds ago`;
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} mins ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hours ago`;
  }

  const diffDays = Math.round(diffHours / 24);

  return `${diffDays} days ago`;
};
