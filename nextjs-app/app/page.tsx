import { Suspense } from "react";

import CircleFeatures from "@/app/components/circle/CircleFeatures";
import CircleHero from "@/app/components/circle/CircleHero";
import FiguringOut from "@/app/components/circle/FiguringOut";
import Maintenant from "@/app/components/circle/Maintenant";
import { AllPosts } from "@/app/components/Posts";

export default async function Page() {
  return (
    <>
      <CircleHero />
      <FiguringOut />
      <Maintenant />
      <CircleFeatures />

      {/* Posts Section */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-6">
          <aside className="py-16 sm:py-24">
            <Suspense>{await AllPosts()}</Suspense>
          </aside>
        </div>
      </div>
    </>
  );
}
