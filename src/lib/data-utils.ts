// lib/date-utils.ts
// Fallback date formatting utility if date-fns is not available

export function formatDistanceToNow(date: Date, options?: { addSuffix?: boolean }): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return options?.addSuffix ? 'just now' : 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const suffix = options?.addSuffix ? ' ago' : '';
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''}${suffix}`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  const suffix = options?.addSuffix ? ' ago' : '';
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''}${suffix}`;
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}