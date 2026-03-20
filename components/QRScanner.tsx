"use client";
import { useState, useEffect } from "react";
import { QrCode, X, CheckCircle } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function QRScannerComponent() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const { user } = useAppStore();

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // สำเร็จ - แสดงผล
          setScanResult(decodedText);
          scanner.clear();
          toast.success("🎉 สแกนสำเร็จ! คุณได้รับ +50 XP และ +20 Coins!");
          
          // ปิดหน้าต่างหลัง 3 วินาที
          setTimeout(() => {
            setIsScanning(false);
            setScanResult(null);
          }, 3000);
        },
        (error) => {
          // Error handling (ไม่ต้องแสดงเพราะจะ spam console)
          // console.warn(error);
        }
      );

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [isScanning]);

  return (
    <>
      {/* ปุ่มเปิด QR (ปุ่มส้ม ด้านบนปุ่มแชท) */}
      <button
        onClick={() => setIsScanning(true)}
        className="fixed bottom-24 right-6 z-40 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-105"
        aria-label="Open QR Scanner"
      >
        <QrCode size={24} />
      </button>

      {/* หน้าต่างสแกน (Modal) */}
      {isScanning && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsScanning(false)}
        >
          <div
            className="relative w-full max-w-sm bg-gray-900 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.4)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X button — มุมขวาบนของการ์ด */}
            <button
              onClick={() => setIsScanning(false)}
              className="absolute top-3 right-3 z-10 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full backdrop-blur-sm transition"
              aria-label="Close scanner"
            >
              <X size={20} />
            </button>

            <div className="px-6 pt-8 pb-4 text-center">
              <h2 className="text-white text-lg font-bold mb-5">สแกน QR Code รับแต้ม</h2>

              {!scanResult ? (
                <div
                  id="qr-reader"
                  className="rounded-xl overflow-hidden"
                ></div>
              ) : (
                <div className="py-4">
                  <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">สแกนสำเร็จ!</h3>
                  <p className="text-gray-400 mb-4">โค้ด: {scanResult}</p>
                  <div className="flex gap-4 justify-center text-sm">
                    <div className="bg-purple-900/60 px-4 py-2 rounded-lg">
                      <span className="text-purple-300 font-bold">+50 XP</span>
                    </div>
                    <div className="bg-yellow-900/60 px-4 py-2 rounded-lg">
                      <span className="text-yellow-300 font-bold">+20 Coins</span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-gray-500 mt-4 text-xs">
                ส่องไปที่ QR Code ของร้านค้าเพื่อรับส่วนลดและคะแนนสะสม
              </p>
            </div>

            {/* ปุ่มปิดด้านล่างเต็มความกว้าง */}
            <div className="px-6 pb-6 pt-2">
              <button
                onClick={() => setIsScanning(false)}
                className="w-full py-3 rounded-xl text-sm font-semibold bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
