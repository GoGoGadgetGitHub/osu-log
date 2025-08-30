<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";

    let { sessionScores, type } = $props();
    let lineChart;

    let starsTime = $derived.by(() => {
        const scores = sessionScores.scores;
        const rows = document.querySelector(
            ".datatable-container tbody",
        ).children;
        return scores.map((score) => {
            console.log(rows);
            return {
                x: new Date(scoreMap["set"](score)).toISOString(),
                y: scoreMap["sr"](score),
                meta: { name: scoreMap["song"](score), id: score.score.id },
            };
        });
    });

    let ppTime = $derived.by(() => {
        const scores = sessionScores.scores;
        const rows = document.querySelector(
            ".datatable-container tbody",
        ).children;
        return scores.map((score, index) => {
            return {
                x: new Date(scoreMap["set"](score)).toISOString(),
                y: scoreMap["pp"](score),
                meta: { name: scoreMap["song"](score), id: score.score.id },
            };
        });
    });

    const scoreMap = {
        sr: (score) => {
            if (score.performance) return score.performance.attributes.stars;
            else return score.score.beatmap.difficulty_rating;
        },
        song: (score) => score.score.beatmapset.title,
        grade: (score) => (score.score.passed ? score.score.rank : "F"),
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
        acc: (score) => score.score.accuracy,
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

    function chart(node, graphData) {
        function setupChart(_graphData) {
            const tooltip = {
                callbacks: {
                    label: (node) => {
                        return node.raw.meta.name;
                    },
                },
            };

            const [timeStars, timePP] = _graphData;
            console.log(timePP, timeStars);

            const datasetPP = {
                label: "PP",
                data: timePP,
                tooltip,
                yAxisID: "y1",
            };

            const datasetSR = {
                label: "Star Rating",
                data: timeStars,
                tooltip,
                yAxisID: "y",
            };

            lineChart = new Chart(node, {
                type: "line",
                data: {
                    datasets: [{ ...datasetPP }, { ...datasetSR }],
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
        setupChart(graphData);
        lineChart.canvas.addEventListener("click", focusScore);
        return {
            update(graphData) {
                lineChart.destroy();
                setupChart(graphData);
            },
            destroy() {
                lineChart.destroy();
            },
        };
    }
</script>

<div>
    <canvas id="lineChart" use:chart={[starsTime, ppTime]}></canvas>
</div>
