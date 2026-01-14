<script>
	import { A, B, C, D, F, S, X, Sh, Xh } from "$lib";
	import Star from "$lib/Svg/Star.svelte";
	import { fade, slide } from "svelte/transition";

	import LargeLoader from "$lib/UIComponents/Loaders/LargeLoader.svelte";
	import SmallLoader from "$lib/UIComponents/Loaders/SmallLoader.svelte";
	import SortingDropdown from "./SortingDropdown.svelte";
	import SortingArrows from "./SortingArrows.svelte";
	import Pagination from "./Pagination.svelte";

	//TODO: add scores sort dropdown for mobile

	const ASSC = -1;
	const DESC = 1;
	const NO_ORDER = 0;

	let lastOrder = $state({
		grade: { active: false, order: NO_ORDER },
		song: { active: false, order: NO_ORDER },
		sr: { active: false, order: NO_ORDER },
		acc: { active: false, order: NO_ORDER },
		pp: { active: false, order: NO_ORDER },
		set: { active: false, order: NO_ORDER },
	});

	let dateFormatter = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});

	let { sessionScores, changeSession, loading } = $props();
	let gradeIcons = { X, XH: Xh, S, SH: Sh, A, B, C, D, F };
	let index = $state(0);
	const paginationWidth = 100;

	let paginate = $derived(
		sessionScores.scores
			? sessionScores.scores.length > paginationWidth
				? true
				: false
			: false,
	);

	let paginationStartIndex = $derived(paginationWidth * index);

	let displayedScores = $derived.by(() => {
		let criteria;

		Object.keys(lastOrder).forEach((key) => {
			if (lastOrder[key].active) {
				criteria = key;
				return;
			}
		});

		let ret;
		if (!criteria || lastOrder[criteria].order === NO_ORDER) {
			ret = sessionScores.scores;
		} else {
			ret = sessionScores.scores.toSorted((a, b) => {
				a = scoreMap[criteria](a);
				b = scoreMap[criteria](b);

				if (typeof a === "string") {
					return lastOrder[criteria].order * a.localeCompare(b);
				}
				return lastOrder[criteria].order * (a - b);
			});
		}

		if (paginate) {
			return ret.slice(
				paginationStartIndex,
				paginationStartIndex + paginationWidth,
			);
		}

		return ret;
	});

	async function loadImage(src) {
		return new Promise((resolve) => {
			let img = new Image();
			img.onload = resolve;
			img.onerror = resolve;
			img.src = src;
		});
	}

	const scoreMap = {
		sr: (score) => {
			if (score.performance) return score.performance.attributes.stars;
			else return score.score.beatmap.difficulty_rating;
		},
		song: (score) => score.score.beatmapset.title,
		grade: (score) => (score.score.passed ? score.score.rank : "F"),
		pp: (score) => {
			if (score.score.pp) {
				return score.score.pp;
			}
			if (score.performance) {
				return score.performance.perf.pp;
			}
			return 0;
		},
		set: (score) => score.score.ended_at,
		acc: (score) => score.score.accuracy,
	};

	function sortBy(criteria) {
		if (lastOrder[criteria].order === DESC) {
			lastOrder[criteria].order = NO_ORDER;
		} else if (lastOrder[criteria].order === ASSC) {
			lastOrder[criteria].order = DESC;
		} else {
			lastOrder[criteria].order = ASSC;
		}

		Object.keys(lastOrder).forEach((key) => {
			lastOrder[key].active = false;
			if (key !== criteria) {
				lastOrder[key].order = NO_ORDER;
			}
		});

		lastOrder[criteria].active = true;
	}

	const columns = [
		{
			display: "Grade",
			sort: "grade",
		},
		{
			display: "Song Name",
			sort: "song",
		},
		{
			display: "Mods",
			sort: undefined,
		},
		{
			display: "Star",
			sort: "sr",
		},
		{
			display: "Accuracy",
			sort: "acc",
		},
		{
			display: "Hits",
			sort: undefined,
		},
		{
			display: "PP",
			sort: "pp",
		},
		{
			display: "Set",
			sort: "set",
		},
	];
</script>

{#snippet tableRow(score, performance)}
	<tr
		in:fade
		style="background: center / contain no-repeat linear-gradient(to right, var(--background-1-rgba0), var(--background-1-rgba1) 95%), url({score
			.beatmapset.covers.slimcover})"
		id={`score-${score.id}`}
	>
		<th class="grade-icon">
			<div class="icon-wrapper">
				<svelte:component
					this={score.passed ? gradeIcons[score.rank] : gradeIcons.F}
				/>
			</div>
		</th>

		<th class="title">
			<a href={score.beatmap.url}><span>{score.beatmapset.title}</span></a>
		</th>

		<!--TODO:mod icons?-->
		<th class="mods">
			{#if score.mods}
				<div>
					{#each score.mods as { acronym }}
						{acronym}
					{/each}
				</div>
			{/if}
		</th>

		<th class="stars">
			{performance
				? performance.attributes.stars.toFixed(2)
				: score.beatmap.difficulty_rating}
		</th>

		<th class="acc">{(score.accuracy * 100).toFixed(2)}</th>

		<th class="hits">
			<div>
				{`${score.statistics.great ? score.statistics.great : 0}/
								${score.statistics.ok ? score.statistics.ok : 0}/
								${score.statistics.meh ? score.statistics.meh : 0}/
								${score.statistics.miss ? score.statistics.miss : 0}`}
			</div>
		</th>

		<th class="pp">
			{scoreMap.pp({ score, performance }).toFixed(2)}
		</th>

		<th class="last-col time">
			{dateFormatter.format(new Date(score.ended_at))}
		</th>
	</tr>
{/snippet}

<div transition:slide class="datatable-container">
	<SortingDropdown />

	<table>
		<thead transition:fade class="datatable-header">
			<tr>
				{#each columns as { display, sort }}
					<th
						onclick={sort
							? () => {
									sortBy(sort);
								}
							: undefined}
					>
						{#if display === "Star"}
							<Star />
						{:else}
							{display}
						{/if}
						{#if sort}
							<SortingArrows order={lastOrder[sort]} />
						{/if}
					</th>
				{/each}
			</tr>
		</thead>

		{#if !sessionScores.scores}
			<caption>
				No Scores!<br />Click on one of the highlighted dates on the calendar
			</caption>
		{/if}

		<tbody>
			{#each displayedScores as { score, performance }, index}
				{#await loadImage(score.beatmapset.covers.slimcover)}
					<tr transition:fade style="position: relative;">
						<SmallLoader />
					</tr>
				{:then}
					{@render tableRow(score, performance)}
				{/await}
			{/each}
		</tbody>
	</table>
</div>

{#if paginate}
	<div class="table-below">
		<Pagination
			bind:index
			numberOfScores={sessionScores.scores.length}
			{paginationWidth}
		/>
	</div>
{/if}

<style>
	@import "./scoretable.css";
</style>
