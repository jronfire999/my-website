"use client";

import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // A reload starts locked. No authentication material is kept in browser storage.
    void fetch("/api/auth/lock", { method: "POST", credentials: "same-origin" });
    const lock = () => {
      if (document.visibilityState === "hidden") {
        void fetch("/api/auth/lock", { method: "POST", credentials: "same-origin", keepalive: true });
      }
    };
    document.addEventListener("visibilitychange", lock);
    return () => document.removeEventListener("visibilitychange", lock);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed.");
      setPassword("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="heading">
        <div className="mark" aria-hidden="true">Z</div>
        <h1 id="heading">zzxxccvvbbnnmm</h1>
        <p className="sub">A private space for two people. Enter your password to continue.</p>
        <form onSubmit={submit}>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            className="field"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={12}
            maxLength={256}
          />
          <button className="primary" type="submit" disabled={busy || password.length < 12}>
            {busy ? "Checking…" : "Continue"}
          </button>
          {error && <p className="error" role="alert">{error}</p>}
        </form>
        <p className="foot">Access is limited to two authorized accounts. Sessions lock when this page is refreshed or hidden. Do not use this service until setup and security checks are complete.</p>
      </section>
    </main>
  );
}