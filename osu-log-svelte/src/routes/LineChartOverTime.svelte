<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";

    let { sessionScores, type } = $props();
    let lineChart;

    let graphData = $derived.by(() => {
        const scores = sessionScores.scores;
        return scores.map((score) => {
            return {
                x: new Date(scoreMap["set"](score)).toISOString(),
                y: scoreMap[type](score),
                ref: score,
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
        const index = points[0].index;
        const rows = document.querySelector(
            ".datatable-container tbody",
        ).children;
        rows[index].scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "nearest",
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        rows[index].style.boxShadow = "2px 2px 10px var(--hover)";
        await new Promise((resolve) => setTimeout(resolve, 200));
        rows[index].style.boxShadow = "unset";
    }

    function chart(node, graphData) {
        function setupChart(_graphData) {
            lineChart = new Chart(node, {
                type: "line",
                data: {
                    datasets: [
                        {
                            label: type === "sr" ? "Star Rating" : "PP",
                            data: _graphData,
                            tooltip: {
                                callbacks: {
                                    label: (node) => {
                                        return scoreMap["song"](node.raw.ref);
                                    },
                                },
                            },
                        },
                    ],
                },
                options: {
                    scales: {
                        x: {
                            type: "time",
                            time: {
                                tooltipFormat: "yyyy-MM-dd HH:mm",
                            },
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

{$inspect(graphData)}

<div>
    <canvas id="lineChart" use:chart={graphData}></canvas>
</div>
