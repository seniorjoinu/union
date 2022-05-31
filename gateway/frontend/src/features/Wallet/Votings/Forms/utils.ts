import { MessageData } from './types';

export const parseMessage = (data: any): MessageData | null => {
  console.log('Received data', data);

  if (!data) {
    return null;
  }

  return data as MessageData;
};
