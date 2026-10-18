import { useState, useEffect } from 'react';
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

function App() {
  const { timings, dates, locationName, loading } = usePrayerTimes();
  const { timeLeft, nextPrayer } = useCountdown(timings);
  const { surahs, loading: kuranLoading } = useQuran();
  
  const [activeTab, setActiveTab] = useState('vakitler'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [kuranTab, setKuranTab] = useState('sure');

  const [searchSurah, setSearchSurah] = useState('');
  const [searchJuz, setSearchJuz] = useState('');
  const [searchPage, setSearchPage] = useState('');

  const [readConfig, setReadConfig] = useState(null); 
  const { ayahs, loading: ayahsLoading, title: readTitle } = useQuranReader(readConfig?.type, readConfig?.id);
  const [showMeal, setShowMeal] = useState(false); 
  
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('quranBookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const [zikirler, setZikirler] = useState([
    { id: 1, name: "Sübhanallah", count: 0, target: 33 },
    { id: 2, name: "Elhamdülillah", count: 0, target: 33 },
  ]);
  const [activeZikirId, setActiveZikirId] = useState(1);
  const [newZikirName, setNewZikirName] = useState("");
  const [newZikirTarget, setNewZikirTarget] = useState(33);
  const [showAddZikir, setShowAddZikir] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);

  const activeZikir = zikirler.find(z => z.id === activeZikirId) || zikirler[0];
  const isZikirComplete = activeZikir.count >= activeZikir.target;
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((activeZikir.count / activeZikir.target) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  const handleZikirClick = () => {
    if (navigator.vibrate) navigator.vibrate(50); 
    setZikirler(prev => prev.map(z => {
      if (z.id === activeZikirId && z.count < z.target) {
        return { ...z, count: z.count + 1 };
      }
      return z;
    }));
  };

  const addZikir = () => {
    if (!newZikirName) return;
    const newZikir = { id: Date.now(), name: newZikirName, count: 0, target: Number(newZikirTarget) };
    setZikirler([...zikirler, newZikir]);
    setActiveZikirId(newZikir.id);
    setNewZikirName("");
    setShowAddZikir(false);
  };

  const deleteZikir = (e, id) => {
    e.stopPropagation();
    if (zikirler.length === 1) {
      alert("En az 1 adet zikir kayıtlı kalmalıdır.");
      return;
    }
    const updated = zikirler.filter(z => z.id !== id);
    setZikirler(updated);
    if (activeZikirId === id) setActiveZikirId(updated[0].id); 
  };

  const resetZikir = (e, id) => {
    e.stopPropagation();
    setZikirler(prev => prev.map(z => z.id === id ? { ...z, count: 0 } : z));
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsMenuOpen(false); 
    setReadConfig(null); 
  };

  const isPrevDisabled = readConfig?.id <= 1;
  const isNextDisabled = (readConfig?.type === 'page' && readConfig.id >= 604) || (readConfig?.type === 'surah' && readConfig.id >= 114) || (readConfig?.type === 'juz' && readConfig.id >= 30);

  const handleNext = () => !isNextDisabled && setReadConfig({ ...readConfig, id: readConfig.id + 1 });
  const handlePrev = () => !isPrevDisabled && setReadConfig({ ...readConfig, id: readConfig.id - 1 });

  const displayTitle = readConfig?.type === 'surah' ? `${turkceSureIsimleri[readConfig.id - 1]} Suresi` : readTitle;

  const toggleBookmark = () => {
    const exists = bookmarks.find(b => b.type === readConfig.type && b.id === readConfig.id);
    if (exists) {
      setBookmarks(bookmarks.filter(b => !(b.type === readConfig.type && b.id === readConfig.id)));
    } else {
      setBookmarks([...bookmarks, { type: readConfig.type, id: readConfig.id, title: displayTitle }]);
    }
  };
  const isBookmarked = bookmarks.some(b => b.type === readConfig?.type && b.id === readConfig?.id);

  const searchStr = searchSurah.toLocaleLowerCase('tr-TR');
  const filteredSurahs = surahs.filter(sure => 
    turkceSureIsimleri[sure.number - 1].toLocaleLowerCase('tr-TR').includes(searchStr) || 
    sure.number.toString() === searchSurah
  );
  const juzList = Array.from({ length: 30 }, (_, i) => i + 1).filter(j => j.toString().includes(searchJuz));
  const pageList = Array.from({ length: 604 }, (_, i) => i + 1).filter(p => p.toString().includes(searchPage));

  const renderMenu = () => (
    <div className="absolute top-6 left-6 z-50 flex flex-col gap-2">
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 ${isMenuOpen ? 'bg-zinc-300 border-white text-zinc-900 rotate-90' : 'bg-zinc-800/80 backdrop-blur-sm border-zinc-600 text-white'}`}>
        <span className="text-lg font-light">{isMenuOpen ? '✕' : '☰'}</span>
      </button>
      {isMenuOpen && (
        <div className="flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
          <button onClick={() => changeTab('vakitler')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all ${activeTab === 'vakitler' ? 'bg-[#bfa773] border-white text-zinc-900 scale-110' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}><span className="text-sm">🕋</span></button>
          <button onClick={() => changeTab('zikir')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all ${activeTab === 'zikir' ? 'bg-[#bfa773] border-white text-zinc-900 scale-110' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}><span className="text-sm">📿</span></button>
          <button onClick={() => changeTab('kuran')} className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border transition-all ${activeTab === 'kuran' ? 'bg-[#bfa773] border-white text-zinc-900 scale-110' : 'bg-zinc-800 border-zinc-700 text-zinc-300'}`}><span className="text-sm">📖</span></button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-zinc-950 overflow-x-hidden font-sans">
      
      {/* 1. VAKİTLER */}
      {activeTab === 'vakitler' && (
        <div className="relative w-full max-w-sm rounded-[2.5rem] bg-zinc-900/80 p-8 shadow-2xl border border-zinc-800 animate-in fade-in duration-300">
          {renderMenu()}
          <div className="mb-8 mt-2 flex flex-col items-center text-center">
            <h1 className="text-[12px] font-bold tracking-widest text-zinc-500">BULUNDUĞUNUZ KONUM</h1>
            <h2 className="text-2xl font-semibold text-white mt-1 mb-3">{locationName}</h2>
            {dates && (
              <div className="flex flex-col items-center gap-1 text-[13px] text-zinc-400 font-medium">
                <span>{dates.gregorian}</span>
                <span className="text-[#bfa773]">{dates.hijri}</span>
              </div>
            )}
          </div>
          {timings && (
            <div className="mb-10 flex flex-col items-center justify-center">
              <span className="mb-2 text-sm font-semibold text-zinc-500">{nextPrayer} vaktine kalan süre</span>
              <span className="text-6xl font-light tracking-tight text-white">{timeLeft}</span>
            </div>
          )}
          {loading ? (
            <p className="animate-pulse text-center text-sm font-medium text-zinc-500">Yükleniyor...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {timings && Object.entries(timings).map(([vakit, saat]) => {
                const isNext = vakit === nextPrayer;
                return (
                  <div key={vakit} className={`flex items-center justify-between rounded-2xl px-5 py-3.5 ${isNext ? 'bg-[#bfa773]/10 border border-[#bfa773]/30 text-white' : 'bg-zinc-800/30 text-zinc-400'}`}>
                    <span className={`text-lg tracking-wide ${isNext ? 'font-bold' : 'font-medium'}`}>{vakit}</span>
                    <span className={`text-xl ${isNext ? 'font-bold text-[#bfa773]' : 'font-normal'}`}>{saat}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. ZİKİRMATİK */}
      {activeTab === 'zikir' && (
        <div className="w-full max-w-sm flex flex-col gap-4 animate-in fade-in duration-300">
          <div className="relative rounded-[2.5rem] bg-zinc-900/80 p-8 border border-zinc-800 flex flex-col items-center">
            {renderMenu()}
            <div className="mt-2 text-center">
              <h2 className="text-xl font-semibold text-white mb-1">{activeZikir.name}</h2>
              <p className="text-[#bfa773] font-medium text-sm mb-6">Hedef: {activeZikir.target}</p>
            </div>
            <div className="relative flex items-center justify-center mb-8">
              <svg className="w-[240px] h-[240px] transform -rotate-90">
                <circle cx="120" cy="120" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-800" />
                <circle cx="120" cy="120" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={`transition-all duration-500 ease-out ${isZikirComplete ? 'text-[#bfa773]' : 'text-zinc-400'}`} />
              </svg>
              <button onClick={handleZikirClick} disabled={isZikirComplete} className="absolute flex flex-col items-center justify-center w-[160px] h-[160px] rounded-full bg-zinc-800/40 active:scale-95 transition-transform">
                <span className={`text-7xl font-light tracking-tighter ${isZikirComplete ? 'text-[#bfa773]' : 'text-white'}`}>{activeZikir.count}</span>
                {isZikirComplete && <span className="text-[10px] font-bold tracking-widest mt-2 text-[#bfa773]">TAMAMLANDI</span>}
              </button>
            </div>
            <button onClick={(e) => resetZikir(e, activeZikirId)} className="text-zinc-500 hover:text-white font-bold transition-colors text-[10px] tracking-widest">SIFIRLA</button>
          </div>

          <div className="rounded-[2rem] bg-zinc-900/80 border border-zinc-800 overflow-hidden transition-all duration-300">
            <button onClick={() => setIsListOpen(!isListOpen)} className="w-full flex justify-between items-center p-5 active:bg-zinc-800/50 transition-colors">
              <h3 className="text-[11px] text-[#bfa773] font-bold tracking-widest">KAYITLI ZİKİRLER</h3>
              <span className="text-zinc-500 text-xs font-bold">{isListOpen ? 'YUKARI ▲' : 'AÇ ▼'}</span>
            </button>
            {isListOpen && (
              <div className="px-5 pb-5 animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="flex justify-end mb-4">
                  <button onClick={() => setShowAddZikir(!showAddZikir)} className="text-[11px] font-bold tracking-widest text-[#bfa773] hover:text-white bg-[#bfa773]/10 border border-[#bfa773]/20 px-4 py-2 rounded-full transition-colors">+ YENİ EKLE</button>
                </div>
                {showAddZikir && (
                  <div className="flex flex-col gap-2 mb-4 p-3 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                    <input type="text" placeholder="Zikir Adı" value={newZikirName} onChange={(e) => setNewZikirName(e.target.value)} className="bg-zinc-900 rounded-xl px-4 py-2.5 text-white font-medium outline-none text-sm border border-transparent focus:border-[#bfa773]/50"/>
                    <input type="number" placeholder="Hedef" value={newZikirTarget} onChange={(e) => setNewZikirTarget(e.target.value)} className="bg-zinc-900 rounded-xl px-4 py-2.5 text-white font-medium outline-none text-sm border border-transparent focus:border-[#bfa773]/50"/>
                    <button onClick={addZikir} className="w-full py-2.5 mt-1 text-zinc-900 bg-[#bfa773] hover:bg-[#a38a58] rounded-xl text-sm font-bold transition-colors">Kaydet</button>
                  </div>
                )}
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {zikirler.map(z => {
                    const isCompleted = z.count >= z.target;
                    const isSelected = z.id === activeZikirId;
                    return (
                      <div key={z.id} onClick={() => setActiveZikirId(z.id)} className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border border-[#bfa773] bg-[#bfa773]/10' : 'border border-transparent bg-zinc-800/30 hover:bg-zinc-800/60'}`}>
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm ${isCompleted ? 'text-[#bfa773] font-bold' : 'text-zinc-200 font-semibold'}`}>{z.name}</span>
                          <span className={`text-[11px] ${isCompleted ? 'text-[#bfa773] font-bold' : 'text-zinc-500 font-medium'}`}>{z.count} / {z.target}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isCompleted && <button onClick={(e) => resetZikir(e, z.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#bfa773] hover:bg-[#bfa773]/20 transition-colors"><span className="text-xl">↺</span></button>}
                          <button onClick={(e) => deleteZikir(e, z.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"><span className="text-lg font-light">✕</span></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. KURAN-I KERİM */}
      {activeTab === 'kuran' && (
        <div className="relative w-full max-w-sm rounded-[2.5rem] bg-zinc-900/80 p-6 shadow-2xl border border-zinc-800 flex flex-col h-[85vh] animate-in fade-in duration-300">
          
          {!readConfig ? (
            <>
              {renderMenu()}
              <div className="flex p-1 mt-14 bg-zinc-950 rounded-2xl mb-4 shrink-0 border border-zinc-800">
                <button onClick={() => { setKuranTab('sure'); setSearchSurah(''); }} className={`flex-1 py-2 font-semibold text-sm rounded-xl transition-all ${kuranTab === 'sure' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Sure</button>
                <button onClick={() => { setKuranTab('cuz'); setSearchJuz(''); }} className={`flex-1 py-2 font-semibold text-sm rounded-xl transition-all ${kuranTab === 'cuz' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Cüz</button>
                <button onClick={() => { setKuranTab('sayfa'); setSearchPage(''); }} className={`flex-1 py-2 font-semibold text-sm rounded-xl transition-all ${kuranTab === 'sayfa' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Sayfa</button>
              </div>

              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {bookmarks.length > 0 && !searchSurah && !searchJuz && !searchPage && (
                  <div className="mb-5">
                    <h3 className="text-[10px] text-zinc-500 font-bold tracking-widest mb-2 pl-1">İŞARETLERİM</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                      {bookmarks.map((bm, idx) => (
                        <button key={idx} onClick={() => setReadConfig(bm)} className="flex items-center gap-2 bg-[#bfa773]/10 border border-[#bfa773]/30 px-4 py-3 rounded-2xl shrink-0 active:scale-95 transition-transform hover:bg-[#bfa773]/20">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#bfa773" stroke="#bfa773" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                          <div className="flex flex-col items-start">
                            <span className="text-xs font-semibold text-white">{bm.title}</span>
                            <span className="text-[9px] font-bold text-[#bfa773] uppercase tracking-widest">{bm.type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {kuranTab === 'sure' && (
                  kuranLoading ? <div className="h-full flex items-center justify-center"><p className="animate-pulse text-sm font-medium text-zinc-500">Sureler Yükleniyor...</p></div> : (
                    <div className="flex flex-col gap-2 pb-6">
                      <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                        <input type="text" placeholder="Sure adı veya numarası ara..." value={searchSurah} onChange={(e) => setSearchSurah(e.target.value)} className="w-full bg-zinc-950 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#bfa773]/50 border border-zinc-800 transition-all" />
                      </div>
                      
                      {filteredSurahs.map((sure) => (
                        <button key={sure.number} onClick={() => setReadConfig({ type: 'surah', id: sure.number })} className="w-full flex items-center p-4 rounded-2xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-all text-left active:scale-95">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-800 shrink-0"><span className="text-xs font-bold text-zinc-500">{sure.number}</span></div>
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-zinc-200">{turkceSureIsimleri[sure.number - 1]}</span>
                              <span className="text-[11px] font-medium text-zinc-500">{sure.numberOfAyahs} Ayet</span>
                            </div>
                          </div>
                        </button>
                      ))}
                      {filteredSurahs.length === 0 && <p className="text-center text-zinc-600 text-sm mt-4">Sure bulunamadı.</p>}
                    </div>
                  )
                )}

                {kuranTab === 'cuz' && (
                  <div className="flex flex-col gap-2 pb-6">
                    <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                      <input type="number" placeholder="Cüz numarası ara (1-30)..." value={searchJuz} onChange={(e) => setSearchJuz(e.target.value)} className="w-full bg-zinc-950 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#bfa773]/50 border border-zinc-800 transition-all" />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {juzList.map(juzNo => (
                        <button key={juzNo} onClick={() => setReadConfig({ type: 'juz', id: juzNo })} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-all active:scale-95">
                          <span className="text-2xl font-bold text-[#bfa773] mb-1">{juzNo}</span>
                          <span className="text-[11px] font-medium text-zinc-400">Cüz</span>
                        </button>
                      ))}
                    </div>
                    {juzList.length === 0 && <p className="text-center text-zinc-600 text-sm mt-4">Cüz bulunamadı.</p>}
                  </div>
                )}

                {kuranTab === 'sayfa' && (
                  <div className="flex flex-col gap-2 pb-6">
                    <div className="sticky top-0 bg-zinc-900/95 backdrop-blur pb-2 pt-1 z-10">
                      <input type="number" placeholder="Sayfa numarası ara (1-604)..." value={searchPage} onChange={(e) => setSearchPage(e.target.value)} className="w-full bg-zinc-950 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#bfa773]/50 border border-zinc-800 transition-all" />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {pageList.map(pageNo => (
                        <button key={pageNo} onClick={() => setReadConfig({ type: 'page', id: pageNo })} className="flex items-center justify-center py-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700 transition-all active:scale-95">
                          <span className="text-sm font-semibold text-zinc-300">{pageNo}</span>
                        </button>
                      ))}
                    </div>
                    {pageList.length === 0 && <p className="text-center text-zinc-600 text-sm mt-4">Sayfa bulunamadı.</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            
            /* OKUMA EKRANI */
            <div className="flex flex-col h-full animate-in slide-in-from-right-5 fade-in duration-300">
              
              <div className="flex items-center justify-between mb-4 shrink-0 pt-2 border-b border-zinc-800 pb-4">
                <button onClick={() => setReadConfig(null)} className="text-zinc-400 hover:text-white transition-colors text-2xl px-2">‹</button>
                <h2 className="text-lg font-bold text-white tracking-wide truncate px-2">{displayTitle}</h2>
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowMeal(!showMeal)} className="px-3 py-1.5 bg-zinc-800 rounded-lg text-[10px] font-bold tracking-widest text-[#bfa773] hover:text-white border border-zinc-700 transition-colors">
                    {showMeal ? 'MUSHAF' : 'MEAL'}
                  </button>
                  <button onClick={toggleBookmark} className={`transition-transform active:scale-75 ${isBookmarked ? 'text-[#bfa773]' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    {isBookmarked ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {ayahsLoading ? (
                  <div className="h-full flex items-center justify-center"><p className="animate-pulse text-sm font-medium text-zinc-500">Yükleniyor...</p></div>
                ) : (
                  <>
                    {!showMeal ? (
                      <div className="border-[3px] border-double border-[#bfa773]/40 rounded-xl p-5 bg-[#181815] text-justify" dir="rtl">
                        {ayahs.map((ayah, i) => {
                          const isNewSurah = (readConfig.type === 'juz' || readConfig.type === 'page') && (i === 0 || ayah.surahNumber !== ayahs[i-1].surahNumber);
                          return (
                            <span key={ayah.number}>
                              {isNewSurah && (
                                <div className="w-full flex justify-center my-6" dir="ltr">
                                  <div className="bg-[#bfa773]/10 border-y border-[#bfa773]/30 w-3/4 py-2 text-center rounded-lg">
                                    <span className="text-[#d4ba82] font-bold tracking-widest uppercase text-xs">
                                      {turkceSureIsimleri[ayah.surahNumber - 1]} Suresi
                                    </span>
                                  </div>
                                </div>
                              )}
                              <span className="inline text-[28px] font-medium text-[#f4ebd0] leading-[2.6]" style={{fontFamily: "'Amiri', 'Traditional Arabic', serif"}}>
                                {ayah.textAr}
                                <span className="inline text-[22px] text-[#bfa773]/80 mx-1.5 font-normal">﴾{ayah.number}﴿</span>
                              </span>
                            </span>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {ayahs.map((ayah, i) => {
                           const isNewSurah = (readConfig.type === 'juz' || readConfig.type === 'page') && (i === 0 || ayah.surahNumber !== ayahs[i-1].surahNumber);
                           return (
                            <div key={i} className="flex flex-col gap-4 border-b border-zinc-800 pb-6 last:border-0">
                              {isNewSurah && (
                                <div className="inline-block mt-2">
                                  <span className="px-3 py-1 bg-[#bfa773]/10 text-[#bfa773] text-[10px] font-bold uppercase tracking-widest rounded-md border border-[#bfa773]/20">
                                    {turkceSureIsimleri[ayah.surahNumber - 1]} Suresi
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-end items-start gap-4">
                                <p className="text-right text-[28px] leading-[2.2] font-medium text-[#f4ebd0]" dir="rtl" style={{fontFamily: "'Amiri', 'Traditional Arabic', serif"}}>{ayah.textAr}</p>
                                <div className="mt-2 w-7 h-7 rounded-full bg-zinc-900 flex flex-col items-center justify-center border border-zinc-700 shrink-0"><span className="text-[10px] font-bold text-zinc-500">{ayah.number}</span></div>
                              </div>
                              <p className="text-sm leading-relaxed text-zinc-400 text-left pr-8">{ayah.textTr}</p>
                            </div>
                           )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 mt-2 border-t border-zinc-800 shrink-0">
                <button onClick={handlePrev} disabled={isPrevDisabled} className="px-4 py-2 bg-zinc-900 rounded-xl text-[11px] font-bold tracking-widest text-zinc-400 disabled:opacity-30 transition-colors border border-zinc-800">
                  ‹ ÖNCEKİ
                </button>
                <span className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase">
                  {readConfig.type} {readConfig.id}
                </span>
                <button onClick={handleNext} disabled={isNextDisabled} className="px-4 py-2 bg-zinc-900 rounded-xl text-[11px] font-bold tracking-widest text-zinc-400 disabled:opacity-30 transition-colors border border-zinc-800">
                  SONRAKİ ›
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;