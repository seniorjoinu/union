import { createBrowserHistory } from 'toolkit';

export { QsParamKeys } from 'toolkit';

export const history = createBrowserHistory<(keyof QueryParams)[]>({
  basename: '',
  preservedQueryParams: ['mode'],
});
