import * as React from 'react';
import { Image, ImageProps } from './component';
import { FileLoader, FileLoaderProps } from './file';

export type ImageFileProps = Omit<ImageProps, 'src'> & Omit<FileLoaderProps, 'children'>;

export const ImageFile: React.FC<ImageFileProps> = ({ src, ...p }) => (
  <FileLoader src={src}>{(srcString) => <Image {...p} src={srcString} />}</FileLoader>
);
