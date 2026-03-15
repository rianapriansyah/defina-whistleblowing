export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

/** MUI Chip/Alert color for severity. */
export function getSeverityColor(severity: string | null): 'success' | 'info' | 'warning' | 'error' | 'default' {
  if (!severity) return 'default';
  const s = severity.toLowerCase();
  if (s === 'low') return 'success';
  if (s === 'medium') return 'info';
  if (s === 'high') return 'warning';
  if (s === 'critical') return 'error';
  return 'default';
}
