import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Matches the behavior of `sanity dev` which sets styled-components to use the fastest way of inserting CSS rules in both dev and production. It's default behavior is to disable it in dev mode.
    SC_DISABLE_SPEEDY: "false",
  },
  redirects() {
    return [
      {
        // The index moved to /blogs. Exact match, so the /posts/[slug] detail
        // routes — which are the permalinks and stay put — are untouched.
        //
        // 307, not 308: /posts never actually resolved to an index (it fell
        // through to the [slug] route and rendered the template's onboarding
        // slab), so there is no old page worth telling browsers to cache the
        // move of forever. A 308 is very hard to take back.
        source: "/posts",
        destination: "/blogs",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
