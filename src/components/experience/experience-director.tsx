"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, type KeyboardEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SiteNavigation } from "@/components/site-navigation";
import { CorrectionInteraction } from "./correction-interaction";
import { experienceData } from "./experience-data";
import {
  createInitialExperienceState,
  experienceReducer,
  type ExperiencePhase,
} from "./experience-machine";
import { MemoryDetail, MemoryFragment } from "./memory-fragment";
import styles from "./experience.module.css";

gsap.registerPlugin(useGSAP);

type DetailOrigin = {
  x: number;
  y: number;
  scale: number;
};

function announcementForPhase(phase: ExperiencePhase, outcome: string | null) {
  if (phase === "opening_past") return "案例问题正在打开。";
  if (phase === "question_revealed") {
    return "AI 已经界定本次问题和不作判断的边界。";
  }
  if (phase === "planning_evidence") {
    return "AI 正在公开说明要找什么，以及什么材料可能推翻简单答案。";
  }
  if (phase === "collecting_fragments") return "AI 正按寻找目标检查固定材料包。";
  if (phase === "exploring_fragments") {
    return "一段过去原文已经出现。页面同时说明选材理由、支持范围和判断边界。";
  }
  if (phase === "forming_interpretation") {
    return "AI 正在把可回查观察与尚未确认的候选关系分开。";
  }
  if (phase === "awaiting_correction") {
    return "候选关系已经出现。现在可以检查不同用户状态会怎样改变 AI 的下一步。";
  }
  if (phase === "reconstructing") return "被低估的原文正在约束并改写候选关系。";
  if (phase === "reentering_material") return "尚不确定使 AI 回到一条争议材料。";
  if (phase === "ending" && outcome === "corrected") return "候选关系已根据纠正修订。";
  if (phase === "ending") return "本次探究已留下方法回执。";
  return "体验开始。";
}

function methodActionForPhase(phase: ExperiencePhase) {
  if (phase === "opening_past" || phase === "question_revealed") return "界定问题";
  if (phase === "planning_evidence") return "决定要找什么";
  if (phase === "collecting_fragments") return "按寻找目标检查材料";
  if (phase === "exploring_fragments") return "说明选材理由与边界";
  if (phase === "forming_interpretation" || phase === "awaiting_correction") {
    return "提出可拒绝的候选关系";
  }
  if (phase === "reconstructing") return "根据纠正改写关系";
  if (phase === "reentering_material") return "回到争议材料";
  if (phase === "ending") return "留下方法回执";
  return "等待开始";
}

export function ExperienceDirector() {
  const rootRef = useRef<HTMLElement>(null);
  const outcomeHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  const momentButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const detailOriginRef = useRef<DetailOrigin>({ x: 0, y: 0, scale: 0.42 });
  const keyboardModeRef = useRef(false);
  const [state, dispatch] = useReducer(
    experienceReducer,
    createInitialExperienceState(experienceData.moments.length),
  );

  const currentMomentIndex = Math.max(0, state.currentMomentIndex);
  const currentMoment = experienceData.moments[currentMomentIndex];
  const activeMoment =
    state.activeMomentIndex === null
      ? null
      : experienceData.moments[state.activeMomentIndex];
  const lastMomentVisible = currentMomentIndex === experienceData.moments.length - 1;
  const outcomeCopy = state.outcome ? experienceData.endings[state.outcome] : null;
  const selectedIssue = experienceData.correction.issues.find(
    (issue) => issue.id === state.selectedCorrectionIssue,
  );
  const citationMoments = experienceData.hypothesis.citationIds
    .map((id) => experienceData.moments.find((moment) => moment.id === id))
    .filter((moment) => moment !== undefined);
  const reentryMoment = experienceData.moments.find(
    (moment) => moment.id === experienceData.reentry.momentId,
  );

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        if (state.phase === "opening_past") dispatch({ type: "PAST_OPENED" });
        if (state.phase === "collecting_fragments") {
          dispatch({ type: "COLLECTION_COMPLETE" });
        }
        if (state.phase === "forming_interpretation") {
          dispatch({ type: "INTERPRETATION_COMPLETE" });
        }
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      if (state.phase === "intro") {
        timeline
          .fromTo(
            "[data-intro-line='first']",
            { autoAlpha: 0, y: 16, filter: "blur(5px)" },
            { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
          )
          .fromTo(
            "[data-intro-line='second']",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.62 },
            "+=0.18",
          )
          .fromTo(
            "[data-intro-line='contract']",
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            "-=0.2",
          )
          .fromTo(
            "[data-entry-action]",
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.42 },
            "-=0.12",
          );
      }

      if (state.phase === "opening_past") {
        timeline
          .fromTo(
            "[data-question-owner]",
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.42 },
          )
          .fromTo(
            "[data-question]",
            { autoAlpha: 0, clipPath: "inset(0 100% 0 0)", filter: "blur(5px)" },
            {
              autoAlpha: 1,
              clipPath: "inset(0 0% 0 0)",
              filter: "blur(0px)",
              duration: 1.05,
              ease: "power3.inOut",
            },
            "-=0.08",
          )
          .call(() => dispatch({ type: "PAST_OPENED" }), [], "+=0.2");
      }

      if (state.phase === "question_revealed") {
        timeline.fromTo(
          "[data-question-boundary]",
          { autoAlpha: 0, y: 12, filter: "blur(4px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.68,
            stagger: 0.12,
          },
        );
      }

      if (state.phase === "planning_evidence") {
        timeline.fromTo(
          "[data-plan-item]",
          { autoAlpha: 0, y: 16, filter: "blur(5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.62,
            stagger: 0.14,
          },
        );
      }

      if (state.phase === "collecting_fragments") {
        timeline
          .fromTo(
            "[data-search-pulse]",
            { autoAlpha: 0, scaleX: 0.18 },
            { autoAlpha: 1, scaleX: 1, duration: 0.9, ease: "power3.inOut" },
          )
          .call(() => dispatch({ type: "COLLECTION_COMPLETE" }), [], "+=0.38");
      }

      if (state.phase === "exploring_fragments") {
        timeline
          .fromTo(
            "[data-memory-id]",
            { autoAlpha: 0, y: 22, scale: 0.97, filter: "blur(6px)" },
            { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.7 },
          )
          .fromTo(
            "[data-evidence-method] > *",
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09 },
            "-=0.25",
          );
      }

      if (state.phase === "forming_interpretation") {
        timeline
          .fromTo(
            "[data-interpretation-copy]",
            { autoAlpha: 0, y: 18, filter: "blur(6px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.68,
              stagger: 0.12,
            },
          )
          .call(() => dispatch({ type: "INTERPRETATION_COMPLETE" }), [], "+=0.55");
      }

      if (state.phase === "awaiting_correction") {
        const selector = state.correctionAuditOpen
          ? "[data-correction-workbench]"
          : "[data-correction-choice]";
        timeline.fromTo(
          selector,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.52, stagger: 0.08 },
        );
      }

      if (state.phase === "reconstructing") {
        timeline.fromTo(
          "[data-reconstruction]",
          { autoAlpha: 0, y: 18, filter: "blur(5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.12,
          },
        );
      }

      if (state.phase === "reentering_material") {
        timeline.fromTo(
          "[data-reentry]",
          { autoAlpha: 0, y: 18, filter: "blur(5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.72,
            stagger: 0.12,
          },
        );
      }

      if (state.phase === "ending") {
        timeline.fromTo(
          "[data-ending]",
          { autoAlpha: 0, y: 18, filter: "blur(5px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: 0.1,
          },
        );
      }
    },
    {
      scope: rootRef,
      dependencies: [state.phase, state.currentMomentIndex, state.correctionAuditOpen],
      revertOnUpdate: true,
    },
  );

  useGSAP(
    () => {
      if (state.activeMomentIndex === null) return;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const origin = detailOriginRef.current;

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          "[data-detail-backdrop]",
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduceMotion ? 0 : 0.34 },
        )
        .fromTo(
          "[data-memory-detail]",
          {
            autoAlpha: 0,
            x: origin.x,
            y: origin.y,
            scale: origin.scale,
            filter: "blur(5px)",
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: reduceMotion ? 0 : 0.58,
          },
          0,
        );
    },
    {
      scope: rootRef,
      dependencies: [state.activeMomentIndex],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    if (state.activeMomentIndex === null) return;
    const focusTimer = window.setTimeout(() => detailCloseRef.current?.focus(), 120);
    return () => window.clearTimeout(focusTimer);
  }, [state.activeMomentIndex]);

  useEffect(() => {
    if (!keyboardModeRef.current || state.phase !== "ending") return;
    const frame = window.requestAnimationFrame(() => outcomeHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [state.phase]);

  function openMomentDetail(index: number) {
    const button = momentButtonRefs.current[index];
    const world = rootRef.current?.querySelector<HTMLElement>("[data-world]");

    if (button && world) {
      const cardRect = button.getBoundingClientRect();
      const worldRect = world.getBoundingClientRect();
      const detailWidth = Math.min(760, worldRect.width - 32);
      detailOriginRef.current = {
        x: cardRect.left + cardRect.width / 2 - (worldRect.left + worldRect.width / 2),
        y: cardRect.top + cardRect.height / 2 - (worldRect.top + worldRect.height / 2),
        scale: Math.max(0.3, Math.min(0.7, cardRect.width / detailWidth)),
      };
    }

    dispatch({ type: "OPEN_DETAIL", index });
  }

  function closeMomentDetail() {
    const activeIndex = state.activeMomentIndex;
    if (activeIndex === null) return;
    const index = activeIndex;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detail = rootRef.current?.querySelector<HTMLElement>("[data-memory-detail]");
    const backdrop = rootRef.current?.querySelector<HTMLElement>("[data-detail-backdrop]");
    const origin = detailOriginRef.current;

    function finishClose() {
      dispatch({ type: "CLOSE_DETAIL" });
      window.requestAnimationFrame(() => momentButtonRefs.current[index]?.focus());
    }

    if (reduceMotion || !detail || !backdrop) {
      finishClose();
      return;
    }

    gsap
      .timeline({ onComplete: finishClose })
      .to(detail, {
        autoAlpha: 0,
        x: origin.x,
        y: origin.y,
        scale: origin.scale,
        filter: "blur(5px)",
        duration: 0.46,
        ease: "power4.inOut",
      })
      .to(backdrop, { autoAlpha: 0, duration: 0.28 }, 0.12);
  }

  function handleRootKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (
      event.key === "Tab" ||
      event.key === "Enter" ||
      event.key === " " ||
      event.key.startsWith("Arrow")
    ) {
      keyboardModeRef.current = true;
    }

    if (event.key === "Escape" && state.activeMomentIndex !== null) {
      event.preventDefault();
      closeMomentDetail();
    }
  }

  return (
    <main
      ref={rootRef}
      className={styles.experience}
      data-phase={state.phase}
      data-outcome={state.outcome ?? "pending"}
      onKeyDownCapture={handleRootKeyDown}
      onPointerDownCapture={() => {
        keyboardModeRef.current = false;
      }}
    >
      <SiteNavigation active="experience" placement="in-flow" />

      <div className={styles.stage}>
        <div className={styles.world} data-world>
          <div className={styles.ambientField} aria-hidden="true" />

          {state.phase !== "intro" ? (
            <>
              <p className={styles.methodIndicator}>
                <span>AI 正在做</span>
                <strong>{methodActionForPhase(state.phase)}</strong>
              </p>
              <p className={styles.caseFlag}>
                <span>{experienceData.caseBoundary.label}</span>
                <small>非实时 AI</small>
              </p>
            </>
          ) : null}

          <section
            className={`${styles.phaseLayer} ${styles.introLayer}`}
            aria-hidden={state.phase !== "intro"}
          >
            <div className={styles.introContent}>
              <h1 data-intro-line="first">
                <span>有些问题，</span>
                <span>现在的你回答不了。</span>
              </h1>
              <p className={styles.introLead} data-intro-line="second">
                AI 不先回答。它先决定应该回到哪里、什么会让简单答案站不住。
              </p>
              <div className={styles.caseContract} data-intro-line="contract">
                <span>{experienceData.caseBoundary.label}</span>
                <p>{experienceData.caseBoundary.body}</p>
                <small>{experienceData.caseBoundary.capability}</small>
              </div>
              <button
                className={styles.storyButton}
                type="button"
                onClick={() => dispatch({ type: "OPEN_PAST" })}
                disabled={state.phase !== "intro"}
                data-entry-action
                data-testid="open-past"
              >
                查看 AI 如何开始
              </button>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.questionLayer}`}
            aria-hidden={
              state.phase !== "opening_past" && state.phase !== "question_revealed"
            }
          >
            <div className={styles.questionContent}>
              <p className={styles.questionOwner} data-question-owner>
                b1onded 的原始问题
              </p>
              <blockquote className={styles.question} data-question>
                {experienceData.question}
              </blockquote>

              <div className={styles.questionBoundary}>
                <p data-question-boundary>
                  <span>AI 整理出的本次问题</span>
                  {experienceData.questionBoundary.workingQuestion}
                </p>
                <p data-question-boundary>
                  <span>本次不判断</span>
                  {experienceData.questionBoundary.nonGoal}
                </p>
              </div>

              <button
                className={styles.storyButton}
                type="button"
                onClick={() => dispatch({ type: "PLAN_EVIDENCE" })}
                disabled={state.phase !== "question_revealed"}
                data-question-boundary
                data-testid="plan-evidence"
              >
                先看 AI 决定寻找什么
              </button>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.planLayer}`}
            aria-hidden={state.phase !== "planning_evidence"}
            data-testid="evidence-plan"
          >
            <div className={styles.planContent}>
              <header>
                <p>AI 不先挑能配合故事的片段</p>
                <h2>为了回答这个问题，它先公开四个寻找目标。</h2>
              </header>
              <ol className={styles.evidencePlan}>
                {experienceData.evidencePlan.map((item) => (
                  <li key={item.id} data-kind={item.kind} data-plan-item>
                    <span>{item.kind === "counter" ? "会推翻简单答案" : "需要找到"}</span>
                    <p>{item.prompt}</p>
                  </li>
                ))}
              </ol>
              <div className={styles.planGate} data-plan-item>
                <p>{experienceData.evidenceThreshold}</p>
                <button
                  className={styles.storyButton}
                  type="button"
                  onClick={() => dispatch({ type: "START_COLLECTION" })}
                  disabled={state.phase !== "planning_evidence"}
                  data-testid="start-collection"
                >
                  {experienceData.collectPrompt}
                </button>
              </div>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.collectionLayer}`}
            aria-hidden={state.phase !== "collecting_fragments"}
          >
            <div className={styles.collectionContent}>
              <p>{experienceData.caseBoundary.label}</p>
              <h2>AI 正按刚才的寻找目标检查材料。</h2>
              <span className={styles.searchPulse} data-search-pulse aria-hidden="true" />
              <small>它也必须保留会让简单解释失效的那一段。</small>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.evidenceLayer}`}
            aria-hidden={state.phase !== "exploring_fragments"}
          >
            {currentMoment ? (
              <div className={styles.evidenceContent}>
                <header className={styles.evidenceSceneHeader}>
                  <h2>
                    {currentMoment.role === "counter"
                      ? "先让简单故事停下来。"
                      : "每带回一段，AI 都要说明理由。"}
                  </h2>
                  <p>
                    {currentMoment.role === "counter"
                      ? "这段不是纠错彩蛋；它在候选关系形成前就必须出现。"
                      : "原文先于解释，来源与判断边界始终可回查。"}
                  </p>
                </header>

                <MemoryFragment
                  moment={currentMoment}
                  index={currentMomentIndex}
                  total={experienceData.moments.length}
                  interactive={state.activeMomentIndex === null}
                  buttonRef={(node) => {
                    momentButtonRefs.current[currentMomentIndex] = node;
                  }}
                  onOpen={() => openMomentDetail(currentMomentIndex)}
                />

                <div className={styles.evidenceNavigation}>
                  <div className={styles.evidenceTrail} aria-label="已经检查的材料">
                    {experienceData.moments.map((moment, index) => (
                      <span
                        key={moment.id}
                        data-seen={index <= currentMomentIndex}
                        data-role={moment.role}
                      >
                        {index + 1}
                      </span>
                    ))}
                  </div>
                  <button
                    className={styles.storyButton}
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: lastMomentVisible ? "FORM_INTERPRETATION" : "NEXT_MOMENT",
                      })
                    }
                    disabled={
                      state.phase !== "exploring_fragments" ||
                      state.activeMomentIndex !== null
                    }
                    data-testid={lastMomentVisible ? "form-interpretation" : "next-evidence"}
                  >
                    {lastMomentVisible
                      ? "检查 AI 是否有资格提出关系"
                      : currentMoment.nextActionLabel}
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {activeMoment ? (
            <MemoryDetail
              moment={activeMoment}
              closeButtonRef={detailCloseRef}
              onClose={closeMomentDetail}
            />
          ) : null}

          <section
            className={`${styles.phaseLayer} ${styles.interpretationScene}`}
            aria-hidden={
              state.phase !== "forming_interpretation" &&
              state.phase !== "awaiting_correction"
            }
          >
            <div className={styles.interpretationContent}>
              <header data-interpretation-copy>
                <p>材料门槛已满足 · 包含反向材料</p>
                <h2>观察可以回查，关系仍然只是候选。</h2>
              </header>

              <div className={styles.observationList} data-interpretation-copy>
                <span>可回查观察</span>
                {experienceData.observations.map((observation) => (
                  <p key={observation}>{observation}</p>
                ))}
              </div>

              <div className={styles.hypothesisTrack} data-interpretation-copy>
                <div className={styles.simpleHypothesis}>
                  <span>最简单、但站不住的故事</span>
                  <p>{experienceData.hypothesis.initial}</p>
                </div>
                <div className={styles.candidateHypothesis} data-testid="relationship-hypothesis">
                  <span>候选关系 · 尚未确认</span>
                  <blockquote>{experienceData.hypothesis.statement}</blockquote>
                </div>
              </div>

              <div className={styles.hypothesisEvidence} data-interpretation-copy>
                <div className={styles.citationStrip} aria-label="候选关系引用的原文">
                  {citationMoments.map((moment) => (
                    <p key={moment.id}>
                      <time>{moment.date}</time>
                      <q>{moment.highlightedText}</q>
                    </p>
                  ))}
                </div>
                <div className={styles.nonClaims}>
                  <span>这不证明</span>
                  {experienceData.hypothesis.nonClaims.map((claim) => (
                    <p key={claim}>{claim}</p>
                  ))}
                </div>
              </div>
            </div>

            <CorrectionInteraction
              phase={state.phase}
              correction={experienceData.correction}
              moments={experienceData.moments}
              auditOpen={state.correctionAuditOpen}
              selectedEvidenceId={state.selectedCorrectionEvidenceId}
              selectedIssue={state.selectedCorrectionIssue}
              onBeginAudit={() => dispatch({ type: "BEGIN_CORRECTION_AUDIT" })}
              onSelectEvidence={(evidenceId) =>
                dispatch({ type: "SELECT_CORRECTION_EVIDENCE", evidenceId })
              }
              onSelectIssue={(issue) =>
                dispatch({ type: "SELECT_CORRECTION_ISSUE", issue })
              }
              onApplyCorrection={() => dispatch({ type: "APPLY_CORRECTION" })}
              onCancelAudit={() => dispatch({ type: "CANCEL_CORRECTION_AUDIT" })}
              onReject={() => dispatch({ type: "REJECT" })}
              onDefer={() => dispatch({ type: "DEFER" })}
              onPause={() => dispatch({ type: "PAUSE" })}
            />
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.reconstructionLayer}`}
            aria-hidden={state.phase !== "reconstructing"}
          >
            <div className={styles.reconstructionContent}>
              <header data-reconstruction>
                <p>用户使 AI 改道</p>
                <h2>不是换一种说法，而是改写这条关系。</h2>
              </header>

              <div className={styles.revisionComparison}>
                <article data-reconstruction>
                  <span>原候选关系</span>
                  <p>{experienceData.tentativeAnswer}</p>
                </article>
                <div className={styles.revisionCause} data-reconstruction>
                  <q>{experienceData.correction.targetQuote}</q>
                  <p>{selectedIssue?.label ?? "用户指出原文被低估"}</p>
                </div>
                <article data-reconstruction>
                  <span>修订后的候选关系</span>
                  <p>{experienceData.revisedAnswer}</p>
                </article>
              </div>

              <blockquote className={styles.recordedCaseResponse} data-reconstruction>
                <span>{experienceData.correction.recordedResponse.label}</span>
                <p>“{experienceData.correction.recordedResponse.quote}”</p>
                <cite>{experienceData.correction.recordedResponse.source}</cite>
              </blockquote>

              <div className={styles.reconstructionActions} data-reconstruction>
                <p>这仍然是 AI 的修订候选；它不会被保存成用户的最终 Position。</p>
                <button
                  className={styles.storyButton}
                  type="button"
                  onClick={() => dispatch({ type: "CONFIRM_RECONSTRUCTION" })}
                  data-testid="confirm-reconstruction"
                >
                  查看这次方法留下了什么
                </button>
              </div>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.reentryLayer}`}
            aria-hidden={state.phase !== "reentering_material"}
          >
            <div className={styles.reentryContent}>
              <header data-reentry>
                <p>协议模拟 · 尚不确定</p>
                <h2>“不知道”不会被当成结尾，也不会被解释成心理问题。</h2>
              </header>
              {reentryMoment ? (
                <article data-reentry>
                  <div>
                    <time>{reentryMoment.date}</time>
                    <span>{reentryMoment.source}</span>
                  </div>
                  <blockquote>“{reentryMoment.highlightedText}”</blockquote>
                </article>
              ) : null}
              <p className={styles.reentryPrompt} data-reentry>
                {experienceData.reentry.prompt}
              </p>
              <div className={styles.reentryActions} data-reentry>
                <button type="button" onClick={() => dispatch({ type: "RETURN_TO_CORRECTION" })}>
                  回到关系判断
                </button>
                <button
                  className={styles.storyButton}
                  type="button"
                  onClick={() => dispatch({ type: "KEEP_OPEN" })}
                  data-testid="keep-open"
                >
                  先保留这个开放问题
                </button>
              </div>
            </div>
          </section>

          <section
            className={`${styles.phaseLayer} ${styles.endingLayer}`}
            aria-hidden={state.phase !== "ending"}
            data-testid="experience-ending"
          >
            {outcomeCopy ? (
              <div className={styles.endingContent}>
                <header data-ending>
                  <span>{outcomeCopy.simulationLabel}</span>
                  <h2 ref={outcomeHeadingRef} tabIndex={-1}>
                    {outcomeCopy.lead}
                  </h2>
                  <p>{outcomeCopy.body}</p>
                </header>

                <div className={styles.relationReceipt} data-ending data-testid="relation-status">
                  <p>
                    <span>关系状态</span>
                    <strong>{outcomeCopy.relationStatus}</strong>
                  </p>
                  <p>
                    <span>AI 的合法下一步</span>
                    <strong>{outcomeCopy.nextAction}</strong>
                  </p>
                </div>

                <div className={styles.methodReceipt} data-ending>
                  <span>刚才 AI 的公开动作</span>
                  <ol>
                    {experienceData.methodReceipt.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className={styles.retentionReceipt} data-ending>
                  <div>
                    <span>留下</span>
                    {outcomeCopy.retained.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                  <div>
                    <span>不保存</span>
                    {outcomeCopy.notSaved.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>

                <div className={styles.capabilityReceipt} data-ending>
                  <span>这个 mock 没有证明</span>
                  {experienceData.methodReceipt.limitations.map((limitation) => (
                    <p key={limitation}>{limitation}</p>
                  ))}
                </div>

                <div className={styles.endingActions} data-ending>
                  <Link className={styles.storyButton} href="/" scroll>
                    返回主页面
                  </Link>
                  <button type="button" onClick={() => dispatch({ type: "RESET" })}>
                    重新体验
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <p className={styles.srOnly} role="status" aria-live="polite">
        {announcementForPhase(state.phase, state.outcome)}
      </p>
    </main>
  );
}
