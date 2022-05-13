import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Spinner } from '../Spinner';
import { Button as B, ButtonProps } from './component';

const Button = styled(B)<{ $loading: boolean }>`
  position: relative;

  ${Spinner} {
    position: absolute;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
    opacity: ${({ $loading }) => ($loading ? 1 : 0)};
  }
  ${Spinner} + span {
    opacity: ${({ $loading }) => ($loading ? 0 : 1)};
  }
  ${Spinner}, ${Spinner} + span {
    transition: opacity 0.2s ease;
  }
`;

export interface SubmitButtonProps extends Omit<ButtonProps, 'onClick'> {
  loading?: boolean;
  onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void | Promise<any>;
}

export const SubmitButton = ({ onClick, disabled, loading, children, ...p }: SubmitButtonProps) => {
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

  return (
    <Button
      {...p}
      disabled={disabled || fetching || loading}
      $loading={loading || fetching}
      onClick={handleOnClick}
    >
      <Spinner size={20} />
      <span>{children}</span>
    </Button>
  );
};
