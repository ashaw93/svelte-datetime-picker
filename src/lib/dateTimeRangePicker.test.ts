import { describe, expect, it } from 'vitest';
import {
  formatFieldValue,
  formatSummary,
  getCalendarMonthLabel,
  getEffectiveFieldBounds,
  getMinimumEndValue,
  getOrderedWeekdayNames,
  getRangePreview,
  hasSelectableValueOnDay,
  normalizeRangeWithMinimumDuration,
  sanitizeMinimumDuration
} from './dateTimeRangePicker';

describe('minimumDuration', () => {
  it('allows start and end to match exactly when minimumDuration is 0', () => {
    const start = new Date(2025, 0, 5, 10, 30);
    const range = normalizeRangeWithMinimumDuration(
      start,
      new Date(start),
      15,
      0,
      false
    );

    expect(sanitizeMinimumDuration(0)).toBe(0);
    expect(getMinimumEndValue(start, 15, 0)?.getTime()).toBe(start.getTime());
    expect(range.start?.getTime()).toBe(start.getTime());
    expect(range.end?.getTime()).toBe(start.getTime());
  });

  it('still enforces a positive minimum duration when minimumDuration is greater than 0', () => {
    const start = new Date(2025, 0, 5, 10, 30);
    const range = normalizeRangeWithMinimumDuration(
      start,
      new Date(start),
      15,
      30,
      false
    );

    expect(range.end?.getTime()).toBe(new Date(2025, 0, 5, 11, 0).getTime());
  });

  it('keeps same-day previews valid when minimumDuration is 0', () => {
    const start = new Date(2025, 0, 5, 10, 30);
    const preview = getRangePreview('end', start, null, new Date(start), 15, 0);

    expect(preview?.start?.getTime()).toBe(start.getTime());
    expect(preview?.end?.getTime()).toBe(start.getTime());
  });

  it('respects global and field-specific bounds when normalizing', () => {
    const start = new Date(2025, 0, 5, 8, 0);
    const end = new Date(2025, 0, 5, 20, 0);
    const range = normalizeRangeWithMinimumDuration(start, end, 15, 0, false, {
      minValue: new Date(2025, 0, 5, 9, 0),
      maxValue: new Date(2025, 0, 5, 18, 0),
      maxStartValue: new Date(2025, 0, 5, 12, 0),
      minEndValue: new Date(2025, 0, 5, 11, 0)
    });

    expect(range.start?.getTime()).toBe(new Date(2025, 0, 5, 9, 0).getTime());
    expect(range.end?.getTime()).toBe(new Date(2025, 0, 5, 18, 0).getTime());
  });

  it('computes a start max compatible with the end max and minimumDuration', () => {
    const bounds = getEffectiveFieldBounds('start', null, 15, 60, true, true, {
      maxStartValue: new Date(2025, 0, 5, 20, 0),
      maxEndValue: new Date(2025, 0, 5, 18, 0)
    });

    expect(bounds.max?.getTime()).toBe(new Date(2025, 0, 5, 17, 0).getTime());
  });

  it('detects when a day has no selectable values inside bounds', () => {
    expect(
      hasSelectableValueOnDay(
        new Date(2025, 0, 5),
        {
          min: new Date(2025, 0, 5, 12, 0),
          max: new Date(2025, 0, 5, 12, 0)
        },
        15,
        true
      )
    ).toBe(true);

    expect(
      hasSelectableValueOnDay(
        new Date(2025, 0, 5),
        {
          min: new Date(2025, 0, 5, 12, 1),
          max: new Date(2025, 0, 5, 12, 1)
        },
        15,
        true
      )
    ).toBe(false);
  });
});

describe('locale helpers', () => {
  it('uses Spanish calendar labels and summary text for es-ES', () => {
    const sample = new Date(2025, 0, 5, 16, 30);

    expect(getCalendarMonthLabel(new Date(2025, 0, 1), 'es-ES').toLowerCase()).toContain('enero');
    expect(getOrderedWeekdayNames(1, 'es-ES')[0].toLowerCase()).toContain('lun');
    expect(formatFieldValue(sample, undefined, '24h', true, 'es-ES').toLowerCase()).toContain('ene');
    expect(formatSummary(null, null, '24h', true, true, 'es-ES')).toBe('No hay rango seleccionado');
  });

  it('keeps English labels and summary text for en-US', () => {
    const sample = new Date(2025, 0, 5, 16, 30);

    expect(getCalendarMonthLabel(new Date(2025, 0, 1), 'en-US')).toContain('January');
    expect(getOrderedWeekdayNames(1, 'en-US')[0]).toBe('Mon');
    expect(formatFieldValue(sample, undefined, '24h', true, 'en-US')).toContain('Jan');
    expect(formatSummary(null, null, '24h', true, true, 'en-US')).toBe('No range selected');
  });
});
