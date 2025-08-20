<script>
    const orderResolution = {
        "-1": "assc",
        "1": "desc",
        "0": "no-order",
    };

    let { order } = $props();
</script>

<div class="arrows {orderResolution[`${order}`]}">
    <div class="up"></div>
    <div class="down"></div>
</div>

<style>
    .arrows {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        height: 1rem;
    }
    .up,
    .down {
        width: 0.7rem;
        height: 1rem;
    }
    .up {
        clip-path: polygon(0 100%, 50% 0, 100% 100%);
    }
    .down {
        clip-path: polygon(0 0, 50% 100%, 100% 0);
    }

    .arrows.assc .up {
        background: var(--background);
    }
    .arrows.assc .down {
        background: gray;
    }
    .arrows.desc .up {
        background: gray;
    }
    .arrows.desc .down {
        background: var(--background);
    }
    .arrows.no-order .up,
    .arrows.no-order .down {
        background: gray;
    }
</style>
