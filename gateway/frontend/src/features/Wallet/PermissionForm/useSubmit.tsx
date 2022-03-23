import { useCallback, useState } from 'react';
import { UseSubmitProps } from './types';
import { useCreate } from './useCreate';
import { useEdit } from './useEdit';

export const useSubmit = ({ create, setValue, getValues }: UseSubmitProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { onCreate } = useCreate({ create, getValues });
  const { onEdit, fallback } = useEdit({ create, setValue, getValues });

  const onSubmit = useCallback(() => {
    setSubmitting(true);
    return (create ? onCreate : onEdit)().finally(() => setSubmitting(false));
  }, [create, onCreate, onEdit, setSubmitting]);

  return {
    fallback,
    submitting,
    onSubmit,
  };
};
