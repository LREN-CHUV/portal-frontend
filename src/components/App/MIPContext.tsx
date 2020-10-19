import { createContext } from 'react';

interface Context {
  showTooltips: boolean;
  toggleTooltip: () => void;
}

const MIPContext = createContext<Context>({
  showTooltips: true,
  toggleTooltip: () => {
    console.log('Startiung context');
  }
});

export default MIPContext;
