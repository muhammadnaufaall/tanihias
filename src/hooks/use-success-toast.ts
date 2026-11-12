"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { FormState } from "@/lib/validation";

// Show a toast once per successful form submission. Tracked per attempt so
// it does not show again when the page re-renders.
export function useSuccessToast(state: FormState) {
  const shownAttempt = useRef(0);

  useEffect(() => {
    if (state.success && state.message && shownAttempt.current !== state.attempt) {
      shownAttempt.current = state.attempt;
      toast.success(state.message);
    }
  }, [state]);
}
