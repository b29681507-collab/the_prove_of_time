import type { Metadata } from "next";
import { WeavingRoom } from "@/components/weaving/weaving-room";
import { closingLine, weavingRounds } from "@/components/weaving/weaving-script";

export const metadata: Metadata = {
  title: "回织 · 回到今天",
  description: "听 blonded 和 AI 对话，翻看他们递回来的真实记录。",
};

export default function ExperiencePage() {
  return <WeavingRoom rounds={weavingRounds} closingLine={closingLine} />;
}
