import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { PageWrapper, Text, Button as B, TextField } from 'components';
import { checkPrincipal } from 'toolkit';
import { walletSerializer } from 'services';
import { useCurrentUnion } from '../context';
import { ExternalExecutorFormData } from '../../Executor';

const Button = styled(B)``;
const AddButton = styled(B)``;

const Members = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
`;

const Member = styled.div`
  display: flex;
  flex-direction: column;

  & > *:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Container = styled(PageWrapper)`
  ${AddButton} {
    align-self: flex-start;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

interface InviteForm {
  name: string;
  description: string;
  principal: string;
}

const defaultMember: InviteForm = {
  name: 'Invited member',
  description: 'Invited member to union-wallet',
  principal: '',
};

export const Invite = () => {
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<InviteForm[]>([{ ...defaultMember }]);
  const { rnp, principal } = useCurrentUnion();

  const onSubmit = useCallback(() => {
    if (!rnp) {
      return;
    }

    setSubmitting(true);
    const payload: ExternalExecutorFormData = {
      title: 'Invite members',
      description: 'Invite members and create profiles',
      rnp,
      program: {
        RemoteCallSequence: [
          ...members
            .filter((m) => checkPrincipal(m.principal))
            .map((member) => {
              const args = walletSerializer.create_role({
                role_type: {
                  Profile: {
                    principal_id: Principal.fromText(member.principal),
                    name: member.name || defaultMember.name,
                    description: member.description || defaultMember.description,
                    active: false,
                  },
                },
              });

              return {
                endpoint: {
                  canister_id: Principal.from(principal),
                  method_name: 'create_role',
                },
                cycles: BigInt(0),
                args: { CandidString: args },
              };
            }),
        ],
      },
    };

    nav(`/wallet/${principal}/execute`, { state: payload });
  }, [rnp, principal, setSubmitting, members, setMembers]);

  const isValid = !!members.find((m) => checkPrincipal(m.principal));

  return (
    <Container title='Inviting'>
      <Members>
        {members.map((m, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Member key={`member${i}`}>
            <TextField
              label='Name'
              value={m.name}
              onChange={(e) =>
                setMembers((members) => {
                  // eslint-disable-next-line no-param-reassign
                  members[i].name = e.target.value;
                  return [...members];
                })
              }
            />
            <TextField
              label='Principal'
              value={m.principal}
              onChange={(e) =>
                setMembers((members) => {
                  // eslint-disable-next-line no-param-reassign
                  members[i].principal = e.target.value;
                  return [...members];
                })
              }
            />
            <TextField
              label='Description'
              value={m.description}
              onChange={(e) =>
                setMembers((members) => {
                  // eslint-disable-next-line no-param-reassign
                  members[i].description = e.target.value;
                  return [...members];
                })
              }
            />
          </Member>
        ))}
        <AddButton onClick={() => setMembers((members) => [...members, { ...defaultMember }])}>
          +
        </AddButton>
      </Members>
      <Button disabled={!isValid || submitting} onClick={onSubmit}>
        Invite
      </Button>
    </Container>
  );
};
