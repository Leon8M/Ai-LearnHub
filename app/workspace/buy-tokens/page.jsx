'use client';

import { useEffect, useState, useCallback, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BadgeCheck, Gem, Loader2, HandCoins, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { TOKEN_PACKAGES as PACKAGES, WEEKLY_TOKEN_AMOUNT } from '@/lib/tokenPackages';

const TOKEN_PACKAGES = Object.values(PACKAGES);

const DAYS_IN_WEEK = 7;

function EarnTokensContent() {
  const { user } = useUser(); 
  const [loadingClaim, setLoadingClaim] = useState(false); 
  const [lastClaimDate, setLastClaimDate] = useState(null);
  const [canClaimWeekly, setCanClaimWeekly] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false); 
  const searchParams = useSearchParams();

  // The server is the source of truth for the weekly claim (it used to live in localStorage,
  // which drifted from the real rule and reset in every new browser).
  const loadClaimStatus = useCallback(async () => {
    const res = await fetch('/api/user/tokens');
    if (!res.ok) return;
    const data = await res.json();
    const next = data.nextClaimAt ? new Date(data.nextClaimAt) : null;
    setLastClaimDate(next ? new Date(next.getTime() - DAYS_IN_WEEK * 24 * 3600 * 1000) : null);
    setCanClaimWeekly(!next || next <= new Date());
  }, []);

  useEffect(() => {
    if (user?.id) loadClaimStatus();
  }, [user?.id, loadClaimStatus]);

  // Back from Paystack checkout: Paystack appends ?reference=... Confirm the payment server-side
  // so the tokens show up immediately instead of "shortly".
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference || !user?.id) return;
    window.history.replaceState({}, document.title, window.location.pathname);
    (async () => {
      const toastId = toast.loading('Confirming your payment...');
      try {
        const res = await fetch('/api/paystack-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Payment confirmed! ${data.tokensPurchased} tokens added. Balance: ${data.tokens}.`, { id: toastId });
          window.dispatchEvent(new Event('kamusi:tokens-changed'));
        } else {
          toast.error(data.error || 'We could not confirm this payment yet.', { id: toastId });
        }
      } catch {
        toast.error('We could not confirm this payment yet. Your tokens will appear once Paystack confirms it.', { id: toastId });
      }
    })();
  }, [searchParams, user?.id]);

  const handleClaimWeeklyTokens = async () => {
    if (!user || !user.id) {
      toast.error("You must be logged in to claim tokens.");
      return;
    }

    setLoadingClaim(true);

    try {
      const res = await fetch("/api/user/claim-weekly-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`🎉 You've successfully claimed ${WEEKLY_TOKEN_AMOUNT} free tokens!`);
        window.dispatchEvent(new Event('kamusi:tokens-changed'));
        await loadClaimStatus();
      } else {
        toast.error(data.error || "Failed to claim tokens. Please try again later.");
      }
    } catch (err) {
      //console.error("Weekly token claim error:", err);
      toast.error("Failed to claim tokens. Please try again later.");
    } finally {
      setLoadingClaim(false);
    }
  };

  const handlePurchase = async (packageId) => {
    setPurchaseLoading(true);
    try {
      const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);
      if (!pkg) {
        toast.error("Invalid package selected.");
        setPurchaseLoading(false);
        return;
      }

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

      if (typeof window !== 'undefined') {
        window.location.href = data.authorization_url;
      }

    } catch (error) {
      //console.error("Purchase initiation error:", error);
      toast.error(error.response?.data?.error || "Failed to initiate purchase. Please try again.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  const claimButtonDisabled = loadingClaim || !canClaimWeekly;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

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
          Choose how you want to get tokens: claim free weekly tokens, or purchase a package for instant access!
        </p>
      </motion.div>

      <section className="mb-12">
        <h3 className="text-2xl font-bold font-heading text-[var(--foreground)] mb-6 flex items-center gap-2">
          <HandCoins className="text-[var(--primary)] w-7 h-7" /> Claim Free Weekly Tokens
        </h3>
        <Card className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] p-6 text-center">
          <CardHeader className="border-b border-[var(--border)] pb-4">
            <CardTitle className="flex items-center justify-center text-2xl font-semibold text-[var(--foreground)] gap-2">
              <Sparkles className="text-[var(--primary)] w-6 h-6" /> Your Weekly Token Reward
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              You can claim a generous reward of **{WEEKLY_TOKEN_AMOUNT} free tokens** once every week!
              These tokens grant you access to premium features and content on Kamusi AI.
            </p>
            <div className="text-4xl font-bold text-[var(--foreground)] flex items-center justify-center gap-2">
              {WEEKLY_TOKEN_AMOUNT} <Gem className="w-8 h-8 text-[var(--accent)]" />
            </div>

            {lastClaimDate && (
              <p className="text-sm text-[var(--muted-foreground)]">
                Last claimed: {formatDate(lastClaimDate)}
              </p>
            )}

            <Button
              onClick={handleClaimWeeklyTokens}
              disabled={claimButtonDisabled}
              className="btn-primary w-full sm:w-auto !h-14 !text-lg !px-8 flex items-center justify-center gap-2"
            >
              {loadingClaim ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Claiming...
                </>
              ) : !user ? (
                <>
                  <Sparkles className="w-5 h-5" /> Log in to Claim
                </>
              ) : canClaimWeekly ? (
                <>
                  <Sparkles className="w-5 h-5" /> Claim {WEEKLY_TOKEN_AMOUNT} Tokens
                </>
              ) : (
                <>
                  <BadgeCheck className="w-5 h-5" /> Claimed for this week
                </>
              )}
            </Button>
            {!canClaimWeekly && user && lastClaimDate && (
                <p className="text-sm text-yellow-600 animate-pulse">
                    You can claim again on {formatDate(new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate() + DAYS_IN_WEEK))}.
                </p>
            )}
            {!user && (
                 <p className="text-sm text-[var(--muted-foreground)]">
                    Please log in to claim your weekly tokens.
                </p>
            )}
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
            <p>
                **Disclaimer:** Weekly token grants are subject to change without prior notice.
                Tokens are for use within Kamusi AI only and have no real-world monetary value.
            </p>
        </div>
      </section>

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

export default function EarnTokensPageWrapper() {
  return (
    <Suspense fallback={<div>Loading tokens page...</div>}>
      <EarnTokensContent />
    </Suspense>
  );
}
