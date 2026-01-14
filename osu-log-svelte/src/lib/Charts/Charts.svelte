<script>
    //TODO: Have a look at user tags
    import { each } from "chart.js/helpers";
    import FarLeft from "$lib/Svg/FarLeft.svelte";
    import FarRight from "$lib/Svg/FarRight.svelte";
    import BarChart from "./BarChart.svelte";
    import LineChart from "./LineChart.svelte";
    let { sessionScores } = $props();

    let activeTab = $state("time");

    const tabMap = [
        { name: "time", title: "Time", component: LineChart },
        { name: "spread", title: "Spread", component: BarChart },
    ];
</script>

<div>
    <div class="charts-tabs-container">
        {#each tabMap as { title, name }}
            <a
                href="#chart"
                onclick={() => {
                    activeTab = name;
                }}
                class="tab {name === activeTab ? 'active' : ''}"
            >
                <span> {title} </span>
            </a>
        {/each}
    </div>

    <div class="charts-container">
        {#each tabMap as { name, component }}
            {@const TheChart = component}
            {#if activeTab === name}
                {#if sessionScores.scores}
                    <div><TheChart {sessionScores} /></div>
                {:else}
                    <div class="no-scores">
                        No Scores!<br />
                        Click on one of the highlighted dates on the calender.
                    </div>
                {/if}
            {/if}
        {/each}
    </div>
</div>

<style>
    .no-scores {
        min-height: 30rem;
        display: flex;
        justify-content: center;
        align-items: center;
        color: var(--foreground);
        font-weight: bold;
        text-align: center;
    }

    .charts-container {
        position: relative;
        padding: 1rem;
        background: var(--background-2);
        border-radius: 0 var(--radius) var(--radius) var(--radius);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1;
    }
    .charts-tabs-container {
        display: flex;
        gap: 0.2rem;
    }
    .tab {
        position: relative;
        background: var(--background-2);
        padding: 0.3rem 1rem;
        border-radius: var(--radius) var(--radius) 0 0;
        transform: translate(0, 5px);
        z-index: 0;
        opacity: 0.6;
        color: var(--foreground);
    }
    .tab.active {
        z-index: 1;
        opacity: 1;
    }
</style>
