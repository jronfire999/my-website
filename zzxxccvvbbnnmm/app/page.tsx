"use client";

import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const lock = () => {
      if (document.visibilityState === "hidden") {
        void fetch("/api/auth/lock", { method: "POST", credentials: "same-origin", keepalive: true });
        setSignedIn(false);
      }
    };
    const lockOnPageExit = () => {
      void fetch("/api/auth/lock", { method: "POST", credentials: "same-origin", keepalive: true });
    };
    document.addEventListener("visibilitychange", lock);
    window.addEventListener("pagehide", lockOnPageExit);
    return () => {
      document.removeEventListener("visibilitychange", lock);
      window.removeEventListener("pagehide", lockOnPageExit);
    };
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
      setSignedIn(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/lock", { method: "POST", credentials: "same-origin" });
    setSignedIn(false);
  }

  return (
    <main className="shell">
      <section className="panel" aria-labelledby="heading">
        <div className="mark" aria-hidden="true">Z</div>
        <h1 id="heading">zzxxccvvbbnnmm</h1>
        {signedIn ? (
          <>
            <p className="sub">You are signed in. The secure messaging layer is still being built and is not ready for private messages or files.</p>
            <p className="pill">Private chat setup in progress</p>
            <button className="primary" type="button" onClick={signOut}>Lock now</button>
          </>
        ) : (
          <>
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
          </>
        )}
        <p className="foot">Two authorized accounts only. This page attempts to lock when hidden or closed; browser and network behavior can delay that request. Server-side session expiry is also enforced.</p>
      </section>
    </main>
  );
}
