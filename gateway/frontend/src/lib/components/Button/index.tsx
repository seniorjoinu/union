import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'text' | 'outlined';
  size?: 'M' | 'L';
  color?: string;
}

export const Button = (p: ButtonProps) => <button {...p} />;
