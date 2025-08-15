<script>
	import A from "../svg/A.svelte";
	import B from "../svg/B.svelte";
	import C from "../svg/C.svelte";
	import D from "../svg/D.svelte";
	import F from "../svg/F.svelte";
	import S from "../svg/S.svelte";
	import Sh from "../svg/SH.svelte";
	import Xh from "../svg/XH.svelte";
	import X from "../svg/X.svelte";
	import Star from "../svg/Star.svelte";
	import { crossfade, draw, fade, slide } from "svelte/transition";
	import Pagination from "./Pagination.svelte";

	//TODO: add scores sort dropdown for mobile

	let { sessionScores, maxSessions, changeSession } = $props();
	let gradeIcons = { X, XH: Xh, S, SH: Sh, A, B, C, D, F };

	let dateFormatter = new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	});

	async function loadImage(src) {
		return new Promise((resolve) => {
			let img = new Image();
			img.onload = resolve;
			img.src = src;
		});
	}

	//NOTE: this is pretty slow
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

	let lastOrder = {
		grade: 1,
		song: 1,
		sr: 1,
		acc: 1,
		pp: 1,
		set: 1,
	};

	function sortBy(criteria) {
		sessionScores.scores.sort((a, b) => {
			a = scoreMap[criteria](a);
			b = scoreMap[criteria](b);

			if (typeof a === "string") {
				return lastOrder[criteria] * a.localeCompare(b);
			}
			return lastOrder[criteria] * (a - b);
		});
		lastOrder[criteria] = -lastOrder[criteria];
	}
</script>

<div transition:slide class="datatable-container">
	<table>
		<thead class="datatable-header">
			<tr>
				<th
					onclick={() => {
						sortBy("grade");
					}}>Grade</th
				>

				<th
					onclick={() => {
						sortBy("song");
					}}>Song Name</th
				>

				<th>Mods</th>

				<th
					onclick={() => {
						sortBy("sr");
					}}><Star /></th
				>

				<th
					onclick={() => {
						sortBy("acc");
					}}>Accuracy</th
				>

				<th>Hits</th>

				<th
					onclick={() => {
						sortBy("pp");
					}}>PP</th
				>

				<th
					onclick={() => {
						sortBy("set");
					}}>Set</th
				>
			</tr>
		</thead>
		<tbody>
			{#each sessionScores.scores as { score, performance }}
				{#await loadImage(score.beatmapset.covers.slimcover) then _}
					<tr
						in:fade
						style="background: center / contain no-repeat linear-gradient(to right, var(--background-rgba0), var(--background-rgba1) 95%), url({score
							.beatmapset.covers.slimcover})"
					>
						<th class="grade-icon">
							<div class="icon-wrapper">
								<svelte:component
									this={score.passed ? gradeIcons[score.rank] : gradeIcons.F}
								/>
							</div>
						</th>

						<th class="title">
							<a href={score.beatmap.url}>{score.beatmapset.title}</a>
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
				{/await}
			{/each}
		</tbody>
	</table>
</div>
<div class="table-below">
	{#if maxSessions}
		<Pagination {maxSessions} {changeSession} />
	{/if}
	{#if sessionScores.scores}
		<div>{sessionScores.scores.length} Scores</div>
		<div>
			{$inspect(sessionScores)}
			{dateFormatter.format(new Date(sessionScores.meta.time.start))}
			-
			{dateFormatter.format(new Date(sessionScores.meta.time.end))}
		</div>
		<div>
			{sessionScores.meta.time.duration}
		</div>
	{/if}
</div>

<style>
	@import "../css/components/scorestable.css";
</style>
