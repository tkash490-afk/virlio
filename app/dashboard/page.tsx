"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import UrlInput from "@/components/UrlInput";
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      }
    }

    checkUser();
  }, [router]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
  Welcome to Virlio 🚀
</h1>

<UrlInput />
    </DashboardLayout>
  );
}