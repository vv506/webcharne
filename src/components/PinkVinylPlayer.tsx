import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc, Volume2, VolumeX, X, Sparkles, Trash2, ListMusic, Plus, ExternalLink, Heart, RotateCcw } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface Song {
  id: string;
  title: string;
  artist?: string;
  url: string;
  youtubeId?: string;
  order?: number;
}

export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const DEFAULT_PLAYLIST: Song[] = [
  {
    id: 'yt-buong-bo-su-phu-thuoc-noi-anh',
    title: 'Buông bỏ sự phụ thuộc nơi anh',
    artist: 'Vương Diễm Vi (王艳薇)',
    url: 'https://youtu.be/iu6qVH-ERUQ?si=Qo5Qq0B1YFsYcpFS',
    youtubeId: 'iu6qVH-ERUQ',
    order: 0
  },
  {
    id: 'yt-bien-dao-va-em',
    title: 'Biển, Đảo và Em',
    artist: '马也_Crabbit - 海屿你',
    url: 'https://youtu.be/OmfG5jX1f3g?si=wil2mv6vV9wGehsz',
    youtubeId: 'OmfG5jX1f3g',
    order: 1
  },
  {
    id: 'yt-quen-roi',
    title: 'Quên rồi',
    artist: 'Chu Lâm Phong (周林枫)',
    url: 'https://youtu.be/hCCeYpdCXeM?si=NwmFG4LSWXBmF-UE',
    youtubeId: 'hCCeYpdCXeM',
    order: 2
  },
  {
    id: 'yt-thuy-trieu',
    title: 'Thủy triều',
    artist: 'Phó Mộng Đồng',
    url: 'https://youtu.be/BBRUy6KWttc?si=23WGqQUMtH03DWHY',
    youtubeId: 'BBRUy6KWttc',
    order: 3
  },
  {
    id: 'yt-sa-vao-nguy-hiem-trong-rong-khong-co-nuoc-mat',
    title: 'Sa vào nguy hiểm + Trống rỗng + Không có nước mắt',
    artist: 'Cát Đông Kỳ',
    url: 'https://youtu.be/5AzzAHschFM?si=L-Gm8G0SGfSuxZyC',
    youtubeId: '5AzzAHschFM',
    order: 4
  },
  {
    id: 'yt-thieu-nien-hoa-hong',
    title: 'Thiếu niên hoa hồng',
    artist: 'Vương Tĩnh Văn (王靖雯)',
    url: 'https://youtu.be/mAiC9f2Cp0s?si=YX-NxYleP7wy4wm4',
    youtubeId: 'mAiC9f2Cp0s',
    order: 5
  },
  {
    id: 'yt-map-mo',
    title: 'Mập mờ',
    artist: 'Cao Húc (高旭)',
    url: 'https://youtu.be/6sgnZhw7B-A?si=Xa5o2aUWYR9vquX5',
    youtubeId: '6sgnZhw7B',
    order: 6
  },
  {
    id: 'yt-red-line',
    title: 'Red line',
    artist: '邹沛沛/ Pank',
    url: 'https://youtu.be/-elf4OMkOqk?si=cryTwx_9vFY8tGkf',
    youtubeId: '-elf4OMkOqk',
    order: 7
  },
  {
    id: 'yt-dam-chim',
    title: 'Đắm chìm',
    artist: '邹沛沛/ Pank',
    url: 'https://youtu.be/j2ua5ZbfMfk?si=4y5zfXJu4813Lysr',
    youtubeId: 'j2ua5ZbfMfk',
    order: 8
  },
  {
    id: 'yt-luong-nan',
    title: 'Lưỡng nan',
    artist: 'Gia Mộc (两难)',
    url: 'https://youtu.be/gDZzfo19E1M?si=8d-La6LnD8zHKP4N',
    youtubeId: 'gDZzfo19E1M',
    order: 9
  },
  {
    id: 'yt-trang-giay-cuoi-cung',
    title: 'Trang giấy cuối cùng',
    artist: 'Giang Ngữ Thần (江语晨)',
    url: 'https://youtu.be/_M4f3luWUiA?si=or_BcAZHh5QCMJLv',
    youtubeId: '_M4f3luWUiA',
    order: 10
  },
  {
    id: 'yt-yeu-nhu-thoi-quen',
    title: 'Yêu như thói quen',
    artist: 'Nhị Thạc/Thính Triều Các (二硕/听潮阁)',
    url: 'https://youtu.be/dk0zUus4Q9o?si=y2twDF0Qx5QubbG4',
    youtubeId: 'dk0zUus4Q9o',
    order: 11
  }
];

export const PinkVinylPlayer: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isOwner = !currentUser || currentUser.email === 'thuyvy151006@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Playlist State - purely local now with updated key to load fresh default playlist
  const [playlist, setPlaylist] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem('music_box_playlist_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch(e) {}
    return DEFAULT_PLAYLIST;
  });

  // Active Song ID
  const [activeSongId, setActiveSongId] = useState<string>(() => {
    return playlist[0]?.id || DEFAULT_PLAYLIST[0].id;
  });

  const handleResetPlaylist = () => {
    setPlaylist(DEFAULT_PLAYLIST);
    if (DEFAULT_PLAYLIST.length > 0) {
      setActiveSongId(DEFAULT_PLAYLIST[0].id);
    }
    setShowResetConfirm(false);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeSong = playlist.find(s => s.id === activeSongId) || playlist[0] || DEFAULT_PLAYLIST[0];
  const activeYtId = activeSong ? (activeSong.youtubeId || getYouTubeId(activeSong.url)) : null;

  // Save playlist to localStorage
  useEffect(() => {
    localStorage.setItem('music_box_playlist_v3', JSON.stringify(playlist));
  }, [playlist]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Play / Pause Toggle
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (!activeYtId && audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
          console.warn('Playback error:', err);
        });
      }
    }
  };

  // Next Track
  const handleNextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === activeSongId);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  };

  // Prev Track
  const handlePrevTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(s => s.id === activeSongId);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex]);
  };

  // Play specific song
  const playSong = (song: Song) => {
    setActiveSongId(song.id);
    setIsPlaying(true);
    const ytId = song.youtubeId || getYouTubeId(song.url);
    if (!ytId) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 150);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  // Add new song
  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !isOwner) return;
    const ytId = getYouTubeId(newUrl);
    const title = newTitle.trim() || (ytId ? `YouTube Song (${ytId})` : 'Bài hát mới');
    const newSong: Song = {
      id: 'song-' + Date.now(),
      title,
      url: newUrl.trim(),
      youtubeId: ytId || undefined,
      artist: ytId ? 'YouTube' : 'Custom Audio',
      order: playlist.length > 0 ? Math.max(...playlist.map(s => s.order || 0)) + 1 : 0
    };
    
    setPlaylist(prev => [...prev, newSong]);
    playSong(newSong);
    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== 'https://www.youtube.com') return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
           handleNextTrack();
        } else if (data.event === 'initialDelivery' && data.info && data.info.playerState === 0) {
           handleNextTrack();
        } else if (data.event === 'onStateChange' && data.info === 0) {
           handleNextTrack();
        }
      } catch (err) {}
    };
    window.addEventListener('message', handleMessage);
    
    // Attempt to register listening for existing iframes
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    iframes.forEach((iframe) => {
      const w = (iframe as HTMLIFrameElement).contentWindow;
      if (w) {
        w.postMessage(JSON.stringify({ event: 'listening', id: 1 }), 'https://www.youtube.com');
      }
    });

    return () => window.removeEventListener('message', handleMessage);
  }, [playlist, activeSongId, isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !activeYtId) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && !activeYtId) {
      audioRef.current.currentTime = time;
    }
  };

  // Delete Song
  const handleDeleteSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwner) return;
    
    const updatedPlaylist = playlist.filter(s => s.id !== songId);
    setPlaylist(updatedPlaylist);
    if (activeSongId === songId && updatedPlaylist.length > 0) {
      const nextSong = updatedPlaylist[0];
      playSong(nextSong);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Hidden Audio Element for standard MP3 files */}
      <audio
        ref={audioRef}
        src={activeYtId ? undefined : activeSong?.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNextTrack}
      />

      {/* Hidden YouTube Iframe Embed when playing YouTube Track */}
      {activeYtId && isPlaying && (
        <iframe
          key={activeYtId}
          width="1"
          height="1"
          src={`https://www.youtube.com/embed/${activeYtId}?autoplay=1&enablejsapi=1&playsinline=1`}
          title="YouTube Player"
          allow="autoplay; encrypted-media"
          className="absolute opacity-0 pointer-events-none w-0 h-0 border-0"
          onLoad={(e) => {
            const w = (e.target as HTMLIFrameElement).contentWindow;
            if (w) {
              w.postMessage(JSON.stringify({ event: 'listening', id: 1 }), 'https://www.youtube.com');
            }
          }}
        />
      )}

      {/* COMPACT MINI MUSIC BAR */}
      <div className="flex items-center gap-1.5 bg-white/80 hover:bg-white backdrop-blur-xl border border-[#F5B5C0] rounded-2xl px-2.5 py-1.5 shadow-sm text-xs transition-all">
        {/* Spinning Vinyl Disc / Toggle List */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 cursor-pointer group"
          title="Xem danh sách nhạc"
        >
          <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
            <Heart className="absolute inset-0 w-6 h-6 text-[#C86D7C] fill-[#C86D7C] drop-shadow-sm group-hover:text-[#E892A0] group-hover:fill-[#E892A0] transition-colors" />
          </div>

          <span className="font-bold text-[#5C2830] max-w-[100px] sm:max-w-[130px] truncate text-left">
            {activeSong?.title || "Music Box"}
          </span>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            isPlaying 
              ? 'bg-[#C86D7C] text-white' 
              : 'bg-[#FADAD9] text-[#823B47] hover:bg-[#E892A0] hover:text-white'
          }`}
          title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
        </button>

        {/* Next Track Button */}
        <button
          onClick={handleNextTrack}
          className="p-1.5 rounded-xl bg-[#FADAD9] text-[#823B47] hover:bg-[#E892A0] hover:text-white transition-all cursor-pointer"
          title="Chuyển bài tiếp theo"
        >
          <SkipForward className="w-3.5 h-3.5 fill-current" />
        </button>
      </div>

      {/* PLAYLIST POPOVER MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-[#FAF0F1] border-2 border-[#F3B8C2] rounded-3xl p-4 shadow-2xl backdrop-blur-2xl text-[#5C2830] flex flex-col space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F3B8C2] pb-2">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full bg-[#E892A0] border border-white flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
                <Disc className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#5C2830] leading-none">Music Box</h4>
                <p className="text-[10px] text-[#823B47] font-semibold">Danh Sách Phát</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-xl bg-white/80 hover:bg-white text-[#823B47] border border-[#F3B8C2] transition-all cursor-pointer shadow-sm"
              title="Đóng danh sách"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Vinyl Disc Player */}
          <div className="flex flex-col items-center justify-center py-4 bg-white/60 rounded-xl border border-[#F3B8C2]/60">
            <div className="flex items-center justify-center gap-6">
              {/* Previous Track Button */}
              <button
                onClick={handlePrevTrack}
                className="p-2 rounded-full bg-[#FADAD9] text-[#823B47] hover:bg-[#E892A0] hover:text-white transition-all cursor-pointer shadow-sm"
                title="Bài trước đó"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              <div 
                onClick={togglePlay}
                className={`relative w-28 h-28 rounded-full bg-gradient-to-br from-gray-900 to-black shadow-[0_4px_12px_rgba(0,0,0,0.2)] flex items-center justify-center border-2 border-[#222] cursor-pointer hover:scale-105 transition-transform ${isPlaying ? 'animate-[spin_3s_linear_infinite]' : ''}`}
                title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                 <div className="absolute inset-1.5 rounded-full border border-gray-600/40 pointer-events-none"></div>
                 <div className="absolute inset-3.5 rounded-full border border-gray-600/40 pointer-events-none"></div>
                 <div className="absolute inset-5.5 rounded-full border border-gray-600/40 pointer-events-none"></div>
                 <div className="absolute inset-7.5 rounded-full border border-gray-600/40 pointer-events-none"></div>
                 <div className="relative w-10 h-10 rounded-full bg-[#E892A0] flex items-center justify-center shadow-inner border border-white/20 pointer-events-none">
                   <div className="absolute w-2 h-2 rounded-full bg-[#FAF0F1] border border-gray-800 shadow-sm z-10 pointer-events-none"></div>
                   <div className="absolute w-full h-full rounded-full border-2 border-dashed border-white/30 animate-[spin_10s_linear_infinite_reverse] pointer-events-none"></div>
                 </div>
                 <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
              </div>

              {/* Next Track Button */}
              <button
                onClick={handleNextTrack}
                className="p-2 rounded-full bg-[#FADAD9] text-[#823B47] hover:bg-[#E892A0] hover:text-white transition-all cursor-pointer shadow-sm"
                title="Chuyển bài tiếp theo"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>
            <div className="mt-4 flex w-full px-6 justify-between text-[11px] font-bold text-[#823B47]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* PLAYLIST SECTION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#823B47] flex items-center gap-1">
                <ListMusic className="w-3.5 h-3.5 text-[#C86D7C]" />
                <span>Danh Sách Bài Hát ({playlist.length})</span>
              </span>

              {isOwner && (
                <div className="flex items-center gap-1.5">
                  {showResetConfirm ? (
                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={handleResetPlaylist}
                        className="text-[9px] font-bold text-red-600 hover:text-red-700 px-1 py-0.5 cursor-pointer"
                      >
                        Có
                      </button>
                      <span className="text-[9px] text-[#823B47]">/</span>
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="text-[9px] font-bold text-[#823B47] hover:text-[#C86D7C] px-1 py-0.5 cursor-pointer"
                      >
                        Không
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(true)}
                      className="text-[10px] font-bold text-[#823B47] hover:text-red-600 bg-white/80 hover:bg-white px-2 py-0.5 rounded-lg border border-[#F3B8C2] transition-all cursor-pointer flex items-center gap-0.5"
                      title="Khôi phục danh sách nhạc mặc định"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}

                  
                </div>
              )}
            </div>

            {/* ADD SONG FORM */}
            {showAddForm && isOwner && (
              <form onSubmit={handleAddSong} className="p-2.5 bg-white/90 rounded-2xl border border-[#F3B8C2] space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Tên bài hát (tùy chọn)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#F3B8C2] bg-[#FAF0F1]/60 focus:outline-none focus:border-[#C86D7C] text-xs"
                />
                <input
                  type="url"
                  placeholder="Link YouTube hoặc MP3 URL..."
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-[#F3B8C2] bg-[#FAF0F1]/60 focus:outline-none focus:border-[#C86D7C] text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#C86D7C] hover:bg-[#823B47] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Thêm vào Music Box
                </button>
              </form>
            )}

            {/* SONG LIST CONTAINER */}
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {playlist.map((song, idx) => {
                const isActive = song.id === activeSongId;
                const ytId = song.youtubeId || getYouTubeId(song.url);
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#E892A0] text-white border-[#C86D7C] shadow-sm'
                        : 'bg-white/80 hover:bg-white text-[#602D35] border-[#F3B8C2]/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-[10px] font-bold w-4 text-center ${isActive ? 'text-white' : 'text-[#823B47]'}`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <p className="truncate font-bold text-xs">{song.title}</p>
                          {ytId && (
                            <span className={`text-[9px] px-1 py-0.2 rounded font-black shrink-0 ${
                              isActive ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600 border border-red-200'
                            }`}>
                              YT
                            </span>
                          )}
                        </div>
                        {song.artist && (
                          <p className={`text-[10px] truncate ${isActive ? 'text-pink-100' : 'text-[#823B47]'}`}>
                            {song.artist}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {ytId && (
                        <a
                          href={song.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`p-1 rounded-lg hover:scale-110 transition-transform ${
                            isActive ? 'text-pink-100 hover:text-white' : 'text-[#C86D7C] hover:text-[#823B47]'
                          }`}
                          title="Mở trên YouTube"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {isActive && isPlaying ? (
                        <span className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-2"></span>
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-3 delay-75"></span>
                          <span className="w-0.5 bg-white rounded-full animate-bounce h-1.5 delay-150"></span>
                        </span>
                      ) : (
                        <Play className={`w-3.5 h-3.5 ${isActive ? 'text-white fill-current' : 'text-[#C86D7C]'}`} />
                      )}

                      
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-between pt-1 border-t border-[#F3B8C2]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[#823B47] hover:text-[#C86D7C] cursor-pointer"
                title={isMuted ? 'Mở âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-16 accent-[#C86D7C] h-1 bg-[#FADAD9] rounded cursor-pointer"
              />
            </div>

            <p className="text-[10px] text-[#823B47] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C86D7C]" />
              <span>Hoa Lạc Giản Lưu Hương</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
