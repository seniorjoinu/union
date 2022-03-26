import * as React from 'react';
import styled from 'styled-components';
import { Select as S, Option } from 'components';
import { LoginButton, LoginButtonProps } from '../LoginButton';
import { useAuth, AuthReadyState } from '../../services';

const Select = styled(S)``;
const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  & > ${Select} {
    margin-bottom: 16px;
  }
`;

export interface LoginProps {
  buttonProps?: Partial<LoginButtonProps>;
}

const mnemonics: { id: string; mnemonic: string }[] = [
  { id: 'User 1', mnemonic: 'some test mnemonic 1' },
  { id: 'User 2', mnemonic: 'some test mnemonic 2' },
  { id: 'User 3', mnemonic: 'some test mnemonic 3' },
  { id: 'User 4', mnemonic: 'some test mnemonic 4' },
];

export function Login({ buttonProps, ...p }: LoginProps) {
  const { isAuthentificated, isAuthReady } = useAuth();
  const [selected, setSelected] = React.useState(mnemonics[0]);

  const authorized = isAuthentificated && isAuthReady == AuthReadyState.READY;

  return (
    <Container {...p}>
      <Select
        title='Select identity'
        disabled={authorized}
        onChange={(e) => setSelected(mnemonics.find((mnemonic) => mnemonic.id == e.target.value)!)}
        value={selected.id}
      >
        {mnemonics.map((m) => (
          <Option key={m.id} id={m.id} value={m.id}>
            {m.id}
          </Option>
        ))}
      </Select>
      <LoginButton
        {...buttonProps}
        mnemonic={selected.mnemonic}
        size='L'
        variant='outlined'
        color='white'
        height={32}
      />
    </Container>
  );
}
