import * as React from 'react';

export interface ExpanderContextProps {
  onClick: () => void;
  isStatic: boolean;
}

export const ExpanderContext = React.createContext<ExpanderContextProps>({
  onClick: () => undefined,
  isStatic: false,
});
