import { BuilderProgress } from './types';

export function computeStepComplete(p: BuilderProgress) {
  return {
    step1: !!p.step1_saved,
    step2: !!p.step2_saved,
    step3: !!p.step3_saved,
    step4: !!p.step4_saved,
    step5: !!p.step5_saved,
  };
}