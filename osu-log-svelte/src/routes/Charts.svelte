<script>
    import FarLeft from "../svg/FarLeft.svelte";
    import FarRight from "../svg/FarRight.svelte";
    import BarChart from "./BarChart.svelte";
    import LineChartOverTime from "./LineChartOverTime.svelte";
    let { sessionScores } = $props();
</script>

<div>
    <div class="charts-tabs-container">
        <div class="tab">
            <span> Line </span>
        </div>
        <div class="tab active">
            <span> Bar </span>
        </div>
    </div>
    <div class="charts-container">
        <div class="line">
            <LineChartOverTime {sessionScores} />
        </div>
        <div class="bar">
            <BarChart {sessionScores} />
        </div>
    </div>
</div>

<style>
    .charts-container {
        position: relative;
        display: grid;
        grid-template-rows: min-content;
        padding: 1rem;
        background: var(--background-light);
        border-radius: 0 var(--radius) var(--radius) var(--radius);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }
    .line {
        grid-row: 1;
        grid-column: 1;
        visibility: hidden;
    }
    .bar {
        grid-row: 1;
        grid-column: 1;
    }
    .charts-tabs-container {
        display: flex;
        gap: 0.2rem;
    }
    .tab {
        position: relative;
        background: var(--background-light);
        padding: 0.3rem 1rem;
        border-radius: var(--radius) var(--radius) 0 0;
        transform: translate(0, 5px);
        z-index: 0;
        opacity: 0.6;
        color: var(--foreground);
    }
    .tab.active {
        z-index: 2;
        opacity: 1;
    }
</style>
