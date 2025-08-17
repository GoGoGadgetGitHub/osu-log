<script>
    import Profile from "./Profile.svelte";
    import Username from "./Username.svelte";
    import Pagination from "./Pagination.svelte";
    import ScoresTable from "./ScoresTable.svelte";
    import Star from "../svg/Star.svelte";
    import Loader from "./Loader.svelte";
    import { slide } from "svelte/transition";
    import axios from "axios";
    import SessionSummary from "./SessionSummary.svelte";

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
        userData = "";
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
        if (initialData.data === "NO_SCORES") {
            error =
                "No scored in the last 48 hours, and no scores saved. Nothing to display :(";
            loading = false;
            return;
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
    {#if loading && !userData}
        <Loader />
    {:else if userData && !error}
        <Profile {userData} />
        <ScoresTable {sessionScores} {maxSessions} {changeSession} {loading} />
        <SessionSummary {sessionScores} />
    {/if}
</div>

<style>
    .main {
        width: 80%;
        margin: auto;
        display: grid;
        row-gap: 1rem;
    }
    @media (max-width: 800px) {
        .main {
            width: 100%;
            margin: auto;
            display: grid;
            row-gap: 1rem;
        }
    }
</style>
