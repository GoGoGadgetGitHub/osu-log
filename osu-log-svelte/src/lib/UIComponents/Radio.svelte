<script>
    let {
        name,
        options,
        color,
        selected = $bindable(),
        defaultIndex,
    } = $props();
</script>

<div style="--color: {color}" class="radio">
    {#each options as option, i}
        <label for="{name}-{option}">
            <input
                id="{name}-{option}"
                type="radio"
                {name}
                checked={defaultIndex === i ? "true" : "false"}
                value={option}
                bind:group={selected}
            />
            <span>{option}</span>
        </label>
    {/each}
</div>

<style>
    .radio input[type="radio"]:focus {
        outline: 0;
        border: 2px solid var(--foreground);
        box-shadow: 0 0 0 4px #b5c9fc;
    }

    .radio {
        display: flex;
        justify-content: center;
    }

    .radio input[type="radio"] {
        clip: rect(0 0 0 0);
        clip-path: inset(100%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap;
        width: 1px;
    }

    .radio input[type="radio"]:checked + span {
        box-shadow: 0 0 0 2px var(--color);
        background-color: color-mix(
            in srgb,
            var(--color) 10%,
            var(--background-2)
        );
        z-index: 1;
        color: var(--foreground);
    }

    .radio label span {
        display: block;
        cursor: pointer;
        background-color: var(--background-2);
        padding: 0.3em;
        position: relative;
        margin-left: 0.0625em;
        box-shadow: 0 0 0 2px var(--foreground);
        letter-spacing: 0.05em;
        color: var(--foreground);
        text-align: center;
        transition: 0.25s;
    }

    .radio label:first-child span {
        border-radius: 0.375em 0 0 0.375em;
    }

    .radio label:last-child span {
        border-radius: 0 0.375em 0.375em 0;
    }
</style>
