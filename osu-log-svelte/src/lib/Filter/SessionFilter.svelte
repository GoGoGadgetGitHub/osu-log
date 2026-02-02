<script>
    import MinMaxInput from "$lib/UIComponents/MinMaxInput.svelte";
    import ModFilter from "$lib/Filter/ModFilter/ModFilter.svelte";
    import RankFilter from "$lib/Filter/RankFilter.svelte";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import Clock from "$lib/Svg/Clock.svelte";
    import Star from "$lib/Svg/Star.svelte";
    import { boolean, im } from "mathjs";

    let { filter = $bindable(), filtered = $bindable() } = $props();
    let localFilter = $state();

    let beatmapID = $state("");
    let name = $state("");
    let mods = $state([]);
    let exclusive = $state(false);
    let ppMin = $state(0);
    let ppMax = $state(0);
    let accMin = $state(0);
    let accMax = $state(100);
    let srMin = $state(0);
    let srMax = $state(0);
    let tMin = $state(0);
    let tMax = $state(0);
    let lazer = $state(false);
    let ranks = $state([]);
    let fails = $state(true);

    $effect.pre(() => {
        resetFilter();
    });

    function applyFilter(e) {
        e.preventDefault();
        filter = localFilter;
        checkFilter();
    }

    function clearFilter(e) {
        if (e) e.preventDefault();
        resetFields();
        resetFilter();
        filter = localFilter;
        filtered = false;
    }

    function resetFields() {
        beatmapID = "";
        name = "";
        mods = [];
        exclusive = false;
        ppMin = 0;
        ppMax = 0;
        accMin = 0;
        accMax = 100;
        srMin = 0;
        srMax = 0;
        tMin = 0;
        tMax = 0;
        lazer = false;
        ranks = [];
        fails = true;
    }

    function resetFilter() {
        localFilter = {
            beatmapID,
            name,
            mods: {
                array: mods,
                exclusive,
            },
            acc: {
                min: accMin ?? 0,
                max: accMax === 100 ? 0 : accMax,
            },
            pp: {
                min: ppMin ?? 0,
                max: ppMax ?? 0,
            },
            stars: {
                min: srMin ?? 0,
                max: srMax ?? 0,
            },
            time: {
                min: tMin ?? 0,
                max: tMax ?? 0,
            },
            ranks,
            fails,
        };
    }

    function checkFilter() {
        filtered = false;

        if (filter.ranks?.length > 0) filtered = true;
        if (filter.fails === false) filtered = true;
        if (filter.mods?.array?.length > 0) filtered = true;

        Object.keys(filter).forEach((key) => {
            if (key === "acc") return;
            if (
                filter[key].min &&
                (filter[key].min !== 0 || filter[key].max !== 0)
            ) {
                filtered = true;
            }
        });
    }
</script>

<form id="filter">
    <div class="filters">
        <div class="title-id">
            <label>
                Beatmap Title
                <input
                    type="text"
                    placeholder="Search by title..."
                    bind:value={name}
                />
            </label>
            <span>OR</span>
            <label>
                Beatmap ID
                <input
                    class="beatmap-id"
                    type="number"
                    placeholder="Search by id..."
                    bind:value={beatmapID}
                />
            </label>
        </div>

        <ModFilter bind:exclusive bind:lazer bind:mods />

        <RankFilter bind:ranks />

        <div class="numeric">
            <MinMaxInput
                bind:max={accMax}
                bind:min={accMin}
                maxVal="100"
                text="%"
                tooltip="Accuracy"
            />

            <MinMaxInput
                bind:max={ppMax}
                bind:min={ppMin}
                text="PP"
                tooltip="Performance"
            />

            <MinMaxInput
                bind:max={srMax}
                bind:min={srMin}
                icon={Star}
                text="Stars"
                tooltip="Star Rating"
            />

            <MinMaxInput
                bind:max={tMax}
                bind:min={tMin}
                icon={Clock}
                tooltip="Lenth in seconds"
            />
        </div>
        <div class="fail-toggle">
            <span>Fails</span>
            <Toggle
                color="var(--hover)"
                tooltip="Include fails"
                bind:checked={fails}
            />
        </div>
    </div>
    <div class="buttons">
        <button type="submit" onclick={applyFilter}>Apply Filter</button>
        <button onclick={clearFilter}>Clear Filter</button>
    </div>
</form>

<style>
    form {
        border-radius: var(--radius);
        padding: 1rem;
    }

    .filters {
        display: flex;
        flex-wrap: wrap;
        column-gap: 3rem;
        row-gap: 1rem;
        align-items: center;
        justify-content: center;
        margin-bottom: 2rem;
        color: var(--foreground);
    }

    .title-id {
        display: flex;
        align-items: center;
        gap: 2rem;
        font-weight: bold;
    }

    .title-id label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .fail-toggle {
        font-weight: bold;
        display: flex;
        justify-content: center;
        gap: 1rem;
        width: 100%;
    }

    .buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    .numeric {
        margin-top: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .buttons button {
        background: var(--background-2);
        color: var(--foreground);
        border: none;
        border-radius: 20px;
        padding: 0.4rem;
        transition: 0.25s;
    }

    .buttons button:hover {
        background: var(--background-3);
        cursor: pointer;
    }

    .beatmap-id,
    input[type="text"] {
        font-size: 1rem;
        background: var(--foreground);
        color: var(--background-0);
        border: none;
        padding: 0.3rem;
        border-radius: var(--radius);
    }

    .beatmap-id::placeholder,
    input[type="text"]::placeholder {
        font-size: 0.83rem;
        font-weight: bold;
    }

    .beatmap-id {
        -moz-appearance: textfield;
        appearance: textfield;
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    }

    input[type="number"]:not(.beatmap-id) {
        font-size: 1rem;
        color: var(--foreground);
        background: var(--background-2);
        border: none;
        padding: 0.2rem;
        appearance: textfield;
        text-align: center;
        width: 2rem;
        border-radius: var(--radius);
        -moz-appearance: textfield;
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    }

    @media (max-width: 800px) {
        .title-id {
            flex-direction: column;
            gap: 0.5rem;
        }
    }
</style>
