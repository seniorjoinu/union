import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useBackend } from '../../backend';
import { Button as B, Principal } from '../atoms';
import { UnionLoginButton as UB } from '../UnionLoginButton';
import logo from './logo.svg';
import { UserProfileModal } from './UserProfileModal';

const Button = styled(B)``;
const UnionLoginButton = styled(UB)``;

const Name = styled.span`
  font-weight: 600;
  cursor: pointer;
`;

const Logo = styled.img`
  height: 18px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 8px;
  }

  ${Principal} {
    color: grey;
  }

  ${Name} {
    align-self: center;
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
  const [modalVisible, setModalVisible] = useState(false);

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
      <UserProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={() => {
          refresh();
          setModalVisible(false);
        }}
      />
      {!!data.get_profile?.name && (
        <Name onClick={() => setModalVisible(true)}>{data.get_profile.name}</Name>
      )}
      <Principal onClick={() => navigator.clipboard.writeText(principal.toString())}>
        {principal.toString()}
      </Principal>
      <UnionLoginButton />
      <Button onClick={() => logout().then(() => navigate('/', { replace: true }))}>Logout</Button>
    </Container>
  );
};
