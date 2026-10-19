// Small inline line icons (no icon library).
const base = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
export const Icons = {
  sparkles: <svg {...base}><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>,
  plug: <svg {...base}><path d="M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0z" /><path d="M12 17v5" /></svg>,
  rocket: <svg {...base}><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M9 15l-3-3c2-6 7-9 14-9 0 7-3 12-9 14z" /><circle cx="15" cy="9" r="1.6" /></svg>,
  server: <svg {...base}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>,
  check: <svg {...base} width={14} height={14}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  arrow: <svg {...base} width={16} height={16}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
};
