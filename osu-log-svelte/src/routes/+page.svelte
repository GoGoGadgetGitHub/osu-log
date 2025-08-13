<script>
    import Profile from "./Profile.svelte";
    import Username from "./Username.svelte";
    import Pagination from "./Pagination.svelte";
    import ScoresTable from "./ScoresTable.svelte";
    import Star from "../svg/Star.svelte";
    import { slide } from "svelte/transition";
    import axios from "axios";

    let loading = $state(false);
    let sessionID = $state(0);
    let userData = $state("");
    let maxSessions = $state(0);
    let sessionScores = $state({});
    let error = $state("");

    //TODO: maybe move this away from here and into a seprate utility module so that i can use this more globally
    let options = {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
    };
    let dateFormatter = new Intl.DateTimeFormat("en-US", options);
    //end

    //TODO: I'd like to move handle track clicked and change session to a better place
    async function handelTrackClicked(usr) {
        error = "";
        loading = true;
        let initialData;

        if (!usr) {
            error = "No username :(";
            return;
        }

        try {
            initialData = await axios.get(`http://localhost:3000/track/${usr}`);
        } catch (e) {
            console.log(e.response.data);
            return;
        } finally {
            loading = false;
        }
        ({ userData, sessionScores, maxSessions } = initialData.data);
        sessionID = sessionScores.meta.id;
    }

    async function changeSession(id) {
        sessionID = id;
        let session;
        if (userData !== "") {
            loading = true;
            try {
                session = await axios.get(
                    `http://localhost:3000/get-scores-for-session/${userData.id}/${id}`,
                );
            } catch (e) {
                console.log(e);
                return;
            } finally {
                loading = false;
                sessionScores = session.data;
                console.log(sessionScores);
            }
        }
    }
</script>

{$inspect(sessionScores)}

<div class="main">
    <Username callback={handelTrackClicked} {error} />
    {#if userData !== ""}
        <Profile {userData} />
        <ScoresTable {sessionScores} />
    {/if}
    <!-- TODO: move Table Below to the ScoresTable -->
    <div class="table-below">
        {#if maxSessions}
            <Pagination {maxSessions} {changeSession} />
        {/if}
        {#if sessionScores.scores}
            <div>{sessionScores.scores.length} Scores</div>
            <div>
                {$inspect(sessionScores)}
                {dateFormatter.format(new Date(sessionScores.meta.time.start))}
                -
                {dateFormatter.format(new Date(sessionScores.meta.time.end))}
            </div>
            <div>
                {sessionScores.meta.time.duration}
            </div>
        {/if}
    </div>
    <div class="session-summary">
        <ul>
            <li>Maps played:</li>
            <li>Maps passed:</li>
            <li>Average pp:</li>
            <li>Average sr:</li>
            <li>Average bpm:</li>
            <li>Average accuracy:</li>
            <li></li>
        </ul>
    </div>
</div>

<style>
    .main {
        width: 90%;
        margin: auto;
        display: grid;
        row-gap: 1rem;
    }

    .session-summary ul {
        display: flex;
        justify-content: space-evenly;
        color: var(--background);
        margin: 0;
        padding: 0;
        list-style-type: none;
    }

    .session-summary {
        background: var(--foreground);
        padding: 0.5rem;
        border-radius: var(--radius);
    }

    .table-below {
        display: flex;
        justify-content: space-between;
        color: var(--foreground);
    }
</style>
