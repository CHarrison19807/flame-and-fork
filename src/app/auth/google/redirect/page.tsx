"use client";

import { useEffect } from "react";

export default function GoogleCallback() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const searchParams = url.search;
    url.search = "";

    window.history.replaceState(null, "", url.toString());
    fetch(`/api/auth/google/redirect${searchParams}`);
  }, []);

  return (
    <div>
      <h1>Processing Google OAuth Callback...</h1>
    </div>
  );
}
