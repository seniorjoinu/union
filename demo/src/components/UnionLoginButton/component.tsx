import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../auth';
import { useUnionWallet } from '../../union';
import { Button as B, PureButton, Principal, Tooltip } from '../atoms';
import { Logo as L } from './logo';

const Name = styled.span`
  font-weight: 600;
`;
const Info = styled.span`
  font-size: 14px;
  text-align: center;
`;

const Logo = styled(L)`
  height: 14px;
  align-self: center;
`;

const UButton = styled(B)<{ $authorized: boolean }>`
  button {
    padding: 4px 6px;
  }

  ${Logo} {
    color: ${({ $authorized }) => ($authorized ? 'red' : 'grey')};
  }
`;

const Button = styled(PureButton)`
  border: none;
  justify-content: center;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${Button} {
    flex-grow: 1;
  }

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const TooltipContent = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }

  ${Button} {
    font-size: 14px;

    &:last-child {
      color: red;
    }
  }
`;

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;

  ${Principal} {
    color: grey;
    max-width: none;
  }

  ${Name} {
    align-self: center;
  }

  &:hover {
    ${Tooltip} {
      pointer-events: all;
      opacity: 1;
    }
  }
`;

export interface UnionLoginButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: JSX.Element | string;
  onLogin?(): void;
}

export const UnionLoginButton = ({
  children,
  onLogin = () => {},
  ...props
}: UnionLoginButtonProps) => {
  const { authorized, refresh, client } = useUnionWallet();
  const { principal } = useAuth();

  const handleLogin = useCallback(async () => {
    if (!principal) {
      return;
    }
    await client.login({ principal }, { after: 'close' });
    onLogin();
    refresh();
  }, [principal, client, refresh, onLogin]);

  const handleLogout = useCallback(async () => {
    await client.logout();
    refresh();
  }, [principal, client, refresh, onLogin]);

  if (!principal) {
    return null;
  }

  return (
    <Container {...props}>
      <UButton $authorized={authorized} onClick={!authorized ? handleLogin : undefined}>
        <Logo />
      </UButton>
      {authorized && (
        <Tooltip>
          <TooltipContent>
            <Info>Union wallet connected</Info>
            {client.wallet && (
              <Principal onClick={() => navigator.clipboard.writeText(principal.toString())}>
                {client.wallet.toString()}
              </Principal>
            )}
            <Controls>
              <Button onClick={client.view}>View</Button>
              <Button onClick={handleLogout}>Logout</Button>
            </Controls>
          </TooltipContent>
        </Tooltip>
      )}
    </Container>
  );
};
