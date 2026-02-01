<script>
    import { A, B, C, D, F, S, X, Sh, Xh } from "$lib";

    let gradeIcons = { X, XH: Xh, S, SH: Sh, A, B, C, D };
    let { sessionScores } = $props();
    let { sr, acc, bpm, pp, passes, fails, plays, playtime } = $derived(
        sessionScores.meta ? sessionScores.meta.stats : {},
    );
    const { topStats, bottomStats } = $derived({
        topStats: [
            { name: "Stars", stat: sr.avg },
            { name: "Accuracy", stat: acc.avg * 100 },
            { name: "BPM", stat: bpm.avg },
            { name: "PP", stat: pp.avg },
        ],
        bottomStats: [
            { name: "Playtime", stat: formatSeconds(playtime) },
            { name: "Passes", stat: passes },
            { name: "Fails", stat: fails },
            { name: "Plays", stat: plays },
        ],
    });

    let grades = $derived(sessionScores.meta.stats.gradeCounts);

    function formatSeconds(totalSeconds) {
        totalSeconds = Math.floor(totalSeconds);

        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const parts = [];

        if (hours) parts.push(hours < 10 ? `0${hours}` : `${hours}`);
        else parts.push("00");
        if (minutes) parts.push(minutes < 10 ? `0${minutes}` : `${minutes}`);
        else parts.push("00");
        if (seconds || parts.length === 0) parts.push(`${seconds}`);

        return parts.join(":");
    }
</script>

{$inspect(sr, acc, bpm, pp, passes, fails, plays, playtime)}

<div class="container" id="summary">
    {#if sessionScores.meta}
        <h2>Session Summary</h2>
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
    {/if}
</div>

<style>
    .container {
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
