<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonthGrid from './CalendarMonthGrid.svelte';
  import TimeSelectorColumns from './TimeSelectorColumns.svelte';
  import {
    HOUR_12_VALUES,
    formatFieldValue,
    getDefaultFieldPlaceholder,
    getEffectiveFieldBounds,
    getFirstSelectableValue,
    getHour12,
    getMinuteValues,
    getPeriod,
    getPickerText,
    hasSelectableValueOnDay,
    isTimeCandidateOutOfBounds,
    isSameDay,
    isSameTimestamp,
    normalizeDateOnlyRange,
    normalizeDateValue,
    normalizeRangeWithMinimumDuration,
    sanitizeMinimumDuration,
    sanitizeMinuteInterval,
    snapDateToMinuteInterval,
    to24Hour,
    updateDateOnlyRangeFieldValue,
    updateRangeFieldValue,
    type NullableDate,
    type PickerFieldBounds,
    type PickerLocale,
    type Period,
    type PickerField,
    type PickerValueBounds,
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
  export let applyOnOutsideClick = false;
  export let disableTimePicker = false;
  export let disableRange = false;
  export let showTime: boolean | undefined = undefined;
  export let allowRange: boolean | undefined = undefined;

  let activeField: PickerField | null = null;
  let draftValue: NullableDate = null;
  let visibleMonthDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let isMobile = false;
  let is24Hour = timeFormat === '24h';
  let normalizedMinuteInterval = sanitizeMinuteInterval(minuteInterval);
  let normalizedMinimumDuration = sanitizeMinimumDuration(minimumDuration);
  let minuteValues = getMinuteValues(normalizedMinuteInterval);
  let timeSelectorScrollVersion = 0;
  let bounds: PickerValueBounds = {};
  let startBounds: PickerFieldBounds = { min: null, max: null };
  let endBounds: PickerFieldBounds = { min: null, max: null };
  const defaultPlaceholder = 'Select date and time';
  const defaultStartLabel = 'Start';
  const defaultEndLabel = 'End';
  let timePickerEnabled = true;
  let rangeEnabled = true;

  $: is24Hour = timeFormat === '24h';
  $: text = getPickerText(locale);
  $: normalizedMinuteInterval = sanitizeMinuteInterval(minuteInterval);
  $: normalizedMinimumDuration = sanitizeMinimumDuration(minimumDuration);
  $: minuteValues = getMinuteValues(normalizedMinuteInterval);
  $: timePickerEnabled = showTime ?? !disableTimePicker;
  $: rangeEnabled = allowRange ?? !disableRange;
  $: bounds = {
    minValue,
    maxValue,
    minStartValue,
    maxStartValue,
    minEndValue,
    maxEndValue
  };
  $: resolvedStartLabel = startLabel === defaultStartLabel ? text.start : startLabel;
  $: resolvedEndLabel = endLabel === defaultEndLabel ? text.end : endLabel;
  $: resolvedPlaceholder =
    placeholder === defaultPlaceholder
      ? getDefaultFieldPlaceholder(timePickerEnabled, locale)
      : placeholder;

  $: {
    const normalizedStart = timePickerEnabled
      ? snapDateToMinuteInterval(startValue, normalizedMinuteInterval)
      : normalizeDateValue(startValue);
    if (!isSameTimestamp(normalizedStart, startValue)) {
      startValue = normalizedStart;
    }
  }

  $: {
    const normalizedRange = timePickerEnabled
      ? normalizeRangeWithMinimumDuration(
          startValue,
          snapDateToMinuteInterval(endValue, normalizedMinuteInterval),
          normalizedMinuteInterval,
          normalizedMinimumDuration,
          false,
          bounds,
          rangeEnabled
        )
      : normalizeDateOnlyRange(startValue, endValue, false, bounds, rangeEnabled);
    if (!isSameTimestamp(normalizedRange.start, startValue)) {
      startValue = normalizedRange.start;
    }
    if (!isSameTimestamp(normalizedRange.end, endValue)) {
      endValue = normalizedRange.end;
    }
  }

  $: if (!rangeEnabled && endValue !== null) {
    endValue = null;
  }

  $: {
    const normalizedDraft = timePickerEnabled
      ? snapDateToMinuteInterval(draftValue, normalizedMinuteInterval)
      : normalizeDateValue(draftValue);
    if (!isSameTimestamp(normalizedDraft, draftValue)) {
      draftValue = normalizedDraft;
    }
  }

  $: startBounds = getEffectiveFieldBounds(
    'start',
    startValue,
    normalizedMinuteInterval,
    normalizedMinimumDuration,
    timePickerEnabled,
    rangeEnabled,
    bounds
  );
  $: endBounds = getEffectiveFieldBounds(
    'end',
    startValue,
    normalizedMinuteInterval,
    normalizedMinimumDuration,
    timePickerEnabled,
    rangeEnabled,
    bounds
  );

  onMount(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
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

  function openPicker(field: PickerField): void {
    activeField = field;
    const nextDraft = getFirstSelectableValue(
      field,
      startValue,
      endValue,
      normalizedMinuteInterval,
      normalizedMinimumDuration,
      timePickerEnabled,
      rangeEnabled,
      bounds
    );
    if (!nextDraft) return;

    draftValue = nextDraft;
    visibleMonthDate = new Date(nextDraft.getFullYear(), nextDraft.getMonth(), 1);
    timeSelectorScrollVersion += 1;
  }

  function closePicker(): void {
    activeField = null;
    draftValue = null;
  }

  function handleOverlayClick(): void {
    if (applyOnOutsideClick) {
      applyDraft();
      return;
    }

    closePicker();
  }

  function applyDraft(): void {
    if (!activeField || !draftValue) return;

    const normalizedRange = timePickerEnabled
      ? updateRangeFieldValue(
          activeField,
          new Date(draftValue),
          startValue,
          endValue,
          normalizedMinuteInterval,
          normalizedMinimumDuration,
          bounds,
          rangeEnabled
        )
      : updateDateOnlyRangeFieldValue(activeField, draftValue, startValue, endValue, bounds, rangeEnabled);
    startValue = normalizedRange.start;
    endValue = normalizedRange.end;

    closePicker();
  }

  function clearField(field: PickerField): void {
    if (field === 'start') {
      startValue = null;
      endValue = null;
    } else {
      endValue = null;
    }

    if (activeField === field) closePicker();
  }

  function setDraftDate(day: Date): void {
    if (!draftValue) {
      draftValue = getFirstSelectableValue(
        activeField ?? 'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      );
      if (!draftValue) return;
      visibleMonthDate = new Date(day.getFullYear(), day.getMonth(), 1);
    }

    if (!draftValue) return;
    const next = new Date(draftValue);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    draftValue = next;
    visibleMonthDate = new Date(day.getFullYear(), day.getMonth(), 1);
  }

  function setDraftHour12(hour12: number): void {
    if (!draftValue) {
      draftValue = getFirstSelectableValue(
        activeField ?? 'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      );
    }
    if (!draftValue) return;
    const next = new Date(draftValue);
    const period = getPeriod(next);
    next.setHours(to24Hour(hour12, period));
    draftValue = next;
  }

  function setDraftMinute(minute: number): void {
    if (!draftValue) {
      draftValue = getFirstSelectableValue(
        activeField ?? 'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      );
    }
    if (!draftValue) return;
    const next = new Date(draftValue);
    next.setMinutes(minute);
    draftValue = next;
  }

  function setDraftPeriod(period: Period): void {
    if (!draftValue) {
      draftValue = getFirstSelectableValue(
        activeField ?? 'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      );
    }
    if (!draftValue) return;
    const next = new Date(draftValue);
    next.setHours(to24Hour(getHour12(next), period));
    draftValue = next;
  }

  function shiftVisibleMonth(delta: number): void {
    const next = new Date(visibleMonthDate);
    next.setMonth(next.getMonth() + delta, 1);
    visibleMonthDate = next;
  }

  function isDayDisabled(day: Date): boolean {
    const field = activeField ?? 'start';
    const fieldBounds = field === 'start' ? startBounds : endBounds;
    return !hasSelectableValueOnDay(day, fieldBounds, normalizedMinuteInterval, timePickerEnabled);
  }

  function isCandidateTimeDisabled(hour24: number, minute: number): boolean {
    if (!draftValue) return false;
    const field = activeField ?? 'start';
    const fieldBounds = field === 'start' ? startBounds : endBounds;
    return isTimeCandidateOutOfBounds(draftValue, fieldBounds, hour24, minute);
  }

  function hasEnabledMinuteForHour(hour24: number): boolean {
    return minuteValues.some((minute) => !isCandidateTimeDisabled(hour24, minute));
  }

  function setDraftHour24(hour24: number): void {
    if (!draftValue) {
      draftValue = getFirstSelectableValue(
        activeField ?? 'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      );
    }
    if (!draftValue) return;
    const next = new Date(draftValue);
    next.setHours(hour24);
    draftValue = next;
  }

  function isHour12Disabled(hour12: number): boolean {
    if (!draftValue) return false;
    const period = getPeriod(draftValue);
    return !hasEnabledMinuteForHour(to24Hour(hour12, period));
  }

  function isHour24Disabled(hour24: number): boolean {
    if (!draftValue) return false;
    return !hasEnabledMinuteForHour(hour24);
  }

  function isMinuteDisabled(minute: number): boolean {
    if (!draftValue) return false;
    return isCandidateTimeDisabled(draftValue.getHours(), minute);
  }

  function isPeriodDisabled(period: Period): boolean {
    if (!draftValue) return false;
    return HOUR_12_VALUES.every((hour12) => !minuteValues.some((minute) => !isCandidateTimeDisabled(to24Hour(hour12, period), minute)));
  }

  function isDraftSelectedDay(day: Date): boolean {
    return isSameDay(day, draftValue);
  }
</script>

<div class="range-picker">
  <div class:single-field-layout={!rangeEnabled} class="fields">
    <button class="field" type="button" on:click={() => openPicker('start')}>
      <span class="label">{rangeEnabled ? resolvedStartLabel : text.value}</span>
      <span class:start-placeholder={!startValue}>
        {formatFieldValue(startValue, resolvedPlaceholder, timeFormat, timePickerEnabled, locale)}
      </span>
    </button>

    {#if rangeEnabled}
      <button class="field" type="button" on:click={() => openPicker('end')}>
        <span class="label">{resolvedEndLabel}</span>
        <span class:start-placeholder={!endValue}>
          {formatFieldValue(endValue, resolvedPlaceholder, timeFormat, timePickerEnabled, locale)}
        </span>
      </button>
    {/if}
  </div>

  {#if activeField && draftValue}
    <button class="overlay" type="button" aria-label={text.closePicker} on:click={handleOverlayClick}></button>

    <div
      class:date-only-layout={!timePickerEnabled}
      class:compact-time-layout={is24Hour}
      class:twelve-hour-layout={!is24Hour}
      class:sheet={isMobile}
      class:popover={!isMobile}
      class="picker-shell"
      role="dialog"
      aria-modal="true"
    >
      <div class="picker-header">
        <div>
          <div class="eyebrow">
            {rangeEnabled
              ? activeField === 'start'
                ? resolvedStartLabel
                : resolvedEndLabel
              : text.selection}
          </div>
          <h2>{formatFieldValue(draftValue, resolvedPlaceholder, timeFormat, timePickerEnabled, locale)}</h2>
        </div>
        <button class="ghost close" type="button" on:click={closePicker}>✕</button>
      </div>

      <div
        class:date-only-layout={!timePickerEnabled}
        class:compact-time-layout={is24Hour}
        class:twelve-hour-layout={!is24Hour}
        class="picker-content"
      >
        <section class="calendar-panel">
          <CalendarMonthGrid
            {visibleMonthDate}
            {locale}
            {weekStartsOn}
            dayHeight={36}
            shiftMonth={shiftVisibleMonth}
            onDayClick={setDraftDate}
            isDayDisabled={isDayDisabled}
            isSelectedDay={isDraftSelectedDay}
          />
        </section>

        {#if timePickerEnabled}
          <section class="time-panel">
            <TimeSelectorColumns
              value={draftValue}
              selectedValue={draftValue}
              {locale}
              {timeFormat}
              {minuteValues}
              scrollVersion={timeSelectorScrollVersion}
              heading={text.hour}
              onSetHour24={setDraftHour24}
              onSetHour12={setDraftHour12}
              onSetMinute={setDraftMinute}
              onSetPeriod={setDraftPeriod}
              {isHour24Disabled}
              {isHour12Disabled}
              {isMinuteDisabled}
              {isPeriodDisabled}
            />
          </section>
        {/if}
      </div>

      <div class:picker-footer-compact={applyOnOutsideClick} class="picker-footer">
        <button class="ghost" type="button" on:click={() => clearField(rangeEnabled ? activeField! : 'start')}>
          {text.clear}
        </button>
        {#if !applyOnOutsideClick}
          <div class="footer-actions">
            <button class="ghost" type="button" on:click={closePicker}>{text.cancel}</button>
            <button class="primary" type="button" on:click={applyDraft}>{text.apply}</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  button {
    font: inherit;
  }

  .range-picker {
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

  .label,
  .eyebrow {
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
    width: min(760px, calc(100vw - 40px));
    top: 44px;
    left: 50%;
    transform: translateX(-50%);
  }

  .popover.compact-time-layout {
    width: min(700px, calc(100vw - 40px));
  }

  .popover.twelve-hour-layout {
    width: min(740px, calc(100vw - 40px));
  }

  .popover.date-only-layout {
    width: min(420px, calc(100vw - 40px));
  }

  .sheet {
    left: 0;
    right: 0;
    bottom: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 90vh;
  }

  .picker-header,
  .picker-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--picker-divider, #eef1f6);
  }

  .picker-footer {
    border-bottom: 0;
    border-top: 1px solid var(--picker-divider, #eef1f6);
  }

  .picker-footer-compact {
    justify-content: flex-start;
  }

  .picker-content {
    display: grid;
    grid-template-columns: minmax(292px, 1fr) 216px;
    gap: 0;
    align-items: start;
  }

  .picker-content.compact-time-layout {
    grid-template-columns: minmax(292px, 1fr) 133px;
  }

  .picker-content.twelve-hour-layout {
    grid-template-columns: minmax(292px, 1fr) 228px;
  }

  .picker-content.date-only-layout {
    grid-template-columns: minmax(292px, 1fr);
  }

  .calendar-panel,
  .time-panel {
    padding: 16px;
  }

  .time-panel {
    border-left: 1px solid var(--picker-divider, #eef1f6);
    display: grid;
    gap: 16px;
    align-self: start;
  }

  .ghost,
  .primary {
    border: 0;
    border-radius: 11px;
    background: transparent;
    cursor: pointer;
    transition: transform 0.12s ease, background 0.12s ease;
  }

  .ghost:hover,
  .primary:hover {
    transform: translateY(-1px);
  }

  .ghost:hover {
    background: var(--picker-hover-bg, #f1f5f9);
  }

  h2 {
    margin: 4px 0 0;
    line-height: 1.2;
    font-size: clamp(1.1rem, 1vw + 0.95rem, 1.4rem);
    color: var(--picker-shell-text, #172033);
  }

  .primary {
    background: var(--picker-primary-bg, #1f6fff);
    color: var(--picker-primary-text, white);
  }

  .primary:hover {
    background: var(--picker-primary-hover, #195de0);
  }

  .ghost,
  .primary {
    padding: 9px 12px;
  }

  .ghost {
    background: var(--picker-ghost-bg, #f8fafc);
    color: var(--picker-shell-text, #172033);
  }

  .footer-actions {
    display: flex;
    gap: 8px;
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
      grid-template-columns: 1fr;
    }

    .time-panel {
      border-left: 0;
      border-top: 1px solid var(--picker-divider, #eef1f6);
    }
  }
</style>
