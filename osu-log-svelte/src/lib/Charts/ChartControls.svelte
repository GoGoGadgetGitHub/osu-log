<div class="toggles">
    <div class="hover">
        <div class="gear-icon"><Gear /></div>
    </div>
    <div class="toggles-container">
        <ul>
            {#each Object.keys(dataMap) as data}
                <li>
                    <label class="switch" for="toggle-{data}">
                        {#if data === "sr"}
                            <input
                                class="toggle"
                                id="toggle-{data}"
                                type="checkbox"
                                checked
                                data-set={data}
                                onclick={(e) => changeActiveDatasets(e)}
                            />
                        {:else}
                            <input
                                class="toggle"
                                id="toggle-{data}"
                                type="checkbox"
                                data-set={data}
                                onclick={(e) => changeActiveDatasets(e)}
                            />
                        {/if}
                        <div class="slider round"></div>
                    </label>
                    {dataMap[data].label}
                </li>
            {/each}
        </ul>
    </div>
</div>

<style>
    .toggles:hover .toggles-container {
        width: 13rem;
        height: 4rem;
        padding: 0 1rem 0 1rem;
    }

    .toggles {
        position: absolute;
        top: 0;
        right: -1rem;
        top: 1rem;
    }

    .toggles-container {
        width: 0;
        height: 4rem;
        overflow: clip;
        overflow-clip-margin: border-box 1rem;
        background: var(--background-light);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius) 0 0 var(--radius);
        right: 1rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        margin: auto;
        transition: 0.25s;
    }

    ul {
        margin: 0;
        display: flex;
        list-style: none;
        padding: 0;
        gap: 1rem;
    }

    li {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: rem;
    }
</style>
