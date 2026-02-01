<script>
    import { Filter, Table, Person, Calendar, Chart, Percent } from "$lib";
    let open = false;

    const links = [
        { href: "#chart", icon: Chart },
        { href: "#summary", icon: Percent },
        { href: "#table", icon: Table },
        { href: "#filter", icon: Filter },
        { href: "#controls", icon: Calendar },
        { href: "#profile", icon: Person },
    ];
</script>

<div class={["nav-root", open ? "open" : ""]}>
    {#each links as link, i}
        {@const Icon = link.icon}
        <a
            class="nav-item"
            href={link.href}
            style="
                --i: {i};
                --count: {links.length};
            "
            on:click={() => (open = false)}
        >
            <Icon />
        </a>
    {/each}

    <button class="nav-toggle" on:click={() => (open = !open)}> ☰</button>
</div>

<style>
    .nav-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        z-index: 1000;
        transition: 0.3s ease;
    }

    .open {
        scale: 1.2;
    }

    .nav-toggle {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: var(--background-3);
        color: white;
        font-size: 20px;
        cursor: pointer;
        position: relative;
        z-index: 2;
    }

    .nav-item {
        position: absolute;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: var(--background-3);
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
        color: white;
        display: grid;
        place-items: center;
        text-decoration: none;
        top: 8px;
        left: 8px;

        transform: translate(0, 0) scale(0);
        transition:
            transform 0.3s ease,
            opacity 0.2s ease,
            background 0.2s ease;
        opacity: 0;
        pointer-events: none;
    }

    .nav-item:hover {
        background: var(--hover);
    }

    :global(.nav-item svg) {
        width: 1rem;
        height: 1rem;
        --color: var(--foreground);
    }

    .open .nav-item {
        opacity: 1;
        pointer-events: auto;

        --start: -0.5rad;
        --step: 0.5rad;

        transform: translate(
                calc(-70px * cos(var(--start) + (var(--i) * var(--step)))),
                calc(-70px * sin(var(--start) + (var(--i) * var(--step))))
            )
            scale(1);
    }
</style>
