import type { Metadata } from "next";
import { V4MotionLab } from "@/components/v4-motion-lab";

export const metadata: Metadata = {
  title: "真实记录体验 - The Prove of Time",
  description: "用一段真实项目记录体验发问、回顾、纠正与暂时答案。",
};

export default function ExperiencePage() {
  return <V4MotionLab />;
}
