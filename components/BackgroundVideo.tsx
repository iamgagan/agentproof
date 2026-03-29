'use client';

import { useEffect, useRef, memo } from 'react';
import Hls from 'hls.js';

const VIDEO_SRC = 'https://stream.mux.com/hUT6X11m1Vkw1QMxPOLgI761x2cfpi9bHFbi5cNg4014.m3u8';

function playVideo(video: HTMLVideoElement) {
  video.play().catch((err) => {
    if (err.name !== 'AbortError') {
      console.debug('[BackgroundVideo] play rejected:', err);
    }
  });
}

function BackgroundVideoInner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hlsRef.current = hls;
      hls.loadSource(VIDEO_SRC);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => playVideo(video));

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    }

    // Safari native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const onLoaded = () => playVideo(video);
      video.src = VIDEO_SRC;
      video.addEventListener('loadedmetadata', onLoaded);

      return () => {
        video.removeEventListener('loadedmetadata', onLoaded);
      };
    }
  }, []);

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover -z-10"
    />
  );
}

const BackgroundVideo = memo(BackgroundVideoInner);
export default BackgroundVideo;
