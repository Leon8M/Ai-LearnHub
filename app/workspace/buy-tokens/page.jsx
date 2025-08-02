'use client';

import { useEffect, useState, useCallback, Suspense } from "react"; // Import Suspense
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BadgeCheck, Gem, Loader2, HandCoins, CreditCard } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot"; // Assuming AdSlot component exists
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic'; // Import dynamic from next/dynamic

// Dynamically import PaystackPop with SSR disabled
// This ensures PaystackPop is only loaded on the client-side, where 'window' is defined.
const PaystackPop = dynamic(() => import('@paystack/inline-js'), { ssr: false });

// Define token packages for purchase
const TOKEN_PACKAGES = [
  { id: 'single', tokens: 1, price: 50, label: 'Buy 1 Token', description: 'Quick top-up for a single course.' },
  { id: 'starter', tokens: 3, price: 100, label: 'Starter Pack', description: 'Great for getting started with multiple courses.' },
  { id: 'pro', tokens: 10, price: 250, label: 'Pro Pack', description: 'For serious learners and content creators.' },
  { id: 'master', tokens: 30, price: 500, label: 'Master Pack', description: 'Unlock extensive learning and creation.' },
];

// Create a separate component to wrap with Suspense
function EarnTokensContent() {
  const [adsWatched, setAdsWatched] = useState(0);
  const [loading, setLoading] = useState(false); // For ad-watching claim button
  const [earned, setEarned] = useState(false); // For ad-watching claim success
  const [purchaseLoading, setPurchaseLoading] = useState(false); // For purchase buttons
  const searchParams = useSearchParams(); // This hook is now safely inside a client-side component

  // Sync with localStorage on component mount and handle payment redirects
  useEffect(() => {
    // Check if window is defined before accessing localStorage
    if (typeof window !== 'undefined') {
      const count = parseInt(localStorage.getItem("kamusi_adsWatched") || "0", 10);
      setAdsWatched(count);
      setEarned(false); 

      // Handle Paystack redirect status (from callback_url)
      const status = searchParams.get('status');
      const purchasedTokens = searchParams.get('tokens');
      const reference = searchParams.get('reference');

      if (status === 'success' && purchasedTokens && reference) {
        // For Paystack, the actual token update should happen via webhook for security.
        // Here, we'll just show a success message based on the redirect.
        // The webhook will handle the actual token credit.
        toast.success(`🎉 Payment initiated successfully for ${purchasedTokens} tokens! Your tokens will be added shortly.`);
        // Clear URL params to prevent re-triggering toast on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (status === 'cancelled') {
        toast.error("Payment cancelled. No tokens were added.");
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [searchParams]);

  // Callback for when an ad is "watched"
  const handleAdWatched = useCallback(() => {
    setAdsWatched(prevCount => {
      const newCount = prevCount + 1;
      // Check if window is defined before accessing localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem("kamusi_adsWatched", newCount.toString());
      }
      return newCount;
    });
  }, []);

  // Handle claiming tokens from watching ads
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
        // Check if window is defined before accessing localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem("kamusi_adsWatched", "0"); // Reset count after successful claim
        }
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

  // Handle purchasing tokens via Paystack
  const handlePurchase = async (packageId) => {
    setPurchaseLoading(true);
    try {
      const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
      if (!pkg) {
        toast.error("Invalid package selected.");
        setPurchaseLoading(false);
        return;
      }

      // Call your backend to initialize Paystack transaction
      const res = await fetch('/api/paystack-initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();

      if (!res.ok || !data.authorization_url) {
        toast.error(data.error || "Failed to initiate purchase. Please try again.");
        return;
      }

      // Redirect to Paystack's hosted page
      if (typeof window !== 'undefined') { // Guard for client-side execution
        window.location.href = data.authorization_url;
      }


    } catch (error) {
      console.error("Purchase initiation error:", error);
      toast.error(error.response?.data?.error || "Failed to initiate purchase. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const adButtonDisabled = adsWatched < 2 || loading || earned;

  return (
    <div className="p-4 md:p-6 bg-[var(--background)] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-[var(--foreground)] mb-3">
          Get More Tokens for <span className="kamusi-logo">Kamusi AI</span>
        </h2>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Choose how you want to get tokens: watch ads for free, or purchase a package for instant access!
        </p>
      </motion.div>

      {/* Earn Tokens by Watching Ads Section */}
      <section className="mb-12">
        <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-6 flex items-center gap-2">
          <HandCoins className="text-[var(--primary)] w-7 h-7" /> Earn Free Tokens
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {[1, 2].map((index) => (
            <motion.div
              key={`ad-${index}`}
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
                    {/* Your AdSlot component will render here */}
                    <AdSlot
                      adClient={process.env.NEXT_PUBLIC_ADSENSE_ID}
                      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID}
                      className="w-full h-full"
                      onAdWatched={handleAdWatched}
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

        <div className="mt-8 text-center space-y-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-md p-6">
          <p className="text-lg font-semibold text-[var(--foreground)]">
            You have watched {adsWatched} out of 2 ads.
          </p>
          <Button
            onClick={handleEarn}
            disabled={adButtonDisabled}
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
          {!adButtonDisabled && !earned && (
            <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
              Click to claim your token!
            </p>
          )}
        </div>
      </section>

      {/* Buy Tokens Section */}
      <section className="mt-16">
        <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-6 flex items-center gap-2">
          <CreditCard className="text-[var(--primary)] w-7 h-7" /> Buy Tokens
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOKEN_PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] h-full flex flex-col">
                <CardHeader className="border-b border-[var(--border)] pb-4 text-center">
                  <CardTitle className="text-2xl font-bold text-[var(--primary)] mb-1">{pkg.label}</CardTitle>
                  <p className="text-3xl font-extrabold text-[var(--foreground)]">
                    Ksh {pkg.price}
                  </p>
                </CardHeader>
                <CardContent className="pt-6 flex-grow flex flex-col justify-between">
                  <div className="text-center mb-4">
                    <p className="text-sm text-[var(--muted-foreground)]">{pkg.description}</p>
                    <p className="text-4xl font-bold text-[var(--foreground)] mt-4 flex items-center justify-center gap-2">
                      {pkg.tokens} <Gem className="w-8 h-8 text-[var(--accent)]" />
                    </p>
                  </div>
                  <Button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={purchaseLoading}
                    className="btn-primary w-full !h-12 !text-base flex items-center justify-center gap-2 mt-auto"
                  >
                    {purchaseLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Buy Now"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// The default export now wraps the content in a Suspense boundary
export default function EarnTokensPageWrapper() {
  return (
    <Suspense fallback={<div>Loading tokens page...</div>}> {/* You can customize the fallback */}
      <EarnTokensContent />
    </Suspense>
  );
}
