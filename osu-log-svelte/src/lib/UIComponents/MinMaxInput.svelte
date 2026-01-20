<script>
    import { fade } from "svelte/transition";

    let {
        max = $bindable(0),
        min = $bindable(0),
        maxVal,
        text,
        icon,
        oninput,
        id,
        tooltip,
    } = $props();

    let tooltipShown = $state(false);

    function size(maxVal) {
        maxVal = Number(maxVal);
        return maxVal <= 0 ? "large" : maxVal <= 999 ? "small" : "large";
    }
    const showTooltip = () => {
        tooltipShown = true;
    };
    const hideTooltip = () => {
        tooltipShown = false;
    };
</script>

<div
    class={[size(maxVal), "filter"]}
    onmouseover={showTooltip}
    onfocus={showTooltip}
    onmouseleave={hideTooltip}
    role="none"
>
    {#if tooltipShown && tooltip}
        <div role="tooltip" in:fade={{ duration: 200 }} class="tooltip">
            {tooltip}
        </div>
    {/if}
    <label for={id}>
        <span>min</span>
        <input
            {id}
            class="min"
            type="number"
            bind:value={min}
            min="0"
            {max}
            {oninput}
        />
    </label>
    {#if icon}
        {@const Icon = icon}
        <span class="label"><Icon /></span>
    {:else}
        <span>{text}</span>
    {/if}
    <label for="ppmax">
        <span>max</span>
        <input
            {id}
            class="max"
            type="number"
            bind:value={max}
            {min}
            max={maxVal}
            {oninput}
        />
    </label>
</div>

<style>
    .filter {
        position: relative;
        font-weight: bold;
        display: flex;
        width: max-content;
        align-items: center;
        gap: 0.3rem;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        padding: 0.2rem;
        border-radius: var(--radius);
        background: var(--background-2);
    }

    .filter .label {
        min-width: 1.3rem;
        height: 1.3rem;
        fill: var(--foreground);
        text-align: center;
    }

    :global(.filter .label svg) {
        height: 1.3rem;
        width: 1.3rem;
    }

    .filter label {
        position: relative;
    }

    .filter label span {
        position: absolute;
        bottom: 110%;
        left: 50%;
        translate: -50% 0;
        font-size: 0.8rem;
    }

    .filter.large input {
        width: 4rem;
    }

    .filter.small input {
        width: 2rem;
    }

    input[type="number"] {
        background: var(--background-3);
        font-size: 1rem;
        border: none;
        appearance: textfield;
        padding: 0.2rem;
        text-align: center;
        color: var(--foreground);
        border-radius: var(--radius);
        -moz-appearance: textfield;
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    }
    .tooltip {
        position: absolute;
        top: 110%;
        left: 50%;
        translate: -50% 0;
        background: var(--background-2);
        width: max-content;
        border-radius: 5px;
        padding: 0.3rem;
        color: var(--foreground);
        pointer-events: none;
        z-index: 1000;
    }
</style>
