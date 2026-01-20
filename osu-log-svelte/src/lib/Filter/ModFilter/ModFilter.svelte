<script>
    import { fade } from "svelte/transition";
    import { modTypeColors, stableMods, lazerMods } from "./mods.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import Wiggle from "$lib/Svg/mods/Wiggle.svelte";

    let modTooltip = $state("");
    let {
        mods = $bindable([]),
        lazer,
        exclusive = $bindable(false),
    } = $props();

    let modsDisplay = $derived.by(() => {
        if (lazer) {
            let ret = { ...stableMods };
            for (const type of Object.keys(lazerMods)) {
                if (!ret[type]) ret[type] = [];
                ret[type] = [...ret[type], ...lazerMods[type]];
            }
            return ret;
        } else {
            return stableMods;
        }
    });

    function clicked(e) {
        e.preventDefault();
        const mod = e.target;
        const acronym = mod.dataset.acronym;
        if (mods.includes(acronym)) {
            removeMod(acronym);
        } else {
            if (acronym === "NM") {
                mods = [];
            }
            removeMod("NM");
            addMod(acronym);
        }
    }

    function removeMod(acronym) {
        const index = mods.indexOf(acronym);
        if (index > -1) {
            mods = mods.filter((mod) => {
                return mod !== acronym;
            });
        }
    }

    function addMod(acronym) {
        mods = [...mods, acronym];
    }

    function mouseOver(e) {
        modTooltip = e.target.dataset.acronym;
    }

    function mouseLeave(e) {
        modTooltip = "";
    }
</script>

<div class="mods-container">
    <div class="mods">
        {#each Object.keys(modsDisplay) as type}
            {#each modsDisplay[type] as { name, component, acronym }}
                {@const Icon = component}
                <button
                    onmouseover={mouseOver}
                    onmouseleave={mouseLeave}
                    onfocus={mouseOver}
                    onclick={clicked}
                    class={["mod", mods.includes(acronym) ? "mod-active" : ""]}
                    data-acronym={acronym}
                    style:--color={modTypeColors[type]}
                >
                    {#if modTooltip === acronym}
                        <div in:fade={{ duration: 200 }} class="tooltip">
                            {name}
                        </div>
                    {/if}
                    <Icon />
                </button>
            {/each}
        {/each}
    </div>
    <div class="lazer-exclusive">
        Lazer<Toggle
            id="lazer"
            tooltip="Toggle lazer scores"
            color="var(--hover)"
            bind:checked={lazer}
            callback={() => {
                mods = [];
            }}
        />
        Exclusive<Toggle
            id="exclusive"
            tooltip="Exclusivly show scores with these mods"
            color="var(--hover)"
            bind:checked={exclusive}
        />
    </div>
</div>

<style>
    .mods-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
    }
    .mods {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.3rem;
    }
    .lazer-exclusive {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: bold;
    }
    :global(.mod svg) {
        width: 2rem;
        height: 2rem;
        position: absolute;
        left: 50%;
        top: 50%;
        translate: -50% -50%;
        pointer-events: none;
        z-index: 0;
        transition: 0.25s;
    }

    .mod {
        position: relative;
        background: var(--background-2);
        border-radius: 50%;
        transition: 0.25s;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
        padding: 0;
        border: none;
        width: 2rem;
        height: 2rem;
    }

    :global(.mod:hover svg) {
        scale: 1.1;
        rotate: 10deg;
    }

    :global(.mod-active svg) {
        scale: 1.1;
        rotate: 10deg;
    }

    .mod:hover {
        box-shadow: 0px 0px 6px var(--color);
        background-color: color-mix(
            in srgb,
            var(--color) 7%,
            var(--background-2)
        );
    }
    :global(.mod.mod-active) {
        box-shadow: 0px 0px 6px var(--color);
        background-color: color-mix(
            in srgb,
            var(--color) 30%,
            var(--background-2)
        ) !important;
        border-radius: 50%;
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
        pointer-events: none;
        z-index: 1000;
    }
</style>
