import { useState, useEffect, useRef } from 'react';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useCountdown } from './hooks/useCountdown';
import { useQuran } from './hooks/useQuran';
import { useQuranReader } from './hooks/useQuranReader';

const turkceSureIsimleri = [
  "Fatiha", "Bakara", "Ali İmran", "Nisa", "Maide", "Enam", "Araf", "Enfal", "Tevbe", "Yunus",
  "Hud", "Yusuf", "Rad", "İbrahim", "Hicr", "Nahl", "İsra", "Kehf", "Meryem", "Taha",
  "Enbiya", "Hac", "Müminun", "Nur", "Furkan", "Şuara", "Neml", "Kasas", "Ankebut", "Rum",
  "Lokman", "Secde", "Ahzab", "Sebe", "Fatır", "Yasin", "Saffat", "Sad", "Zümer", "Mümin",
  "Fussilet", "Şura", "Zuhruf", "Duhan", "Casiye", "Ahkaf", "Muhammed", "Fetih", "Hucurat", "Kaf",
  "Zariyat", "Tur", "Necm", "Kamer", "Rahman", "Vakıa", "Hadid", "Mücadele", "Haşr", "Mümtehine",
  "Saf", "Cuma", "Münafikun", "Teğabün", "Talak", "Tahrim", "Mülk", "Kalem", "Hakka", "Mearic",
  "Nuh", "Cin", "Müzzemmil", "Müddessir", "Kıyame", "İnsan", "Mürselat", "Nebe", "Naziat", "Abese",
  "Tekvir", "İnfitar", "Mutaffifin", "İnşikak", "Büruc", "Tarık", "Ala", "Gaşiye", "Fecr", "Beled",
  "Şems", "Leyl", "Duha", "İnşirah", "Tin", "Alak", "Kadr", "Beyyine", "Zilzal", "Adiyat",
  "Karia", "Tekasür", "Asr", "Hümeze", "Fil", "Kureyş", "Maun", "Kevser", "Kafirun", "Nasr",
  "Tebbet", "İhlas", "Felak", "Nas"
];

const SURAH_START_PAGES = [
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208,
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312,
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404,
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467,
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518,
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549,
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568,
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585,
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594,
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599,
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603,
  603, 604, 604, 604
];

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182,
  201, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582
];

const SAJDAH_AYAHS = new Set([
  '7:206', '13:15', '16:50', '17:109', '19:58', '22:18', '25:60',
  '27:26', '32:15', '38:24', '41:38', '53:62', '84:21', '96:19',
]);

const getJuzFromPage = (page) => {
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (page >= JUZ_START_PAGES[i]) return i + 1;
  }
  return 1;
};

const DEFAULT_ZIKIRLER = [
  { id: 1, name: "Sübhanallah", count: 0, target: 33 },
  { id: 2, name: "Elhamdülillah", count: 0, target: 33 },
  { id: 3, name: "Allahu Ekber", count: 0, target: 33 },
  { id: 4, name: "Kelime-i Tevhid", count: 0, target: 100 },
  { id: 5, name: "İstiğfar", count: 0, target: 100 },
];

const UI_FONT = "'Plus Jakarta Sans', 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, sans-serif";

const READER_THEMES = {
  sepia: {
    label: 'Mushaf',
    screenBg: 'bg-[#f8f2df] text-[#2b2419]',
    frameOuter: 'border-[#6d6249]',
    frameInner: 'border-[#9c8e6e] bg-[#fbf6e9]',
    arabic: 'text-[#1c1710]',
    ayahBadge: 'bg-[#5c5340] text-[#f8f2e2]',
    sajdahBadge: 'bg-[#9b2c2c]/12 text-[#8c1d1d] border-[#9b2c2c]/35',
    mealText: 'text-[#473c2e]',
    pillBtn: 'bg-[#8d7f58] text-[#fdfbf5] hover:bg-[#7b6e4a]',
    pillBtnActive: 'bg-[#5c5340] text-white',
    numBadge: 'bg-[#6b6557] text-white',
    muted: 'text-[#6e624c]',
    divider: 'border-[#e0d5bc]',
    panelBg: 'bg-[#efe6cf] border-[#d8cbb0]',
  },
  dark: {
    label: 'Gece',
    screenBg: 'bg-[#121211] text-zinc-100',
    frameOuter: 'border-[#bfa773]/50',
    frameInner: 'border-[#bfa773]/25 bg-[#181816]',
    arabic: 'text-[#f5eedc]',
    ayahBadge: 'bg-[#bfa773]/25 text-[#e6cf98]',
    sajdahBadge: 'bg-[#bfa773]/20 text-[#f3d999] border-[#bfa773]/50',
    mealText: 'text-zinc-300',
    pillBtn: 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700',
    pillBtnActive: 'bg-[#bfa773] text-zinc-950',
    numBadge: 'bg-zinc-700 text-white',
    muted: 'text-zinc-400',
    divider: 'border-zinc-800',
    panelBg: 'bg-zinc-900 border-zinc-800',
  },
  light: {
    label: 'Aydınlık',
    screenBg: 'bg-white text-zinc-900',
    frameOuter: 'border-zinc-400',
    frameInner: 'border-zinc-300 bg-zinc-50/60',
    arabic: 'text-zinc-950',
    ayahBadge: 'bg-zinc-800 text-white',
    sajdahBadge: 'bg-amber-100 text-amber-900 border-amber-400',
    mealText: 'text-zinc-700',
    pillBtn: 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300',
    pillBtnActive: 'bg-zinc-900 text-white',
    numBadge: 'bg-zinc-700 text-white',
    muted: 'text-zinc-500',
    divider: 'border-zinc-200',
    panelBg: 'bg-zinc-100 border-zinc-200',
  },
};

function App() {
  const { timings, dates, locationName, loading } = usePrayerTimes();
  const { timeLeft, nextPrayer } = useCountdown(timings);
  const { surahs, loading: kuranLoading } = useQuran();

  const [activeTab, setActiveTab] = useState('vakitler');
  const [kuranTab, setKuranTab] = useState('sure');

  const [searchSurah, setSearchSurah] = useState('');
  const [searchJuz, setSearchJuz] = useState('');
  const [searchPage, setSearchPage] = useState('');

  const [activePage, setActivePage] = useState(null);
  const { ayahs, loading: ayahsLoading } = useQuranReader(activePage ? 'page' : null, activePage);
  const [showMeal, setShowMeal] = useState(false);
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const [autoFit, setAutoFit] = useState(true);
  const [fittedFontSize, setFittedFontSize] = useState(20);
  const [manualFontSize, setManualFontSize] = useState(() => {
    const saved = Number(localStorage.getItem('quranFontSize'));
    return saved >= 16 && saved <= 42 ? saved : 26;
  });

  const pageContainerRef = useRef(null);
  const pageContentRef = useRef(null);

  const [readerTheme, setReaderTheme] = useState(() => localStorage.getItem('quranReaderTheme') || 'sepia');

  useEffect(() => {
    localStorage.setItem('quranReaderTheme', readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    localStorage.setItem('quranFontSize', String(manualFontSize));
  }, [manualFontSize]);

  useEffect(() => {
    if (activePage === null || showMeal || ayahsLoading || !ayahs?.length || !autoFit) return;

    let cancelled = false;
    const fitPageToScreen = () => {
      if (cancelled) return;
      const container = pageContainerRef.current;
      const content = pageContentRef.current;
      if (!container || !content) return;

      const availableHeight = container.clientHeight - 8;
      if (availableHeight <= 0) return;

      let low = 11;
      let high = 30;
      let best = 14;

      for (let i = 0; i < 8; i++) {
        const mid = (low + high) / 2;
        content.style.fontSize = `${mid}px`;
        if (content.scrollHeight <= availableHeight) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }

      const finalSize = Math.floor(best * 10) / 10;
      content.style.fontSize = `${finalSize}px`;
      setFittedFontSize(finalSize);
    };

    fitPageToScreen();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitPageToScreen);
    }

    window.addEventListener('resize', fitPageToScreen);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', fitPageToScreen);
    };
  }, [activePage, ayahs, ayahsLoading, showMeal, autoFit, showReaderSettings]);

  const currentFontSize = autoFit && !showMeal ? fittedFontSize : manualFontSize;

  const handleZoomIn = () => {
    const base = autoFit && !showMeal ? Math.round(fittedFontSize) : manualFontSize;
    setAutoFit(false);
    setManualFontSize(Math.min(42, base + 2));
  };

  const handleZoomOut = () => {
    const base = autoFit && !showMeal ? Math.round(fittedFontSize) : manualFontSize;
    setAutoFit(false);
    setManualFontSize(Math.max(14, base - 2));
  };

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('quranPageBookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('quranPageBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const removeBookmark = (e, page) => {
    e.stopPropagation();
    setBookmarks((prev) => prev.filter((b) => b.page !== page));
  };

  const [zikirler, setZikirler] = useState(() => {
    try {
      const saved = localStorage.getItem('ezanTimeZikirler');
      return saved ? JSON.parse(saved) : DEFAULT_ZIKIRLER;
    } catch {
      return DEFAULT_ZIKIRLER;
    }
  });

  const [activeZikirId, setActiveZikirId] = useState(() => {
    const saved = Number(localStorage.getItem('ezanTimeActiveZikirId'));
    return saved || 1;
  });

  useEffect(() => {
    localStorage.setItem('ezanTimeZikirler', JSON.stringify(zikirler));
  }, [zikirler]);

  useEffect(() => {
    localStorage.setItem('ezanTimeActiveZikirId', String(activeZikirId));
  }, [activeZikirId]);

  const [showZikirList, setShowZikirList] = useState(false);
  const [openMenuZikirId, setOpenMenuZikirId] = useState(null);
  const [showAddZikirModal, setShowAddZikirModal] = useState(false);
  const [newZikirName, setNewZikirName] = useState('');
  const [newZikirTarget, setNewZikirTarget] = useState(33);

  const activeZikir = zikirler.find((z) => z.id === activeZikirId) || zikirler[0];
  const isZikirComplete = activeZikir.count >= activeZikir.target;

  // Büyütülmüş Zikir Halkası
  const radius = 112;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((activeZikir.count / activeZikir.target) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const handleZikirClick = () => {
    if (isZikirComplete) return;
    const willComplete = activeZikir.count + 1 >= activeZikir.target;

    if (navigator.vibrate) {
      navigator.vibrate(willComplete ? [40, 60, 100] : 25);
    }

    setZikirler((prev) =>
      prev.map((z) =>
        z.id === activeZikir.id && z.count < z.target ? { ...z, count: z.count + 1 } : z
      )
    );
  };

  const addZikir = (e) => {
    e.preventDefault();
    const trimmed = newZikirName.trim();
    const targetVal = Math.max(1, Number(newZikirTarget) || 33);
    if (!trimmed) return;

    const newItem = { id: Date.now(), name: trimmed, count: 0, target: targetVal };
    setZikirler((prev) => [...prev, newItem]);
    setActiveZikirId(newItem.id);
    setNewZikirName('');
    setNewZikirTarget(33);
    setShowAddZikirModal(false);
  };

  const deleteZikir = (e, id) => {
    e.stopPropagation();
    setOpenMenuZikirId(null);
    if (zikirler.length === 1) return;
    const updated = zikirler.filter((z) => z.id !== id);
    setZikirler(updated);
    if (activeZikirId === id) setActiveZikirId(updated[0].id);
  };

  const resetZikir = (e, id) => {
    e.stopPropagation();
    setOpenMenuZikirId(null);
    setZikirler((prev) => prev.map((z) => (z.id === id ? { ...z, count: 0 } : z)));
  };

  const isTowardsFatihaDisabled = activePage <= 1;
  const isTowardsNasDisabled = activePage >= 604;

  const handleGoTowardsNas = () => !isTowardsNasDisabled && setActivePage((p) => p + 1);
  const handleGoTowardsFatiha = () => !isTowardsFatihaDisabled && setActivePage((p) => p - 1);

  const currentSurahName = ayahs?.[0]?.surahNumber
    ? `${turkceSureIsimleri[ayahs[0].surahNumber - 1]} Suresi`
    : `Sayfa ${activePage}`;

  const currentJuz = activePage ? getJuzFromPage(activePage) : 1;

  const toggleBookmark = () => {
    const exists = bookmarks.some((b) => b.page === activePage);
    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.page !== activePage));
    } else {
      setBookmarks((prev) => [...prev, { page: activePage, title: currentSurahName, juz: currentJuz }]);
    }
  };
  const isBookmarked = bookmarks.some((b) => b.page === activePage);

  const searchStr = searchSurah.toLocaleLowerCase('tr-TR');
  const filteredSurahs = surahs.filter(
    (sure) =>
      turkceSureIsimleri[sure.number - 1].toLocaleLowerCase('tr-TR').includes(searchStr) ||
      sure.number.toString() === searchSurah.trim()
  );
  const juzList = Array.from({ length: 30 }, (_, i) => i + 1).filter((j) => j.toString().includes(searchJuz.trim()));
  const pageList = Array.from({ length: 604 }, (_, i) => i + 1).filter((p) => p.toString().includes(searchPage.trim()));

  const theme = READER_THEMES[readerTheme] || READER_THEMES.sepia;

  // 1. TAM EKRAN MUSHAF OKUMA EKRANI
  if (activeTab === 'kuran' && activePage !== null) {
    return (
      <div
        className={`h-[100dvh] w-full overflow-hidden flex flex-col items-center transition-colors duration-300 ${theme.screenBg}`}
        style={{ fontFamily: UI_FONT }}
      >
        <div className="w-full max-w-md h-full flex flex-col px-3.5 pt-3 pb-3">
          {/* Üst Bar: Sol Ana Sayfa | Sağ Sayfa Rozeti & Ayraç */}
          <header className="flex items-center justify-between mb-2 shrink-0">
            <button
              onClick={() => {
                setActivePage(null);
                setShowReaderSettings(false);
              }}
              aria-label="Listeye Dön"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95 ${theme.pillBtn}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold tabular-nums shadow-sm ${theme.numBadge}`}
              >
                {activePage}
              </div>
              <button
                onClick={toggleBookmark}
                aria-label="Sayfayı İşaretle"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-transform active:scale-95 ${
                  isBookmarked ? theme.pillBtnActive : theme.pillBtn
                }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </button>
            </div>
          </header>

          {/* Görünüm ve Büyütme Ayarları Paneli */}
          {showReaderSettings && (
            <div className={`mb-2 p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2 shrink-0 ${theme.panelBg}`}>
              <div className="flex items-center gap-1.5">
                <button onClick={handleZoomOut} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.pillBtn}`}>
                  A-
                </button>
                <button onClick={handleZoomIn} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${theme.pillBtn}`}>
                  A+
                </button>
                {!showMeal && (
                  <button
                    onClick={() => setAutoFit(true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      autoFit ? theme.pillBtnActive : theme.pillBtn
                    }`}
                  >
                    Sığdır
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {Object.entries(READER_THEMES).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setReaderTheme(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      readerTheme === key ? theme.pillBtnActive : theme.pillBtn
                    }`}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Çerçeve Üstü Klasik Mushaf Başlık Satırı */}
          <div className={`flex items-center justify-between px-1.5 mb-1.5 text-xs font-semibold shrink-0 ${theme.muted}`}>
            <span>Sayfa {activePage}</span>
            <span className="text-sm font-bold tracking-wide truncate max-w-[180px]">{currentSurahName}</span>
            <span>Cüz {currentJuz}</span>
          </div>

          {/* Çift Çizgili Klasik Mushaf Çerçevesi */}
          <div className={`flex-1 min-h-0 border-2 p-[3px] rounded-sm flex flex-col overflow-hidden ${theme.frameOuter}`}>
            <div
              ref={pageContainerRef}
              className={`flex-1 min-h-0 border px-3.5 py-2.5 flex flex-col [&::-webkit-scrollbar]:hidden ${
                !showMeal && autoFit ? 'overflow-hidden justify-center' : 'overflow-y-auto'
              } ${theme.frameInner}`}
            >
              {ayahsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <p className={`animate-pulse text-sm font-medium ${theme.muted}`}>Sayfa yükleniyor...</p>
                </div>
              ) : !showMeal ? (
                <div
                  ref={pageContentRef}
                  className="text-justify w-full"
                  dir="rtl"
                  style={{
                    fontFamily: "'Amiri', 'Traditional Arabic', serif",
                    fontSize: `${currentFontSize}px`,
                    lineHeight: 1.95,
                  }}
                >
                  {ayahs.map((ayah, i) => {
                    const isNewSurah = i === 0 ? ayah.number === 1 : ayah.surahNumber !== ayahs[i - 1].surahNumber;
                    const isSajdah = SAJDAH_AYAHS.has(`${ayah.surahNumber}:${ayah.number}`);

                    return (
                      <span key={`${ayah.surahNumber}-${ayah.number}-${i}`}>
                        {isNewSurah && (
                          <div className="w-full flex justify-center my-[0.35em]" dir="ltr">
                            <span className={`px-4 py-[0.15em] rounded-full text-[0.58em] font-sans font-bold border leading-tight ${theme.panelBg}`}>
                              {turkceSureIsimleri[ayah.surahNumber - 1]} Suresi
                            </span>
                          </div>
                        )}
                        <span className={`inline ${theme.arabic}`}>
                          {ayah.textAr}
                          <span
                            className={`inline-flex items-center justify-center w-[1.15em] h-[1.15em] rounded-full text-[0.52em] font-sans font-bold mx-[0.2em] align-middle leading-none ${theme.ayahBadge}`}
                          >
                            {ayah.number}
                          </span>
                          {isSajdah && (
                            <span
                              title="Tilavet Secdesi Ayeti"
                              dir="ltr"
                              className={`inline-flex items-center gap-0.5 px-[0.35em] py-[0.05em] rounded-full text-[0.48em] font-sans font-bold border mx-[0.2em] align-middle leading-tight ${theme.sajdahBadge}`}
                            >
                              <span>۩</span>
                              <span>Secde</span>
                            </span>
                          )}
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-1">
                  {ayahs.map((ayah, i) => {
                    const isNewSurah = i === 0 ? ayah.number === 1 : ayah.surahNumber !== ayahs[i - 1].surahNumber;
                    const isSajdah = SAJDAH_AYAHS.has(`${ayah.surahNumber}:${ayah.number}`);

                    return (
                      <div key={i} className={`flex flex-col gap-2 border-b pb-4 last:border-0 ${theme.divider}`}>
                        {isNewSurah && (
                          <div>
                            <span className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${theme.panelBg}`}>
                              {turkceSureIsimleri[ayah.surahNumber - 1]} Suresi
                            </span>
                          </div>
                        )}
                        <div className="flex justify-end items-start gap-2.5">
                          <p
                            className={`text-right ${theme.arabic}`}
                            dir="rtl"
                            style={{
                              fontFamily: "'Amiri', 'Traditional Arabic', serif",
                              fontSize: `${manualFontSize}px`,
                              lineHeight: 2.05,
                            }}
                          >
                            {ayah.textAr}
                          </p>
                          <div className="flex flex-col items-center gap-1 mt-1.5 shrink-0">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${theme.ayahBadge}`}>
                              {ayah.number}
                            </span>
                            {isSajdah && (
                              <span title="Tilavet Secdesi Ayeti" className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${theme.sajdahBadge}`}>
                                ۩
                              </span>
                            )}
                          </div>
                        </div>
                        {isSajdah && (
                          <div className="flex items-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${theme.sajdahBadge}`}>
                              <span>۩</span> Secde Ayeti
                            </span>
                          </div>
                        )}
                        <p className={`text-[15px] leading-relaxed text-left ${theme.mealText}`}>{ayah.textTr}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Alt 4'lü Kontrol Çubuğu (Sol: Nas'a doğru | Sağ: Fatiha'ya doğru) */}
          <footer className="grid grid-cols-4 gap-3 pt-3 shrink-0">
            <button
              onClick={handleGoTowardsNas}
              disabled={isTowardsNasDisabled}
              title="Sonraki Sayfa (Nas'a doğru)"
              className={`h-12 rounded-2xl flex items-center justify-center shadow-sm disabled:opacity-35 transition-transform active:scale-95 ${theme.pillBtn}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => setShowMeal(!showMeal)}
              title={showMeal ? 'Mushaf Görünümü' : 'Meal Görünümü'}
              className={`h-12 rounded-2xl flex items-center justify-center text-xs font-bold shadow-sm transition-transform active:scale-95 ${
                showMeal ? theme.pillBtnActive : theme.pillBtn
              }`}
            >
              {showMeal ? 'Mushaf' : 'Meal'}
            </button>

            <button
              onClick={() => setShowReaderSettings(!showReaderSettings)}
              title="Yazı Boyutu ve Tema"
              className={`h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm transition-transform active:scale-95 ${
                showReaderSettings ? theme.pillBtnActive : theme.pillBtn
              }`}
            >
              Aa
            </button>

            <button
              onClick={handleGoTowardsFatiha}
              disabled={isTowardsFatihaDisabled}
              title="Önceki Sayfa (Fatiha'ya doğru)"
              className={`h-12 rounded-2xl flex items-center justify-center shadow-sm disabled:opacity-35 transition-transform active:scale-95 ${theme.pillBtn}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </footer>
        </div>
      </div>
    );
  }

  // 2. İŞARETLERİM EKRANI
  if (activeTab === 'kuran' && showBookmarks) {
    return (
      <div
        className="min-h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-5"
        style={{ fontFamily: UI_FONT }}
      >
        <div className="w-full max-w-md flex flex-col flex-1">
          <header className="relative flex items-center justify-center py-2 mb-6">
            <button
              onClick={() => setShowBookmarks(false)}
              aria-label="Geri"
              className="absolute left-0 p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">İşaretlerim</h1>
          </header>

          {bookmarks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-zinc-200">Henüz işaretli sayfa yok</p>
              <p className="text-sm text-zinc-400 mt-1.5">
                Okuma ekranının sağ üstündeki ayraç ikonuna dokunarak sayfaları buraya ekleyebilirsin.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {bookmarks.map((bm) => (
                <div
                  key={bm.page}
                  onClick={() => {
                    setActivePage(bm.page);
                    setShowBookmarks(false);
                  }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 hover:border-[#bfa773]/40 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#bfa773]/15 border border-[#bfa773]/30 flex items-center justify-center text-sm font-bold text-[#e2cb96] tabular-nums shrink-0">
                      {bm.page}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-zinc-100 truncate">{bm.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Cüz {bm.juz || getJuzFromPage(bm.page)} • Sayfa {bm.page}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => removeBookmark(e, bm.page)}
                    aria-label="İşareti Sil"
                    className="p-2.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. ZİKİRLER LİSTESİ EKRANI
  if (activeTab === 'zikir' && showZikirList) {
    return (
      <div
        onClick={() => setOpenMenuZikirId(null)}
        className="min-h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col items-center px-4 py-5"
        style={{ fontFamily: UI_FONT }}
      >
        <div className="w-full max-w-md flex flex-col flex-1 relative pb-20">
          <header className="relative flex items-center justify-center py-2 mb-6">
            <button
              onClick={() => setShowZikirList(false)}
              aria-label="Geri"
              className="absolute left-0 p-2 text-zinc-300 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white">Zikirler</h1>
          </header>

          <div className="flex flex-col gap-3">
            {zikirler.map((z) => {
              const isCompleted = z.count >= z.target;
              const isSelected = z.id === activeZikir.id;
              return (
                <div
                  key={z.id}
                  onClick={() => {
                    setActiveZikirId(z.id);
                    setShowZikirList(false);
                  }}
                  className={`relative flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-zinc-900 border border-zinc-800' : 'hover:bg-zinc-900/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 tabular-nums ${
                        isCompleted ? 'bg-lime-500 text-zinc-950' : 'bg-amber-400 text-zinc-950'
                      }`}
                    >
                      {z.count}
                    </div>
                    <span className="text-base font-medium text-zinc-100 truncate">
                      {z.name} <span className="text-zinc-400 font-normal">({z.target})</span>
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuZikirId(openMenuZikirId === z.id ? null : z.id);
                    }}
                    aria-label="Seçenekler"
                    className="p-2 text-zinc-400 hover:text-white rounded-xl transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>

                  {openMenuZikirId === z.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-3 top-14 z-30 w-36 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-150"
                    >
                      {zikirler.length > 1 && (
                        <button
                          onClick={(e) => deleteZikir(e, z.id)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-zinc-800 transition-colors"
                        >
                          Sil
                        </button>
                      )}
                      <button
                        onClick={(e) => resetZikir(e, z.id)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-800 transition-colors"
                      >
                        Sıfırla
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddZikirModal(true);
            }}
            className="fixed bottom-8 right-6 md:right-[calc(50%-12rem)] flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#bfa773] hover:bg-[#d4ba82] text-zinc-950 font-semibold text-sm shadow-xl active:scale-95 transition-all"
          >
            <span className="text-lg leading-none">+</span>
            <span>Yeni</span>
          </button>
        </div>

        {showAddZikirModal && (
          <div
            onClick={() => setShowAddZikirModal(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <form
              onSubmit={addZikir}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl"
            >
              <h2 className="text-lg font-semibold text-white">Yeni Zikir Ekle</h2>
              <input
                type="text"
                autoFocus
                placeholder="Zikir adı (Örn: Salavat)"
                value={newZikirName}
                onChange={(e) => setNewZikirName(e.target.value)}
                className="bg-zinc-950 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 text-sm outline-none border border-zinc-800 focus:border-[#bfa773]"
              />
              <input
                type="number"
                min="1"
                placeholder="Hedef sayı (Örn: 100)"
                value={newZikirTarget}
                onChange={(e) => setNewZikirTarget(e.target.value)}
                className="bg-zinc-950 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 text-sm outline-none border border-zinc-800 focus:border-[#bfa773]"
              />
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddZikirModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#bfa773] text-zinc-950 text-sm font-semibold hover:bg-[#d4ba82]"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-between px-4 pt-3 pb-24 overflow-hidden selection:bg-[#bfa773]/30"
      style={{ fontFamily: UI_FONT }}
    >
      {/* 1. VAKİTLER (Tüm 6 Vakit Tek Ekranda, Yatsı Dahil Görünür) */}
      {activeTab === 'vakitler' && (
        <main className="w-full max-w-md h-full flex flex-col justify-between gap-2.5 animate-in fade-in duration-300">
          {/* Üst Bilgi: Konum ve Tarih */}
          <header className="flex flex-col items-center text-center shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-1">
              <svg className="w-3.5 h-3.5 text-[#bfa773]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm font-semibold text-zinc-100">{locationName || 'Konum Alınıyor'}</span>
            </div>
            {dates && (
              <p className="text-xs text-zinc-400 font-medium">
                {dates.gregorian} <span className="mx-1.5 text-zinc-700">•</span>
                <span className="text-[#e2cb96]">{dates.hijri}</span>
              </p>
            )}
          </header>

          {/* Geri Sayım Kartı */}
          <section className="rounded-[2rem] bg-zinc-900/90 border border-zinc-800/90 py-4 px-5 flex flex-col items-center text-center shadow-xl shrink-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
              {nextPrayer ? `${nextPrayer} Vaktine Kalan` : 'Vakit Hesaplanıyor'}
            </span>
            <div className="text-5xl font-semibold tracking-tight text-white tabular-nums">
              {timeLeft || '--:--:--'}
            </div>
          </section>

          {/* 6 Namaz Vakti (Ekrana Tam Sığan, Büyük ve Net Fontlu Liste) */}
          <section className="flex-1 min-h-0 rounded-[2rem] bg-zinc-900/90 border border-zinc-800/90 p-3 shadow-xl flex flex-col justify-between">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-zinc-400 animate-pulse">
                Vakitler yükleniyor...
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between gap-1.5">
                {timings &&
                  Object.entries(timings).map(([vakit, saat]) => {
                    const isNext = vakit === nextPrayer;
                    return (
                      <div
                        key={vakit}
                        className={`flex-1 flex items-center justify-between rounded-2xl px-5 transition-all ${
                          isNext
                            ? 'bg-[#bfa773]/18 border border-[#bfa773]/45 text-white'
                            : 'bg-zinc-950/55 border border-transparent text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isNext ? 'bg-[#e2cb96] shadow-[0_0_8px_#bfa773]' : 'bg-zinc-700'
                            }`}
                          />
                          <span className={`text-[17px] ${isNext ? 'font-bold text-white' : 'font-semibold'}`}>
                            {vakit}
                          </span>
                        </div>
                        <span
                          className={`text-[19px] tabular-nums ${
                            isNext ? 'font-bold text-[#e2cb96]' : 'font-semibold text-zinc-100'
                          }`}
                        >
                          {saat}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* 2. ZİKİRMATİK SAYAÇ EKRANI (Ortalanmış Başlık & Büyük Dokunma Butonu) */}
      {activeTab === 'zikir' && (
        <main className="w-full max-w-md h-full flex flex-col justify-center animate-in fade-in duration-300">
          <section className="rounded-[2rem] bg-zinc-900/90 border border-zinc-800/90 px-6 py-7 flex flex-col items-center shadow-xl">
            {/* Üstte Zikirler Butonu */}
            <div className="w-full flex justify-end mb-2">
              <button
                onClick={() => setShowZikirList(true)}
                className="px-4 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-[#bfa773]/50 transition-colors"
              >
                Zikirler ({zikirler.length})
              </button>
            </div>

            {/* Ortalanmış Seçili Zikir Başlığı */}
            <div className="text-center mb-6 px-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{activeZikir.name}</h2>
              <p className="text-sm text-[#e2cb96] font-semibold mt-1">Hedef: {activeZikir.target}</p>
            </div>

            {/* Büyütülmüş İlerleme Halkası ve Dokunma Butonu */}
            <div className="relative flex items-center justify-center mb-7">
              <svg className="w-[272px] h-[272px] -rotate-90">
                <circle cx="136" cy="136" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle
                  cx="136"
                  cy="136"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`transition-all duration-300 ease-out ${
                    isZikirComplete ? 'text-lime-400 drop-shadow-[0_0_12px_rgba(163,230,53,0.5)]' : 'text-[#bfa773]'
                  }`}
                />
              </svg>

              <button
                onClick={handleZikirClick}
                disabled={isZikirComplete}
                aria-label="Zikir sayacını artır"
                className={`absolute flex flex-col items-center justify-center w-[200px] h-[200px] rounded-full transition-all active:scale-95 ${
                  isZikirComplete
                    ? 'bg-lime-500/15 border border-lime-500/40'
                    : 'bg-zinc-950/75 border border-zinc-800 hover:bg-zinc-800/50 shadow-inner'
                }`}
              >
                <span className={`text-7xl font-semibold tracking-tight tabular-nums ${isZikirComplete ? 'text-lime-400' : 'text-white'}`}>
                  {activeZikir.count}
                </span>
                {isZikirComplete ? (
                  <span className="mt-2 px-3 py-0.5 rounded-full bg-lime-500/20 text-xs font-semibold text-lime-300">
                    ✓ Tamamlandı
                  </span>
                ) : (
                  <span className="mt-2 text-xs text-zinc-400 font-medium">Dokun</span>
                )}
              </button>
            </div>

            <button
              onClick={(e) => resetZikir(e, activeZikir.id)}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              Sayacı Sıfırla
            </button>
          </section>
        </main>
      )}

      {/* 3. KUR'AN-I KERİM LİSTE EKRANI */}
      {activeTab === 'kuran' && (
        <main className="w-full max-w-md h-full flex flex-col animate-in fade-in duration-300">
          <div className="rounded-[2rem] bg-zinc-900/90 border border-zinc-800/90 p-5 shadow-xl flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-xl font-bold text-white pl-1">Kur'an-ı Kerim</h2>
              <button
                onClick={() => setShowBookmarks(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-[#bfa773]/50 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-[#bfa773]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                <span>İşaretlerim ({bookmarks.length})</span>
              </button>
            </div>

            <div className="flex p-1 bg-zinc-950 rounded-2xl mb-4 border border-zinc-800 shrink-0">
              {[
                { id: 'sure', label: 'Sure' },
                { id: 'cuz', label: 'Cüz' },
                { id: 'sayfa', label: 'Sayfa' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setKuranTab(tab.id);
                    setSearchSurah('');
                    setSearchJuz('');
                    setSearchPage('');
                  }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    kuranTab === tab.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {kuranTab === 'sure' &&
                (kuranLoading ? (
                  <div className="py-12 text-center text-sm text-zinc-400 animate-pulse">Sureler yükleniyor...</div>
                ) : (
                  <div className="flex flex-col gap-2 pb-4">
                    <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                      <input
                        type="text"
                        placeholder="Sure adı veya numarası ara..."
                        value={searchSurah}
                        onChange={(e) => setSearchSurah(e.target.value)}
                        className="w-full bg-zinc-950 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-[#bfa773]/60"
                      />
                    </div>
                    {filteredSurahs.map((sure) => {
                      const startPage = SURAH_START_PAGES[sure.number - 1];
                      return (
                        <button
                          key={sure.number}
                          onClick={() => setActivePage(startPage)}
                          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950/55 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-all text-left active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 tabular-nums">
                              {sure.number}
                            </div>
                            <div>
                              <p className="text-[15px] font-semibold text-zinc-100">{turkceSureIsimleri[sure.number - 1]}</p>
                              <p className="text-xs text-zinc-400">
                                {sure.numberOfAyahs} Ayet • Sayfa {startPage}
                              </p>
                            </div>
                          </div>
                          <span className="text-zinc-500 text-lg">›</span>
                        </button>
                      );
                    })}
                    {filteredSurahs.length === 0 && <p className="text-center text-zinc-400 text-sm py-6">Sure bulunamadı.</p>}
                  </div>
                ))}

              {kuranTab === 'cuz' && (
                <div className="flex flex-col gap-2 pb-4">
                  <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                    <input
                      type="number"
                      placeholder="Cüz numarası ara (1-30)..."
                      value={searchJuz}
                      onChange={(e) => setSearchJuz(e.target.value)}
                      className="w-full bg-zinc-950 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-[#bfa773]/60"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {juzList.map((juzNo) => {
                      const startPage = JUZ_START_PAGES[juzNo - 1];
                      return (
                        <button
                          key={juzNo}
                          onClick={() => setActivePage(startPage)}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-950/55 hover:bg-zinc-800/60 border border-zinc-800/60 transition-all active:scale-95"
                        >
                          <span className="text-xl font-bold text-[#e2cb96] tabular-nums">{juzNo}</span>
                          <span className="text-xs text-zinc-400 mt-0.5">Sayfa {startPage}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {kuranTab === 'sayfa' && (
                <div className="flex flex-col gap-2 pb-4">
                  <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                    <input
                      type="number"
                      placeholder="Sayfa numarası ara (1-604)..."
                      value={searchPage}
                      onChange={(e) => setSearchPage(e.target.value)}
                      className="w-full bg-zinc-950 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-zinc-800 focus:border-[#bfa773]/60"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {pageList.map((pageNo) => (
                      <button
                        key={pageNo}
                        onClick={() => setActivePage(pageNo)}
                        className="py-3 rounded-2xl bg-zinc-950/55 hover:bg-zinc-800/60 border border-zinc-800/60 text-sm font-semibold text-zinc-200 tabular-nums active:scale-95 transition-all"
                      >
                        {pageNo}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* SABİT ALT SEKME ÇUBUĞU */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm rounded-3xl bg-zinc-900/88 backdrop-blur-xl border border-zinc-800/90 p-1.5 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('vakitler')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
            activeTab === 'vakitler' ? 'bg-[#bfa773]/18 text-[#e2cb96]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="text-[11px] font-semibold">Vakitler</span>
        </button>

        <button
          onClick={() => setActiveTab('zikir')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
            activeTab === 'zikir' ? 'bg-[#bfa773]/18 text-[#e2cb96]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-[11px] font-semibold">Zikir</span>
        </button>

        <button
          onClick={() => setActiveTab('kuran')}
          className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all ${
            activeTab === 'kuran' ? 'bg-[#bfa773]/18 text-[#e2cb96]' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="text-[11px] font-semibold">Kur'an</span>
        </button>
      </nav>
    </div>
  );
}

export default App;