<script>
    import Chart from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import Star from "../svg/Star.svelte";
    import ScoresTable from "./ScoresTable.svelte";
    import { onMount } from "svelte";
    import Gear from "../svg/Gear.svelte";

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
                        sessionScores.meta.stats.od.max,
                        sessionScores.meta.stats.od.min,
                    ),
                },
            },
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
            };
        }
        return ret;
    });

    let data = $derived.by(() => {
        const datasets = [];
        const toggles = document.querySelectorAll(".toggle");
        for (const toggle of toggles) {
            if (!toggle.checked) continue;
            datasets.push({ ...charts[toggle.dataset.set] });
        }
        return { datasets };
    });

    let scales = $derived.by(() => {
        const scales = {};
        const toggles = document.querySelectorAll(".toggle");
        for (const toggle of toggles) {
            if (!toggle.checked) continue;
            xAxisKey = Object.keys(dataMap[toggle.dataset.set].xAxis)[0];
            scales[xAxisKey] = dataMap[toggle.dataset.set].xAxis[xAxisKey];
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
            },
        });
    }

    function chart(node) {
        setupChart(node, $state.snapshot(data));
        return () => {
            barChart.destroy();
        };
    }

    function changeActiveDatasets(e) {
        const datasets = [];
        const newScales = {};
        const toggels = document.querySelectorAll(".toggle");

        console.log(toggels);

        for (const toggle of toggels) {
            if (!toggle.checked) continue;

            const graphID = toggle.dataset.set;
            const chart = charts[graphID];
            datasets.push({ ...chart });

            const xAxisKey = Object.keys(dataMap[graphID].xAxis)[0];
            newScales[xAxisKey] = dataMap[graphID].xAxis[xAxisKey];
        }

        scales = newScales;
        data = { datasets };
    }
</script>

{$inspect(data, scales)}

<div class="spread">
    <div class="chart-container">
        <canvas id="barChart" {@attach chart}></canvas>
    </div>
    <div class="toggles">
        <div class="hover">
            <div class="gear-icon"><Gear /></div>
        </div>
        <div class="toggles-container">
            <ul>
                {#each Object.keys(dataMap) as data}
                    <li>
                        <label class="switch" for="toggle-{data}">
                            {#if data === "sr"}
                                <input
                                    class="toggle"
                                    id="toggle-{data}"
                                    type="checkbox"
                                    checked
                                    data-set={data}
                                    onclick={(e) => changeActiveDatasets(e)}
                                />
                            {:else}
                                <input
                                    class="toggle"
                                    id="toggle-{data}"
                                    type="checkbox"
                                    data-set={data}
                                    onclick={(e) => changeActiveDatasets(e)}
                                />
                            {/if}
                            <div class="slider round"></div>
                        </label>
                        {dataMap[data].label}
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</div>

<style>
    .chart-container {
        min-height: 30rem;
    }

    .spread {
        color: var(--foreground);
        display: grid;
        gap: 1rem;
    }

    .hover {
        display: flex;
        align-items: center;
        left: -2rem;
        position: absolute;
        background: var(--foreground);
        width: 1rem;
        height: 4rem;
        z-index: 1;
        border-radius: var(--radius) 0 0 var(--radius);
    }

    .toggles:hover .toggles-container {
        width: 13rem;
        height: 4rem;
        padding: 0 1rem 0 1rem;
    }

    .toggles {
        position: absolute;
        top: 0;
        right: -1rem;
        top: 1rem;
    }

    .toggles-container {
        width: 0;
        height: 4rem;
        overflow: clip;
        overflow-clip-margin: border-box 1rem;
        background: var(--background-light);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius) 0 0 var(--radius);
        right: 1rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin: auto;
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
        gap: rem;
    }

    .switch {
        position: relative;
        height: 1.3rem;
        width: 2.5rem;
    }

    .switch input {
        display: none;
    }

    .slider {
        border-radius: 20px;
        background: var(--background-verylight);
        position: absolute;
        cursor: pointer;
        bottom: 0;
        left: 0;
        top: 0;
        right: 0;
        transition: 0.25s;
    }

    .slider::before {
        content: "";
        background: var(--foreground);
        position: absolute;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        top: 50%;
        left: 0.1rem;
        transform: translate(0.2rem, -50%);
        transition: 0.25s;
    }

    input:checked + .slider {
        background: var(--hover);
    }

    input:checked + .slider::before {
        transform: translate(1.1rem, -50%);
    }
    .toggles-container {
        position: relative;
    }
    .gear-icon {
        height: 1rem;
        width: 1rem;
    }
</style>
