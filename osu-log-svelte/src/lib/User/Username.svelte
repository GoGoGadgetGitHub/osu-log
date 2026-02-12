<script>
	import axios from "axios";
	import { goto } from "$app/navigation";

	let {
		userData = $bindable(""),
		initial = $bindable(true),
		loading = $bindable(false),
		error = $bindable(""),
		dummyUsername,
		redirect,
	} = $props();

	$effect(() => {
		if (dummyUsername) {
			getUserData(dummyUsername);
		}
	});

	let user = $state();

	async function getUserData(user) {
		error = "";
		userData = "";
		initial = false;
		loading = true;
		let resp;
		try {
			resp = await axios.get(`${import.meta.env.VITE_API_BASE}/track/${user}`);
		} catch (e) {
			console.log(e);
			error = `Could not fetch user data for ${user}`;
			loading = false;
		} finally {
			userData = resp.data;
			loading = false;
		}
	}

	async function trackClicked() {
		getUserData(user);
	}
</script>

<div class="username">
	<h2>Enter your username!</h2>
	<input placeholder="Enter your osu username" type="text" bind:value={user} />
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
