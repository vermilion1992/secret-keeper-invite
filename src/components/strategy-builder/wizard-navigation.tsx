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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Strategy Builder Steps</h2>
        <p className="text-muted-foreground">Click on any step to begin or continue your strategy configuration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => (
          <Card key={step.step} className="overflow-hidden">
            <button
              onClick={() => onStepClick(step.step)}
              className={`w-full p-6 text-left transition-all duration-200 hover:shadow-md ${
                step.isActive
                  ? 'bg-primary/10 border-primary/30'
                  : step.isComplete
                  ? 'bg-success/5 border-success/20'
                  : 'bg-card border-border hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {step.isComplete ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                      step.isActive 
                        ? 'border-primary text-primary bg-primary/10' 
                        : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {step.step}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${step.isActive ? 'text-primary' : 'text-foreground'}`}>
                      {step.title}
                    </h3>
                    {step.isComplete && (
                      <Badge variant="secondary" className="text-xs bg-success/20 text-success border-success/30">
                        Complete
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                
                <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-1 ${
                  step.isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}