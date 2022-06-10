import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Text, TextVariant } from './Text';
import { Spinner as SP } from './Spinner';
import { SubmitButton as SB } from './Button';

const Title = styled(Text)``;
const Zeroscreen = styled(Text)``;
const Error = styled(Text)`
  color: red;
`;

const SubmitButton = styled(SB)``;

const Spinner = styled(SP)<{ $fetching: boolean }>`
  margin: 4px;
  align-self: center;
  transition: opacity 0.2s ease;
  opacity: ${({ $fetching }) => ($fetching ? 1 : 0)};
`;

const Item = styled.div`
  &:empty {
    display: none;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 16px;
  }

  & > ${Item}:not(:last-child) {
    margin-bottom: 16px;
  }

  ${Error}, ${Zeroscreen}, ${SubmitButton} {
    align-self: center;
  }
`;

export const pagerLayout = {
  Container,
  Item,
  Spinner,
  SubmitButton,
  Zeroscreen,
  Error,
};

export interface FetchResponse<T> {
  page: {
    data: T[];
    has_next: boolean;
  };
}

export interface PagerProps<T, R extends FetchResponse<T> = FetchResponse<T>> {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  title?: React.ReactNode;
  renderItem(item: T, extra: Omit<R, 'page'> | undefined): React.ReactNode | null | false;
  fetch(p: { index: number; size: number }): Promise<R>;
  onEntitiesChanged?(data: T[]): void;
  buttonVariant?: TextVariant;
  verbose?: {
    loadMore?: React.ReactNode;
    zeroscreen?: React.ReactNode;
    error?: React.ReactNode;
  };
  renderIfEmpty?: boolean;
}

export const DEFAULT_PAGE_SIZE = 10;

export const Pager = <T extends {}, R extends FetchResponse<T> = FetchResponse<T>>({
  size = DEFAULT_PAGE_SIZE,
  fetch,
  renderItem,
  title,
  verbose: verboseProps,
  onEntitiesChanged = () => {},
  buttonVariant,
  renderIfEmpty = true,
  ...p
}: PagerProps<T, R>) => {
  const [index, setIndex] = useState(0);
  const [complete, setComplete] = useState(false);
  const [data, setData] = useState<T[] | null>(null);
  const [extra, setExtra] = useState<Record<number, Omit<R, 'page'>>>({});
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string>('');

  const verbose = {
    loadMore: 'Load more',
    zeroscreen: 'List is empty',
    error: '',
    ...verboseProps,
  };

  useEffect(() => {
    fetchPageData();
  }, []);
  useEffect(() => {
    onEntitiesChanged(data || []);
  }, [data, onEntitiesChanged]);

  const fetchPageData = () => {
    setFetching(true);
    setError('');
    fetch({ index, size })
      .then(({ page, ...extra }) => {
        setExtra((e) => ({ ...e, [index]: extra }));
        setData((data) => [...(data || []), ...page.data]);
        setIndex((index) => index + 1);
        setComplete(!page.has_next);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setFetching(false));
  };

  const items = useMemo(
    () =>
      (data || [])
        .map((item, i) => {
          const page = Math.ceil((i + 1) / 5) - 1;

          return renderItem(item, extra[page]);
        })
        .filter((item) => !!item),
    [data, renderItem, size, extra],
  );

  if (!renderIfEmpty && !items.length) {
    return null;
  }

  return (
    <Container {...p}>
      {title && (
        <Title variant='p1' weight='medium'>
          {title}
        </Title>
      )}
      {items.map((item, i) => (
        <Item key={String(i)}>{item}</Item>
      ))}
      {!items.length && !fetching && !error && <Zeroscreen>{verbose.zeroscreen}</Zeroscreen>}
      {!!error && (
        <Error>
          {verbose.error}: {error}
        </Error>
      )}
      {!data && <Spinner size={20} $fetching={fetching} />}
      {!!data && !complete && (
        <SubmitButton loading={fetching} onClick={fetchPageData} variant={buttonVariant}>
          {verbose.loadMore}
        </SubmitButton>
      )}
    </Container>
  );
};
