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
		const response = await fetch('http://localhost:8000/roblox-users');
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
		const response = await fetch('http://localhost:8000/clan-totals', {
			headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
		});
		const data = await response.json();
		console.debug('Fetched clan totals:', data);
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
		const response = await fetch(`http://localhost:8000/clans/${clanName}`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		console.debug(data);
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
