<script>
    import Profile from "$lib/User/Profile.svelte";
    import Username from "$lib/User/Username.svelte";
    import Star from "$lib/Svg/Star.svelte";
    import LargeLoader from "$lib/UIComponents/Loaders/LargeLoader.svelte";
    import SessionGroup from "$lib/SessionGroup.svelte";

    import { slide } from "svelte/transition";
    import axios from "axios";

    let userData = $state("");
    let loading = $state(false);
    let error = $state("");
</script>

<div class="main">
    <!-- <a href onclick={changeSession}>Test</a> -->
    <Username bind:userData {error} {loading} />
    {#if loading && !userData}
        <LargeLoader />
    {:else if userData && !error}
        <div class="profile-and-session">
            <Profile {userData} />
        </div>
        <SessionGroup {userData} {error} {loading} />
    {/if}
</div>

<style>
    @import "../css/global.css";

    .main {
        max-width: 1000px;
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
