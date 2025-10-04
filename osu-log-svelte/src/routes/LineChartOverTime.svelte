<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";

    let { sessionScores } = $props();
    let lineChart;

    let starsTime = $derived.by(() => {
        const scores = sessionScores.scores;
        const data = scores.map((score) => {
            return {
                x: new Date(scoreMap["set"](score)).toISOString(),
                y: scoreMap["sr"](score),
                meta: { name: scoreMap["song"](score), id: score.score.id },
            };
        });
        return {
            data,
            label: "Star Rating",
            yAxisID: "y",
        };
    });

    let ppTime = $derived.by(() => {
        const scores = sessionScores.scores;
        const data = scores.map((score) => {
            return {
                x: new Date(scoreMap["set"](score)).toISOString(),
                y: scoreMap["pp"](score),
                meta: { name: scoreMap["song"](score), id: score.score.id },
            };
        });
        return {
            data,
            label: "PP",
            yAxisID: "y1",
        };
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
        const tooltip = {
            callbacks: {
                label: (node) => {
                    return node.raw.meta.name;
                },
            },
        };

        const datasets = [
            { ...starsTime, tooltip },
            { ...ppTime, tooltip },
        ];

        lineChart = new Chart(node, {
            type: "line",
            data: {
                datasets,
            },
            options: {
                scales: {
                    x: {
                        type: "time",
                        time: {
                            tooltipFormat: "yyyy-MM-dd HH:mm",
                        },
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
        lineChart.canvas.addEventListener("click", focusScore);
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
