<script lang="ts">
	import {
		getActiveClanBattle,
		getClans,
		type activeClanBattle,
		type clansData
	} from '$lib/get-ps99-data';
	import { unixToDate, convertNumberToMultiples } from '$lib/utils';
	import { getClanTotals, type dbClanTotal } from '$lib/database';
	import { onMount, tick } from 'svelte';
	import { popup, type PopupSettings } from '@skeletonlabs/skeleton';

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

	let pastClanTotals: dbClanTotal[] = [];
	let currentClanTotals: clansData[] = [];
	let relevantClanTotals: dbClanTotal[] = [];
	let currentClanBattle: activeClanBattle;
	let currentBattleStart: Date;
	let currentBattleFinish: Date;

	onMount(async () => {
		// Wait for stores to be initialized
		await tick();

		pastClanTotals = await getClanTotals();
		const currentClansData = await getClans();
		currentClanTotals = currentClansData.data as clansData[];

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
	});
</script>

<div class="table-container mx-5 my-5">
	<!-- Native Table Element -->
	<table class="table table-hover">
		<thead>
			<tr>
				<th></th>
				<th>Members</th>
				<th id="clanDiamondsHeader">Diamonds</th>
				<th id="clanPointsHeader">Points</th>
			</tr>
		</thead>
		<tbody>
			{#each currentClanTotals as row, i}
				<!-- on:click={() => selectClan(row.data.Name)} -->
				<tr>
					<td class="cursor-default">{`${i + 1}. ${row.Name}`}</td>
					<td class="cursor-default">{row.Members}</td>
					<td class="cursor-default">{convertNumberToMultiples(row.DepositedDiamonds)}</td>
					<td>
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
