<script>
	let { userData } = $props();
</script>

<div class="profile-container">
	<div class="profile-img">
		<!-- TODO: find out why this does not open a new tab-->
		<a
			aria-label="go to profile"
			traget="_blank"
			href={`https://osu.ppy.sh/users/${userData.id}`}
		>
			<span>Go To Profile</span>
			<img alt src={userData.avatar_url} />
		</a>
	</div>

	<div class="profile-stats">
		<ul>
			<li class="username">
				<a
					aria-label="go to profile"
					traget="_blank"
					href={`https://osu.ppy.sh/users/${userData.id}`}
				>
					{userData.username}
				</a>
			</li>
			<li>Score: {userData.statistics.ranked_score}</li>
			<li>
				Rank: {userData.rank_history.data[
					userData.rank_history.data.length - 1
				]}
			</li>
			<li>PP: {userData.statistics.pp}</li>
		</ul>
	</div>
</div>

<style>
	.profile-container {
		display: grid;
		grid-template-columns: 7rem 1fr;
		grid-template-rows: 7rem;
		grid-gap: 1rem;
		width: max-content;
	}

	.profile-stats ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
	}

	.profile-stats {
		display: flex;
		align-items: center;
	}

	li {
		color: var(--foreground);
	}

	.username {
		font-size: 20px;
		font-weight: bold;
	}

	.profile-img {
		position: relative;
		border-radius: 50%;
		overflow: hidden;
	}

	.profile-img img {
		position: relative;
		z-index: 1;
		filter: brightness(100%);
		width: 100%;
		transition: var(--transition);
	}

	.profile-img a:hover span {
		opacity: 1;
	}

	.profile-img span:hover {
		color: var(--hover);
	}

	.profile-img a:hover img {
		filter: brightness(70%);
	}

	.profile-img a {
		display: block;
		width: 100%;
		height: 100%;
		transition: 0.3s;
	}

	.profile-img span {
		opacity: 0;
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		color: var(--foreground);
		z-index: 2;
		transition: var(--transition);
	}
</style>
