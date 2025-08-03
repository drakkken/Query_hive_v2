import ROUTES from "@/constants/routes";
import { cn, getDevIconsClassName } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Badge } from "../ui/badge";

interface Props {
  id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
}
const TagCard = ({
  id,
  name,
  questions,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDevIconsClassName(name);
  return (
    <Link href={ROUTES.TAG(id)} className="flex justify-between gap-2">
      <Badge className="subtle-medium background-dark400_light900 text-light400_light500 rounded-md border-none px-4 py-2 uppercase">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm`}></i>
          <span>{name}</span>
        </div>
      </Badge>

      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </Link>
  );
};

export default TagCard;
