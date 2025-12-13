<script>
    import ScoresTable from "$lib/ScoresTable/ScoresTable.svelte";
    import SessionControls from "$lib/Session/SessionControls.svelte";
    import SessionSummary from "$lib/Session/SessionSummary.svelte";
    import Charts from "$lib/Charts/Charts.svelte";

    let { userData, error, loading } = $props();
    let sessionScores = $state({});
</script>

<SessionControls bind:sessionScores {userData} />

{#if sessionScores.scores}
    <ScoresTable {sessionScores} />
    <SessionSummary {sessionScores} />
    <Charts {sessionScores} />
{/if}
