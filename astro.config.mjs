import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import image from "@astrojs/image";
import vercel from "@astrojs/vercel/static";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://hashimono.com/",
  experimental: {
    contentCollections: true,
  },
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    image({
      // serviceEntryPoint: "@astrojs/image/sharp",
    }),
    mdx({
      draft: true,
    }),
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
    extendDefaultPlugins: true,
  },
  output: "static",
  adapter: vercel({
    includeFiles: ["./generated/ogp.json"],
  }),
});
