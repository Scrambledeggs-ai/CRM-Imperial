"use client";

import { useEffect } from "react";
import { checkOverduePendings } from "@/lib/actions";

export function OverdueChecker() {
  useEffect(() => {
    checkOverduePendings().catch(() => {});
  }, []);
  return null;
}
