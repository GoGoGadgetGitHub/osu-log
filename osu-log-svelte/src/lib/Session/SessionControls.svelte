<script>
    import Gear from "$lib/Svg/Gear.svelte";
    import Left from "$lib/Svg/Left.svelte";
    import Right from "$lib/Svg/Right.svelte";
    import axios from "axios";
    import SessionSelector from "./SessionSelector.svelte";
    import { resolve } from "$app/paths";
    import { onMount } from "svelte";
    import { fade, slide } from "svelte/transition";
    import { flip } from "svelte/animate";

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

    let { sessionScores = $bindable({}), userData } = $props();
    let month = $state(new Date().getMonth());
    let year = $state(new Date().getFullYear());
    let sessions = $state([]);

    onMount(async () => {
        let resp;
        try {
            resp = await axios.get(
                `http://localhost:3000/get-sessions/${userData.id}`,
            );
        } catch (e) {
            console.log(e);
        } finally {
            sessions = resp.data;
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
        const dataset = e.target.dataset;
        const day = `${Number(dataset.month) + 1}/${dataset.day}/${year}`;

        if (sessions[day].active) {
            sessions[day].active = false;
            e.target.parentElement.classList.remove("selected");
        } else {
            sessions[day].active = true;
            e.target.parentElement.classList.add("selected");
        }
        document.dispatchEvent(new Event("calButtonClicked"));
    }

    async function updateSessionScores() {
        const sessionList = [];
        const checkboxes = document.querySelectorAll(".session-selector");
        for (const checkbox of checkboxes) {
            if (checkbox.checked) {
                sessionList.push(checkbox.dataset.value);
            }
        }

        let resp;
        try {
            resp = await axios.get(
                `http://localhost:3000/get-combined-session/${userData.id}/`,
                {
                    params: {
                        sessionID: sessionList,
                    },
                },
            );
        } catch (e) {
            console.log(e);
            return;
        } finally {
            sessionScores = resp.data;
        }
    }
</script>

<!--HTML-->
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

<div transition:fade class="container">
    <div class="calander">
        <div class="month">
            <button id="left" onclick={calArrowClicked}>
                <Left />
            </button>
            <span>{months[month]} {year}</span>
            <button id="right" onclick={calArrowClicked}>
                <Right />
            </button>
        </div>
        <div class="pad">
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
                <button>Add all</button>
                <button>Remove all</button>
                <button>This month</button>
                <button>3 Months</button>
                <button>6 Months</button>
                <button>Year</button>
            </div>
        </div>
    </div>
    <div class="sessions">
        <div class="grid">
            {#each Object.keys(sessions) as day}
                {#if sessions[day].active}
                    {#each sessions[day].sessions as session (session.session_id)}
                        <SessionSelector
                            id={session.session_id}
                            plays={session.plays}
                            {updateSessionScores}
                        />
                    {/each}
                {/if}
            {/each}
        </div>
        <button onclick={updateSessionScores}>Get Sessions</button>
    </div>
</div>

<style>
    .container {
        display: flex;
        color: var(--foreground);
        border-radius: var(--radius);
        padding: 0.5rem;
        gap: 2rem;
    }

    .sessions {
        flex: 1;
        background: var(--background-light);
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius);
        gap: 1rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }

    .sessions .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        height: min-content;
        width: 100%;
        gap: 0.3rem;
    }

    .calander {
        flex: 1;
        display: grid;
        grid-template-rows: 1.5rem 1fr;
        gap: 0.5rem;
        box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
        border-radius: var(--radius);
        background: var(--background-light);
    }

    .pad {
        padding: 0.5rem;
    }

    .selection {
        display: flex;
        justify-content: space-between;
    }

    .sessions button,
    .selection button {
        border: none;
        background: var(--background-verylight);
        color: var(--foreground);
        border-radius: var(--radius);
        padding: 0.4rem;
    }

    .selection > * {
        display: inline-block;
    }

    .rows {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.5rem;
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
        height: 100%;
        aspect-ratio: 1;
        border: none;
        color: var(--foreground);
        background: none;
        border-radius: 50%;
        padding: 0.5rem;
        transition: 0.25s;
    }

    .date button:hover {
        background: var(--background-verylight);
    }

    .date.has-sessions button {
        color: var(--hover);
        background-color: color-mix(
            in srgb,
            var(--hover) 10%,
            var(--background-light)
        );
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
        color: var(--background);
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

    @media (max-width: 800px) {
        .container {
            flex-direction: column;
        }
        .sessions .grid {
            grid-template-columns: 1fr;
        }
    }
</style>
