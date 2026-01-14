<script>
    import ScoresTable from "$lib/ScoresTable/ScoresTable.svelte";
    import SessionControls from "$lib/Session/SessionControls.svelte";
    import SessionSummary from "$lib/Session/SessionSummary.svelte";
    import Charts from "$lib/Charts/Charts.svelte";
    import SessionFilter from "$lib/Filter/SessionFilter.svelte";

    let { userData, error = $bindable(""), loading, filter } = $props();
    let sessionScores = $state({});
</script>

<SessionControls bind:error bind:sessionScores {userData} {filter} />
<SessionFilter bind:filter />
<ScoresTable {sessionScores} />
<SessionSummary {sessionScores} />
<Charts {sessionScores} />
