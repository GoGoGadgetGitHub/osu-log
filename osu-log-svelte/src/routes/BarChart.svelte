<script>
    import Chart from "chart.js/auto";
    import "chartjs-adapter-date-fns";
    import Star from "../svg/Star.svelte";
    import ScoresTable from "./ScoresTable.svelte";
    import { derived } from "svelte/store";

    let { sessionScores } = $props();

    let barChart;

    let data = $derived.by(() => {
        return { datasets: [{ ...charts.sr }] };
    });

    let scales = $derived.by(() => {
        return { ...dataMap.sr.xAxis };
    });

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
                console.log(toOD(score.performance.attributes.greatHitWindow));
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
        const ret = {};
        for (let key of Object.keys(dataMap)) {
            ret[key] = {
                label: dataMap[key].label,
                data: getFreqArray(
                    dataMap[key].accessor,
                    dataMap[key].minMax.min,
                    dataMap[key].minMax.max,
                ),
            };
        }
        return ret;
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
            const label = ` ${str}: < ${minLabel}`;
            lbls.push(label);
        }
        return lbls;
    }

    function getFreqArray(attrFinder, min, max) {
        console.log(min, max);
        const freq = [0, 0, 0, 0, 0, 0, 0, 0];
        const range = (max - min) / 8;

        for (const score of sessionScores.scores) {
            const attr = attrFinder(score);
            const index = Math.floor((attr - min) / range);
            freq[index - 1] += 1;
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
        const toggels = document.querySelectorAll(".dataset-toggle");

        for (const toggle of toggels) {
            if (!toggle.checked) continue;

            const graphID = toggle.dataset.set;
            const chart = charts[graphID];
            datasets.push({ ...chart });

            const stats = sessionScores.meta.stats[graphID];
            const xAxisKey = Object.keys(dataMap[graphID].xAxis)[0];

            newScales[xAxisKey] = dataMap[graphID].xAxis[xAxisKey];
        }
        scales = newScales;
        data = { datasets };
    }
</script>

{$inspect(data, scales)}

<div>
    <ul>
        <li>
            <input
                class="dataset-toggle"
                type="checkbox"
                data-set="sr"
                checked
                onclick={(e) => changeActiveDatasets(e)}
            />Stars
        </li>
        <li>
            <input
                class="dataset-toggle"
                type="checkbox"
                data-set="od"
                onclick={(e) => changeActiveDatasets(e)}
            />OD
        </li>
        <li>
            <input
                class="dataset-toggle"
                type="checkbox"
                data-set="ar"
                onclick={(e) => changeActiveDatasets(e)}
            />AR
        </li>
        <li>
            <input
                class="dataset-toggle"
                type="checkbox"
                data-set="bpm"
                onclick={(e) => changeActiveDatasets(e)}
            />BPM
        </li>
    </ul>
    <canvas id="barChart" {@attach chart}></canvas>
</div>

<style>
    div {
        height: 30rem;
    }
</style>
