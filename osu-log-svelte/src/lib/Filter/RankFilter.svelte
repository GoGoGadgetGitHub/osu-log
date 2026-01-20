<script>
    import { A, B, C, D, F, S, X, Sh, Xh } from "$lib";
    import Wiggle from "$lib/Svg/mods/Wiggle.svelte";
    let gradeIcons = { X, XH: Xh, S, SH: Sh, A, B, C, D, F };
    let { ranks = $bindable([]) } = $props();

    const grades = [
        {
            name: "XH",
            color: "linear-gradient(rgba(232, 231, 225, 1) 20%, rgba(184, 184, 182, 1) 100%)",
            background: "rgba(232, 231, 225, 1)",
        },
        {
            name: "SH",
            color: "linear-gradient(rgba(232, 231, 225, 1) 20%, rgba(184, 184, 182, 1) 100%)",
            background: "rgba(232, 231, 225, 1)",
        },
        {
            name: "X",
            color: "linear-gradient(rgba(255, 251, 183, 1) 20%, rgba(251, 180, 37, 1) 99%)",
            background: "rgba(255, 251, 183, 1)",
        },
        {
            name: "S",
            color: "linear-gradient(rgba(255, 251, 183, 1) 20%, rgba(251, 180, 37, 1) 99%)",
            background: "rgba(255, 251, 183, 1)",
        },
        { name: "A", color: "#88DA20" },
        { name: "B", color: "#EBBD48" },
        { name: "C", color: "#FF8E5D" },
        { name: "D", color: "#FF5A5A" },
    ];
    const ignoreGradient = ["S", "X", "SH", "XH"];

    function clicked(e) {
        e.preventDefault();
        const rank = e.target;
        const name = rank.dataset.name;
        if (ranks.includes(name)) {
            removeRank(name);
        } else {
            addRank(name);
        }
    }

    function removeRank(name) {
        const index = ranks.indexOf(name);
        if (index > -1) {
            ranks = ranks.filter((rank) => {
                return rank !== name;
            });
        }
    }

    function addRank(name) {
        ranks = [...ranks, name];
    }

    function clearAll() {
        const rankButtones = document.querySelectorAll(".rank");
        for (const rankButton of rankButtons) {
            const name = modButton.dataset.name;
            removeRank(name);
        }
    }
</script>

<div class="ranks">
    {#each grades as { name, color, background }}
        <button
            style:--color={color}
            style:--hover-background={ignoreGradient.includes(name)
                ? background
                : color}
            data-name={name}
            onclick={clicked}
            class={["rank", ranks.includes(name) ? "rank-active" : ""]}
        >
            <span>{name}</span>
        </button>
    {/each}
</div>

<style>
    .ranks {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 0.3rem;
    }

    .rank {
        font-size: 1.1rem;
        position: relative;
        width: 3rem;
        height: 1.5rem;
        background: var(--background-2);
        border-radius: var(--radius);
        border: none;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        transition: 0.25s;
    }

    .rank span {
        position: absolute;
        left: 50%;
        top: 50%;
        translate: -50% -50%;
        pointer-events: none;
        background: var(--color);
        background-clip: text;
        color: transparent;
        transition: 0.25s;
    }

    .rank:hover span {
        scale: 1.1;
    }

    :global(.rank-active span) {
        scale: 1.1;
    }

    .rank:hover {
        box-shadow: 0px 0px 6px var(--hover-background);
        background-color: color-mix(
            in srgb,
            var(--hover-background) 7%,
            var(--background-2)
        );
    }

    :global(.rank.rank-active) {
        box-shadow: 0px 0px 6px var(--hover-background);
        background-color: color-mix(
            in srgb,
            var(--hover-background) 30%,
            var(--background-2)
        ) !important;
    }
</style>
