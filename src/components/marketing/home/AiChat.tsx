"use client";

import { useEffect, useRef, useState } from "react";

// Animated insights feed for the "Ecom Profit Insights" card. Mirrors the
// client's reference HTML behaviour: once the card scrolls into view it pushes
// the first insight, then on a 3.4s cadence shows a typing indicator and, after
// 1.1s, appends the next insight, keeping at most three bubbles on screen. Each
// freshly mounted bubble runs the CSS `msgIn` entrance via its changing key.
const INSIGHTS = [
  "Your top-selling SKU <b>Bluetooth Earbuds</b> generates only <b>4% profit</b> after fees. Consider a price increase.",
  "Flipkart commissions on this category rose. Fees ate <b>₹38,000</b> of profit last month.",
  "Returns reduced profit by <b>18%</b> last month, mostly apparel sizing. Better size charts could save <b>₹62,000</b>.",
  "3 SKUs are selling at a <b>net loss</b> after fees &amp; returns. Review pricing or delist them.",
  "Meesho settlement for last cycle reconciled. A <b>₹4,300 mismatch</b> was flagged for review.",
];

const AvatarIcon = () => (
  <svg viewBox="0 0 24 24" fill="#fff">
    <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
  </svg>
);

type Bubble = { key: number; html: string };

export function AiChat() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [msgs, setMsgs] = useState<Bubble[]>([]);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    let idx = 0;
    let key = 0;
    let started = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let pending: ReturnType<typeof setTimeout> | undefined;

    const push = () => {
      setTyping(false);
      const html = INSIGHTS[idx % INSIGHTS.length];
      idx++;
      const bubble = { key: key++, html };
      setMsgs((prev) => {
        const next = [...prev, bubble];
        return next.length > 3 ? next.slice(next.length - 3) : next;
      });
    };

    const start = () => {
      if (started) return;
      started = true;

      // Reduced motion: just show the first three insights, no typing loop.
      if (reduced) {
        setMsgs(
          INSIGHTS.slice(0, 3).map((html, i) => ({ key: i, html })),
        );
        idx = 3;
        key = 3;
        return;
      }

      push();
      interval = setInterval(() => {
        setTyping(true);
        pending = setTimeout(push, 1100);
      }, 3400);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start();
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (interval) clearInterval(interval);
      if (pending) clearTimeout(pending);
    };
  }, []);

  return (
    <div className="ai-msgs" ref={ref}>
      {msgs.map((m) => (
        <div className="ai-msg" key={m.key}>
          <div className="mav">
            <AvatarIcon />
          </div>
          <div className="bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
        </div>
      ))}
      {typing && (
        <div className="ai-msg" key="typing">
          <div className="mav">
            <AvatarIcon />
          </div>
          <div className="bubble">
            <span className="ai-typing">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
