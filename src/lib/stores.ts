// src/stores.ts
import { readable, writable } from 'svelte/store';
import { getRobloxUsers, getClanTotals, type dbClanTotal, type dbRobloxUser } from '$lib/database';

// Create a readable store for robloxUsers
export const robloxUsers = readable<dbRobloxUser[]>([], (set) => {
	getRobloxUsers().then((fetchedUsers) => {
		set(fetchedUsers);
	});
});

export const clanTotals = readable<dbClanTotal[]>([], (set) => {
	getClanTotals().then((fetchedTotals) => {
		set(fetchedTotals);
	});
});

export const selectedClan = writable<string>('');

export const selectedUser = writable<string>('');
