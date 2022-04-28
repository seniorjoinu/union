import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useBackend } from '../../backend';
import { Button, Principal } from '../atoms';
import logo from './logo.svg';
import { ProfileModal } from './ProfileModal';

const Name = styled.span`
  font-weight: 600;
`;

const Logo = styled.img`
  height: 16px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;

  ${Principal} {
    margin-right: 8px;
    color: grey;
  }

  ${Name} {
    align-self: center;
    margin-right: 8px;
  }
`;

export interface LoginButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: JSX.Element | string;
  onLogin?(): void;
}

export const LoginButton = ({ children, onLogin, ...props }: LoginButtonProps) => {
  const navigate = useNavigate();
  const { principal, login, logout } = useAuth();
  const { canister, data } = useBackend();

  const refresh = useCallback(() => {
    if (!principal || principal.isAnonymous()) {
      return;
    }
    canister.get_profile(principal);
  }, [principal, canister]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!principal) {
    return null;
  }

  if (principal.isAnonymous()) {
    return (
      <Button
        id='login'
        {...props}
        onClick={() => {
          login();
          onLogin?.();
        }}
      >
        {children}
        <Logo src={logo} alt='logo' />
      </Button>
    );
  }

  return (
    <Container {...props}>
      <ProfileModal />
      {!!data.get_profile?.name && <Name>{data.get_profile.name}</Name>}
      <Principal onClick={() => navigator.clipboard.writeText(principal.toString())}>
        {principal.toString()}
      </Principal>
      <Button onClick={() => logout().then(() => navigate('/', { replace: true }))}>Logout</Button>
    </Container>
  );
};
