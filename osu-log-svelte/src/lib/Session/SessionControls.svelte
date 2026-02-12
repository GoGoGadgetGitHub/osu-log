<script>
    import Left from "$lib/Svg/Left.svelte";
    import Right from "$lib/Svg/Right.svelte";
    import axios from "axios";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { flip } from "svelte/animate";
    import Radio from "$lib/UIComponents/Radio.svelte";
    import SessionFilter from "$lib/Filter/SessionFilter.svelte";
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import SmallLoader from "$lib/UIComponents/Loaders/SmallLoader.svelte";

    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const dateFormatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
    });

    let {
        sessionScores = $bindable({}),
        scoresLoading = $bindable({}),
        filtered = $bindable(false),
        userData,
    } = $props();

    let month = $state(new Date().getMonth());
    let year = $state(new Date().getFullYear());
    let filter = $state({});
    let sessions = $state({});
    let sessionsLoading = $state(false);

    let message = $state("Click on a highlited date :)");

    $effect(async () => {
        sessionsLoading = true;

        try {
            const resp = await axios.get(
                `${import.meta.env.VITE_API_BASE}/get-sessions/${userData.id}`,
            );
            sessions = resp.data;
        } catch (e) {
            console.log(e);
        } finally {
            sessionsLoading = false;
        }
    });

    $effect(async () => {
        scoresLoading = true;
        const sessionList = [];

        for (const day of Object.keys(sessions)) {
            for (const session of sessions[day].sessions) {
                if (session.active) {
                    sessionList.push(session.session_id);
                }
            }
        }

        try {
            const resp = await axios.post(
                `${import.meta.env.VITE_API_BASE}/get-scores/${userData.id}/`,
                {
                    filter: {
                        sessions: sessionList,
                        ...filter,
                    },
                },
            );
            sessionScores = resp.data;
            if (resp.data.scores)
                document.dispatchEvent(new Event("sessionScoresUpdated"));
        } catch (e) {
            console.log(e);
            return {};
        } finally {
            scoresLoading = false;
        }
    });

    let dateNumbers = $derived.by(() => {
        let days = [];

        const startDayIndex = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const lastDayOfPervMonth = new Date(year, month, 0).getDate();

        if (startDayIndex != 0) {
            for (let i = 0; i < startDayIndex; i++) {
                const day = lastDayOfPervMonth - (startDayIndex - i) + 1;
                days.push({ day, month: month - 1 });
            }
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, month });
        }

        let day = 1;
        const nDaysFiveRows = 35;
        const nDaysSixRows = 42;

        if (days.length <= nDaysFiveRows) {
            while (days.length < nDaysFiveRows) {
                days.push({ day, month: month + 1 });
                day += 1;
            }
        } else {
            while (days.length < nDaysSixRows) {
                days.push({ day, month: month + 1 });
                day += 1;
            }
        }

        return days;
    });

    async function calArrowClicked(e) {
        if (e.target.id === "right") {
            if (month === 11) {
                month = 0;
                year += 1;
            } else {
                month += 1;
            }
        } else {
            if (month === 0) {
                month = 11;
                year -= 1;
            } else {
                month -= 1;
            }
        }
    }

    async function calButtonClicked(e) {
        console.log(sessions);
        const dataset = e.target.dataset;
        const day = `${Number(dataset.month) + 1}/${dataset.day}/${year}`;

        if (sessions[day].active) {
            sessions[day].active = false;
            sessions[day].sessions.forEach(
                (session) => (session.active = false),
            );
            e.target.parentElement.classList.remove("selected");
        } else {
            message = "";
            sessions[day].active = true;
            sessions[day].sessions.forEach(
                (session) => (session.active = true),
            );
            e.target.parentElement.classList.add("selected");
        }
    }

    function calTimeFrameClicked(e) {
        const action = e.target.dataset.action;
        const scope = e.target.dataset.scope;

        const now = new Date();
        const year = now.getFullYear();

        let days =
            scope === "all"
                ? Object.keys(sessions)
                : Object.keys(sessions).filter(
                      (day) => Number(day.split("/")[0]) === month + 1,
                  );
        let remove = action === "remove" ? true : false;

        console.log(days, remove);

        selectDays(days, remove);
    }

    function selectDays(days, remove) {
        if (!remove) message = "";
        for (const day of days) {
            sessions[day].active = !remove;
            for (const session of sessions[day].sessions) {
                session.active = !remove;
            }
        }
    }

    function toggleSession(e) {
        const checkbox = e.target;
        let session = sessions[day].sessions.filter(
            (session) => session.session_id === id,
        )[0];
        session.active = checkbox.checked;
    }
</script>

{#snippet CalanderButtonWithSession(date, selectedClass)}
    <span class="date has-sessions {selectedClass}">
        <button
            data-day={date.day}
            data-month={date.month}
            onclick={calButtonClicked}
        >
            {date.day}
        </button>
    </span>
{/snippet}

<div id="controls" transition:fade class="container">
    <div class="calander">
        {#if sessionsLoading}
            <SmallLoader />
        {:else}
            <div class="month">
                <button id="left" onclick={calArrowClicked}>
                    <Left />
                </button>
                <span>{months[month]} {year}</span>
                <button id="right" onclick={calArrowClicked}>
                    <Right />
                </button>
            </div>
            <div class="cal-display">
                <div class="rows">
                    {#each days as day}
                        <span class="date day">{day}</span>
                    {/each}
                    {#each dateNumbers as date}
                        {@const day = `${date.month + 1}/${date.day}/${year}`}
                        {#if sessions[day]}
                            {#if sessions[day].active}
                                {@render CalanderButtonWithSession(
                                    date,
                                    "selected",
                                )}
                            {:else}
                                {@render CalanderButtonWithSession(date)}
                            {/if}
                        {:else}
                            <span class="date">
                                <button>{date.day}</button>
                            </span>
                        {/if}
                    {/each}
                </div>
                <div class="selection">
                    <button
                        onclick={calTimeFrameClicked}
                        data-scope="all"
                        data-action="add"
                    >
                        Add All
                    </button>
                    <button
                        onclick={calTimeFrameClicked}
                        data-scope="all"
                        data-action="remove"
                    >
                        Remove All
                    </button>
                    <button
                        onclick={calTimeFrameClicked}
                        data-scope="month"
                        data-action="add"
                    >
                        Add Month
                    </button>
                    <button
                        onclick={calTimeFrameClicked}
                        data-scope="month"
                        data-action="remove"
                    >
                        Remove Month
                    </button>
                </div>
            </div>
        {/if}
    </div>
    <div class="sessions">
        {#if sessionsLoading}
            <SmallLoader />
        {:else if message}
            <div class="prompt">
                <div>{message}</div>
            </div>
        {:else}
            <div class="grid">
                {#each Object.keys(sessions) as day}
                    {#if sessions[day].active}
                        {#each sessions[day].sessions as session}
                            <label class="session-selector-label">
                                <span class="id">
                                    {session.session_id}
                                </span>
                                <span>
                                    {session.plays}
                                    <strong>Scores</strong>
                                </span>
                                <Toggle
                                    color="var(--hover)"
                                    callback={toggleSession}
                                    cls="session-selector"
                                    data={session.id}
                                    checked="true"
                                />
                            </label>
                        {/each}
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
</div>

<SessionFilter bind:filter bind:filtered />

<style>
    .container {
        display: flex;
        color: var(--foreground);
        border-radius: var(--radius);
        padding: 0.5rem;
        gap: 2rem;
        height: 22rem;
    }

    .sessions {
        position: relative;
        flex: 1;
        background: var(--background-2);
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius);
        gap: 1rem;
        padding: 1rem;
        overflow-y: scroll;
    }

    .sessions .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.3rem;
    }

    .calander {
        position: relative;
        flex: 1;
        display: grid;
        grid-template-rows: 1.5rem 1fr;
        gap: 0.5rem;
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius);
        background: var(--background-2);
    }

    .cal-display {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;
    }

    .selection {
        display: flex;
        justify-content: space-between;
    }

    .selection button {
        border: none;
        background: var(--background-3);
        color: var(--foreground);
        border-radius: var(--radius);
        padding: 0.4rem;
        transition: 0.45s;
    }

    .selection button:hover {
        background: var(--background-4);
        cursor: pointer;
    }

    .selection > * {
        display: inline-block;
    }

    .rows {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
        flex: 1;
    }

    .date {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
    }

    .date.day {
        position: relative;
        font-weight: bold;
    }

    .date.day::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 2px;
        background: var(--foreground);
        bottom: 0;
        border-radius: 20px;
    }

    .date button {
        height: 2rem;
        aspect-ratio: 1;
        border: none;
        color: var(--foreground);
        background: none;
        border-radius: 50%;
        padding: 0.5rem;
        transition: 0.25s;
    }

    .date button:hover {
        background: var(--background-3);
    }
    .date.has-sessions {
        button {
            color: var(--hover);
            background-color: color-mix(
                in srgb,
                var(--hover) 10%,
                var(--background-2)
            );
            &:hover {
                cursor: pointer;
            }
        }
        &:not(.selected) button:hover {
            background-color: color-mix(
                in srgb,
                var(--hover) 40%,
                var(--background-2)
            );
        }
    }

    :global(.date.has-sessions.selected button) {
        background-color: var(--hover);
        color: var(--foreground);
    }

    .month {
        font-weight: bold;
        display: flex;
        width: 100%;
        background: var(--foreground);
        border-radius: var(--radius) var(--radius) 0 0;
        color: var(--background-0);
        margin-bottom: 1rem;
        padding: 0.3rem 0;
        height: min-content;
    }

    .month span {
        text-align: center;
        flex: 1;
    }

    .month button {
        background: transparent;
        border: none;
        fill: var(--background);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 1.5rem;
        transition: 0.25s;
    }

    .month button:hover {
        fill: var(--hover);
        transform: scale(1.3);
    }

    :global(.month svg) {
        width: 0.5rem;
        height: 1rem;
    }

    .prompt {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        color: var(--foreground);
        font-weight: bold;
    }
    .session-selector-label:nth-child(4n-3),
    .session-selector-label:nth-child(4n) {
        background: var(--background-3);
    }

    .session-selector-label {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        border-radius: var(--radius);
        animation: fadeIn 0.45s ease-out forwards;
        height: max-content;
    }

    :global(.id + input:checked) {
        background: var(--hover);
        color: var(--foreground);
    }

    @media (max-width: 800px) {
        .container {
            flex-direction: column;
            height: unset;
        }
        .sessions .grid {
            grid-template-columns: 1fr;
        }
        .calander {
            margin: auto;
            width: 60%;
            min-width: 20rem;
        }
    }
</style>
