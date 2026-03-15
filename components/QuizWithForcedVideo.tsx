"use client";

import React, { useEffect, useRef, useState } from "react";

type QuizWithForcedVideoProps = {
  storageKey?: string; // prefix for localStorage keys
  initialAttempts?: number;
  initialPassed?: boolean;
  onSubmit?: (answers: any) => void;
};

export default function QuizWithForcedVideo({
  storageKey = "quiz",
  initialAttempts = 0,
  initialPassed = false,
  onSubmit,
}: QuizWithForcedVideoProps) {
  const attemptsKey = `${storageKey}_attempts`;
  const passedKey = `${storageKey}_passed`;
  const videoWatchedKey = `${storageKey}_video_watched`;

  const [attempts, setAttempts] = useState<number>(initialAttempts);
  const [isPassed, setIsPassed] = useState<boolean>(initialPassed);
  const [forceVideoReplay, setForceVideoReplay] = useState<boolean>(false);
  const [videoWatched, setVideoWatched] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    try {
      const storedAttempts = localStorage.getItem(attemptsKey);
      const storedPassed = localStorage.getItem(passedKey);
      const storedVideoWatched = localStorage.getItem(videoWatchedKey);
      if (storedAttempts) setAttempts(parseInt(storedAttempts, 10));
      if (storedPassed) setIsPassed(storedPassed === "1");
      if (storedVideoWatched) setVideoWatched(storedVideoWatched === "1");
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(attemptsKey, String(attempts));
      localStorage.setItem(passedKey, isPassed ? "1" : "0");
      localStorage.setItem(videoWatchedKey, videoWatched ? "1" : "0");
    } catch (e) {
      // ignore
    }

    if (attempts >= 20 && !isPassed) {
      setForceVideoReplay(true);
      if (!videoWatched) setIsPlaying(false);
    }
  }, [attempts, isPassed, videoWatched, attemptsKey, passedKey, videoWatchedKey]);

  const handleSubmit = (answers?: any) => {
    if (forceVideoReplay && !videoWatched) {
      // block submit until video watched
      return;
    }

    setAttempts((a) => a + 1);
    if (onSubmit) onSubmit(answers ?? {});
  };

  const handleVideoPlay = () => {
    if (!videoRef.current) return;
    try {
      videoRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      // autoplay may be blocked; user must click
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setVideoWatched(true);
    setIsPlaying(false);
    setForceVideoReplay(false);
  };

  const resetProgress = () => {
    setAttempts(0);
    setIsPassed(false);
    setVideoWatched(false);
    setForceVideoReplay(false);
    try {
      localStorage.removeItem(attemptsKey);
      localStorage.removeItem(passedKey);
      localStorage.removeItem(videoWatchedKey);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {forceVideoReplay ? (
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">กรุณาชมวิดีโอทบทวนก่อนทำแบบทดสอบ</h3>
          <p className="text-sm text-gray-600 mt-2">คุณทำแบบทดสอบครบ {attempts} ครั้งแล้วและยังไม่ผ่าน โปรดดูวิดีโอทบทวนก่อนทำอีกครั้ง</p>

          <div className="mt-4">
            <div className="relative bg-black rounded overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 bg-black"
                // intentionally omit native controls to prevent skipping
                onEnded={handleVideoEnded}
                preload="metadata"
              >
                <source src="/videos/review.mp4" type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับวิดีโอนี้
              </video>

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                  <button
                    onClick={handleVideoPlay}
                    className="bg-white/90 text-purple-700 px-6 py-3 rounded shadow-lg font-medium"
                  >
                    เริ่มดูวิดีโอ (ไม่สามารถข้าม)
                  </button>
                </div>
              )}

              <div className="absolute top-3 right-3 bg-white/70 text-xs px-2 py-1 rounded">ไม่สามารถข้ามได้</div>
            </div>

            <div className="mt-4">
              {!videoWatched ? (
                <button disabled className="w-full bg-gray-300 text-gray-600 py-3 rounded">ยังไม่สามารถทำแบบทดสอบได้ (ต้องดูวิดีโอให้จบ)</button>
              ) : (
                <button onClick={() => setForceVideoReplay(false)} className="w-full bg-purple-600 text-white py-3 rounded">ดูวิดีโอจบแล้ว สามารถทำแบบทดสอบต่อ</button>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-500">หมายเหตุ: วางไฟล์วิดีโอทบทวนไว้ที่ <span className="font-mono">/public/videos/review.mp4</span></div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">แบบทดสอบตัวอย่าง</h3>
          <p className="text-sm text-gray-600 mt-2">ครั้งที่ทำแล้ว: {attempts} / 20</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit({});
            }}
            className="mt-4"
          >
            {/* Simplified sample question */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">ตัวอย่างคำถาม: 2 + 2 = ?</label>
                <div className="mt-2 space-x-3">
                  <label className="inline-flex items-center">
                    <input name="q1" type="radio" value="3" className="mr-2" />
                    3
                  </label>
                  <label className="inline-flex items-center">
                    <input name="q1" type="radio" value="4" className="mr-2" />
                    4
                  </label>
                  <label className="inline-flex items-center">
                    <input name="q1" type="radio" value="5" className="mr-2" />
                    5
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded">ส่งคำตอบ</button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex gap-3">
            <button onClick={() => setAttempts((a) => a + 1)} className="px-4 py-2 bg-gray-200 rounded">จำลองส่ง (เพิ่ม attempt)</button>
            <button onClick={() => { setIsPassed(true); }} className="px-4 py-2 bg-green-200 rounded">จำลองผ่าน</button>
            <button onClick={resetProgress} className="px-4 py-2 bg-red-100 rounded">รีเซ็ต</button>
          </div>
        </div>
      )}
    </div>
  );
}
