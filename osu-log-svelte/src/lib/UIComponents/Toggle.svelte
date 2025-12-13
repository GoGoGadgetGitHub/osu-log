<script>
    let { cls, id, data, callback, checked } = $props();
</script>

<label class="switch" for={id}>
    <input
        class={cls}
        {id}
        type="checkbox"
        data-value={data}
        onclick={callback}
        {checked}
    />
    <div class="slider round"></div>
</label>

<style>
    .switch {
        display: inline-block;
        position: relative;
        height: 1.3rem;
        width: 2.5rem;
    }

    .switch input {
        display: none;
    }

    .slider {
        border-radius: 20px;
        background: var(--background-verylight);
        position: absolute;
        cursor: pointer;
        bottom: 0;
        left: 0;
        top: 0;
        right: 0;
        transition: 0.25s;
        box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4);
    }

    .slider::before {
        content: "";
        background: var(--foreground);
        position: absolute;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        top: 50%;
        left: 0.1rem;
        transform: translate(0.2rem, -50%);
        transition: 0.25s;
    }

    input:checked + .slider {
        background: var(--hover);
    }

    input:checked + .slider::before {
        transform: translate(1.1rem, -50%);
    }
</style>
