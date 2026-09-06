import CircleFeatures from "@/app/components/circle/CircleFeatures";
import CircleHero from "@/app/components/circle/CircleHero";
import Featured from "@/app/components/circle/Featured";
import FiguringOut from "@/app/components/circle/FiguringOut";
import InCommunity from "@/app/components/circle/InCommunity";
import Maintenant from "@/app/components/circle/Maintenant";

export default async function Page() {
  return (
    <>
      <CircleHero />
      <FiguringOut />
      <Maintenant />
      <Featured />
      <InCommunity />
      <CircleFeatures />
    </>
  );
}
