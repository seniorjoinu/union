import { Principal } from '@dfinity/principal';

export const checkPrincipal = (canisterId: string | Principal): Principal | null => {
  let principal: Principal;

  try {
    principal = Principal.from(canisterId);
  } catch (e) {
    return null;
  }

  if (!principal._isPrincipal || principal.isAnonymous()) {
    return null;
  }

  return principal;
};
