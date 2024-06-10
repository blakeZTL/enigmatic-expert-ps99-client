<script lang="ts">
	import {
		type ClanMemberFullDetails,
		type clansData,
		type ps99ApiResponse
	} from '$lib/get-ps99-data';
	import { convertNumberToMultiples } from '$lib/utils';

	export let selectedMember: ClanMemberFullDetails;
</script>

<div class="card">
	<header class="card-header font-extralight">Member Details</header>
	<section class="p-4">
		<h2 class="text-3xl mb-3">{selectedMember.name}</h2>
		<ul>
			{#each selectedMember.Points as point, i}
				<li><i>{point.BattleID}</i>: {convertNumberToMultiples(point.Points)}</li>
			{/each}
		</ul>
	</section>
	<footer class="card-footer font-light">
		<strong>Contributed Diamonds:</strong>
		{convertNumberToMultiples(selectedMember.Diamonds)}
	</footer>
</div>
