"use client";

import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gsap } from "gsap";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScreeningDay, ScreeningMaterial } from "./screening-materials";
import styles from "./screening-room.module.css";

type Props = {
  days: ReadonlyArray<ScreeningDay>;
  fontClassName: string;
};

export type ScreeningSelection = { selectedIds: string[] };

const wheelQuietTime = 180;
const closingLine = "这段时间终于结束了，帮我放进“回织”吧，等我那天想起了，就回来看看。";
const openingLines = [
  "Hi，我是 blonded。这是我做的一个探索。过去的我是怎么塑造今天的我的？今天的我，又能不能带着疑问回到过去，找到一点答案？",
  "我设想了一个系统，叫「回织」。过去的一段段经历像线，织成了今天的我。沿着这些线往回看，也许能重新理解现在的自己。",
  "它能收集我过去留下的东西，比如我写的日记、我看过的书，还有我和 GPT 的对话。等有一天我带着疑问回望，它会找出相关的真实记录，做成一张张卡片，陪我重新看一遍。或许，我能从里面找到一点答案。",
  "那么我们开始吧。先和我一起回到 7 月 7 日，看看我的那段过去。",
] as const;

type Drag = {
  element: HTMLButtonElement;
  id: number;
  x: number;
  y: number;
  moved: boolean;
};

function shortDate(material: ScreeningMaterial) {
  return material.date.slice(5).replace("-", ".");
}

function motionAllowed() {
  return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScreeningRoom({ days, fontClassName }: Props) {
  const router = useRouter();
  const [openingStep, setOpeningStep] = useState(0);
  const [dayIndex, setDayIndex] = useState(() => Math.max(0, days.findIndex(({ date }) => date === "2026-07-07")));
  const [dayCards, setDayCards] = useState<Partial<Record<number, number>>>({});
  const [reading, setReading] = useState(false);

  const pileRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLButtonElement>(null);
  const readerRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);
  const closingReader = useRef(false);

  const started = openingStep === openingLines.length;
  const day = days[dayIndex];
  const { materials } = day;
  const active = dayCards[dayIndex] ?? 0;
  const current = materials[active];
  const elapsed = dayIndex / (days.length - 1 || 1);
  const atLastDay = dayIndex === days.length - 1;

  useEffect(() => {
    const previousCards = history.state?.huizhiTimeline as typeof dayCards | undefined;
    if (!previousCards) return;
    const frame = requestAnimationFrame(() => {
      setDayCards(previousCards);
      setDayIndex(days.length - 1);
      setOpeningStep(openingLines.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [days.length]);

  useEffect(() => {
    const pile = pileRef.current;
    if (!started || !pile || reading) return;
    let distance = 0;
    let previousTime = -Infinity;
    let previousMagnitude = 0;
    let lastFlip = -Infinity;
    let lastDirection = 0;
    let peak = 0;
    let trough = Infinity;

    function handleWheel(event: WheelEvent) {
      if (event.ctrlKey || drag.current || readerRef.current?.open) return;
      const axis = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      const delta = axis * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? (pile?.clientHeight ?? 1) : 1);
      const now = performance.now();
      if (!delta) return;
      const gap = now - previousTime;
      const direction = Math.sign(delta);
      const magnitude = Math.abs(delta);
      if (gap >= wheelQuietTime) {
        distance = 0;
        lastDirection = 0;
      }
      previousTime = now;
      event.preventDefault();

      if (lastDirection) {
        // A fading wheel tail belongs to its last flip. A new impulse, reversal,
        // or separate mouse detent can begin the next flip before the tail stops.
        const newImpulse = magnitude >= 36 && magnitude > previousMagnitude
          && magnitude - trough >= 24 && magnitude > trough * 2.4 && trough < peak * 0.62;
        const reversed = direction !== lastDirection && magnitude >= 28;
        const mouseDetent = gap >= 65 && magnitude >= 44 && magnitude === previousMagnitude && Number.isInteger(axis);
        previousMagnitude = magnitude;
        if (now - lastFlip < 65 || (!newImpulse && !reversed && !mouseDetent)) {
          peak = Math.max(peak, magnitude);
          trough = Math.min(trough, magnitude);
          return;
        }
      }

      previousMagnitude = magnitude;
      if (direction !== Math.sign(distance)) distance = 0;
      distance += delta;
      if (Math.abs(distance) < 28) return;
      distance = 0;
      lastFlip = now;
      lastDirection = direction;
      peak = magnitude;
      trough = magnitude;
      setDayCards((cards) => ({
        ...cards,
        [dayIndex]: ((cards[dayIndex] ?? 0) + direction + materials.length) % materials.length,
      }));
    }

    pile.addEventListener("wheel", handleWheel, { passive: false });
    return () => pile.removeEventListener("wheel", handleWheel);
  }, [started, dayIndex, materials.length, reading]);

  useEffect(() => {
    if (started) frontRef.current?.focus({ preventScroll: true });
  }, [started]);

  function flip(direction: -1 | 1, focus = false) {
    setDayCards((cards) => ({
      ...cards,
      [dayIndex]: ((cards[dayIndex] ?? 0) + direction + materials.length) % materials.length,
    }));
    if (focus) requestAnimationFrame(() => frontRef.current?.focus({ preventScroll: true }));
  }

  function stepDay(direction: -1 | 1) {
    drag.current = null;
    setDayIndex((index) => Math.max(0, Math.min(days.length - 1, index + direction)));
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>) {
    const element = frontRef.current;
    if (!element || !event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gsap.killTweensOf(element);
    gsap.set(element, { clearProps: "transform" });
    drag.current = { element, id: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
    const pressedCard = event.target instanceof Element ? event.target.closest("button") : null;
    (pressedCard ?? event.currentTarget).setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const pointer = drag.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const x = event.clientX - pointer.x;
    const y = event.clientY - pointer.y;
    if (!pointer.moved && Math.hypot(x, y) < 8) return;
    pointer.moved = true;
    gsap.set(pointer.element, {
      x: 46 * Math.tanh(x / 60),
      y: 14 * Math.tanh(y / 45),
      rotation: motionAllowed() ? Math.max(-2, Math.min(2, x * 0.025)) : 0,
    });
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const pointer = drag.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    drag.current = null;
    const x = event.clientX - pointer.x;
    const y = event.clientY - pointer.y;
    const released = event.type === "pointerup";
    suppressClick.current = pointer.moved || (released && Math.hypot(x, y) >= 8);
    if (released && Math.abs(x) >= 32 && Math.abs(x) > Math.abs(y) * 1.1) {
      flip(x < 0 ? 1 : -1, true);
    }
    if (!pointer.moved) return;
    gsap.to(pointer.element, {
      x: 0,
      y: 0,
      rotation: 0,
      duration: motionAllowed() ? 0.22 : 0,
      ease: "power3.out",
      clearProps: "transform",
      overwrite: true,
    });
  }

  function openReader() {
    const dialog = readerRef.current;
    if (!dialog || dialog.open) return;
    const origin = frontRef.current?.getBoundingClientRect();
    dialog.showModal();
    setReading(true);
    if (!origin || !motionAllowed()) return;
    const bounds = dialog.getBoundingClientRect();
    gsap.fromTo(dialog, {
      x: origin.x + origin.width / 2 - bounds.x - bounds.width / 2,
      y: origin.y + origin.height / 2 - bounds.y - bounds.height / 2,
      scale: Math.min(origin.width / bounds.width, origin.height / bounds.height, 1),
      rotation: 3,
      opacity: 0.7,
    }, {
      x: 0, y: 0, scale: 1, rotation: 0, opacity: 1,
      duration: 0.4, ease: "power3.out", clearProps: "transform,opacity",
    });
  }

  function closeReader() {
    const dialog = readerRef.current;
    if (!dialog || closingReader.current) return;
    function finish() {
      gsap.set(dialog, { clearProps: "transform,opacity" });
      dialog?.close();
      setReading(false);
      closingReader.current = false;
      frontRef.current?.focus({ preventScroll: true });
    }
    gsap.killTweensOf(dialog);
    const destination = frontRef.current?.getBoundingClientRect();
    if (!destination || !motionAllowed()) {
      finish();
      return;
    }

    closingReader.current = true;
    gsap.to(dialog, {
      x: destination.x + destination.width / 2 - innerWidth / 2,
      y: destination.y + destination.height / 2 - innerHeight / 2,
      scale: Math.min(destination.width / dialog.offsetWidth, destination.height / dialog.offsetHeight, 1),
      rotation: 3, opacity: 0,
      duration: 0.25, ease: "power2.in",
      onComplete: finish,
    });
  }

  function archiveTimeline() {
    const selection = { selectedIds: days.flatMap(({ materials }) => materials.map(({ id }) => id)) };
    try {
      localStorage.setItem("huizhi:screening-selection", JSON.stringify(selection));
    } catch {
      // The next act can still play when browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent<ScreeningSelection>("huizhi:materials-confirmed", { detail: selection }));
    history.replaceState({ ...history.state, huizhiTimeline: dayCards }, "");
    router.push("/experience");
  }

  return (
    <main className={styles.page + " " + fontClassName} data-screening-active={started} data-moment={active} data-day={started ? day.date : undefined} data-pose={started ? dayIndex % 5 : 0}>
      <Image className={styles.room} src={publicAsset("/huizhi/room.webp")} alt="" fill unoptimized sizes="100vw" />
      <header className={styles.masthead}>
        <h1><Image src={publicAsset("/huizhi/wordmark.svg")} alt="回织" width={246} height={110} priority /></h1>
        {started && <nav className={styles.calendar} aria-label="切换日期">
          <Button variant="ghost" aria-label="前一天" onClick={() => stepDay(-1)} disabled={dayIndex === 0}>
            <ArrowLeft size={19} />
          </Button>
          <div className={styles.calendarDate}>
            <time key={day.date} dateTime={day.date}>
              <span>{day.date.slice(0, 4)}</span>
              {Number(day.date.slice(5, 7))} 月 {Number(day.date.slice(8, 10))} 日
            </time>
            <div className={styles.calendarTrack} aria-hidden="true">
              <span style={{ width: elapsed * 100 + "%" }} />
            </div>
          </div>
          <Button variant="ghost" aria-label="后一天" onClick={() => stepDay(1)} disabled={atLastDay}>
            <ArrowRight size={19} />
          </Button>
        </nav>}
      </header>

      <div className={started ? styles.stage : styles.opening}>
        <section className={started ? styles.narrator : styles.openingNarrator} data-closing={started && atLastDay} aria-label={started ? "blonded 的对白" : "开场：陪我翻几样东西"}>
          <div className={styles.bubble}>
            <div aria-live="polite">
              {started ? (
                <>
                  <p className={styles.speaker}>blonded</p>
                  <p key={day.date} className={styles.line}>{atLastDay ? closingLine : day.summary}</p>
                </>
              ) : (
                <p className={styles.introduction} key={openingStep}>{openingLines[openingStep]}</p>
              )}
            </div>
            {started && atLastDay && (
              <Button className={styles.archiveButton} onClick={archiveTimeline}>
                放进回织 <ArrowRight size={18} aria-hidden="true" />
              </Button>
            )}
          </div>
          <div className={styles.character}>
            <Image src={publicAsset("/huizhi/blonded-sticker.webp")} alt="blonded 的手绘贴纸形象" width={480} height={480} unoptimized />
          </div>
          {!started && (
            <Button className={styles.startButton} onClick={() => setOpeningStep((step) => Math.min(step + 1, openingLines.length))}>
              {openingStep === openingLines.length - 1 ? "开始回望" : "继续"} <ArrowRight size={18} aria-hidden="true" />
            </Button>
          )}
        </section>

        {started && <section className={styles.desk} aria-label="回忆叠放区">
          <div
            className={styles.pile}
            ref={pileRef}
            data-active={active}
            data-reading={reading}
            onPointerDown={beginDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            onClickCapture={(event) => {
              if (!suppressClick.current) return;
              suppressClick.current = false;
              event.preventDefault();
              event.stopPropagation();
            }}
            onKeyDown={(event) => {
              suppressClick.current = false;
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              if (!event.repeat) flip(event.key === "ArrowRight" ? 1 : -1, true);
            }}
          >
            {materials.map((material, index) => {
              const depth = index === active ? 0 : (index - active + 1 + materials.length) % materials.length - 1;
              const top = depth === 0;
              const visible = depth >= -1 && depth <= 2;
              return (
                <div
                  className={styles.layer}
                  data-depth={depth}
                  data-visible={visible}
                  data-format={material.kind}
                  key={material.id}
                  aria-hidden={!visible}
                >
                  <button
                    type="button"
                    className={styles.paper}
                    ref={top ? frontRef : undefined}
                    tabIndex={top ? 0 : -1}
                    aria-label={top ? "抽出原文：" + material.title : depth < 0 ? "翻回上一张" : "翻到下一张"}
                    onClick={() => {
                      if (!top) {
                        flip(depth < 0 ? -1 : 1, true);
                      } else {
                        openReader();
                      }
                    }}
                  >
                    <span className={styles.paperTop}>
                      <time dateTime={material.date}>{shortDate(material)}</time>
                      <span>{material.source}</span>
                    </span>
                    <span className={styles.paperContent}>
                      <span className={styles.paperTitle}>{material.title}</span>
                      <span className={styles.preview}>{material.original.length > 86 ? material.original.slice(0, 86).trimEnd() + "…" : material.original}</span>
                    </span>
                    <span className={styles.paperBottom}>
                      <ArrowUpRight size={22} />
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.controls}>
            <div className={styles.turnControls} aria-label={'当天第 ' + (active + 1) + ' 条，共 ' + materials.length + ' 条'}>
              <span>{active + 1} / {materials.length}</span>
            </div>
            <p className={styles.gestureHint}>左右滑动翻卡，轻点查看原文<span className={styles.srOnly}>。也可以用方向键翻看当天素材。</span></p>
          </div>
        </section>}
      </div>

      <dialog ref={readerRef} className={styles.reader} aria-labelledby="reader-title" onCancel={(event) => { event.preventDefault(); closeReader(); }}>
        <div className={styles.dialogHeader}>
          <p><time dateTime={current.date}>{shortDate(current)}</time>　{current.source} · {current.id}</p>
          <Button variant="ghost" aria-label="放回原文" onClick={closeReader}><X size={21} /></Button>
        </div>
        <h2 id="reader-title">{current.title}</h2>
        <blockquote>{current.original}</blockquote>
        <div className={styles.dialogActions}>
          <Button variant="ghost" onClick={closeReader}>放回原处</Button>
        </div>
      </dialog>
    </main>
  );
}
