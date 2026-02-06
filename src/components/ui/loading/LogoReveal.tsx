'use client';

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function LogoReveal({
  onReady,
  onComplete,
  active,
}: {
  onReady: () => void;
  onComplete: () => void;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    setVideoSrc(window.innerWidth >= 768 ? "/reveal/lap.mp4" : "/reveal/mob.mp4");
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    const handleReady = () => onReady();
    if (video.readyState >= 3) {
      handleReady();
    } else {
      video.addEventListener("canplay", handleReady, { once: true });
    }
    return () => video.removeEventListener("canplay", handleReady);
  }, [onReady, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || !videoSrc) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.controls = false;
    video.playbackRate = 1.5;

    const handleEnd = () => onComplete();
    video.currentTime = 0;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        console.warn("Autoplay blocked by browser policy:", err);
      }
    };

    playVideo();

    video.addEventListener("ended", handleEnd, { once: true });
    return () => video.removeEventListener("ended", handleEnd);
  }, [active, onComplete, videoSrc]);

  return (
    <motion.div
      className="fixed inset-0 z-[9500] bg-white"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{
        opacity: active ? 1 : 0,
        scale: active ? 1 : 1.05,
      }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {videoSrc && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={videoSrc}
          muted
          playsInline
          autoPlay
          webkit-playsinline="true"
          preload="auto"
          controls={false}
        />
      )}
    </motion.div>
  );
}
