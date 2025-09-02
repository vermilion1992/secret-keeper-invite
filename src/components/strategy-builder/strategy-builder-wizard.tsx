import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WizardNavigation } from './wizard-navigation';
import { StepMarketType } from './step-market-type';
import { StepPairTemplate } from './step-pair-template';
import { StepStrategy } from './step-strategy';
import { StepAdvancedSettings } from './step-advanced-settings';
import { StepRiskManagement } from './step-risk-management';
import { StepTimeframe } from './step-timeframe';
import { StepBacktest } from './step-backtest';
import { StepResults } from './step-results';
import { MarketType, PairTemplate, UserTier, WizardStep, Strategy, IndicatorConfig, RiskManagement, BacktestParams } from '@/types/botforge';

interface StrategyBuilderWizardProps {
  userTier: UserTier;
  credits: number;
}

export function StrategyBuilderWizard({ userTier, credits }: StrategyBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(0); // 0 = overview page
  const [selectedMarketType, setSelectedMarketType] = useState<MarketType | null>(null);
  const [selectedPairTemplate, setSelectedPairTemplate] = useState<PairTemplate | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [filterIndicators, setFilterIndicators] = useState<IndicatorConfig[]>([]);
  const [riskManagement, setRiskManagement] = useState<RiskManagement>({
    capitalAllocation: 100,
    stopLoss: 5.0,
    takeProfit: 10.0,
    trailingTakeProfit: 2.0,
    leverageMultiplier: 1,
    percentPerTrade: 2.0
  });
  const [backtestParams, setBacktestParams] = useState<BacktestParams>({
    timeframe: '1h',
    maxPeriod: 8760,
    candleCount: 2000
  });

  const [steps, setSteps] = useState<WizardStep[]>([
    { step: 1, title: 'Market Type', description: 'Choose Spot or Perpetual Futures', isComplete: false, isActive: true },
    { step: 2, title: 'Trading Pairs', description: 'Select cryptocurrency pairs', isComplete: false, isActive: false },
    { step: 3, title: 'Strategy', description: 'Choose trading strategy', isComplete: false, isActive: false },
    { step: 4, title: 'Advanced Settings', description: 'Configure parameters', isComplete: false, isActive: false },
    { step: 5, title: 'Risk Management', description: 'Set risk parameters', isComplete: false, isActive: false },
    { step: 6, title: 'Timeframe', description: 'Set timeframe and period', isComplete: false, isActive: false },
    { step: 7, title: 'Backtest', description: 'Review and execute', isComplete: false, isActive: false },
    { step: 8, title: 'Results', description: 'Save and export bot', isComplete: false, isActive: false }
  ]);

  const updateSteps = (stepNumber: number, isComplete: boolean = false) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      isComplete: step.step < stepNumber ? true : step.step === stepNumber ? isComplete : false,
      isActive: step.step === stepNumber
    })));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      updateSteps(1);
    } else if (currentStep < steps.length) {
      updateSteps(currentStep, true);
      setCurrentStep(currentStep + 1);
      updateSteps(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      updateSteps(currentStep - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    updateSteps(stepNumber);
  };

  const handleBackToOverview = () => {
    setCurrentStep(0);
  };

  const handleMarketTypeSelect = (type: MarketType) => {
    setSelectedMarketType(type);
  };

  const handlePairTemplateSelect = (template: PairTemplate) => {
    setSelectedPairTemplate(template);
  };

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    // Clear filter indicators when strategy changes
    setFilterIndicators([]);
  };

  const handleExport = (format: 'python' | 'json', botName: string) => {
    // Implementation for bot export
    console.log(`Exporting ${botName} as ${format}`);
  };

  const handleShare = (botName: string) => {
    // Implementation for community sharing
    console.log(`Sharing ${botName} to community`);
  };

  const handleRunBacktest = () => {
    // Implementation for running backtest
    console.log('Running backtest...');
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Strategy Builder</h1>
              <p className="text-muted-foreground">Create your crypto trading bot</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="px-3 py-1">
                {userTier.toUpperCase()} Tier
              </Badge>
              <Badge variant="default" className="px-3 py-1">
                {credits} Credits
              </Badge>
            </div>
          </div>
          
          {currentStep > 0 && (
            <>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Step {currentStep} of {steps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {currentStep === 0 ? (
          <WizardNavigation
            steps={steps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <button 
                onClick={handleBackToOverview}
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-2"
              >
                ← Back to Overview
              </button>
            </div>
            
            <Card className="p-8 min-h-[600px]">
              {currentStep === 1 && (
                <StepMarketType
                  selected={selectedMarketType}
                  onSelect={handleMarketTypeSelect}
                  onNext={handleNext}
                  onPrevious={currentStep > 1 ? handlePrevious : undefined}
                />
              )}
              
              {currentStep === 2 && (
                <StepPairTemplate
                  selected={selectedPairTemplate}
                  onSelect={handlePairTemplateSelect}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  userTier={userTier}
                />
              )}

              {currentStep === 3 && (
                <StepStrategy
                  selected={selectedStrategy}
                  onSelect={handleStrategySelect}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  userTier={userTier}
                />
              )}

              {currentStep === 4 && selectedStrategy && (
                <StepAdvancedSettings
                  strategy={selectedStrategy}
                  filterIndicators={filterIndicators}
                  onUpdateFilters={setFilterIndicators}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  userTier={userTier}
                />
              )}

              {currentStep === 5 && (
                <StepRiskManagement
                  riskManagement={riskManagement}
                  onUpdate={setRiskManagement}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  userTier={userTier}
                  marketType={selectedMarketType}
                />
              )}

              {currentStep === 6 && (
                <StepTimeframe
                  backtestParams={backtestParams}
                  onUpdate={setBacktestParams}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                />
              )}

              {currentStep === 7 && (
                <StepBacktest
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onRunBacktest={handleRunBacktest}
                />
              )}

              {currentStep === 8 && (
                <StepResults
                  backtestResult={{} as any}
                  onExport={handleExport}
                  onShare={handleShare}
                  onPrevious={handlePrevious}
                />
              )}

            </Card>
          </div>
        )}
      </div>
    </div>
  );
}