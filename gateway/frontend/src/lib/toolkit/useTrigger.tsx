import { useRef, useEffect } from 'react';

export function useTrigger<T = any>(
  callback: (value: T) => void,
  value: T | null | undefined | void,
  args: any[],
) {
  const calledOnce = useRef(false);

  useEffect(() => {
    if (calledOnce.current) {
      return;
    }

    if (!value) {
      return;
    }

    callback(value);
    calledOnce.current = true;
  }, [value, ...args]);
}
