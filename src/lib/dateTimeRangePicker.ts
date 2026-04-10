export type PickerField = 'start' | 'end';
export type NullableDate = Date | null;
export type Period = 'AM' | 'PM';
export type TimeFormat = '12h' | '24h';
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PickerLocale = string | undefined;
export type DateRange = { start: NullableDate; end: NullableDate };
export type RangeTimeLayout = {
  sideWidth: number;
  columnMaxHeight: number;
  mobileColumnMaxHeight: number;
};
export type PickerValueBounds = {
  minValue?: NullableDate;
  maxValue?: NullableDate;
  minStartValue?: NullableDate;
  maxStartValue?: NullableDate;
  minEndValue?: NullableDate;
  maxEndValue?: NullableDate;
};
export type PickerFieldBounds = {
  min: NullableDate;
  max: NullableDate;
};
export type PickerText = {
  start: string;
  end: string;
  value: string;
  range: string;
  selection: string;
  time: string;
  selectDateAndTime: string;
  selectDate: string;
  selectTime: string;
  noDateAndTimeSelected: string;
  noDateSelected: string;
  noRangeSelected: string;
  pickTimeRange: string;
  pickDateRange: string;
  pickDateAndTime: string;
  pickDate: string;
  startTime: string;
  endTime: string;
  hour: string;
  clearRange: string;
  clearSelection: string;
  clear: string;
  cancel: string;
  apply: string;
  closePicker: string;
  previousMonth: string;
  nextMonth: string;
  nextDateClick: (label: string) => string;
  footerRangeWithTime: string;
  footerRangeDateOnly: string;
  footerSingleWithTime: string;
  footerSingleDateOnly: string;
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

const ENGLISH_PICKER_TEXT: PickerText = {
  start: 'Start',
  end: 'End',
  value: 'Value',
  range: 'Range',
  selection: 'Selection',
  time: 'Time',
  selectDateAndTime: 'Select date and time',
  selectDate: 'Select date',
  selectTime: 'Select time',
  noDateAndTimeSelected: 'No date and time selected',
  noDateSelected: 'No date selected',
  noRangeSelected: 'No range selected',
  pickTimeRange: 'Pick a time range',
  pickDateRange: 'Pick a date range',
  pickDateAndTime: 'Pick a date and time',
  pickDate: 'Pick a date',
  startTime: 'Start time',
  endTime: 'End time',
  hour: 'Hour',
  clearRange: 'Clear range',
  clearSelection: 'Clear selection',
  clear: 'Clear',
  cancel: 'Cancel',
  apply: 'Apply',
  closePicker: 'Close picker',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  nextDateClick: (label: string) => `Next date click: ${label}`,
  footerRangeWithTime:
    'Choose start time, click dates in the calendar for start and end, then fine-tune the end time.',
  footerRangeDateOnly: 'Click dates in the calendar to set the start and end of the range.',
  footerSingleWithTime: 'Pick a date in the calendar, then adjust the time if needed.',
  footerSingleDateOnly: 'Pick a date in the calendar.'
};

const SPANISH_PICKER_TEXT: PickerText = {
  start: 'Inicio',
  end: 'Fin',
  value: 'Valor',
  range: 'Rango',
  selection: 'Selección',
  time: 'Hora',
  selectDateAndTime: 'Selecciona fecha y hora',
  selectDate: 'Selecciona fecha',
  selectTime: 'Selecciona hora',
  noDateAndTimeSelected: 'No hay fecha ni hora seleccionadas',
  noDateSelected: 'No hay fecha seleccionada',
  noRangeSelected: 'No hay rango seleccionado',
  pickTimeRange: 'Selecciona un rango de horas',
  pickDateRange: 'Selecciona un rango de fechas',
  pickDateAndTime: 'Selecciona fecha y hora',
  pickDate: 'Selecciona una fecha',
  startTime: 'Hora de inicio',
  endTime: 'Hora de fin',
  hour: 'Hora',
  clearRange: 'Borrar rango',
  clearSelection: 'Borrar selección',
  clear: 'Borrar',
  cancel: 'Cancelar',
  apply: 'Aplicar',
  closePicker: 'Cerrar selector',
  previousMonth: 'Mes anterior',
  nextMonth: 'Mes siguiente',
  nextDateClick: (label: string) => `Siguiente clic en fecha: ${label}`,
  footerRangeWithTime:
    'Elige la hora de inicio, pulsa las fechas en el calendario para inicio y fin, y ajusta después la hora de fin.',
  footerRangeDateOnly: 'Pulsa las fechas en el calendario para definir el inicio y el fin del rango.',
  footerSingleWithTime: 'Elige una fecha en el calendario y ajusta la hora si lo necesitas.',
  footerSingleDateOnly: 'Elige una fecha en el calendario.'
};

function normalizeLocaleInput(locale: PickerLocale): string {
  return locale?.trim().toLowerCase() ?? '';
}

export function getPickerUiLocale(locale: PickerLocale): string {
  return locale?.trim() || 'en-US';
}

export function getPickerText(locale: PickerLocale): PickerText {
  return normalizeLocaleInput(locale).startsWith('es')
    ? SPANISH_PICKER_TEXT
    : ENGLISH_PICKER_TEXT;
}

export function getDefaultFieldPlaceholder(showTime = true, locale: PickerLocale = undefined): string {
  const text = getPickerText(locale);
  return showTime ? text.selectDateAndTime : text.selectDate;
}

export function getDefaultTimePlaceholder(locale: PickerLocale = undefined): string {
  return getPickerText(locale).selectTime;
}

export function sanitizeMinuteInterval(minuteInterval: number): number {
  if (!Number.isFinite(minuteInterval)) return 1;
  const normalized = Math.trunc(minuteInterval);
  return Math.min(60, Math.max(1, normalized));
}

export function sanitizeMinimumDuration(minimumDuration: number): number {
  if (!Number.isFinite(minimumDuration)) return 1;
  return Math.max(0, Math.trunc(minimumDuration));
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

export function endOfDay(value: Date): Date {
  const normalized = new Date(value);
  normalized.setHours(23, 59, 59, 999);
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
  placeholder?: string,
  timeFormat: TimeFormat = '12h',
  showTime = true,
  locale: PickerLocale = undefined
): string {
  if (!value) return placeholder ?? getDefaultFieldPlaceholder(showTime, locale);

  return new Intl.DateTimeFormat(
    locale,
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
  placeholder?: string,
  timeFormat: TimeFormat = '12h',
  locale: PickerLocale = undefined
): string {
  if (!value) return placeholder ?? getDefaultTimePlaceholder(locale);

  return new Intl.DateTimeFormat(locale, {
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
  allowRange = true,
  locale: PickerLocale = undefined
): string {
  const text = getPickerText(locale);

  if (!allowRange) {
    return formatFieldValue(
      start,
      showTime ? text.noDateAndTimeSelected : text.noDateSelected,
      timeFormat,
      showTime,
      locale
    );
  }

  if (!start || !end) return text.noRangeSelected;
  const placeholder = getDefaultFieldPlaceholder(showTime, locale);
  return `${formatFieldValue(start, placeholder, timeFormat, showTime, locale)} -> ${formatFieldValue(end, placeholder, timeFormat, showTime, locale)}`;
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

export function getPeriodLabel(period: Period, locale: PickerLocale = undefined): string {
  const sampleDate = new Date(Date.UTC(2024, 0, 1, period === 'AM' ? 9 : 21, 0, 0, 0));
  const formatter = new Intl.DateTimeFormat(getPickerUiLocale(locale), {
    hour: 'numeric',
    hour12: true,
    timeZone: 'UTC'
  });
  const dayPeriod = formatter.formatToParts(sampleDate).find((part) => part.type === 'dayPeriod')?.value;
  return dayPeriod ?? period;
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

export function floorDateToMinuteInterval(date: Date, minuteInterval: number): Date {
  return snapDateToMinuteInterval(date, minuteInterval) ?? new Date(date);
}

export function normalizeBoundValue(
  value: NullableDate,
  minuteInterval: number,
  showTime: boolean,
  kind: 'min' | 'max'
): NullableDate {
  if (!value) return null;
  if (!showTime) return normalizeDateValue(value);
  return kind === 'min'
    ? ceilDateToMinuteInterval(value, minuteInterval)
    : floorDateToMinuteInterval(value, minuteInterval);
}

export function minNullableDate(a: NullableDate, b: NullableDate): NullableDate {
  if (!a) return b ? new Date(b) : null;
  if (!b) return new Date(a);
  return a.getTime() <= b.getTime() ? new Date(a) : new Date(b);
}

export function maxNullableDate(a: NullableDate, b: NullableDate): NullableDate {
  if (!a) return b ? new Date(b) : null;
  if (!b) return new Date(a);
  return a.getTime() >= b.getTime() ? new Date(a) : new Date(b);
}

export function areBoundsValid(bounds: PickerFieldBounds, showTime: boolean): boolean {
  if (!bounds.min || !bounds.max) return true;
  const minValue = showTime ? bounds.min.getTime() : getDateOnlyTimestamp(bounds.min);
  const maxValue = showTime ? bounds.max.getTime() : getDateOnlyTimestamp(bounds.max);
  return minValue <= maxValue;
}

export function clampValueToBounds(
  value: NullableDate,
  bounds: PickerFieldBounds,
  showTime: boolean
): NullableDate {
  if (!value) return null;
  if (!areBoundsValid(bounds, showTime)) return null;

  if (bounds.min) {
    const minCompare = showTime ? bounds.min.getTime() : getDateOnlyTimestamp(bounds.min);
    const valueCompare = showTime ? value.getTime() : getDateOnlyTimestamp(value);
    if (valueCompare < minCompare) {
      return showTime ? new Date(bounds.min) : normalizeDateValue(bounds.min);
    }
  }

  if (bounds.max) {
    const maxCompare = showTime ? bounds.max.getTime() : getDateOnlyTimestamp(bounds.max);
    const valueCompare = showTime ? value.getTime() : getDateOnlyTimestamp(value);
    if (valueCompare > maxCompare) {
      return showTime ? new Date(bounds.max) : normalizeDateValue(bounds.max);
    }
  }

  return showTime ? new Date(value) : normalizeDateValue(value);
}

export function buildFieldBounds(
  field: PickerField,
  minuteInterval: number,
  showTime: boolean,
  bounds: PickerValueBounds = {}
): PickerFieldBounds {
  const fieldMin = field === 'start' ? bounds.minStartValue : bounds.minEndValue;
  const fieldMax = field === 'start' ? bounds.maxStartValue : bounds.maxEndValue;

  return {
    min: maxNullableDate(
      normalizeBoundValue(bounds.minValue ?? null, minuteInterval, showTime, 'min'),
      normalizeBoundValue(fieldMin ?? null, minuteInterval, showTime, 'min')
    ),
    max: minNullableDate(
      normalizeBoundValue(bounds.maxValue ?? null, minuteInterval, showTime, 'max'),
      normalizeBoundValue(fieldMax ?? null, minuteInterval, showTime, 'max')
    )
  };
}

export function getLatestPermittedStartValue(
  endMaximum: NullableDate,
  minuteInterval: number,
  minimumDuration: number
): NullableDate {
  if (!endMaximum) return null;
  return floorDateToMinuteInterval(
    addMinutes(endMaximum, -sanitizeMinimumDuration(minimumDuration)),
    minuteInterval
  );
}

export function getEffectiveFieldBounds(
  field: PickerField,
  startValue: NullableDate,
  minuteInterval: number,
  minimumDuration: number,
  showTime: boolean,
  allowRange: boolean,
  bounds: PickerValueBounds = {}
): PickerFieldBounds {
  const baseBounds = buildFieldBounds(field, minuteInterval, showTime, bounds);
  if (!allowRange) return baseBounds;

  if (field === 'end') {
    const rangeMinimum = showTime
      ? getMinimumEndValue(startValue, minuteInterval, minimumDuration)
      : normalizeDateValue(startValue);

    return {
      min: maxNullableDate(baseBounds.min, rangeMinimum),
      max: baseBounds.max
    };
  }

  const endBounds = buildFieldBounds('end', minuteInterval, showTime, bounds);
  const compatibleMaximum = showTime
    ? getLatestPermittedStartValue(endBounds.max, minuteInterval, minimumDuration)
    : endBounds.max;

  return {
    min: baseBounds.min,
    max: minNullableDate(baseBounds.max, compatibleMaximum)
  };
}

export function getFirstSelectableValue(
  field: PickerField,
  startValue: NullableDate,
  endValue: NullableDate,
  minuteInterval: number,
  minimumDuration: number,
  showTime: boolean,
  allowRange: boolean,
  bounds: PickerValueBounds = {}
): NullableDate {
  const effectiveBounds = getEffectiveFieldBounds(
    field,
    startValue,
    minuteInterval,
    minimumDuration,
    showTime,
    allowRange,
    bounds
  );

  if (!areBoundsValid(effectiveBounds, showTime)) return null;

  const base = getRangeFieldBaseValue(field, startValue, endValue, showTime);
  return clampValueToBounds(base, effectiveBounds, showTime) ?? effectiveBounds.min ?? effectiveBounds.max;
}

export function hasSelectableValueOnDay(
  day: Date,
  bounds: PickerFieldBounds,
  minuteInterval: number,
  showTime: boolean
): boolean {
  if (!areBoundsValid(bounds, showTime)) return false;

  if (!showTime) {
    const timestamp = getDateOnlyTimestamp(day);
    const minTimestamp = bounds.min ? getDateOnlyTimestamp(bounds.min) : null;
    const maxTimestamp = bounds.max ? getDateOnlyTimestamp(bounds.max) : null;
    if (minTimestamp !== null && timestamp < minTimestamp) return false;
    if (maxTimestamp !== null && timestamp > maxTimestamp) return false;
    return true;
  }

  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const lowerBound = maxNullableDate(bounds.min, dayStart);
  const upperBound = minNullableDate(bounds.max, dayEnd);
  if (!lowerBound || !upperBound || lowerBound.getTime() > upperBound.getTime()) {
    return false;
  }

  const firstCandidate = ceilDateToMinuteInterval(lowerBound, minuteInterval);
  return firstCandidate.getTime() <= upperBound.getTime() && isSameDay(firstCandidate, day);
}

export function isTimeCandidateOutOfBounds(
  baseValue: NullableDate,
  bounds: PickerFieldBounds,
  hour24: number,
  minute: number
): boolean {
  const candidate = buildTimeCandidate(baseValue, hour24, minute);
  if (!candidate || !areBoundsValid(bounds, true)) return true;
  if (bounds.min && candidate.getTime() < bounds.min.getTime()) return true;
  if (bounds.max && candidate.getTime() > bounds.max.getTime()) return true;
  return false;
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
  preserveNullEnd = true,
  bounds: PickerValueBounds = {},
  allowRange = true
): { start: NullableDate; end: NullableDate } {
  if (!allowRange) {
    const singleBounds = buildFieldBounds('start', minuteInterval, true, bounds);
    return {
      start: clampValueToBounds(start, singleBounds, true),
      end: null
    };
  }

  const orderedRange = normalizeRangeOrder(start, end);
  const normalizedStart = clampValueToBounds(
    orderedRange.start,
    getEffectiveFieldBounds(
      'start',
      orderedRange.start,
      minuteInterval,
      minimumDuration,
      true,
      true,
      bounds
    ),
    true
  );

  if (!normalizedStart) return { start: null, end: null };

  const endBounds = getEffectiveFieldBounds(
    'end',
    normalizedStart,
    minuteInterval,
    minimumDuration,
    true,
    true,
    bounds
  );
  if (!areBoundsValid(endBounds, true)) {
    return {
      start: normalizedStart,
      end: null
    };
  }

  if (!orderedRange.end) {
    return {
      start: normalizedStart,
      end: preserveNullEnd
        ? null
        : clampValueToBounds(
            getMinimumEndValue(normalizedStart, minuteInterval, minimumDuration),
            endBounds,
            true
          )
    };
  }

  return {
    start: normalizedStart,
    end: clampValueToBounds(orderedRange.end, endBounds, true)
  };
}

export function normalizeDateOnlyRange(
  start: NullableDate,
  end: NullableDate,
  preserveNullEnd = true,
  bounds: PickerValueBounds = {},
  allowRange = true
): DateRange {
  if (!allowRange) {
    const singleBounds = buildFieldBounds('start', 1, false, bounds);
    return {
      start: clampValueToBounds(normalizeDateValue(start), singleBounds, false),
      end: null
    };
  }

  const normalizedStart = normalizeDateValue(start);
  const normalizedEnd = normalizeDateValue(end);
  const orderedRange = normalizeRangeOrder(normalizedStart, normalizedEnd);
  const boundedStart = clampValueToBounds(
    orderedRange.start,
    getEffectiveFieldBounds('start', orderedRange.start, 1, 0, false, true, bounds),
    false
  );

  if (!boundedStart) return { start: null, end: null };

  const endBounds = getEffectiveFieldBounds('end', boundedStart, 1, 0, false, true, bounds);
  if (!areBoundsValid(endBounds, false)) {
    return {
      start: boundedStart,
      end: null
    };
  }

  if (!orderedRange.end) {
    return {
      start: boundedStart,
      end: preserveNullEnd ? null : clampValueToBounds(boundedStart, endBounds, false)
    };
  }

  return {
    start: boundedStart,
    end: clampValueToBounds(orderedRange.end, endBounds, false)
  };
}

export function updateRangeFieldValue(
  field: PickerField,
  nextValue: NullableDate,
  startValue: NullableDate,
  endValue: NullableDate,
  minuteInterval: number,
  minimumDuration: number,
  bounds: PickerValueBounds = {},
  allowRange = true
): DateRange {
  if (!allowRange) {
    return normalizeRangeWithMinimumDuration(
      nextValue,
      null,
      minuteInterval,
      minimumDuration,
      true,
      bounds,
      false
    );
  }

  if (field === 'start') {
    return normalizeRangeWithMinimumDuration(
      nextValue,
      endValue,
      minuteInterval,
      minimumDuration,
      endValue === null,
      bounds,
      true
    );
  }

  return normalizeRangeWithMinimumDuration(
    startValue,
    nextValue,
    minuteInterval,
    minimumDuration,
    false,
    bounds,
    true
  );
}

export function updateDateOnlyRangeFieldValue(
  field: PickerField,
  nextValue: NullableDate,
  startValue: NullableDate,
  endValue: NullableDate,
  bounds: PickerValueBounds = {},
  allowRange = true
): DateRange {
  if (!allowRange) {
    return normalizeDateOnlyRange(nextValue, null, true, bounds, false);
  }

  if (field === 'start') {
    return normalizeDateOnlyRange(nextValue, endValue, endValue === null, bounds, true);
  }

  return normalizeDateOnlyRange(startValue, nextValue, false, bounds, true);
}

export function getOrderedWeekdayNames(
  weekStartsOn: WeekStartDay,
  locale: PickerLocale = undefined
): string[] {
  const formatter = new Intl.DateTimeFormat(getPickerUiLocale(locale), {
    weekday: 'short',
    timeZone: 'UTC'
  });
  const referenceSunday = new Date(Date.UTC(2024, 0, 7, 12, 0, 0, 0));

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(referenceSunday);
    day.setUTCDate(referenceSunday.getUTCDate() + ((index + weekStartsOn) % 7));
    return formatter.format(day);
  });
}

export function getCalendarMonthLabel(
  monthDate: Date,
  locale: PickerLocale = undefined
): string {
  return new Intl.DateTimeFormat(getPickerUiLocale(locale), {
    month: 'long',
    year: 'numeric'
  }).format(monthDate);
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
  minimumDuration: number,
  bounds: PickerValueBounds = {}
): DateRange | null {
  if (dateSelectionTarget !== 'end' || !startValue || endValue || !hoveredPreviewDay) {
    return null;
  }

  return normalizeRangeWithMinimumDuration(
    startValue,
    hoveredPreviewDay,
    minuteInterval,
    minimumDuration,
    true,
    bounds
  );
}

export function getDateOnlyRangePreview(
  dateSelectionTarget: PickerField,
  startValue: NullableDate,
  endValue: NullableDate,
  hoveredPreviewDay: NullableDate,
  bounds: PickerValueBounds = {}
): DateRange | null {
  if (dateSelectionTarget !== 'end' || !startValue || endValue || !hoveredPreviewDay) {
    return null;
  }

  return normalizeDateOnlyRange(startValue, hoveredPreviewDay, true, bounds);
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
