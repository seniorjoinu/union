import { BrowserHistoryOptions, createBrowserHistory as createHistory, To } from 'history';
import type { History } from 'history';
import { parse, stringify } from 'qs';

export type CreateHistory<O, H> = (options?: O) => History & H;

export enum QsParamKeys {
  canisterId = 'canisterId',
}

export type TPreservedQueryParams = { preservedQueryParams?: Array<string> };

export const createBrowserHistory = (props?: BrowserHistoryOptions & TPreservedQueryParams) => {
  const preservedParams = [...(props?.preservedQueryParams || []), QsParamKeys.canisterId];

  (window as any).queryParams = parse(window.location.search, { ignoreQueryPrefix: true });

  const cbh = (payload: any) => createHistory({ ...payload, ...props });

  function preserveQueryParameters(history: History, preserve: Array<string>, location: To): To {
    const currentQuery = parse(history.location.search, { ignoreQueryPrefix: true });

    if (currentQuery) {
      const preservedQuery: { [key: string]: unknown } = {};

      // eslint-disable-next-line no-restricted-syntax
      for (const p of preserve) {
        const v = currentQuery[p];

        if (v) {
          preservedQuery[p] = v;
        }
      }
      if (typeof location.search == 'string') {
        Object.assign(preservedQuery, parse(location.search, { ignoreQueryPrefix: true }));
      }
      // eslint-disable-next-line no-param-reassign
      location.search = stringify(preservedQuery);
      (window as any).queryParams = preservedQuery;
    }
    return location;
  }

  function createPreserveQueryHistory<O, H>(
    createHistory: CreateHistory<O, H>,
    queryParameters: Array<string>,
  ): CreateHistory<O, H> {
    return (options?: O) => {
      const history = createHistory(options);
      const oldPush = history.push;
      const oldReplace = history.replace;

      history.push = (path: To, state?: any) =>
        oldPush.apply(history, [preserveQueryParameters(history, queryParameters, path), state]);
      history.replace = (path: To, state?: any) =>
        oldReplace.apply(history, [preserveQueryParameters(history, queryParameters, path), state]);
      return history;
    };
  }

  const history = createPreserveQueryHistory(cbh, preservedParams)();
  return history;
};
