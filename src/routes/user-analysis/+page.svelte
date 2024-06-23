<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { InputChip, Autocomplete, popup } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption, PopupSettings } from '@skeletonlabs/skeleton';
	import type { robloxUserData, ps99ApiResponse, clansData } from '$lib/get-ps99-data';
	import { getClans, getClan } from '$lib/get-ps99-data';

	interface apiRobloxUser extends robloxUserData {
		id: number;
	}
	let clans: string[] = [];
	let selectedClans: string[] = [];
	let clanInput: string = '';
	onMount(async () => {
		await tick();
		const clansResponse = await getClans(1, 1000, 'Points', 'desc');
		clans = clansResponse.data.map((clan) => clan.Name);
		clanOptions = clans.map((clan) => ({ label: clan, value: clan }));
		console.debug('clans', clans);
	});
	let robloxUserInput = '';
	let robloxUser: apiRobloxUser;
	async function getRobloxUserByUserName(userName: string) {
		const userArray = userName.split(',');
		const url =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:8000/roblox-users/username/'
				: `${import.meta.env.VITE_PROD_ENDPOINT}/roblox-users/username/`;
		const response = await fetch(url + userName);

		const data = (await response.json()) as { data: apiRobloxUser[] };
		if (data) {
			robloxUser = data;
			console.debug('robloxUser', robloxUser);
		}
	}

	let clanOptions: AutocompleteOption<string>[];
	function onClanSelection(event: CustomEvent<AutocompleteOption<string>>) {
		console.debug('onClanSelection', event.detail);
		selectedClans = [...selectedClans, event.detail.value];
		clanInput = '';
		clanOptions = clanOptions.filter((option) => !selectedClans.includes(option.value));
	}

	function checkForSelectedClan(clanName: string) {
		return !selectedClans.includes(clanName);
	}

	let clanSelectPopupSettings: PopupSettings = {
		event: 'click',
		target: 'clanSelectPopup',
		placement: 'bottom'
	};
</script>

{#if clans.length === 0}
	<div>Loading...</div>
{:else}
	<div class="m-5 flex flex-col gap-3">
		<h1 class="text-2xl">User Analysis</h1>
		<p class="text-lg">Enter a Roblox user name</p>
		<input
			class="input"
			placeholder="Enter Roblox user name (not display name)"
			type="text"
			bind:value={robloxUserInput}
		/>
		<p class="text-lg">Enter clan name(s)</p>
		<InputChip
			name="selectedClanChips"
			placeholder="Input Clan Name(s)"
			bind:value={selectedClans}
			bind:input={clanInput}
			validation={checkForSelectedClan}
		/>
		{#if clanInput.length > 0}
			<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto" tabindex="-1">
				<Autocomplete bind:input={clanInput} options={clanOptions} on:selection={onClanSelection} />
			</div>

			<button class="btn btn-primary" on:click={() => getRobloxUserByUserName(robloxUserInput)}
				>Get Analysis</button
			>
		{/if}
	</div>
{/if}
