<script>
    import ScoresTable from "$lib/ScoresTable/ScoresTable.svelte";
    import SessionControls from "$lib/Session/SessionControls.svelte";
    import SessionSummary from "$lib/Session/SessionSummary.svelte";
    import Charts from "$lib/Charts/Charts.svelte";
    import SessionFilter from "$lib/Filter/SessionFilter.svelte";

    let { userData, error = $bindable("") } = $props();
    let sessionScores = $state({});
    let scoresLoading = $state({});
</script>

<SessionControls bind:error bind:sessionScores bind:scoresLoading {userData} />
<SessionSummary {sessionScores} />
<ScoresTable {sessionScores} {scoresLoading} />
<Charts {sessionScores} />
