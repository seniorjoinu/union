import * as React from 'react';
import styled from 'styled-components';
import { LoginButton, LoginButtonProps } from '../LoginButton';
import { useAuth, AuthReadyState } from '../../services';

const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export interface LoginProps {
  buttonProps?: Partial<LoginButtonProps>;
}

const mnemonics: { id: string; mnemonic: string }[] = [
  { id: 'User 1', mnemonic: 'some test mnemonic 1' },
  { id: 'User 2', mnemonic: 'some test mnemonic 2' },
];

export function Login({ buttonProps, ...p }: LoginProps) {
  const { isAuthentificated, isAuthReady } = useAuth();
  const [selected, setSelected] = React.useState(mnemonics[0]);

  const authorized = isAuthentificated && isAuthReady == AuthReadyState.READY;

  return (
    <Container {...p}>
      <select
        title='Select identity'
        disabled={authorized}
        onChange={(e) => setSelected(mnemonics.find((mnemonic) => mnemonic.id == e.target.value)!)}
        value={selected.id}
      >
        {mnemonics.map((m) => (
          <option key={m.id} id={m.id} value={m.id}>
            {m.id}
          </option>
        ))}
      </select>
      <LoginButton
        {...buttonProps}
        mnemonic={selected.mnemonic}
        size='L'
        variant='outlined'
        color='white'
        height={32}
        onLogin={() => {
          localStorage.setItem('user_type', selected.id);
        }}
      />
    </Container>
  );
}
