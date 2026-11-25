import { screeningDays, type ScreeningMaterial } from "../screening-materials";

export type EvidenceCard = ScreeningMaterial & { excerpt: string };

export type WeavingRound = {
  id: string;
  question: string;
  cards: readonly EvidenceCard[];
  reason: string;
  reflection: string;
};

const archive = new Map(screeningDays.flatMap(({ materials }) =>
  materials.map((material) => [material.id, material] as const),
));

function card(id: string, title: string, excerpt: string): EvidenceCard {
  const record = archive.get(id);
  if (!record) throw new Error("Missing story record: " + id);

  return { ...record, title, excerpt };
}

const guide = card("C257", "引导者", "我们提供了一种途径,提供了一种方法,提供了一种机会,给用户去回忆自己的生活。");
const restart = {
  ...card("C363", "从 V4 重新开始", "我们目前产品的形态还没有完全确立下来。"),
  source: "Codex · 用户原话",
  original: "我现在想进入前端设计的流程,但是我发现好像真正的困扰我的点是我们目前产品的形态还没有完全确立下来。就我已经抛弃了之前V3和所有的努力,重新定义了V4的产品定义,然后开始新一轮的验证。但是现在具体,因为我们是要为了那个周四晚上的那个给别人打分而做的一个演示界面吧。然后我现在正在努力地扩充我自己的素材。所以现在需要做一个给别人看的前端界面。我觉得Paxel的那个前端landing page是比较不错的。它既给出了卡片,然后也在那个上面写出了他们做这个项目的目的是什么。所以我们现在接下来是要定义一下我们这个项目的层级框架。https://paxel.ycombinator.com/",
};
const map = card("C114", "Treasury 与 Return", "单独列一个treasury地图是不是冗余了");
const diary = card("D07", "台风天", "很优秀,很被需要,很有价值的产品,just do it for myself,至少我自己以后会用。");
const album = card("C004", "想做一个相册", "我想做一个个人照片整理网站");
const whyBack = card("C298", "为什么想 Back", "我们一直都忽略了用户为什么想back");
const video: EvidenceCard = {
  id: "B02",
  date: "2026-05-04",
  title: "北海道视频",
  kind: "note",
  source: "Back Lab · 回顾原文",
  excerpt: "我在意就好\n它还在那里\n就够了",
  original: "我在5月的时候很喜欢听frank ocean的blonde\n我甚至把自己的网名改成了\nb1onded\n5.4 我生日那天\n我用whiteferrari和月光把我寒假去北海道的视频剪出来了\n10几分钟\n没什么人看 没什么人在意\n我在意就好\n它还在那里\n就够了",
};

export const closingLine = "这次的“回织”结束了，但我们对自我过去的探索和反思并未停止。感谢大家陪我走完这个旅程，希望你也能在自己的过去找到今日的答案。";

export const weavingRounds: readonly WeavingRound[] = [
  {
    id: "failure",
    question: "为什么会失败，最终没能做出我真实想要的？",
    cards: [guide, restart],
    reason: "我把这两天放在一起。十二号，你说的是一个人怎么回忆自己的生活。十五号，你眼前有个很具体的人，是周四要来看演示的人。",
    reflection: "我想让人看完以后想起自己的事。可到周四，我得先让别人看懂我做了什么。现在再做一次，我想先找个人坐下来，看看他翻到哪张会停。",
  },
  {
    id: "pressure",
    question: "我做事的风格是不是太追求完美，太不坚定，太内耗了？",
    cards: [{ ...restart, excerpt: "抛弃了之前V3和所有的努力" }, map, diary],
    reason: "你记得自己推翻了 V3。我往前翻到九号，那天你能说出一个具体想改的地方。十二号，你还在想别人会不会需要它。",
    reflection: "要是我自己回来翻照片，这张地图还要我多走一步。再看十二号，我把这么多要求都放在还没做出来的东西上了，确实挺累的。",
  },
  {
    id: "life",
    question: "我这段时间除了被项目吞噬的时间，还做了什么，想了什么？",
    cards: [{ ...diary, excerpt: "杭州反而很平静,下午又是晕了一下午,头疼" }],
    reason: "这几件事都写在同一天。你写完跟 CBQ 把旅行计划推进到酒店，紧接着记了一句自己的精神怎么样。",
    reflection: "原来那天已经聊到酒店了。刚才我还觉得七月每天都在改项目。你让我再看一眼，我想把这句也留着。",
  },
  {
    id: "change",
    question: "我成长了吗，我变了吗？",
    cards: [album, whyBack, video],
    reason: "七号你在列相册里有哪些东西要整理。十三号你开始问，一个人今天为什么突然想回去看。我还想让你再读一遍五月写给那段视频的话。",
    reflection: "我好像早就知道，有的东西我以后还想回来看看。五月剪视频的时候我就知道了。到七月，我才慢慢能把问题问出来，别人也会有这么一个想回头看的时候吗？",
  },
];
