import { Button as B, Row } from '@union/components';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { Voting } from 'union-ts';
import {
  AnyService,
  UnionSubmitResult,
  UnionTooltipButtonComponent,
} from '../../../components/UnionSubmit';

const Button = styled(B)``;
const Container = styled(Row)``;

export interface VotingControlsProps {
  className?: string;
  style?: React.CSSProperties;
  voting: Voting;
  navPrefix: string;
  deleteUnionButtonProps: UnionSubmitResult<AnyService, 'delete_voting', any[]>;
}

export const VotingControls = styled(
  ({ voting, navPrefix, deleteUnionButtonProps, ...p }: VotingControlsProps) => {
    const id = String(voting.id[0]);

    return (
      <Container {...p}>
        {('PreRound' in voting.status || 'Round' in voting.status) && (
          <Button forwardedAs={NavLink} to={`${navPrefix}crud/choices/${id}`} variant='caption'>
            Add choice
          </Button>
        )}
        {/* <Button forwardedAs={NavLink} to={`${navPrefix}create-nested/${id}`} variant='caption'>
          Create nested
        </Button> */}
        <Button forwardedAs={NavLink} to={`${navPrefix}crud/edit/${id}`} variant='caption'>
          Edit
        </Button>
        <UnionTooltipButtonComponent
          {...deleteUnionButtonProps}
          variant='caption'
          color='red'
          buttonContent='Delete'
          submitVotingVerbose='Create voting'
          getPayload={() => [{ id: voting.id[0] }]}
        >
          Delete
        </UnionTooltipButtonComponent>
      </Container>
    );
  },
)``;
