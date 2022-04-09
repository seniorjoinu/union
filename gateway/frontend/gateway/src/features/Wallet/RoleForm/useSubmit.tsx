import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentWallet } from '../context';
import { UseSubmitProps } from './types';
import { useCreate } from './useCreate';
import { useEdit } from './useEdit';

export const useSubmit = ({ create, setValue, getValues }: UseSubmitProps) => {
  const { principal } = useCurrentWallet();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { onCreate } = useCreate({ create, getValues });
  const { onEdit, fallback } = useEdit({ create, setValue, getValues });

  const onSubmit = useCallback(() => {
    setSubmitting(true);
    return (create ? onCreate : onEdit)()
      .then((payload) => {
        nav(`/wallet/${principal}/execute`, { state: payload });
      })
      .finally(() => setSubmitting(false));
  }, [create, onCreate, onEdit, setSubmitting, principal]);

  return {
    fallback,
    submitting,
    onSubmit,
  };
};
