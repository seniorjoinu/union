import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { PageWrapper, Row, SubmitButton as SB } from '@union/components';
import { CreateVotingChoiceRequest, _SERVICE } from 'union-ts';
import { useParams } from 'react-router-dom';
import { TId, TProg } from '@union/candid-parser';
import { EditorSettings, useRender } from '../../../../IDLRenderer';
import { useUnionRepeatSubmit } from '../../../../../components/UnionSubmit';
import { MessageData } from '../types';

const SubmitButton = styled(SB)``;
const Container = styled(PageWrapper)`
  ${SubmitButton} {
    align-self: flex-start;
  }
`;

type MultipleChoicesFormType = { choices: CreateVotingChoiceRequest[] };

export interface MultipleChoicesFormProps extends IClassName {
  unionId: Principal;
  data?: MessageData;
  nested?: boolean;
  onSuccess?(response: any): void;
  renderResult?(index: number): React.ReactNode | null | void;
}

export function MultipleChoicesForm({
  unionId,
  onSuccess = () => undefined,
  data,
  renderResult,
  nested,
  ...p
}: MultipleChoicesFormProps) {
  const { votingId } = useParams();
  const submitProps = useUnionRepeatSubmit({
    unionId,
    program: {
      canisterId: unionId,
      methodName: 'create_voting_choice',
    },
    onExecuted: (p, res) => onSuccess(res),
  });

  const type = useCallback(
    (prog: TProg) =>
      IDL.Record({ choices: IDL.Vec(prog.traverseIdlType(new TId('CreateVotingChoiceRequest'))) }),
    [],
  );
  const { Form } = useRender<MultipleChoicesFormType>({
    canisterId: unionId,
    type,
  });

  const settings: EditorSettings<MultipleChoicesFormType> = useMemo(() => {
    const defaultVotingId = votingId
      ? nested
        ? { Nested: BigInt(votingId) }
        : { Common: BigInt(votingId) }
      : null;

    return {
      fields: {
        'choices.-1.name': { order: 1, options: { required: 'Field is required' } },
        'choices.-1.description': { order: 2, options: { required: 'Field is required' } },
        'choices.-1.voting_id': { disabled: true, defaultValue: defaultVotingId },
      },
    };
  }, [votingId, nested]);

  const defaultValue: MultipleChoicesFormType = { choices: [] };
  // ...data?.choices[0],

  return (
    <Container title='Add choices to voting' withBack {...p}>
      <Form settings={settings} defaultValue={defaultValue}>
        {(ctx) => (
          <Row>
            <SubmitButton
              disabled={!ctx.isValid || !submitProps.isAllowed}
              onClick={(e) => {
                const value = ctx.getValues('choices').map((v) => [{ ...v }]);

                return submitProps.submit(e, value);
              }}
            >
              Submit choices
            </SubmitButton>
            <SubmitButton onClick={onSuccess}>Skip</SubmitButton>
          </Row>
        )}
      </Form>
    </Container>
  );
}
