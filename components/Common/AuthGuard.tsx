"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "react-hot-toast";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'merchant';
  redirectTo?: string;
}

export default function AuthGuard({ 
  children, 
  requiredRole,
  redirectTo = '/'
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrating } = useAuthStore();

  useEffect(() => {
    // ★ Wait for hydration to finish before making any redirect decisions
    if (isHydrating) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (pathname.startsWith('/merchant')) {
        toast.error('กรุณาเข้าสู่ระบบก่อน');
        router.push('/');
      }
      return;
    }

    // Role checking helper
    const userRole = user?.role?.toLowerCase();
    const neededRole = requiredRole?.toLowerCase();

    // Check if user is trying to access merchant routes but isn't a merchant
    if (pathname.startsWith('/merchant') && userRole !== 'merchant') {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
      return;
    }

    // Check specific required role
    if (neededRole && userRole !== neededRole) {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push(redirectTo);
    }
  }, [pathname, user, isAuthenticated, isHydrating, requiredRole, redirectTo, router]);

  // ★ While hydrating, show nothing (layout will show its own loading)
  if (isHydrating) return null;

  if (!isAuthenticated && pathname.startsWith('/merchant')) return null;

  return <>{children}</>;
}
