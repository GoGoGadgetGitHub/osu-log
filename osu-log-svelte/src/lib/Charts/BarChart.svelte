<script>
    import Chart from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import Star from "$lib/Svg/Star.svelte";
    import ScoresTable from "$lib/ScoresTable/ScoresTable.svelte";
    import { onMount } from "svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";

    onMount(() => {
        changeActiveDatasets();
    });

    let { sessionScores } = $props();
    let barChart;
    const dataMap = $derived({
        sr: {
            minMax: getMinMax(sessionScores.meta.stats.sr),
            accessor: (score) => {
                return score.performance.attributes.stars;
            },
            label: "Stars",
            xAxis: {
                x: {
                    labels: getLabels(
                        "SR",
                        sessionScores.meta.stats.sr.min,
                        sessionScores.meta.stats.sr.max,
                    ),
                },
            },
            color: "#D29A2A",
        },
        od: {
            minMax: getMinMax(sessionScores.meta.stats.od),
            accessor: (score) => {
                return toOD(score.performance.attributes.greatHitWindow);
            },
            label: "OD",
            xAxis: {
                x1: {
                    labels: getLabels(
                        "OD",
                        sessionScores.meta.stats.od.min,
                        sessionScores.meta.stats.od.max,
                    ),
                },
            },
            color: "#D2472AFF",
        },
        ar: {
            minMax: getMinMax(sessionScores.meta.stats.ar),
            accessor: (score) => {
                return score.performance.attributes.ar;
            },
            label: "AR",
            xAxis: {
                x2: {
                    labels: getLabels(
                        "AR",
                        sessionScores.meta.stats.ar.min,
                        sessionScores.meta.stats.ar.max,
                    ),
                },
            },
            color: "#2A62D2FF",
        },

        bpm: {
            minMax: getMinMax(sessionScores.meta.stats.bpm),
            accessor: (score) => {
                return score.score.beatmap.bpm;
            },
            label: "BPM",
            xAxis: {
                x3: {
                    labels: getLabels(
                        "BPM",
                        sessionScores.meta.stats.bpm.min,
                        sessionScores.meta.stats.bpm.max,
                    ),
                },
            },
            color: "#2AD29AFF",
        },
    });
    let charts = $derived.by(() => {
        const tooltip = {
            callbacks: {
                label: (node) => {
                    return node.raw.meta.name;
                },
            },
        };

        const ret = {};
        for (let key of Object.keys(dataMap)) {
            ret[key] = {
                label: dataMap[key].label,
                data: getFreqArray(
                    dataMap[key].accessor,
                    dataMap[key].minMax.min,
                    dataMap[key].minMax.max,
                ),
                xAxisID: Object.keys(dataMap[key].xAxis)[0],
                tooltip: {
                    callbacks: {
                        label: (node) => {
                            return `Count: ${node.raw}`;
                        },
                    },
                },
                backgroundColor: dataMap[key].color,
            };
        }
        return ret;
    });

    let data = $derived.by(() => {
        const datasets = [];
        const toggles = document.querySelectorAll(".toggle");
        for (const toggle of toggles) {
            if (!toggle.checked) continue;
            datasets.push({ ...charts[toggle.dataset.value] });
        }
        return { datasets };
    });

    let scales = $derived.by(() => {
        const scales = {};
        const toggles = document.querySelectorAll(".toggle");
        let xAxisKey;
        for (const toggle of toggles) {
            if (!toggle.checked) continue;
            xAxisKey = Object.keys(dataMap[toggle.dataset.value].xAxis)[0];
            scales[xAxisKey] = dataMap[toggle.dataset.value].xAxis[xAxisKey];
        }
        return scales;
    });

    function getMinMax(stat) {
        const { min, max } = stat;
        return { min, max };
    }

    function toOD(hitwindow) {
        return (hitwindow - 80) / -6;
    }

    function getLabels(str, min, max) {
        const range = (max - min) / 8;
        let lbls = [];
        for (let i = 0; i <= 7; i++) {
            const minLabel = `${Math.round((min + range * i) * 100) / 100}`;
            const label = ` ${str} > ${minLabel}`;
            lbls.push(label);
        }
        return lbls;
    }

    function getFreqArray(attrFinder, min, max) {
        const freq = [0, 0, 0, 0, 0, 0, 0, 0];
        const range = (max - min) / 8;

        for (const score of sessionScores.scores) {
            const attr = attrFinder(score);
            let index = Math.floor((attr - min) / range);
            index = index === 8 ? 7 : index;
            freq[index] += 1;
        }
        return freq;
    }

    function setupChart(node, data) {
        barChart = new Chart(node, {
            type: "bar",
            data,
            options: {
                scales,
                maintainAspectRatio: false,
            },
        });
    }

    function chart(node) {
        setupChart(node, $state.snapshot(data));
        return () => {
            barChart.destroy();
        };
    }

    function changeActiveDatasets() {
        console.log("hello");
        const datasets = [];
        const newScales = {};
        const toggels = document.querySelectorAll(".toggle");

        for (const toggle of toggels) {
            if (!toggle.checked) continue;

            const graphID = toggle.dataset.value;
            const chart = charts[graphID];
            datasets.push({ ...chart });

            const xAxisKey = Object.keys(dataMap[graphID].xAxis)[0];
            newScales[xAxisKey] = dataMap[graphID].xAxis[xAxisKey];
        }

        scales = newScales;
        data = { datasets };
    }
</script>

<!--HTML-->
<div class="spread">
    <div class="chart-container">
        <canvas id="barChart" {@attach chart}></canvas>
    </div>
    <div class="toggles">
        <ul>
            {#each Object.keys(dataMap) as data}
                <li>
                    <label class="switch" for="toggle-{data}">
                        {#if data === "sr"}
                            <Toggle
                                cls="toggle"
                                id="toggle-{data}"
                                {data}
                                callback={changeActiveDatasets}
                                checked={true}
                                color={dataMap[data].color}
                            />
                        {:else}
                            <Toggle
                                cls="toggle"
                                id="toggle-{data}"
                                {data}
                                callback={changeActiveDatasets}
                                color={dataMap[data].color}
                            />
                        {/if}
                        <div class="slider round"></div>
                    </label>
                    <span>{dataMap[data].label}</span>
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .chart-container {
        position: relative;
        min-height: 30rem;
    }

    .chart-container canvas {
        width: 100% !important;
    }

    .spread {
        color: var(--foreground);
    }

    .toggles {
        position: relative;
        height: 4rem;
        overflow: clip;
        overflow-clip-margin: border-box 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1.5rem;
        transition: 0.25s;
    }

    ul {
        margin: 0;
        display: flex;
        list-style: none;
        padding: 0;
        gap: 1rem;
    }

    li {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
