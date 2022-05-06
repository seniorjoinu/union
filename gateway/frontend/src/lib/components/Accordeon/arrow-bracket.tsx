import * as React from 'react';

export interface ArrowBracketProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

export const ArrowBracket: React.FC<ArrowBracketProps> = ({ size = 16, ...p }) => (
	<svg width={size} height={size} viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' {...p}>
		<path
			d='M4.05426 5.5L3 6.54482L8 11.5L13 6.54482L11.9457 5.5L8 9.41037L4.05426 5.5Z'
			strokeWidth='0'
		/>
	</svg>
);
