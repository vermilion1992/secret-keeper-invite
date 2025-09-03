export type CommunityBot = {
  id: string;
  name: string;
  strategyId: string;
  strategyLabel: string;
  author: { id: string; name: string };
  tags?: string[];
  equityCurve?: number[];
  roiPct?: number;
  winratePct?: number;
  maxDrawdownPct?: number;
  trades?: number;
  likes?: number;
  downloads?: number;
  updatedAtISO: string;
};