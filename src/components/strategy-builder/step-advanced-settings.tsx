import { Strategy, IndicatorConfig, UserTier } from '@/types/botforge';
import { markStepComplete } from '@/lib/strategyWizard/status';
import { getTierAccess } from '@/lib/tier-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, ChevronDown, Settings, TrendingUp, BarChart3, Target, AlertTriangle, Search, Plus, X, Filter, RotateCcw, Zap } from 'lucide-react';
import { useState, useEffect, useLayoutEffect } from 'react';
import rsiMeta from '@/indicators/rsi/meta.json';

interface StepAdvancedSettingsProps {
  strategy: Strategy | null;
  filterIndicators: IndicatorConfig[];
  onUpdateFilters: (filters: IndicatorConfig[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  userTier: UserTier;
}

interface EntryCondition {
  id: string;
  family: string; // Track which family this rule belongs to
  operator: string;
  leftOperand: string;
  rightOperand: string;
  enabled: boolean;
}

interface FamilyTileState {
  [family: string]: boolean; // Track which family tiles are open/closed
}

// Family-based default presets - ONE rule per family
const FAMILY_PRESETS: { [family: string]: {label: string, lhs: string, op: string, rhs: string} } = {
  ema: { label: "Bullish Cross", lhs: "EMA Fast", op: "crosses_above", rhs: "EMA Slow" },
  sma: { label: "Price > SMA", lhs: "Price", op: "is_above", rhs: "SMA" },
  ma: { label: "Price > MA", lhs: "Price", op: "is_above", rhs: "MA" },
  rsi: { label: "RSI > 50", lhs: "RSI", op: "is_above", rhs: "50" },
  macd: { label: "Bullish", lhs: "MACD Line", op: "crosses_above", rhs: "MACD Signal" },
  stochastic: { label: "K > D", lhs: "%K", op: "crosses_above", rhs: "%D" },
  bollinger: { label: "Lower Bounce", lhs: "Price", op: "crosses_above", rhs: "BB Lower" },
  breadth: { label: "Breadth Bullish", lhs: "Breadth OK", op: "is_above", rhs: "50" }
};

export function StepAdvancedSettings({ 
  strategy, 
  filterIndicators, 
  onUpdateFilters, 
  onNext, 
  onPrevious,
  userTier 
}: StepAdvancedSettingsProps) {
  // Hydration gate state
  const [isHydrated, setIsHydrated] = useState(false);
  const [hydrationData, setHydrationData] = useState<any>(null);
  
  const [isAdvancedStrategyOpen, setIsAdvancedStrategyOpen] = useState(false);
  const [isAdvancedExitOpen, setIsAdvancedExitOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Entry conditions - family-based approach  
  const [entryConditions, setEntryConditions] = useState<EntryCondition[]>([]);
  const [entryLogic, setEntryLogic] = useState('all_true'); // 'all_true' or 'any_true'
  const [entryDirection, setEntryDirection] = useState('both'); // 'long', 'short', 'both'
  const [entryInverse, setEntryInverse] = useState(false);
  const [familyTileStates, setFamilyTileStates] = useState<FamilyTileState>({});
  
  // Strategy settings
  const [strategySettings, setStrategySettings] = useState({
    emaFast: 20,
    emaSlow: 50,
    rsiLength: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    cciLength: 20,
    atrLength: 14,
    bbPeriod: 20,
    // Advanced strategy settings
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    rsiSource: 'close',
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  });

  // Filters
  const [filtersSettings, setFiltersSettings] = useState({
    htfFilter: false,
    htfTimeframe: '1d',
    htfUseBtc: true,
    volumeFilter: false,
    volumeThreshold: 1.5,
    atrFilter: false,
    atrThreshold: 1.0
  });

  const [exitSettings, setExitSettings] = useState({
    stopLoss: 5.0,
    takeProfit: 10.0,
    // Multi-TP settings
    multiTpEnabled: false,
    tp1: 5.0,
    tp1Allocation: 33,
    tp2: 10.0,
    tp2Allocation: 33,
    tp3: 15.0,
    tp3Allocation: 34,
    tp1TrailingEnabled: false,
    tp2TrailingEnabled: false,
    tp3TrailingEnabled: false,
    // Break-even settings
    breakEvenEnabled: false,
    breakEvenTrigger: 2.0,
    breakEvenOffset: 0.1,
    // Trailing settings
    trailingType: 'none',
    trailingPercent: 2.0,
    trailingAtr: 1.5,
    // ATR stop loss
    atrStopEnabled: false,
    atrMultiplier: 2.0,
    // Time-based exit
    timeExitType: 'none',
    timeExitCandles: 24,
    // Exit priority
    exitPriority: 'tp_first'
  });

  // Default settings for reset functions
  const defaultStrategySettings = {
    emaFast: 20,
    emaSlow: 50,
    rsiLength: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    cciLength: 20,
    atrLength: 14,
    bbPeriod: 20,
    maType: 'EMA',
    rsiOverbought: 70,
    rsiOversold: 30,
    reentryBars: 1,
    confirmBars: 1,
    oneTradePerSession: false
  };

  const defaultFiltersSettings = {
    htfFilter: false,
    htfTimeframe: '1d',
    htfUseBtc: true,
    volumeFilter: false,
    volumeThreshold: 1.5,
    atrFilter: false,
    atrThreshold: 1.0
  };

  const defaultExitSettings = {
    stopLoss: 5.0,
    takeProfit: 10.0,
    multiTpEnabled: false,
    tp1: 5.0,
    tp1Allocation: 33,
    tp2: 10.0,
    tp2Allocation: 33,
    tp3: 15.0,
    tp3Allocation: 34,
    tp1TrailingEnabled: false,
    tp2TrailingEnabled: false,
    tp3TrailingEnabled: false,
    breakEvenEnabled: false,
    breakEvenTrigger: 2.0,
    breakEvenOffset: 0.1,
    trailingType: 'none',
    trailingPercent: 2.0,
    trailingAtr: 1.5,
    atrStopEnabled: false,
    atrMultiplier: 2.0,
    timeExitType: 'none',
    timeExitCandles: 24,
    exitPriority: 'tp_first'
  };

  // Global config state
  const [BF_CONFIG, setBF_CONFIG] = useState<any>(null);

  // Load the JSON config and builder state to pre-fill parameters
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/botforge_combined_config.json');
        const config = await response.json();
        setBF_CONFIG(config);
        (window as any).BF_CONFIG = config;
      } catch (error) {
        console.error('Failed to load BF config:', error);
      }
    };
    loadConfig();
  }, []);

  // Hydration gate - block until RSI data loaded and form filled
  useLayoutEffect(() => {
    const hydrateFromURL = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const indicator = urlParams.get('indicator');
        const presetId = (urlParams.get('preset') || '').trim();
        
        if (indicator !== 'rsi') {
          setIsHydrated(true);
          return;
        }

        console.log('Hydrating from URL:', { indicator, presetId });
        console.log('RSI meta:', rsiMeta);

        // Build base params from meta defaults
        const baseParams = {
          length: rsiMeta.params.length.default,
          source: rsiMeta.params.source.default,
          obLevel: rsiMeta.params.obLevel.default,
          osLevel: rsiMeta.params.osLevel.default,
        };

        let finalParams = { ...baseParams };
        let rules: any[] = [];
        let riskPrefills: any = {};

        // If preset, overlay preset data
        if (presetId) {
          const preset = (rsiMeta as any).presets.find((p: any) => p.id === presetId);
          if (preset) {
            if (preset.seedParams?.rsi) {
              finalParams = { ...finalParams, ...preset.seedParams.rsi };
            }
            rules = preset.rules?.rules || [];
            riskPrefills = preset.riskDefaults || {};
          }
        } else {
          riskPrefills = (rsiMeta as any).riskTemplates || {};
        }

        console.log('Final params:', finalParams);
        console.log('Rules:', rules);
        console.log('Risk prefills:', riskPrefills);

        // Store hydration data
        setHydrationData({ finalParams, rules, riskPrefills });

        // Apply indicator settings immediately
        setStrategySettings(prev => ({
          ...prev,
          rsiLength: finalParams.length,
          rsiOverbought: finalParams.obLevel,
          rsiOversold: finalParams.osLevel,
          rsiSource: finalParams.source,
        }));

        // Map and apply rules
        if (rules.length > 0) {
          const mapOp = (op: string) => {
            if (op === '>' || op === '>=') return 'is_above';
            if (op === '<' || op === '<=') return 'is_below';
            if (op === 'crosses_above' || op === 'crosses_below') return op;
            return 'is_above';
          };
          
          const nearestRSI = (n: number) => {
            const bands = [30, 50, 70];
            let best = 30, diff = Infinity;
            for (const b of bands) { 
              const d = Math.abs(b - n); 
              if (d < diff) { diff = d; best = b; }
            }
            return String(best);
          };
          
          const toFamily = (left: string, right: any) => {
            if (String(left).includes('rsi')) return 'rsi';
            if (String(right).includes('ema')) return 'ema';
            if (String(right).includes('sma')) return 'sma';
            return 'rsi';
          };
          
          const toLeftOperand = (family: string) => (family === 'rsi' ? 'RSI' : 'Price');
          const toRightOperand = (family: string, right: any) => {
            if (family === 'rsi') {
              if (Array.isArray(right)) return nearestRSI(Number(right[0] ?? 50));
              if (typeof right === 'number') return nearestRSI(right);
              return '50';
            }
            if (family === 'ema') return 'EMA Slow';
            if (family === 'sma') return 'SMA';
            return '50';
          };

          const mapped = rules.map((r: any, idx: number) => {
            const family = toFamily(r.left, r.right);
            const operator = r.op === 'within' ? 'is_above' : mapOp(r.op);
            const right = r.op === 'within' && Array.isArray(r.right) ? r.right[0] : r.right;
            return {
              id: String(Date.now() + idx),
              family,
              operator,
              leftOperand: toLeftOperand(family),
              rightOperand: toRightOperand(family, right),
              enabled: true,
            } as EntryCondition;
          });
          
          setEntryConditions(mapped);
          setEntryLogic('all_true');
        }

        // Apply risk settings (values only, toggles OFF)
        const applyRiskParams = (source: any) => {
          if (!source) return;
          if (source.atrStop?.params) {
            const p = source.atrStop.params;
            setStrategySettings(prev => ({ ...prev, atrLength: p.atrLength ?? prev.atrLength }));
            setExitSettings(prev => ({ ...prev, atrMultiplier: p.mult ?? prev.atrMultiplier, atrStopEnabled: false }));
          }
          if (source.trailingTP?.params) {
            const p = source.trailingTP.params;
            setExitSettings(prev => ({ ...prev, trailingPercent: (typeof p.trailPct === 'number' ? p.trailPct * 100 : prev.trailingPercent), trailingType: 'none' }));
          }
          if (source.breakeven?.params) {
            const p = source.breakeven.params;
            setExitSettings(prev => ({ ...prev, breakEvenTrigger: p.activationR ?? prev.breakEvenTrigger, breakEvenEnabled: false }));
          }
          if (source.timeStop?.params) {
            const p = source.timeStop.params;
            setExitSettings(prev => ({ ...prev, timeExitCandles: p.bars ?? prev.timeExitCandles, timeExitType: 'none' }));
          }
        };

        applyRiskParams(riskPrefills);

        // Hydration complete
        setIsHydrated(true);
      } catch (error) {
        console.error('Hydration failed:', error);
        setIsHydrated(true); // Fail gracefully
      }
    };

    hydrateFromURL();
  }, []);

  // Debug logs
  useEffect(() => {
    if (isHydrated && hydrationData) {
      console.log('Page4 hydrated with:', {
        length: strategySettings.rsiLength,
        source: strategySettings.rsiSource,
        obLevel: strategySettings.rsiOverbought,
        osLevel: strategySettings.rsiOversold,
        rules: entryConditions.length,
        hydrationData
      });
    }
  }, [isHydrated, hydrationData, strategySettings.rsiLength, strategySettings.rsiSource, strategySettings.rsiOverbought, strategySettings.rsiOversold, entryConditions.length]);


  // Get selected strategy key from localStorage with fallback
  const getSelectedStrategyKey = () => {
    return localStorage.getItem('bf_selected_strategy') || 'EMA Crossover Pro';
  };

  // Get strategy config and normalize strategy names
  const getStrategyConfig = (strategyKey: string) => {
    if (!BF_CONFIG?.strategies) return null;
    
    // Try exact match first
    if (BF_CONFIG.strategies[strategyKey]) {
      return BF_CONFIG.strategies[strategyKey];
    }
    
    // Try normalized keys
    const normalizedKey = strategyKey.replace(/\s+/g, ' ').trim();
    for (const [key, config] of Object.entries(BF_CONFIG.strategies)) {
      if (key.replace(/\s+/g, ' ').trim() === normalizedKey) {
        return config;
      }
    }
    
    return null;
  };

  // Get family operands from strategy config with robust fallbacks
  const getFamilyOperands = (strategyKey: string, family: string) => {
    const config = getStrategyConfig(strategyKey);

    const defaultsByFamily: Record<string, string[]> = {
      rsi: ["RSI", "30", "50", "70"],
      bollinger: ["Price", "BB Lower", "BB Upper"],
      macd: ["MACD Line", "MACD Signal", "Histogram", "0"],
      ema: ["Price", "EMA Fast", "EMA Slow", "EMA Slope", "0"],
      sma: ["Price", "SMA Fast", "SMA Slow", "SMA"],
      ma: ["Price", "MA Fast", "MA Slow", "MA"],
      stochastic: ["%K", "%D", "80", "20"],
      breadth: ["Breadth OK", "50", "%UpCoins"],
    };

    if (!config?.operands) return defaultsByFamily[family] || ["Price", "Value"];

    // Direct mapping (if config happens to provide it by family key)
    if ((config.operands as any)[family]) {
      return (config.operands as any)[family];
    }

    // Heuristically infer operands by scanning all operand arrays for family tokens
    const allOperandsArrays = Object.values(config.operands) as string[][];
    const tokensByFamily: Record<string, string[]> = {
      rsi: ["RSI"],
      bollinger: ["BB ", "Bollinger", "Upper", "Lower"],
      macd: ["MACD", "Signal", "Histogram"],
      ema: ["EMA"],
      sma: ["SMA"],
      ma: [" MA", "MA "],
      stochastic: ["%K", "%D", "Stochastic"],
      breadth: ["Breadth", "%UpCoins"],
    };

    const tokens = tokensByFamily[family] || [];
    const matched = new Set<string>();
    for (const arr of allOperandsArrays) {
      const hits = arr.some(item => tokens.some(t => item.includes(t)));
      if (hits) {
        for (const item of arr) matched.add(item);
      }
    }

    if (matched.size > 0) {
      const arr = Array.from(matched);
      if (family === 'rsi' && !arr.includes('50')) arr.push('50');
      return arr;
    }

    // Family-specific defaults
    if (defaultsByFamily[family]) return defaultsByFamily[family];

    // Fallback to first available operands
    const firstOperands = (allOperandsArrays[0] || ["Price", "Value"]) as string[];
    return firstOperands;
  };

  // Get strategy families (indicators) from config
  const getStrategyFamilies = (strategyKey: string) => {
    const config = getStrategyConfig(strategyKey);
    if (!config) return [];
    
    // Use indicatorSettings if available, otherwise fallback to indicators
    return config.indicatorSettings || config.indicators || [];
  };

  // Get operators from global config
  const getAvailableOperators = () => {
    return BF_CONFIG?.global?.operators || [
      { value: 'crosses_above', label: 'Crosses Above', tooltip: 'Triggers when left-hand series moves from below to above right-hand series on bar close.' },
      { value: 'crosses_below', label: 'Crosses Below', tooltip: 'Triggers when left-hand series moves from above to below right-hand series on bar close.' },
      { value: 'is_above', label: 'Is Above', tooltip: 'True when left-hand value is greater than right-hand value.' },
      { value: 'is_below', label: 'Is Below', tooltip: 'True when left-hand value is less than right-hand value.' },
      { value: 'is_true', label: 'Is True', tooltip: 'Used for yes/no signals, e.g., MACD Histogram > 0 or Breadth_ok.' }
    ];
  };

  // Get rule cap from global config
  const getRuleCap = () => {
    return BF_CONFIG?.global?.ruleCap || 5;
  };

  // Seed defaults function
  const seedDefaults = () => {
    const strategyKey = getSelectedStrategyKey();
    const config = getStrategyConfig(strategyKey);
    
    if (config?.defaultSeeds && config.defaultSeeds.length > 0) {
      const defaultConditions = config.defaultSeeds.slice(0, getRuleCap()).map((seed: any, index: number) => ({
        id: (Date.now() + index).toString(),
        family: 'ema', // Default family, will be corrected based on operands
        operator: seed.operator || 'is_above',
        leftOperand: seed.leftOperand || 'EMA Fast',
        rightOperand: seed.rightOperand || 'EMA Slow',
        enabled: true
      }));
      setEntryConditions(defaultConditions);
    }
  };

  // Reset functions
  const resetToDefault = (section: string) => {
    switch (section) {
      case 'strategy':
        setStrategySettings(prev => ({
          ...prev,
          emaFast: defaultStrategySettings.emaFast,
          emaSlow: defaultStrategySettings.emaSlow,
          rsiLength: defaultStrategySettings.rsiLength,
          macdFast: defaultStrategySettings.macdFast,
          macdSlow: defaultStrategySettings.macdSlow,
          macdSignal: defaultStrategySettings.macdSignal,
          cciLength: defaultStrategySettings.cciLength,
          atrLength: defaultStrategySettings.atrLength,
          bbPeriod: defaultStrategySettings.bbPeriod
        }));
        break;
      case 'entry':
        setEntryConditions([]);
        setEntryLogic('all_true');
        setEntryDirection('both');
        setEntryInverse(false);
        setFamilyTileStates({});
        break;
      case 'strategyAdvanced':
        setStrategySettings(prev => ({
          ...prev,
          maType: defaultStrategySettings.maType,
          rsiOverbought: defaultStrategySettings.rsiOverbought,
          rsiOversold: defaultStrategySettings.rsiOversold,
          reentryBars: defaultStrategySettings.reentryBars,
          confirmBars: defaultStrategySettings.confirmBars,
          oneTradePerSession: defaultStrategySettings.oneTradePerSession
        }));
        break;
      case 'filters':
        setFiltersSettings(defaultFiltersSettings);
        break;
      case 'exit':
        setExitSettings(prev => ({
          ...prev,
          stopLoss: defaultExitSettings.stopLoss,
          takeProfit: defaultExitSettings.takeProfit
        }));
        break;
      case 'exitAdvanced':
        setExitSettings(defaultExitSettings);
        break;
    }
  };

  // Family tile toggle - automatically adds default preset rules
  const toggleFamilyTile = (family: string) => {
    const isCurrentlyOpen = familyTileStates[family];
    
    if (isCurrentlyOpen) {
      // Close tile and remove all rules for this family
      setFamilyTileStates(prev => ({
        ...prev,
        [family]: false
      }));
      setEntryConditions(prev => prev.filter(condition => condition.family !== family));
    } else {
      // Open tile and add default preset rules for this family
      setFamilyTileStates(prev => ({
        ...prev,
        [family]: true
      }));
      
      // Add default preset for this family (ONE rule only)
      const preset = FAMILY_PRESETS[family];
      if (preset) {
        const strategyKey = getSelectedStrategyKey();
        const operands = getFamilyOperands(strategyKey, family);
        
        // Check if we're under rule cap
        if (entryConditions.length < getRuleCap()) {
          // Check if operands exist in strategy
          const lhsExists = operands.includes(preset.lhs);
          const rhsExists = operands.includes(preset.rhs) || !isNaN(Number(preset.rhs));
          
          if (lhsExists) {
            const newCondition: EntryCondition = {
              id: Date.now().toString(),
              family,
              operator: preset.op,
              leftOperand: preset.lhs,
              rightOperand: rhsExists ? preset.rhs : (operands[1] || operands[0]),
              enabled: true
            };
            
            // Check for duplicates
            const isDuplicate = entryConditions.some(condition => 
              condition.family === family &&
              condition.operator === preset.op &&
              condition.leftOperand === preset.lhs &&
              condition.rightOperand === newCondition.rightOperand
            );
            
            if (!isDuplicate) {
              setEntryConditions(prev => [...prev, newCondition]);
            }
          }
        }
      }
    }
  };


  // Remove rule
  const removeRule = (id: string) => {
    setEntryConditions(prev => prev.filter(condition => condition.id !== id));
  };

  // Update rule
  const updateRule = (id: string, field: string, value: any) => {
    setEntryConditions(prev => prev.map(condition => 
      condition.id === id ? { ...condition, [field]: value } : condition
    ));
  };

  // Get active rule count for family
  const getActiveRuleCount = (family: string) => {
    return entryConditions.filter(condition => condition.family === family).length;
  };

  // Get preview text for rule
  const getPreviewText = (condition: EntryCondition) => {
    const operators = getAvailableOperators();
    const operatorText = operators.find(op => op.value === condition.operator)?.label || condition.operator;
    if (condition.operator === 'is_true') {
      return `${condition.leftOperand} ${operatorText.toLowerCase()}`;
    }
    return `${condition.leftOperand} ${operatorText.toLowerCase()} ${condition.rightOperand}`;
  };

  // Generate strategy summary text
  const generateSummaryText = (direction: 'long' | 'short') => {
    if (entryConditions.length === 0) return '';

    const operatorMap: Record<string, { normal: string, inverse: string }> = {
      'crosses_above': { normal: 'crosses above', inverse: 'crosses below' },
      'crosses_below': { normal: 'crosses below', inverse: 'crosses above' },
      'is_above': { normal: 'is above', inverse: 'is below' },
      'is_below': { normal: 'is below', inverse: 'is above' },
      'is_true': { normal: 'is true', inverse: 'is false' }
    };

    const connector = entryLogic === 'all_true' ? ' and ' : ' or ';
    
    const ruleTexts = entryConditions.map(condition => {
      const operatorConfig = operatorMap[condition.operator];
      let operatorText = operatorConfig?.normal || condition.operator;
      
      // Apply inverse logic for shorts when inverse is enabled
      if (direction === 'short' && entryInverse) {
        operatorText = operatorConfig?.inverse || condition.operator;
      }
      
      if (condition.operator === 'is_true') {
        return `${condition.leftOperand} ${operatorText}`;
      }
      return `${condition.leftOperand} ${operatorText} ${condition.rightOperand}`;
    });

    // Handle the case where direction is both but inverse is off
    if (direction === 'short' && entryDirection === 'both' && !entryInverse) {
      // If there are no short-specific rules and inverse is off, show disabled
      return 'conditions disabled (enable inverse signals to allow short entries)';
    }

    return ruleTexts.join(connector) + '.';
  };

  const updateStrategySetting = (key: string, value: any) => {
    setStrategySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateFiltersSetting = (key: string, value: any) => {
    setFiltersSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateExitSetting = (key: string, value: any) => {
    setExitSettings(prev => ({ ...prev, [key]: value }));
  };

  // Conflict detection
  const hasConflicts = () => {
    const conflicts = [];
    if (exitSettings.atrStopEnabled && exitSettings.stopLoss > 0) {
      conflicts.push("ATR Stop conflicts with Fixed Stop. Disable one to continue.");
    }
    if (exitSettings.multiTpEnabled && exitSettings.trailingType !== 'none') {
      conflicts.push("Multi-TP conflicts with Trailing Stop. Choose one approach.");
    }
    return conflicts;
  };

  const conflicts = hasConflicts();

  // Debug readout (temporary)
  const urlParams = new URLSearchParams(window.location.search);
  const debugLength = strategySettings.rsiLength;
  const debugSource = strategySettings.rsiSource;
  const debugOB = strategySettings.rsiOverbought;
  const debugOS = strategySettings.rsiOversold;

  const strategyKey = getSelectedStrategyKey();
  const families = getStrategyFamilies(strategyKey);
  const operators = getAvailableOperators();

  // Hydration gate - show loading until ready
  if (!isHydrated) {
    return (
      <TooltipProvider>
        <div className="space-y-6">
          <header className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Advanced Settings</h2>
            </div>
            <p className="text-muted-foreground">Loading RSI configuration...</p>
          </header>
          <Card className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
            </div>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  if (!strategyKey) {
    return (
      <TooltipProvider>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Please select a strategy first.</p>
        </Card>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <header className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Advanced Settings</h2>
          </div>
          <p className="text-muted-foreground">
            Configure strategy parameters, entry logic, and exit controls for your bot
          </p>
        </header>

        {/* Debug readout (temporary) */}
        <div className="p-3 bg-muted/50 rounded text-sm">
          <strong>Incoming:</strong> length={debugLength}, source={debugSource}, obLevel={debugOB}, osLevel={debugOS}
        </div>

        <div className="space-y-6">
          {/* 1. Indicator Settings - One panel per family */}
          <Card className="frosted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Indicator Settings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetToDefault('strategy')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Return to Default
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Core indicator configurations for the {strategyKey.replace(/_/g, ' ')} strategy
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {families.map((family, index) => (
                <div key={`${family}-${index}`} className="space-y-4 p-4 border rounded-lg bg-background/20">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {family.toUpperCase()} Settings
                  </h3>
                  
                  {/* Family-specific settings */}
                  {family === 'ema' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="font-medium">EMA Fast Length</Label>
                        <Input
                          type="number"
                          value={strategySettings.emaFast}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, emaFast: Number(e.target.value) }))}
                          min="5"
                          max="100"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">EMA Slow Length</Label>
                        <Input
                          type="number"
                          value={strategySettings.emaSlow}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, emaSlow: Number(e.target.value) }))}
                          min="10"
                          max="200"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                  
                  {family === 'rsi' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <Label className="font-medium">RSI Length</Label>
                          <Input
                            type="number"
                            value={strategySettings.rsiLength}
                            onChange={(e) => setStrategySettings(prev => ({ ...prev, rsiLength: Number(e.target.value) }))}
                            min="5"
                            max="50"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-medium">Overbought</Label>
                          <Input
                            type="number"
                            value={strategySettings.rsiOverbought}
                            onChange={(e) => setStrategySettings(prev => ({ ...prev, rsiOverbought: Number(e.target.value) }))}
                            min="60"
                            max="90"
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="font-medium">Oversold</Label>
                          <Input
                            type="number"
                            value={strategySettings.rsiOversold}
                            onChange={(e) => setStrategySettings(prev => ({ ...prev, rsiOversold: Number(e.target.value) }))}
                            min="10"
                            max="40"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-3 mt-6">
                        <Label className="font-medium">Source</Label>
                        <Select value={strategySettings.rsiSource as any} onValueChange={(val) => setStrategySettings(prev => ({ ...prev, rsiSource: val }))}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="close">Close</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {family === 'macd' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <Label className="font-medium">Fast Period</Label>
                        <Input
                          type="number"
                          value={strategySettings.macdFast}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, macdFast: Number(e.target.value) }))}
                          min="5"
                          max="30"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Slow Period</Label>
                        <Input
                          type="number"
                          value={strategySettings.macdSlow}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, macdSlow: Number(e.target.value) }))}
                          min="15"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Signal Period</Label>
                        <Input
                          type="number"
                          value={strategySettings.macdSignal}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, macdSignal: Number(e.target.value) }))}
                          min="5"
                          max="20"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                  
                  {family === 'bollinger' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="font-medium">Bollinger Period</Label>
                        <Input
                          type="number"
                          value={strategySettings.bbPeriod}
                          onChange={(e) => setStrategySettings(prev => ({ ...prev, bbPeriod: Number(e.target.value) }))}
                          min="10"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Standard Deviation</Label>
                        <Input
                          type="number"
                          value={2}
                          min="1"
                          max="3"
                          step="0.1"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                  
                  {family === 'breadth' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="font-medium">Breadth Period</Label>
                        <Input
                          type="number"
                          value={20}
                          min="5"
                          max="50"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-medium">Threshold</Label>
                        <Input
                          type="number"
                          value={50}
                          min="30"
                          max="70"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* ATR Settings - only show when ATR stop is enabled */}
              {exitSettings.atrStopEnabled && (
                <div className="space-y-4 p-4 border rounded-lg bg-background/20">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    ATR Settings
                  </h3>
                  <div className="space-y-3">
                    <Label className="font-medium">ATR Length</Label>
                    <Input
                      type="number"
                      value={strategySettings.atrLength}
                      onChange={(e) => setStrategySettings(prev => ({ ...prev, atrLength: Number(e.target.value) }))}
                      min="5"
                      max="50"
                      className="bg-background/50"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Entry Conditions - Family-based tiles */}
          <Card className="frosted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-primary" />
                  Entry Conditions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={seedDefaults}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Seed defaults
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetToDefault('entry')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Return to Default
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click family tiles to configure entry rules. Each family can have multiple rules.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
          {/* Family Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {families.map(family => {
                  const isOpen = familyTileStates[family];
                  const activeCount = getActiveRuleCount(family);
                  
                  return (
                    <div key={family} className="space-y-2">
                      <button
                        onClick={() => toggleFamilyTile(family)}
                        className={`w-full p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          isOpen 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border hover:border-primary hover:bg-primary/5 text-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{family.toUpperCase()}</span>
                          {activeCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {activeCount}
                            </Badge>
                          )}
                        </div>
                      </button>
                      
                      {/* Family content - shows when tile is selected */}
                      {isOpen && (
                        <div className="p-2 border rounded bg-background/30">
                          <div className="text-xs text-muted-foreground">
                            {activeCount > 0 ? `${activeCount} rules active` : 'Click to add default rules'}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Entry Condition Rules - Left to Right Layout */}
              {entryConditions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Active Rules</h4>
                  <div className="space-y-4">
                    {entryConditions.map((condition, index) => (
                      <div key={condition.id} className="border rounded-lg p-4 bg-background/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">Rule {index + 1}</h4>
                            <Badge variant="outline" className="text-xs">
                              {condition.family.toUpperCase()}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(condition.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className={`grid gap-4 ${condition.operator === 'is_true' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Left Operand</Label>
                            <Select
                              value={condition.leftOperand}
                              onValueChange={(value) => updateRule(condition.id, 'leftOperand', value)}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {getFamilyOperands(strategyKey, condition.family).map(operand => (
                                  <SelectItem key={operand} value={operand}>{operand}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Operator</Label>
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => updateRule(condition.id, 'operator', value)}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.value} value={op.value}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span>{op.label}</span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">{op.tooltip}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {condition.operator !== 'is_true' && (
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Right Operand</Label>
                              <Select
                                value={condition.rightOperand}
                                onValueChange={(value) => updateRule(condition.id, 'rightOperand', value)}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getFamilyOperands(strategyKey, condition.family).map(operand => (
                                    <SelectItem key={operand} value={operand}>{operand}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                          Preview: <em>{getPreviewText(condition)}</em>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {entryConditions.length >= getRuleCap() && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Maximum {getRuleCap()} rules reached. Remove a rule to add more.
                  </AlertDescription>
                </Alert>
              )}

              {/* Logic Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Entry Logic</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Choose how rules are combined. AND = every rule must be true. OR = any single rule can be true.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={entryLogic} onValueChange={setEntryLogic}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_true">All conditions (AND)</SelectItem>
                      <SelectItem value="any_true">Any condition (OR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Trade Direction</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Which side the bot is allowed to trade. 'Both directions' allows longs and shorts.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={entryDirection} onValueChange={setEntryDirection}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="long">Long only</SelectItem>
                      <SelectItem value="short">Short only</SelectItem>
                      <SelectItem value="both">Both directions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Enable inverse signals</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">If on, the opposite of your entry rules can trigger the opposite side. Turn off to only trade your primary rules.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inverse-logic"
                      checked={entryInverse}
                      onCheckedChange={setEntryInverse}
                    />
                    <Label htmlFor="inverse-logic" className="text-sm text-muted-foreground">
                      Also allow the opposite of your rules (e.g., if RSI &gt; 50 goes long, RSI &lt; 50 can go short).
                    </Label>
                  </div>
                </div>
              </div>

              {/* Strategy Summary */}
              <div className="pt-6 border-t">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="w-5 h-5 text-primary" />
                      Strategy Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {entryConditions.length === 0 ? (
                      <p className="text-muted-foreground italic">
                        No entry rules yet. Add a condition to see your strategy summary.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {entryDirection === 'both' ? (
                          <>
                            <div>
                              <span className="font-medium text-emerald-600">Enter LONG</span> when {generateSummaryText('long')}
                            </div>
                            <div>
                              <span className="font-medium text-red-600">Enter SHORT</span> when {generateSummaryText('short')}
                            </div>
                          </>
                        ) : entryDirection === 'long' ? (
                          <>
                            <div>
                              <span className="font-medium text-emerald-600">Enter LONG</span> when {generateSummaryText('long')}
                            </div>
                            <div className="text-muted-foreground">
                              Short entries disabled.
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="font-medium text-red-600">Enter SHORT</span> when {generateSummaryText('short')}
                            </div>
                            <div className="text-muted-foreground">
                              Long entries disabled.
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* 3. Advanced Strategy Settings */}
          <Collapsible open={isAdvancedStrategyOpen} onOpenChange={setIsAdvancedStrategyOpen}>
            <Card className="frosted">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="w-5 h-5 text-primary" />
                      Advanced Strategy Settings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefault('strategyAdvanced');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Return to Default
                      </Button>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedStrategyOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Strategy-level refinements and confirmation rules
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Confirmation Bars</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Require conditions to remain true for N candles before entry.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.confirmBars}
                        onChange={(e) => updateStrategySetting('confirmBars', Number(e.target.value))}
                        min="1"
                        max="10"
                        className="bg-background/50"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">Re-entry Cooldown (bars)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Set minimum bars between trades, or restrict to one trade per session.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={strategySettings.reentryBars}
                        onChange={(e) => updateStrategySetting('reentryBars', Number(e.target.value))}
                        min="0"
                        max="100"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="one-trade-per-session"
                      checked={strategySettings.oneTradePerSession}
                      onCheckedChange={(checked) => updateStrategySetting('oneTradePerSession', checked)}
                    />
                    <Label htmlFor="one-trade-per-session" className="text-sm">
                      Limit to one trade per session
                    </Label>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 4. Filters */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <Card className="frosted">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Filter className="w-5 h-5 text-primary" />
                      Filters
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefault('filters');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Return to Default
                      </Button>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Optional gates that filter trades without replacing entry rules
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Higher Timeframe Trend Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="htf-filter"
                        checked={filtersSettings.htfFilter}
                        onCheckedChange={(checked) => updateFiltersSetting('htfFilter', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="htf-filter" className="font-medium">Higher Timeframe Trend Filter</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Only trade if the higher timeframe trend agrees. Example: only take longs if BTC is above its daily EMA 200.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {filtersSettings.htfFilter && (
                      <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="htf-use-btc"
                            checked={filtersSettings.htfUseBtc}
                            onCheckedChange={(checked) => updateFiltersSetting('htfUseBtc', checked)}
                          />
                          <Label htmlFor="htf-use-btc" className="text-sm">
                            Use BTC/USDT daily EMA 200 (default)
                          </Label>
                        </div>
                        
                        {!filtersSettings.htfUseBtc && (
                          <div className="text-sm text-muted-foreground">
                            Will use pair's own higher timeframe EMA instead of BTC
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Volume Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="volume-filter"
                        checked={filtersSettings.volumeFilter}
                        onCheckedChange={(checked) => updateFiltersSetting('volumeFilter', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="volume-filter" className="font-medium">Volume Filter</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Only allow trades when volume is above its moving average.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {filtersSettings.volumeFilter && (
                      <div className="ml-6 border-l-2 border-muted pl-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Volume Multiplier</Label>
                          <Input
                            type="number"
                            value={filtersSettings.volumeThreshold}
                            onChange={(e) => updateFiltersSetting('volumeThreshold', Number(e.target.value))}
                            min="0.5"
                            max="5.0"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ATR Activity Filter */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="atr-filter"
                        checked={filtersSettings.atrFilter}
                        onCheckedChange={(checked) => updateFiltersSetting('atrFilter', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="atr-filter" className="font-medium">ATR Activity Filter</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Only allow trades when volatility (ATR) is above threshold.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {filtersSettings.atrFilter && (
                      <div className="ml-6 border-l-2 border-muted pl-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">ATR Threshold</Label>
                          <Input
                            type="number"
                            value={filtersSettings.atrThreshold}
                            onChange={(e) => updateFiltersSetting('atrThreshold', Number(e.target.value))}
                            min="0.1"
                            max="5.0"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* 5. Default Exit Settings */}
          <Card className="frosted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="w-5 h-5 text-primary" />
                  Default Exit Settings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetToDefault('exit')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Return to Default
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Basic stop loss and take profit levels for all trades
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Stop Loss %</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Exit if price moves against you by this %.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={exitSettings.stopLoss}
                    onChange={(e) => updateExitSetting('stopLoss', Number(e.target.value))}
                    min="0.1"
                    max="50"
                    step="0.1"
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Take Profit %</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Exit once profit target is reached.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="number"
                    value={exitSettings.takeProfit}
                    onChange={(e) => updateExitSetting('takeProfit', Number(e.target.value))}
                    min="0.1"
                    max="200"
                    step="0.1"
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Advanced Exit Settings */}
          <Collapsible open={isAdvancedExitOpen} onOpenChange={setIsAdvancedExitOpen}>
            <Card className="frosted">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Advanced Exit Settings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resetToDefault('exitAdvanced');
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Return to Default
                      </Button>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedExitOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-left">
                    Smart exit strategies including multi-TP, trailing stops, and time-based exits
                  </p>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  {/* Conflict Warnings */}
                  {conflicts.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {conflicts.map((conflict, index) => (
                            <div key={index}>{conflict}</div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Multi-TP Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="multi-tp"
                        checked={exitSettings.multiTpEnabled}
                        onCheckedChange={(checked) => updateExitSetting('multiTpEnabled', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="multi-tp" className="font-medium">Multi-Target Profit Taking</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Scale out at multiple targets and lock in profits step by step.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {exitSettings.multiTpEnabled && (
                      <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">TP1 (%) - Allocation: {exitSettings.tp1Allocation}%</Label>
                            <Input
                              type="number"
                              value={exitSettings.tp1}
                              onChange={(e) => updateExitSetting('tp1', Number(e.target.value))}
                              min="0.1"
                              max="100"
                              step="0.1"
                              className="bg-background/50"
                            />
                            <Slider
                              value={[exitSettings.tp1Allocation]}
                              onValueChange={([value]) => updateExitSetting('tp1Allocation', value)}
                              max={100}
                              min={10}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">TP2 (%) - Allocation: {exitSettings.tp2Allocation}%</Label>
                            <Input
                              type="number"
                              value={exitSettings.tp2}
                              onChange={(e) => updateExitSetting('tp2', Number(e.target.value))}
                              min="0.1"
                              max="200"
                              step="0.1"
                              className="bg-background/50"
                            />
                            <Slider
                              value={[exitSettings.tp2Allocation]}
                              onValueChange={([value]) => updateExitSetting('tp2Allocation', value)}
                              max={100}
                              min={10}
                              step={1}
                              className="w-full"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm">TP3 (%) - Allocation: {exitSettings.tp3Allocation}%</Label>
                            <Input
                              type="number"
                              value={exitSettings.tp3}
                              onChange={(e) => updateExitSetting('tp3', Number(e.target.value))}
                              min="0.1"
                              max="500"
                              step="0.1"
                              className="bg-background/50"
                            />
                            <Slider
                              value={[exitSettings.tp3Allocation]}
                              onValueChange={([value]) => updateExitSetting('tp3Allocation', value)}
                              max={100}
                              min={10}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Break-even Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="break-even"
                        checked={exitSettings.breakEvenEnabled}
                        onCheckedChange={(checked) => updateExitSetting('breakEvenEnabled', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="break-even" className="font-medium">Break-even Stop</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Move stop loss to entry price once trade reaches X% profit (optionally +offset).</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {exitSettings.breakEvenEnabled && (
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-l-2 border-muted pl-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Trigger at % Profit</Label>
                          <Input
                            type="number"
                            value={exitSettings.breakEvenTrigger}
                            onChange={(e) => updateExitSetting('breakEvenTrigger', Number(e.target.value))}
                            min="0.1"
                            max="20"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Offset %</Label>
                          <Input
                            type="number"
                            value={exitSettings.breakEvenOffset}
                            onChange={(e) => updateExitSetting('breakEvenOffset', Number(e.target.value))}
                            min="0"
                            max="5"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Trailing Stop Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Trailing Stop</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Follow the price as it moves in your favor. Options: fixed %, ATR-based, or hybrid.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={exitSettings.trailingType} onValueChange={(value) => updateExitSetting('trailingType', value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fixed">Fixed %</SelectItem>
                        <SelectItem value="atr">ATR-based</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>

                    {exitSettings.trailingType === 'fixed' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Trailing %</Label>
                        <Input
                          type="number"
                          value={exitSettings.trailingPercent}
                          onChange={(e) => updateExitSetting('trailingPercent', Number(e.target.value))}
                          min="0.1"
                          max="20"
                          step="0.1"
                          className="bg-background/50"
                        />
                      </div>
                    )}

                    {exitSettings.trailingType === 'atr' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">ATR Multiplier</Label>
                        <Input
                          type="number"
                          value={exitSettings.trailingAtr}
                          onChange={(e) => updateExitSetting('trailingAtr', Number(e.target.value))}
                          min="0.5"
                          max="10"
                          step="0.1"
                          className="bg-background/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* ATR Stop Loss */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="atr-stop"
                        checked={exitSettings.atrStopEnabled}
                        onCheckedChange={(checked) => updateExitSetting('atrStopEnabled', checked)}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="atr-stop" className="font-medium">ATR Stop Loss</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Set stop dynamically based on volatility (k × ATR). ATR length input appears above.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {exitSettings.atrStopEnabled && (
                      <div className="ml-6 border-l-2 border-muted pl-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">ATR Multiplier</Label>
                          <Input
                            type="number"
                            value={exitSettings.atrMultiplier}
                            onChange={(e) => updateExitSetting('atrMultiplier', Number(e.target.value))}
                            min="0.5"
                            max="10"
                            step="0.1"
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Time-based Exit */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Time-based Exit</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Exit trades after N candles, or at daily/weekly close.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={exitSettings.timeExitType} onValueChange={(value) => updateExitSetting('timeExitType', value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="candles">After N candles</SelectItem>
                        <SelectItem value="daily_close">At daily close</SelectItem>
                        <SelectItem value="weekly_close">At weekly close</SelectItem>
                      </SelectContent>
                    </Select>

                    {exitSettings.timeExitType === 'candles' && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Number of Candles</Label>
                        <Input
                          type="number"
                          value={exitSettings.timeExitCandles}
                          onChange={(e) => updateExitSetting('timeExitCandles', Number(e.target.value))}
                          min="1"
                          max="1000"
                          className="bg-background/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Exit Priority */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Exit Priority</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Decide which rule wins if multiple exits trigger together.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={exitSettings.exitPriority} onValueChange={(value) => updateExitSetting('exitPriority', value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tp_first">Take Profit First</SelectItem>
                        <SelectItem value="sl_first">Stop Loss First</SelectItem>
                        <SelectItem value="trailing_first">Trailing First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
            <Button onClick={() => {
              // Save step completion status
              markStepComplete('step4_advanced');
              // Save active rules to localStorage
              if (typeof window !== "undefined") {
                localStorage.setItem("bf_active_rules", JSON.stringify(entryConditions));
                if (entryConditions.length > 0 || Object.keys(strategySettings).length > 0 || Object.keys(exitSettings).length > 0) {
                  localStorage.setItem("bf_indicator_overrides", "true");
                }
              }
              onNext();
            }}>
              Next: Backtest
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
