import { StrategyBuilderWizard } from '@/components/strategy-builder/strategy-builder-wizard';
import { StepStrategy } from '@/components/strategy-builder/step-strategy';
import { StepAdvancedSettings } from '@/components/strategy-builder/step-advanced-settings';
import { UserTier } from '@/types/botforge';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const StrategyBuilder = () => {
  // Mock user data - in real app this would come from auth/user context
  const userTier: UserTier = 'basic'; // Can be 'basic', 'pro', or 'expert'
  const credits = 10;
  const location = useLocation();
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [filterIndicators, setFilterIndicators] = useState([]);

  // Determine which page to show based on route
  const isAdvancedPage = location.pathname === '/strategy-builder/advanced';

  if (isAdvancedPage) {
    return (
      <div className="animate-fade-in">
        <StepAdvancedSettings
          strategy={selectedStrategy}
          filterIndicators={filterIndicators}
          onUpdateFilters={setFilterIndicators}
          onNext={() => {}}
          onPrevious={() => window.history.back()}
          userTier={userTier}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <StepStrategy
        selected={selectedStrategy}
        onSelect={setSelectedStrategy}
        onNext={() => {}}
        onPrevious={() => {}}
        userTier={userTier}
      />
    </div>
  );
};

export default StrategyBuilder;