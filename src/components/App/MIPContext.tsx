import { createContext } from 'react';

interface Context {
  showTooltips: boolean;
  toggleTooltip?: () => void;
  showTutorial: boolean;
  toggleTutorial?: () => void;
}

const MIPContext = createContext<Context>({
  showTooltips: true,
  showTutorial: true
});

export default MIPContext;
