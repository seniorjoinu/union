import { Ed25519KeyIdentity } from '@dfinity/identity';
import { mnemonicToSeedSync } from 'bip39';

export function generateIdentity(mnemonic: string): Ed25519KeyIdentity {
  const seed = mnemonicToSeedSync(mnemonic);

  const identity = Ed25519KeyIdentity.generate(seed.slice(0, 32));

  return identity;
}
