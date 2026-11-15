import type { Metadata } from "next";
import InfoPage from "@/components/home/InfoPage";
import { getSitePage } from "@/site";

export const metadata: Metadata = {
  title: "이용 안내 | 99BOOKS",
  description: getSitePage("guide").meta.summary,
};

/** 이용 안내: 무료 범위, 결제, 환불, 갱신, 무단 배포 */
export default function GuidePage() {
  return <InfoPage doc={getSitePage("guide")} />;
}
