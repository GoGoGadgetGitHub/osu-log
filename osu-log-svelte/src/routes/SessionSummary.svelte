<script>
    let { sessionScores } = $props();
    let { sr, acc, bpm, pp, passes, fails, plays } = $derived(
        sessionScores.meta.stats,
    );
    let { duration } = $derived(sessionScores.meta.time);
</script>

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
</div>

<style>
    .session-summary {
        color: var(--foreground);
        padding: 0.5rem;
        border-radius: var(--radius);
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        gap: 1rem;
    }
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
    .stat span {
        padding: 0.1rem 0.4rem;
    }
    .stats {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-evenly;
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
