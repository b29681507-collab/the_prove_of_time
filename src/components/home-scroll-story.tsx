"use client";

import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "@/app/page.module.css";
import { SiteNavigation, type SiteSection } from "@/components/site-navigation";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const archiveTypes = ["日记", "对话", "照片", "项目文件", "语音", "零散文字"] as const;
const phaseCuts = [0.1, 0.225, 0.35, 0.475, 0.59, 0.7, 0.86] as const;
const methodPhaseCuts = [0.1, 0.25, 0.39, 0.53, 0.67, 0.81] as const;
const inkSequence = [0, 1, 0, 2, 1] as const;
const inkDwell = [620, 740, 560, 820, 680] as const;
const storySectionProgress = {
  problem: 0,
  definition: 0.61,
  experience: 0.88,
} as const;
const methodSteps = [
  {
    title: "找到",
    body: "AI 从日记、对话、照片与项目文件中，寻找真正回应当前问题的片段。它找的不只是相同词语，也包括开始、犹豫、继续与推翻发生的地方。",
    boundary: "不是把全部过去压成一份摘要。",
    motif: ["日记", "对话", "照片", "项目文件"],
    kind: "find",
  },
  {
    title: "带回",
    body: "过去原文被一段段带回，并按能够看见变化与联系的顺序出现。材料先出现，解释后出现，让重新观看本身有时间唤起新的记忆。",
    boundary: "不是先给结论，再用材料证明它。",
    motif: ["原文 01", "原文 02", "原文 03"],
    kind: "return",
  },
  {
    title: "尝试理解",
    body: "AI 指出材料之间可能存在的变化、联系或张力，并明确它只是一种暂时理解。每一句解释都应当能回到具体原文。",
    boundary: "不是关于你的事实，也不是最后答案。",
    motif: ["变化", "联系", "张力"],
    kind: "understand",
  },
  {
    title: "允许纠正",
    body: "你可以接受一部分、补充遗漏、拒绝解释，或者暂时不作判断。你的回应会改变答案与下一步；材料不足时，也可以诚实地没有答案。",
    boundary: "结果属于你，不属于 AI。",
    motif: ["接受", "补充", "拒绝", "暂不判断"],
    kind: "correct",
  },
] as const;

function getPhase(progress: number, cuts: readonly number[]) {
  const phase = cuts.findIndex((cut) => progress < cut);
  return phase === -1 ? cuts.length : phase;
}

function LivingInk({
  text,
  frame,
  className = "",
  decorative = false,
}: {
  text: string;
  frame: number;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span
      aria-hidden={decorative || undefined}
      className={`${styles.livingInk} ${className}`}
    >
      {!decorative && <span className={styles.inkSemantic}>{text}</span>}
      {[0, 1, 2].map((index) => (
        <span
          aria-hidden="true"
          className={`${styles.inkLayer} ${styles[`inkFrame${index}`]}`}
          data-active={frame === index}
          key={index}
        >
          {text}
        </span>
      ))}
    </span>
  );
}

export function HomeScrollStory({ fontClassName }: { fontClassName: string }) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLAnchorElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const methodStageRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(0);
  const methodPhaseRef = useRef(0);
  const [phase, setPhase] = useState(0);
  const [methodPhase, setMethodPhase] = useState(0);
  const [inkFrame, setInkFrame] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [storyVisible, setStoryVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [howVisible, setHowVisible] = useState(false);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const syncToLocation = () => {
      const section = window.location.hash.slice(1) as SiteSection;

      if (section === "how") {
        phaseRef.current = 7;
        setPhase(7);
        methodPhaseRef.current = 0;
        setMethodPhase(0);
        stageRef.current?.style.setProperty("--story-progress", "1");
        methodStageRef.current?.style.setProperty("--method-progress", "0");
        howRef.current?.scrollIntoView({ block: "start" });
        return;
      }

      const progress = storySectionProgress[section as keyof typeof storySectionProgress];
      const track = trackRef.current;

      if (!track || progress === undefined) {
        window.scrollTo(0, 0);
        phaseRef.current = 0;
        setPhase(0);
        stageRef.current?.style.setProperty("--story-progress", "0");
        return;
      }

      const targetPhase = section === "definition" ? 5 : section === "experience" ? 7 : 0;
      const scrollRange = Math.max(0, track.offsetHeight - window.innerHeight);
      phaseRef.current = targetPhase;
      setPhase(targetPhase);
      stageRef.current?.style.setProperty("--story-progress", progress.toString());
      window.scrollTo(0, track.offsetTop + scrollRange * progress);
    };

    syncToLocation();
    const frame = window.requestAnimationFrame(syncToLocation);
    window.addEventListener("hashchange", syncToLocation);
    window.addEventListener("popstate", syncToLocation);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncToLocation);
      window.removeEventListener("popstate", syncToLocation);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStoryVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const how = howRef.current;
    if (!how) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHowVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(how);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || (!storyVisible && !howVisible) || !pageVisible) {
      setInkFrame(0);
      return;
    }

    let cursor = 0;
    let timer = window.setTimeout(function advance() {
      cursor = (cursor + 1) % inkSequence.length;
      setInkFrame(inkSequence[cursor]);
      timer = window.setTimeout(advance, inkDwell[cursor]);
    }, inkDwell[cursor]);

    return () => window.clearTimeout(timer);
  }, [howVisible, pageVisible, reducedMotion, storyVisible]);

  useGSAP(
    () => {
      const track = trackRef.current;
      const stage = stageRef.current;
      if (!track || !stage) return;

      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const nextPhase = getPhase(progress, phaseCuts);
          stage.style.setProperty("--story-progress", progress.toFixed(4));

          if (nextPhase !== phaseRef.current) {
            phaseRef.current = nextPhase;
            setPhase(nextPhase);
          }
        },
      });
    },
    { scope: trackRef },
  );

  useGSAP(
    () => {
      const track = howRef.current;
      const stage = methodStageRef.current;
      if (!track || !stage) return;

      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          const nextPhase = getPhase(progress, methodPhaseCuts);
          stage.style.setProperty("--method-progress", progress.toFixed(4));

          if (nextPhase !== methodPhaseRef.current) {
            methodPhaseRef.current = nextPhase;
            setMethodPhase(nextPhase);
          }
        },
      });
    },
    { scope: howRef },
  );

  const skipStory = () => {
    phaseRef.current = 7;
    setPhase(7);
    window.requestAnimationFrame(() => actionRef.current?.focus());
  };

  const firstActActive = phase <= 4;
  const secondActActive = phase >= 5;
  const activeSection: SiteSection = howVisible
    ? "how"
    : phase <= 4
      ? "problem"
      : phase <= 6
        ? "definition"
        : "experience";

  const navigateToSection = useCallback(
    (section: SiteSection) => {
      const behavior: ScrollBehavior = "auto";

      if (section === "how") {
        howRef.current?.scrollIntoView({ behavior, block: "start" });
        return;
      }

      const track = trackRef.current;
      const progress = storySectionProgress[section];
      if (!track) return;

      const scrollRange = Math.max(0, track.offsetHeight - window.innerHeight);
      window.scrollTo({
        top: track.offsetTop + scrollRange * progress,
        behavior,
      });
    },
    [],
  );

  return (
    <main className={`${styles.storyPage} ${fontClassName}`} data-layout="constellation">
      <SiteNavigation
        active={activeSection}
        onSectionNavigate={navigateToSection}
      />

      <a className={styles.skipLink} href="#story-result" onClick={skipStory}>
        跳到这一页的结论
      </a>

      <section className={styles.storyTrack} ref={trackRef} aria-label="第一页：我们发现的问题">
        <span className={styles.storySceneAnchor} data-section="problem" id="problem" />
        <span className={styles.storySceneAnchor} data-section="definition" id="definition" />
        <span className={styles.storySceneAnchor} data-section="experience" id="experience" />
        <span className={styles.storyEndAnchor} id="story-result" tabIndex={-1} />
        <div className={styles.storyStage} data-phase={phase} ref={stageRef}>
          <div className={styles.progressRail} aria-hidden="true">
            <span />
          </div>

          <span className={styles.scrollCue} aria-hidden="true">
            <span className={styles.scrollCueGlyph}>↓</span>
          </span>

          <div className={styles.stageCanvas}>
            <section
              aria-hidden={!firstActActive}
              className={styles.act}
              data-active={firstActActive}
            >
              <p className={styles.chapterTitle}>
                <LivingInk
                  className={styles.chapterCentered}
                  frame={inkFrame}
                  text="我们发现了一个问题"
                />
                <LivingInk
                  className={styles.chapterPinned}
                  decorative
                  frame={inkFrame}
                  text="我们发现了一个问题"
                />
              </p>

              <h1 className={styles.problemTitle} data-visible={phase >= 1}>
                <LivingInk
                  frame={inkFrame}
                  text={"我们留下了很多过去。\n可当一个新的问题出现，\n我们不知道应该回到哪里。"}
                />
              </h1>

              <div className={styles.archiveStatement}>
                <ul className={styles.archiveTypes} data-visible={phase >= 2}>
                  {archiveTypes.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <p className={styles.archiveLead} data-visible={phase >= 3}>都还在</p>
              </div>

              <p className={styles.dispersed} data-visible={phase >= 4}>
                却分散在不同的时间与地方。
              </p>
            </section>

            <section
              aria-hidden={!secondActActive}
              className={styles.act}
              data-active={secondActActive}
            >
              <h2 className={styles.solutionTitle}>
                <LivingInk
                  className={styles.solutionCentered}
                  frame={inkFrame}
                  text={"我们带你回到自己的历史材料里\n共同完成一次重新理解"}
                />
                <LivingInk
                  className={styles.solutionPinned}
                  decorative
                  frame={inkFrame}
                  text="我们是什么"
                />
              </h2>

              <p className={styles.coreQuestion} data-visible={phase >= 6}>
                <LivingInk
                  frame={inkFrame}
                  text="当你只有一个问题，却不知道答案可能藏在哪里时，AI 能否把真正相关的过去带回面前？"
                />
              </p>

              <ul aria-hidden="true" className={styles.returningArchive} data-visible={phase >= 6}>
                {archiveTypes.map((item) => <li key={item}>{item}</li>)}
              </ul>

              <Link
                aria-hidden={phase < 7}
                className={styles.storyAction}
                href="/experience"
                prefetch={false}
                ref={actionRef}
                tabIndex={phase >= 7 ? 0 : -1}
              >
                <span>看看我们怎么回答</span>
                <span aria-hidden="true">→</span>
              </Link>
            </section>
          </div>
        </div>
      </section>

      <section
        className={styles.methodology}
        id="how"
        ref={howRef}
        aria-labelledby="methodology-title"
      >
        <div
          className={styles.methodologyStage}
          data-phase={methodPhase}
          ref={methodStageRef}
        >
          <div
            className={`${styles.progressRail} ${styles.methodologyProgress}`}
            aria-hidden="true"
          >
            <span />
          </div>

          <span
            className={`${styles.scrollCue} ${styles.methodologyScrollCue}`}
            aria-hidden="true"
          >
            <span className={styles.scrollCueGlyph}>↓</span>
          </span>

          <div className={styles.methodologyCanvas}>
            <header
              aria-hidden={methodPhase > 1}
              className={styles.methodologyIntro}
              data-active={methodPhase <= 1}
            >
              <h2 className={styles.methodologyTitle} id="methodology-title">
                <LivingInk
                  className={styles.methodologyTitleCentered}
                  frame={inkFrame}
                  text="如何发生"
                />
                <LivingInk
                  className={styles.methodologyTitlePinned}
                  decorative
                  frame={inkFrame}
                  text="如何发生"
                />
              </h2>

              <div className={styles.methodologyPremise} data-visible={methodPhase >= 1}>
                <p>
                  <LivingInk
                    frame={inkFrame}
                    text={"一切从一个真实问题开始。\n之后，发生四件事。"}
                  />
                </p>
                <p>
                  这里解释的是你在页面上能够感知和纠正的过程，而不是要求你学习 AI
                  背后的复杂方法。
                </p>
              </div>
            </header>

            <ol className={styles.methodSequence}>
              {methodSteps.map((step, index) => {
                const active = methodPhase === index + 2;

                return (
                  <li
                    aria-hidden={!active}
                    data-active={active}
                    data-kind={step.kind}
                    key={step.title}
                  >
                    <div className={styles.methodVisual}>
                      <span className={styles.methodNumber} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")} / 04
                      </span>
                      <h3>
                        <LivingInk frame={inkFrame} text={step.title} />
                      </h3>
                      <div className={styles.methodMotif} aria-hidden="true">
                        {step.motif.map((item) => <span key={item}>{item}</span>)}
                      </div>
                    </div>
                    <div className={styles.methodCopy}>
                      <p>{step.body}</p>
                      <p>{step.boundary}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <footer
              aria-hidden={methodPhase < 6}
              className={styles.methodologyEnding}
              data-active={methodPhase === 6}
            >
              <p>
                <LivingInk
                  frame={inkFrame}
                  text={"答案不只来自过去。\n它也来自你今天怎样重新理解过去。"}
                />
              </p>
              <Link
                href="/experience"
                prefetch={false}
                tabIndex={methodPhase === 6 ? 0 : -1}
              >
                用一段真实记录体验一次 <span aria-hidden="true">→</span>
              </Link>
            </footer>
          </div>
        </div>
      </section>

      <noscript>
        <section className={styles.noScriptFallback}>
          <p>我们留下了很多过去，却不知道应该回到哪里。</p>
          <Link href="/experience">看看我们怎么回答</Link>
        </section>
      </noscript>
    </main>
  );
}
