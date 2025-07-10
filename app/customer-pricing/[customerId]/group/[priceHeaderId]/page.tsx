"use client";

import dynamic from "next/dynamic";
import React from "react";

const PricingEntry = dynamic(() => import("@/pricing-entry"), { ssr: false });

export default function PriceGroupDetailsPage() {
  return <PricingEntry />;
}
