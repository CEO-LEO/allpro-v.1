"use client";

import { useEffect, useRef } from "react";
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
  const hasRedirected = useRef(false);

  // Reset redirect flag when pathname changes (user navigated back)
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  useEffect(() => {
    // ★ Wait for hydration to finish before making any redirect decisions
    if (isHydrating) return;

    // ★ Prevent duplicate redirects (avoids Maximum update depth exceeded)
    if (hasRedirected.current) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      if (pathname.startsWith('/merchant')) {
        hasRedirected.current = true;
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
      hasRedirected.current = true;
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
      return;
    }

    // Check specific required role
    if (neededRole && userRole !== neededRole) {
      hasRedirected.current = true;
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push(redirectTo);
    }
  }, [pathname, user, isAuthenticated, isHydrating, requiredRole, redirectTo, router]);

  // ★ While hydrating, show nothing (layout will show its own loading)
  if (isHydrating) return null;

  if (!isAuthenticated && pathname.startsWith('/merchant')) return null;

  return <>{children}</>;
}
