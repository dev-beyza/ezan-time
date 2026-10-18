import { useState, useEffect } from 'react';

export function useQuranReader(type, id) {
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!type || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const resAr = await fetch(`https://api.alquran.cloud/v1/${type}/${id}`);
        const dataAr = await resAr.json();
        
        const resTr = await fetch(`https://api.alquran.cloud/v1/${type}/${id}/tr.diyanet`);
        const dataTr = await resTr.json();

        if (dataAr.code === 200 && dataTr.code === 200) {
          const mergedAyahs = dataAr.data.ayahs.map((ayah, index) => ({
            number: ayah.numberInSurah || ayah.number, 
            textAr: ayah.text,
            textTr: dataTr.data.ayahs[index].text,
            surahNumber: ayah.surah?.number // Hangi surede olduğumuzu bilmek için numarasını alıyoruz
          }));
          setAyahs(mergedAyahs);
          
          if (type === 'surah') setTitle(dataAr.data.englishName);
          else if (type === 'juz') setTitle(`${id}. Cüz`);
          else if (type === 'page') setTitle(`Sayfa ${id}`);
        }
      } catch (err) {
        console.error("Ayetler çekilirken hata oluştu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]);

  return { ayahs, loading, title };
}