import { AnonymousIdentity } from '@dfinity/agent';
import {Ed25519KeyIdentity} from '@dfinity/identity';

export type Identity = Ed25519KeyIdentity | AnonymousIdentity;

// Fallback for JsonnableEd25519KeyIdentity from @dfinity/identity because it is not exported from lib
type PublicKeyHex = string;
type SecretKeyHex = string;
export type JsonnableEd25519KeyIdentity = [PublicKeyHex, SecretKeyHex];
