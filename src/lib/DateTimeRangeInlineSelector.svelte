<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonthGrid from './CalendarMonthGrid.svelte';
  import TimeSelectorColumns from './TimeSelectorColumns.svelte';
  import {
    HOUR_12_VALUES,
    formatSummary,
    formatTimeValue,
    getEffectiveFieldBounds,
    getDefaultTimePlaceholder,
    getDateOnlyRangePreview,
    getFirstSelectableValue,
    getHour12,
    getMinuteValues,
    getPeriod,
    getPickerText,
    getRangePreview,
    getRangeFieldBaseValue,
    getRangeTimeLayout,
    hasSelectableValueOnDay,
    isDateWithinRangeExclusive,
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
  export let enableHeader = false;
  export let enableFooter = false;
  export let disableTimePicker = false;
  export let disableRange = false;
  export let showRangeHeader: boolean | undefined = undefined;
  export let showRangeFooter: boolean | undefined = undefined;
  export let showTime: boolean | undefined = undefined;
  export let allowRange: boolean | undefined = undefined;

  let visibleMonthDate: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let dateSelectionTarget: PickerField = 'start';
  let normalizedMinuteInterval = sanitizeMinuteInterval(minuteInterval);
  let normalizedMinimumDuration = sanitizeMinimumDuration(minimumDuration);
  let minuteValues = getMinuteValues(normalizedMinuteInterval);
  let startScrollVersion = 0;
  let endScrollVersion = 0;
  let timeControlSignature = `${timeFormat}-${normalizedMinuteInterval}`;
  let hoveredPreviewDay: Date | null = null;
  let previewRange: { start: NullableDate; end: NullableDate } | null = null;
  let startDisplayValue = getRangeFieldBaseValue('start', startValue, endValue);
  let endDisplayValue = getRangeFieldBaseValue('end', startValue, endValue);
  let endConstraintKey = 'none';
  let timeColumnMaxHeight = 234;
  let timeColumnMobileMaxHeight = 160;
  let timeSideWidth = 133;
  let bounds: PickerValueBounds = {};
  let startBounds: PickerFieldBounds = { min: null, max: null };
  let endBounds: PickerFieldBounds = { min: null, max: null };
  const defaultStartLabel = 'Start';
  const defaultEndLabel = 'End';
  let headerEnabled = false;
  let footerEnabled = false;
  let timePickerEnabled = true;
  let rangeEnabled = true;

  $: text = getPickerText(locale);
  $: normalizedMinuteInterval = sanitizeMinuteInterval(minuteInterval);
  $: normalizedMinimumDuration = sanitizeMinimumDuration(minimumDuration);
  $: minuteValues = getMinuteValues(normalizedMinuteInterval);
  $: headerEnabled = showRangeHeader ?? enableHeader;
  $: footerEnabled = showRangeFooter ?? enableFooter;
  $: timePickerEnabled = showTime ?? !disableTimePicker;
  $: rangeEnabled = allowRange ?? !disableRange;
  $: resolvedStartLabel = startLabel === defaultStartLabel ? text.start : startLabel;
  $: resolvedEndLabel = endLabel === defaultEndLabel ? text.end : endLabel;
  $: timePlaceholder = getDefaultTimePlaceholder(locale);
  $: bounds = {
    minValue,
    maxValue,
    minStartValue,
    maxStartValue,
    minEndValue,
    maxEndValue
  };

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
          true,
          bounds,
          rangeEnabled
        )
      : normalizeDateOnlyRange(startValue, endValue, true, bounds, rangeEnabled);
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
    const nextSignature = `${timeFormat}-${normalizedMinuteInterval}`;
    if (nextSignature !== timeControlSignature) {
      timeControlSignature = nextSignature;
      startScrollVersion += 1;
      endScrollVersion += 1;
    }
  }

  $: previewRange = rangeEnabled
    ? getRangePreview(
        dateSelectionTarget,
        startValue,
        endValue,
        hoveredPreviewDay,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        bounds
      )
    : null;
  $: if (rangeEnabled && !timePickerEnabled) {
    previewRange = getDateOnlyRangePreview(
      dateSelectionTarget,
      startValue,
      endValue,
      hoveredPreviewDay,
      bounds
    );
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
  $: startDisplayValue = (getFirstSelectableValue(
    'start',
    startValue,
    endValue,
    normalizedMinuteInterval,
    normalizedMinimumDuration,
    timePickerEnabled,
    rangeEnabled,
    bounds
  ) ?? getRangeFieldBaseValue('start', startValue, endValue, timePickerEnabled)) as Date;
  $: endDisplayValue = (getFirstSelectableValue(
    'end',
    startValue,
    endValue,
    normalizedMinuteInterval,
    normalizedMinimumDuration,
    timePickerEnabled,
    rangeEnabled,
    bounds
  ) ?? getRangeFieldBaseValue('end', startValue, endValue, timePickerEnabled)) as Date;
  $: endConstraintKey = `${endBounds.min ? endBounds.min.getTime() : 'none'}-${endBounds.max ? endBounds.max.getTime() : 'none'}`;
  $: ({ columnMaxHeight: timeColumnMaxHeight, mobileColumnMaxHeight: timeColumnMobileMaxHeight, sideWidth: timeSideWidth } =
    getRangeTimeLayout(headerEnabled, timeFormat));

  onMount(() => {
    const source = startValue ?? endValue ?? new Date();
    visibleMonthDate = new Date(source.getFullYear(), source.getMonth(), 1);
    startScrollVersion += 1;
    endScrollVersion += 1;
  });

  function shiftVisibleMonth(delta: number): void {
    const next = new Date(visibleMonthDate);
    next.setMonth(next.getMonth() + delta, 1);
    visibleMonthDate = next;
  }

  function isRangeStart(day: Date): boolean {
    return rangeEnabled && isSameDay(day, startValue);
  }

  function isRangeEnd(day: Date): boolean {
    return rangeEnabled && isSameDay(day, endValue);
  }

  function isWithinRange(day: Date): boolean {
    return rangeEnabled && isDateWithinRangeExclusive(day, startValue, endValue);
  }

  function isPreviewRangeStart(day: Date): boolean {
    return rangeEnabled && !!previewRange?.start && isSameDay(day, previewRange.start);
  }

  function isPreviewRangeEnd(day: Date): boolean {
    return rangeEnabled && !!previewRange?.end && isSameDay(day, previewRange.end);
  }

  function isWithinPreviewRange(day: Date): boolean {
    return rangeEnabled && isDateWithinRangeExclusive(day, previewRange?.start ?? null, previewRange?.end ?? null);
  }

  function handleDayHover(day: Date): void {
    hoveredPreviewDay =
      rangeEnabled && dateSelectionTarget === 'end' && startValue && !endValue ? new Date(day) : null;
  }

  function clearDayHover(): void {
    hoveredPreviewDay = null;
  }

  function selectRangeDay(day: Date): void {
    if (!rangeEnabled) {
      setFieldDate('start', day);
      dateSelectionTarget = 'start';
      return;
    }

    if (startValue && endValue && dateSelectionTarget === 'start') {
      startNewRange(day);
      return;
    }

    if (dateSelectionTarget === 'start' || !startValue) {
      setFieldDate('start', day);
      dateSelectionTarget = 'end';
      return;
    }

    setFieldDate('end', day);
    dateSelectionTarget = 'start';
  }

  function startNewRange(day: Date): void {
    const base =
      getFirstSelectableValue(
        'start',
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      ) ?? getRangeFieldBaseValue('start', startValue, endValue, timePickerEnabled);
    base.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    const nextValue = timePickerEnabled ? snapDateToMinuteInterval(base, normalizedMinuteInterval) : normalizeDateValue(base);
    if (!nextValue) return;

    startValue = nextValue;
    endValue = null;
    visibleMonthDate = new Date(day.getFullYear(), day.getMonth(), 1);
    dateSelectionTarget = 'end';
    hoveredPreviewDay = null;
  }

  function setFieldDate(field: PickerField, day: Date): void {
    const base =
      getFirstSelectableValue(
        field,
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      ) ?? getRangeFieldBaseValue(field, startValue, endValue, timePickerEnabled);
    base.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    const nextValue = timePickerEnabled ? snapDateToMinuteInterval(base, normalizedMinuteInterval) : normalizeDateValue(base);
    if (!nextValue) return;

    const normalizedRange = timePickerEnabled
      ? updateRangeFieldValue(
          field,
          nextValue,
          startValue,
          endValue,
          normalizedMinuteInterval,
          normalizedMinimumDuration,
          bounds,
          rangeEnabled
        )
      : updateDateOnlyRangeFieldValue(field, nextValue, startValue, endValue, bounds, rangeEnabled);
    startValue = normalizedRange.start;
    endValue = normalizedRange.end;

    visibleMonthDate = new Date(day.getFullYear(), day.getMonth(), 1);
    hoveredPreviewDay = null;
  }

  function clearRange(): void {
    startValue = null;
    endValue = null;
    dateSelectionTarget = 'start';
    hoveredPreviewDay = null;
  }

  function updateField(field: PickerField, updater: (next: Date) => void): void {
    const next =
      getFirstSelectableValue(
        field,
        startValue,
        endValue,
        normalizedMinuteInterval,
        normalizedMinimumDuration,
        timePickerEnabled,
        rangeEnabled,
        bounds
      ) ?? getRangeFieldBaseValue(field, startValue, endValue, timePickerEnabled);
    updater(next);
    next.setSeconds(0, 0);

    const snapped = snapDateToMinuteInterval(next, normalizedMinuteInterval);
    if (!snapped) return;

    const normalizedRange = updateRangeFieldValue(
      field,
      snapped,
      startValue,
      endValue,
      normalizedMinuteInterval,
      normalizedMinimumDuration,
      bounds,
      rangeEnabled
    );
    startValue = normalizedRange.start;
    endValue = normalizedRange.end;

    if (field === 'start') {
      startScrollVersion += 1;
      return;
    }
    endScrollVersion += 1;
  }

  function setStartHour24(hour24: number): void {
    updateField('start', (next) => {
      next.setHours(hour24);
    });
  }

  function setStartHour12(hour12: number): void {
    updateField('start', (next) => {
      next.setHours(to24Hour(hour12, getPeriod(next)));
    });
  }

  function setStartMinute(minute: number): void {
    updateField('start', (next) => {
      next.setMinutes(minute);
    });
  }

  function setStartPeriod(period: Period): void {
    updateField('start', (next) => {
      next.setHours(to24Hour(getHour12(next), period));
    });
  }

  function setEndHour24(hour24: number): void {
    updateField('end', (next) => {
      next.setHours(hour24);
    });
  }

  function setEndHour12(hour12: number): void {
    updateField('end', (next) => {
      next.setHours(to24Hour(hour12, getPeriod(next)));
    });
  }

  function setEndMinute(minute: number): void {
    updateField('end', (next) => {
      next.setMinutes(minute);
    });
  }

  function setEndPeriod(period: Period): void {
    updateField('end', (next) => {
      next.setHours(to24Hour(getHour12(next), period));
    });
  }

  function isStartHour24Disabled(_hour24: number): boolean {
    return !minuteValues.some(
      (minute) => !isTimeCandidateOutOfBounds(startDisplayValue, startBounds, _hour24, minute)
    );
  }

  function isStartHour12Disabled(_hour12: number): boolean {
    return !minuteValues.some(
      (minute) =>
        !isTimeCandidateOutOfBounds(
          startDisplayValue,
          startBounds,
          to24Hour(_hour12, getPeriod(startDisplayValue)),
          minute
        )
    );
  }

  function isStartMinuteDisabled(minute: number): boolean {
    return isTimeCandidateOutOfBounds(startDisplayValue, startBounds, startDisplayValue.getHours(), minute);
  }

  function isStartPeriodDisabled(period: Period): boolean {
    return HOUR_12_VALUES.every((hour12) =>
      minuteValues.every((minute) =>
        isTimeCandidateOutOfBounds(startDisplayValue, startBounds, to24Hour(hour12, period), minute)
      )
    );
  }

  function isEndCandidateDisabled(hour24: number, minute: number): boolean {
    if (!rangeEnabled) return false;

    return isTimeCandidateOutOfBounds(endDisplayValue, endBounds, hour24, minute);
  }

  function hasEnabledEndMinuteForHour(hour24: number): boolean {
    return minuteValues.some((minute) => !isEndCandidateDisabled(hour24, minute));
  }

  function isEndHour24Disabled(hour24: number): boolean {
    if (!rangeEnabled) return false;
    return !hasEnabledEndMinuteForHour(hour24);
  }

  function isEndHour12Disabled(hour12: number): boolean {
    if (!rangeEnabled) return false;
    return !hasEnabledEndMinuteForHour(to24Hour(hour12, getPeriod(endDisplayValue)));
  }

  function isEndMinuteDisabled(minute: number): boolean {
    if (!rangeEnabled) return false;
    const hour24 = endDisplayValue.getHours();
    return isEndCandidateDisabled(hour24, minute);
  }

  function isEndPeriodDisabled(period: Period): boolean {
    if (!rangeEnabled) return false;
    return HOUR_12_VALUES.every((hour12) => !minuteValues.some((minute) => !isEndCandidateDisabled(to24Hour(hour12, period), minute)));
  }

  function isSelectedRangeDay(day: Date): boolean {
    return rangeEnabled ? isRangeStart(day) || isRangeEnd(day) : isSameDay(day, startValue);
  }

  function isPreviewOnlyRangeStart(day: Date): boolean {
    return isPreviewRangeStart(day) && !isRangeStart(day) && !isRangeEnd(day);
  }

  function isPreviewOnlyRangeEnd(day: Date): boolean {
    return isPreviewRangeEnd(day) && !isRangeStart(day) && !isRangeEnd(day);
  }

  function isPreviewOnlyRangeMiddle(day: Date): boolean {
    return isWithinPreviewRange(day) && !isWithinRange(day);
  }

  function isCalendarDayDisabled(day: Date): boolean {
    const field = rangeEnabled ? dateSelectionTarget : 'start';
    const fieldBounds = field === 'start' ? startBounds : endBounds;
    return !hasSelectableValueOnDay(day, fieldBounds, normalizedMinuteInterval, timePickerEnabled);
  }
</script>

<div class="inline-range-picker">
  {#if headerEnabled}
    <div class="range-header">
      <div>
        <div class="eyebrow">{rangeEnabled ? text.range : text.selection}</div>
        <div class="range-summary">{formatSummary(startValue, endValue, timeFormat, timePickerEnabled, rangeEnabled, locale)}</div>
      </div>
      <div class="range-header-actions">
        {#if rangeEnabled}
          <div class="selection-pill">{text.nextDateClick(dateSelectionTarget === 'start' ? resolvedStartLabel : resolvedEndLabel)}</div>
        {/if}
        <button class="ghost clear-action" type="button" on:click={clearRange}>
          {rangeEnabled ? text.clearRange : text.clearSelection}
        </button>
      </div>
    </div>
  {/if}

  <div
    class:single-picker-layout={!rangeEnabled && timePickerEnabled}
    class:date-only-layout={!timePickerEnabled}
    class="range-board"
    style={timePickerEnabled ? `--range-time-side-width: ${timeSideWidth}px;` : undefined}
  >
    {#if timePickerEnabled}
      <section class="time-side">
        <div class="side-header">
          <div class="eyebrow">{rangeEnabled ? resolvedStartLabel : text.time}</div>
          <div class="side-value">{formatTimeValue(startValue, timePlaceholder, timeFormat, locale)}</div>
        </div>
        {#key `${startDisplayValue.getTime()}-${timeFormat}-${normalizedMinuteInterval}`}
          <TimeSelectorColumns
            value={startDisplayValue}
            selectedValue={startValue}
            {locale}
            {timeFormat}
            {minuteValues}
            columnMaxHeight={timeColumnMaxHeight}
            mobileColumnMaxHeight={timeColumnMobileMaxHeight}
            scrollVersion={startScrollVersion}
            heading={rangeEnabled ? text.startTime : text.time}
            onSetHour24={setStartHour24}
            onSetHour12={setStartHour12}
            onSetMinute={setStartMinute}
            onSetPeriod={setStartPeriod}
            isHour24Disabled={isStartHour24Disabled}
            isHour12Disabled={isStartHour12Disabled}
            isMinuteDisabled={isStartMinuteDisabled}
            isPeriodDisabled={isStartPeriodDisabled}
          />
        {/key}
      </section>
    {/if}

    <section class="calendar-panel">
      <CalendarMonthGrid
        {visibleMonthDate}
        {locale}
        {weekStartsOn}
        shiftMonth={shiftVisibleMonth}
        onDayClick={selectRangeDay}
        onDayMouseEnter={handleDayHover}
        onDayFocus={handleDayHover}
        onDayMouseLeave={clearDayHover}
        onDayBlur={clearDayHover}
        isDayDisabled={isCalendarDayDisabled}
        isSelectedDay={isSelectedRangeDay}
        isRangeMiddle={isWithinRange}
        {isRangeStart}
        {isRangeEnd}
        isPreviewRangeStart={isPreviewOnlyRangeStart}
        isPreviewRangeEnd={isPreviewOnlyRangeEnd}
        isPreviewRangeMiddle={isPreviewOnlyRangeMiddle}
      />

      {#if !headerEnabled}
        <div class="calendar-bottom-action">
          <button class="inline-clear subtle-button" type="button" on:click={clearRange}>
            {rangeEnabled ? text.clearRange : text.clearSelection}
          </button>
        </div>
      {/if}
    </section>

    {#if timePickerEnabled && rangeEnabled}
      <section class="time-side">
        <div class="side-header">
          <div class="eyebrow">{resolvedEndLabel}</div>
          <div class="side-value">{formatTimeValue(endValue, timePlaceholder, timeFormat, locale)}</div>
        </div>
        {#key `${endDisplayValue.getTime()}-${endConstraintKey}-${timeFormat}-${normalizedMinuteInterval}`}
          <TimeSelectorColumns
            value={endDisplayValue}
            selectedValue={endValue}
            {locale}
            {timeFormat}
            {minuteValues}
            columnMaxHeight={timeColumnMaxHeight}
            mobileColumnMaxHeight={timeColumnMobileMaxHeight}
            scrollVersion={endScrollVersion}
            heading={text.endTime}
            onSetHour24={setEndHour24}
            onSetHour12={setEndHour12}
            onSetMinute={setEndMinute}
            onSetPeriod={setEndPeriod}
            isHour24Disabled={isEndHour24Disabled}
            isHour12Disabled={isEndHour12Disabled}
            isMinuteDisabled={isEndMinuteDisabled}
            isPeriodDisabled={isEndPeriodDisabled}
          />
        {/key}
      </section>
    {/if}
  </div>

  {#if footerEnabled}
    <div class="range-footer">
      <div class="footer-note">
        {rangeEnabled
          ? timePickerEnabled
            ? text.footerRangeWithTime
            : text.footerRangeDateOnly
          : timePickerEnabled
            ? text.footerSingleWithTime
            : text.footerSingleDateOnly}
      </div>
    </div>
  {/if}
</div>

<style>
  button {
    font: inherit;
  }

  .inline-range-picker {
    color: var(--picker-shell-text, #172033);
    display: grid;
    gap: 16px;
    width: fit-content;
    max-width: 100%;
  }

  .range-header,
  .range-footer {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 12px;
  }

  .range-header-actions {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 8px;
    flex-wrap: wrap;
  }

  .eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--picker-field-label, #6b7280);
  }

  .range-summary,
  .side-value {
    margin-top: 4px;
    font-weight: 600;
    color: var(--picker-shell-text, #172033);
  }

  .selection-pill {
    padding: 8px 10px;
    border-radius: 999px;
    background: var(--picker-ghost-bg, #f8fafc);
    color: var(--picker-field-label, #6b7280);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .range-board {
    display: grid;
    grid-template-columns: var(--range-time-side-width, 133px) 308px var(--range-time-side-width, 133px);
    gap: 0;
    width: fit-content;
    max-width: 100%;
    border: 1px solid var(--picker-shell-border, transparent);
    border-radius: 20px;
    overflow: hidden;
    background: var(--picker-shell-bg, white);
    box-shadow: var(--picker-shell-shadow, 0 24px 60px rgba(15, 23, 42, 0.22));
  }

  .range-board.date-only-layout {
    grid-template-columns: 308px;
  }

  .range-board.single-picker-layout {
    grid-template-columns: var(--range-time-side-width, 133px) 308px;
  }

  .time-side,
  .calendar-panel {
    padding: 16px;
  }

  .time-side {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 14px;
    background: color-mix(in srgb, var(--picker-shell-bg, white) 90%, black 10%);
    min-height: 0;
  }

  .time-side:first-child {
    border-right: 1px solid var(--picker-divider, #eef1f6);
  }

  .time-side:last-child {
    border-left: 1px solid var(--picker-divider, #eef1f6);
  }

  .side-header {
    display: grid;
    gap: 2px;
  }

  .calendar-bottom-action {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .inline-clear {
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: var(--picker-muted-text, #70798b);
    padding: 6px 10px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .inline-clear:hover {
    color: var(--picker-shell-text, #172033);
  }

  .subtle-button {
    background: color-mix(in srgb, var(--picker-ghost-bg, #f8fafc) 72%, transparent);
    border-color: color-mix(in srgb, var(--picker-divider, #eef1f6) 70%, transparent);
  }

  .subtle-button:hover {
    background: color-mix(in srgb, var(--picker-hover-bg, #f1f5f9) 72%, transparent);
  }

  .ghost {
    border: 0;
    border-radius: 11px;
    background: var(--picker-ghost-bg, #f8fafc);
    color: var(--picker-shell-text, #172033);
    cursor: pointer;
    padding: 9px 12px;
    transition: transform 0.12s ease, background 0.12s ease;
  }

  .ghost:hover {
    transform: translateY(-1px);
    background: var(--picker-hover-bg, #f1f5f9);
  }

  .clear-action {
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
  }

  .footer-note {
    color: var(--picker-muted-text, #70798b);
    font-size: 13px;
    line-height: 1.5;
    text-align: right;
  }

  @media (max-width: 980px) {
    .range-board {
      grid-template-columns: 1fr;
    }

    .time-side:first-child,
    .time-side:last-child {
      border-left: 0;
      border-right: 0;
    }

    .time-side:first-child {
      border-bottom: 1px solid var(--picker-divider, #eef1f6);
    }

    .calendar-panel {
      border-bottom: 1px solid var(--picker-divider, #eef1f6);
    }
  }

  @media (max-width: 768px) {
    .range-header,
    .range-footer {
      flex-direction: column;
    }

    .selection-pill {
      white-space: normal;
    }

    .range-header-actions {
      width: 100%;
      justify-content: space-between;
    }

    .footer-note {
      text-align: left;
    }
  }
</style>
