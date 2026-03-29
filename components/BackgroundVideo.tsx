'use client';

import { useEffect, useRef, memo } from 'react';
import Hls from 'hls.js';

const VIDEO_SRC = 'https://stream.mux.com/s8pMcOvMQXc4GD6AX4e1o01xFogFxipmuKltNfSYza0200.m3u8';

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
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}

const BackgroundVideo = memo(BackgroundVideoInner);
export default BackgroundVideo;
