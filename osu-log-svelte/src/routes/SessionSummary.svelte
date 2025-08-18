<script>
    import A from "../svg/A.svelte";
    import B from "../svg/B.svelte";
    import C from "../svg/C.svelte";
    import D from "../svg/D.svelte";
    import S from "../svg/S.svelte";
    import Sh from "../svg/SH.svelte";
    import X from "../svg/X.svelte";
    import Xh from "../svg/XH.svelte";

    let { sessionScores } = $props();
    let { sr, acc, bpm, pp, passes, fails, plays } = $derived(
        sessionScores.meta.stats,
    );
    let { s, sh, x, xh, a, b, c, d, e } = $derived(
        sessionScores.meta.stats.gradeCounts,
    );
    let { duration } = $derived(sessionScores.meta.time);
</script>

<!--TODO: Make these loops!-->
<h2>Session Summary</h2>
<div class="session-summary">
    <div class="stats">
        <span class="stat">
            <span>Stars</span>
            <span>{sr.avg.toFixed(2)}<strong>★</strong></span>
        </span>
        <span class="stat">
            <span>Accuracy</span>
            <span>{(acc.avg * 100).toFixed(2)}%</span>
        </span>
        <span class="stat">
            <span>PP</span>
            <span>{pp.avg.toFixed(2)}pp</span>
        </span>
        <span class="stat">
            <span>BPM</span>
            <span>{bpm.avg.toFixed(2)}</span>
        </span>
    </div>
    <div class="stats">
        <span class="stat">
            <span>Total Play Time:</span>
            <span>{duration}</span>
        </span>
        <span class="stat">
            <span>Plays:</span>
            <span>{plays}</span>
        </span>
        <span class="stat">
            <span>Passes</span>
            <span>{passes}</span>
        </span>
        <span class="stat">
            <span>Fails</span>
            <span>{fails}</span>
        </span>
    </div>
    <div class="grades">
        {#if s > 0}
            <span class="grade">
                <span><S /></span>
                <span>{s}</span>
            </span>
        {/if}
        {#if sh > 0}
            <span class="grade">
                <span><Sh /></span>
                <span>{sh}</span>
            </span>
        {/if}
        {#if x > 0}
            <span class="grade">
                <span><X /></span>
                <span>{x}</span>
            </span>
        {/if}
        {#if xh > 0}
            <span class="grade">
                <span><Xh /></span>
                <span>{xh}</span>
            </span>
        {/if}
        {#if a > 0}
            <span class="grade">
                <span><A /></span>
                <span>{a}</span>
            </span>
        {/if}
        {#if b > 0}
            <span class="grade">
                <span><B /></span>
                <span>{b}</span>
            </span>
        {/if}
        {#if c > 0}
            <span class="grade">
                <span><C /></span>
                <span>{c}</span>
            </span>
        {/if}
        {#if d > 0}
            <span class="grade">
                <span><D /></span>
                <span>{d}</span>
            </span>
        {/if}
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
    .stat span:nth-child(2) {
        background: var(--foreground);
        width: 100%;
        color: var(--background);
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
    .grade span:nth-child(2) {
        background: var(--foreground);
        color: var(--background);
        display: grid;
        padding: 0.2rem;
        width: 100%;
        text-align: center;
        font-weight: bold;
    }
    .grade:first-of-type span:nth-child(2) {
        border-radius: var(--radius) 0 0 var(--radius);
    }

    .grade:last-of-type span:nth-child(2) {
        border-radius: 0 var(--radius) var(--radius) 0;
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
