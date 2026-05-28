export const isEuropeanUser = (): boolean => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return false;
    
    if (tz.startsWith('Europe/')) return true;

    const extraEuZones = [
      'Atlantic/Canary',
      'Atlantic/Madeira',
      'Atlantic/Faeroe',
      'Atlantic/Reykjavik'
    ];

    return extraEuZones.includes(tz);
  } catch (e) {
    return true;
  }
};
