<script lang="ts">
	import { convertNumberToMultiples } from '$lib/utils';
	import type {
		ClanMemberFullDetails,
		activeClanBattle,
		Battle,
		MemberPoints
	} from '$lib/get-ps99-data';
	import type { dbClan } from '$lib/database';
	import { isDuringActiveClanBattle } from '$lib/stores';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import ClanMemberHourlyDetails from './ClanMemberHourlyDetails.svelte';
	import { getToastStore, type ToastSettings } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();
	const errorGettingDetailsToast: ToastSettings = {
		message: 'No detailed data available. Try again in an hour.'
	};

	export let clanMemberFullDetails: ClanMemberFullDetails[] = [];
	export let activeClanBattle: activeClanBattle;
	export let selectedPastClanDetails: dbClan[] = [];
	let currentBattleData: ClanMemberFullDetails[] = [];
	let errorGettingDetails = false;
	let memberNameSearch = '';

	const modalStore = getModalStore();

	function showMemberDetails(member: ClanMemberFullDetails) {
		try {
			const pastMemberDetails: MemberPoints[] = selectedPastClanDetails
				.map((clan) => ({
					createdOn: clan.created_on,
					points: (clan.data.Battles as unknown as Battle[])
						.filter((battle) => battle.BattleID === activeClanBattle.configName)
						.map((battle) => battle.PointContributions)
						.flat()
						.filter((contribution) => contribution.UserID === member.UserID)[0].Points
				}))
				//10 hours ago
				.filter(
					(memberRecord) => memberRecord.createdOn.getTime() > new Date().getTime() - 36000000
				)
				.sort((a, b) => b.createdOn.getTime() - a.createdOn.getTime());

			console.log(pastMemberDetails);

			const modal: ModalSettings = {
				type: 'component',
				title: 'Member Details',
				component: {
					ref: ClanMemberHourlyDetails,
					props: { selectedMember: member, selectedPastClanDetails: pastMemberDetails }
				}
			};
			modalStore.trigger(modal);
		} catch (e) {
			console.warn(e);
			toastStore.trigger(errorGettingDetailsToast);
		}
	}

	onMount(() => {
		currentBattleData = clanMemberFullDetails
			.map((member) => {
				return {
					...member,
					Points: member.Points.filter((point) => {
						return point.BattleID === activeClanBattle.configName;
					})
				};
			})
			.sort((a, b) => {
				return (
					b.Points.reduce((total, item) => total + item.Points, 0) -
					a.Points.reduce((total, item) => total + item.Points, 0)
				);
			});
	});
</script>

<div class="m-5">
	<input
		class="input mb-3"
		type="search"
		name="clanSearch"
		bind:value={memberNameSearch}
		placeholder="Search..."
	/>
	<div class="table-container cursor-default">
		<table class="table table-hover">
			<thead>
				<tr>
					<th>{activeClanBattle.configData.Title}</th>
					{#if !$isDuringActiveClanBattle}
						<th class="text-center">Diamonds</th>
					{/if}
					<th class="text-center table-sort-dsc">Total Points</th>
				</tr>
			</thead>
			<tbody>
				{#each currentBattleData.filter((member) => member.name && member.name
							.toUpperCase()
							.includes(memberNameSearch.toUpperCase())) as member, i}
					<tr>
						<td
							><button type="button" class="btn bg-initial cursor-default">
								{`${i + 1}. ${member.name}`}
							</button></td
						>
						{#if !$isDuringActiveClanBattle}
							<td class=" text-center"
								><button type="button" class="btn bg-initial cursor-default">
									{convertNumberToMultiples(member.Diamonds)}
								</button></td
							>
						{/if}
						<td class=" text-center">
							<button
								type="button"
								class="btn btn-sm variant-ghost-primary"
								on:click={() => showMemberDetails(member)}
							>
								{convertNumberToMultiples(
									member.Points.reduce((total, item) => total + item.Points, 0)
								)}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
{#if errorGettingDetails}
	<aside class="alert variant-ghost">
		<!-- Icon -->
		<div>(icon)</div>
		<!-- Message -->
		<div class="alert-message">
			<h3 class="h3">Detailed Data Error</h3>
			<p>No detailed data available. Try again in an hour.</p>
		</div>
		<!-- Actions -->
		<div class="alert-actions">(buttons)</div>
	</aside>
{/if}
