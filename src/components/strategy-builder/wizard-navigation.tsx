import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { WizardStep } from '@/types/botforge';

interface WizardNavigationProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function WizardNavigation({ steps, currentStep, onStepClick }: WizardNavigationProps) {
  return (
    <Card className="p-6 bg-card/50 border-border/50">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.step} className="flex items-center gap-3">
            <button
              onClick={() => onStepClick(step.step)}
              disabled={!step.isComplete && step.step !== currentStep}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
                step.isActive
                  ? 'bg-primary/20 border border-primary/30'
                  : step.isComplete
                  ? 'bg-success/10 border border-success/20 hover:bg-success/20'
                  : 'bg-muted/30 border border-muted/30 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex-shrink-0">
                {step.isComplete ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Circle className={`w-5 h-5 ${step.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${step.isActive ? 'text-primary' : 'text-foreground'}`}>
                    {step.title}
                  </span>
                  <Badge variant={step.isActive ? 'default' : 'secondary'} className="text-xs">
                    {step.step}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
              
              {step.isActive && (
                <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}