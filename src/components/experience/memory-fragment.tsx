import type { MouseEvent, Ref } from "react";
import type { ExperienceMoment, ExperienceRecord } from "./experience-data";
import styles from "./experience.module.css";

type MemoryFragmentProps = {
  moment: ExperienceMoment;
  index: number;
  total: number;
  interactive: boolean;
  onOpen: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
};

type MemoryDetailProps = {
  moment: ExperienceMoment;
  closeButtonRef?: Ref<HTMLButtonElement>;
  onClose: () => void;
};

function HighlightedExcerpt({
  record,
  expanded = false,
}: {
  record: ExperienceRecord;
  expanded?: boolean;
}) {
  const text = expanded ? (record.detailText ?? record.rawText) : record.rawText;
  const highlightStart = text.indexOf(record.highlightedText);

  if (highlightStart === -1) return text;

  const before = text.slice(0, highlightStart);
  const after = text.slice(highlightStart + record.highlightedText.length);

  return (
    <>
      {before}
      <mark>{record.highlightedText}</mark>
      {after}
    </>
  );
}

function EvidenceBoundary({ record }: { record: ExperienceRecord }) {
  return (
    <div className={styles.evidenceBoundary}>
      <p>
        <span>它能支持</span>
        {record.canSupport}
      </p>
      <p>
        <span>它不能证明</span>
        {record.cannotSupport}
      </p>
    </div>
  );
}

export function MemoryFragment({
  moment,
  index,
  total,
  interactive,
  onOpen,
  buttonRef,
}: MemoryFragmentProps) {
  const roleLabel = moment.role === "counter" ? "反向材料" : "主材料";

  return (
    <article
      className={styles.memoryFragment}
      data-memory-id={moment.id}
      data-role={moment.role}
      data-interactive={interactive}
      data-testid={`evidence-${moment.id}`}
    >
      <div className={styles.evidenceProgress} aria-label={`第 ${index + 1} 组，共 ${total} 组`}>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <strong>{roleLabel}</strong>
      </div>

      <div className={styles.evidenceStage}>
        <button
          ref={buttonRef}
          className={styles.memoryPaper}
          type="button"
          onClick={onOpen}
          disabled={!interactive}
          aria-haspopup="dialog"
          aria-label={`查看 ${moment.date} 的完整记录`}
          data-testid={`memory-${index + 1}`}
        >
          <span className={styles.memoryMeta}>
            <time>{moment.date}</time>
            <span>过去原文</span>
          </span>
          <span className={styles.memoryQuote}>
            <HighlightedExcerpt record={moment} />
          </span>
          <small className={styles.memorySource}>{moment.source}</small>
          <span className={styles.memoryTouch} aria-hidden="true">
            查看完整原文与上下文
          </span>
        </button>

        <div className={styles.evidenceMethod} data-evidence-method>
          <p className={styles.selectionReason}>
            <span>为什么带回这段</span>
            {moment.selectionReason}
          </p>
          <p className={styles.publicObservation}>
            <span>AI 的公开观察</span>
            {moment.aiTrace}
          </p>
          <EvidenceBoundary record={moment} />
          <p className={styles.understandingShift}>
            <span>这段改变了什么</span>
            {moment.changesUnderstanding}
          </p>
        </div>
      </div>
    </article>
  );
}

export function MemoryDetail({
  moment,
  closeButtonRef,
  onClose,
}: MemoryDetailProps) {
  function closeFromBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className={styles.memoryDetailBackdrop}
      data-detail-backdrop
      onMouseDown={closeFromBackdrop}
    >
      <section
        className={styles.memoryDetail}
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-detail-title"
        data-memory-detail
        data-testid="memory-detail"
      >
        <header className={styles.memoryDetailHeader}>
          <div>
            <span>{moment.role === "counter" ? "反向材料" : "主材料"}</span>
            <time id="memory-detail-title">{moment.date}</time>
            <p>{moment.source}</p>
          </div>
          <button autoFocus ref={closeButtonRef} type="button" onClick={onClose}>
            关闭详情
          </button>
        </header>

        <blockquote className={styles.memoryDetailQuote}>
          <HighlightedExcerpt record={moment} expanded />
        </blockquote>

        <div className={styles.detailMethod}>
          <p>
            <span>为什么带回</span>
            {moment.selectionReason}
          </p>
          <p>
            <span>公开观察</span>
            {moment.aiTrace}
          </p>
          <EvidenceBoundary record={moment} />
        </div>

        {moment.relatedRecords?.map((record) => (
          <section className={styles.relatedRecord} key={record.id}>
            <div className={styles.relatedMeta}>
              <time>{record.date}</time>
              <span>{record.source}</span>
            </div>
            <blockquote>
              <HighlightedExcerpt record={record} expanded />
            </blockquote>
            <p>{record.aiTrace}</p>
          </section>
        ))}
      </section>
    </div>
  );
}
