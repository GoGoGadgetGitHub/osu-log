<script>
    import { fade } from "svelte/transition";
    let {
        cls,
        id,
        data,
        callback,
        checked = $bindable(false),
        color,
        tooltip,
    } = $props();

    let showTooltip = $state(false);

    function mouseOver(e) {
        showTooltip = true;
    }

    function mouseLeave(e) {
        showTooltip = false;
    }
</script>

<label
    class="switch"
    onmouseover={mouseOver}
    onmouseleave={mouseLeave}
    onfocus={mouseOver}
    for={id}
>
    {#if showTooltip && tooltip}
        <div in:fade={{ duration: 200 }} class="tooltip">
            {tooltip}
        </div>
    {/if}
    <div rol="tooltip"></div>
    <input
        class={cls}
        {id}
        type="checkbox"
        data-value={data}
        onclick={callback}
        bind:checked
    />
    <div style="--color: {color}" class="slider round"></div>
</label>

<style>
    .switch {
        display: inline-block;
        position: relative;
        height: 1.3rem;
        width: 2.5rem;
    }

    .switch input {
        display: none;
    }

    .slider {
        border-radius: 20px;
        background: var(--background-3);
        position: absolute;
        cursor: pointer;
        bottom: 0;
        left: 0;
        top: 0;
        right: 0;
        transition: 0.25s;
        box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
    }

    .slider::before {
        content: "";
        background: var(--foreground);
        position: absolute;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        top: 50%;
        left: 0.1rem;
        transform: translate(0.2rem, -50%);
        transition: 0.25s;
    }

    .tooltip {
        position: absolute;
        bottom: 105%;
        left: 50%;
        translate: -50% 0;
        background: var(--background-2);
        width: max-content;
        border-radius: 5px;
        padding: 0.3rem;
        color: var(--foreground);
        font-size: 0.9rem;
        pointer-events: none;
    }

    input:checked + .slider {
        background: var(--color);
    }

    input:checked + .slider::before {
        transform: translate(1.1rem, -50%);
    }
</style>
