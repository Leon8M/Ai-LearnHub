'use client';

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BadgeCheck, Gem, Loader2, HandCoins } from "lucide-react"; // Added Gem, Loader2, HandCoins
import AdSlot from "@/components/ui/AdSlot";
import { toast } from "sonner";
import { motion } from "framer-motion"; // For animations

export default function EarnTokens() {
  const [adsWatched, setAdsWatched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [earned, setEarned] = useState(false);

  // Sync with localStorage on component mount
  useEffect(() => {
    const count = parseInt(localStorage.getItem("kamusi_adsWatched") || "0", 10);
    setAdsWatched(count);
    // Reset earned state on mount if user navigates back
    setEarned(false); 
  }, []);

  // Callback for when an ad is "watched"
  const handleAdWatched = useCallback(() => {
    setAdsWatched(prevCount => {
      const newCount = prevCount + 1;
      localStorage.setItem("kamusi_adsWatched", newCount.toString());
      return newCount;
    });
  }, []);

  const handleEarn = async () => {
    if (adsWatched < 2) {
      toast.info("Please watch 2 ads fully to activate the claim button.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/user/watch-ad-token", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        toast.success("🎉 You’ve earned 1 token!");
        setEarned(true);
        localStorage.setItem("kamusi_adsWatched", "0"); // Reset count after successful claim
        setAdsWatched(0); // Update state to reflect reset
      } else {
        toast.error(data.error || "Something went wrong. Try again.");
      }
    } catch (err) {
      console.error("Token earn error:", err);
      toast.error("Failed to claim token. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled = adsWatched < 2 || loading || earned;

  return (
    <div className="p-4 md:p-6 bg-[var(--background)] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-[var(--foreground)] mb-3">
          Earn Tokens for <span className="kamusi-logo">Kamusi AI</span>
        </h2>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Support our platform and earn tokens to generate more amazing courses! Watch two short ads to claim your free token.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2"> {/* Adjusted grid for 2 ads */}
        {[1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
              <CardHeader className="border-b border-[var(--border)] pb-4">
                <CardTitle className="flex items-center justify-between text-xl font-semibold text-[var(--foreground)]">
                  Ad Slot {index}
                  {adsWatched >= index ? (
                    <BadgeCheck className="text-green-500" size={24} />
                  ) : (
                    <HandCoins className="text-[var(--primary)]" size={24} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-[var(--muted)] rounded-lg overflow-hidden flex items-center justify-center min-h-[180px] max-h-[300px]">
                  <AdSlot
                    adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                    adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID} // Using the same slot ID for both, as per previous setup
                    className="w-full h-full" // Ensure ad slot takes full height
                    onAdWatched={handleAdWatched} // Pass the callback here
                  />
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-4 text-center">
                  Ad loads automatically. Watch for 5 seconds to count.
                </p>
                <div className="text-center mt-2">
                  {adsWatched >= index ? (
                    <p className="text-green-600 font-medium flex items-center justify-center gap-1">
                      <BadgeCheck className="w-4 h-4" /> Watched!
                    </p>
                  ) : (
                    <p className="text-[var(--muted-foreground)] flex items-center justify-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" /> Waiting...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center space-y-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          You have watched {adsWatched} out of 2 ads.
        </p>
        <Button
          onClick={handleEarn}
          disabled={buttonDisabled}
          className="btn-primary w-full sm:w-auto !h-14 !text-lg !px-8 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Claiming...
            </>
          ) : earned ? (
            <>
              <BadgeCheck className="w-5 h-5" /> Token Earned 🎉
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> Claim 1 Token
            </>
          )}
        </Button>
        {!buttonDisabled && !earned && (
          <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
            Click to claim your token!
          </p>
        )}
      </div>
    </div>
  );
}
