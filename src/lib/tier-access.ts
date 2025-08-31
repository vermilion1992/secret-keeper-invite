import { UserTier, Strategy, PairTemplate } from '@/types/botforge';

export function getTierAccess(tier: UserTier) {
  switch (tier) {
    case 'basic':
      return {
        maxPairs: 10,
        pairTemplates: ['top10'] as PairTemplate[],
        canAddFilters: false,
        canUseTrailingTP: false,
        availableStrategies: 5,
        description: 'Top 10 pairs only'
      };
    case 'pro':
      return {
        maxPairs: 30,
        pairTemplates: ['top10', 'top30'] as PairTemplate[],
        canAddFilters: true,
        canUseTrailingTP: false,
        availableStrategies: 13,
        description: 'Top 30 pairs + filter indicators'
      };
    case 'expert':
      return {
        maxPairs: 100,
        pairTemplates: ['top10', 'top30', 'meme', 'volatility', 'random', 'custom'] as PairTemplate[],
        canAddFilters: true,
        canUseTrailingTP: true,
        availableStrategies: 20,
        description: 'Full 100 pairs + all features'
      };
    default:
      return getTierAccess('basic');
  }
}

export function canAccessStrategy(strategy: Strategy, userTier: UserTier): boolean {
  const tierOrder = { basic: 0, pro: 1, expert: 2 };
  return tierOrder[userTier] >= tierOrder[strategy.tier];
}

export function canAccessPairTemplate(template: PairTemplate, userTier: UserTier): boolean {
  const access = getTierAccess(userTier);
  return access.pairTemplates.includes(template);
}

export function getUpgradeMessage(requiredTier: UserTier): string {
  switch (requiredTier) {
    case 'pro':
      return 'Upgrade to Pro to unlock this feature';
    case 'expert':
      return 'Upgrade to Expert to access all features';
    default:
      return 'Feature not available in your tier';
  }
}