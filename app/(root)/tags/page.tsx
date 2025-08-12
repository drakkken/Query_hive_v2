import TagCard from "@/components/cards/TagCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_TAGS } from "@/constants/states";
import { getTags } from "@/lib/actions/tag.actions";

import React from "react";

const tags = async ({ searchParams }: any) => {
  const { page, pageSize, query, filter } = await searchParams;
  const { success, data, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });
  const { tags, isNext } = data || {};

  // console.log("TAGS", JSON.stringify(tags, null, 2));
  console.log(tags);
  return (
    <>
      <>
        <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>

        <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
          <LocalSearch
            route={ROUTES.TAGS}
            imgSrc="/icons/search.svg"
            placeholder="Search tags..."
            otherClasses="flex-1"
          />

          {/* <CommonFilter
            filters={TagFilters}
            otherClasses="min-h-[56px] sm:min-w-[170px]"
          /> */}
        </div>

        <DataRenderer
          success={success}
          error={error}
          data={tags}
          empty={EMPTY_TAGS}
          render={(tags) => (
            <div className="mt-10 flex w-full flex-wrap gap-4">
              {tags.map((tag: any) => (
                <TagCard key={tag.id} id={tag.id} {...tag} />
              ))}
            </div>
          )}
        />

        {/* <Pagination page={page} isNext={isNext || false} /> */}
      </>
    </>
  );
};

export default tags;
