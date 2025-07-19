"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";

export default function SyncClerkUser() {
  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!synced && isLoaded && user?.emailAddresses?.[0]?.emailAddress && user.id) {
      const syncUser = async () => {
        try {
          await axios.post("/api/user", {
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
            subID: user.id, // ✅ Send this
          });
          setSynced(true); // prevent multiple posts
        } catch (err) {
          console.error("Failed to sync user:", err);
        }
      };

      syncUser();
    }
  }, [isLoaded, user, synced]);

  return null;
}
