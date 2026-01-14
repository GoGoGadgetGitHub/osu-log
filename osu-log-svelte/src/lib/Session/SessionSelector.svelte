<script>
    import Toggle from "$lib/UIComponents/Toggle.svelte";
    import { onDestroy, onMount } from "svelte";
    let { id, plays, day, sessions = $bindable({}) } = $props();

    const updateSession = (e) => {
        const checkbox = e.target;
        let session = sessions[day].sessions.filter(
            (session) => session.session_id === id,
        )[0];
        session.active = checkbox.checked;
    };
</script>

<label class="session-selector-label">
    <span class="id">
        {id}
    </span>
    <span>
        {plays}
        <strong>Scores</strong>
    </span>
    <Toggle
        color="var(--hover)"
        callback={updateSession}
        cls="session-selector"
        data={id}
        checked="true"
    />
</label>

<style>
    .session-selector-label:nth-child(4n-3),
    .session-selector-label:nth-child(4n) {
        background: var(--background-3);
    }

    .session-selector-label {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        border-radius: var(--radius);
        animation: fadeIn 0.45s ease-out forwards;
        height: max-content;
    }

    :global(.id + input:checked) {
        background: var(--hover);
        color: var(--foreground);
    }
</style>
