# svelte-datetime-picker

Reusable Svelte date and date-time picker components with support for:

- range selection or single-value selection
- date-only or date-time modes
- inline or popover layouts
- locale-aware labels and formatting

GitHub:

- `https://github.com/ashaw93/svelte-datetime-picker`

## Install

```bash
npm install git+https://github.com/ashaw93/svelte-datetime-picker.git
```

This package currently ships raw Svelte source, so it is best suited to modern Svelte projects using Vite or SvelteKit.

## Usage

```svelte
<script lang="ts">
  import { DateTimeRangeInlinePicker } from 'svelte-datetime-picker';

  let startValue: Date | null = null;
  let endValue: Date | null = null;
</script>

<DateTimeRangeInlinePicker
  bind:startValue
  bind:endValue
  disableRange={true}
  disableTimePicker={true}
  enableHeader={true}
/>
```

## SvelteKit 5 Example

```svelte
<script lang="ts">
  import { DateTimeRangeInlinePicker } from 'svelte-datetime-picker';

  let startValue: Date | null = null;
  let endValue: Date | null = null;
</script>

<DateTimeRangeInlinePicker
  bind:startValue
  bind:endValue
  locale="es-ES"
  weekStartsOn={1}
  timeFormat="24h"
  minuteInterval={15}
  minimumDuration={0}
  minValue={new Date('2026-04-01T08:00:00')}
  maxValue={new Date('2026-04-30T20:00:00')}
  minStartValue={new Date('2026-04-01T09:00:00')}
  maxEndValue={new Date('2026-04-30T18:00:00')}
  enableHeader={true}
/>
```

## Locale

- `locale` is available on `DateTimeRangeInlinePicker`, `DateTimeRangeInlineSelector`, and `DateTimeRangePicker`.
- Pass values such as `locale="es-ES"` or `locale="en-US"`.
- Month names, weekday names, field formatting, time formatting, summaries, and built-in UI copy use the provided locale.
- Built-in UI copy supports Spanish and English with English fallback. If you omit `locale`, UI copy stays in English.

## Minimum Duration

- `minimumDuration={0}` is valid and allows `startValue` and `endValue` to match exactly.
- Positive values still enforce the minimum duration between start and end.

## Bounds

- `minValue` and `maxValue` apply as global datetime bounds to both start and end.
- `minStartValue` and `maxStartValue` apply only to the start value.
- `minEndValue` and `maxEndValue` apply only to the end value.
- These props are available on `DateTimeRangeInlinePicker`, `DateTimeRangeInlineSelector`, and `DateTimeRangePicker`.
- In range mode, the picker also intersects those bounds with the current range rules such as `minimumDuration`.

## Exported Components

- `DateTimeRangeInlinePicker`
- `DateTimeRangeInlineSelector`
- `DateTimeRangePicker`

## Notes

- `disableRange={true}` switches the picker into single-value mode and uses `startValue` as the selected value.
- `disableTimePicker={true}` switches the picker into date-only mode.
- `minimumDuration={0}` disables the automatic extra-minute correction and permits equal start/end timestamps.
- `locale` localizes built-in UI labels for `es` and `en`, with English fallback for other locales.
- `minValue`, `maxValue`, `minStartValue`, `maxStartValue`, `minEndValue`, and `maxEndValue` constrain calendar and time selection.
- `enableHeader` and `enableFooter` are optional UI toggles and default to `false`.
