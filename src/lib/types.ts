export interface Overview {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgLatency: number;
  p50Latency: number;
  p95Latency: number;
  activeDays: number;
  firstAt: string | null;
  lastAt: string | null;
  avgTokens: number;
  avgQuestionLen: number;
  avgAnswerLen: number;
  browserRequests: number;
}

export interface DayPoint {
  day: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgLatency: number;
}

export interface BreakdownItem {
  label: string;
  requests: number;
  totalTokens: number;
}

export interface HeatCell {
  dow: number;
  hour: number;
  requests: number;
}

export interface Account {
  createdAt: number | null;
  lastSeen: number | null;
  devices: number;
  subStatus: string | null;
  currentPeriodEnd: number | null;
  verifiedAt: number | null;
}
