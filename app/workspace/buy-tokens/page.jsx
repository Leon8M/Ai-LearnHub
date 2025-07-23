"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, CreditCard } from "lucide-react";
import { useState } from "react";

const PACKAGES = [
  { id: "basic", tokens: 1, price: 50 },
  { id: "starter", tokens: 3, price: 100 },
  { id: "pro", tokens: 15, price: 300 },
  { id: "master", tokens: 30, price: 500 },
];

export default function BuyTokens() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBuy = async (pack) => {
    setLoading(true);
    try {
      const res = await fetch("/api/pay/pesapal", {
        method: "POST",
        body: JSON.stringify(pack),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[#EAEAEA] mb-6">Buy Tokens</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKAGES.map((pack) => (
          <Card
            key={pack.id}
            className={`bg-[#111111] border ${
              selected === pack.id ? "border-[#00F5A0]" : "border-neutral-700"
            } text-[#EAEAEA] hover:shadow-lg transition-all`}
            onClick={() => setSelected(pack.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {pack.tokens} Token{pack.tokens > 1 && "s"}
                {selected === pack.id && <CheckCircle className="text-[#00F5A0]" size={20} />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">Ksh {pack.price}</p>
              <Button
                className="w-full bg-[#00F5A0] text-black hover:bg-[#00ffb7]"
                onClick={() => handleBuy(pack)}
                disabled={loading}
              >
                <CreditCard className="mr-2" size={16} /> Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
