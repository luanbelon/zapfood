export function isStoreOpenNow(openTime: string, closeTime: string, now = new Date()): boolean {
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);
  if ([oh, om, ch, cm].some((n) => Number.isNaN(n))) return true;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (openMinutes === closeMinutes) return true;
  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
}
