import type React from "react";
import Link from "next/link";

import { sanityFetch } from "@/sanity/lib/live";
import { morePostsQuery, allPostsQuery } from "@/sanity/lib/queries";
import type { Post as PostType } from "@/sanity.types";
import DateComponent from "@/app/components/Date";
import OnBoarding from "@/app/components/Onboarding";
import CoverImage from "@/app/components/CoverImage";
import { ArrowRight } from "lucide-react";

const Post = ({ post }: { post: PostType }) => {
  const { _id, title, slug, excerpt, date, coverImage } = post;

  return (
    <article
      key={_id}
      className="group relative flex flex-col md:flex-row gap-6 rounded-xl border border-gray-200 p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300 bg-white"
    >
      <div className="w-full md:w-1/3 h-48 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
        <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
          <CoverImage image={coverImage} />
        </div>
      </div>

      <div className="flex flex-col flex-grow space-y-3">
        <div className="inline-flex items-center text-gray-500 text-sm font-medium">
          <span className="inline-block bg-gray-100 px-2.5 py-1 rounded-full">
            <DateComponent dateString={date} />
          </span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
          <Link href={`/posts/${slug}`}>{title}</Link>
        </h3>

        <p className="text-gray-600 line-clamp-3">{excerpt}</p>

        <Link
          href={`/posts/${slug}`}
          className="mt-auto pt-3 flex items-center text-sm font-medium text-red-600 group-hover:translate-x-1 transition-transform"
        >
          <span>Read article</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const Posts = ({
  children,
  heading,
  subHeading,
}: {
  children: React.ReactNode;
  heading?: string;
  subHeading?: string;
}) => (
  <div className="py-8">
    {heading && (
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
        {heading}
      </h2>
    )}
    {subHeading && (
      <p className="mt-2 text-lg leading-8 text-gray-600">{subHeading}</p>
    )}
    <div className="mt-8 pt-6 space-y-8 border-t border-gray-200">
      {children}
    </div>
  </div>
);

export const MorePosts = async ({
  skip,
  limit,
}: {
  skip: string;
  limit: number;
}) => {
  const { data } = await sanityFetch({
    query: morePostsQuery,
    params: { skip, limit },
  });

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Posts heading={`Recent Posts (${data?.length})`}>
      {data?.map((post: any) => <Post key={post._id} post={post} />)}
    </Posts>
  );
};

export const AllPosts = async () => {
  const { data } = await sanityFetch({ query: allPostsQuery });

  if (!data || data.length === 0) {
    return <OnBoarding />;
  }

  return (
    <Posts heading="Recent Posts">
      {data.map((post: any) => (
        <Post key={post._id} post={post} />
      ))}
    </Posts>
  );
};
