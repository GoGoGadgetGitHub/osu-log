<script>
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { onDestroy, onMount } from "svelte";
    let { id, plays, updateSessionScores } = $props();

    onMount(async () => {
        await updateSessionScores();
    });
    onDestroy(async () => {
        await updateSessionScores();
    });
</script>

<label class="session-selector-label">
    <span class="id">
        {id}
    </span>
    <span>
        {plays}
        <strong>Scores</strong>
    </span>
    <Toggle cls="session-selector" data={id} checked="true" />
</label>

<style>
    .session-selector-label:nth-child(4n-3),
    .session-selector-label:nth-child(4n) {
        background: var(--background-verylight);
    }

    .session-selector-label {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        border-radius: var(--radius);
        animation: fadeIn 0.45s ease-out forwards;
    }

    :global(.id + input:checked) {
        background: var(--hover);
        color: var(--foreground);
    }
</style>
