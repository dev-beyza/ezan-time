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

const UI_FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif";

const READER_THEMES = {
  sepia: {
    label: 'Mushaf',
    screenBg: 'bg-[#f8f2df] text-[#2b2419]',
    frameOuter: 'border-[#6d6249]',
    frameInner: 'border-[#9c8e6e] bg-[#fbf6e9]',
    arabic: 'text-[#1c1710]',
    ayahBadge: 'bg-[#5c5340] text-[#f8f2e2]',
    sajdahBadge: 'bg-[#2b2419]/10 text-[#2b2419] border-[#2b2419]/30',
    mealText: 'text-[#473c2e]',
    pillBtn: 'bg-[#8d7f58] text-[#fdfbf5] hover:bg-[#7b6e4a]',
    pillBtnActive: 'bg-[#2b2419] text-[#f8f2df]',
    numBadge: 'bg-[#6b6557] text-white',
    muted: 'text-[#6e624c]',
    divider: 'border-[#e0d5bc]',
    panelBg: 'bg-[#efe6cf] border-[#d8cbb0]',
  },
  dark: {
    label: 'Gece',
    screenBg: 'bg-[#0e0e11] text-zinc-100',
    frameOuter: 'border-white/25',
    frameInner: 'border-white/10 bg-[#151519]',
    arabic: 'text-zinc-100',
    ayahBadge: 'bg-white/15 text-zinc-100',
    sajdahBadge: 'bg-white/10 text-zinc-200 border-white/25',
    mealText: 'text-zinc-300',
    pillBtn: 'bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700',
    pillBtnActive: 'bg-[#E5E5EA] text-zinc-950',
    numBadge: 'bg-zinc-700 text-white',
    muted: 'text-zinc-400',
    divider: 'border-white/10',
    panelBg: 'bg-[#1c1c22] border-white/10',
  },
  light: {
    label: 'Aydınlık',
    screenBg: 'bg-[#f5f5f7] text-zinc-900',
    frameOuter: 'border-zinc-400',
    frameInner: 'border-zinc-300 bg-white',
    arabic: 'text-zinc-950',
    ayahBadge: 'bg-zinc-900 text-white',
    sajdahBadge: 'bg-zinc-900/10 text-zinc-900 border-zinc-900/25',
    mealText: 'text-zinc-700',
    pillBtn: 'bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-100',
    pillBtnActive: 'bg-zinc-900 text-white',
    numBadge: 'bg-zinc-800 text-white',
    muted: 'text-zinc-500',
    divider: 'border-zinc-200',
    panelBg: 'bg-white border-zinc-200',
  },
};

function App() {
  const { timings, dates, locationName, loading } = usePrayerTimes();
  const { timeLeft, nextPrayer } = useCountdown(timings);
  const { surahs, loading: kuranLoading } = useQuran();

  const [activeTab, setActiveTab] = useState('vakitler');
  const [kuranSection, setKuranSection] = useState(null);

  const [searchSurah, setSearchSurah] = useState('');
  const [searchJuz, setSearchJuz] = useState('');
  const [searchPage, setSearchPage] = useState('');

  const [activePage, setActivePage] = useState(null);
  const { ayahs, loading: ayahsLoading } = useQuranReader(activePage ? 'page' : null, activePage);
  const [showMeal, setShowMeal] = useState(false);
  const [showReaderSettings, setShowReaderSettings] = useState(false);

  // Otomatik Tam Sayfa Sığdırma & Pinch-to-Zoom
  const [autoFit, setAutoFit] = useState(true);
  const [fittedFontSize, setFittedFontSize] = useState(20);
  const [manualFontSize, setManualFontSize] = useState(() => {
    const saved = Number(localStorage.getItem('quranFontSize'));
    return saved >= 14 && saved <= 44 ? saved : 26;
  });

  const pageContainerRef = useRef(null);
  const pageContentRef = useRef(null);
  const pinchRef = useRef(null);

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
    setManualFontSize(Math.min(44, base + 2));
  };

  const handleZoomOut = () => {
    const base = autoFit && !showMeal ? Math.round(fittedFontSize) : manualFontSize;
    setAutoFit(false);
    setManualFontSize(Math.max(14, base - 2));
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handlePinchStart = (e) => {
    if (e.touches.length === 2) {
      pinchRef.current = {
        distance: getTouchDistance(e.touches),
        startSize: currentFontSize,
      };
    }
  };

  const handlePinchMove = (e) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const newDist = getTouchDistance(e.touches);
      const scale = newDist / pinchRef.current.distance;
      const nextSize = Math.min(44, Math.max(14, Math.round(pinchRef.current.startSize * scale)));
      setAutoFit(false);
      setManualFontSize(nextSize);
    }
  };

  const handlePinchEnd = () => {
    pinchRef.current = null;
  };

  // Ayraçlar
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

  // Zikirmatik State'leri
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
  const [tapPulse, setTapPulse] = useState(false);

  const activeZikir = zikirler.find((z) => z.id === activeZikirId) || zikirler[0];
  const isZikirComplete = activeZikir.count >= activeZikir.target;

  const radius = 118;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((activeZikir.count / activeZikir.target) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const handleZikirClick = () => {
    if (isZikirComplete) return;
    const willComplete = activeZikir.count + 1 >= activeZikir.target;

    setTapPulse(true);
    setTimeout(() => setTapPulse(false), 260);

    if (navigator.vibrate) {
      navigator.vibrate(willComplete ? [40, 60, 100] : 22);
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

  // Mushaf Sayfa Yönü (Sol: Nas'a doğru | Sağ: Fatiha'ya doğru)
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

  const kuranSectionTitles = {
    sure: 'Sureler',
    sayfa: 'Sayfa',
    cuz: 'Cüz',
    isaretler: 'İşaretlerim',
  };

  // 1. TAM EKRAN MUSHAF OKUMA EKRANI
  if (activeTab === 'kuran' && activePage !== null) {
    return (
      <div
        className={`h-[100dvh] w-full overflow-hidden flex flex-col items-center transition-colors duration-300 ${theme.screenBg}`}
        style={{ fontFamily: UI_FONT }}
      >
        <div className="w-full max-w-md h-full flex flex-col px-3.5 pt-3 pb-3">
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

          <div className={`flex items-center justify-between px-1.5 mb-1.5 text-xs font-semibold shrink-0 ${theme.muted}`}>
            <span>Sayfa {activePage}</span>
            <span className="text-sm font-bold tracking-wide truncate max-w-[180px]">{currentSurahName}</span>
            <span>Cüz {currentJuz}</span>
          </div>

          <div
            onTouchStart={handlePinchStart}
            onTouchMove={handlePinchMove}
            onTouchEnd={handlePinchEnd}
            className={`relative flex-1 min-h-0 border-2 p-[3px] rounded-sm flex flex-col overflow-hidden ${theme.frameOuter}`}
          >
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

            {!showMeal && !autoFit && (
              <button
                onClick={() => setAutoFit(true)}
                className={`absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95 ${theme.pillBtnActive}`}
              >
                Sayfaya Sığdır
              </button>
            )}
          </div>

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

  // 2. ZİKİRLER LİSTESİ EKRANI
  if (activeTab === 'zikir' && showZikirList) {
    return (
      <div
        onClick={() => setOpenMenuZikirId(null)}
        className="min-h-[100dvh] w-full bg-[#0b0b0e] text-zinc-100 flex flex-col items-center px-4 py-5"
        style={{ fontFamily: UI_FONT }}
      >
        <div className="w-full max-w-md flex flex-col flex-1 relative pb-20">
          <header className="relative flex items-center justify-center py-2 mb-6">
            <button
              onClick={() => setShowZikirList(false)}
              aria-label="Geri"
              className="absolute left-0 p-2.5 rounded-2xl bg-[#16161a] border border-white/[0.06] text-zinc-300 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-white">Zikirler</h1>
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
                  className={`relative flex items-center justify-between px-4 py-3.5 rounded-3xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1c1c22] border border-white/25'
                      : 'bg-[#16161a] hover:bg-[#1c1c22] border border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 tabular-nums ${
                        isCompleted ? 'bg-[#34C759] text-zinc-950' : 'bg-[#FF9500] text-zinc-950'
                      }`}
                    >
                      {z.count}
                    </div>
                    <span className="text-base font-semibold text-zinc-100 truncate">
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
                      className="absolute right-3 top-14 z-30 w-36 rounded-2xl bg-[#1e1e24] border border-white/10 shadow-2xl py-1.5 flex flex-col"
                    >
                      {zikirler.length > 1 && (
                        <button
                          onClick={(e) => deleteZikir(e, z.id)}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-white/5 transition-colors"
                        >
                          Sil
                        </button>
                      )}
                      <button
                        onClick={(e) => resetZikir(e, z.id)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-white/5 transition-colors"
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
            className="fixed bottom-8 right-6 md:right-[calc(50%-12rem)] flex items-center gap-2 px-5 py-3.5 rounded-full bg-[#E5E5EA] hover:bg-white text-zinc-950 font-bold text-sm shadow-xl active:scale-95 transition-all"
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
              className="w-full max-w-sm rounded-[2rem] bg-[#16161a] border border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
            >
              <h2 className="text-lg font-bold text-white">Yeni Zikir Ekle</h2>
              <input
                type="text"
                autoFocus
                placeholder="Zikir adı (Örn: Salavat)"
                value={newZikirName}
                onChange={(e) => setNewZikirName(e.target.value)}
                className="bg-[#0b0b0e] rounded-2xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm outline-none border border-white/10 focus:border-white/40"
              />
              <input
                type="number"
                min="1"
                placeholder="Hedef sayı (Örn: 100)"
                value={newZikirTarget}
                onChange={(e) => setNewZikirTarget(e.target.value)}
                className="bg-[#0b0b0e] rounded-2xl px-4 py-3.5 text-white placeholder-zinc-500 text-sm outline-none border border-white/10 focus:border-white/40"
              />
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddZikirModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-zinc-300 text-sm font-semibold hover:bg-white/10"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl bg-[#E5E5EA] text-zinc-950 text-sm font-bold hover:bg-white"
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
      className="h-[100dvh] w-full bg-[#0b0b0e] text-zinc-100 flex flex-col items-center justify-between px-4 pt-3 pb-20 overflow-hidden selection:bg-white/20"
      style={{ fontFamily: UI_FONT }}
    >
      {/* 1. VAKİTLER */}
      {activeTab === 'vakitler' && (
        <main className="w-full max-w-md h-full flex flex-col justify-between gap-2.5">
          <header className="flex flex-col items-center text-center shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#16161a] border border-white/[0.08] mb-1">
              <svg className="w-3.5 h-3.5 text-[#E5E5EA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm font-semibold text-zinc-100">{locationName || 'Konum Alınıyor'}</span>
            </div>
            {dates && (
              <p className="text-xs text-zinc-400 font-medium">
                {dates.gregorian} <span className="mx-1.5 text-zinc-700">•</span>
                <span className="text-zinc-200">{dates.hijri}</span>
              </p>
            )}
          </header>

          <section className="rounded-[2rem] bg-[#16161a] border border-white/[0.07] py-4 px-5 flex flex-col items-center text-center shadow-lg shrink-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
              {nextPrayer ? `${nextPrayer} Vaktine Kalan` : 'Vakit Hesaplanıyor'}
            </span>
            <div className="text-5xl font-bold tracking-tight text-white tabular-nums">
              {timeLeft || '--:--:--'}
            </div>
          </section>

          <section className="flex-1 min-h-0 rounded-[2rem] bg-[#16161a] border border-white/[0.07] p-3 shadow-lg flex flex-col justify-between">
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
                            ? 'bg-white/[0.11] border border-white/25 text-white'
                            : 'bg-[#0f0f13] border border-transparent text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isNext ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]' : 'bg-zinc-700'
                            }`}
                          />
                          <span className={`text-[17px] ${isNext ? 'font-bold text-white' : 'font-semibold'}`}>
                            {vakit}
                          </span>
                        </div>
                        <span
                          className={`text-[19px] tabular-nums ${
                            isNext ? 'font-bold text-white' : 'font-semibold text-zinc-200'
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

      {/* 2. ZİKİRMATİK */}
      {activeTab === 'zikir' && (
        <main className="w-full max-w-md h-full flex flex-col justify-between py-1">
          <div className="flex justify-end">
            <button
              onClick={() => setShowZikirList(true)}
              className="px-4 py-2 rounded-2xl bg-[#16161a] border border-white/[0.08] text-xs font-semibold text-zinc-200 hover:border-white/30 transition-colors"
            >
              Zikirler ({zikirler.length})
            </button>
          </div>

          <section className="flex-1 flex flex-col items-center justify-center rounded-[2.25rem] bg-[#16161a] border border-white/[0.07] px-6 py-6 my-2 shadow-xl">
            <div className="text-center mb-8 px-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">{activeZikir.name}</h2>
              <p className="text-sm text-zinc-400 font-semibold mt-1 tabular-nums">
                {activeZikir.count} / {activeZikir.target}
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div
                className={`absolute w-[224px] h-[224px] rounded-full pointer-events-none transition-all duration-300 ${
                  tapPulse
                    ? 'scale-125 opacity-0 border-2 border-[#FF9500]'
                    : 'scale-100 opacity-0 border-2 border-transparent'
                }`}
              />

              <svg className="w-[280px] h-[280px] -rotate-90">
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="9"
                  fill="transparent"
                  className="text-white/[0.07]"
                />
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="9"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className={`transition-all duration-300 ease-out ${
                    isZikirComplete
                      ? 'text-[#34C759] drop-shadow-[0_0_14px_rgba(52,199,89,0.45)]'
                      : 'text-[#FF9500] drop-shadow-[0_0_10px_rgba(255,149,0,0.35)]'
                  }`}
                />
              </svg>

              <button
                onClick={handleZikirClick}
                disabled={isZikirComplete}
                aria-label="Zikir sayacını artır"
                className={`absolute flex flex-col items-center justify-center w-[210px] h-[210px] rounded-full transition-all duration-150 select-none ${
                  tapPulse ? 'scale-[0.94]' : 'scale-100'
                } ${
                  isZikirComplete
                    ? 'bg-[#34C759]/15 border border-[#34C759]/40'
                    : 'bg-[#0f0f13] border border-white/[0.09] active:scale-95 shadow-inner'
                }`}
              >
                <span
                  className={`text-7xl font-bold tracking-tight tabular-nums ${
                    isZikirComplete ? 'text-[#34C759]' : 'text-white'
                  }`}
                >
                  {activeZikir.count}
                </span>
                {isZikirComplete && (
                  <span className="mt-2 px-3 py-0.5 rounded-full bg-[#34C759]/20 text-xs font-bold text-[#34C759]">
                    ✓ Tamamlandı
                  </span>
                )}
              </button>
            </div>
          </section>
        </main>
      )}

      {/* 3. KUR'AN-I KERİM */}
      {activeTab === 'kuran' && (
        <main className="w-full max-w-md h-full flex flex-col">
          {kuranSection === null ? (
            <div className="flex-1 flex flex-col pt-4 px-1">
              <header className="flex items-center justify-center mb-5 shrink-0">
                <h1 className="text-xl font-bold text-white tracking-tight">Kur'an-ı Kerim</h1>
              </header>

              <div className="flex flex-col gap-3.5">
                {[
                  {
                    id: 'sure',
                    label: 'Sureler',
                    sub: '114 Sure',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    ),
                  },
                  {
                    id: 'sayfa',
                    label: 'Sayfa',
                    sub: '1 – 604',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    ),
                  },
                  {
                    id: 'cuz',
                    label: 'Cüz',
                    sub: '30 Cüz',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="3" width="7" height="7" rx="1.5" />
                        <rect x="14" y="14" width="7" height="7" rx="1.5" />
                        <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      </svg>
                    ),
                  },
                  {
                    id: 'isaretler',
                    label: 'İşaretlerim',
                    sub: `${bookmarks.length} Kayıtlı`,
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setKuranSection(item.id);
                      setSearchSurah('');
                      setSearchJuz('');
                      setSearchPage('');
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-full bg-[#16161a] hover:bg-[#1c1c22] border border-white/[0.07] hover:border-white/25 shadow-lg transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-white/[0.09] text-[#E5E5EA] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-base font-bold text-white">{item.label}</p>
                        <p className="text-xs text-zinc-400 font-medium">{item.sub}</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-[#16161a] border border-white/[0.07] p-4 shadow-lg flex flex-col h-full overflow-hidden">
              <header className="relative flex items-center justify-center py-1 mb-3 shrink-0">
                <button
                  onClick={() => setKuranSection(null)}
                  aria-label="Geri"
                  className="absolute left-0 p-2 rounded-2xl bg-[#0f0f13] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-white">{kuranSectionTitles[kuranSection]}</h2>
              </header>

              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                {kuranSection === 'sure' &&
                  (kuranLoading ? (
                    <div className="py-12 text-center text-sm text-zinc-400 animate-pulse">Sureler yükleniyor...</div>
                  ) : (
                    <div className="flex flex-col gap-2 pb-3">
                      <div className="sticky top-0 bg-[#16161a]/95 backdrop-blur pb-2 pt-0.5 z-10">
                        <input
                          type="text"
                          placeholder="Sure adı veya numarası ara..."
                          value={searchSurah}
                          onChange={(e) => setSearchSurah(e.target.value)}
                          className="w-full bg-[#0f0f13] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-white/[0.08] focus:border-white/35"
                        />
                      </div>
                      {filteredSurahs.map((sure) => {
                        const startPage = SURAH_START_PAGES[sure.number - 1];
                        return (
                          <button
                            key={sure.number}
                            onClick={() => setActivePage(startPage)}
                            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0f0f13] hover:bg-[#1e1e24] border border-transparent hover:border-white/10 transition-all text-left active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-full bg-[#16161a] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-[#E5E5EA] tabular-nums">
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

                {kuranSection === 'sayfa' && (
                  <div className="flex flex-col gap-2 pb-3">
                    <div className="sticky top-0 bg-[#16161a]/95 backdrop-blur pb-2 pt-0.5 z-10">
                      <input
                        type="number"
                        placeholder="Sayfa numarası ara (1-604)..."
                        value={searchPage}
                        onChange={(e) => setSearchPage(e.target.value)}
                        className="w-full bg-[#0f0f13] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-white/[0.08] focus:border-white/35"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {pageList.map((pageNo) => (
                        <button
                          key={pageNo}
                          onClick={() => setActivePage(pageNo)}
                          className="py-3 rounded-2xl bg-[#0f0f13] hover:bg-[#1e1e24] border border-white/[0.06] text-sm font-semibold text-zinc-200 tabular-nums active:scale-95 transition-all"
                        >
                          {pageNo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {kuranSection === 'cuz' && (
                  <div className="flex flex-col gap-2 pb-3">
                    <div className="sticky top-0 bg-[#16161a]/95 backdrop-blur pb-2 pt-0.5 z-10">
                      <input
                        type="number"
                        placeholder="Cüz numarası ara (1-30)..."
                        value={searchJuz}
                        onChange={(e) => setSearchJuz(e.target.value)}
                        className="w-full bg-[#0f0f13] rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none border border-white/[0.08] focus:border-white/35"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {juzList.map((juzNo) => {
                        const startPage = JUZ_START_PAGES[juzNo - 1];
                        return (
                          <button
                            key={juzNo}
                            onClick={() => setActivePage(startPage)}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0f0f13] hover:bg-[#1e1e24] border border-white/[0.06] transition-all active:scale-95"
                          >
                            <span className="text-xl font-bold text-[#E5E5EA] tabular-nums">{juzNo}</span>
                            <span className="text-xs text-zinc-400 mt-0.5">Sayfa {startPage}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {kuranSection === 'isaretler' && (
                  bookmarks.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                      <div className="w-14 h-14 rounded-2xl bg-[#0f0f13] border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-zinc-200">Henüz işaretli sayfa yok</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Okuma ekranının sağ üstündeki ayraç ikonuna dokunarak sayfaları buraya ekleyebilirsin.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pb-3">
                      {bookmarks.map((bm) => (
                        <div
                          key={bm.page}
                          onClick={() => setActivePage(bm.page)}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0f0f13] hover:bg-[#1e1e24] border border-white/[0.06] cursor-pointer transition-all active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.09] border border-white/15 flex items-center justify-center text-xs font-bold text-[#E5E5EA] tabular-nums shrink-0">
                              {bm.page}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-zinc-100 truncate">{bm.title}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                Cüz {bm.juz || getJuzFromPage(bm.page)} • Sayfa {bm.page}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => removeBookmark(e, bm.page)}
                            aria-label="İşareti Sil"
                            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* İNCE VE ZARİF ALT MENÜ */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-xs rounded-full bg-[#16161a]/92 backdrop-blur-xl border border-white/[0.08] p-1 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => setActiveTab('vakitler')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full transition-all ${
            activeTab === 'vakitler' ? 'bg-white/[0.14] text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span className="text-xs font-semibold">Vakitler</span>
        </button>

        <button
          onClick={() => setActiveTab('zikir')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full transition-all ${
            activeTab === 'zikir' ? 'bg-white/[0.14] text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="text-xs font-semibold">Zikir</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('kuran');
            setKuranSection(null);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full transition-all ${
            activeTab === 'kuran' ? 'bg-white/[0.14] text-white' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
          <span className="text-xs font-semibold">Kur'an</span>
        </button>
      </nav>
    </div>
  );
}

export default App;