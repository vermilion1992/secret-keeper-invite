import { StrategyBuilderWizard } from '@/components/strategy-builder/strategy-builder-wizard';
import { UserTier } from '@/types/botforge';

const StrategyBuilder = () => {
  // Mock user data - in real app this would come from auth/user context
  const userTier: UserTier = 'basic'; // Can be 'basic', 'pro', or 'expert'
  const credits = 10;

  return (
    <div className="animate-fade-in">
      <StrategyBuilderWizard 
        userTier={userTier}
        credits={credits}
      />
    </div>
  );
};

export default StrategyBuilder;