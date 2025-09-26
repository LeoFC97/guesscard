import { useEffect, useState } from 'react';

export function useDailyPlayedDates(userId: string | null | undefined) {
  const [dates, setDates] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.REACT_APP_API_URL}/api/daily-played-dates/${userId}`)
      .then(res => res.json())
      .then(data => setDates(data.dates || []))
      .catch(() => setDates([]));
  }, [userId]);
  return dates;
}
