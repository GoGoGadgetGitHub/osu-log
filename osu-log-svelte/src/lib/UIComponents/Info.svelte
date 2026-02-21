<script>
    let { dummyUsername = $bindable("") } = $props();

    function fillUsername() {
        dummyUsername = "zylice";
    }

    function buttonClicked() {
        fillUsername();
    }
</script>

<div class="info">
    <h2>What am I looking at?</h2>
    <p>
        <a href="https://osu.ppy.sh/">osu!</a> is a popular open-source rhythm
        game. This web app helps players track and analyse their gameplay habits
        by saving their scores — fetched through the osu! API — in a database
        and providing tools to explore and analyse this data.

        <br /><br />

        Click the button below to automatically load a player profile.
    </p>
    <button class="lets-do-it" onclick={buttonClicked}>Let's do it!</button>
</div>

<style>
    .lets-do-it {
        background: var(--foreground);
        border: none;
        color: var(--background-0);
        padding: 0.4rem 1rem;
        border-radius: 20px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        transition: 0.45s;

        &:hover {
            box-shadow: 0px 0px 8px var(--foreground);
            cursor: pointer;
        }
    }
    .info {
        margin-top: 5rem;
        color: var(--foreground);
        font-size: 14px;
        text-align: center;
    }

    .info a {
        color: var(--hover);
    }
</style>
