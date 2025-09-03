'use client';
import * as React from 'react';
import type { CommunityBot } from '../types/bot-community';

const MOCK: CommunityBot[] = [
  { id:'c_ema_1', name:'EMA Cross L1 (Shared)', strategyId:'ema_crossover_pro', strategyLabel:'EMA Crossover Pro', author:{id:'u1',name:'TraderJoe'}, tags:['Momentum','Scalping'], equityCurve:[1,1.03,1.01,1.08,1.12], roiPct:12.4, winratePct:52.3, maxDrawdownPct:7.2, trades:210, likes:23, downloads:71, updatedAtISO: new Date().toISOString() },
  { id:'c_rsi_1', name:'RSI Breakout Clean', strategyId:'rsi_breakout', strategyLabel:'RSI Breakout', author:{id:'u2',name:'AlphaKat'}, tags:['Swing'], equityCurve:[1,0.98,1.02,1.07,1.16], roiPct:16.9, winratePct:49.1, maxDrawdownPct:6.0, trades:134, likes:41, downloads:112, updatedAtISO: new Date().toISOString() },
  { id:'c_psar_1', name:'PSAR Flip Trendy', strategyId:'psar_flip_trend', strategyLabel:'PSAR Flip Trend', author:{id:'u3',name:'QuantFox'}, tags:['Experimental'], equityCurve:[1,1.01,1.0,1.05,1.09], roiPct:9.2, winratePct:46.0, maxDrawdownPct:8.4, trades:90, likes:8, downloads:19, updatedAtISO: new Date().toISOString() },
];

export function useCommunityBots() {
  const [bots, setBots] = React.useState<CommunityBot[]>([]);
  React.useEffect(() => setBots(MOCK), []);
  return { bots, setBots };
}