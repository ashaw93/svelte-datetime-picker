<script lang="ts">
  import { tick } from 'svelte';
  import {
    HOUR_24_VALUES,
    HOUR_12_VALUES,
    PERIOD_VALUES,
    getHour12,
    getPeriod,
    pad,
    type NullableDate,
    type Period,
    type TimeFormat
  } from './dateTimeRangePicker';

  export let value: Date;
  export let selectedValue: NullableDate = value;
  export let timeFormat: TimeFormat = '12h';
  export let minuteValues: number[] = [];
  export let heading = 'Hour';
  export let scrollVersion = 0;
  export let columnMaxHeight = 232;
  export let mobileColumnMaxHeight = 160;
  export let onSetHour24: (hour24: number) => void = () => {};
  export let onSetHour12: (hour12: number) => void = () => {};
  export let onSetMinute: (minute: number) => void = () => {};
  export let onSetPeriod: (period: Period) => void = () => {};
  export let isHour24Disabled: (hour24: number) => boolean = () => false;
  export let isHour12Disabled: (hour12: number) => boolean = () => false;
  export let isMinuteDisabled: (minute: number) => boolean = () => false;
  export let isPeriodDisabled: (period: Period) => boolean = () => false;

  let hourColumnElement: HTMLDivElement | null = null;
  let minuteColumnElement: HTMLDivElement | null = null;
  let periodColumnElement: HTMLDivElement | null = null;

  $: is24Hour = timeFormat === '24h';
  $: if (scrollVersion >= 0) {
    void scrollSelectedInputsIntoView();
  }

  async function scrollSelectedInputsIntoView(): Promise<void> {
    await tick();

    scrollSelectedChipIntoView(hourColumnElement);
    scrollSelectedChipIntoView(minuteColumnElement);

    if (!is24Hour) {
      scrollSelectedChipIntoView(periodColumnElement);
    }
  }

  function scrollSelectedChipIntoView(container: HTMLDivElement | null): void {
    const selectedChip = container?.querySelector<HTMLButtonElement>('.selected-chip');
    if (!container || !selectedChip) return;

    container.scrollTo({
      top: selectedChip.offsetTop - container.offsetTop,
      behavior: 'auto'
    });
  }
</script>

<div
  class="time-selector"
  style={`--time-column-max-height: ${columnMaxHeight}px; --time-column-mobile-max-height: ${mobileColumnMaxHeight}px;`}
>
  <div class="time-heading">{heading}</div>
  <div class:time-columns-24={is24Hour} class="time-columns">
    <div
      bind:this={hourColumnElement}
      class:hour-column-24={is24Hour}
      class="time-column hour-column"
    >
      {#if is24Hour}
        {#each HOUR_24_VALUES as hour24}
          <button
            type="button"
            class:selected-chip={selectedValue ? selectedValue.getHours() === hour24 : false}
            class="chip"
            disabled={isHour24Disabled(hour24)}
            on:click={() => onSetHour24(hour24)}
          >
            {pad(hour24)}
          </button>
        {/each}
      {:else}
        {#each HOUR_12_VALUES as hour12}
          <button
            type="button"
            class:selected-chip={selectedValue ? getHour12(selectedValue) === hour12 : false}
            class="chip"
            disabled={isHour12Disabled(hour12)}
            on:click={() => onSetHour12(hour12)}
          >
            {hour12}
          </button>
        {/each}
      {/if}
    </div>

    <div bind:this={minuteColumnElement} class="time-column">
      {#each minuteValues as minute}
        <button
          type="button"
          class:selected-chip={selectedValue ? selectedValue.getMinutes() === minute : false}
          class="chip"
          disabled={isMinuteDisabled(minute)}
          on:click={() => onSetMinute(minute)}
        >
          {pad(minute)}
        </button>
      {/each}
    </div>

    {#if !is24Hour}
      <div bind:this={periodColumnElement} class="time-column period-column">
        {#each PERIOD_VALUES as period}
          <button
            type="button"
            class:selected-chip={selectedValue ? getPeriod(selectedValue) === period : false}
            class="chip"
            disabled={isPeriodDisabled(period)}
            on:click={() => onSetPeriod(period)}
          >
            {period}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .time-selector {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0;
    min-height: 0;
  }

  .time-heading {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--picker-field-label, #6b7280);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .time-columns {
    display: grid;
    grid-template-columns: 46px 46px 46px;
    gap: 8px;
    align-items: start;
    justify-content: start;
    min-height: 0;
  }

  .time-columns-24 {
    grid-template-columns: 46px 46px;
  }

  .time-column {
    display: grid;
    gap: 6px;
    max-height: var(--time-column-max-height, 232px);
    overflow: auto;
    min-height: 0;
  }

  .hour-column {
    align-self: stretch;
    height: 100%;
    max-height: var(--time-column-max-height, 232px);
  }

  .period-column {
    align-content: start;
  }

  .chip {
    min-height: 36px;
    border: 1px solid var(--picker-chip-border, #d7dfec);
    border-radius: 11px;
    background: var(--picker-chip-bg, white);
    color: var(--picker-shell-text, #172033);
    cursor: pointer;
    font: inherit;
    font-weight: 600;
    font-size: 14px;
    width: 100%;
    transition: transform 0.12s ease, background 0.12s ease;
  }

  .chip:hover:not(:disabled) {
    transform: translateY(-1px);
    background: var(--picker-hover-bg, #f1f5f9);
  }

  .chip.selected-chip,
  .chip.selected-chip:hover:not(:disabled) {
    background: var(--picker-primary-bg, #1f6fff);
    border-color: var(--picker-primary-bg, #1f6fff);
    color: var(--picker-primary-text, white);
  }

  :disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 768px) {
    .time-column {
      max-height: var(--time-column-mobile-max-height, 160px);
    }

    .hour-column {
      max-height: var(--time-column-mobile-max-height, 160px);
    }

    .time-columns {
      grid-template-columns: 58px 58px 68px;
    }

    .time-columns-24 {
      grid-template-columns: 58px 58px;
    }
  }
</style>
