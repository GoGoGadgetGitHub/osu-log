<script>
	import FarLeft from "$lib/Svg/FarLeft.svelte";
	import FarRight from "$lib/Svg/FarRight.svelte";
	import Left from "$lib/Svg/Left.svelte";
	import Right from "$lib/Svg/Right.svelte";
	import axios from "axios";

	let { maxSessions, changeSession } = $props();
	let pointer = $derived(maxSessions <= 4 ? maxSessions : 4);

	let pages = $derived.by(() => {
		let selected = "";
		let pages = [];
		if (maxSessions <= 4) {
			for (let i = 0; i <= maxSessions; i++) {
				i === maxSessions
					? pages.push({ value: i, selected: "selected" })
					: pages.push({ value: i, selected });
			}
		} else {
			for (let i = 0; i <= 4; i++) {
				i === 4
					? pages.push({
							value: maxSessions - (5 - (i + 1)),
							selected: "selected",
						})
					: pages.push({ value: maxSessions - (5 - (i + 1)), selected });
			}
		}
		return pages;
	});

	function move(direction) {
		const right = direction == 1;
		const pointerMax = maxSessions <= 4 ? maxSessions : 4;

		const atEnd =
			(pages[pointerMax].value === maxSessions && right) ||
			(pages[0].value === 0 && !right);

		const pointerAtBound =
			(pointer === pointerMax && right) || (pointer === 0 && !right);

		const notMiddle = pointer != 2;

		if (pointerAtBound) {
			return;
		}
		if (maxSessions <= 4 || atEnd || notMiddle) {
			pointer = pointer + direction;
		} else {
			pages = pages.map((page) => ({
				...page,
				value: page.value + direction,
			}));
		}
	}

	function moveEnd() {
		const end = maxSessions <= 4 ? maxSessions + 1 : 5;
		pages = pages.map((page, i) => {
			return {
				...page,
				value: maxSessions - (end - (i + 1)),
			};
		});
		pointer = maxSessions <= 4 ? maxSessions : 4;
		updateSelected();
		changeSession(pages[pointer].value);
	}

	function moveStart() {
		pages = pages.map((page, i) => {
			return {
				...page,
				value: i,
			};
		});
		pointer = 0;
		updateSelected();
		changeSession(pages[pointer].value);
	}

	function moveN(page) {
		page.preventDefault();

		let moves, direction;
		if (page.target.id !== "") {
			moves = 1;
			direction = page.target.id === "right" ? 1 : -1;
		} else {
			const selectedSession = page.target.innerHTML;
			const currentSession = pages[pointer].value;
			moves = selectedSession - currentSession;
			direction = Math.sign(moves);
		}

		for (let i = 1; i <= Math.abs(moves); i++) {
			move(direction);
		}
		updateSelected();
		changeSession(pages[pointer].value);
	}

	function updateSelected() {
		pages = pages.map((page) =>
			pages[pointer] === page
				? {
						...page,
						selected: "selected",
					}
				: {
						...page,
						selected: "",
					},
		);
	}
</script>

<div class="pagination bottom-gap">
	<div class="pag-icon wide">
		<a href onclick={moveStart}><FarLeft class="nav-icon" /></a>
	</div>
	<div class="pag-icon">
		<a href id="left" onclick={moveN}><Left /></a>
	</div>

	{#each pages as page}
		<a href class="page {page.selected}" onclick={moveN} role="button"
			>{page.value}</a
		>
	{/each}

	<div class="pag-icon">
		<a href id="right" onclick={moveN}><Right /></a>
	</div>
	<div class="pag-icon wide">
		<a href onclick={moveEnd}><FarRight /></a>
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

	.pag-icon a {
		display: flex;
		align-items: center;
	}

	/*NOTE: GLOBAL HERE*/
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
