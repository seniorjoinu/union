import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, SubmitButton as SB } from '@union/components';
import { UpdateVotingRequest, _SERVICE } from 'union-ts';
import { useNavigate, useParams } from 'react-router-dom';
import { useUnion } from 'services';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionSubmit, AnyService } from '../../../../../components/UnionSubmit';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

export interface UpdateVotingFormProps extends IClassName {
  unionId: Principal;
  onSuccess?(response: any): void;
  renderResult?(index: number): React.ReactNode | null | void;
}

export function UpdateVotingForm({
  unionId,
  onSuccess = () => undefined,
  renderResult,
  ...p
}: UpdateVotingFormProps) {
  const { votingId } = useParams();
  const nav = useNavigate();
  const { canister, data, fetching } = useUnion(unionId);
  const submitProps = useUnionSubmit<AnyService & _SERVICE, 'update_voting'>({
    unionId,
    canisterId: unionId,
    methodName: 'update_voting',
    onExecuted: (p, res) => nav(`../../votings/voting/${votingId}`, { replace: true }),
  });

  const { Form } = useRender<UpdateVotingRequest>({
    canisterId: unionId,
    type: 'UpdateVotingRequest',
  });

  useEffect(() => {
    if (!votingId) {
      return;
    }

    canister.get_voting({ id: BigInt(votingId), query_delegation_proof_opt: [] });
  }, [votingId]);

  const defaultValue: UpdateVotingRequest | undefined = useMemo(() => {
    const voting = data.get_voting?.voting;

    if (!votingId || !voting) {
      return;
    }

    return {
      id: BigInt(votingId),
      new_name: [voting.name],
      new_description: [voting.description],
      new_winners_need: [voting.winners_need],
    };
  }, [votingId, data.get_voting?.voting]);

  const settings: EditorSettings<UpdateVotingRequest> = useMemo(
    () => ({
      fields: {
        id: { hide: true },
        new_name: { order: 1 },
        new_description: { order: 2 },
        new_winners_need: { order: 3 },
      },
    }),
    [],
  );

  if (!votingId) {
    return <span>votingId is empty</span>;
  }

  if (fetching.get_voting) {
    return <span>fetching</span>;
  }

  if (!data.get_voting?.voting || !defaultValue) {
    return <span>Voting does not found</span>;
  }

  return (
    <Container title='Update voting' withBack {...p}>
      <Form settings={settings} defaultValue={defaultValue}>
        {(ctx) => (
          <SubmitButton
            disabled={!ctx.isValid || !submitProps.isAllowed}
            onClick={(e) => submitProps.submit(e, [ctx.getValues()])}
          >
            Update voting
          </SubmitButton>
        )}
      </Form>
    </Container>
  );
}
