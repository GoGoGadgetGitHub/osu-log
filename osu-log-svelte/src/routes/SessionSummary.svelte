<script>
    import { derived } from "svelte/store";
    import A from "../svg/A.svelte";
    import B from "../svg/B.svelte";
    import C from "../svg/C.svelte";
    import D from "../svg/D.svelte";
    import S from "../svg/S.svelte";
    import Sh from "../svg/SH.svelte";
    import X from "../svg/X.svelte";
    import Xh from "../svg/XH.svelte";
    import { each } from "chart.js/helpers";

    let gradeIcons = { X, XH: Xh, S, SH: Sh, A, B, C, D };
    let { sessionScores } = $props();
    let { sr, acc, bpm, pp, passes, fails, plays } = $derived(
        sessionScores.meta.stats,
    );
    const { topStats, bottomStats } = $derived({
        topStats: [
            { name: "Stars", stat: sr.avg },
            { name: "Accuracy", stat: acc.avg * 100 },
            { name: "BPM", stat: bpm.avg },
            { name: "PP", stat: pp.avg },
        ],
        bottomStats: [
            { name: "Play Time", stat: sessionScores.meta.time.duration },
            { name: "Passes", stat: passes },
            { name: "Fails", stat: fails },
            { name: "Plays", stat: plays },
        ],
    });

    let grades = $derived(sessionScores.meta.stats.gradeCounts);

    let { duration } = $derived(sessionScores.meta.time);
</script>

<!--TODO: Make these loops!-->
<h2>Session Summary</h2>
<div class="session-summary">
    <div class="stats">
        {#each topStats as { name, stat }}
            <span class="stat">
                <span>{name}</span>
                <span class={name.toLowerCase()}>{stat.toFixed(2)}</span>
            </span>
        {/each}
    </div>
    <div class="stats">
        {#each bottomStats as { name, stat }}
            <span class="stat">
                <span>{name}</span>
                <span class={name.toLowerCase()}>{stat}</span>
            </span>
        {/each}
    </div>
    <div class="grades">
        {#each grades as { grade, count }}
            {#if count > 0}
                {$inspect(gradeIcons[grade.toUpperCase()])}
                <span class="grade">
                    <span>
                        <svelte:component
                            this={gradeIcons[grade.toUpperCase()]}
                        />
                    </span>
                    <span>{count}</span>
                </span>
            {/if}
        {/each}
    </div>
</div>

<style>
    .session-summary {
        color: var(--foreground);
        padding: 0.5rem;
        border-radius: var(--radius);
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        max-width: 90%;
        margin: auto;
        gap: 1rem;
    }

    .grade,
    .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .stat span:nth-child(1) {
        font-weight: bold;
    }

    .grade span:nth-child(2),
    .stat span:nth-child(2) {
        background: #22222a;
        width: 100%;
        color: var(--foreground);
        text-align: center;
        border-radius: var(--radius);
    }

    :global(.grade span:nth-child(1) svg) {
        width: 3rem;
        margin: auto;
        padding: 0 1rem;
    }

    .grade span:nth-child(1) {
        width: 100%;
    }

    .stat span {
        padding: 0.1rem 0.4rem;
    }
    .stats {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .grades {
        display: flex;
        justify-content: center;
        gap: 1rem;
    }

    h2 {
        text-align: center;
        color: var(--foreground);
        margin: 0;
    }

    @media (max-width: 800px) {
        .session-summary {
            color: var(--foreground);
            padding: 0.5rem;
            border-radius: var(--radius);
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            gap: 1rem;
        }
    }
</style>
