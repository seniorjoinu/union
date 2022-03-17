export const isLocalhost = () =>
  window.location.href.startsWith('http://localhost') || window.location.href.includes('127.0.0.1');

export const randomBigInt = () => BigInt(String(Math.random()).replace('0.', ''));

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

export const downloadFile = (file: File) => {
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', file.name);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
