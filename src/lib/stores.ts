// src/stores.ts
import { readable, writable } from 'svelte/store';
import { getRobloxUsers, getClanTotals, type dbClanTotal, type dbRobloxUser } from '$lib/database';
import { getActiveClanBattle, type activeClanBattle } from '$lib/get-ps99-data';
import { nowIsCurrent } from './utils';

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
export const loadingData = writable<boolean>(true);

export const currentClanBattle = readable<activeClanBattle>({} as activeClanBattle, (set) => {
	getActiveClanBattle().then((activeClanBattleData) => {
		set(activeClanBattleData.data as activeClanBattle);
	});
});

export const isDuringActiveClanBattle = readable<boolean>(false, (set) => {
	getActiveClanBattle().then((activeClanBattleData) => {
		const activeClanBattle = activeClanBattleData.data as activeClanBattle;
		const duringActiveClanBattle = nowIsCurrent(
			activeClanBattle.configData.StartTime,
			activeClanBattle.configData.FinishTime
		);
		console.debug('isDuringActiveClanBattle', duringActiveClanBattle);
		set(duringActiveClanBattle);
	});
});
