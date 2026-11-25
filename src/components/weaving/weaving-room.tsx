"use client";

import Image from "next/image";
import { publicAsset } from "@/lib/public-asset";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { EvidenceCard, WeavingRound } from "./weaving-script";
import styles from "./weaving-room.module.css";

type Beat = "question" | "search" | "cards" | "settle" | "reason" | "reflection";

type Transition = { beat: Beat; delay: number };

const nextBeat: Partial<Record<Beat, Transition>> = {
  question: { beat: "search", delay: 1900 },
  search: { beat: "cards", delay: 1200 },
  cards: { beat: "settle", delay: 580 },
  settle: { beat: "reason", delay: 490 },
  reason: { beat: "reflection", delay: 2750 },
};

const finalReflectionDelay = 6200;
const searchingLine = "让我帮你找找";

function displayDate(date: string) {
  const [, month, day] = date.split("-");
  return Number(month) + " 月 " + Number(day) + " 日";
}

function CardSource({ card }: { card: EvidenceCard }) {
  return (
    <span className={styles.source}>
      <time dateTime={card.date}>{displayDate(card.date)}</time>
      <span>{card.source}</span>
    </span>
  );
}

const blondedStickers = {
  profile: { src: publicAsset("/huizhi/blonded-sticker.webp"), width: 480, height: 480 },
  front: { src: publicAsset("/huizhi/blonded-finale.webp"), width: 1254, height: 1254 },
};

function BlondedSticker({
  className,
  pose = "profile",
}: {
  className: string;
  pose?: keyof typeof blondedStickers;
}) {
  return (
    <Image
      {...blondedStickers[pose]}
      className={className}
      alt=""
      unoptimized
      loading="eager"
    />
  );
}

function Evidence({
  cards,
  visible,
  onReadingChange,
}: {
  cards: readonly EvidenceCard[];
  visible: boolean;
  onReadingChange: (reading: boolean) => void;
}) {
  const [cardIndex, setCardIndex] = useState(0);
  const readerRef = useRef<HTMLDialogElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const card = cards[cardIndex];

  function stepReader(direction: number) {
    setCardIndex((index) => Math.max(0, Math.min(cards.length - 1, index + direction)));
    readerRef.current?.scrollTo(0, 0);
  }

  return (
    <section className={styles.evidence} aria-label="AI 递回的原文" data-visible={visible}>
      {visible && (
        <>
          <div
            className={styles.cards}
            data-count={cards.length}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              const index = cardRefs.current.findIndex((element) => element === event.target);
              if (index < 0) return;
              event.preventDefault();
              const direction = event.key === "ArrowLeft" ? -1 : 1;
              cardRefs.current[index + direction]?.focus();
            }}
          >
            {cards.map((item, index) => (
              <button
                className={styles.card}
                key={item.id}
                type="button"
                ref={(element) => { cardRefs.current[index] = element; }}
                aria-haspopup="dialog"
                aria-label={"翻看原文：" + item.title}
                onClick={() => {
                  setCardIndex(index);
                  readerRef.current?.showModal();
                  onReadingChange(true);
                }}
              >
                <CardSource card={item} />
                <strong>{item.title}</strong>
                <span className={styles.excerpt}>{item.excerpt}</span>
                <ArrowUpRight className={styles.cardArrow} size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
          <dialog
            className={styles.reader}
            ref={readerRef}
            aria-labelledby="weaving-reader-title"
            onClose={() => onReadingChange(false)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              stepReader(event.key === "ArrowLeft" ? -1 : 1);
            }}
          >
            <div className={styles.readerHeader}>
              <CardSource card={card} />
              <Button variant="ghost" aria-label="放回原文" onClick={() => readerRef.current?.close()}>
                <X size={21} aria-hidden="true" />
              </Button>
            </div>
            <h2 id="weaving-reader-title" aria-live="polite">{card.title}</h2>
            <blockquote>{card.original}</blockquote>
            {cards.length > 1 && (
              <nav className={styles.readerNav} aria-label="本轮原文">
                <Button variant="ghost" aria-label="上一张原文" disabled={cardIndex === 0} onClick={() => stepReader(-1)}>
                  <ArrowLeft size={19} aria-hidden="true" />
                </Button>
                <span>{cardIndex + 1} / {cards.length}</span>
                <Button variant="ghost" aria-label="下一张原文" disabled={cardIndex === cards.length - 1} onClick={() => stepReader(1)}>
                  <ArrowRight size={19} aria-hidden="true" />
                </Button>
              </nav>
            )}
          </dialog>
        </>
      )}
    </section>
  );
}

function DialogueRound({
  round,
  onNext,
  onFinish,
}: {
  round: WeavingRound;
  onNext?: () => void;
  onFinish?: () => void;
}) {
  const [beat, setBeat] = useState<Beat>("question");
  const [reading, setReading] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searching = beat === "search";
  const dealt = beat !== "question" && beat !== "search";
  const reflecting = beat === "reflection";
  const explaining = beat === "reason" || reflecting;
  const settled = beat === "settle" || explaining;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const transition = nextBeat[beat];
    const finish = beat === "reflection" ? onFinish : undefined;
    if (reading || (!transition && !finish)) return;
    let timer: number | undefined;

    function syncTimer() {
      window.clearTimeout(timer);
      if (document.hidden) return;
      timer = window.setTimeout(() => {
        if (transition) setBeat(transition.beat);
        else finish?.();
      }, transition?.delay ?? finalReflectionDelay);
    }

    syncTimer();
    document.addEventListener("visibilitychange", syncTimer);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", syncTimer);
    };
  }, [beat, onFinish, reading]);

  return (
    <>
      <div className={styles.scene} data-beat={beat}>
        <div className={styles.questionTrack}>
          <div className={`${styles.bubble} ${styles.question}`}>
            <p className={styles.speaker}>blonded</p>
            <h1 ref={headingRef} tabIndex={-1}>{round.question}</h1>
          </div>
        </div>
        <BlondedSticker className={styles.blonded} />

        <Evidence cards={round.cards} visible={dealt} onReadingChange={setReading} />

        <div className={styles.aiDock} data-settled={settled}>
          <Image
            className={styles.aiSticker}
            src={publicAsset("/huizhi/ai-sticker.webp")}
            alt=""
            width={1254}
            height={1254}
            unoptimized
            loading="eager"
          />
          <div className={`${styles.bubble} ${styles.search}`} hidden={!searching}>
            <p className={styles.speaker}>AI</p>
            <p>{searchingLine}</p>
          </div>
          <div className={`${styles.bubble} ${styles.reason}`} hidden={!explaining}>
            <p className={styles.speaker}>AI</p>
            <p>{round.reason}</p>
          </div>
        </div>

        <div className={`${styles.bubble} ${styles.reflection}`} hidden={!reflecting}>
          <p className={styles.speaker}>blonded</p>
          <p>{round.reflection}</p>
        </div>
        <p className={styles.srOnly} role="status">
          {beat === "search" && "AI：" + searchingLine}
          {beat === "reason" && "AI 的选材理由：" + round.reason}
          {reflecting && "blonded：" + round.reflection}
        </p>
      </div>

      {reflecting && onNext && (
        <footer className={styles.actions}>
          <Button className={styles.next} onClick={onNext}>
            下一问 <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </footer>
      )}
    </>
  );
}

function EndingScene({ closingLine }: { closingLine: string }) {
  const speechRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    speechRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section className={styles.ending} aria-label="结束语">
      <BlondedSticker className={styles.endingPortrait} pose="front" />
      <div className={`${styles.bubble} ${styles.endingSpeech}`}>
        <p className={styles.speaker}>blonded</p>
        <p ref={speechRef} tabIndex={-1}>{closingLine}</p>
      </div>
      <Link className={`${buttonVariants()} ${styles.next}`} href="/">
        再体验一遍
      </Link>
    </section>
  );
}

export function WeavingRoom({ rounds, closingLine }: { rounds: readonly WeavingRound[]; closingLine: string }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [ending, setEnding] = useState(false);
  const finish = useCallback(() => setEnding(true), []);
  const round = rounds[roundIndex];
  const lastRound = roundIndex === rounds.length - 1;

  if (ending) {
    return (
      <main className={styles.room} data-ending="true">
        <EndingScene closingLine={closingLine} />
      </main>
    );
  }

  return (
    <main className={styles.room}>
      <Image className={styles.background} src={publicAsset("/huizhi/room.webp")} alt="" fill sizes="100vw" unoptimized />
      <header className={styles.masthead}>
        <Link href="/" aria-label="回到时间线">
          <Image src={publicAsset("/huizhi/wordmark.svg")} alt="回织" width={246} height={110} priority />
        </Link>
        <div className={styles.actDate}>
          <span>7 月 15 日</span>
          <ArrowRight size={15} aria-hidden="true" />
          <strong>{hasStarted ? "今天" : "后来"}</strong>
        </div>
      </header>

      <div className={styles.canvas}>
        {hasStarted ? (
          <>
            <p className={styles.progress}>第 {roundIndex + 1} 问 / {rounds.length}</p>
            <DialogueRound
              key={round.id}
              round={round}
              onFinish={lastRound ? finish : undefined}
              onNext={!lastRound ? () => {
                setRoundIndex((index) => Math.min(rounds.length - 1, index + 1));
                window.scrollTo(0, 0);
              } : undefined}
            />
          </>
        ) : (
          <section className={styles.interlude} aria-labelledby="interlude-heading">
            <BlondedSticker className={styles.interludePortrait} />
            <div className={styles.interludeCopy}>
              <h1 id="interlude-heading">那之后，blonded 还是努力过着每一天。</h1>
              <p>直到有一天，他又想起了那段时间，开始问自己……</p>
              <Button className={styles.next} onClick={() => {
                setHasStarted(true);
                window.scrollTo(0, 0);
              }}>
                听他发问 <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
