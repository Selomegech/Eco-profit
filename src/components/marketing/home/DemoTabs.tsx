"use client";

import { useEffect, useRef, useState } from "react";
import { drawLine } from "./ScrollFX";

type Tab = "sales" | "profit" | "sku" | "returns";

const tabs: { id: Tab; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "profit", label: "Profit" },
  { id: "sku", label: "SKU Profitability" },
  { id: "returns", label: "Returns" },
];

const chartData: Record<string, { vals: number[]; c1: string; c2: string }> = {
  sales: { vals: [40, 52, 48, 60, 55, 68, 62, 75, 70, 82, 78, 90], c1: "#00E5FF", c2: "#7C3AED" },
  profit: { vals: [30, 38, 34, 46, 42, 54, 50, 62, 58, 70, 66, 80], c1: "#00E5FF", c2: "#7C3AED" },
  returns: { vals: [60, 52, 58, 46, 50, 40, 44, 36, 40, 30, 34, 26], c1: "#fb7185", c2: "#f59e0b" },
};

export function DemoTabs() {
  const [active, setActive] = useState<Tab>("sales");
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const cfg = chartData[active];
    if (cfg && chartRef.current) {
      const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
      drawLine(chartRef.current, cfg.vals, { c1: cfg.c1, c2: cfg.c2, animate: !reduced });
    }
  }, [active]);

  return (
    <>
      <div className="demo-tabs reveal">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`demo-tab${active === t.id ? " active" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="demo-screen reveal d1">
        <div className="demo-bar">
          <span className="dot d1" />
          <span className="dot d2" />
          <span className="dot d3" />
          <span className="url">app.ecomprofit.co.in/dashboard</span>
        </div>

        {active === "sales" && (
          <div className="demo-content active">
            <div className="dc-grid">
              <Kpi l="Total Sales" v="₹24.6L" c="▲ 14.2%" up />
              <Kpi l="Orders" v="3,482" c="▲ 9.7%" up />
              <Kpi l="Avg Order Value" v="₹706" c="▲ 4.1%" up />
              <Kpi l="Marketplaces" v="2" c="Flipkart · Meesho" />
            </div>
            <div className="dc-chart">
              <h4>Daily sales · last 30 days</h4>
              <svg
                ref={chartRef}
                viewBox="0 0 600 140"
                preserveAspectRatio="none"
                style={{ width: "100%", height: 140 }}
              />
            </div>
          </div>
        )}

        {active === "profit" && (
          <div className="demo-content active">
            <div className="dc-grid">
              <Kpi l="Net Profit" v="₹4.98L" c="▲ 11.3%" up green />
              <Kpi l="Net Margin" v="20.2%" c="▲ 1.6%" up />
              <Kpi l="Total Costs" v="₹19.6L" c="▲ 13.1%" down />
              <Kpi l="Profit / Order" v="₹143" c="▲ 2.4%" up />
            </div>
            <div className="dc-chart">
              <h4>Profit vs cost trend</h4>
              <svg
                ref={chartRef}
                viewBox="0 0 600 140"
                preserveAspectRatio="none"
                style={{ width: "100%", height: 140 }}
              />
            </div>
          </div>
        )}

        {active === "sku" && (
          <div className="demo-content active">
            <table className="dc-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Units</th>
                  <th>Revenue</th>
                  <th>Net Profit</th>
                  <th>Margin</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <SkuRow n="Cotton Kurti · Navy" u="412" r="₹3,29,600" p="₹78,900" m="23.9%" pill="g" status="Healthy" />
                <SkuRow n="Bluetooth Earbuds" u="688" r="₹6,87,000" p="₹27,400" m="4.0%" pill="r" status="Leaking" />
                <SkuRow n="Steel Water Bottle" u="521" r="₹2,60,500" p="₹46,200" m="17.7%" pill="g" status="Healthy" />
                <SkuRow n="Yoga Mat · Premium" u="203" r="₹2,03,000" p="₹18,100" m="8.9%" pill="y" status="Watch" />
                <SkuRow n="Phone Case Bundle" u="934" r="₹2,80,200" p="−₹4,300" m="−1.5%" pill="r" status="Loss" />
              </tbody>
            </table>
          </div>
        )}

        {active === "returns" && (
          <div className="demo-content active">
            <div className="dc-grid">
              <Kpi l="Return Rate" v="11.4%" c="▲ 1.8%" down />
              <Kpi l="Returns Value" v="₹2.8L" c="▲ 12.0%" down red />
              <Kpi l="Profit Lost" v="₹89,200" c="▲ 7.2%" down red />
              <Kpi l="RTO Rate" v="6.1%" c="▼ 0.9%" up />
            </div>
            <div className="dc-chart">
              <h4>Returns impact on profit</h4>
              <svg
                ref={chartRef}
                viewBox="0 0 600 140"
                preserveAspectRatio="none"
                style={{ width: "100%", height: 140 }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function Kpi({
  l,
  v,
  c,
  up,
  down,
  green,
  red,
}: {
  l: string;
  v: string;
  c: string;
  up?: boolean;
  down?: boolean;
  green?: boolean;
  red?: boolean;
}) {
  const vStyle = green ? { color: "var(--green)" } : red ? { color: "var(--red)" } : undefined;
  return (
    <div className="dc-kpi">
      <div className="l">{l}</div>
      <div className="v" style={vStyle}>
        {v}
      </div>
      <div className={`c${up ? " up" : ""}${down ? " down" : ""}`}>{c}</div>
    </div>
  );
}

function SkuRow({
  n,
  u,
  r,
  p,
  m,
  pill,
  status,
}: {
  n: string;
  u: string;
  r: string;
  p: string;
  m: string;
  pill: "g" | "r" | "y";
  status: string;
}) {
  return (
    <tr>
      <td>{n}</td>
      <td>{u}</td>
      <td>{r}</td>
      <td>{p}</td>
      <td>{m}</td>
      <td>
        <span className={`pill ${pill}`}>{status}</span>
      </td>
    </tr>
  );
}
