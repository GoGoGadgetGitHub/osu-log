<script>
    import { onMount } from "svelte";

    let {
        label,
        min = $bindable(0),
        max = $bindable(100),
        maxValue,
    } = $props();

    onMount(() => {
        slideOne();
        slideTwo();
    });

    let minGap = 0;

    function getElements() {
        let sliderOne = document.getElementById("slider-1");
        let sliderTwo = document.getElementById("slider-2");
        return { sliderOne, sliderTwo };
    }

    function slideOne() {
        const { sliderOne, sliderTwo } = getElements();
        const sliderTwoVal = parseInt(sliderTwo.value);
        const sliderOneVal = parseInt(sliderOne.value);

        if (sliderTwoVal - sliderOneVal <= minGap) {
            sliderOne.value = sliderTwoVal - minGap;
            return;
        }
        min = sliderOneVal;
    }

    function slideTwo() {
        const { sliderOne, sliderTwo } = getElements();
        const sliderTwoVal = parseInt(sliderTwo.value);
        const sliderOneVal = parseInt(sliderOne.value);

        if (sliderTwoVal - sliderOneVal <= minGap) {
            sliderTwo.value = sliderOneVal + minGap;
            return;
        }

        max = sliderTwoVal;
    }
    function setMin() {
        const { sliderOne } = getElements();
        min = parseInt(document.getElementById(`minacc`).value);
        sliderOne.value = min;
    }

    function setMax() {
        const { sliderTwo } = getElements();
        max = parseInt(document.getElementById(`maxacc`).value);
        sliderTwo.value = max;
    }
</script>

<div class="wrapper">
    <div class="values">
        <input
            id="minacc"
            type="number"
            value={min}
            min="0"
            {max}
            oninput={setMin}
        />
        <span><b>{label}</b></span>
        <input
            id="maxacc"
            type="number"
            value={max}
            {min}
            max="100"
            oninput={setMax}
        />
    </div>
    <div class="container">
        <div
            class="slider-track"
            style:--min="{(min / maxValue) * 100}%"
            style:--max="{(max / maxValue) * 100}%"
        ></div>
        <input
            type="range"
            min="0"
            max="100"
            value="0"
            id="slider-1"
            oninput={slideOne}
        />
        <input
            type="range"
            min="0"
            max="100"
            value="100"
            id="slider-2"
            oninput={slideTwo}
        />
    </div>
</div>

<style>
    .wrapper {
        position: relative;
        border-radius: 10px;
    }
    .container {
        position: relative;
        width: 10rem;
    }
    .slider-track {
        width: 100%;
        height: 5px;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        border-radius: 5px;
        background: linear-gradient(
            to right,
            var(--background-3) var(--min),
            var(--hover) var(--min),
            var(--hover) var(--max),
            var(--background-3) var(--max)
        );
    }
    .values {
        display: flex;
        justify-content: space-between;
        color: var(--foreground);
        margin-bottom: 1rem;
    }

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

    input[type="range"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 100%;
        outline: none;
        position: absolute;
        margin: auto;
        top: 0;
        bottom: 0;
        background-color: transparent;
        pointer-events: none;

        --track-height: 5px;
        --thumb-size: 1em;
        --thumb-color: var(--hover);
        --thumb-cursor: pointer;
        --thumb-margin-top: -9px;
        --thumb-pointer-events: auto;
        --thumb-radius: 50%;

        &::-webkit-slider-runnable-track {
            height: var(--track-height);
            -webkit-appearance: none;
        }
        &::-moz-range-track {
            -moz-appearance: none;
        }
        &::-ms-track {
            height: var(--track-height);
            appearance: none;
        }
        &::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            background-color: var(--thumb-color);
            cursor: var(--pointer);
            margin-top: var(--thumb-margin-top);
            pointer-events: var(--thumb-pointer-events);
            border-radius: var(--thumb-radius);
        }
        &::-moz-range-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            cursor: var(--pointer);
            border-radius: var(--thumb-radius);
            background-color: var(--thumb-color);
            pointer-events: var(--thumb-pointer-events);
            border: none;
        }
        &::-ms-thumb {
            appearance: none;
            height: var(--thumb-size);
            width: var(--thumb-size);
            cursor: var(--pointer);
            border-radius: var(--thumb-radius);
            background-color: var(--thumb-color);
            pointer-events: var(--thumb-pointer-events);
        }
        &:active::-webkit-slider-thumb {
            background-color: #ffffff;
            border: 1px solid #3264fe;
        }
    }
</style>
