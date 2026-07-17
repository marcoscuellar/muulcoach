// Placeholder content for the shell screens (Trending, Daily Brief, Calendar,
// Analytics, Library). Per the Backend Integration Notes these are UI shells
// with mock data — swap for real feeds/analytics when a backend exists.

export type Trend = {
  topic: string;
  meta: string;
  momo: string;
  kind: "hot" | "up";
  angle: string;
};

export const TRENDS: Record<"today" | "week", Trend[]> = {
  today: [
    { topic: 'The "AI won’t take your job" debate', meta: "2.4k posts today · your field", momo: "HOT", kind: "hot", angle: "myth" },
    { topic: "Cold outbound is dead (or is it?)", meta: "890 posts today · sales", momo: "↑ 64%", kind: "up", angle: "authority" },
    { topic: "Recruiters ghosting candidates backlash", meta: "1.1k posts today", momo: "HOT", kind: "hot", angle: "authority" },
    { topic: '"Show your work" build-in-public posts', meta: "620 posts today", momo: "↑ 38%", kind: "up", angle: "free" },
  ],
  week: [
    { topic: "Layoffs → fractional / solo consulting", meta: "+180% this week", momo: "↑ 180%", kind: "up", angle: "case" },
    { topic: "Q3 pipeline planning season", meta: "durable theme this week", momo: "↑ 41%", kind: "up", angle: "authority" },
    { topic: "AI SDRs vs. human sellers", meta: "+96% this week · sales", momo: "↑ 96%", kind: "up", angle: "myth" },
    { topic: "Return-to-office and hiring shifts", meta: "steady this week", momo: "↑ 22%", kind: "up", angle: "authority" },
  ],
};

export type NewsItem = {
  cat: string;
  headline: string;
  angle: string;
  kind: "ai" | "staffing" | "security" | "tech";
  a: string;
};

export const NEWS: NewsItem[] = [
  { cat: "AI", headline: "New AI recruiter agents auto-screen 80% of applicants", angle: "Where human recruiters still win — and why speed isn’t everything.", kind: "ai", a: "myth" },
  { cat: "STAFFING", headline: "Contract-to-hire demand jumps as firms hedge headcount", angle: "What this signals about H2 hiring — advice for candidates on the fence.", kind: "staffing", a: "authority" },
  { cat: "SECURITY", headline: "Major breach traced to a contractor’s unmanaged laptop", angle: "The vetting gap every staffing firm should close this quarter.", kind: "security", a: "authority" },
  { cat: "TECH", headline: "Big Tech reopens senior IC roles after a hiring freeze", angle: "How to position mid-career talent for the reopening.", kind: "tech", a: "case" },
  { cat: "AI", headline: "Study: AI resume tools are quietly filtering out great people", angle: "A contrarian take on over-automating the top of funnel.", kind: "ai", a: "myth" },
];

// ---- Home / streak ---------------------------------------------------------

export const STREAK_DAYS = 12;

export type QueueItem = {
  when: string;
  title: string;
  tag: string;
  tagKind: "mint" | "coral" | "line";
  status: string;
  statusKind: "scheduled" | "idea" | "draft";
  action: "draft" | null;
};

export const UP_NEXT: QueueItem[] = [
  { when: "THU\n9:00", title: "SME: 3 myths in my field", tag: "Myth-buster", tagKind: "mint", status: "SCHEDULED", statusKind: "scheduled", action: null },
  { when: "FRI\n—", title: "Soft pitch: new offer", tag: "Quiet close", tagKind: "coral", status: "", statusKind: "draft", action: "draft" },
  { when: "MON\n9:00", title: "Client win story", tag: "Case study", tagKind: "line", status: "IDEA", statusKind: "idea", action: null },
];

// ---- Calendar --------------------------------------------------------------

export type CalCell = {
  label: string;
  today?: boolean;
  post?: {
    title: string;
    meta: string;
    kind: "posted" | "draft" | "scheduled" | "needs";
  };
};

export const CAL_WEEK: CalCell[] = [
  { label: "MON 13", post: { title: "Client win story", meta: "9:00 · POSTED", kind: "posted" } },
  { label: "TUE 14" },
  { label: "WED 15", post: { title: "POV: a hot take", meta: "DRAFT", kind: "draft" } },
  { label: "THU 16 · TODAY", today: true, post: { title: "SME: 3 myths in my field", meta: "9:00 · SCHEDULED", kind: "scheduled" } },
  { label: "FRI 17", post: { title: "Soft pitch: new offer", meta: "NEEDS DRAFT", kind: "needs" } },
];

// ---- Analytics -------------------------------------------------------------

export const POSTS_PER_WEEK = [40, 60, 80, 60, 100, 80, 80, 100]; // % of goal, W1–W8
export const REACH_BY_TYPE = [
  { label: "Case study", value: "13,440", pct: 96 },
  { label: "Authority hook", value: "11,480", pct: 82 },
  { label: "Myth-buster", value: "9,940", pct: 71 },
  { label: "Soft pitch", value: "7,560", pct: 54 },
  { label: "Quick tip", value: "5,320", pct: 38 },
];

// Consistency heatmap opacities (Home = 30 cells, Analytics = 50 cells).
const HEAT = [1, 0.75, 1, 0.45, 0.15, 1, 1, 0.75, 1, 0.45];
export const HOME_HEAT: number[] = Array.from({ length: 30 }, (_, i) => HEAT[i % HEAT.length]);
export const ANALYTICS_HEAT: number[] = Array.from({ length: 50 }, (_, i) => {
  const base = [1, 0.72, 1, 0.4, 0.16];
  return base[i % base.length];
});

// ---- Library ---------------------------------------------------------------

export type LibraryPost = {
  tag: string;
  tagKind: "line" | "mint" | "coral";
  status: "POSTED" | "DRAFT" | "SCHEDULED";
  body: string;
  views: string;
};

export const LIBRARY: LibraryPost[] = [
  { tag: "Case study", tagKind: "line", status: "POSTED", body: "Client came to me with a stalled pipeline. Here’s exactly how we rebuilt it in 6 weeks…", views: "13,440 views" },
  { tag: "Authority hook", tagKind: "mint", status: "POSTED", body: "After 200+ deals, here’s the one thing I’d tell my younger self about selling…", views: "11,480 views" },
  { tag: "Myth-buster", tagKind: "mint", status: "POSTED", body: "3 myths about my field that are quietly costing you deals. Myth #1…", views: "9,940 views" },
  { tag: "Quiet close", tagKind: "coral", status: "DRAFT", body: "Soft pitch: a new offer for teams who want to fix this fast…", views: "— views" },
  { tag: "Quick tip", tagKind: "line", status: "POSTED", body: "A 30-second reframe that makes your outreach 2x more likely to get a reply…", views: "5,320 views" },
  { tag: "POV", tagKind: "line", status: "SCHEDULED", body: "Unpopular opinion: consistency beats brilliance on LinkedIn. Here’s why…", views: "— views" },
];
