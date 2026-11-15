import type { Metadata } from "next";
import InfoPage from "@/components/home/InfoPage";
import { getSitePage } from "@/site";

export const metadata: Metadata = {
  title: "소개 | 99BOOKS",
  description: getSitePage("about").meta.summary,
};

/** 99BOOKS 소개 */
export default function AboutPage() {
  return <InfoPage doc={getSitePage("about")} />;
}
