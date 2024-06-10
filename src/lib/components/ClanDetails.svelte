<script lang="ts">
	import { selectedClan, loadingData } from '$lib/stores';
	import {
		getClan,
		getClanMemberNames,
		getClanMemberDiamondContibutions,
		getClanMemberPointContibutions,
		getClanMemberFullDetails,
		getActiveClanBattle,
		type clanData,
		type robloxUserData,
		type ClanMemberFullDetails,
		type activeClanBattle
	} from '$lib/get-ps99-data';
	import { getClanDetails, getRobloxUsers, type dbClan } from '$lib/database';
	import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { onMount, tick } from 'svelte';
	import ClanMemberTotals from './ClanMemberTotals.svelte';
	import ClanMemberCurrent from './ClanMemberCurrent.svelte';
	import TablePlaceholder from './TablePlaceholder.svelte';

	let selectedPastClanDetails: dbClan[] = [];
	let currentClanDetails: clanData;
	let clanMemberFullDetails: ClanMemberFullDetails[] = [];
	let activeClanBattle: activeClanBattle;
	let container: HTMLDivElement;
	let levelOfDetail = 'Current Battle';

	function section(c: string) {
		levelOfDetail = c;
	}

	onMount(async () => {
		loadingData.set(true);
		await tick();
		container.scrollIntoView({ behavior: 'smooth' });
		// Wait for stores to be initialized
		await tick();
		const currentClanDetailsData = await getClan($selectedClan);
		currentClanDetails = currentClanDetailsData.data as clanData;
		selectedPastClanDetails = await getClanDetails($selectedClan);
		let activeClanBattleData = await getActiveClanBattle();
		activeClanBattle = activeClanBattleData.data as activeClanBattle;
		let userData = await getRobloxUsers();
		let robloxUserData = userData.map((user) => user.data as robloxUserData);
		let clanMembers = getClanMemberNames(currentClanDetails, robloxUserData);
		let clanMemberDiamonds = await getClanMemberDiamondContibutions(
			currentClanDetails,
			clanMembers
		);
		let clanMemberPoints = await getClanMemberPointContibutions(currentClanDetails, clanMembers);
		clanMemberFullDetails = await getClanMemberFullDetails(clanMemberDiamonds, clanMemberPoints);
		clanMemberFullDetails = clanMemberFullDetails.sort((a, b) => {
			return (
				b.Points.reduce((total, item) => total + item.Points, 0) -
				a.Points.reduce((total, item) => total + item.Points, 0)
			);
		});
		loadingData.set(false);
	});
</script>

<div bind:this={container} class="flex justify-between items-center mt-5 mx-5">
	<button
		type="button"
		class="btn-icon btn-icon-xl bg-initial"
		on:click={() => selectedClan.set('')}
	>
		<FontAwesomeIcon icon={faArrowLeft} />
	</button>
	<h1 class="text-4xl text-center flex-grow">{$selectedClan}</h1>
	<div class="btn-icon btn-icon-lg"></div>
</div>
<div class="my-2 mx-5 justify-end flex gap-2">
	{#each ['Current Battle', 'Totals'] as c}
		<button
			class="chip {levelOfDetail === c ? 'variant-filled' : 'variant-soft'}"
			on:click={() => {
				section(c);
			}}
			on:keypress
		>
			{#if levelOfDetail === c}<FontAwesomeIcon icon={faCheck} />{/if}
			<span>{c}</span>
		</button>
	{/each}
</div>
{#if $loadingData}
	<TablePlaceholder />
{:else if clanMemberFullDetails.length > 0}
	{#if levelOfDetail === 'Current Battle'}
		<ClanMemberCurrent {clanMemberFullDetails} {activeClanBattle} {selectedPastClanDetails} />
	{:else if levelOfDetail === 'Totals'}
		<ClanMemberTotals {clanMemberFullDetails} />
	{/if}
{:else if !$selectedClan}
	<div class="placeholder-container">
		<p class="placeholder-text">Please select a clan</p>
	</div>
{:else}
	<div class="placeholder-container">
		<p class="placeholder-text">No members found for this clan</p>
	</div>
{/if}

<style>
	.placeholder-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
	}
	.placeholder-text {
		font-size: 1.5rem;
	}
</style>
