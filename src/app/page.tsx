"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Play, RotateCcw, Music, Radio, Square, Pause, Mic2, Wifi, Clock, AlertTriangle, CheckCircle2, Volume2, VolumeX, Volume1 } from "lucide-react";

export default function Home() {
  const [seconds, setSeconds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const timeOptions = [5, 10, 15, 20, 30, 60];

  const clearAudioUrl = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [audioUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTick((t) => t + 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsPaused(false);
      setIsPlaying(true);
      setIsAudioPaused(false);
      if (audioRef.current) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);

  // Volume & Mute Control Effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  const handleStart = () => {
    if (playlist.length === 0) return;
    if (isPaused) {
      setIsPaused(false);
    } else {
      setTimeLeft(seconds);
      setIsActive(true);
      setIsPaused(false);
      setIsPlaying(false);
      setIsAudioPaused(false);
      
      // Load current track URL if not already loaded
      if (!audioUrl && playlist[currentIndex]) {
        const url = URL.createObjectURL(playlist[currentIndex]);
        setAudioUrl(url);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handlePause = () => setIsPaused(true);

  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsPlaying(false);
    setIsAudioPaused(false);
    setTimeLeft(seconds);
    setCurrentIndex(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleStopAudio = () => {
    setIsPlaying(false);
    setIsAudioPaused(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPaused(true);
    }
  };

  const handleResumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsAudioPaused(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsAudioPaused(false);
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Prepare next track
      const nextUrl = URL.createObjectURL(playlist[nextIndex]);
      clearAudioUrl();
      setAudioUrl(nextUrl);
      setTimeLeft(seconds);
      // We don't auto-start the countdown, the spiker should trigger it when ready
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);
  const adjustVolume = (delta: number) => {
    setVolume(prev => Math.min(1, Math.max(0, prev + delta)));
    if (isMuted) setIsMuted(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setPlaylist(prev => [...prev, ...newFiles]);
      
      // If nothing was loaded, load the first one
      if (playlist.length === 0) {
        const url = URL.createObjectURL(newFiles[0]);
        setAudioUrl(url);
      }
    }
  };

  const removeFromPlaylist = (index: number) => {
    setPlaylist(prev => {
      const newList = prev.filter((_, i) => i !== index);
      // If we removed the currently playing/selected item
      if (index === currentIndex) {
        clearAudioUrl();
        if (newList.length > 0) {
          const nextIdx = Math.min(index, newList.length - 1);
          setCurrentIndex(nextIdx);
          setAudioUrl(URL.createObjectURL(newList[nextIdx]));
        } else {
          setCurrentIndex(0);
        }
      } else if (index < currentIndex) {
        setCurrentIndex(prevIdx => prevIdx - 1);
      }
      return newList;
    });
  };

  useEffect(() => () => clearAudioUrl(), [clearAudioUrl]);

  const isWarning = isActive && !isPaused && timeLeft <= 5 && timeLeft > 0;
  const progress = seconds > 0 ? ((seconds - timeLeft) / seconds) * 100 : 0;

  const statusLabel = isPlaying ? (isAudioPaused ? "MUSIC PAUSED" : "ON AIR") : isWarning ? "STANDBY" : isPaused ? "PAUSED" : isActive ? "COUNTING" : "READY";
  const statusColor = isPlaying ? (isAudioPaused ? "#8b5cf6" : "#ef4444") : isWarning ? "#f59e0b" : isPaused ? "#6366f1" : isActive ? "#22c55e" : "#3b82f6";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&family=Barlow:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0a0a0b;
          --surface: #111114;
          --surface2: #18181c;
          --border: #2a2a30;
          --border2: #1e1e24;
          --text: #e8e8ec;
          --text-dim: #6b6b78;
          --text-muted: #3d3d48;
          --accent: #3b82f6;
          --red: #ef4444;
          --green: #22c55e;
          --amber: #f59e0b;
          --purple: #8b5cf6;
        }

        body { background: var(--bg); }

        .app {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Barlow', sans-serif;
          display: flex;
          flex-direction: column;
          padding: 20px;
          gap: 16px;
        }

        /* HEADER */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 12px 20px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: var(--red);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-name {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
          font-size: 22px;
          letter-spacing: 0.05em;
          color: var(--text);
        }

        .brand-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .header-indicators {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .indicator {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .indicator-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .indicator-dot.on { background: var(--green); box-shadow: 0 0 8px var(--green); }
        .indicator-dot.active { background: var(--red); box-shadow: 0 0 8px var(--red); animation: blink 1s infinite; }

        /* AUDIO CONTROLS */
        .audio-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--surface2);
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 4px;
        }

        .volume-btn {
          background: transparent;
          border: none;
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: all 0.2s ease;
        }

        .volume-btn:hover { color: var(--text); }
        .volume-btn.active { color: var(--accent); }
        .volume-btn.muted { color: var(--red); }

        .volume-slider-container {
          width: 80px;
          height: 4px;
          background: var(--border2);
          border-radius: 2px;
          position: relative;
          cursor: pointer;
        }

        .volume-slider-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        @keyframes flash-number {
          0%, 100% { opacity: 1; color: var(--amber); text-shadow: 0 0 40px rgba(245,158,11,0.8), 0 0 80px rgba(245,158,11,0.4); }
          50% { opacity: 0.15; color: var(--amber); text-shadow: none; }
        }

        @keyframes flash-bg {
          0%, 100% { background: rgba(245,158,11,0.06); }
          50% { background: transparent; }
        }

        .countdown-number.state-warning {
          animation: flash-number 0.6s ease-in-out infinite !important;
        }

        .countdown-area.flashing {
          animation: flash-bg 0.6s ease-in-out infinite;
        }

        /* MAIN GRID */
        .main-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 300px 1fr 240px;
          gap: 16px;
        }

        @media (max-width: 1024px) {
          .main-grid { grid-template-columns: 1fr; }
        }

        /* PANEL */
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
          background: var(--surface2);
        }

        .panel-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-dim);
        }

        .panel-title-accent {
          color: var(--accent);
        }

        .panel-body {
          padding: 20px;
        }

        /* TIME SELECTOR */
        .time-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .time-btn {
          height: 56px;
          border: 1px solid var(--border);
          border-radius: 3px;
          background: var(--surface2);
          color: var(--text-dim);
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 24px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          overflow: hidden;
        }

        .time-btn:hover {
          border-color: var(--accent);
          color: var(--text);
          background: rgba(59,130,246,0.08);
        }

        .time-btn.selected {
          border-color: var(--accent);
          color: #fff;
          background: rgba(59,130,246,0.15);
        }

        .time-btn.selected::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent);
        }

        /* UPLOAD */
        .upload-area {
          border: 1px dashed var(--border);
          border-radius: 3px;
          padding: 24px 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .upload-area:hover {
          border-color: var(--purple);
          background: rgba(139,92,246,0.05);
        }

        .upload-area.has-file {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.04);
        }

        .upload-icon {
          width: 40px;
          height: 40px;
          margin: 0 auto 12px;
          background: var(--surface2);
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
        }

        .upload-title {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.08em;
          color: var(--text);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .upload-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .filename {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--green);
          margin-top: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
          margin: 8px auto 0;
        }

        /* CENTER DISPLAY */
        .display-panel {
          display: flex;
          flex-direction: column;
        }

        .countdown-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
        }

        .countdown-number {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(140px, 22vw, 220px);
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
          transition: color 0.3s ease;
          position: relative;
          z-index: 2;
          text-align: center;
        }

        .countdown-number.state-idle { color: #2a2a32; }
        .countdown-number.state-active { color: var(--text); }
        .countdown-number.state-playing { color: var(--red); }
        .countdown-number.state-playing.paused { color: var(--purple); }
        .countdown-number.state-paused { color: var(--purple); }

        .countdown-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.35em;
          margin-top: 8px;
          transition: color 0.3s ease;
        }

        /* PROGRESS BAR */
        .progress-track {
          height: 3px;
          background: var(--border2);
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.9s linear, background 0.3s ease;
          position: relative;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 40px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4));
        }

        /* STATUS BAR */
        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 20px;
          border-top: 1px solid var(--border);
          background: var(--surface2);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 2px;
          border: 1px solid;
          transition: all 0.3s ease;
        }

        .vu-meters {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 20px;
        }

        .vu-bar {
          width: 4px;
          border-radius: 1px;
          transition: height 0.1s ease;
        }

        /* RIGHT PANEL */
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--border2);
        }

        .info-row:last-child { border-bottom: none; }

        .info-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }

        .info-value {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
        }

        .info-value.accent { color: var(--accent); }
        .info-value.green { color: var(--green); }
        .info-value.red { color: var(--red); }

        /* CONTROLS */
        .controls-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 20px;
          border-top: 1px solid var(--border);
        }

        .btn-primary {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 3px;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.15s ease;
        }

        .btn-primary:active { transform: scale(0.98); }

        .btn-primary.start {
          background: var(--accent);
          color: #fff;
        }

        .btn-primary.start:hover { background: #2563eb; }
        .btn-primary.start:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; }

        .btn-primary.pause {
          background: rgba(245,158,11,0.15);
          color: var(--amber);
          border: 1px solid rgba(245,158,11,0.3);
        }

        .btn-primary.stop {
          background: var(--red);
          color: #fff;
        }

        .btn-primary.stop:hover { background: #dc2626; }

        .btn-primary.resume {
          background: rgba(99,102,241,0.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.3);
        }

        .btn-row {
          display: grid;
          grid-template-columns: 1fr 48px;
          gap: 8px;
        }

        .btn-secondary {
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 3px;
          background: var(--surface2);
          color: var(--text-dim);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.15s ease;
        }

        .btn-secondary:hover {
          border-color: var(--text-dim);
          color: var(--text);
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 3px;
          background: var(--surface2);
          color: var(--text-dim);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .btn-icon:hover {
          border-color: var(--text-dim);
          color: var(--text);
        }

        /* ON AIR overlay */
        .onair-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--red);
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.3em;
          padding: 10px 28px;
          border-radius: 2px;
          z-index: 10;
          animation: blink 1.2s infinite;
          white-space: nowrap;
        }

        /* SECTION LABEL */
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .divider { height: 1px; background: var(--border); margin: 16px 0; }
      `}</style>

      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="brand">
            <div className="brand-icon">
              <Radio size={18} color="#fff" />
            </div>
            <div>
              <div className="brand-name">CUECAST PRO</div>
              <div className="brand-sub">Studio Countdown System v2.4</div>
            </div>
          </div>
          <div className="header-indicators">
            <div className="audio-controls">
              <button className={`volume-btn ${isMuted ? 'muted' : ''}`} onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : volume < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="volume-slider-container" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                setVolume(Math.min(1, Math.max(0, x / rect.width)));
                if (isMuted) setIsMuted(false);
              }}>
                <div className="volume-slider-fill" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
            <div className="indicator">
              <div className={`indicator-dot ${isPlaying ? "active" : playlist.length > 0 ? "on" : ""}`} />
              {isPlaying ? "ON AIR" : playlist.length > 0 ? "LOADED" : "STANDBY"}
            </div>
            <div className="indicator">
              <div className="indicator-dot on" />
              SYSTEM OK
            </div>
            <div className="indicator">
              <Wifi size={12} />
              LIVE
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="main-grid">

          {/* LEFT: SETTINGS */}
          <div className="panel">
            <div className="panel-header">
              <Clock size={12} color="var(--accent)" />
              <span className="panel-title"><span className="panel-title-accent">01</span> — CUE TIMER</span>
            </div>
            <div className="panel-body">
              <div className="section-label">Duration / Seconds</div>
              <div className="time-grid">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    className={`time-btn ${seconds === opt ? "selected" : ""}`}
                    onClick={() => {
                      setSeconds(opt);
                      if (!isActive) setTimeLeft(opt);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="divider" />

              <div className="section-label">Audio Source</div>
              <input type="file" accept="audio/mp3,audio/mpeg,audio/wav" onChange={handleFileUpload} className="hidden" id="audio-upload" multiple />
              <label htmlFor="audio-upload">
                <div className={`upload-area ${playlist.length > 0 ? "has-file" : ""}`}>
                  <div className="upload-icon">
                    {playlist.length > 0
                      ? <CheckCircle2 size={18} color="var(--green)" />
                      : <Upload size={18} color="var(--text-dim)" />
                    }
                  </div>
                  <div className="upload-title">
                    {playlist.length > 0 ? `${playlist.length} Files Loaded` : "Upload Audio"}
                  </div>
                  <div className="upload-sub">MP3 / WAV (Multiple)</div>
                </div>
              </label>

              <div className="divider" />

              <div className="section-label">Playlist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {playlist.map((file, idx) => (
                  <div key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px', 
                    background: idx === currentIndex ? 'rgba(59,130,246,0.1)' : 'var(--surface2)',
                    border: `1px solid ${idx === currentIndex ? 'var(--accent)' : 'var(--border2)'}`,
                    borderRadius: '3px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <Music size={12} color={idx === currentIndex ? 'var(--accent)' : 'var(--text-muted)'} />
                      <span style={{ 
                        fontSize: '11px', 
                        color: idx === currentIndex ? 'var(--text)' : 'var(--text-dim)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '150px'
                      }}>
                        {file.name}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); removeFromPlaylist(idx); }}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {playlist.length === 0 && (
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                    EMPTY PLAYLIST
                  </div>
                )}
              </div>

              <div className="divider" />

              <div className="section-label">Info</div>
              <div className="info-row">
                <span className="info-label">Set Duration</span>
                <span className="info-value accent">{seconds}s</span>
              </div>
              <div className="info-row">
                <span className="info-label">Remaining</span>
                <span className={`info-value ${isWarning ? "red" : "green"}`}>{timeLeft}s</span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Track</span>
                <span className={`info-value ${playlist.length > 0 ? "green" : ""}`} style={{ fontSize: 11, color: playlist.length > 0 ? "var(--green)" : "var(--text-muted)" }}>
                  {playlist.length > 0 ? `${currentIndex + 1} / ${playlist.length}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: COUNTDOWN */}
          <div className="panel display-panel">
            <div className="panel-header">
              <Mic2 size={12} color="var(--red)" />
              <span className="panel-title"><span className="panel-title-accent">02</span> — BROADCAST DISPLAY</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isPlaying
                      ? `hsl(${i * 40}, 90%, 55%)`
                      : i === 0 && isActive ? "var(--green)" : "var(--border)"
                  }} />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                  background: isWarning ? "var(--amber)" : isPlaying ? "var(--red)" : "var(--accent)"
                }}
              />
            </div>

            {/* Big Number */}
            <div className={`countdown-area ${isWarning ? "flashing" : ""}`}>
              <div
                className={`countdown-number ${
                  isPlaying ? (isAudioPaused ? "state-playing paused" : "state-playing")
                  : isWarning ? "state-warning"
                  : isPaused ? "state-paused"
                  : isActive ? "state-active"
                  : "state-idle"
                }`}
              >
                {isPlaying ? "ON" : String(timeLeft).padStart(2, "0")}
              </div>
              <div
                className="countdown-label"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </div>

              {isPlaying && <div className="onair-overlay">● ON AIR</div>}

              {isWarning && (
                <div style={{
                  position: "absolute",
                  top: 20, right: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "var(--amber)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  animation: "blink 0.6s infinite"
                }}>
                  <AlertTriangle size={14} />
                  CUED
                </div>
              )}

              {/* VU Meters */}
              {isPlaying && (
                <div style={{ position: "absolute", bottom: 30, display: "flex", gap: 3, alignItems: "flex-end", height: 40 }}>
                  {[...Array(12)].map((_, i) => {
                    const heights = [60, 100, 75, 90, 55, 80, 95, 65, 85, 70, 100, 50];
                    return (
                      <div key={i} style={{
                        width: 5,
                        height: `${heights[i]}%`,
                        background: i < 8 ? "var(--green)" : i < 10 ? "var(--amber)" : "var(--red)",
                        borderRadius: 1,
                        opacity: 0.7,
                        animation: `blink ${0.4 + i * 0.07}s infinite alternate`
                      }} />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="status-bar">
              <div
                className="status-badge"
                style={{
                  color: statusColor,
                  borderColor: statusColor + "33",
                  background: statusColor + "11"
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, animation: isActive || isPlaying ? "blink 1s infinite" : "none" }} />
                {statusLabel}
              </div>

              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)" }}>
                {Math.round(progress)}% ELAPSED
              </div>
            </div>

            {/* Controls */}
            <div className="controls-area">
              {isPlaying ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {isAudioPaused ? (
                      <button className="btn-primary resume" onClick={handleResumeAudio}>
                        <Play size={18} fill="currentColor" />
                        Resume Music
                      </button>
                    ) : (
                      <button className="btn-primary pause" onClick={handlePauseAudio}>
                        <Pause size={18} fill="currentColor" />
                        Pause Music
                      </button>
                    )}
                    <button className="btn-primary stop" onClick={handleStopAudio}>
                      <Square size={18} fill="currentColor" />
                      Stop Music
                    </button>
                  </div>
                </div>
              ) : isActive && !isPaused ? (
                <button className="btn-primary pause" onClick={handlePause}>
                  <Pause size={18} fill="currentColor" />
                  Pause Countdown
                </button>
              ) : isPaused ? (
                <button className="btn-primary resume" onClick={handleStart}>
                  <Play size={18} fill="currentColor" />
                  Resume Countdown
                </button>
              ) : (
                <button className="btn-primary start" onClick={handleStart} disabled={playlist.length === 0}>
                  <Play size={18} fill="currentColor" />
                  {playlist.length === 0 ? "Load Audio First" : "Start Countdown"}
                </button>
              )}

              <div className="btn-row">
                <button className="btn-secondary" onClick={handleReset}>
                  <RotateCcw size={13} />
                  Reset
                </button>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-icon" onClick={() => adjustVolume(-0.1)} title="Volume Down">
                    <Volume1 size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => adjustVolume(0.1)} title="Volume Up">
                    <Volume2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CHANNEL INFO */}
          <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
            <div className="panel-header">
              <Radio size={12} color="var(--text-dim)" />
              <span className="panel-title"><span className="panel-title-accent">03</span> — CHANNEL</span>
            </div>
            <div className="panel-body" style={{ flex: 1 }}>

              {/* Signal meter */}
              <div className="section-label">Signal Level</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
                {["L", "R"].map((ch) => (
                  <div key={ch} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-muted)", width: 10 }}>{ch}</span>
                    <div style={{ flex: 1, height: 8, background: "var(--border2)", borderRadius: 1, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: isPlaying ? `${70 + Math.sin(Date.now() / 300) * 20}%` : isActive ? "30%" : "0%",
                        background: "linear-gradient(to right, var(--green), var(--amber) 80%, var(--red))",
                        transition: "width 0.15s ease",
                        borderRadius: 1
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              <div className="section-label">Session</div>
              <div className="info-row">
                <span className="info-label">Mode</span>
                <span className="info-value" style={{ fontSize: 13 }}>LIVE CUE</span>
              </div>
              <div className="info-row">
                <span className="info-label">Format</span>
                <span className="info-value" style={{ fontSize: 13 }}>MP3/WAV</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-value" style={{ fontSize: 12, color: statusColor }}>{statusLabel}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Cue Count</span>
                <span className="info-value accent">{tick}</span>
              </div>

              <div className="divider" />

              {/* Mini waveform decoration */}
              <div className="section-label">Audio Monitor</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 48 }}>
                {[...Array(20)].map((_, i) => {
                  const base = [30, 50, 80, 60, 90, 40, 70, 55, 85, 45, 75, 65, 95, 35, 80, 55, 70, 45, 60, 40];
                  return (
                    <div key={i} style={{
                      width: 3,
                      height: `${isPlaying ? base[i] + Math.sin(Date.now() / 200 + i) * 15 : isActive ? base[i] * 0.3 : 8}%`,
                      background: isPlaying ? "var(--green)" : "var(--border)",
                      borderRadius: 1,
                      opacity: isPlaying ? 0.8 : 0.4,
                      transition: "height 0.15s ease"
                    }} />
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Hidden audio */}
        <audio
          ref={audioRef}
          src={audioUrl || undefined}
          onEnded={handleAudioEnded}
          preload="auto"
        />
      </div>
    </>
  );
}