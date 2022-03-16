import React from 'react';

export interface ProgressProps {
	absolute?: boolean;
	size?: number;
	children?: any;
}

export const Progress = ({ children = 'loading' }: ProgressProps) => <span>{children}</span>;