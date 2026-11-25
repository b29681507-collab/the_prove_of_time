import type { Metadata } from "next";
import localFont from "next/font/local";
import { ScreeningRoom } from "@/components/screening-room";
import { screeningDays } from "@/components/screening-materials";

const smileySans = localFont({
  src: "./fonts/smiley-sans/SmileySans-Oblique.ttf.woff2",
  display: "swap",
  variable: "--font-smiley-sans",
});

export const metadata: Metadata = {
  title: "回织",
  description: "从 7 月 6 日到 15 日，翻看 blonded 每天留下的五条记录。",
};

export default function Home() {
  return <ScreeningRoom days={screeningDays} fontClassName={smileySans.variable} />;
}
