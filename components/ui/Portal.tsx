"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

/**
 * Renders children into document.body instead of wherever this component
 * sits in the tree. Overlays (modals, dropdowns) need this: a `fixed`
 * element nested inside any ancestor with `transform`, `filter`, or
 * `backdrop-filter` (like this app's blurred sticky header) gets repositioned
 * relative to that ancestor instead of the viewport, per the CSS containing-
 * block spec - portaling to body sidesteps the whole class of bug.
 */
export function Portal({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}
