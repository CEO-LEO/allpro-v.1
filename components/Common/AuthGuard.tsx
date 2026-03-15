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
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
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
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้'); // "You don't have permission"
      router.push('/');
      return;
    }

    // Check specific required role
    if (neededRole && userRole !== neededRole) {
      toast.error('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push(redirectTo);
    }
  }, [pathname, user, isAuthenticated, requiredRole, redirectTo, router]);

  // If not authenticated or role mismatch, we might render nothing or a loader, 
  // but since it's client-side redirect, children might render briefly.
  // We can return null if checking strictly, but let's keep it simple as before.
  if (!isAuthenticated && pathname.startsWith('/merchant')) return null;

  return <>{children}</>;
}
