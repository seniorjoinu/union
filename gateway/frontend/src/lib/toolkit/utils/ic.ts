import { Principal } from '@dfinity/principal';

export const checkPrincipal = (
  canisterId: string | Principal | ArrayLike<number>,
): Principal | null => {
  let principal: Principal;

  try {
    if (typeof canisterId == 'string') {
      principal = Principal.from(canisterId);
    } else if (Array.isArray(canisterId)) {
      principal = Principal.fromUint8Array(new Uint8Array(canisterId));
    } else {
      // FIXME react-hook-form copy principal bug
      // @ts-expect-error
      principal = Principal.fromUint8Array(new Uint8Array(Object.values(canisterId._arr)));
    }
  } catch (e) {
    return null;
  }

  if (!principal._isPrincipal || principal.isAnonymous()) {
    return null;
  }

  return principal;
};
