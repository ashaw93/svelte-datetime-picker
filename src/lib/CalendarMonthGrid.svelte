<script lang="ts">
  import {
    MONTH_NAMES,
    getCalendarDays,
    getOrderedWeekdayNames,
    isSameDay,
    type WeekStartDay
  } from './dateTimeRangePicker';

  export let visibleMonthDate: Date;
  export let weekStartsOn: WeekStartDay = 0;
  export let dayHeight = 40;
  export let shiftMonth: (delta: number) => void = () => {};
  export let onDayClick: (day: Date) => void = () => {};
  export let onDayMouseEnter: (day: Date) => void = () => {};
  export let onDayFocus: (day: Date) => void = () => {};
  export let onDayMouseLeave: () => void = () => {};
  export let onDayBlur: () => void = () => {};
  export let isDayDisabled: (day: Date) => boolean = () => false;
  export let isSelectedDay: (day: Date) => boolean = () => false;
  export let isRangeMiddle: (day: Date) => boolean = () => false;
  export let isRangeStart: (day: Date) => boolean = () => false;
  export let isRangeEnd: (day: Date) => boolean = () => false;
  export let isPreviewRangeStart: (day: Date) => boolean = () => false;
  export let isPreviewRangeEnd: (day: Date) => boolean = () => false;
  export let isPreviewRangeMiddle: (day: Date) => boolean = () => false;

  $: weekdayNames = getOrderedWeekdayNames(weekStartsOn);
  $: calendarDays = getCalendarDays(visibleMonthDate, weekStartsOn);
  $: calendarKey = `${visibleMonthDate.getFullYear()}-${visibleMonthDate.getMonth()}-${weekStartsOn}`;
</script>

<div class="calendar-root" style={`--calendar-day-height: ${dayHeight}px;`}>
  <div class="calendar-header">
    <button class="ghost nav" type="button" on:click={() => shiftMonth(-1)}>‹</button>
    <div class="month-title">{MONTH_NAMES[visibleMonthDate.getMonth()]} {visibleMonthDate.getFullYear()}</div>
    <button class="ghost nav" type="button" on:click={() => shiftMonth(1)}>›</button>
  </div>

  <div class="weekday-row">
    {#each weekdayNames as weekday}
      <div>{weekday}</div>
    {/each}
  </div>

  <div class="calendar-grid">
    {#key calendarKey}
      {#each calendarDays as day}
        <button
          type="button"
          class="day"
          class:selected-day={isSelectedDay(day)}
          class:range-middle={isRangeMiddle(day)}
          class:range-start={isRangeStart(day)}
          class:range-end={isRangeEnd(day)}
          class:preview-range-start={isPreviewRangeStart(day)}
          class:preview-range-end={isPreviewRangeEnd(day)}
          class:preview-range-middle={isPreviewRangeMiddle(day)}
          class:outside-month={day.getMonth() !== visibleMonthDate.getMonth()}
          class:today={isSameDay(day, new Date())}
          disabled={isDayDisabled(day)}
          on:mouseenter={() => onDayMouseEnter(day)}
          on:focus={() => onDayFocus(day)}
          on:mouseleave={onDayMouseLeave}
          on:blur={onDayBlur}
          on:click={() => onDayClick(day)}
        >
          {day.getDate()}
        </button>
      {/each}
    {/key}
  </div>
</div>

<style>
  button {
    font: inherit;
  }

  .calendar-root {
    min-width: 0;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .month-title {
    font-weight: 700;
    font-size: 15px;
    color: var(--picker-shell-text, #172033);
  }

  .weekday-row,
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
  }

  .weekday-row {
    margin-bottom: 6px;
    color: var(--picker-muted-text, #70798b);
    font-size: 12px;
    text-align: center;
  }

  .day,
  .ghost {
    border: 0;
    border-radius: 11px;
    cursor: pointer;
    transition: transform 0.12s ease, background 0.12s ease;
  }

  .day {
    position: relative;
    height: var(--calendar-day-height, 40px);
    background: transparent;
    color: var(--picker-shell-text, #172033);
    font-weight: 600;
    font-size: 14px;
  }

  .day.range-middle {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 18%, transparent);
    color: var(--picker-shell-text, #172033);
  }

  .day.preview-range-middle {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 24%, transparent);
    color: var(--picker-shell-text, #172033);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 35%, transparent);
  }

  .day.range-start,
  .day.range-end,
  .day.selected-day {
    background: var(--picker-primary-bg, #1f6fff);
    color: var(--picker-primary-text, white);
  }

  .day.preview-range-start,
  .day.preview-range-end {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 78%, transparent);
    color: var(--picker-primary-text, white);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, white 28%, transparent);
  }

  .day:hover:not(:disabled),
  .ghost:hover {
    transform: translateY(-1px);
  }

  .day:hover:not(:disabled),
  .ghost:hover {
    background: var(--picker-hover-bg, #f1f5f9);
  }

  .day.range-middle:hover:not(:disabled) {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 26%, transparent);
  }

  .day.preview-range-middle:hover:not(:disabled) {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 28%, transparent);
  }

  .day.selected-day:hover:not(:disabled),
  .day.range-start:hover:not(:disabled),
  .day.range-end:hover:not(:disabled),
  .day.preview-range-start:hover:not(:disabled),
  .day.preview-range-end:hover:not(:disabled) {
    background: var(--picker-primary-hover, #195de0);
  }

  .day.preview-range-middle,
  .day.preview-range-middle:hover:not(:disabled) {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 24%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 35%, transparent);
  }

  .day.preview-range-start,
  .day.preview-range-end,
  .day.preview-range-start:hover:not(:disabled),
  .day.preview-range-end:hover:not(:disabled) {
    background: color-mix(in srgb, var(--picker-primary-bg, #1f6fff) 78%, transparent);
    color: var(--picker-primary-text, white);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, white 28%, transparent);
  }

  .outside-month {
    color: var(--picker-subtle-text, #7f8899);
  }

  .today {
    outline: 1px solid var(--picker-today-outline, #c8d4f8);
  }

  .ghost {
    background: var(--picker-ghost-bg, #f8fafc);
    color: var(--picker-shell-text, #172033);
    padding: 9px 12px;
  }

  .nav {
    padding: 6px 10px;
  }
</style>
