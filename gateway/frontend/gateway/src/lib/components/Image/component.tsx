import * as React from 'react';
import { Container, Img } from './styles';
import { isBase64 } from './utils';

export interface ImageProps
	extends Omit<
		React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
		'ref'
	> {
	src: string | undefined;
	alt?: string;
	objectFit?: React.CSSProperties['objectFit'];
	width?: number;
	height?: number;
	background?: boolean;
	vertical?: boolean;
	ref?: React.Ref<HTMLDivElement>;
	imageProps?: React.HTMLAttributes<HTMLImageElement>;
}

export const Image: React.FC<ImageProps> = React.forwardRef(
	(
		{
			src,
			alt,
			style,
			width,
			height,
			objectFit = 'cover',
			background = false,
			vertical = false,
			children,
			imageProps,
			...p
		},
		ref,
	) => (
		<Container
			{...p}
			background={background}
			vertical={vertical}
			ref={ref}
			style={{ width, height, ...style }}
		>
			{!!src && (
				<Img
					data-image-url={!isBase64(src || '') ? src : ''}
					alt={alt}
					style={{ width, height, objectFit }}
					src={src}
					{...imageProps}
				/>
			)}
			{children}
		</Container>
	),
);
