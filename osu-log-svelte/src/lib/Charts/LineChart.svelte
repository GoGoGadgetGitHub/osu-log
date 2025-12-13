<script>
    import Chart, { elements } from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";
    import { generateRegressionLine } from "./polynomial-reg.js";
    import Gear from "$lib/Svg/Gear.svelte";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { writable } from "svelte/store";

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
            color: "#5C514FFF",
        },
        {
            type: "sr",
            name: "Stars",
            color: "#996B60FF",
        },
        {
            type: "bpm",
            name: "BPM",
            color: "#c2c2c3FF",
        },
        {
            type: "speed",
            name: "Speed",
            color: "#D2472AFF",
        },
        {
            type: "aim",
            name: "Aim",
            color: "#494040FF",
        },
        {
            type: "acc",
            name: "Accuracy",
            color: "#494040FF",
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
    };

    let yAxes = $state({});
    let charts = $derived.by(() => {
        const tooltip = {
            callbacks: {
                title: (node) => {
                    return node.raw.meta.date;
                },

                label: (node) => {
                    return node.raw.meta.name;
                },
            },
        };

        const ret = {};
        for (const { type, name, color } of configs) {
            const scores = sessionScores.scores;
            const data = scores.map((score, index) => {
                return {
                    x: index,
                    y: scoreMap[type](score),
                    meta: {
                        name: scoreMap["song"](score),
                        id: score.score.id,
                        date: score.score.started_at,
                    },
                };
            });
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
    });

    let datasets = [];

    function changeActiveDatasets() {
        yAxes = {};
        datasets = [];
        const toggles = document.querySelectorAll(
            ".line .toggle .switch input",
        );
        console.log(toggles);

        const radioButtons = {};
        for (const { name } of configs) {
            if (!radioButtons[name]) radioButtons[name] = [];
            for (const radio of radios) {
                const radioButton = document.getElementById(`${name}-${radio}`);
                radioButtons[name].push(radioButton);
            }
        }

        for (const toggle of toggles) {
            if (!toggle.checked) continue;

            const chartName = toggle.dataset.value;
            const chart = charts[chartName];
            const selection = radioButtons[chartName].filter(
                (radio) => radio.checked,
            )[0];
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

            if (selection.id === `${chartName}-line`) {
                chart.values.borderColor = opacity(color, "FF");
                chart.values.type = "line";
            } else if (selection.id === `${chartName}-trend`) {
                chart.values.borderColor = opacity(color, "22");
                chart.values.backgroundColor = opacity(color, "00");
                chart.values.type = "scatter";
                datasets.push({ ...chart.average });
            } else if (selection.id === `${chartName}-none`) {
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

    document.addEventListener("calButtonClicked", () => {
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

    function setupChart(node) {
        lineChart = new Chart(node, {
            data: { datasets },
            options: {
                scales: {
                    x: {
                        type: "linear",
                    },
                    ...yAxes,
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

<!--HTML-->
<div class="line">
    <div class="chart-container">
        <canvas id="lineChart" {@attach chart}></canvas>
    </div>
    <div class="toggles">
        {#each configs as { name, color }}
            <div class="toggle">
                <div class="switch">
                    <span style="color: {color};">{name}</span>
                    {#if name === "PP"}
                        <Toggle
                            data={name}
                            callback={changeActiveDatasets}
                            checked="true"
                        />
                    {:else}
                        <Toggle data={name} callback={changeActiveDatasets} />
                    {/if}
                </div>
                <Radio
                    {name}
                    {radios}
                    defaultIndex={1}
                    callback={changeActiveDatasets}
                />
            </div>
        {/each}
    </div>
</div>

<!--CSS-->
<style>
    .chart-container {
        min-height: 30rem;
    }

    .toggles {
        position: relative;
        overflow: clip;
        overflow-clip-margin: border-box 1rem;
        background: var(--background-light);
        right: 1rem;
        align-items: center;
        gap: 1.5rem;
        margin: auto;
        transition: 0.25s;
        display: flex;
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
