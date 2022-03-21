import React from 'react';

export interface ProgressProps extends IClassName {
  absolute?: boolean;
  size?: number;
  children?: any;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Progress = ({ children = 'loading', absolute, ...p }: ProgressProps) => (
  <span {...p}>{children}</span>
);
