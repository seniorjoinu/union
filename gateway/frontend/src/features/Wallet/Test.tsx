import { Button, Column, Row } from '@union/components';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { UpdateVotingConfigRequest } from 'union-ts';
import { RenderEditorContext, useRender } from '../IDLRenderer';
import { useCurrentUnion } from './context';

const Container = styled(Column)`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

export interface TestProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Test = styled(({ ...p }: TestProps) => {
  const { principal } = useCurrentUnion();
  const renderer = useRender<UpdateVotingConfigRequest>({
    canisterId: principal,
    type: 'UpdateVotingConfigRequest',
  });
  const value = {};

  const useFormEffect = useCallback((ctx: RenderEditorContext<UpdateVotingConfigRequest>) => {
    // ctx.control.register('win_opt.0.QuantityOf.quantity', {
    //   required: 'Please, fill name',
    // });
    //   ctx.control.register('description', {
    //     required: 'Please, fill description',
    //   });
    //   // ctx.control.register('description', {
    //   //   required: 'Please, fill description',
    //   // });
    //   ctx.control.register('targets', {
    //     validate: {
    //       length: (v) => v.length > 0 || 'Please, add targets',
    //     },
    //   });
  }, []);

  return (
    <Container {...p}>
      <renderer.Form defaultValue={value} useFormEffect={useFormEffect}>
        {(ctx) => (
          <>
            <Row>
              <Button
                onClick={() => {
                  console.log('getValues', ctx.getValues());
                }}
              >
                getValues
              </Button>
              <Button
                onClick={() => {
                  console.log('Validate', renderer.traversedIdlType?.covariant(ctx.getValues()));
                }}
              >
                Validate ({String(ctx.isValid)})
              </Button>
            </Row>
          </>
        )}
      </renderer.Form>
    </Container>
  );
})``;
