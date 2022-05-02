import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../auth';
import { useBackend } from '../../backend';
import { PostView as PW } from '../PostView';
import { PostCreator } from '../PostCreator';
import { Spinner } from '../atoms';

const Zeroscreen = styled.span``;
const PostView = styled(PW)``;

const Container = styled.div<{ $fetching: boolean }>`
  display: flex;
  flex-direction: column;

  ${Zeroscreen} {
    margin: 32px 0;
    align-self: center;
  }

  & > ${Spinner} {
    margin: 4px;
    align-self: center;
    transition: opacity 0.2s ease;
    opacity: ${({ $fetching }) => ($fetching ? 1 : 0)};
  }

  & > ${PostView}:not(:last-child) {
    margin-bottom: 16px;
  }
`;

export interface FeedProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Feed = ({ ...p }: FeedProps) => {
  const { principal } = useAuth();
  const { canister, data, fetching } = useBackend();

  const refresh = useCallback(() => {
    canister.get_posts({ from: [], take: [], owner: [] });
  }, [canister]);

  useEffect(() => {
    refresh();
  }, []);

  const posts = data.get_posts?.posts || [];

  return (
    <Container {...p} $fetching={!!fetching.get_posts}>
      {principal && !principal.isAnonymous() && <PostCreator onSuccess={refresh} />}
      <Spinner size={20} />
      {posts.map((post) => (
        <PostView key={post.id.toString()} post={post} />
      ))}
      {!posts.length && !fetching.get_posts && (
        <Zeroscreen>Ad cogitandum et agendum homo natus est</Zeroscreen>
      )}
    </Container>
  );
};
