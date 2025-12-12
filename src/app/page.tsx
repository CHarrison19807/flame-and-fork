"use client";

export default function Home() {
  return (
    <main>
      <button onClick={() => (window.location.href = "/api/auth/google")}>
        Sign in with Google
      </button>
    </main>
  );
}
