import type {
  CorrectionIssueId,
  ExperienceMoment,
  InquiryNarrative,
} from "./experience-data";
import type { ExperiencePhase } from "./experience-machine";
import styles from "./experience.module.css";

type CorrectionInteractionProps = {
  phase: ExperiencePhase;
  correction: InquiryNarrative["correction"];
  moments: ExperienceMoment[];
  auditOpen: boolean;
  selectedEvidenceId: string | null;
  selectedIssue: CorrectionIssueId | null;
  onBeginAudit: () => void;
  onSelectEvidence: (evidenceId: string) => void;
  onSelectIssue: (issue: CorrectionIssueId) => void;
  onApplyCorrection: () => void;
  onCancelAudit: () => void;
  onReject: () => void;
  onDefer: () => void;
  onPause: () => void;
};

export function CorrectionInteraction({
  phase,
  correction,
  moments,
  auditOpen,
  selectedEvidenceId,
  selectedIssue,
  onBeginAudit,
  onSelectEvidence,
  onSelectIssue,
  onApplyCorrection,
  onCancelAudit,
  onReject,
  onDefer,
  onPause,
}: CorrectionInteractionProps) {
  const active = phase === "awaiting_correction";
  const targetMatched = selectedEvidenceId === correction.targetMomentId;

  return (
    <section
      className={styles.correctionLayer}
      aria-hidden={!active}
      aria-labelledby="correction-heading"
      data-audit-open={auditOpen}
    >
      {!auditOpen ? (
        <>
          <div className={styles.correctionHeading}>
            <div>
              <h2 id="correction-heading">这不是让访客替 b1onded 作答</h2>
              <p>选择一种协议状态，检查 AI 是否会按用户回应改道或停止。</p>
            </div>
            <span>关系状态 · 尚未确认</span>
          </div>

          <div className={styles.interpretationChoices}>
            <button
              className={styles.correctionChoice}
              type="button"
              onClick={onBeginAudit}
              disabled={!active}
              data-correction-choice
              data-testid="begin-correction-audit"
            >
              <strong>只成立一部分</strong>
              <span>检查 AI 低估了哪段原文</span>
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={!active}
              data-correction-choice
            >
              <strong>这条变化不成立</strong>
              <span>协议模拟 · AI 必须停止</span>
            </button>
            <button
              type="button"
              onClick={onDefer}
              disabled={!active}
              data-correction-choice
            >
              <strong>现在还不能确定</strong>
              <span>协议模拟 · 回到争议材料</span>
            </button>
            <button
              type="button"
              onClick={onPause}
              disabled={!active}
              data-correction-choice
            >
              <strong>先停在这里</strong>
              <span>协议模拟 · 保留空白</span>
            </button>
          </div>
        </>
      ) : (
        <div className={styles.correctionWorkbench} data-correction-workbench>
          <div className={styles.workbenchHeading}>
            <div>
              <h2 id="correction-heading">哪段原文限制了这条解释？</h2>
              <p>{correction.prompt}</p>
            </div>
            <button type="button" onClick={onCancelAudit}>
              返回四种状态
            </button>
          </div>

          <div className={styles.evidenceAuditChoices} aria-label="选择被低估的原文">
            {moments.map((moment) => (
              <button
                type="button"
                key={moment.id}
                aria-pressed={selectedEvidenceId === moment.id}
                onClick={() => onSelectEvidence(moment.id)}
                data-testid={`audit-${moment.id}`}
              >
                <span>{moment.date}</span>
                <q>{moment.highlightedText}</q>
              </button>
            ))}
          </div>

          {selectedEvidenceId ? (
            <p className={styles.auditFeedback} data-match={targetMatched} role="status">
              {targetMatched
                ? "这段说明“优秀、被需要、为自己做”仍然同时存在，简单的替代故事站不住。"
                : "这段支持变化确实发生过，但没有直接挑战“旧标准已经消失”的说法。"}
            </p>
          ) : null}

          {targetMatched ? (
            <div className={styles.issueChoices} aria-label="指出 AI 的理解问题">
              <p>这段暴露了 AI 的哪种问题？</p>
              {correction.issues.map((issue) => (
                <button
                  type="button"
                  key={issue.id}
                  aria-pressed={selectedIssue === issue.id}
                  onClick={() => onSelectIssue(issue.id)}
                >
                  <strong>{issue.label}</strong>
                  <span>{issue.description}</span>
                </button>
              ))}
            </div>
          ) : null}

          {targetMatched && selectedIssue ? (
            <blockquote className={styles.recordedResponse}>
              <span>{correction.recordedResponse.label}</span>
              <p>“{correction.recordedResponse.quote}”</p>
              <cite>{correction.recordedResponse.source}</cite>
            </blockquote>
          ) : null}

          <div className={styles.workbenchActions}>
            <button type="button" onClick={onCancelAudit}>
              取消审查
            </button>
            <button
              className={styles.storyButton}
              type="button"
              onClick={onApplyCorrection}
              disabled={!targetMatched || !selectedIssue}
              data-testid="apply-correction"
            >
              让这段原文重新约束答案
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
