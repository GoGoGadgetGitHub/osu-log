<script>
    import MinMaxInput from "$lib/UIComponents/MinMaxInput.svelte";
    import ModFilter from "$lib/Filter/ModFilter/ModFilter.svelte";
    import RankFilter from "$lib/Filter/RankFilter.svelte";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { boolean } from "mathjs";

    let { filter = $bindable() } = $props();

    let beatmapID = $state("");
    let name = $state("");
    let mods = $state([]);
    let exclusive = $state(false);
    let ppMin = $state(0);
    let ppMax = $state(0);
    let accMin = $state(0);
    let accMax = $state(100);
    let lazer = $state(false);
    let ranks = $state([]);
    let fails = $state(true);

    document.addEventListener("filterupdate", updateFilter);
    function updateFilter() {
        filter = {
            beatmapID,
            name,
            mods: {
                array: mods,
                exclusive,
            },
            acc: {
                max: accMax,
                min: accMin,
            },
            pp: {
                max: ppMax,
                min: ppMin,
            },
            ranks,
            fails,
        };
    }
</script>

{$inspect(filter)}

<form>
    <div class="filters">
        <div class="title-id">
            <label>
                Beatmap Title
                <input
                    type="text"
                    placeholder="Search by title..."
                    bind:value={name}
                    oninput={updateFilter}
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
                    oninput={updateFilter}
                />
            </label>
        </div>

        <ModFilter {exclusive} bind:lazer bind:mods />

        <RankFilter bind:ranks />

        <div class="acc-pp-fail">
            <div class="acc-filter">
                <label for="accmin">
                    <span>min</span>
                    <input
                        id="accmin"
                        class="min"
                        type="number"
                        bind:value={accMin}
                        min="0"
                        max={accMax}
                        oninput={updateFilter}
                    />
                </label>
                <span>Acc</span>
                <label for="accmax">
                    <span>max</span>
                    <input
                        id="accmax"
                        class="max"
                        type="number"
                        bind:value={accMax}
                        min={accMin}
                        max="100"
                        oninput={updateFilter}
                    />
                </label>
            </div>
            <div class="pp-filter">
                <label for="ppmin">
                    <span>min</span>
                    <input
                        id="ppmin"
                        class="min"
                        type="number"
                        bind:value={ppMin}
                        min="0"
                        max={ppMax}
                        oninput={updateFilter}
                    />
                </label>
                <span>PP</span>
                <label for="ppmax">
                    <span>max</span>
                    <input
                        id="ppmax"
                        class="max"
                        type="number"
                        bind:value={ppMax}
                        min={ppMin}
                        oninput={updateFilter}
                    />
                </label>
            </div>
            <div class="fail-toggle">
                <span>Fails</span>
                <Toggle
                    color="var(--hover)"
                    tooltip="Include fails"
                    bind:checked={fails}
                    callback={updateFilter}
                />
            </div>
        </div>
    </div>
    <div class="buttons">
        <button type="submit">Apply Filter</button>
        <button>Clear Filter</button>
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

    .pp-filter,
    .acc-filter {
        font-weight: bold;
        display: flex;
        width: max-content;
        align-items: center;
        gap: 1rem;
    }

    .acc-filter label,
    .pp-filter label {
        position: relative;
    }

    .acc-filter label span,
    .pp-filter label span {
        position: absolute;
        bottom: 100%;
        left: 50%;
        translate: -50% 0;
        font-size: 0.8rem;
    }

    #ppmax,
    #ppmin {
        width: 4rem;
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
    }

    .buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    .acc-pp-fail {
        margin-top: 0.8rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .buttons button {
        background: var(--background-2);
        color: var(--foreground);
        border: none;
        border-radius: 20px;
        padding: 0.4rem;
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
</style>
