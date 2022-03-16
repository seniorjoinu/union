export const serialize = (obj: any): number[] => {
	const payload = {obj};
	let str = JSON.stringify(payload);

	const t = new TextEncoder();
	return [...t.encode(str)];
};

export const deserialize = <T = any>(bytes: number[]): T | null => {
	const t = new TextDecoder();
	const str = t.decode(new Uint8Array(bytes))

	try {
		return JSON.parse(str).obj as T;
	} catch(e) {
		return null;
	}
};

export async function digestMessage(message: string, alg: AlgorithmIdentifier = 'SHA-1') {
  const buffer = await crypto.subtle.digest(alg, encodeMessage(message));

	return {
		hash: (new DataView(buffer, 0)).getUint32(0),
		buffer: buffer,
	};
}

export const encodeMessage = (message: string) => {
	const encoder = new TextEncoder();
  return encoder.encode(message);
};

export const getRandom = () => {
	const nonce = new Uint8Array(32)
	crypto.getRandomValues(nonce);
	return [...nonce];
};
