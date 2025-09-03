export type WizardStatus = {
  step1_marketType: boolean,
  step2_pairs: boolean,
  step3_strategy: boolean,
  step4_advanced: boolean,
  step5_risk: boolean,
  step6_timeframe: boolean,
  step7_backtest: boolean,
  step8_results: boolean,
};

export function getWizardStatus(): WizardStatus {
  const ls = (k: string) => (typeof window !== "undefined" ? localStorage.getItem(k) : null);

  return {
    // Step 1: Market Type picked ('spot' or 'perp')
    step1_marketType: ["spot","perp"].includes(ls("bf_market_type") || ""),

    // Step 2: At least one pair saved (JSON array length > 0)
    step2_pairs: (() => {
      try { const arr = JSON.parse(ls("bf_pairs") || "[]"); return Array.isArray(arr) && arr.length > 0; } catch { return false; }
    })(),

    // Step 3: Strategy key saved
    step3_strategy: !!ls("bf_selected_strategy"),

    // Step 4: Advanced Settings saved
    // Consider complete if user clicked "Save/Continue" OR there is at least one active rule OR any indicator setting deviates from default
    step4_advanced: ls("bf_step4_complete") === "true"
      || (() => { try { const rules = JSON.parse(ls("bf_active_rules") || "[]"); return Array.isArray(rules) && rules.length > 0; } catch { return false; } })()
      || ls("bf_indicator_overrides") === "true",

    // Step 5: Risk management saved (explicit flag when user clicks Continue)
    step5_risk: ls("bf_step5_complete") === "true",

    // Step 6: Timeframe saved (must have tf + lookback)
    step6_timeframe: (() => {
      try { const tf = JSON.parse(ls("bf_timeframe") || "{}"); return !!tf?.interval && !!tf?.lookback; } catch { return false; }
    })(),

    // Step 7: Backtest ran at least once
    step7_backtest: ls("bf_backtest_ran") === "true",

    // Step 8: Results saved/exported (explicit flag)
    step8_results: ls("bf_step8_complete") === "true",
  };
}

// Optional helper to set flags when user clicks "Continue/Save"
export function markStepComplete(stepKey: keyof WizardStatus) {
  if (typeof window !== "undefined") {
    const map: Record<string,string> = {
      step4_advanced: "bf_step4_complete",
      step5_risk: "bf_step5_complete",
      step7_backtest: "bf_backtest_ran",
      step8_results: "bf_step8_complete",
    };
    const k = map[stepKey];
    if (k) localStorage.setItem(k, "true");
  }
}