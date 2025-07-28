"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BadgeCheck } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";


export default function EarnTokens() {
  const [adsWatched, setAdsWatched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [earned, setEarned] = useState(false);

  const handleEarn = async () => {
    if (adsWatched < 2) return alert("Watch 2 ads to earn 1 token.");
    setLoading(true);

    try {
      const res = await fetch("/api/user/earn-token", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEarned(true);
        alert("🎉 You’ve earned 1 token!");
        setAdsWatched(0);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Earn token error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdWatched = () => {
    setAdsWatched((prev) => Math.min(prev + 1, 2));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">Earn Tokens by Watching Ads</h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {[1, 2].map((adIndex) => (
          <Card key={adIndex} className="bg-[#111111] border border-neutral-700 text-[#EAEAEA]">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Ad {adIndex}
                {adsWatched >= adIndex && <BadgeCheck className="text-[#00F5A0]" size={20} />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AdSlot
                adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID}
                className="w-full"
              />
              <Button
                onClick={handleAdWatched}
                disabled={adsWatched >= adIndex}
                className="mt-4 w-full bg-[#00F5A0] text-black hover:bg-[#00ffb7]"
              >
                Mark Ad {adIndex} as Watched
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button
          onClick={handleEarn}
          disabled={adsWatched < 2 || loading || earned}
          className="bg-[#00F5A0] text-black hover:bg-[#00ffb7] w-full md:w-auto"
        >
          <Sparkles className="mr-2" size={18} />
          {earned ? "Token Earned 🎉" : "Claim 1 Token"}
        </Button>
        <p className="text-sm text-gray-400 mt-2">Watch 2 ads to earn 1 token.</p>
      </div>
    </div>
  );
}
