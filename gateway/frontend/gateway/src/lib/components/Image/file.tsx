import * as React from 'react';
import { readPhotos } from './utils';

export interface FileLoaderProps {
  src: string | File | Blob | null | void;
  children(src: string, loading: boolean): JSX.Element;
}

export const FileLoader: React.FC<FileLoaderProps> = ({ src: propSrc, children }) => {
  const [src, setSrc] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!propSrc) {
      setSrc('');
      return;
    }

    if (typeof propSrc === 'string') {
      setSrc(propSrc);
      return;
    }

    const file =
      propSrc instanceof Blob ? new File([propSrc], 'blob', { type: propSrc.type }) : propSrc;

    setLoading(true);
    readPhotos([file])
      .then((result) => setSrc(result.previews[0]))
      .finally(() => setLoading(false));
  }, [propSrc]);

  return children(src, loading);
};
