"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  PictureInPicture2,
  Subtitles,
  SkipBack,
  SkipForward,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { cn, formatTimecode } from "@/lib/utils";
import { saveProgress } from "@/app/(app)/actions";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
/** Marca a aula como concluída ao passar deste ponto. */
const COMPLETE_THRESHOLD = 0.92;

export function VideoPlayer({
  src,
  poster,
  lessonId,
  courseId,
  initialPosition,
  initiallyCompleted,
  nextHref,
  title,
}: {
  src: string;
  poster?: string | null;
  lessonId: string;
  courseId: string;
  initialPosition: number;
  initiallyCompleted: boolean;
  nextHref?: string | null;
  title: string;
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [current, setCurrent] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [ended, setEnded] = useState(false);

  /** Guarda o progresso mais recente sem re-renderizar o player. */
  const completedRef = useRef(initiallyCompleted);
  const lastSaved = useRef(initialPosition);

  const persist = useCallback(
    (time: number, complete = false) => {
      lastSaved.current = time;
      if (complete) completedRef.current = true;
      void saveProgress(lessonId, courseId, time, complete);
    },
    [lessonId, courseId],
  );

  /* Retoma de onde parou. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0) return;

    const onLoaded = () => {
      // Não retoma se o aluno já estava praticamente no fim.
      if (initialPosition < video.duration - 10) {
        video.currentTime = initialPosition;
      }
    };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [initialPosition]);

  /* Salva o progresso a cada 10s de reprodução e ao sair da página. */
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || video.currentTime < 1) return;
      if (Math.abs(video.currentTime - lastSaved.current) >= 10) {
        persist(video.currentTime);
      }
    }, 10_000);

    const onLeave = () => {
      const video = videoRef.current;
      if (video && video.currentTime > 1) persist(video.currentTime);
    };
    window.addEventListener("pagehide", onLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", onLeave);
      onLeave();
    };
  }, [persist]);

  /* Some com os controles durante a reprodução. */
  const bumpControls = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !showSettings) {
        setShowControls(false);
      }
    }, 2800);
  }, [showSettings]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
      persist(video.currentTime);
    }
  }, [persist]);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(time, video.duration || 0));
  }, []);

  const skip = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (video) seek(video.currentTime + delta);
    },
    [seek],
  );

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void shellRef.current?.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  /* Atalhos de teclado, ignorando quando o foco está num campo de texto. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case "m":
          setMuted((m) => {
            if (videoRef.current) videoRef.current.muted = !m;
            return !m;
          });
          break;
        case "f":
          toggleFullscreen();
          break;
      }
      bumpControls();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [togglePlay, skip, toggleFullscreen, bumpControls]);

  const progressPct = duration ? (current / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  return (
    <div
      ref={shellRef}
      onMouseMove={bumpControls}
      onMouseLeave={() => playing && setShowControls(false)}
      className={cn(
        "group relative aspect-video w-full overflow-hidden bg-black select-none",
        fullscreen ? "rounded-none" : "rounded-xl",
        !showControls && playing && "cursor-none",
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        preload="metadata"
        playsInline
        className="h-full w-full"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          bumpControls();
        }}
        onPause={() => {
          setPlaying(false);
          setShowControls(true);
        }}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setWaiting(false);
        }}
        onTimeUpdate={(e) => {
          const video = e.currentTarget;
          setCurrent(video.currentTime);

          if (video.buffered.length) {
            setBuffered(video.buffered.end(video.buffered.length - 1));
          }

          // Conclui a aula uma única vez, perto do fim.
          if (
            !completedRef.current &&
            video.duration &&
            video.currentTime / video.duration >= COMPLETE_THRESHOLD
          ) {
            persist(video.currentTime, true);
            router.refresh();
          }
        }}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          setShowControls(true);
          persist(duration, true);
          router.refresh();
        }}
      />

      {/* Spinner de buffering */}
      {waiting && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-11 w-11 animate-spin text-white/80" />
        </div>
      )}

      {/* Play central quando pausado */}
      {!playing && !waiting && !ended && (
        <button
          onClick={togglePlay}
          aria-label="Reproduzir"
          className="absolute inset-0 flex items-center justify-center bg-black/25 transition-opacity duration-300"
        >
          <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-brand shadow-2xl transition-transform duration-400 ease-[var(--ease-out-expo)] hover:scale-110">
            <Play className="ml-1 h-8 w-8 fill-white text-white" />
          </span>
        </button>
      )}

      {/* Tela de fim de aula */}
      {ended && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/85 backdrop-blur-sm"
          style={{ animation: "fadeIn 0.4s ease-out both" }}
        >
          <p className="px-6 text-center font-display text-lg font-medium text-white">
            Aula concluída
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 px-6">
            <button
              onClick={() => {
                seek(0);
                void videoRef.current?.play();
              }}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm text-white transition hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
              Assistir novamente
            </button>
            {nextHref && (
              <button
                onClick={() => router.push(nextHref)}
                className="group/next flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-bright"
              >
                Próxima aula
                <SkipForward className="h-4 w-4 transition-transform group-hover/next:translate-x-0.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------ controles ----------------------------- */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 pt-16 pb-2.5 transition-all duration-400 sm:px-4",
          showControls
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        {/* Barra de progresso */}
        <div
          onClick={onScrub}
          className="group/bar relative mb-2.5 cursor-pointer py-2"
        >
          <div className="relative h-1 overflow-hidden rounded-full bg-white/25 transition-all duration-200 group-hover/bar:h-1.5">
            <div
              className="absolute inset-y-0 left-0 bg-white/25"
              style={{ width: `${bufferedPct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 bg-brand"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-brand shadow-lg transition-transform duration-200 group-hover/bar:scale-100"
            style={{ left: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <ControlButton
            onClick={togglePlay}
            label={playing ? "Pausar" : "Reproduzir"}
          >
            {playing ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
          </ControlButton>

          <ControlButton
            onClick={() => skip(-10)}
            label="Voltar 10 segundos"
            className="hidden sm:flex"
          >
            <SkipBack className="h-[1.15rem] w-[1.15rem]" />
          </ControlButton>

          <ControlButton
            onClick={() => skip(10)}
            label="Avançar 10 segundos"
            className="hidden sm:flex"
          >
            <SkipForward className="h-[1.15rem] w-[1.15rem]" />
          </ControlButton>

          {/* Volume */}
          <div className="group/vol flex items-center">
            <ControlButton
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                video.muted = !video.muted;
                setMuted(video.muted);
              }}
              label={muted ? "Ativar som" : "Silenciar"}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-[1.15rem] w-[1.15rem]" />
              ) : (
                <Volume2 className="h-[1.15rem] w-[1.15rem]" />
              )}
            </ControlButton>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => {
                const next = Number(e.target.value);
                setVolume(next);
                setMuted(next === 0);
                if (videoRef.current) {
                  videoRef.current.volume = next;
                  videoRef.current.muted = next === 0;
                }
              }}
              aria-label="Volume"
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all duration-300 group-hover/vol:ml-2 group-hover/vol:w-20 group-hover/vol:opacity-100 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          <span className="ml-1 font-mono text-[0.75rem] whitespace-nowrap text-white/90 tabular-nums">
            {/* Antes dos metadados carregarem não há duração: evita "12:24 / 00:00". */}
            {formatTimecode(duration ? current : 0)} / {formatTimecode(duration)}
          </span>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            {/* Velocidade */}
            <div className="relative">
              <button
                onClick={() => setShowSettings((s) => !s)}
                aria-label="Velocidade de reprodução"
                className="rounded px-2 py-1 font-mono text-[0.78rem] text-white/90 transition hover:bg-white/15 hover:text-white"
              >
                {speed}x
              </button>

              {showSettings && (
                <div
                  className="glass absolute right-0 bottom-full mb-2 w-32 overflow-hidden rounded-lg ring-1 ring-white/15"
                  style={{
                    animation: "animationIn 0.25s var(--ease-out-expo) both",
                  }}
                >
                  <p className="border-b border-white/10 px-3 py-2 text-[0.68rem] tracking-wider text-neutral-400 uppercase">
                    Velocidade
                  </p>
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setSpeed(s);
                        if (videoRef.current) videoRef.current.playbackRate = s;
                        setShowSettings(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-[0.8rem] transition",
                        s === speed
                          ? "bg-brand/15 text-brand"
                          : "text-neutral-300 hover:bg-white/[0.07] hover:text-white",
                      )}
                    >
                      {s === 1 ? "Normal" : `${s}x`}
                      {s === speed && (
                        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ControlButton
              onClick={() => setCaptions((c) => !c)}
              label="Legendas"
              className={cn("hidden sm:flex", captions && "text-brand")}
            >
              <Subtitles className="h-[1.15rem] w-[1.15rem]" />
            </ControlButton>

            <ControlButton
              onClick={() => setShowSettings((s) => !s)}
              label="Configurações"
              className="hidden sm:flex"
            >
              <Settings className="h-[1.15rem] w-[1.15rem]" />
            </ControlButton>

            <ControlButton
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                if (document.pictureInPictureElement) {
                  void document.exitPictureInPicture();
                } else {
                  void video.requestPictureInPicture?.();
                }
              }}
              label="Picture in picture"
              className="hidden sm:flex"
            >
              <PictureInPicture2 className="h-[1.15rem] w-[1.15rem]" />
            </ControlButton>

            <ControlButton
              onClick={toggleFullscreen}
              label={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {fullscreen ? (
                <Minimize className="h-[1.15rem] w-[1.15rem]" />
              ) : (
                <Maximize className="h-[1.15rem] w-[1.15rem]" />
              )}
            </ControlButton>
          </div>
        </div>
      </div>

      {/* Título sobreposto ao entrar em tela cheia */}
      {fullscreen && showControls && (
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent px-6 py-4">
          <p className="font-display text-lg font-medium text-white">{title}</p>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded text-white/90 transition-all duration-200 hover:bg-white/15 hover:text-white active:scale-90",
        className,
      )}
    >
      {children}
    </button>
  );
}
