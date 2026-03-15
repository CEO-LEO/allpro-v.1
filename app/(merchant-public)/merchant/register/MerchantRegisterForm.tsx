'use client';

import { useActionState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Building2, FileCheck2, Landmark, UploadCloud, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { registerMerchantAction, type MerchantRegisterState } from './actions';

const initialState: MerchantRegisterState = {
  success: false,
  message: '',
};

export default function MerchantRegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerMerchantAction, initialState);

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/merchant/dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [router, state.success]);

  const statusClassName = useMemo(() => {
    if (!state.message) return '';
    return state.success
      ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
      : 'border-red-500/40 bg-red-500/15 text-red-200';
  }, [state.message, state.success]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-2xl border border-blue-900/60 bg-slate-900/70 p-5 shadow-2xl backdrop-blur sm:p-6 lg:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Merchant Onboarding</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">สมัครเป็น Partner กับ Pro Hunter</h2>
            <p className="mt-2 text-sm text-slate-300">
              กรอกข้อมูลธุรกิจเพื่อเปิดใช้งานระบบ Merchant Deal Management และ Hyper-local Search
            </p>
          </div>
          <div className="hidden h-11 w-11 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/15 text-blue-200 sm:flex">
            <Store className="h-5 w-5" />
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-blue-100">
              <Building2 className="h-4 w-4" />
              ชื่อร้าน / ชื่อนิติบุคคล
            </span>
            <input
              name="shopName"
              required
              placeholder="เช่น Siam Coffee Co., Ltd."
              className="w-full rounded-xl border border-blue-900/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>

          <label className="block space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-blue-100">
              <Landmark className="h-4 w-4" />
              ชื่อสาขาหลัก
            </span>
            <input
              name="branchName"
              required
              placeholder="เช่น Siam Coffee - Central Rama 9"
              className="w-full rounded-xl border border-blue-900/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-blue-100">
                <FileCheck2 className="h-4 w-4" />
                Tax ID
              </span>
              <input
                name="taxId"
                required
                inputMode="numeric"
                maxLength={13}
                placeholder="13 หลัก"
                className="w-full rounded-xl border border-blue-900/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-blue-100">โลโก้ร้าน (URL)</span>
              <input
                name="logoUrl"
                type="url"
                placeholder="https://..."
                className="w-full rounded-xl border border-blue-900/70 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
              />
            </label>
          </div>

          <div className="rounded-xl border border-dashed border-blue-700/70 bg-slate-950/60 p-4">
            <p className="mb-3 text-sm font-medium text-blue-100">อัปโหลดเอกสารร้านค้า (Mockup UI)</p>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-blue-800/70 bg-slate-900/80 px-4 py-6 text-sm text-blue-200 transition hover:border-blue-500 hover:bg-slate-900">
              <UploadCloud className="h-4 w-4" />
              เลือกไฟล์หนังสือรับรอง / ภพ.20 (ยังไม่อัปโหลดจริง)
              <input type="file" name="documents" className="hidden" />
            </label>
            <p className="mt-2 text-xs text-slate-400">* ขั้นตอนนี้เป็น mockup สำหรับ UI เท่านั้น</p>
          </div>

          {state.message ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${statusClassName}`}>{state.message}</div>
          ) : null}

          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
            disabled={isPending}
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? 'กำลังส่งข้อมูล...' : 'สมัคร Partner'}
          </motion.button>
        </form>
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        className="rounded-2xl border border-blue-900/60 bg-gradient-to-b from-slate-900/90 to-blue-950/70 p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-white">สิทธิประโยชน์สำหรับ Partner</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          <li className="rounded-lg border border-blue-900/50 bg-slate-900/60 p-3">จัดการโปรโมชันรายสาขาแบบเรียลไทม์</li>
          <li className="rounded-lg border border-blue-900/50 bg-slate-900/60 p-3">เข้าถึง Merchant Analytics และโฆษณา</li>
          <li className="rounded-lg border border-blue-900/50 bg-slate-900/60 p-3">แสดงผลทันทีในระบบ Hyper-local Search</li>
        </ul>

        <div className="mt-6 rounded-xl border border-blue-800/70 bg-blue-900/20 p-4 text-xs text-blue-100">
          หลังจากส่งคำขอ ระบบจะอัปเดตบทบาทบัญชีเป็น merchant และตั้งสถานะร้านเป็น pending เพื่อรอตรวจสอบ
        </div>
      </motion.aside>
    </div>
  );
}
