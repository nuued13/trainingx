import { MetadataRoute } from "next";
import { IS_DEV } from "@/lib/featureFlags";

export default function robots(): MetadataRoute.Robots {
  if (IS_DEV) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `"https://trainingx.ai"}/sitemap.xml`,
  };
}
