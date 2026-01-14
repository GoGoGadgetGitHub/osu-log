<script>
    let {
        max = $bindable(0),
        min = $bindable(0),
        text,
        oninput,
        id,
    } = $props();
</script>

<div>
    <input id="min{id}" type="number" value={min} min="0" {oninput} />
    <span>{text}</span>
    <input id="min{id}" type="number" value={max} min="0" {oninput} />
</div>

<style>
    input[type="number"] {
        background: var(--background-3);
        border: none;
        appearance: textfield;
        text-align: center;
        width: 2rem;
        color: var(--foreground);
        border-radius: 10px;
        -moz-appearance: textfield;
        &::-webkit-inner-spin-button {
            -webkit-appearance: none;
        }
        &::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }
    }
</style>
