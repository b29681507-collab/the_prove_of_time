import {
  experienceCorrectionTargetMomentId,
  type CorrectionIssueId,
  type ExperienceOutcome,
} from "./experience-data";

export const experiencePhases = [
  "intro",
  "opening_past",
  "question_revealed",
  "planning_evidence",
  "collecting_fragments",
  "exploring_fragments",
  "forming_interpretation",
  "awaiting_correction",
  "reconstructing",
  "reentering_material",
  "ending",
] as const;

export type ExperiencePhase = (typeof experiencePhases)[number];

export type ExperienceState = {
  totalMoments: number;
  phase: ExperiencePhase;
  currentMomentIndex: number;
  activeMomentIndex: number | null;
  correctionAuditOpen: boolean;
  selectedCorrectionEvidenceId: string | null;
  selectedCorrectionIssue: CorrectionIssueId | null;
  outcome: ExperienceOutcome | null;
};

export type ExperienceEvent =
  | { type: "OPEN_PAST" }
  | { type: "PAST_OPENED" }
  | { type: "PLAN_EVIDENCE" }
  | { type: "START_COLLECTION" }
  | { type: "COLLECTION_COMPLETE" }
  | { type: "NEXT_MOMENT" }
  | { type: "OPEN_DETAIL"; index: number }
  | { type: "CLOSE_DETAIL" }
  | { type: "FORM_INTERPRETATION" }
  | { type: "INTERPRETATION_COMPLETE" }
  | { type: "BEGIN_CORRECTION_AUDIT" }
  | { type: "SELECT_CORRECTION_EVIDENCE"; evidenceId: string }
  | { type: "SELECT_CORRECTION_ISSUE"; issue: CorrectionIssueId }
  | { type: "CANCEL_CORRECTION_AUDIT" }
  | { type: "APPLY_CORRECTION" }
  | { type: "CONFIRM_RECONSTRUCTION" }
  | { type: "REJECT" }
  | { type: "DEFER" }
  | { type: "RETURN_TO_CORRECTION" }
  | { type: "KEEP_OPEN" }
  | { type: "PAUSE" }
  | { type: "RESET" };

export function createInitialExperienceState(totalMoments: number): ExperienceState {
  return {
    totalMoments,
    phase: "intro",
    currentMomentIndex: 0,
    activeMomentIndex: null,
    correctionAuditOpen: false,
    selectedCorrectionEvidenceId: null,
    selectedCorrectionIssue: null,
    outcome: null,
  };
}

export function experienceReducer(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  switch (event.type) {
    case "OPEN_PAST":
      if (state.phase !== "intro") return state;
      return { ...state, phase: "opening_past" };
    case "PAST_OPENED":
      if (state.phase !== "opening_past") return state;
      return { ...state, phase: "question_revealed" };
    case "PLAN_EVIDENCE":
      if (state.phase !== "question_revealed") return state;
      return { ...state, phase: "planning_evidence" };
    case "START_COLLECTION":
      if (state.phase !== "planning_evidence") return state;
      return { ...state, phase: "collecting_fragments" };
    case "COLLECTION_COMPLETE":
      if (state.phase !== "collecting_fragments") return state;
      return {
        ...state,
        phase: "exploring_fragments",
        currentMomentIndex: 0,
        activeMomentIndex: null,
      };
    case "NEXT_MOMENT":
      if (
        state.phase !== "exploring_fragments" ||
        state.activeMomentIndex !== null ||
        state.currentMomentIndex >= state.totalMoments - 1
      ) {
        return state;
      }
      return {
        ...state,
        currentMomentIndex: state.currentMomentIndex + 1,
      };
    case "OPEN_DETAIL":
      if (
        state.phase !== "exploring_fragments" ||
        event.index !== state.currentMomentIndex ||
        event.index < 0 ||
        event.index >= state.totalMoments
      ) {
        return state;
      }
      return { ...state, activeMomentIndex: event.index };
    case "CLOSE_DETAIL":
      if (state.activeMomentIndex === null) return state;
      return { ...state, activeMomentIndex: null };
    case "FORM_INTERPRETATION":
      if (
        state.phase !== "exploring_fragments" ||
        state.activeMomentIndex !== null ||
        state.totalMoments === 0 ||
        state.currentMomentIndex !== state.totalMoments - 1
      ) {
        return state;
      }
      return { ...state, phase: "forming_interpretation" };
    case "INTERPRETATION_COMPLETE":
      if (state.phase !== "forming_interpretation") return state;
      return {
        ...state,
        phase: "awaiting_correction",
        correctionAuditOpen: false,
        selectedCorrectionEvidenceId: null,
        selectedCorrectionIssue: null,
      };
    case "BEGIN_CORRECTION_AUDIT":
      if (state.phase !== "awaiting_correction") return state;
      return {
        ...state,
        correctionAuditOpen: true,
        selectedCorrectionEvidenceId: null,
        selectedCorrectionIssue: null,
      };
    case "SELECT_CORRECTION_EVIDENCE":
      if (state.phase !== "awaiting_correction" || !state.correctionAuditOpen) {
        return state;
      }
      return {
        ...state,
        selectedCorrectionEvidenceId: event.evidenceId,
        selectedCorrectionIssue: null,
      };
    case "SELECT_CORRECTION_ISSUE":
      if (
        state.phase !== "awaiting_correction" ||
        !state.correctionAuditOpen ||
        state.selectedCorrectionEvidenceId === null
      ) {
        return state;
      }
      return { ...state, selectedCorrectionIssue: event.issue };
    case "CANCEL_CORRECTION_AUDIT":
      if (state.phase !== "awaiting_correction" || !state.correctionAuditOpen) {
        return state;
      }
      return {
        ...state,
        correctionAuditOpen: false,
        selectedCorrectionEvidenceId: null,
        selectedCorrectionIssue: null,
      };
    case "APPLY_CORRECTION":
      if (
        state.phase !== "awaiting_correction" ||
        !state.correctionAuditOpen ||
        state.selectedCorrectionEvidenceId !==
          experienceCorrectionTargetMomentId ||
        state.selectedCorrectionIssue === null
      ) {
        return state;
      }
      return {
        ...state,
        phase: "reconstructing",
        correctionAuditOpen: false,
      };
    case "CONFIRM_RECONSTRUCTION":
      if (state.phase !== "reconstructing") return state;
      return { ...state, phase: "ending", outcome: "corrected" };
    case "REJECT":
      if (state.phase !== "awaiting_correction") return state;
      return {
        ...state,
        phase: "ending",
        correctionAuditOpen: false,
        outcome: "rejected",
      };
    case "DEFER":
      if (state.phase !== "awaiting_correction") return state;
      return {
        ...state,
        phase: "reentering_material",
        correctionAuditOpen: false,
        selectedCorrectionEvidenceId: null,
        selectedCorrectionIssue: null,
      };
    case "RETURN_TO_CORRECTION":
      if (state.phase !== "reentering_material") return state;
      return {
        ...state,
        phase: "awaiting_correction",
        correctionAuditOpen: false,
        selectedCorrectionEvidenceId: null,
        selectedCorrectionIssue: null,
      };
    case "KEEP_OPEN":
      if (state.phase !== "reentering_material") return state;
      return { ...state, phase: "ending", outcome: "open" };
    case "PAUSE":
      if (
        state.phase !== "awaiting_correction" &&
        state.phase !== "reentering_material"
      ) {
        return state;
      }
      return {
        ...state,
        phase: "ending",
        correctionAuditOpen: false,
        outcome: "paused",
      };
    case "RESET":
      return createInitialExperienceState(state.totalMoments);
    default:
      return state;
  }
}
