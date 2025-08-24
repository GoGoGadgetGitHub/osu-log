<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";

    let { stat, sessionScores } = $props();
    let lineChart;

    let graphData = $derived.by(() => {
        const scores = sessionScores.scores;
        return scores.map((score) => {
            return {
                x: new Date(score.score.ended_at).toISOString(),
                y: score.score.accuracy,
            };
        });
    });

    function chart(node, graphData) {
        function setupChart(_graphData) {
            lineChart = new Chart(node, {
                type: "line",
                data: {
                    datasets: [
                        {
                            label: "Some label",
                            data: _graphData,
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
