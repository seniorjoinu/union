import React, { useCallback, useState } from 'react';
import { Button, ButtonProps } from './component';

export interface SubmitButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void | Promise<any>;
}

export const SubmitButton = ({ onClick, disabled, ...p }: SubmitButtonProps) => {
  const [fetching, setFetching] = useState(false);

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClick) {
        return;
      }
      const res = onClick(e);

      if (res && 'finally' in res && typeof res.finally == 'function') {
        setFetching(true);

        res.finally(() => setFetching(false));
      }
    },
    [onClick, setFetching],
  );

  return <Button {...p} disabled={disabled || fetching} onClick={handleOnClick} />;
};
