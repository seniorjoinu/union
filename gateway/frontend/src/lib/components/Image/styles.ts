import styled, { css } from 'styled-components';
import { IEStyle } from './utils';

export const Img = styled.img`
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 0;
	width: 100%;
	height: 100%;
	flex-grow: 1;
	flex-shrink: 1;
	object-position: center center;
`;

export const Container = styled.div<{ background: boolean; vertical: boolean }>`
	position: relative;
	overflow: hidden;
	transform: translateZ(0);

	${({ background }) =>
		background
		&& IEStyle`
		&::before {
			content: '';
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			background: #000;
			pointer-events: none;
			z-index: -1;
		}
	`}

	${({ vertical }) =>
		IEStyle(`
		position: relative;

		${Img} {
			position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
			height: auto;
			
			${
				vertical
					? css`
							width: auto;
							height: 100%;
					  `
					: ''
			}
		}
	`)}
`;
