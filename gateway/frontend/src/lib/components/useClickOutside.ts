import React, { useCallback, useEffect, useState } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  handler: () => any,
  ref?: React.ForwardedRef<T>,
) => {
  const [localRef, setLocalRef] = useState<T | null>(null);

  const handleRef = useCallback(
    (instance: T | null) => {
      if (typeof ref == 'function') {
        ref(instance);
      } else if (ref) {
        ref.current = instance;
      }
      setLocalRef(instance);
    },
    [ref, setLocalRef],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // @ts-expect-error
      if (localRef && !localRef.contains(event.target)) {
        handler();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [localRef]);

  return { ref: handleRef };
};
