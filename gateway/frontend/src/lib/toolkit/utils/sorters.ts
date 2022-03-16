interface StringPayload {
	a: string;
	b: string;
	idA?: number;
	idB?: number;
	asc?: boolean;
}

interface StringNumberPayload {
	a: string | number | null | void;
	b: string | number | null | void;
	idA?: number;
	idB?: number;
	asc?: boolean;
}

export const date = ({ a, b, idA = 0, idB = 0, asc = true }: StringPayload) => {
	const aa = new Date(a).getTime();
	const bb = new Date(b).getTime();

	if (aa > bb) {
		return asc ? 1 : -1;
	}
	if (aa < bb) {
		return asc ? -1 : 1;
	}
	return idA - idB;
};

interface BooleanPayload {
	a: boolean;
	b: boolean;
	idA?: string;
	idB?: string;
	asc?: boolean;
}

export const boolean = ({ a, b, idA = '', idB = '', asc = true }: BooleanPayload) => {
	const aa = Number(a);
	const bb = Number(b);

	if (aa > bb) {
		return asc ? 1 : -1;
	}
	if (aa < bb) {
		return asc ? -1 : 1;
	}
	return string({ a: idA, b: idB, asc });
};

export const string = ({ a = '', b = '', idA = 0, idB = 0, asc = true }: StringPayload) => {
	const aa = a ? a.toUpperCase() : '';
	const bb = b ? b.toUpperCase() : '';

	if (aa > bb) {
		return asc ? 1 : -1;
	}
	if (aa < bb) {
		return asc ? -1 : 1;
	}
	return idA - idB;
};

interface NumberPayload {
	a: number;
	b: number;
	idA?: number;
	idB?: number;
	asc?: boolean;
}

interface BigIntPayload {
	a: bigint;
	b: bigint;
	idA?: bigint;
	idB?: bigint;
	asc?: boolean;
}

export const number = ({ a = 0, b = 0, idA = 0, idB = 0, asc = true }: NumberPayload | BigIntPayload) => {
	if (a > b) {
		return asc ? 1 : -1;
	}
	if (a < b) {
		return asc ? -1 : 1;
	}
	return !asc ? Number(BigInt(idB) - BigInt(idA)) : Number(BigInt(idA) - BigInt(idB));
};

/* tslint:disable:no-any */
export const stringNumber = ({ idA = 0, idB = 0, asc = true, ...payload }: StringNumberPayload) => {
	const a = (payload.a || '').toString();
	const b = (payload.b || '').toString();

	const left = asc ? a : b;
	const right = asc ? b : a;

	const compareResult = left.localeCompare(right, undefined, { numeric: true });

	if (compareResult) {
		return compareResult;
	}

	return !asc ? idB - idA : idA - idB;
};

export type Sorter = (p: { a: any; b: any; idA?: any; idB?: any; asc: boolean }) => number;
