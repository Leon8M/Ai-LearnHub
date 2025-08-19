"use client";
import React from "react";
// No other imports are needed as this component will no longer perform sync logic.

export default function SyncClerkUser() {
  // This component's responsibility for syncing user data has been moved
  // to app/provider.jsx as per user's request.
  // It now simply renders nothing to avoid duplicate sync attempts or errors.
  return null;
}
