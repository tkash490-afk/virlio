"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [status, setStatus] = useState("Checking Supabase...");

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.auth.getSession();

      if (error) {
        setStatus("❌ Supabase connection failed");
        console.error(error);
      } else {
        setStatus("✅ Supabase connected successfully!");
      }
    }

    checkConnection();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">{status}</h1>
    </main>
  );
}