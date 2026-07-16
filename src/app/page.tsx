import type { Metadata } from "next";
import localFont from "next/font/local";

import { HomeScrollStory } from "@/components/home-scroll-story";

const smileySans = localFont({
  src: "./fonts/smiley-sans/SmileySans-Oblique.ttf.woff2",
  display: "swap",
  style: "normal",
  variable: "--font-smiley-sans",
  weight: "400",
});

export const metadata: Metadata = {
  title: "The Prove of Time: 第一页滚动叙事",
  description: "当你只有一个问题、却不知道应该回到哪里时，让 AI 把真正相关的过去带回面前。",
};

export default function Home() {
  return <HomeScrollStory fontClassName={smileySans.variable} />;
}
