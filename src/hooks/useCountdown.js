import { useState, useEffect } from 'react';

export function useCountdown(timings) {
  const [timeLeft, setTimeLeft] = useState('--:--:--');
  const [nextPrayer, setNextPrayer] = useState('');

  useEffect(() => {
    if (!timings) return;

    const calculateTime = () => {
      const now = new Date();
      let targetTime = null;
      let targetName = '';

      // Vakitleri sırayla gezip şu anki saatten sonrakini buluyoruz
      for (const [name, time] of Object.entries(timings)) {
        const [hours, minutes] = time.split(':');
        const prayerDate = new Date();
        prayerDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        if (prayerDate > now) {
          targetTime = prayerDate;
          targetName = name;
          break;
        }
      }

      // Eğer tüm vakitler geçildiyse (yatsı sonrası), hedef ertesi günün İmsak vaktidir
      if (!targetTime) {
        const [hours, minutes] = timings['Imsak'].split(':');
        targetTime = new Date();
        targetTime.setDate(targetTime.getDate() + 1);
        targetTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        targetName = 'İmsak';
      }

      // Kalan süreyi Saat:Dakika:Saniye formatına çevirme
      const diff = targetTime - now;
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
      setNextPrayer(targetName);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [timings]);

  return { timeLeft, nextPrayer };
}