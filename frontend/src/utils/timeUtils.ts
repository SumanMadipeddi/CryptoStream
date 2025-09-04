export function getCurrentTimeString(): string {
  const now = new Date();
  
  // Get timezone offset in minutes
  const timezoneOffset = now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  const offsetMinutes = Math.abs(timezoneOffset) % 60;
  
  // Format timezone offset
  const offsetSign = timezoneOffset <= 0 ? '+' : '-';
  const offsetString = `GMT${offsetSign}${offsetHours}${offsetMinutes > 0 ? `:${offsetMinutes.toString().padStart(2, '0')}` : ''}`;
  
  // Format time
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  // Format date
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `As of ${dateString} at ${timeString} ${offsetString}`;
}

export function getShortTimeString(): string {
  const now = new Date();
  
  // Get timezone offset in minutes
  const timezoneOffset = now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
  
  // Format timezone offset
  const offsetSign = timezoneOffset <= 0 ? '+' : '-';
  const offsetString = `GMT${offsetSign}${offsetHours}`;
  
  // Format time
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  return `Today at ${timeString} ${offsetString}`;
}
