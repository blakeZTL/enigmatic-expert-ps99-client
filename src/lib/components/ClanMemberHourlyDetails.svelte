<script lang="ts">
	import type { ClanMemberFullDetails, MemberPoints } from '$lib/get-ps99-data';
	import { convertNumberToMultiples } from '$lib/utils';

	export let selectedMember: ClanMemberFullDetails;
	export let selectedPastClanDetails: MemberPoints[];
</script>

<div class="card w-[400px] cursor-default">
	<section class="p-4">
		<p class="text-3xl mb-3 text-end">{selectedMember.name}</p>
		<p class="text-end">{convertNumberToMultiples(selectedMember.Points[0].Points)} Total Points</p>
	</section>
	<section>
		<h4 class="text-xl mb-3">Hourly Details</h4>
		<table class="table table-hover">
			<thead>
				<tr class="cursor-default">
					<th class="text-center">Time</th>
					<th class="text-center">Points</th>
					<th class="text-center">Delta</th>
				</tr>
			</thead>
			{#if selectedPastClanDetails}
				<tbody>
					{#each selectedPastClanDetails as point, i}
						<tr class="cursor-default">
							<td class="text-center">{point.createdOn.toLocaleString()}</td>
							<td class="text-center">{convertNumberToMultiples(point.points)}</td>
							<td class="text-center">
								{i === selectedPastClanDetails.length - 1
									? ''
									: convertNumberToMultiples(point.points - selectedPastClanDetails[i + 1].points)}
							</td>
						</tr>
					{/each}
				</tbody>
			{/if}
		</table>
	</section>
</div>
