// @ts-nocheck
"use client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const WarehousesPageContent = dynamic(
  () => import("./content").then((mod) => mod.default),
  {
    ssr: false,
  }
);

export default function LiveTracking() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WarehousesPageContent />
    </Suspense>
  );
}
