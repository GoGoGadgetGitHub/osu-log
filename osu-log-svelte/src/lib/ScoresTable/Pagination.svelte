<script>
	import FarLeft from "$lib/Svg/FarLeft.svelte";
	import FarRight from "$lib/Svg/FarRight.svelte";
	import Left from "$lib/Svg/Left.svelte";
	import Right from "$lib/Svg/Right.svelte";
	import axios from "axios";

	let { numberOfScores, index = $bindable(0), paginationWidth } = $props();

	let pages = $derived.by(() => {
		let ret = [];
		const numPages = Math.ceil(numberOfScores / paginationWidth);
		for (let i = 0; i <= numPages - 1; i++) {
			ret.push(i);
		}
		return ret;
	});

	function end() {
		index = pages.length - 1;
	}
	function start() {
		index = 0;
	}

	const left = () => move(-1);
	const right = () => move(1);
	function move(direction) {
		const newIndex = index + direction;
		if (newIndex > pages.length - 1) {
			return;
		}
		if (newIndex < 0) {
			return;
		}
		index = newIndex;
	}

	const goToSelectedHandeler = (e) => goToSelected(e);
	function goToSelected(e) {
		index = Number(e.target.dataset.index);
	}
</script>

<div class="pagination bottom-gap">
	<div class="pag-icon wide">
		<button onclick={start}><FarLeft class="nav-icon" /></button>
	</div>
	<div class="pag-icon">
		<button onclick={left}><Left /></button>
	</div>

	{#each pages as page}
		{#if page === index}
			<button data-index={page} class="page selected" onclick={goToSelected}
				>{page + 1}</button
			>
		{:else}
			<button data-index={page} class="page" onclick={goToSelectedHandeler}
				>{page + 1}</button
			>
		{/if}
	{/each}

	<div class="pag-icon">
		<button onclick={right}><Right /></button>
	</div>
	<div class="pag-icon wide">
		<button href onclick={end}><FarRight /></button>
	</div>
</div>

<style>
	.pagination {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		width: max-content;
	}
	.pag-icon {
		fill: var(--foreground);
	}

	.pag-icon button {
		display: flex;
		align-items: center;
		background: none;
		border: none;
	}

	:global(.pag-icon.wide svg) {
		height: 1rem;
		width: 1.1rem;
	}

	:global(.pag-icon svg) {
		height: 1rem;
		width: 0.6rem;
	}

	.page {
		color: var(--foreground);
		text-align: center;
		transition: 0.2s ease-in-out;
		text-decoration: none;
		background: var(--background-light);
		border: none;
		height: 30px;
		width: 30px;
		border-radius: 50%;
	}

	.pag-icon:hover,
	.page:hover {
		color: var(--hover);
		fill: var(--hover);
		cursor: pointer;
	}

	.selected {
		color: var(--hover);
	}
</style>
