<script lang="ts">
	import { convertNumberToMultiples } from '$lib/utils';
	import { type ClanMemberFullDetails } from '$lib/get-ps99-data';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { loadingData } from '$lib/stores';
	import MemberDetails from './MemberDetails.svelte';
	import TablePlaceholder from './TablePlaceholder.svelte';
	import { onMount, tick } from 'svelte';

	const modalStore = getModalStore();
	function showMemberDetails(member: ClanMemberFullDetails) {
		const modal: ModalSettings = {
			type: 'component',
			title: 'Member Details',
			component: {
				ref: MemberDetails,
				props: { selectedMember: member }
			}
		};
		modalStore.trigger(modal);
	}

	export let clanMemberFullDetails: ClanMemberFullDetails[] = [];

	onMount(async () => {
		await tick();
		console.debug('ClanMemberTotals.svelte: onMount()');
		loadingData.set(true);
		setTimeout(() => {
			loadingData.set(false);
		}, 1000);
	});

	$: console.log($loadingData);
</script>

<div class="m-5">
	{#if $loadingData}
		<TablePlaceholder />
	{:else}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th></th>
						<th class="text-center">Diamonds</th>
						<th class="text-center table-sort-dsc">Total Points</th>
					</tr>
				</thead>
				<tbody>
					{#each clanMemberFullDetails as member, i}
						<!--  -->
						<tr class="cursor-pointer">
							<td
								><button type="button" class="btn bg-initial cursor-default text-center">
									{`${i + 1}. ${member.name}`}
								</button></td
							>
							<td class=" text-center"
								><button type="button" class="btn bg-initial cursor-default">
									{convertNumberToMultiples(member.Diamonds)}
								</button></td
							>
							<td class=" text-center">
								<button
									type="button"
									class="btn btn-sm variant-ghost-primary"
									on:click={() => showMemberDetails(member)}
								>
									{convertNumberToMultiples(
										member.Points.reduce((total, item) => total + item.Points, 0)
									)} ({member.Points.length} battles)
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
