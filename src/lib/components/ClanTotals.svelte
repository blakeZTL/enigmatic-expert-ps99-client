<script lang="ts">
	import {
		getActiveClanBattle,
		getClans,
		type activeClanBattle,
		type clansData
	} from '$lib/get-ps99-data';
	import { unixToDate, convertNumberToMultiples, nowIsCurrent } from '$lib/utils';
	import { getClanTotals, type dbClanTotal } from '$lib/database';
	import { onMount, tick } from 'svelte';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
	import { selectedClan, loadingData, isDuringActiveClanBattle } from '$lib/stores';
	import TablePlaceholder from './TablePlaceholder.svelte';
	import { Autocomplete } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption } from '@skeletonlabs/skeleton';
	import { writable } from 'svelte/store';

	let recordSelectedByPoints: clansData | null = null;
	const popupPointsClick: PopupSettings = {
		event: 'click',
		target: 'popupPointsClick',
		placement: 'left-start'
	};

	function getRelevantClanTotals(clanName: string) {
		const clanRecords = relevantClanTotals.filter((clan) => clan.data.Name === clanName);
		if (!clanRecords) return [];
		const currentBattleRecords = clanRecords.filter(
			(record: dbClanTotal) =>
				record.created_on >= currentBattleStart && record.created_on <= currentBattleFinish
		);
		return currentBattleRecords;
	}

	function selectClan(clanName: string) {
		selectedClan.set(clanName);
		// set window to top of page
	}

	let pastClanTotals: dbClanTotal[] = [];
	let currentClanTotals: clansData[] = [];
	let relevantClanTotals: dbClanTotal[] = [];
	let currentClanBattle: activeClanBattle;
	let currentBattleStart: Date;
	let currentBattleFinish: Date;
	const clanNames = writable<string[]>([]);
	let clanNamesAutocomplete: AutocompleteOption<string>[] = $clanNames.map((clanName) => ({
		label: clanName,
		value: clanName
	}));
	$: clanNamesAutocomplete = $clanNames.map((clanName) => ({
		label: clanName,
		value: clanName
	}));
	let clanNameSearch = '';

	// function searchClanName(event: CustomEvent<AutocompleteOption<string>>) {
	// 	clanNameSearch = event.detail.label;
	// }
	// let clanSearchPopupSettings: PopupSettings = {
	// 	event: 'focus-click',
	// 	target: 'clanSearchPopupAutocomplete',
	// 	placement: 'bottom'
	// };

	$: console.debug('Loading...', $loadingData);

	onMount(async () => {
		loadingData.set(true);
		// Wait for stores to be initialized
		await tick();

		pastClanTotals = await getClanTotals();
		const currentClansData = await getClans();
		currentClanTotals = currentClansData.data as clansData[];
		//sort by points desc then deposited diamonds desc
		currentClanTotals.sort(
			(a, b) => b.Points - a.Points || b.DepositedDiamonds - a.DepositedDiamonds
		);
		clanNames.set(currentClanTotals.map((clan) => clan.Name));

		const activeClanBattleData = await getActiveClanBattle();
		currentClanBattle = activeClanBattleData.data as activeClanBattle;

		// Fetch data from stores
		currentBattleStart = unixToDate(currentClanBattle.configData.StartTime);
		currentBattleFinish = unixToDate(currentClanBattle.configData.FinishTime);

		// Filter clan totals based on battle start and finish times
		relevantClanTotals = pastClanTotals.filter((clan) => {
			const createdOn = new Date(clan.created_on);
			return createdOn >= currentBattleStart && createdOn <= currentBattleFinish;
		});
		loadingData.set(false);
	});
</script>

<div class="m-3">
	{#if $loadingData}
		<TablePlaceholder />
	{:else}
		<input
			class="input mb-3"
			type="search"
			name="clanSearch"
			bind:value={clanNameSearch}
			placeholder="Search..."
		/>
		<!-- <div
			data-popup="clanSearchPopupAutocomplete"
			class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto"
		>
			<Autocomplete
				bind:input={clanNameSearch}
				options={clanNamesAutocomplete}
				on:selection={searchClanName}
			/>
		</div> -->
		<div class="flex flex-col h-screen">
			<div class="flex-grow overflow-auto">
				<table class="relative w-full">
					<thead>
						<tr>
							<th class="custom-header variant-glass-primary"></th>
							<th class="custom-header variant-glass-primary"></th>
							<th class="text-center custom-header variant-glass-primary">Members</th>
							{#if !$isDuringActiveClanBattle}
								<th id="clanDiamondsHeader" class="custom-header variant-glass-primary text-center"
									>Diamonds</th
								>
							{/if}
							<th id="clanPointsHeader" class="text-center variant-glass-primary custom-header"
								>Points</th
							>
						</tr>
					</thead>

					<tbody>
						{#each currentClanTotals.filter((clan) => clan.Name && clan.Name.toUpperCase().includes(clanNameSearch.toUpperCase())) as row, i}
							<!--  -->
							<tr>
								<td class="w-10 text-end">{i + 1}.</td>
								<td class="text-left w-44">
									<button
										class="btn bg-gradient-to-br variant-gradient-secondary-primary ml-3"
										on:click={() => selectClan(row.Name)}
									>
										{row.Name}
									</button>
								</td>
								<td class="text-center cursor-default">
									<button type="button" class="btn bg-initial cursor-default">
										{row.Members + 1}
									</button>
								</td>
								{#if !$isDuringActiveClanBattle}
									<td class="text-center cursor-default">
										<button type="button" class="btn bg-initial cursor-default">
											{convertNumberToMultiples(row.DepositedDiamonds)}
										</button>
									</td>
								{/if}
								<td class="text-center">
									<button
										type="button"
										class="btn btn-sm variant-ghost-primary"
										use:popup={popupPointsClick}
										on:click={() => (recordSelectedByPoints = row)}
									>
										{convertNumberToMultiples(row.Points)}</button
									></td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

<!-- TODO: Refactor to a component -->
<div class="card p-4 w-auto shadow-xl" data-popup="popupPointsClick">
	<div class="card">
		<div class="card-header">
			<h1 class="text-lg">{recordSelectedByPoints ? recordSelectedByPoints.Name : 'Unknown'}</h1>
		</div>
		<div class="card-body mx-3 my-3">
			<p>
				<strong
					>Total Points: {recordSelectedByPoints
						? convertNumberToMultiples(recordSelectedByPoints.Points)
						: 'Unkown'}</strong
				>
			</p>
			<p><i>UTC Times</i></p>
			<ol>
				<!--TODO: refactor to a method-->
				{#if recordSelectedByPoints}
					{#each getRelevantClanTotals(recordSelectedByPoints.Name)
						.filter((record) => new Date().getTime() - new Date(record.created_on).getTime() <= 3 * 60 * 60 * 1000)
						.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
						.map( (record, index, array) => ({ ...record, difference: index < array.length - 1 ? Math.abs(record.data.Points - array[index + 1].data.Points) : 0 }) ) as record, index}
						<li>
							{`${new Date(record.created_on).toLocaleDateString()} ${new Date(record.created_on).toLocaleTimeString()}`}
							- {convertNumberToMultiples(record.data.Points)}
							{index < getRelevantClanTotals(recordSelectedByPoints.Name).length - 1 &&
							record.difference !== 0
								? `(+${convertNumberToMultiples(record.difference)})`
								: ''}
						</li>
					{/each}
					<!--TODO: Make this work-->
					<!-- <p>
						Average Difference: {convertNumberToMultiples(
							getRelevantClanTotals(recordSelectedByPoints.Name)
								.filter(
									(record) =>
										new Date().getTime() - new Date(record.created_on).getTime() <=
										3 * 60 * 60 * 1000
								)
								.sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
								.map((record, index, array) =>
									index < array.length - 1
										? Math.abs(record.data.Points - array[index + 1].data.Points)
										: 0
								)
								.reduce((total, difference) => total + difference, 0) /
								(getRelevantClanTotals(recordSelectedByPoints.Name).length - 1)
						)}
					</p> -->
				{/if}
			</ol>
		</div>
	</div>
	<div class="arrow bg-surface-100-800-token" />
</div>

<style>
	td,
	th {
		line-height: 1.5;
	}
	tr {
		height: 60px;
	}
	.custom-header {
		position: sticky;
		top: 0;
		padding: 1rem;
	}
</style>
