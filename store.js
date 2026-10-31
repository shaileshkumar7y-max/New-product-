const STORAGE_KEY = 'private-rate-lab-demo-v1';

export const DEFAULT_STATE = {
  version: 1,
  entered: false,
  permissions: { view: true, feedback: true, comments: false, save: false, expiry: true },
  sessionActive: true,
  expiryMinutes: 30,
  previewMode: 'reviewer',
  boundaries: ['Respectful tone', 'No personal questions', 'No unsolicited advice'],
  customBoundaries: [],
  mood: 'neutral',
  hideResults: false,
  gentleMode: true,
  feedbackDraft: '',
  feedbackMode: 'constructive',
  customCriteria: ['Respectfulness', 'Clarity', 'Usefulness'],
  whatIf: { comments: false, reviewers: 2, duration: 30 },
  challengeDone: [],
  insightSampleCount: 3,
  room: null,
  safetyActions: {},
  events: [
    { time: Date.now() - 1000 * 60 * 21, title: 'Demo workspace created', detail: 'Local sample environment initialized', type: 'system' },
    { time: Date.now() - 1000 * 60 * 17, title: 'Feedback permissions reviewed', detail: 'You checked your consent settings', type: 'consent' },
    { time: Date.now() - 1000 * 60 * 9, title: 'Privacy preview opened', detail: 'Reviewer view simulated', type: 'preview' }
  ],
  museum: [
    { title: 'First-look demo', date: 'Today · 10:30 AM', quality: 82, note: 'Synthetic sample session' },
    { title: 'Boundary practice', date: 'Yesterday · 6:15 PM', quality: 91, note: 'Synthetic sample session' },
    { title: 'Feedback lab', date: 'Oct 28 · 4:40 PM', quality: 76, note: 'Synthetic sample session' }
  ]
};

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...clone(DEFAULT_STATE), ...parsed,
      permissions: { ...DEFAULT_STATE.permissions, ...(parsed.permissions || {}) },
      whatIf: { ...DEFAULT_STATE.whatIf, ...(parsed.whatIf || {}) }
    };
  } catch (error) {
    console.warn('Could not load demo state; using defaults.', error);
    return clone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Could not save demo state.', error);
    return false;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function snapshotState(state) {
  return clone(state);
}

export function storageKey() { return STORAGE_KEY; }
