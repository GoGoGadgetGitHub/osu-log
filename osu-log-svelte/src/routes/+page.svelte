<script>
    import Profile from "$lib/User/Profile.svelte";
    import Username from "$lib/User/Username.svelte";
    import Star from "$lib/Svg/Star.svelte";
    import LargeLoader from "$lib/UIComponents/Loaders/LargeLoader.svelte";
    import SessionGroup from "$lib/SessionGroup.svelte";
    import { slide, fade } from "svelte/transition";
    import Logo from "$lib/Svg/Logo.svelte";
    import CornerNav from "$lib/UIComponents/CornerNav.svelte";
    import axios from "axios";
    import Info from "$lib/UIComponents/Info.svelte";
    import { DoubleTime } from "$lib";

    let dummyUsername = $state("");
    let userData = $state("");
    let loading = $state(false);
    let error = $state("");
    let initial = $state(true);
</script>

{#if initial || error}
    <div transition:fade class="initial">
        <div class="logo">
            <Logo />
        </div>
        <Username
            {dummyUsername}
            bind:userData
            bind:initial
            bind:error
            bind:loading
        />
        <Info bind:dummyUsername />
    </div>
{/if}

{#if loading}
    <LargeLoader />
{/if}

{#if !initial && !loading && userData}
    <div class="logo small">
        <Logo />
    </div>
    <div transition:slide class="main">
        <Username bind:userData bind:initial bind:error bind:loading />
        <div class="profile-and-session">
            <Profile {userData} />
        </div>
        <SessionGroup {userData} {error} {loading} />
    </div>
    <CornerNav />
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
        box-sizing: border-box;
    }

    .initial {
        width: 370px;
        background: unset;
        position: fixed;
        top: calc(50% - 250px / 2);
        left: calc(50% - 370px / 2);
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

    :global(html) {
        scroll-behavior: smooth;
    }

    @media (prefers-reduced-motion: reduce) {
        :global(html) {
            scroll-behavior: auto;
        }
    }
</style>
