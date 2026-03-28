"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { QrCode, X, CheckCircle, Camera, Upload, RefreshCw, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function QRScannerComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ xp: number; coins: number; message: string } | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLockRef = useRef(false);
  const rafRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamically import html5-qrcode only on client
  const scannerRef = useRef<any>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
  }, []);

  const handleScanSuccess = useCallback(async (code: string) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    setScanResult(code);
    stopCamera();
    setRedeeming(true);

    try {
      const res = await fetch("/api/qr/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success) {
        setRedeemResult({ xp: data.xp, coins: data.coins, message: data.message });
        toast.success(`🎉 ${data.message}`);
      } else {
        toast.error(data.error || "ไม่สามารถใช้คูปองนี้ได้");
        setRedeemResult(null);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setRedeemResult(null);
    } finally {
      setRedeeming(false);
    }
  }, [stopCamera]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setScanResult(null);
    setRedeemResult(null);
    scanLockRef.current = false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Lazy import QR decoder
      const { Html5Qrcode } = await import("html5-qrcode");

      // Frame-by-frame scanning via canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const qr = new Html5Qrcode("qr-hidden-element", /* verbose */ false);
      scannerRef.current = qr;

      const tick = () => {
        if (!streamRef.current || scanLockRef.current) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          canvas.toBlob(async (blob) => {
            if (!blob || scanLockRef.current) return;
            try {
              const file = new File([blob], "frame.png", { type: "image/png" });
              const result = await qr.scanFileV2(file, false);
              if (result?.decodedText) {
                handleScanSuccess(result.decodedText);
              }
            } catch {
              // No QR found in this frame — keep scanning
            }
          }, "image/png");
        }
        // Scan every ~300ms to reduce CPU usage
        rafRef.current = window.setTimeout(() => {
          requestAnimationFrame(tick);
        }, 300) as unknown as number;
      };
      requestAnimationFrame(tick);
    } catch (err: any) {
      if (err?.name === "NotAllowedError") {
        setCameraError("กรุณาอนุญาตให้เข้าถึงกล้องในการตั้งค่าเบราว์เซอร์");
      } else if (err?.name === "NotFoundError") {
        setCameraError("ไม่พบกล้องบนอุปกรณ์นี้");
      } else {
        setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาใช้การอัปโหลดรูปแทน");
      }
    }
  }, [facingMode, handleScanSuccess]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const qr = new Html5Qrcode("qr-hidden-element", false);
      const result = await qr.scanFileV2(file, false);
      if (result?.decodedText) {
        handleScanSuccess(result.decodedText);
      } else {
        toast.error("ไม่พบ QR Code ในรูปภาพนี้");
      }
    } catch {
      toast.error("ไม่พบ QR Code ในรูปภาพนี้");
    }
    // Reset so same file can be selected again
    e.target.value = "";
  }, [handleScanSuccess]);

  const toggleFacingMode = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stopCamera]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !scanResult) {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => {
    stopCamera();
    setIsOpen(false);
    setScanResult(null);
    setRedeemResult(null);
    setCameraError(null);
    scanLockRef.current = false;
  };

  return (
    <>
      {/* Hidden element for html5-qrcode (required) */}
      <div id="qr-hidden-element" className="hidden" />
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Floating QR button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-105"
        aria-label="Open QR Scanner"
      >
        <QrCode size={24} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-sm bg-gray-900 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm transition"
              aria-label="Close scanner"
            >
              <X size={20} />
            </button>

            <div className="px-6 pt-8 pb-4 text-center">
              <h2 className="text-white text-lg font-bold mb-5">สแกน QR Code รับแต้ม</h2>

              {/* Success State */}
              {scanResult ? (
                <div className="py-4">
                  {redeeming ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={48} className="text-orange-400 animate-spin" />
                      <p className="text-gray-300">กำลังตรวจสอบ...</p>
                    </div>
                  ) : redeemResult ? (
                    <>
                      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-white">สแกนสำเร็จ!</h3>
                      <p className="text-gray-400 mb-4 text-sm">{redeemResult.message}</p>
                      <div className="flex gap-4 justify-center text-sm">
                        <div className="bg-purple-900/60 px-4 py-2 rounded-lg">
                          <span className="text-purple-300 font-bold">+{redeemResult.xp} XP</span>
                        </div>
                        <div className="bg-yellow-900/60 px-4 py-2 rounded-lg">
                          <span className="text-yellow-300 font-bold">+{redeemResult.coins} Coins</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <X size={64} className="text-red-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-white">ไม่สำเร็จ</h3>
                      <p className="text-gray-400 mb-4 text-sm">คูปองนี้ไม่ถูกต้องหรือหมดอายุแล้ว</p>
                      <button
                        onClick={() => { setScanResult(null); setRedeemResult(null); scanLockRef.current = false; startCamera(); }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
                      >
                        ลองใหม่
                      </button>
                    </>
                  )}
                </div>
              ) : cameraError ? (
                /* Camera Error / Permission Denied */
                <div className="py-6">
                  <Camera size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-5">{cameraError}</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition"
                  >
                    <Upload size={16} />
                    อัปโหลดรูป QR Code
                  </button>
                </div>
              ) : (
                /* Camera View */
                <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scan frame overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Dim edges */}
                    <div className="absolute inset-0 border-[40px] sm:border-[50px] border-black/50" />
                    {/* Corner markers */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none">
                      {/* Top-left */}
                      <path d="M15 30 L15 15 L30 15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      {/* Top-right */}
                      <path d="M70 15 L85 15 L85 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      {/* Bottom-left */}
                      <path d="M15 70 L15 85 L30 85" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      {/* Bottom-right */}
                      <path d="M70 85 L85 85 L85 70" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {/* Scanning line animation */}
                    <div className="absolute left-[15%] right-[15%] h-0.5 bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-[scanline_2s_ease-in-out_infinite]" style={{ top: '50%' }} />
                  </div>
                </div>
              )}

              {/* Action buttons (camera mode only) */}
              {!scanResult && !cameraError && (
                <div className="flex justify-center gap-3 mt-4">
                  <button
                    onClick={toggleFacingMode}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white/80 rounded-lg text-xs hover:bg-white/20 transition"
                  >
                    <RefreshCw size={14} />
                    สลับกล้อง
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white/80 rounded-lg text-xs hover:bg-white/20 transition"
                  >
                    <Upload size={14} />
                    อัปโหลดรูป
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              <p className="text-gray-500 mt-4 text-xs">
                ส่องไปที่ QR Code ของร้านค้าเพื่อรับส่วนลดและคะแนนสะสม
              </p>
            </div>

            {/* Close button */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={closeModal}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scanline animation keyframes */}
      <style jsx global>{`
        @keyframes scanline {
          0%, 100% { top: 20%; }
          50% { top: 75%; }
        }
      `}</style>
    </>
  );
}
