<script>
	let { callback, error } = $props();
	let value = $state();

	function handleCallback() {
		callback(value);
	}
</script>

<div class="username">
	<h2>Enter your username!</h2>
	<input placeholder="Enter your osu username" type="text" bind:value />
	<button onclick={handleCallback}>Track!</button>
	{#if error}
		<p>{error}</p>
	{/if}
</div>

<style>
	@import "../css/global.css";

	.username {
		width: max-content;
		margin: 0 auto;
		color: var(--foreground);
		text-align: center;
	}

	.username p {
		margin: 1rem 0 0 0;
		font-weight: bold;
		color: var(--hover);
	}

	input,
	button {
		background: var(--foreground);
		border: transparent;
		border-radius: var(--radius);
		padding: 5px 10px;
		font-weight: bold;
		transition: var(--transition);
	}

	input:focus {
		outline: none;
		box-shadow: 0px 0px 8px var(--foreground);
	}

	button:hover {
		box-shadow: 0px 0px 8px var(--foreground);
		cursor: pointer;
	}
</style>
