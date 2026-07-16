export type EvidenceRole = "primary" | "counter";

export type CorrectionIssueId =
  | "underweighted_pressure"
  | "replacement_not_coexistence";

export type ExperienceOutcome = "corrected" | "rejected" | "open" | "paused";

export const experienceCorrectionTargetMomentId = "worth-pressure";

export type ExperienceRecord = {
  id: string;
  date: string;
  source: string;
  rawText: string;
  detailText?: string;
  highlightedText: string;
  aiTrace: string;
  role: EvidenceRole;
  selectionReason: string;
  canSupport: string;
  cannotSupport: string;
  changesUnderstanding: string;
  nextActionLabel: string;
};

export type ExperienceMoment = ExperienceRecord & {
  relatedRecords?: ExperienceRecord[];
};

export type InquiryEvidencePlanItem = {
  id: string;
  prompt: string;
  kind: EvidenceRole;
};

export type InquiryObservation = string;

export type InquiryHypothesis = {
  initial: string;
  statement: string;
  citationIds: string[];
  nonClaims: string[];
};

export type InquiryCorrectionIssue = {
  id: CorrectionIssueId;
  label: string;
  description: string;
};

export type InquiryEnding = {
  lead: string;
  body: string;
  relationStatus: string;
  nextAction: string;
  retained: string[];
  notSaved: string[];
  simulationLabel: string;
};

export type InquiryNarrative = {
  question: string;
  collectPrompt: string;
  moments: ExperienceMoment[];
  tentativeAnswer: string;
  tentativeLimit: string;
  revisedAnswer: string;
  caseBoundary: {
    label: string;
    body: string;
    capability: string;
  };
  questionBoundary: {
    workingQuestion: string;
    nonGoal: string;
  };
  evidencePlan: InquiryEvidencePlanItem[];
  evidenceThreshold: string;
  observations: InquiryObservation[];
  hypothesis: InquiryHypothesis;
  correction: {
    prompt: string;
    targetMomentId: string;
    targetQuote: string;
    issues: InquiryCorrectionIssue[];
    recordedResponse: {
      label: string;
      quote: string;
      source: string;
    };
  };
  reentry: {
    momentId: string;
    prompt: string;
  };
  methodReceipt: {
    steps: string[];
    limitations: string[];
  };
  endings: Record<ExperienceOutcome, InquiryEnding>;
};

export const experienceData: InquiryNarrative = {
  question:
    "从最初做相册到重新定义 V4，我决定“下一步该做什么”的依据，发生了什么变化？",
  collectPrompt: "让 AI 开始收集素材",
  caseBoundary: {
    label: "固定、可核查的真实案例包",
    body: "这里使用 b1onded 的用户原话与日记，按预先写定的路径演示方法。它不是实时 AI，也不用于讲述一段成长史。",
    capability:
      "这次只检查：AI 能否先计划证据、受约束地提出关系，并在用户回应后执行不同的合法下一步。",
  },
  questionBoundary: {
    workingQuestion:
      "这些可回查材料是否显示：决定“下一步该做什么”的依据发生了变化；如果有，旧标准与新标准是什么关系？",
    nonGoal:
      "本次不量化 b1onded 的成长，不评价哪一版产品更正确，也不把一次重构解释为人格或能力结论。",
  },
  evidencePlan: [
    {
      id: "initial-basis",
      prompt: "最初决定继续时，什么被当作需要解决的问题？",
      kind: "primary",
    },
    {
      id: "first-doubt",
      prompt: "第一次质疑已有方向时，哪一条标准开始改变下一步？",
      kind: "primary",
    },
    {
      id: "ai-role-and-boundary",
      prompt: "AI 的作用与边界如何同时发生变化？",
      kind: "primary",
    },
    {
      id: "counter-simple-replacement",
      prompt: "什么材料可能推翻“旧标准已被新标准替代”的简单故事？",
      kind: "counter",
    },
  ],
  evidenceThreshold:
    "至少查看三组主材料与一组反向材料；反向材料进入前，不形成候选关系。",
  moments: [
    {
      id: "photo-organizer",
      date: "7 月 7 日",
      source: "Codex 会话：个人照片整理 MVP / 用户消息",
      rawText:
        "我想做一个个人照片整理网站 痛点的出发点：1.相册里的照片太杂 各种平时的截图 费照片没办法清除 导致空间浪费……",
      detailText:
        "我想做一个个人照片整理网站 痛点的出发点：1.相册里的照片太杂 各种平时的截图 费照片没办法清除 导致空间浪费 2. apple相册虽然有地点记录功能 但是无法记录文字 需要到“手记”软件上专门去做 3. 我平时会截图一些动漫截图 我希望可以自动每个动漫整理成一个相册",
      highlightedText: "我想做一个个人照片整理网站",
      aiTrace: "起点首先是一个具体、可以被实现的整理问题。",
      role: "primary",
      selectionReason:
        "作为主材料，它直接记录了最初促使下一步发生的具体问题，而不是事后对动机的总结。",
      canSupport:
        "7 月 7 日的下一步由照片、截图、地点、文字与归档等整理问题触发。",
      cannotSupport:
        "不能证明功能出发就是肤浅的，也不能证明当时没有其他产品动机。",
      changesUnderstanding:
        "先把起点限制在一个具体的整理问题，不把它扩写成人格或最终产品意义。",
      nextActionLabel: "检查现有形式何时开始被质疑",
    },
    {
      id: "return-not-organization",
      date: "7 月 9 日",
      source: "Codex 会话：Treasury 与 Return / 用户消息",
      rawText:
        "我们现在来聊一聊treausry和return功能现有形式能不能很好的服务我们的灵魂。既然不是要一个整理系统 那么或许return更加重要……",
      detailText:
        "我们现在来聊一聊treausry和return功能现有形式能不能很好的服务我们的灵魂。既然不是要一个整理系统 那么或许return更加重要 在return里 用户选择是从treasury的那个方面回溯 单独列一个treasury地图是不是冗余了",
      highlightedText: "能不能很好的服务我们的灵魂",
      aiTrace: "现有形式开始被拿回产品核心面前重新审视。",
      role: "primary",
      selectionReason:
        "作为主材料，它不是新增功能请求，而是一次对已经做出形式的直接质疑。",
      canSupport:
        "7 月 9 日，判断下一步时已经开始检查现有结构是否仍服务产品核心。",
      cannotSupport: "不能证明所有旧功能都没有价值，也不能证明新的标准已经稳定。",
      changesUnderstanding:
        "材料之间开始出现可比较的变化，但反向材料尚未进入，因此还不能形成答案。",
      nextActionLabel: "主动加入可能推翻简单故事的材料",
    },
    {
      id: "worth-pressure",
      date: "7 月 12 日",
      source: "用户提供的九天日记纯文本",
      rawText:
        "或许我做不出来很优秀,很被需要,很有价值的产品,just do it for myself,至少我自己以后会用。",
      detailText:
        "7月12日,台风并没有想象的那样,杭州反而很平静,下午又是晕了一下午,头疼,或许是早上起得再晚也要睡个午觉好点吧。总是在这个点看怪奇物语和CBQ计划旅行,已经推进到酒店了,好像已经不困了。或许我做不出来很优秀,很被需要,很有价值的产品,just do it for myself,至少我自己以后会用。",
      highlightedText: "至少我自己以后会用",
      aiTrace: "实现、被需要与有价值，并没有从判断里消失。",
      role: "counter",
      selectionReason:
        "作为反向材料，它会直接限制“旧标准已经被新标准替代”的整齐故事。",
      canSupport:
        "优秀、被需要、有价值与至少自己会用，仍然同时出现在 7 月 12 日的判断压力里。",
      cannotSupport:
        "不能仅凭这段日记判定产品没有价值，也不能把当时的压力解释成人格结论。",
      changesUnderstanding:
        "AI 必须保留旧标准仍在场的事实，不能把后来的质疑写成一次完全替代。",
      nextActionLabel: "检查 AI 被要求承担什么作用、守住什么边界",
      relatedRecords: [
        {
          id: "guide-not-definer",
          date: "7 月 12 日",
          source: "Codex 会话：Back 输出与引导 / 用户消息",
          rawText:
            "所有的主导权,回忆还是发生在用户的脑子里面的。……我们不能去强行解释,不能去赋予意义,而是作为做好我们的引导者的角色。",
          detailText:
            "我觉得可能我们的产品,走的路线不是去尝试去理解用户什么的,我觉得我们更像是一个引导者,我们提供了一种途径,提供了一种方法,提供了一种机会,给用户去回忆自己的生活。然而所有的主导权,回忆还是发生在用户的脑子里面的。我觉得主体依旧是用户,所有回忆的主体是他,我们不能去强行解释,不能去赋予意义,而是作为做好我们的引导者的角色。",
          highlightedText: "我们不能去强行解释,不能去赋予意义",
          aiTrace: "AI 的边界被写清：引导，而不替用户赋予意义。",
          role: "primary",
          selectionReason:
            "它与后续对 AI 编排能力的要求并置，才能检查 AI 的作用与边界是否同时变化。",
          canSupport: "b1onded 明确拒绝 AI 取代用户的回忆和意义判断。",
          cannotSupport: "不能证明 AI 只能提出空泛问题，或不需要承担材料选择责任。",
          changesUnderstanding:
            "AI 的方法不能只追求更强解释；它还必须保留用户对关系与意义的决定权。",
          nextActionLabel: "与 AI 的材料编排要求并置检查",
        },
      ],
    },
    {
      id: "ai-to-v4",
      date: "7 月 13 日至 15 日",
      source: "Codex 会话：Back 的 AI 必要性 / 用户消息",
      rawText:
        "就是我们可以根据用户说的一句话,哪怕是一句很不着调的话,来给他安排卡片，这是算法做不到的,这是AI才能做到的事情。",
      detailText:
        "我觉得你提出的这一点很好,就是back环节我们一直都忽略了用户为什么想back,就是back的第一层。我们肯定是要根据用户的状态来动态选择卡片的,而不是随便给一张卡片,然后用户根本对那个记忆不感兴趣。就是我们可以根据用户说的一句话,哪怕是一句很不着调的话,来给他安排卡片,这是算法做不到的,这是AI才能做到的事情。",
      highlightedText: "这是AI才能做到的事情",
      aiTrace: "下一步开始要求 AI 在材料编排里发挥不可替代的作用。",
      role: "primary",
      selectionReason:
        "作为主材料，它说明 AI 不应随机递回内容，而要根据用户当下的话编排相关材料。",
      canSupport:
        "7 月 13 日，AI 被要求根据用户当下的状态与一句话动态选择材料。",
      cannotSupport:
        "不能证明 AI 知道用户真正的内心，也不能证明这项能力已经稳定实现。",
      changesUnderstanding:
        "与“不能替人赋义”并置后，AI 的角色被限定为有责任的编排者，而不是答案所有者。",
      nextActionLabel: "满足证据阈值，形成可拒绝的候选关系",
      relatedRecords: [
        {
          id: "v4-reset",
          date: "7 月 15 日",
          source: "Codex 会话：V4 演示形态 / 用户消息",
          rawText:
            "我已经抛弃了之前V3和所有的努力,重新定义了V4的产品定义,然后开始新一轮的验证。",
          detailText:
            "我现在想进入前端设计的流程,但是我发现好像真正的困扰我的点是我们目前产品的形态还没有完全确立下来。就我已经抛弃了之前V3和所有的努力,重新定义了V4的产品定义,然后开始新一轮的验证。",
          highlightedText: "开始新一轮的验证",
          aiTrace: "新的定义没有被当成答案，而是进入了另一轮验证。",
          role: "primary",
          selectionReason:
            "它记录当前状态是重新开始验证，不是用版本名称充当完成证明。",
          canSupport: "7 月 15 日已经进入新的产品定义与验证阶段。",
          cannotSupport: "不能证明 V4 已经正确、成熟或已经实现。",
          changesUnderstanding:
            "“重新定义”只能作为验证动作的证物，不能成为这条候选关系的胜利结尾。",
          nextActionLabel: "回到全部引用，检查候选关系的边界",
        },
      ],
    },
  ],
  observations: [
    "最初的下一步由明确的照片整理、归档与关联问题触发。",
    "随后，已经做出的形式开始被拿回产品核心面前重新审查。",
    "反向材料显示：优秀、被需要、有价值与至少自己会用，并没有从判断里消失。",
    "AI 同时被要求动态编排材料，并且不能替用户解释或赋予意义。",
  ],
  tentativeAnswer:
    "从这些记录看，你决定下一步的依据，似乎从“我还能做出什么”，逐渐转向“它是否回应真正的问题、AI 是否不可替代、这个方向能否接受验证”。",
  tentativeLimit:
    "这只是 AI 从四组材料中连出的一种理解。它看见了原文，也仍然可能错过其中真正重要的部分。",
  hypothesis: {
    initial: "旧标准已经被新标准替代。",
    statement:
      "决定下一步的依据，似乎从“我还能做出什么”，转向“它是否回应真正的问题、AI 是否不可替代、这个方向能否接受验证”。",
    citationIds: [
      "photo-organizer",
      "return-not-organization",
      "worth-pressure",
      "ai-to-v4",
    ],
    nonClaims: [
      "不能证明 b1onded 已经找到正确的产品，或 V4 已经被验证。",
      "不能证明完成、被需要与有价值已经不再重要。",
      "不能把每一次否定解释为成长。",
    ],
  },
  correction: {
    prompt:
      "先选出真正限制这条解释的原文，再指出 AI 是低估了材料，还是把共存误读成替代。",
    targetMomentId: experienceCorrectionTargetMomentId,
    targetQuote:
      "或许我做不出来很优秀,很被需要,很有价值的产品,just do it for myself,至少我自己以后会用。",
    issues: [
      {
        id: "underweighted_pressure",
        label: "低估仍在场的压力",
        description:
          "AI 看见了“至少我自己以后会用”，却没有让优秀、被需要与有价值仍在场的事实充分限制答案。",
      },
      {
        id: "replacement_not_coexistence",
        label: "把共存误读成替代",
        description:
          "AI 把判断顺序的变化写成了旧标准消失，忽略新旧标准仍然同时存在。",
      },
    ],
    recordedResponse: {
      label: "案例事实 · b1onded 的已记录回应",
      quote:
        "有些时候你可能只是被自己骗了,有些时候你做的东西,它并不是一定是有意义的。你需要不断地去思考,去站在别人的角度上去看看,或者是去真正抽丝剥茧地去赤裸裸地去验证",
      source: "Codex 当前对话：对产品过程意义的回应 / 用户消息",
    },
  },
  revisedAnswer:
    "把 7 月 12 日的日记重新放回判断后，更准确的说法也许是：你没有放弃实现，也没有不再在意是否被需要。变化的是决定继续做下去的顺序。现在开始要求“为什么值得做、AI 是否不可替代、能否接受验证”先于“还能做什么”。",
  reentry: {
    momentId: "return-not-organization",
    prompt: "当时让“整理”显得不够的，是这段原话中哪一处具体问题？",
  },
  methodReceipt: {
    steps: [
      "界定了工作问题，并明确本次不判断成长、人格或版本对错。",
      "在读取摘录前公开寻找目标，并主动要求一条可能推翻简单答案的材料。",
      "逐段标记选择理由、可支持范围、不能证明的内容与理解变化。",
      "反向材料进入后才提出候选关系，并把观察、假设、引用与尚不能声称的内容分开。",
      "让用户的部分认领、拒绝、不确定或暂停改变 AI 的合法下一步。",
    ],
    limitations: [
      "这是固定案例与预写路径，不是实时检索或现场模型生成。",
      "它尚未证明模型能长期、稳定地完成证据选择、反证保留与关系修订。",
      "它没有验证自动导入、完整 Evidence 库、长期使用或 V4 的产品正确性。",
    ],
  },
  endings: {
    corrected: {
      lead: "不是过去自己给出了答案。",
      body: "是你指出 AI 低估了哪一段材料，改变了这次理解。",
      relationStatus: "已修订 · 部分认领",
      nextAction: "邀请案例主人形成一条只代表今天、仍可修改的说法。",
      retained: [
        "当前问题",
        "四组已查看材料",
        "修订后的候选关系",
        "案例事实中的已记录回应",
      ],
      notSaved: ["AI 对 b1onded 的固定结论", "人格、成长或能力判断"],
      simulationLabel: "案例事实 · b1onded 的已记录回应",
    },
    rejected: {
      lead: "好，这个解释没有回答你的问题。",
      body:
        "原文留下，错误的连接停在这里，不会换一种说法成为你的结论。",
      relationStatus: "已拒绝 · 当前关系结束",
      nextAction: "停止当前关系；可以另起问题，但不生成替代解释。",
      retained: ["当前问题", "已查看材料", "被拒绝的候选关系状态"],
      notSaved: ["替代解释", "Position", "安慰性总结"],
      simulationLabel: "协议模拟 · 不是 b1onded 的实际回答",
    },
    open: {
      lead: "现在还不能确定，也是一种结果。",
      body:
        "问题、原文和你的迟疑会一起留下；AI 不会为了完成流程强行给出答案。",
      relationStatus: "保持开放 · 尚未确认",
      nextAction: "可以补充材料、稍后回来或停止。",
      retained: ["当前问题", "已查看材料", "未确认的候选关系"],
      notSaved: ["Position", "强行完成的答案", "对不确定状态的心理解释"],
      simulationLabel: "协议模拟 · 不是 b1onded 的实际回答",
    },
    paused: {
      lead: "探究暂停，空白被保留。",
      body:
        "只保留当前问题、已经查看的材料与未确认关系；不生成安慰性总结，也不把沉默解释成失败。",
      relationStatus: "已暂停 · 不再追问",
      nextAction: "保持暂停，直到用户主动重新进入。",
      retained: ["当前问题", "已查看材料", "未确认的关系状态"],
      notSaved: ["AI 对用户的结论", "Position", "安慰性总结"],
      simulationLabel: "协议模拟 · 不是 b1onded 的实际回答",
    },
  },
};
