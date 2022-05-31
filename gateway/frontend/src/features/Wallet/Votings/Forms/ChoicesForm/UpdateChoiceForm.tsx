import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { UpdateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { useUnion } from 'services';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit } from '../../../../../components/UnionSubmit';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface UpdateChoiceFormProps extends IClassName {
  unionId: Principal;
  nested?: boolean;
  onSuccess?(response: any): void;
}

export function UpdateChoiceForm({
  unionId,
  onSuccess = () => undefined,
  nested,
  ...p
}: UpdateChoiceFormProps) {
  const { choiceId, votingId } = useParams();
  const { canister, data, fetching } = useUnion(unionId);
  const submitProps = useUnionSubmit({
    unionId,
    canisterId: unionId,
    methodName: 'update_voting_choice',
    onExecuted: (p, res) => onSuccess(res),
  });

  const { Form } = useRender<UpdateVotingChoiceRequest>({
    canisterId: unionId,
    type: 'UpdateVotingChoiceRequest',
  });

  useEffect(() => {
    if (!choiceId || !votingId) {
      return;
    }

    const remoteVotingId = nested ? { Nested: BigInt(votingId) } : { Common: BigInt(votingId) };

    canister.get_voting_choice({
      choice_id: BigInt(choiceId),
      voting_id: remoteVotingId,
      query_delegation_proof_opt: [],
    });
  }, [choiceId, votingId]);

  const defaultValue: UpdateVotingChoiceRequest | undefined = useMemo(() => {
    const choice = data.get_voting_choice?.choice;

    if (!choiceId || !choice) {
      return;
    }

    return {
      choice_id: BigInt(choiceId),
      new_name: [choice.name],
      new_description: [choice.description],
      new_program: [choice.program],
    };
  }, [choiceId, data.get_voting_choice?.choice]);

  const settings: EditorSettings<UpdateVotingChoiceRequest> = useMemo(
    () => ({
      fields: {
        choice_id: { hide: true },
        new_name: { order: 1 },
        new_description: { order: 2 },
        new_program: { order: 3 },
      },
    }),
    [choiceId, nested],
  );

  if (!choiceId) {
    return <span>choiceId is empty</span>;
  }

  if (fetching.get_voting_choice) {
    return <span>fetching</span>;
  }

  if (!data.get_voting_choice?.choice || !defaultValue) {
    return <span>Choice does not found</span>;
  }

  return (
    <Container title='Update choice' withBack {...p}>
      <Form settings={settings} defaultValue={defaultValue}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Update
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
