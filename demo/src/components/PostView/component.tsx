import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Post } from 'backend-ts';
import { useUnion } from '../../union';
import { useAuth } from '../../auth';
import { Markdown, Principal } from '../atoms';
import { useBackend } from '../../backend';
import { Heart as H } from './heart';

const Counter = styled.span`
  font-size: 14px;
`;
const Timestamp = styled.span`
  font-size: 14px;
  color: grey;
`;
const Name = styled.span`
  font-weight: 600;
`;

const Head = styled.div`
  display: flex;
  flex-direction: row;

  ${Principal} {
    color: grey;
  }

  ${Timestamp} {
    flex-grow: 1;
    text-align: end;
  }

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: row;

  & > *:not(:last-child) {
    margin-right: 8px;
  }
`;

const Heart = styled(H)<{ $selected: boolean; $disabled: boolean }>`
  width: 16px;
  height: 16px;
  color: ${({ $selected }) => ($selected ? 'red' : 'black')};
  transition: color 0.2s ease;
  cursor: pointer;
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'all')};

  &:hover {
    color: grey;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid grey;
  padding: 12px 16px 12px;

  ${Head} {
    margin-bottom: 8px;
  }

  ${Footer} {
    margin-top: 12px;
  }
`;

export interface PostViewProps {
  className?: string;
  style?: React.CSSProperties;
  post: Post;
}

export const PostView = ({ post, ...p }: PostViewProps) => {
  const { principal } = useAuth();
  const { canister, data, fetching } = useBackend();
  const { client } = useUnion();
  const [optimisticHeart, setOptimisticHeart] = useState<boolean | null>(null);

  const refreshActivity = useCallback(() => {
    canister.get_activity(post.id);
    setOptimisticHeart(null);
  }, [canister, post, setOptimisticHeart]);

  useEffect(() => {
    refreshActivity();
    canister.get_profile(post.author);
  }, []);

  const profileName = useMemo(() => data.get_profile?.name[0], [!!data.get_profile?.name]);

  const heartDisabled =
    !principal || principal.isAnonymous() || !data.get_activity || !!fetching.get_activity;

  const liked = useMemo(() => {
    if (heartDisabled) {
      return false;
    }
    const principalStr = principal?.toString();

    return optimisticHeart != null
      ? optimisticHeart
      : !!data.get_activity?.hearts.find((p) => p.id.toString() == principalStr);
  }, [data.get_activity?.hearts, principal, heartDisabled, optimisticHeart]);

  const heartsCount = useMemo(() => data.get_activity?.hearts.length || 0, [
    data.get_activity?.hearts,
  ]);

  const handleHeartClick = useCallback(() => {
    if (heartDisabled) {
      return;
    }

    setOptimisticHeart(!liked);

    canister
      .set_activity({
        post_id: post.id,
        heart: [!liked],

        // FIXME: login to union and put here your principal from there OR create a field, where the user can prompt this principal by themself;
        //  only required when you want to receive shares by liking posts
        alias_principal: client.profile && !client.profile.isAnonymous() ? [client.profile] : [],
      })
      .then(refreshActivity);
  }, [heartDisabled, liked, canister, post, refreshActivity, setOptimisticHeart, client]);

  const createdAt = useMemo(
    () => moment(Math.floor(Number(post.created_at) / 10 ** 6)).format("DD MMMM'YY HH:mm"),
    [post.created_at],
  );

  return (
    <Container {...p}>
      <Head>
        {!!profileName && <Name>{profileName}</Name>}
        <Principal onClick={() => navigator.clipboard.writeText(post.author.toString())}>
          {post.author.toString()}
        </Principal>
        <Timestamp>{createdAt}</Timestamp>
      </Head>
      <Markdown>{post.content}</Markdown>
      <Footer>
        <Heart $disabled={heartDisabled} $selected={!!liked} onClick={handleHeartClick} />
        {!!heartsCount && <Counter>{heartsCount}</Counter>}
      </Footer>
    </Container>
  );
};
