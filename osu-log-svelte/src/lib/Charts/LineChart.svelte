<script>
    import Chart, { elements, plugins } from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";
    import { generateRegressionLine } from "./polynomial-reg.js";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { writable } from "svelte/store";
    import { callback } from "chart.js/helpers";

    onMount(() => {
        changeActiveDatasets();
    });

    let { sessionScores } = $props();
    let lineChart;
    const radios = ["line", "trend", "none"];

    let configs = [
        {
            type: "pp",
            name: "PP",
            color: "#D22A62FF",
        },
        {
            type: "sr",
            name: "Stars",
            color: "#D29A2AFF",
        },
        {
            type: "bpm",
            name: "BPM",
            color: "#2AD29AFF",
        },
        {
            type: "speed",
            name: "Speed",
            color: "#D2472AFF",
        },
        {
            type: "aim",
            name: "Aim",
            color: "#2A62D2FF",
        },
        {
            type: "acc",
            name: "Accuracy",
            color: "#2AD246FF",
        },
        {
            type: "pass",
            name: "Pass",
            color: "#2AB6D2FF",
        },
    ];

    const scoreMap = {
        sr: (score) => {
            if (score.performance) return score.performance.attributes.stars;
            else return score.score.beatmap.difficulty_rating;
        },
        song: (score) => score.score.beatmapset.title,
        pp: (score) => {
            if (score.score.pp) {
                return score.score.pp;
            }
            if (score.performance) {
                return score.performance.perf.pp;
            }
            return 0;
        },
        bpm: (score) => {
            return score.score.beatmap.bpm;
        },
        speed: (score) => {
            return score.performance.attributes.speed;
        },
        aim: (score) => {
            return score.performance.attributes.aim;
        },
        acc: (score) => {
            return score.score.accuracy * 100;
        },
        pass: (score) => {
            return score.score.passed_percentage;
        },
    };

    let yAxes = $state({});

    const populateCharts = () => {
        if (!sessionScores.meta) return;

        const ret = {};

        for (const { type, name, color } of configs) {
            const src = sessionScores.meta.graphData[type];

            const data = new Array(src.length);
            const yValues = new Array(src.length);

            //make shallow copy of data that chart.js can mutate
            for (let i = 0; i < src.length; i++) {
                const {
                    x,
                    y,
                    meta: { name, id, date },
                } = src[i];

                data[i] = { x, y, meta: { name, id, date } };
                yValues[i] = y;
            }

            ret[name] = {
                values: {
                    type: "scatter",
                    data,
                    label: name,
                    yAxisID: name,
                    borderColor: color,
                },
                average: {
                    type: "line",
                    pointRadius: 0,
                    data: getAverageLine(
                        data.map((s) => s.y),
                        10,
                    ),
                    label: `${name} Trend`,
                    yAxisID: name,
                    borderColor: color,
                },
            };
        }
        return ret;
    };

    let charts = populateCharts();

    let datasets = [];

    function changeActiveDatasets() {
        yAxes = {};
        datasets = [];
        const toggles = document.querySelectorAll(
            ".line .toggle .switch input",
        );

        const radioSelection = {};
        for (const { name } of configs) {
            radioSelection[name] = document.querySelector(
                `.${name}-radio:checked`,
            );
        }

        for (const toggle of toggles) {
            if (!toggle.checked) continue;

            const chartName = toggle.dataset.value;
            const chart = charts[chartName];
            const selection = radioSelection[chartName];
            const color = chart.values.borderColor;

            yAxes[chart.values.yAxisID] = {
                type: "linear",
                display: true,
                position: "right",
                title: {
                    display: true,
                    text: chartName,
                },
            };

            const opacity = (color, opacity) => {
                return `${color.slice(0, 7)}${opacity}`;
            };

            if (selection.dataset.radio === "line") {
                chart.values.borderColor = opacity(color, "FF");
                chart.values.type = "line";
            } else if (selection.dataset.radio === "trend") {
                chart.values.borderColor = opacity(color, "22");
                chart.values.backgroundColor = opacity(color, "00");
                chart.values.type = "scatter";
                datasets.push({ ...chart.average });
            } else if (selection.dataset.radio === "none") {
                chart.values.borderColor = opacity(color, "FF");
                chart.values.backgroundColor = opacity(color, "FF");
                chart.values.type = "scatter";
            }
            datasets.push({ ...chart.values });
        }
    }

    function getAverageLine(array, range) {
        const ret = [];
        array.forEach((_, i) => {
            const start = i - range < 0 ? 0 : i - range;
            const end = i + range > array.length ? array.length : i + range;
            const avgPoints = array.slice(start, end);
            const avg =
                avgPoints.reduce((acc, curr) => acc + curr, 0) /
                avgPoints.length;
            ret.push({ x: i, y: avg });
        });
        return ret;
    }

    document.addEventListener("sessionScoresUpdated", () => {
        charts = populateCharts();
        changeActiveDatasets();
    });

    async function focusScore(click) {
        const points = lineChart.getElementsAtEventForMode(
            click,
            "nearest",
            { intersect: true },
            true,
        );
        const id = points[0].element.$context.raw.meta.id;
        const tableItem = document.querySelector(`#score-${id}`);
        tableItem.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        tableItem.style.boxShadow = "2px 2px 10px var(--hover)";
        await new Promise((resolve) => setTimeout(resolve, 200));
        tableItem.style.boxShadow = "unset";
    }

    const verticalLineHover = {
        id: "verticalLineHover",
        beforeDatasetDraw(chart, args, plugins) {
            const {
                ctx,
                chartArea: { top, bottom, heiht },
            } = chart;
            ctx.save();

            chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
                if (dataPoint.active === true) {
                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.moveTo(dataPoint.x, top);
                    ctx.lineTo(dataPoint.x, bottom);
                    ctx.stroke();
                }
            });
        },
    };

    function setupChart(node) {
        lineChart = new Chart(node, {
            data: { datasets },
            plugins: [verticalLineHover],
            options: {
                scales: {
                    x: {
                        type: "linear",
                        max: sessionScores.scores.length - 1,
                    },
                    ...yAxes,
                },
                maintainAspectRatio: false,
                interaction: {
                    mode: "index",
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const value =
                                    Math.round(ctx.parsed.y * 100) / 100;
                                return `${ctx.dataset.label}: ${value}`;
                            },
                            labelColor: function (ctx) {
                                const color = configs.filter((config) => {
                                    return config.name === ctx.dataset.label;
                                })[0].color;
                                return {
                                    backgroundColor: color,
                                    borderColor: color,
                                };
                            },
                            title: (ctx) => {
                                return ctx[0].raw.meta.name;
                            },
                        },
                        filter: (ctx) => {
                            return !ctx.dataset.label.includes("Trend");
                        },
                    },
                    legend: {
                        display: false,
                    },
                },
            },
        });
    }

    function chart(node) {
        if (lineChart) lineChart.destroy();

        setupChart(node);
        lineChart.canvas.addEventListener("click", focusScore);
        return () => {
            lineChart.destroy();
        };
    }
</script>

<div class="line">
    <div class="chart-container">
        <canvas id="lineChart" {@attach chart}></canvas>
    </div>
    <div class="toggles">
        {#each configs as { name, color }}
            <div class="toggle">
                <div class="switch">
                    <span>{name}</span>
                    {#if name === "PP"}
                        <Toggle
                            data={name}
                            callback={changeActiveDatasets}
                            checked="true"
                            {color}
                        />
                    {:else}
                        <Toggle
                            data={name}
                            callback={changeActiveDatasets}
                            {color}
                        />
                    {/if}
                </div>
                <Radio
                    {name}
                    {radios}
                    {color}
                    defaultIndex={1}
                    callback={changeActiveDatasets}
                />
            </div>
        {/each}
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

    .toggles {
        position: relative;
        overflow: clip;
        overflow-clip-margin: border-box 1rem;
        background: var(--background-light);
        right: 1rem;
        align-items: center;
        gap: 0.3rem;
        margin: auto;
        transition: 0.25s;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }

    .toggle {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 2px;
    }

    .switch {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .line {
        color: var(--foreground);
        display: grid;
        gap: 1rem;
    }
</style>
