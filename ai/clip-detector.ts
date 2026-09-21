export type TranscriptWord = {
  word: string;
  start: number;
  end: number;
  score?: number;
};

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
  words?: TranscriptWord[];
};

export type ClipSuggestion = {
  start: number;
  end: number;
  reason: string;
};

const MAX_CLIP_DURATION = 15;
const GROUP_GAP = 3;

const HIGHLIGHT_KEYWORDS = [
  "oh my god",
  "headshot",
  "glitched",
  "wait for it",
];

export function detectClips(
  segments: TranscriptSegment[]
): ClipSuggestion[] {
  const detections: ClipSuggestion[] = [];

  // Find individual highlight moments
  for (const segment of segments) {
    const text = segment.text.toLowerCase();

    const matchedKeyword = HIGHLIGHT_KEYWORDS.find(
      (keyword) => text.includes(keyword)
    );

    if (!matchedKeyword) {
      continue;
    }

    detections.push({
      start: Math.max(0, segment.start - 3),
      end: segment.end + 3,
      reason: `Highlight detected from "${matchedKeyword}": ${segment.text.trim()}`,
    });
  }

  // Sort detections chronologically
  detections.sort((a, b) => a.start - b.start);

  const clips: ClipSuggestion[] = [];

  let currentStart: number | null = null;
  let currentEnd: number | null = null;
  let reasons: string[] = [];

  for (const detection of detections) {
    // Start the first group
    if (currentStart === null || currentEnd === null) {
      currentStart = detection.start;
      currentEnd = detection.end;
      reasons = [detection.reason];
      continue;
    }

    const gap = detection.start - currentEnd;
    const proposedEnd = Math.max(currentEnd, detection.end);
    const proposedDuration = proposedEnd - currentStart;

    // Continue the current group
    if (
      gap <= GROUP_GAP &&
      proposedDuration <= MAX_CLIP_DURATION
    ) {
      currentEnd = proposedEnd;
      reasons.push(detection.reason);
      continue;
    }

    // Save the current group
    clips.push({
      start: currentStart,
      end: currentEnd,
      reason: reasons.join(" | "),
    });

    // Start a new group
    currentStart = detection.start;
    currentEnd = detection.end;
    reasons = [detection.reason];
  }

  // Save the final group
  if (currentStart !== null && currentEnd !== null) {
    clips.push({
      start: currentStart,
      end: currentEnd,
      reason: reasons.join(" | "),
    });
  }
     // Remove overlaps between final clips
  for (let i = 1; i < clips.length; i++) {
    if (clips[i].start < clips[i - 1].end) {
      clips[i].start = clips[i - 1].end;
    }
  }

  // Remove clips that became empty after overlap cleanup
  const cleanedClips = clips.filter(
    (clip) => clip.end > clip.start
  );

  return cleanedClips;

  return clips;
}