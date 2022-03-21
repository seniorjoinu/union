import { createBrowserHistory as createHistory, parsePath } from 'history';
import type {
  History,
  LocationState,
  LocationDescriptor,
  LocationDescriptorObject,
  BrowserHistoryBuildOptions,
} from 'history';
import { parse, stringify } from 'qs';
import { isLocalhost } from './utils';

export type CreateHistory<O, H> = (options?: O) => History & H;

export enum QsParamKeys {
  canisterId = 'canisterId',
}

export type TPreservedQueryParams<T extends string[]> = { preservedQueryParams?: T };

export const createBrowserHistory = <T extends string[]>(
  props?: BrowserHistoryBuildOptions & TPreservedQueryParams<T>,
) => {
  const preservedParams = [...(props?.preservedQueryParams || []), QsParamKeys.canisterId];

  (window as any).queryParams = parse(window.location.search, { ignoreQueryPrefix: true });

  const cbh = (payload: any) => createHistory({ ...payload, ...props });

  function preserveQueryParameters(
    history: History,
    preserve: Array<string>,
    location: LocationDescriptorObject,
  ): LocationDescriptorObject {
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
      if (location.search) {
        Object.assign(preservedQuery, parse(location.search, { ignoreQueryPrefix: true }));
      }
      // eslint-disable-next-line no-param-reassign
      location.search = stringify(preservedQuery);
      (window as any).queryParams = preservedQuery;
    }
    return location;
  }

  function createLocationDescriptorObject(
    location: LocationDescriptor,
    state?: LocationState,
  ): LocationDescriptorObject {
    return typeof location === 'string' ? { ...parsePath(location), state } : location;
  }

  function createPreserveQueryHistory<O, H>(
    createHistory: CreateHistory<O, H>,
    queryParameters: Array<string>,
  ): CreateHistory<O, H> {
    return (options?: O) => {
      const history = createHistory(options);
      const oldPush = history.push;
      const oldReplace = history.replace;

      history.push = (path: LocationDescriptor, state?: LocationState) =>
        oldPush.apply(history, [
          preserveQueryParameters(
            history,
            queryParameters,
            createLocationDescriptorObject(path, state),
          ),
        ]);
      history.replace = (path: LocationDescriptor, state?: LocationState) =>
        oldReplace.apply(history, [
          preserveQueryParameters(
            history,
            queryParameters,
            createLocationDescriptorObject(path, state),
          ),
        ]);
      return history;
    };
  }

  const history = createPreserveQueryHistory(cbh, preservedParams)();

  if (isLocalhost()) {
    history.listen((location, action) => {
      console.log(`The current URL is ${location.pathname}${location.search}${location.hash}`);
      console.log(
        `The last navigation action was ${action}`,
        JSON.stringify(history.location, null, 2),
      );
    });
  }

  return history;
};
