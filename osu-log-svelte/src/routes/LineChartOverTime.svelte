<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";

    let { sessionScores } = $props();
    let lineChart = $state({});

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
            const datasets = [
                { ...timePP, tooltip },
                { ...timeStars, tooltip },
            ];

            console.log(datasets);

            lineChart = new Chart(node, {
                type: "line",
                data: {
                    datasets: [
                        { ...timePP, tooltip },
                        { ...timeStars, tooltip },
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

{$inspect(starsTime)}

<div>
    <a
        id="button"
        href="#button"
        onclick={() => {
            console.log("clicked");
            starsTime["hidden"] = true;
            console.log(starsTime);
        }}
    >
        click me
    </a>

    <canvas id="lineChart" use:chart={[starsTime, ppTime]}></canvas>
</div>
