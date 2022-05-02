import { buildSerializer, buildEncoder } from '@union-wallet/serialize';
import { _SERVICE } from 'management-ts';
// @ts-expect-error
import { idlFactory as idl } from 'management-idl';

export const managementSerializer = buildSerializer<_SERVICE>(idl);

export const managementEncoder = buildEncoder<_SERVICE>(idl);
