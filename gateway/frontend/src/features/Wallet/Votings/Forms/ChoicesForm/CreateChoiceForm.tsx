import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { CreateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit } from '../../../../../components/UnionSubmit';
import { MessageData } from '../types';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface CreateChoiceFormProps extends IClassName {
  unionId: Principal;
  nested?: boolean;
  onSuccess?(response: any): void;
}

export function CreateChoiceForm({
  unionId,
  onSuccess = () => undefined,
  nested,
  ...p
}: CreateChoiceFormProps) {
  const { votingId } = useParams();
  const submitProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'create_voting_choice',
    onExecuted: (p, res) => onSuccess(res),
  });

  const { Form } = useRender<CreateVotingChoiceRequest>({
    canisterId: unionId,
    type: 'CreateVotingChoiceRequest',
  });

  const settings: EditorSettings<CreateVotingChoiceRequest> = useMemo(() => {
    const defaultVotingId = votingId
      ? nested
        ? { Nested: BigInt(votingId) }
        : { Common: BigInt(votingId) }
      : null;

    return {
      fields: {
        name: { order: 1, options: { required: 'Field is required' } },
        description: { order: 2, options: { required: 'Field is required' } },
        voting_id: { disabled: true, defaultValue: defaultVotingId },
      },
    };
  }, [votingId, nested]);

  return (
    <Container title='Create choice' withBack {...p}>
      <Form settings={settings}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Create
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
