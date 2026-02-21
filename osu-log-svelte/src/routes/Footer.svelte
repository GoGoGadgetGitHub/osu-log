<script>
    import Github from "$lib/Svg/Github.svelte";

    let { initial } = $props();
</script>

<footer>
    <a href="https://github.com/GoGoGadgetGitHub/osu-log">
        <Github />
    </a>
</footer>

<style>
    footer {
        padding: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    :global(footer svg) {
        fill: var(--foreground);
        height: 2rem;
        width: 2rem;
    }
</style>
