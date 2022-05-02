import { Principal } from '@dfinity/principal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useBackend } from '../../backend';
import { TextField, SubmitButton, Button } from '../atoms';

const Cross = styled.span`
  cursor: pointer;
  color: black;
  transition: color 0.2s ease;

  &::before {
    content: '✕';
  }

  &:hover {
    color: grey;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 16px;
  }
`;

const Modal = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid grey;
  padding: 48px 24px 24px;

  & > *:not(:last-child) {
    margin-bottom: 16px;
  }

  ${SubmitButton}, ${Button} {
    align-self: flex-start;
  }

  ${Cross} {
    position: absolute;
    top: 16px;
    right: 24px;
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;

  & > ${Modal} {
    z-index: 1;
    min-width: 500px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
  }
`;

export interface ProfileModalData {
  name: string;
}

export interface ProfileModalProps {
  className?: string;
  style?: React.CSSProperties;
  principal: Principal;
  visible: boolean;
  onSubmit(data: ProfileModalData): Promise<any>;
  onLogout(): void;
  onClose(): void;
}

export const ProfileModal = ({
  principal,
  onSubmit,
  onLogout,
  visible,
  onClose,
  ...p
}: ProfileModalProps) => {
  const { canister, data, fetching } = useBackend();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');

  const refresh = useCallback(() => {
    if (!principal || principal.isAnonymous()) {
      return;
    }
    canister.get_profile(principal);
  }, [principal, canister]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = useCallback(async () => {
    if (!name) {
      return;
    }
    setSubmitting(true);

    onSubmit({ name }).finally(() => {
      setSubmitting(false);
    });
  }, [name, setSubmitting]);

  if (!visible) {
    return null;
  }

  const loading = !!submitting || !!fetching.get_profile;

  return ReactDOM.createPortal(
    <Container {...p}>
      <Modal>
        <Cross onClick={onClose} />
        <TextField
          placeholder='Set your name'
          onChange={(e) => setName(e.target.value)}
          value={name}
          onKeyDown={(e) => e.key == 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <Controls>
          <SubmitButton disabled={!name || loading} $loading={submitting} onClick={handleSubmit}>
            Submit
          </SubmitButton>
          <Button disabled={loading} onClick={onLogout}>
            Logout
          </Button>
        </Controls>
      </Modal>
    </Container>,
    document.querySelector('#modal-root')!,
  );
};
