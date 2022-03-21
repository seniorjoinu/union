export const cropString = (value: string, startLen = 7, endLen = 4) => {
	if (!value) {
		return '';
	}
	if (value.length < startLen + endLen) {
		return value;
	}
	const last = value.slice(value.length - endLen, value.length);
	const first = value.slice(0, startLen);

	return `${first}... ${last}`;
};
