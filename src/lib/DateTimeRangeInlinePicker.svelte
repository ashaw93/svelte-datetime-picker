<script lang="ts">
  import { onMount } from 'svelte';
  import DateTimeRangeInlineSelector from './DateTimeRangeInlineSelector.svelte';
  import {
    formatFieldValue,
    getDefaultFieldPlaceholder,
    getPickerText,
    type NullableDate,
    type PickerLocale,
    type TimeFormat,
    type WeekStartDay
  } from './dateTimeRangePicker';

  export let startValue: NullableDate = null;
  export let endValue: NullableDate = null;
  export let startLabel = 'Start';
  export let endLabel = 'End';
  export let placeholder = 'Select date and time';
  export let locale: PickerLocale = undefined;
  export let weekStartsOn: WeekStartDay = 0;
  export let timeFormat: TimeFormat = '12h';
  export let minuteInterval = 1;
  export let minimumDuration = 1;
  export let minValue: NullableDate = null;
  export let maxValue: NullableDate = null;
  export let minStartValue: NullableDate = null;
  export let maxStartValue: NullableDate = null;
  export let minEndValue: NullableDate = null;
  export let maxEndValue: NullableDate = null;
  export let displayMode: 'popover' | 'inline' = 'popover';
  export let enableHeader = false;
  export let enableFooter = false;
  export let disableTimePicker = false;
  export let disableRange = false;
  export let showRangeHeader: boolean | undefined = undefined;
  export let showRangeFooter: boolean | undefined = undefined;
  export let showTime: boolean | undefined = undefined;
  export let allowRange: boolean | undefined = undefined;

  let isOpen = false;
  let isMobile = false;
  const defaultPlaceholder = 'Select date and time';
  const defaultStartLabel = 'Start';
  const defaultEndLabel = 'End';
  let headerEnabled = false;
  let footerEnabled = false;
  let timePickerEnabled = true;
  let rangeEnabled = true;

  $: text = getPickerText(locale);
  $: headerEnabled = showRangeHeader ?? enableHeader;
  $: footerEnabled = showRangeFooter ?? enableFooter;
  $: timePickerEnabled = showTime ?? !disableTimePicker;
  $: rangeEnabled = allowRange ?? !disableRange;
  $: resolvedStartLabel = startLabel === defaultStartLabel ? text.start : startLabel;
  $: resolvedEndLabel = endLabel === defaultEndLabel ? text.end : endLabel;
  $: resolvedPlaceholder =
    placeholder === defaultPlaceholder
      ? getDefaultFieldPlaceholder(timePickerEnabled, locale)
      : placeholder;
  $: pickerTitle = rangeEnabled
    ? timePickerEnabled
      ? text.pickTimeRange
      : text.pickDateRange
    : timePickerEnabled
      ? text.pickDateAndTime
      : text.pickDate;

  onMount(() => {
    const mediaQuery = window.matchMedia('(max-width: 980px)');
    const updateIsMobile = () => {
      isMobile = mediaQuery.matches;
    };

    updateIsMobile();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateIsMobile);
      return () => mediaQuery.removeEventListener('change', updateIsMobile);
    }

    mediaQuery.addListener(updateIsMobile);
    return () => mediaQuery.removeListener(updateIsMobile);
  });

  function openPicker(): void {
    isOpen = true;
  }

  function closePicker(): void {
    isOpen = false;
  }
</script>

<div class="range-picker">
  {#if displayMode === 'inline'}
    <div class="inline-host">
      <DateTimeRangeInlineSelector
        bind:startValue
        bind:endValue
        startLabel={resolvedStartLabel}
        endLabel={resolvedEndLabel}
        {locale}
        {weekStartsOn}
        {timeFormat}
        {minuteInterval}
        {minimumDuration}
        {minValue}
        {maxValue}
        {minStartValue}
        {maxStartValue}
        {minEndValue}
        {maxEndValue}
        enableHeader={headerEnabled}
        enableFooter={footerEnabled}
        disableTimePicker={!timePickerEnabled}
        disableRange={!rangeEnabled}
      />
    </div>
  {:else}
    <div class:single-field-layout={!rangeEnabled} class="fields">
      <button class="field" type="button" on:click={openPicker}>
        <span class="label">{resolvedStartLabel}</span>
        <span class:start-placeholder={!startValue}>
          {formatFieldValue(startValue, resolvedPlaceholder, timeFormat, timePickerEnabled, locale)}
        </span>
      </button>

      {#if rangeEnabled}
        <button class="field" type="button" on:click={openPicker}>
          <span class="label">{resolvedEndLabel}</span>
          <span class:start-placeholder={!endValue}>
            {formatFieldValue(endValue, resolvedPlaceholder, timeFormat, timePickerEnabled, locale)}
          </span>
        </button>
      {/if}
    </div>

    {#if isOpen}
      <button class="overlay" type="button" aria-label={text.closePicker} on:click={closePicker}></button>

      <div class:sheet={isMobile} class:popover={!isMobile} class="picker-shell" role="dialog" aria-modal="true">
        <div class="picker-header">
          <div>
            <h2>{pickerTitle}</h2>
          </div>
          <button class="ghost close" type="button" on:click={closePicker}>✕</button>
        </div>

        <div class="picker-content">
          <DateTimeRangeInlineSelector
            bind:startValue
            bind:endValue
            startLabel={resolvedStartLabel}
            endLabel={resolvedEndLabel}
            {locale}
            {weekStartsOn}
            {timeFormat}
            {minuteInterval}
            {minimumDuration}
            {minValue}
            {maxValue}
            {minStartValue}
            {maxStartValue}
            {minEndValue}
            {maxEndValue}
            enableHeader={headerEnabled}
            enableFooter={footerEnabled}
            disableTimePicker={!timePickerEnabled}
            disableRange={!rangeEnabled}
          />
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  button {
    font: inherit;
  }

  .range-picker {
    width: 100%;
  }

  .inline-host {
    width: 100%;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .fields.single-field-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .field {
    border: 1px solid var(--picker-field-border, #d8dce6);
    background: var(--picker-field-bg, #fff);
    color: var(--picker-field-text, #172033);
    border-radius: 14px;
    padding: 11px 13px;
    text-align: left;
    display: grid;
    gap: 4px;
    cursor: pointer;
  }

  .field:hover {
    border-color: var(--picker-field-hover-border, #b9c2d3);
  }

  .label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--picker-field-label, #6b7280);
  }

  .start-placeholder {
    color: var(--picker-field-placeholder, #8b93a6);
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: var(--picker-overlay-bg, rgba(15, 23, 42, 0.28));
    border: 0;
    padding: 0;
    margin: 0;
  }

  .picker-shell {
    position: fixed;
    background: var(--picker-shell-bg, white);
    color: var(--picker-shell-text, #172033);
    z-index: 10;
    box-shadow: var(--picker-shell-shadow, 0 24px 60px rgba(15, 23, 42, 0.22));
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--picker-shell-border, transparent);
  }

  .popover {
    width: max-content;
    max-width: calc(100vw - 40px);
    top: 44px;
    left: 50%;
    transform: translateX(-50%);
  }

  .sheet {
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 90vh;
    overflow: auto;
  }

  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--picker-divider, #eef1f6);
  }

  .picker-content {
    padding: 16px;
  }

  h2 {
    margin: 4px 0 0;
    line-height: 1.2;
    font-size: clamp(1rem, 1vw + 0.9rem, 1.3rem);
    color: var(--picker-shell-text, #172033);
  }

  .ghost {
    border: 0;
    border-radius: 11px;
    background: var(--picker-ghost-bg, #f8fafc);
    color: var(--picker-shell-text, #172033);
    cursor: pointer;
  }

  .close {
    width: 34px;
    height: 34px;
    padding: 0;
  }

  @media (max-width: 768px) {
    .fields {
      grid-template-columns: 1fr;
    }

    .picker-content {
      padding: 12px;
    }
  }
</style>
