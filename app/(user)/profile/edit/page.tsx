"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeftIcon, CameraIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update store
    updateProfile({
      name: formData.name,
      phone: formData.phone
    });

    toast.success("✓ บันทึกข้อมูลสำเร็จ", {
      duration: 3000,
      style: {
        background: "#10b981",
        color: "white",
        fontWeight: "bold"
      }
    });

    setIsSubmitting(false);
    router.push("/profile");
  };

  const handleAvatarClick = () => {
    toast("📷 การเปลี่ยนรูปโปรไฟล์จะเปิดใช้งานในเร็วๆ นี้", {
      icon: "🚧",
      duration: 2000
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </motion.button>
            </Link>
            
            <h1 className="text-2xl font-bold">แก้ไขโปรไฟล์</h1>
            
            <div className="w-10"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col items-center mb-8"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              
              <motion.button
                type="button"
                onClick={handleAvatarClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border-4 border-orange-50 dark:border-gray-900"
              >
                <CameraIcon className="w-6 h-6 text-orange-500" />
              </motion.button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              คลิกเพื่อเปลี่ยนรูปโปรไฟล์
            </p>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-5"
          >
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="กรอกชื่อของคุณ"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                ไม่สามารถเปลี่ยนอีเมลได้
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0XX-XXX-XXXX"
              />
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-4"
          >
            <h3 className="font-bold text-gray-900 dark:text-white">ข้อมูลบัญชี</h3>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">สมาชิกตั้งแต่</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : "มกราคม 2026"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">User ID</span>
              <span className="text-gray-900 dark:text-white font-mono text-sm">
                {user?.id?.substring(0, 8) || "XXXXXXXX"}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Link href="/profile" className="flex-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl font-bold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ยกเลิก
              </motion.button>
            </Link>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-4 rounded-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
