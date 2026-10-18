import { useState, useEffect } from 'react';

export function useQuran() {
  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        // Tüm surelerin listesini (Arapça isimleri, ayet sayıları ve İngilizce/Türkçe okunuşlarıyla) çekiyoruz
        const res = await fetch('https://api.alquran.cloud/v1/surah');
        const result = await res.json();
        
        if (result.code === 200) {
          setSurahs(result.data);
        } else {
          throw new Error('Veri alınamadı');
        }
      } catch (err) {
        setError('Sureler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
}