<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, tick } from 'svelte';
	import { InputChip, Autocomplete } from '@skeletonlabs/skeleton';
	import type { AutocompleteOption } from '@skeletonlabs/skeleton';
	import type {
		robloxUserData,
		clanData,
		Battles,
		Battle,
		PointContribution
	} from '$lib/get-ps99-data';
	import { getClan } from '$lib/get-ps99-data';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import type { ToastSettings } from '@skeletonlabs/skeleton';
	import { convertNumberToMultiples } from '$lib/utils';

	export let data: PageData;

	const toastStore = getToastStore();

	interface apiRobloxUser extends robloxUserData {
		id: number;
	}
	let { clanNames } = data;

	let selectedClans: string[] = [];
	let clanInput: string = '';
	let usersClanData: clanData[] = [];
	let isLoadingClans = true; // Add a loading state for clans
	let analysisComplete = false;

	onMount(async () => {
		await tick();
	});
	let robloxUserInput = '';
	let robloxUser: apiRobloxUser;
	async function getRobloxUserByUserName(userName: string) {
		const url =
			process.env.NODE_ENV === 'development'
				? 'http://localhost:8000/roblox-users/username/'
				: `${import.meta.env.VITE_PROD_ENDPOINT}/roblox-users/username/`;
		const response = await fetch(url + userName);

		const data = await response.json();
		if (data) {
			robloxUser = data as apiRobloxUser;
			console.debug('robloxUser', robloxUser);
		}
	}

	function findUserInBattle(userId: number, battles: Battles) {
		const battlesWithUser: string[] = [];
		for (const battleID in battles) {
			const battle = battles[battleID];
			const userContribution = battle.PointContributions.find(
				(contribution: PointContribution) => contribution.UserID === userId
			);

			if (userContribution) {
				battlesWithUser.push(battleID);
			}
		}

		return battlesWithUser;
	}

	let clanOptions: AutocompleteOption<string>[] = []; // Initialize as empty array

	// Reactive statement to update clanOptions when clanNames resolves
	$: if (clanNames) {
		clanNames.then((resolvedClanNames) => {
			clanOptions = resolvedClanNames.map((clanName) => ({ label: clanName, value: clanName }));
		});
	}
	$: console.debug('selectedClans', selectedClans);

	const userNotFoundInClanToast: ToastSettings = {
		message: `User ${robloxUser ? robloxUser.name : 'Unknown'} did not contribute to any battles or deposit diamonds in this clan.`
	};

	const addClan = async (clanName: string) => {
		clanName = clanName.toUpperCase();
		clanInput = '';
		if (isLoadingClans || selectedClans.includes(clanName)) {
			return;
		}
		console.debug('addClan', clanName);
		isLoadingClans = true;
		clanOptions = clanOptions.filter((clanName) => !selectedClans.includes(clanName.value));
		const selectedClanData = await getClan(clanName);
		if (selectedClanData) {
			const clanData = selectedClanData.data as clanData;
			let didContributeDiamonds = false;
			if (robloxUser) {
				didContributeDiamonds = clanData.DiamondContributions.AllTime.Data.map(
					(contribution) => contribution.UserID
				).includes(robloxUser.id);
			}
			console.debug('didContributeDiamonds for ' + clanName, didContributeDiamonds);
			const battlesWithUser = [];
			if (robloxUser) {
				battlesWithUser = findUserInBattle(robloxUser.id, clanData.Battles);
			}
			if (battlesWithUser.length > 0 || didContributeDiamonds) {
				usersClanData = [...usersClanData, clanData];
				const lowerCasedSelectedClans = selectedClans.map((clan) => clan.toLowerCase());
				if (!lowerCasedSelectedClans.includes(clanName.toLowerCase())) {
					selectedClans = [...selectedClans, clanName];
				}
			} else {
				toastStore.trigger(userNotFoundInClanToast);
				clanInput = '';
			}
		}
		isLoadingClans = false;
	};

	async function onClanSelection(event: CustomEvent<AutocompleteOption<string>>) {
		event.preventDefault();
		console.debug('onClanSelection', event.detail);
		const clanName = event.detail.value.toUpperCase();
		if (!selectedClans.includes(clanName)) {
			await addClan(clanName);
			const clanChipInput = document.querySelector('.selectedClanChips') as HTMLInputElement;
			if (clanChipInput) {
				clanChipInput.focus();
			}
		}
	}

	function checkForSelectedClan(clanName: string) {
		return !selectedClans.includes(clanName);
	}
	interface UserDiamondContribution {
		Diamonds: string;
		Rank: number;
	}

	interface UserAnalysisData {
		clanName: string;
		rankedDiamondContribution: UserDiamondContribution;
		rankedUserBattleData: {
			battle: string;
			userPointContribution: {
				UserID: number;
				Points: number;
				rank: number;
			};
		}[];
	}
	let userAnalysisData: UserAnalysisData[] = [];
	const runUserAnalysis = (user: apiRobloxUser, clans: clanData[]): void => {
		console.debug('runUserAnalysis', user, clans);
		clans.forEach((clan) => {
			const clanName = clan.Name;
			const rankedDiamondContribution: UserDiamondContribution =
				clan.DiamondContributions.AllTime.Data.sort((a, b) => b.Diamonds - a.Diamonds)
					.map((contribution, i) => {
						return {
							...contribution,
							rank: i + 1
						};
					})
					.filter((contribution) => contribution.UserID === user.id)
					.map((contribution, i) => {
						const convertedDiamonds = convertNumberToMultiples(contribution.Diamonds);
						return { Diamonds: convertedDiamonds, Rank: contribution.rank };
					})[0] || { Diamonds: 'Unknown', Rank: 0 };

			const userBattles = findUserInBattle(user.id, clan.Battles);
			const userBattleData = Object.keys(clan.Battles)
				.filter((battleID) => userBattles.includes(battleID))
				.map((battleID) => clan.Battles[battleID]);
			const rankedUserBattleData = userBattleData.map((battle) => {
				const pointContributions = battle.PointContributions.sort(
					(a, b) => b.Points - a.Points
				).map((contribution, i) => {
					return {
						...contribution,
						rank: i + 1
					};
				});
				const userPointContribution = pointContributions.find(
					(contribution) => contribution.UserID === user.id
				);
				return {
					battle: battle.BattleID,
					userPointContribution
				};
			});

			userAnalysisData = [
				...userAnalysisData,
				{ clanName, rankedDiamondContribution, rankedUserBattleData }
			];
		});
		console.debug('userAnalysisData', userAnalysisData);
		analysisComplete = true;
		toastStore.trigger({
			message: `Analysis for ${user.name} complete.`
		});
	};

	const resetAnalysis = () => {
		robloxUser = null;
		selectedClans = [];
		clanInput = '';
		usersClanData = [];
		isLoadingClans = false;
		analysisComplete = false;
		userAnalysisData = [];
		robloxUserInput = '';
	};
</script>

<div class="m-5 flex flex-col gap-3">
	{#if analysisComplete}
		<div class="flex justify-end">
			<button
				type="reset"
				class="btn bg-gradient-to-br variant-gradient-success-warning w-[150px] font-semibold"
				on:click={resetAnalysis}>Reset Analysis</button
			>
		</div>
	{/if}
	{#if !analysisComplete}
		<p class="text-lg">Enter a Roblox user name</p>
		<input
			class="input"
			placeholder="Enter Roblox user name (not display name)"
			type="text"
			bind:value={robloxUserInput}
			disabled={robloxUser}
		/>
		<button
			type="button"
			class="btn bg-gradient-to-br variant-gradient-primary-secondary"
			disabled={!robloxUserInput || robloxUser}
			on:click={() => getRobloxUserByUserName(robloxUserInput)}
			><span>Get User Information</span></button
		>
		{#if robloxUser}
			<p class="text-lg">Enter clan name(s)</p>
			<InputChip
				name="selectedClanChips"
				placeholder="Input Clan Name(s)"
				bind:value={selectedClans}
				bind:input={clanInput}
				validation={checkForSelectedClan}
				disabled={isLoadingClans || userAnalysisData.length > 0}
				allowUpperCase
				regionInput="selectedClanChips"
				on:add={async () => {
					if (!selectedClans.includes(clanInput.toUpperCase())) {
						await addClan(clanInput.toUpperCase());
						const clanInputChip = document.querySelector('.selectedClanChips');
						if (clanInputChip) {
							clanInputChip.focus();
						}
					}
				}}
				on:keypress={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
					}
				}}
			/>
			{#if clanInput.length > 0 && !isLoadingClans}
				<div class="card w-full max-w-sm max-h-48 p-4 overflow-y-auto" tabindex="-1">
					<Autocomplete
						bind:input={clanInput}
						options={clanOptions}
						on:selection={onClanSelection}
					/>
				</div>
			{/if}
			{#if isLoadingClans}
				<div>Loading clan data...</div>
			{/if}
			{#if usersClanData.length > 0 && !isLoadingClans}
				<button
					type="button"
					class="btn bg-gradient-to-br variant-gradient-primary-secondary"
					disabled={isLoadingClans || userAnalysisData.length > 0}
					on:click={() => runUserAnalysis(robloxUser, usersClanData)}>Run analysis</button
				>
			{/if}
		{/if}
	{/if}
	{#if userAnalysisData.length > 0 && analysisComplete}
		<h2 class="text-2xl">{robloxUser ? robloxUser.name : 'Unknown'}</h2>
		<p><i>If user didn't finish clan battle with a clan, data will not be present</i></p>
		{#each userAnalysisData as analysis}
			<div class="card p-5 flex flex-col gap-3">
				<h3 class="text-lg">{analysis.clanName} Clan</h3>
				<p class="text-lg">Diamonds: {analysis.rankedDiamondContribution.Diamonds}</p>
				{#if analysis.rankedUserBattleData.length > 0}
					<table class="table table-hover">
						<thead>
							<tr>
								<th>Battle</th>
								<th>Points</th>
								<th>Rank</th>
							</tr>
						</thead>
						<tbody>
							{#each analysis.rankedUserBattleData as battleData}
								<tr>
									<td>{battleData.battle}</td>
									<td>{battleData.userPointContribution.Points}</td>
									<td>{battleData.userPointContribution.rank}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/each}
	{/if}
</div>
