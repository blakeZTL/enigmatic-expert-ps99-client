<script lang="ts">
	import ClanTotals from '$lib/components/ClanTotals.svelte';
	import ClanDetails from '$lib/components/ClanDetails.svelte';
	import { selectedClan, loadingData } from '$lib/stores';
	import TablePlaceholder from '$lib/components/TablePlaceholder.svelte';
</script>

{#if $selectedClan !== ''}
	<ClanDetails />
{:else}
	<ClanTotals />
{/if}
