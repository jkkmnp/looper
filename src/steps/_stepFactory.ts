import type { Looper, Step } from "../types";

export type StepFactoryProps = {
  fn: Step, 
  modes: string[]
}
export default function stepFactory({fn, modes}:StepFactoryProps): Step {
  return async function(l: Looper) {
    if(modes.includes(l.mode)) {
      // in this step's mode
      l.cycleSteps++;
      await fn(l);
    }

    await l.next();
  }
}