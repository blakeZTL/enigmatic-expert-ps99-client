import type { ps99ApiResponse, clansData } from '$lib/get-ps99-data';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const fetchClanNames = async () => {
		const baseUrl = 'https://biggamesapi.io/api/clans';
		let page = 1;
		let pageSize = 1000;
		let sort = 'Points';
		let sortOrder = 'desc';
		let response = await fetch(
			`${baseUrl}?page=${page}&pageSize=${pageSize}&sort=${sort}&sortOrder=${sortOrder}`
		);
		const apiData = (await response.json()) as ps99ApiResponse;
		const clanNames = (apiData.data as clansData[]).map((clan: clansData) => clan.Name);
		while (!clanNames.includes('SOUP')) {
			console.debug("SOUP isn't in the data, fetching more clans");
			page++;
			response = await fetch(
				`${baseUrl}?page=${page}&pageSize=${pageSize}&sort=${sort}&sortOrder=${sortOrder}`
			);
			apiData.data = (apiData.data as clansData[]).concat((await response.json()).data);
			clanNames.push(...(apiData.data as clansData[]).map((clan: clansData) => clan.Name));
		}
		return clanNames;
	};

	return {
		clanNames: fetchClanNames()
	};
};
