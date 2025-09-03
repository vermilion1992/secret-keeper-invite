export type BotStatus = 'draft' | 'backtested' | 'ready_to_export';

export type BacktestVersion = {
  id: string;
  ranAtISO: string;                 // when backtest ran
  equityCurve: number[];            // normalized 0..1 (or raw; we normalize in sparkline)
  roiPct: number;
  winratePct: number;
  maxDrawdownPct: number;
  trades: number;
  sharpe?: number;
};

export type BotRecord = {
  id: string;
  name: string;
  strategyId: string;
  strategyLabel: string;
  status: BotStatus;
  tags?: string[];
  pinned?: boolean;
  notes?: string;
  latest?: BacktestVersion;         // latest backtest summary
  versions?: BacktestVersion[];     // optional history
};