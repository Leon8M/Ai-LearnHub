"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BadgeCheck } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";
import { toast } from "sonner";

export default function EarnTokens() {
  const [adsWatched, setAdsWatched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [earned, setEarned] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    const count = parseInt(localStorage.getItem("watchedAds") || "0");
    setAdsWatched(count);
  }, []);

  const handleEarn = async () => {
    if (adsWatched < 2) {
      toast.info("Watch 2 ads to earn a token.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/user/earn-token", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success("🎉 You’ve earned 1 token!");
        setEarned(true);
        localStorage.setItem("watchedAds", "0");
        setAdsWatched(0);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Token earn error:", err);
      toast.error("Failed to claim token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-foreground">Earn Tokens by Watching Ads</h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2].map((index) => (
          <Card key={index} className="hover-scale shadow-sm border border-sidebar-border transition-all">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Ad {index}
                {adsWatched >= index && <BadgeCheck className="text-sidebar-primary" size={20} />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdSlot
                adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID}
                className="w-full min-h-[150px]"
              />
              <p className="text-sm text-muted-foreground mt-3">
                Ad loads automatically. Stay on this section for 5 seconds to count as watched.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center space-y-2">
        <Button
          onClick={handleEarn}
          disabled={adsWatched < 2 || loading || earned}
          className="btn-primary w-full sm:w-auto"
        >
          <Sparkles className="mr-2" size={18} />
          {earned ? "Token Earned 🎉" : "Claim 1 Token"}
        </Button>
        <p className="text-sm text-muted-foreground">Watch 2 ads fully to claim a token.</p>
      </div>
    </div>
  );
}
