<script>
	import axios from "axios";
	import { goto } from "$app/navigation";

	let {
		userData = $bindable(""),
		initial = $bindable(true),
		loading = $bindable(false),
		error = $bindable(""),
		redirect,
	} = $props();

	let value = $state();

	async function getUserData() {
		error = "";
		userData = "";
		initial = false;
		loading = true;
		let resp;
		try {
			resp = await axios.get(`http://localhost:3000/track/${value}`);
		} catch (e) {
			console.log(e);
			error = `Could not fetch user data for ${value}`;
			loading = false;
		} finally {
			userData = resp.data;
			loading = false;
		}
	}
</script>

<div class="username">
	<h2>Enter your username!</h2>
	<input placeholder="Enter your osu username" type="text" bind:value />
	<button onclick={getUserData}>Track!</button>
	{#if error}
		<p>{error}</p>
	{/if}
</div>

<style>
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
