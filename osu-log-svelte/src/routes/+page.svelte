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
    let error = $state("");
    let sessionScores = $state({});
    let maxSessions = $state(0);

    //I still can't move the away from her since the Username component needs it
    //so this and all of the states it mutates needs to stay here
    //that includes changeSession
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

{$inspect(maxSessions)}

<div class="main">
    <Username callback={handelTrackClicked} {error} />
    {#if userData !== ""}
        <Profile {userData} />
        <ScoresTable {sessionScores} {maxSessions} {changeSession} />
    {/if}
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
</style>
