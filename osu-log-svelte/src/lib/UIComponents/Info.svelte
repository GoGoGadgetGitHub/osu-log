<script>
    import Wiggle from "$lib/Svg/mods/Wiggle.svelte";
    import Close from "$lib/Svg/Close.svelte";
    import { fade } from "svelte/transition";

    let { dummyUsername = $bindable("") } = $props();
    let active = $state(false);

    function showModal() {
        active = true;
    }

    function hideModal() {
        active = false;
    }

    function fillUsername(open) {
        dummyUsername = "Harumiii";
    }

    function buttonClicked(open) {
        fillUsername();
        hideModal();
    }
</script>

<div class="help">
    <p>
        If you dont't know what osu is click
        <a href onclick={showModal}>here.</a>
    </p>
</div>

{#if active}
    <div transition:fade class="modal">
        <div class="modal-window">
            <button onclick={hideModal} class="close" aria-label="Close Modal">
                <Close />
            </button>
            <p>
                <a href="https://osu.ppy.sh/">osu!</a> is a popular open source
                rhythm game. This web app aims to assit players in tracking and
                analysing thier gameplay habits by saving thier scores (fetched
                with the osu API) in a database.
                <br />
                <br />
                If you click the button bellow, it will automatically show the profile
                a player to showcase the app
            </p>
            <button class="will-do" onclick={buttonClicked}>Let's do it!</button
            >
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        left: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.8);
        width: 100vw;
        height: 100vh;
        display: grid;
    }

    .help {
        margin-top: 1rem;
        text-align: center;
        font-size: 12px;
        color: var(--foreground);
    }

    .help a {
        color: var(--hover);
        &:hover {
            text-decoration: underline;
        }
    }

    .modal-window {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        position: relative;
        background: var(--background-2);
        max-width: 500px;
        margin: auto;
        color: var(--foreground);
        padding: 1.4rem;
        border-radius: 20px;
    }

    .modal-window a {
        color: var(--hover);
    }

    .modal-window p {
        margin: 0;
    }

    .will-do {
        background: var(--background-3);
        border: none;
        color: var(--foreground);
        padding: 0.5rem;
        border-radius: 20px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        transition: 0.45s;

        &:hover {
            background: var(--background-4);
            cursor: pointer;
        }
    }

    .close {
        position: absolute;
        top: -2rem;
        right: -1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: var(--background-3);
        fill: var(--foreground);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        border-radius: 100%;
        width: 1.5rem;
        height: 1.5rem;
        transition: 0.45s;

        &:hover {
            background: var(--background-4);
            cursor: pointer;
        }
    }
</style>
