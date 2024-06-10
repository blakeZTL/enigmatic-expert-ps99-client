export const unixToDate = (unix: number): Date => {
	const date = new Date(unix * 1000);
	return date;
};

export const nowIsCurrent = (startTime: number, finishTime: number): boolean => {
	return Date.now() >= startTime && Date.now() <= finishTime;
};

export const convertNumberToMultiples = (diamonds: number): string => {
	if (diamonds >= 1000000000000) {
		return `${(diamonds / 1000000000000).toFixed(2)}T`;
	} else if (diamonds >= 1000000000) {
		return `${(diamonds / 1000000000).toFixed(2)}B`;
	} else if (diamonds >= 1000000) {
		return `${(diamonds / 1000000).toFixed(2)}M`;
	} else if (diamonds >= 1000) {
		return `${(diamonds / 1000).toFixed(2)}K`;
	} else {
		return `${diamonds}`;
	}
};
