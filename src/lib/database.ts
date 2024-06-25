import type { robloxUserData, clansData, clanData } from './get-ps99-data';

export interface dbRobloxUser {
	_id: string;
	created_on: Date;
	data: robloxUserData;
}

export interface dbClanTotal {
	_id: string;
	created_on: Date;
	data: clansData;
}

export interface dbClan {
	_id: string;
	created_on: Date;
	data: clanData;
}

function parse_id_for_date(id: string) {
	const dateStr = id.split('||')[1];
	const date = new Date(dateStr);
	return date;
}

export async function getRobloxUsers(): Promise<dbRobloxUser[]> {
	let robloxUsers: dbRobloxUser[] = [];
	try {
		const url =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:8000/roblox-users'
				: `${import.meta.env.VITE_PROD_ENDPOINT}/roblox-users`;
		const response = await fetch(url);
		const data = await response.json();
		robloxUsers = data.map((doc: dbRobloxUser) => {
			const data = doc;
			return { id: doc._id, created_on: parse_id_for_date(doc._id.toString()), data: data };
		});
		console.log('Fetched roblox users:');
	} catch (error) {
		console.error('Failed to fetch roblox users', error);
	}
	return robloxUsers;
}
//TODO: Need to only fetch clan totals for the active clan battle
export async function getClanTotals(): Promise<dbClanTotal[]> {
	let clanTotals: dbClanTotal[] = [];
	try {
		const url =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:8000/clan-totals'
				: `${import.meta.env.VITE_PROD_ENDPOINT}/clan-totals`;
		const response = await fetch(url);
		const data = await response.json();
		clanTotals = data.map((doc: dbClanTotal) => {
			const data = doc;
			return { id: doc._id, created_on: parse_id_for_date(doc._id), data: data };
		});
		console.log('Fetched clan totals:');
	} catch (error) {
		console.error('Failed to fetch clan totals', error);
	}
	return clanTotals;
}

export async function getClanDetails(clanName: string): Promise<dbClan[]> {
	let clanDetails: dbClan[] = [];
	try {
		const url =
			process.env.NODE_ENV === 'development'
				? `http://localhost:8000/clans/${clanName}`
				: `${import.meta.env.VITE_PROD_ENDPOINT}/clans/${clanName}`;
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		clanDetails = data.map((doc: dbClan) => {
			const data = doc;
			return { id: doc._id, created_on: parse_id_for_date(doc._id), data: data };
		});
		console.log('Fetched clan details:');
	} catch (error) {
		console.error('Failed to fetch clan details', error);
	}

	return clanDetails;
}
