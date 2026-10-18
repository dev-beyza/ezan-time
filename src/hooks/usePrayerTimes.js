import { useState, useEffect } from 'react';

// Hicri ayları kesin numara sırasına göre tanımlıyoruz (Hata payı sıfır)
const hijriAylar = [
  "", "Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel",
  "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"
];

export function usePrayerTimes() {
  const [timings, setTimings] = useState(null);
  const [dates, setDates] = useState(null);
  const [locationName, setLocationName] = useState("Konum Aranıyor...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimes = async (lat = 41.0082, lng = 28.9784) => { 
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=13`);
        const result = await res.json();
        
        // Vakitleri alıyoruz
        const { Imsak, Sunrise, Dhuhr, Asr, Maghrib, Isha } = result.data.timings;
        setTimings({ Imsak, Güneş: Sunrise, Öğle: Dhuhr, İkindi: Asr, Akşam: Maghrib, Yatsı: Isha });
        
        // Miladi Tarih (Türkçe format)
        const gregorian = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        // Hicri Tarihi API'nin ay numarasına göre kendi dizimizden çekiyoruz
        const monthNumber = result.data.date.hijri.month.number;
        const hijri = `${result.data.date.hijri.day} ${hijriAylar[monthNumber]} ${result.data.date.hijri.year}`;
        setDates({ gregorian, hijri });

        // Konum adını çıkarma (Örn: Europe/Istanbul -> İstanbul)
        let city = result.data.meta.timezone.split('/').pop().replace('_', ' ');
        if(city === "Istanbul") city = "İstanbul";
        
        // Sadece temiz şehir adını yazdırıyoruz, (Otomatik) yazısını kaldırdık
        setLocationName(city);

      } catch (err) {
        console.error("Vakitler çekilirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    };

    // Kullanıcının konumunu almayı deniyoruz
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchTimes(pos.coords.latitude, pos.coords.longitude),
        () => fetchTimes() // Konum izni verilmezse varsayılan (İstanbul) çalışır
      );
    } else {
      fetchTimes();
    }
  }, []);

  return { timings, dates, locationName, loading };
}