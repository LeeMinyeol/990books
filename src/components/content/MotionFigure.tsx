"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 움직이는 그림(HyperFrames로 만든 MP4). 화면 전체를 먼저 보여준 뒤 볼 곳을 확대한다.
 * - 화면에 들어오면 한 번 재생하고 마지막 장면(강조와 설명)에서 멈춘다. 반복하지 않는다.
 * - 모션 줄이기 설정이면 자동 재생하지 않고 마지막 장면을 보여준다.
 * - 포스터는 같은 이름에 -poster.jpg를 붙인 마지막 장면 이미지다.
 */
export default function MotionFigure({ src, alt }: { src: string; alt: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);
  const poster = src.replace(/\.mp4$/, "-poster.jpg");

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // 움직이지 않고 마지막 장면으로 건너뛴다
      const toEnd = () => {
        el.currentTime = el.duration;
        setEnded(true);
      };
      if (el.readyState >= 1) {
        const id = requestAnimationFrame(toEnd);
        return () => cancelAnimationFrame(id);
      }
      el.addEventListener("loadedmetadata", toEnd, { once: true });
      return () => el.removeEventListener("loadedmetadata", toEnd);
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && el.paused && !el.ended) {
          el.play().catch(() => setEnded(true));
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const replay = () => {
    const el = video.current;
    if (!el) return;
    setEnded(false);
    el.currentTime = 0;
    el.play().catch(() => setEnded(true));
  };

  return (
    <figure className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-line bg-panel">
      <video
        ref={video}
        src={src}
        poster={ended ? poster : undefined}
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
        onEnded={() => setEnded(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {ended && (
        <button
          type="button"
          onClick={replay}
          className="type-caption absolute bottom-3 left-3 flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-white/90 px-4 font-bold text-ink"
        >
          <span aria-hidden>↻</span> 다시 보기
        </button>
      )}
      <figcaption className="sr-only">{alt}</figcaption>
    </figure>
  );
}
