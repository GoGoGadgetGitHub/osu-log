<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import "chartjs-adapter-date-fns";
    import { linear } from "svelte/easing";
    import FarLeft from "../svg/FarLeft.svelte";

    let { sessionScores } = $props();
    let lineChart;

    let { min, max } = $derived(sessionScores.meta.stats.sr);

    const range = $derived((max - min) / 8);

    let stars = $derived.by(() => {
        const scores = sessionScores.scores;
        const freq = [0, 0, 0, 0, 0, 0, 0, 0];

        for (const score of scores) {
            const sr = score.performance.attributes.stars;
            const index = Math.floor((sr - min) / range);
            freq[index - 1] += 1;
        }
        return freq;
    });

    let labels = $derived.by(() => {
        let lbls = [];
        for (let i = 0; i <= 7; i++) {
            const minLabel = `${Math.round((min + range * i) * 100) / 100}`;
            const maxLabel = `${Math.round((min + range * (i + 1)) * 100) / 100}`;
            const label = `${minLabel} - ${maxLabel}`;
            lbls.push(label);
        }
        return lbls;
    });

    function chart(node, graphData) {
        function setupChart(_graphData) {
            const tooltip = {
                callbacks: {
                    label: (node) => {
                        return node.raw.meta.name;
                    },
                },
            };

            lineChart = new Chart(node, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            data: _graphData,
                            label: "Star Rating Spread",
                        },
                    ],
                },
                options: {},
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

<div>
    <canvas id="lineChart" use:chart={stars}></canvas>
</div>
