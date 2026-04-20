import { parseISO, format, isValid } from 'date-fns';

export default function Date({ dateString }) {
  const value = typeof dateString === 'string' ? dateString.trim() : '';

  if (!value) {
    return null;
  }

  const date = parseISO(value);

  if (!isValid(date)) {
    return <time dateTime={value}>{value}</time>;
  }

  return <time dateTime={value}>{format(date, 'LLLL d, yyyy')}</time>;
}
