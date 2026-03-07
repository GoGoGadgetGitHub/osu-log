<script>
    import Chart, { elements, plugins } from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { writable } from "svelte/store";
    import { callback } from "chart.js/helpers";

    let chartConfigs = [
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
            name: "Pass %",
            color: "#2AB6D2FF",
        },
    ];

    let lineChart;
    let canvas;

    let { sessionScores } = $props();

    let chartMode = $state(
        Object.fromEntries(
            chartConfigs.map((config) => [config.type, "trend"]),
        ),
    );
    let chartVisibility = $state(
        Object.fromEntries(
            chartConfigs.map((config) => [config.type, config.type === "pp"]),
        ),
    );
    let chartMap = $derived.by(getChartMap);
    let datasets = $derived.by(getDatasets);
    let yAxes = $derived.by(getYAxes);

    const modes = ["line", "trend", "none"];

    function getChartMap() {
        if (!sessionScores.meta) return;

        const map = {};

        for (const { type, name, color } of chartConfigs) {
            const graphData = sessionScores.meta.graphData[type];

            const data = graphData.map((item) => ({
                x: item.x,
                y: item.y,
                meta: item.meta,
            }));

            map[type] = {
                name,
                values: {
                    type: "scatter",
                    data,
                    label: name,
                    yAxisID: type,
                    borderColor: color,
                },
                average: {
                    type: "line",
                    pointRadius: 0,
                    data: getAverageLine(
                        data.map((s) => s.y),
                        5,
                    ),
                    label: `${name} Trend`,
                    yAxisID: type,
                    borderColor: color,
                },
            };
        }
        return map;
    }

    function getYAxes() {
        let result = {};
        for (const { type, color } of chartConfigs) {
            if (!chartVisibility[type]) continue;
            const chart = chartMap[type];
            result[chart.values.yAxisID] = {
                type: "linear",
                display: true,
                position: "right",
                title: {
                    display: true,
                    text: chart.name,
                },
                grid: { drawOnChartArea: false },
            };
        }
        return result;
    }

    function getDatasets() {
        const result = [];

        for (const { type, color } of chartConfigs) {
            if (!chartVisibility[type]) continue;
            const chart = chartMap[type];
            const mode = chartMode[type];

            const main = {
                ...chart.values,
                type: mode === "line" ? "line" : "scatter",
                borderColor: color,
                backgroundColor: "transparent",
                borderWidth: mode === "line" ? 2 : 1,
                pointRadius: mode === "line" ? 3 : 4,
            };

            if (mode === "trend") {
                main.borderColor = withAlpha(color, 0.2);
                result.push({
                    ...chart.average,
                    borderColor: color,
                    pointRadius: 0,
                    label: `${chart.name} Trend`,
                });
            } else if (mode === "none") {
                main.backgroundColor = withAlpha(color, 0.15);
            }

            result.push(main);
        }
        return result;
    }

    function withAlpha(hex, alpha = 1) {
        const [r, g, b] = [
            hex.slice(1, 3),
            hex.slice(3, 5),
            hex.slice(5, 7),
        ].map((x) => parseInt(x, 16));
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

    async function focusScore(click) {
        const points = lineChart.getElementsAtEventForMode(
            click,
            "nearest",
            { intersect: true },
            true,
        );
        console.log(points);
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

    $effect(() => {
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        if (lineChart) {
            lineChart.data.datasets = datasets;
            lineChart.options.scales = {
                ...lineChart.options.scales,
                ...yAxes,
            };
            console.log("updating chart");
            lineChart.update("show");
        } else {
            lineChart = new Chart(ctx, {
                data: { datasets },
                options: {
                    scales: {
                        x: {
                            type: "linear",
                            title: { display: true, text: "Score #" },
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
                        legend: { display: false },
                        tooltip: {
                            filter: (tooltipItem) =>
                                !tooltipItem.dataset.label.includes("Trend"),
                            callbacks: {
                                title: ([first]) =>
                                    first?.raw?.meta?.name ?? "",
                                label: (ctx) => {
                                    const v =
                                        Math.round(ctx.parsed.y * 100) / 100;
                                    return `${ctx.dataset.label}: ${v}`;
                                },
                                labelColor: function (ctx) {
                                    const color = chartConfigs.filter(
                                        (config) => {
                                            return (
                                                config.name ===
                                                ctx.dataset.label
                                            );
                                        },
                                    )[0].color;
                                    return {
                                        backgroundColor: color,
                                        borderColor: color,
                                    };
                                },
                            },
                        },
                    },
                    onClick: (event, elements) => {
                        if (!elements.length) return;
                        const meta = elements[0].element.$context.raw.meta;
                        if (!meta?.id) return;
                        focusScoreById(meta.id);
                    },
                },
            });
        }
    });
</script>

<div class="line">
    <div class="chart-container">
        <canvas id="lineChart" bind:this={canvas}></canvas>
    </div>
    <div class="toggles">
        {#each chartConfigs as { name, type, color }}
            <div class="toggle">
                <div class="switch">
                    <span>{name}</span>
                    <Toggle
                        data={type}
                        bind:checked={chartVisibility[type]}
                        {color}
                    />
                </div>
                <Radio
                    name={type}
                    options={modes}
                    {color}
                    bind:selected={chartMode[type]}
                    defaultIndex={1}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .chart-container {
        position: relative;
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
        column-gap: 1.5rem;
        row-gap: 0.5rem;
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
        gap: 0.3rem;
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
