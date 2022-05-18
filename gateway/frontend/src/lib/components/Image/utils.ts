import { css, FlattenSimpleInterpolation } from 'styled-components';

export const isBase64 = (url: string) =>
  url.includes('base64') ||
  url.includes('data:image') ||
  (url.length >= 32 &&
    !!url.match(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/));

export const IEStyle = (content: FlattenSimpleInterpolation | string) => css`
  @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
    ${content}
  }
`;

export interface UploadResult {
  file: File;
  target: any;
}

export const readPhotos = (uploadedFiles: Array<File>) =>
  Promise.all(uploadedFiles.map((f) => readFile(f))).then((targets) => {
    const files = targets.map((t) => t.file);
    const previews = targets.filter((t) => !!t.target.result).map((t) => t.target.result as string);

    return { files, previews };
  });

export const readFile = (file: File) =>
  new Promise<UploadResult>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (readerEvent: ProgressEvent) => {
      resolve({ target: readerEvent.target as any, file });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
