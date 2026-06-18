/**
 * Single source of truth for the contribution metrics tracked across the app.
 * Used by the chart (bars), the sorting selector and the metric picker so they
 * never drift apart.
 */
export const METRICS = [
  { key: "created", label: "Created", color: "#7eb0d5" },
  { key: "approved", label: "Approved", color: "#b2e061" },
  { key: "requestedChanges", label: "Requested changes", color: "#bd7ebe" },
  { key: "comments", label: "Comments", color: "#8bd3c7" },
];

export const METRIC_KEYS = METRICS.map((metric) => metric.key);
