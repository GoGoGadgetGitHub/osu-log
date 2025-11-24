<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";
    import { generateRegressionLine } from "./polynomial-reg.js";

    let { sessionScores } = $props();
    let lineChart;

    let configs = [
        {
            type: "pp",
            name: "PP",
        },
        {
            type: "sr",
            name: "Stars",
        },
    ];
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
        for (const { type, name } of configs) {
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
            return {
                values: {
                    type: "scatter",
                    data,
                    label: name,
                    yAxisID,
                },
                regression: {
                    type: "line",
                    data: generateRegressionLine(
                        data.map((s) => s.x),
                        data.map((s) => s.y),
                        12,
                    ),
                    label: `${name} Regression`,
                    yAxisID,
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
        set: (score) => score.score.ended_at,
    };

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
            data,
            options: {
                scales: {
                    x: {
                        type: "linear",
                    },
                    y: {
                        type: "linear",
                        display: true,
                        position: "left",
                    },
                    y1: {
                        type: "linear",
                        display: true,
                        position: "right",
                    },
                },
            },
        });
    }

    function chart(node) {
        setupChart(node);
        //lineChart.canvas.addEventListener("click", focusScore);
        return () => {
            lineChart.destroy();
        };
    }
</script>

<div class="chart-container">
    <canvas id="lineChart" {@attach chart}></canvas>
</div>

<style>
    .chart-container {
        min-height: 30rem;
    }
</style>
