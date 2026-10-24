import type { Metadata } from "next";

export function baseMetadata(): Metadata {
  return {
    title: "vaultle",
    description: "vaultle",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
    openGraph: {
      title: "vaultle",
      description: "vaultle",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}
