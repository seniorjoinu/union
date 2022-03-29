import React from 'react';
import styled from 'styled-components';
import * as mobxReactLite from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { CroppedString as CS, Button, ButtonProps } from 'components';
import { useAuth } from 'services';
import logo from '../../assets/logo.svg';

const CroppedString = styled(CS)``;

const Principal = styled.span`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100px;
  align-self: center;
  cursor: pointer;
`;

const Logo = styled.img``;

const Container = styled.div`
  display: flex;
  flex-direction: row;

  ${Principal} {
    margin-right: 16px;
  }

  ${CroppedString} {
    margin-right: 8px;
  }
`;

export interface LoginButtonProps extends Omit<ButtonProps, 'id'> {
  height?: number;
  mnemonic: string;
  children?: JSX.Element | string;
  onLogin?(): void;
}

export const LoginButton = mobxReactLite.observer(
  ({ mnemonic, children, onLogin, height = 16, ...props }: LoginButtonProps) => {
    const navigate = useNavigate();
    const { authClient, login, logout } = useAuth();

    if (!authClient.principal) {
      return null;
    }

    if (authClient.principal?.isAnonymous()) {
      return (
        <Button
          id='login'
          {...props}
          onClick={() => {
            login(mnemonic);
            onLogin?.();
          }}
        >
          {children}
          <Logo style={{ height }} src={logo} alt='logo' />
        </Button>
      );
    }

    const principal = authClient.principal?.toString();

    return (
      <Container>
        <CroppedString variant='p1' onClick={() => navigator.clipboard.writeText(principal)}>
          {principal}
        </CroppedString>
        <Button
          {...props}
          id='login'
          variant='text'
          size='M'
          color='grey'
          onClick={() => logout().then(() => navigate('/', { replace: true }))}
        >
          Logout
        </Button>
      </Container>
    );
  },
);
