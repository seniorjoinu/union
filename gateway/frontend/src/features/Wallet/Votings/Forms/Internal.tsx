import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageData } from './types';
import { parseMessage } from './utils';
import { CreateVotingFormProps } from './VotingForm';

export type InternalVotingFormProps = Omit<CreateVotingFormProps, 'data'> & {
  required?: boolean;
  children(props: Omit<CreateVotingFormProps, 'data'>, data?: MessageData): JSX.Element;
};

export const InternalVotingForm = ({ children, required, ...props }: InternalVotingFormProps) => {
  const location = useLocation();
  const nav = useNavigate();
  const [data, setData] = useState<MessageData | undefined>(undefined);

  useEffect(() => {
    if (!location.state) {
      return;
    }

    const data = parseMessage(location.state);

    if (data) {
      setData(data);
    }
    // location.state = null;
    nav(location.pathname, { replace: true, state: null });
  }, []);

  if (!data && required) {
    return <span>Waiting data...</span>;
  }

  return children(props, data);
};
