import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { WizardNavigation } from './wizard-navigation';
import { StepMarketType } from './step-market-type';
import { StepPairTemplate } from './step-pair-template';
import { StepStrategy } from './step-strategy';
import { MarketType, PairTemplate, UserTier, WizardStep, Strategy } from '@/types/botforge';

interface StrategyBuilderWizardProps {
  userTier: UserTier;
  credits: number;
}

export function StrategyBuilderWizard({ userTier, credits }: StrategyBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMarketType, setSelectedMarketType] = useState<MarketType | null>(null);
  const [selectedPairTemplate, setSelectedPairTemplate] = useState<PairTemplate | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const [steps, setSteps] = useState<WizardStep[]>([
    { step: 1, title: 'Market Type', description: 'Choose Spot or Perpetual Futures', isComplete: false, isActive: true },
    { step: 2, title: 'Trading Pairs', description: 'Select cryptocurrency pairs', isComplete: false, isActive: false },
    { step: 3, title: 'Strategy', description: 'Choose trading strategy', isComplete: false, isActive: false },
    { step: 4, title: 'Advanced Settings', description: 'Configure parameters', isComplete: false, isActive: false },
    { step: 5, title: 'Risk Management', description: 'Set risk parameters', isComplete: false, isActive: false },
    { step: 6, title: 'Backtest', description: 'Set timeframe and period', isComplete: false, isActive: false },
    { step: 7, title: 'Summary', description: 'Review and execute', isComplete: false, isActive: false },
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
    if (currentStep < steps.length) {
      updateSteps(currentStep, true);
      setCurrentStep(currentStep + 1);
      updateSteps(currentStep + 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    // Only allow clicking on completed steps or current step
    const targetStep = steps.find(s => s.step === stepNumber);
    if (targetStep && (targetStep.isComplete || targetStep.isActive)) {
      setCurrentStep(stepNumber);
      updateSteps(stepNumber);
    }
  };

  const handleMarketTypeSelect = (type: MarketType) => {
    setSelectedMarketType(type);
  };

  const handlePairTemplateSelect = (template: PairTemplate) => {
    setSelectedPairTemplate(template);
  };

  const handleStrategySelect = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
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
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <WizardNavigation
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <Card className="p-8 min-h-[600px]">
              {currentStep === 1 && (
                <StepMarketType
                  selected={selectedMarketType}
                  onSelect={handleMarketTypeSelect}
                  onNext={handleNext}
                />
              )}
              
              {currentStep === 2 && (
                <StepPairTemplate
                  selected={selectedPairTemplate}
                  onSelect={handlePairTemplateSelect}
                  onNext={handleNext}
                  userTier={userTier}
                />
              )}

              {currentStep === 3 && (
                <StepStrategy
                  selected={selectedStrategy}
                  onSelect={handleStrategySelect}
                  onNext={handleNext}
                  userTier={userTier}
                />
              )}

              {currentStep > 3 && (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold mb-4">Step {currentStep} - {steps[currentStep - 1].title}</h2>
                  <p className="text-muted-foreground">This step will be implemented next...</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}