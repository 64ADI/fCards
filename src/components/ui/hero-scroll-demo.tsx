"use client";
import React, { useRef, useState, useEffect } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Play, Pause } from "lucide-react";

export function HeroScrollDemo({ videoSrc }: { videoSrc?: string }) {
  // default placeholder mp4 — use public/trailer.mp4 if present
  const src = videoSrc ?? "/trailer.mp4";
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const togglePlay = async () => {
    const v = videoRef.current;
    if (!v) return;

    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      // enable audio when the user intentionally plays
      v.muted = false;
      try {
        await v.play();
        setIsPlaying(true);
      } catch (e) {
        // fallback for blocked unmuted autoplay — try muted play
        v.muted = true;
        await v.play().catch(() => {});
        setIsPlaying(!v.paused);
      }
    }
  };

  const handleVideoClick = () => {
    const v = videoRef.current;
    if (!v) return;

    // If video is currently playing, clicking it will stop and reset to start so user can replay
    if (isPlaying) {
      v.pause();
      try {
        v.currentTime = 0;
      } catch (e) {
        // ignore if setting currentTime is not allowed
      }
      setIsPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    const v = videoRef.current;
    if (!v) return;
    // Show overlay and reset position so user can replay
    try {
      v.pause();
      v.currentTime = 0;
    } catch (e) {}
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col overflow-hidden pb-24 pt-8">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Quick Demo
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Watch a short demo to get started
            </p>
          </>
        }
      >
        <div className="h-full w-full flex items-center justify-center">
          <div className="relative h-full w-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={src}
              playsInline
              onClick={handleVideoClick}
              onEnded={handleVideoEnded}
              className="mx-auto rounded-2xl object-cover h-full w-full cursor-pointer"
            />

            {/* Center play button overlay — hidden once playing to avoid nuisance */}
            {!isPlaying && (
              <button
                aria-label="Play demo video"
                onClick={togglePlay}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    togglePlay();
                  }
                }}
                className="absolute z-20 flex items-center justify-center h-20 w-20 rounded-full bg-black/60 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Play className="h-8 w-8" />
              </button>
            )}
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
