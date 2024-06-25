<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar, LightSwitch } from '@skeletonlabs/skeleton';

	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import {
		faBars,
		faChartBar,
		faMagnifyingGlassChart,
		faCircleHalfStroke
	} from '@fortawesome/free-solid-svg-icons';

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });

	import { Toast } from '@skeletonlabs/skeleton';

	// Modal
	import { initializeStores, Modal, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	initializeStores();

	const drawerStore = getDrawerStore();
	const navDrawerSettings = {
		id: 'nav-drawer',
		placement: 'left',
		overlay: true,
		overlayClose: true,
		overlayColor: 'rgba(0, 0, 0, 0.5)',
		overlayOpacity: 0.5,
		overlayTransition: 'opacity 0.3s ease',
		transition: 'transform 0.3s ease',
		width: 'w-[280px] md:w-[480px]'
	};
</script>

<Modal />
<Toast />
<Drawer>
	{#if $drawerStore.id === 'nav-drawer'}
		<h1 class="text-2xl p-5">Navigation</h1>
		<nav class="p-5">
			<ul class="text-xl flex flex-col gap-y-5">
				<li>
					<a
						href="/"
						class="flex items-center w-full p-2 -m-2"
						on:click={() => drawerStore.close()}
					>
						<FontAwesomeIcon icon={faChartBar} class="text-4xl mr-2" />
						<span>Clan Battle Stats</span>
					</a>
				</li>
				<li>
					<a
						href="/user-analysis"
						class="flex items-center w-full p-2 -m-2"
						on:click={() => drawerStore.close()}
					>
						<FontAwesomeIcon icon={faMagnifyingGlassChart} class="text-4xl mr-2" />
						<span>User Analysis</span>
					</a>
				</li>
			</ul>
		</nav>
	{/if}
</Drawer>
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<a
					href="/"
					class="btn icon !bg-transparent mr-5"
					on:click={() => drawerStore.open(navDrawerSettings)}
				>
					<FontAwesomeIcon icon={faBars} class="text-4xl" />
				</a>
				<strong class="text-xl uppercase">Clan Battle Stats</strong>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
				<a
					class="btn icon variant-ghost-surface"
					href="https://github.com/blakeZTL/enigmatic-expert-ps99-client"
					target="_blank"
					rel="noreferrer"
				>
					<FontAwesomeIcon icon={faGithub} />
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<slot />
</AppShell>
