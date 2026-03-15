"use client";

import React from "react";
import dynamic from "next/dynamic";

const QuizWithForcedVideo = dynamic(() => import("@/components/QuizWithForcedVideo"), { ssr: false });

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">หน้าทดสอบ (Demo)</h1>
        <p className="text-gray-600 mb-6">ตัวอย่างการบังคับให้ดูวิดีโออีกครั้งเมื่อทำครบ 20 ครั้งแต่ยังไม่ผ่าน</p>

        <QuizWithForcedVideo storageKey="pim_quiz_demo" initialAttempts={20} initialPassed={false} />
      </div>
    </div>
  );
}
