<script>
    import Profile from "$lib/User/Profile.svelte";
    import Username from "$lib/User/Username.svelte";
    import Star from "$lib/Svg/Star.svelte";
    import LargeLoader from "$lib/UIComponents/Loaders/LargeLoader.svelte";
    import SessionGroup from "$lib/SessionGroup.svelte";

    import { slide, fade } from "svelte/transition";
    import axios from "axios";
    import Logo from "$lib/Svg/Logo.svelte";

    let userData = $state("");
    let loading = $state(false);
    let error = $state("");
    let initial = $state(true);
</script>

<button
    onclick={async () => {
        let resp;
        try {
            resp = await axios.post(
                `http://localhost:3000/get-combined-session/${userData.id}/`,
                {
                    sessions: [0],
                    filter: {
                        fails: false,
                    },
                },
            );
        } catch (e) {
            console.log(e);
            return;
        } finally {
            console.log(resp.data);
        }
    }}>Test</button
>

{#if initial}
    <div transition:fade class="initial">
        <div class="logo">
            <Logo />
        </div>
        <Username bind:userData bind:initial {error} bind:loading />
    </div>
{/if}

{#if loading && !userData}
    <LargeLoader />
{/if}

{#if !initial && !loading && userData}
    <div class="logo small">
        <Logo />
    </div>
    <div transition:slide class="main">
        <Username bind:userData bind:initial {error} {loading} />
        <div class="profile-and-session">
            <Profile {userData} />
        </div>
        <SessionGroup {userData} {error} {loading} />
    </div>
{/if}

<style>
    @import "src/css/global.css";

    .main {
        max-width: 1000px;
        margin: auto;
        display: grid;
        row-gap: 1rem;
        background: var(--background-1);
        border-radius: var(--radius);
        padding: 1rem;
    }

    .initial {
        background: unset;
        position: absolute;
        top: 50vh;
        left: 50vw;
        translate: -50% -50%;
    }

    .logo {
        display: flex;
        justify-content: center;
        width: max-cotent;
    }

    :global(.logo.small svg) {
        height: 2rem;
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
