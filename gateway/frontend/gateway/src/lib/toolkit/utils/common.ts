export const isLocalhost = () =>
  window.location.href.startsWith('http://localhost') || window.location.href.includes('127.0.0.1');

export const randomBigInt = () => BigInt(String(Math.random()).replace('0.', ''));

export const downloadFileContent = (content: string, name = 'content.txt') => {
  const blob = new Blob([content], { type: 'plain/text' });
  const file = new File([blob], name, { type: blob.type });
  return downloadFile(file);
};

export const downloadFileBytes = (content: number[], name = 'content.txt') => {
  const arr = new Uint8Array(content);
  const file = new File([arr], name, { type: 'plain/text' });
  return downloadFile(file);
};

export const downloadFile = (file: File) => {
  const url = window.URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.setAttribute('download', file.name);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const caseByCount = (number: number, titles: Array<string>) => {
  const cases = [2, 0, 1, 1, 1, 2];

  return titles[
    number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
  ];
};
