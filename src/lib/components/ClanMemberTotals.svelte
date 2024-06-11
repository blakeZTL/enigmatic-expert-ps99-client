<script lang="ts">
	import { convertNumberToMultiples } from '$lib/utils';
	import { type ClanMemberFullDetails } from '$lib/get-ps99-data';
	import { getModalStore, type ModalSettings } from '@skeletonlabs/skeleton';
	import { loadingData, isDuringActiveClanBattle } from '$lib/stores';
	import MemberDetails from './MemberDetails.svelte';
	import TablePlaceholder from './TablePlaceholder.svelte';

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
</script>

<div class="mt-5 mx-2 sm:mx-auto max-w-[600px] flex justify-center">
	{#if $loadingData}
		<TablePlaceholder />
	{:else}
		<div class="table-container">
			<table class="table table-hover">
				<thead>
					<tr>
						<th></th>
						{#if !$isDuringActiveClanBattle}
							<th class="text-center">Diamonds</th>
						{/if}
						<th class="text-center table-sort-dsc">Total Points</th>
					</tr>
				</thead>
				<tbody>
					{#each clanMemberFullDetails as member, i}
						<!--  -->
						<tr class="cursor-pointer">
							<td class="p-1"
								><button
									type="button"
									class="btn bg-initial cursor-default text-center p-0 items-center"
								>
									<p class="h-full">{`${i + 1}. ${member.name}`}</p>
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
