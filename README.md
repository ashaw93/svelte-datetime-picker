# svelte-datetime-picker

Reusable Svelte date and date-time picker components with support for:

- range selection or single-value selection
- date-only or date-time modes
- inline or popover layouts

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

## Exported Components

- `DateTimeRangeInlinePicker`
- `DateTimeRangeInlineSelector`
- `DateTimeRangePicker`

## Notes

- `disableRange={true}` switches the picker into single-value mode and uses `startValue` as the selected value.
- `disableTimePicker={true}` switches the picker into date-only mode.
- `enableHeader` and `enableFooter` are optional UI toggles and default to `false`.
