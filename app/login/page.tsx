"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful! 🎉");
    router.push("/dashboard");
  }

  async function handlePasswordReset() {
    if (!email) {
      alert("Enter your email address first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset email sent! Check your inbox.");
    setResetMode(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {resetMode ? "Reset your password 🔐" : "Welcome back 👋"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        {!resetMode && (
          <>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-3 mb-2"
            />

            <div className="text-right mb-6">
              <button
                onClick={() => setResetMode(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-white rounded-lg p-3 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {resetMode && (
          <>
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="w-full bg-black text-white rounded-lg p-3 hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>

            <button
              onClick={() => setResetMode(false)}
              className="w-full mt-3 text-gray-600 hover:underline"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </main>
  );
}