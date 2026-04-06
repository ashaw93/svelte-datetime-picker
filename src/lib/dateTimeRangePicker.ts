export type PickerField = 'start' | 'end';
export type NullableDate = Date | null;
export type Period = 'AM' | 'PM';
export type TimeFormat = '12h' | '24h';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DateRange = { start: NullableDate; end: NullableDate };
export type RangeTimeLayout = {
  sideWidth: number;
  columnMaxHeight: number;
  mobileColumnMaxHeight: number;
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const;

export const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
export const HOUR_12_VALUES = Array.from({ length: 12 }, (_, i) => i + 1);
export const HOUR_24_VALUES = Array.from({ length: 24 }, (_, i) => i);
export const MINUTE_VALUES = Array.from({ length: 60 }, (_, i) => i);
export const PERIOD_VALUES: Period[] = ['AM', 'PM'];

export function sanitizeMinuteInterval(minuteInterval: number): number {
  if (!Number.isFinite(minuteInterval)) return 1;
  const normalized = Math.trunc(minuteInterval);
  return Math.min(60, Math.max(1, normalized));
}

export function sanitizeMinimumDuration(minimumDuration: number): number {
  if (!Number.isFinite(minimumDuration)) return 1;
  return Math.max(1, Math.trunc(minimumDuration));
}

export function getMinuteValues(minuteInterval: number): number[] {
  const normalized = sanitizeMinuteInterval(minuteInterval);
  return Array.from({ length: Math.ceil(60 / normalized) }, (_, index) => index * normalized).filter(
    (minute) => minute < 60
  );
}

export function setTimeParts(date: Date, hour: number, minute: number): Date {
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export function addMinutes(date: Date, minutes: number): Date {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes, 0, 0);
  return next;
}

export function clampEnd(start: NullableDate, end: NullableDate): NullableDate {
  if (!start) return end ? new Date(end) : null;
  if (!end) return new Date(start);
  if (end.getTime() < start.getTime()) return new Date(start);
  return new Date(end);
}

export function getDateOnlyTimestamp(value: Date): number {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
}

export function startOfDay(value: Date): Date {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function normalizeDateValue(value: NullableDate): NullableDate {
  return value ? startOfDay(value) : null;
}

export function normalizeRangeOrder(start: NullableDate, end: NullableDate): DateRange {

  if (!start && !end) return { start: null, end: null };

  if (!start) {
    return {
      start: end ? new Date(end) : null,
      end: end ? new Date(end) : null
    };
  }

  if (!end) {
    return {
      start: new Date(start),
      end: null
    };
  }

  if (getDateOnlyTimestamp(end) < getDateOnlyTimestamp(start)) {
    return {
      start: new Date(end),
      end: new Date(start)
    };
  }

  return {
    start: new Date(start),
    end: new Date(end)
  };
}

export function isSameDay(a: NullableDate, b: NullableDate): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameTimestamp(a: NullableDate, b: NullableDate): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

export function formatFieldValue(
  value: NullableDate,
  placeholder = 'Select date and time',
  timeFormat: TimeFormat = '12h',
  showTime = true
): string {
  if (!value) return placeholder;

  return new Intl.DateTimeFormat(
    undefined,
    showTime
      ? {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: timeFormat === '12h'
        }
      : {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
  ).format(value);
}

export function formatTimeValue(
  value: NullableDate,
  placeholder = 'Select time',
  timeFormat: TimeFormat = '12h'
): string {
  if (!value) return placeholder;

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  }).format(value);
}

export function formatSummary(
  start: NullableDate,
  end: NullableDate,
  timeFormat: TimeFormat = '12h',
  showTime = true,
  allowRange = true
): string {
  if (!allowRange) {
    return formatFieldValue(
      start,
      showTime ? 'No date and time selected' : 'No date selected',
      timeFormat,
      showTime
    );
  }

  if (!start || !end) return 'No range selected';
  const placeholder = showTime ? 'Select date and time' : 'Select date';
  return `${formatFieldValue(start, placeholder, timeFormat, showTime)} -> ${formatFieldValue(end, placeholder, timeFormat, showTime)}`;
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function getHour12(date: Date): number {
  const hour24 = date.getHours();
  const hour12 = hour24 % 12;
  return hour12 === 0 ? 12 : hour12;
}

export function getPeriod(date: Date): Period {
  return date.getHours() >= 12 ? 'PM' : 'AM';
}

export function to24Hour(hour12: number, period: Period): number {
  if (period === 'AM') return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

export function snapDateToMinuteInterval(
  value: NullableDate,
  minuteInterval: number
): NullableDate {
  if (!value) return null;
  const normalized = sanitizeMinuteInterval(minuteInterval);
  const next = new Date(value);
  next.setSeconds(0, 0);
  next.setMinutes(Math.floor(next.getMinutes() / normalized) * normalized);
  return next;
}

export function ceilDateToMinuteInterval(date: Date, minuteInterval: number): Date {
  const normalized = sanitizeMinuteInterval(minuteInterval);
  const next = new Date(date);
  next.setSeconds(0, 0);

  const remainder = next.getMinutes() % normalized;
  if (remainder !== 0) {
    next.setMinutes(next.getMinutes() + (normalized - remainder));
  }

  return next;
}

export function getMinimumEndValue(
  start: NullableDate,
  minuteInterval: number,
  minimumDuration: number
): NullableDate {
  if (!start) return null;

  const minimumEnd = addMinutes(start, sanitizeMinimumDuration(minimumDuration));
  return ceilDateToMinuteInterval(minimumEnd, minuteInterval);
}

export function normalizeRangeWithMinimumDuration(
  start: NullableDate,
  end: NullableDate,
  minuteInterval: number,
  minimumDuration: number,
  preserveNullEnd = true
): { start: NullableDate; end: NullableDate } {
  const orderedRange = normalizeRangeOrder(start, end);
  if (!orderedRange.start) return orderedRange;

  if (!orderedRange.end) {
    return {
      start: orderedRange.start,
      end: preserveNullEnd ? null : getMinimumEndValue(orderedRange.start, minuteInterval, minimumDuration)
    };
  }

  const minimumEnd = getMinimumEndValue(orderedRange.start, minuteInterval, minimumDuration);
  if (!minimumEnd) return orderedRange;

  if (orderedRange.end.getTime() < minimumEnd.getTime()) {
    return {
      start: orderedRange.start,
      end: minimumEnd
    };
  }

  return orderedRange;
}

export function normalizeDateOnlyRange(
  start: NullableDate,
  end: NullableDate,
  preserveNullEnd = true
): DateRange {
  const normalizedStart = normalizeDateValue(start);
  const normalizedEnd = normalizeDateValue(end);

  if (!normalizedStart && !normalizedEnd) return { start: null, end: null };

  if (!normalizedStart) {
    return {
      start: normalizedEnd ? new Date(normalizedEnd) : null,
      end: normalizedEnd ? new Date(normalizedEnd) : null
    };
  }

  if (!normalizedEnd) {
    return {
      start: new Date(normalizedStart),
      end: preserveNullEnd ? null : new Date(normalizedStart)
    };
  }

  if (normalizedEnd.getTime() < normalizedStart.getTime()) {
    return {
      start: new Date(normalizedEnd),
      end: new Date(normalizedStart)
    };
  }

  return {
    start: new Date(normalizedStart),
    end: new Date(normalizedEnd)
  };
}

export function updateRangeFieldValue(
  field: PickerField,
  nextValue: NullableDate,
  startValue: NullableDate,
  endValue: NullableDate,
  minuteInterval: number,
  minimumDuration: number
): DateRange {
  if (field === 'start') {
    return normalizeRangeWithMinimumDuration(
      nextValue,
      endValue,
      minuteInterval,
      minimumDuration,
      endValue === null
    );
  }

  return normalizeRangeWithMinimumDuration(
    startValue,
    nextValue,
    minuteInterval,
    minimumDuration,
    false
  );
}

export function updateDateOnlyRangeFieldValue(
  field: PickerField,
  nextValue: NullableDate,
  startValue: NullableDate,
  endValue: NullableDate
): DateRange {
  if (field === 'start') {
    return normalizeDateOnlyRange(nextValue, endValue, endValue === null);
  }

  return normalizeDateOnlyRange(startValue, nextValue, false);
}

export function getOrderedWeekdayNames(weekStartsOn: WeekStartDay): typeof WEEKDAY_NAMES {
  return WEEKDAY_NAMES.map((_, index) => WEEKDAY_NAMES[(index + weekStartsOn) % 7]) as unknown as typeof WEEKDAY_NAMES;
}

export function getMonthGridStart(monthDate: Date, weekStartsOn: WeekStartDay): Date {
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstGridDay = new Date(monthStart);
  const dayOffset = (monthStart.getDay() - weekStartsOn + 7) % 7;
  firstGridDay.setDate(monthStart.getDate() - dayOffset);
  return firstGridDay;
}

export function getCalendarDays(monthDate: Date, weekStartsOn: WeekStartDay): Date[] {
  const firstGridDay = getMonthGridStart(monthDate, weekStartsOn);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstGridDay);
    day.setDate(firstGridDay.getDate() + index);
    return day;
  });
}

export function isDateWithinRangeExclusive(
  day: Date,
  start: NullableDate,
  end: NullableDate
): boolean {
  if (!start || !end) return false;
  const timestamp = getDateOnlyTimestamp(day);
  return timestamp > getDateOnlyTimestamp(start) && timestamp < getDateOnlyTimestamp(end);
}

export function getRangePreview(
  dateSelectionTarget: PickerField,
  startValue: NullableDate,
  endValue: NullableDate,
  hoveredPreviewDay: NullableDate,
  minuteInterval: number,
  minimumDuration: number
): DateRange | null {
  if (dateSelectionTarget !== 'end' || !startValue || endValue || !hoveredPreviewDay) {
    return null;
  }

  return normalizeRangeWithMinimumDuration(
    startValue,
    hoveredPreviewDay,
    minuteInterval,
    minimumDuration,
    true
  );
}

export function getDateOnlyRangePreview(
  dateSelectionTarget: PickerField,
  startValue: NullableDate,
  endValue: NullableDate,
  hoveredPreviewDay: NullableDate
): DateRange | null {
  if (dateSelectionTarget !== 'end' || !startValue || endValue || !hoveredPreviewDay) {
    return null;
  }

  return normalizeDateOnlyRange(startValue, hoveredPreviewDay, true);
}

export function getRangeFieldBaseValue(
  field: PickerField,
  startValue: NullableDate,
  endValue: NullableDate,
  showTime = true
): Date {
  const source = field === 'start' ? startValue : endValue ?? startValue;
  if (source) return showTime ? new Date(source) : startOfDay(source);

  if (!showTime) {
    return startOfDay(new Date());
  }

  return field === 'start' ? setTimeParts(new Date(), 9, 0) : setTimeParts(new Date(), 17, 0);
}

export function buildTimeCandidate(
  baseValue: NullableDate,
  hour24: number,
  minute: number
): NullableDate {
  if (!baseValue) return null;
  const next = new Date(baseValue);
  next.setHours(hour24, minute, 0, 0);
  return next;
}

export function isTimeCandidateBeforeMinimum(
  baseValue: NullableDate,
  minimumValue: NullableDate,
  hour24: number,
  minute: number
): boolean {
  if (!minimumValue) return false;
  const candidate = buildTimeCandidate(baseValue, hour24, minute);
  if (!candidate) return false;
  return candidate.getTime() < minimumValue.getTime();
}

export function getRangeTimeLayout(
  showRangeHeader: boolean,
  timeFormat: TimeFormat
): RangeTimeLayout {
  return {
    sideWidth: timeFormat === '24h' ? 133 : 187,
    columnMaxHeight: showRangeHeader ? 234 : 284,
    mobileColumnMaxHeight: showRangeHeader ? 160 : 198
  };
}
