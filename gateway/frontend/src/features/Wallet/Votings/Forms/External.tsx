import React, { useCallback } from 'react';
import { MessageData as ClientMessageData, useClient } from '../../../useClient';
import { parseMessage } from './utils';
import { CreateVotingFormProps } from './VotingForm';
import { MessageData } from './types';

type VotingFormChildProps = Omit<CreateVotingFormProps, 'data' | 'onSuccess'>;
export type ExternalVotingFormProps = VotingFormChildProps & {
  redirectToHistory?(): void;
  children(
    props: VotingFormChildProps,
    data: MessageData,
    onSuccess: (p: any) => void,
  ): JSX.Element;
};

export const ExternalVotingForm = ({
  redirectToHistory,
  children,
  ...props
}: ExternalVotingFormProps) => {
  const { data, success } = useClient({ parser: parseMessage });

  const handleSuccess = useCallback(
    (payload: any) => {
      success(payload).then(() => {
        redirectToHistory && redirectToHistory();
      });
    },
    [success, redirectToHistory],
  );

  if (!data) {
    return <span>Waiting data...</span>;
  }

  return children(props, data, handleSuccess);
};
