import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import tradesData from "../../data/trades.json";
import type { Trade } from "../../types";
import { Search, ChevronRight, GitCompare, Calculator } from "lucide-react";

const SECTOR_COLORS: Record<string, { bg: string; text: string }> = {
  Electrical: { bg: "#FEF3C7", text: "#92400E" },
  Mechanical: { bg: "#DBEAFE", text: "#1E40AF" },
  IT:          { bg: "#D1FAE5", text: "#065F46" },
  Healthcare:  { bg: "#FCE7F3", text: "#9D174D" },
};

const TradeListScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const trades = tradesData as Trade[];

  const sectors = ["All Sectors", ...Array.from(new Set(trades.map((t) => t.sector)))];
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All Sectors");

  const filtered = useMemo(() => {
    return trades.filter((trade) => {
      const name = lang === "hi" ? trade.name_hi : trade.name_en;
      const desc = lang === "hi" ? trade.description_hi : trade.description_en;
      const matchSector = sector === "All Sectors" || trade.sector === sector;
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase());
      return matchSector && matchSearch && trade.is_active;
    });
  }, [trades, search, sector, lang]);

  return (
    <div className="screen-padding" style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <h1 style={{ fontSize: "22px", marginBottom: "16px" }}>{t("explore_title")}</h1>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "10px 14px",
        marginBottom: "12px"
      }}>
        <Search size={18} color="var(--color-text-muted)" />
        <input
          id="trade-search"
          type="text"
          placeholder={t("explore_search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            flex: 1,
            fontSize: "16px",
            color: "var(--color-text)"
          }}
        />
      </div>

      {/* Sector filter chips */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "16px" }}>
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            style={{
              flexShrink: 0,
              padding: "6px 14px",
              borderRadius: "999px",
              border: "1px solid",
              borderColor: sector === s ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: sector === s ? "var(--color-primary)" : "var(--color-surface)",
              color: sector === s ? "white" : "var(--color-text)",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: sector === s ? 600 : 400
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/compare-trades")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 14px",
            backgroundColor: "#EEF2FF",
            border: "1px solid #C7D2FE",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            color: "#3730A3"
          }}
        >
          <GitCompare size={18} />
          {t("explore_compare")}
        </button>
        <button
          onClick={() => navigate("/earnings-calculator")}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "12px 14px",
            backgroundColor: "#F0FDF4",
            border: "1px solid #A7F3D0",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            color: "#065F46"
          }}
        >
          <Calculator size={18} />
          {t("explore_calculator")}
        </button>
      </div>

      {/* Trade cards */}
      {filtered.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", marginTop: "32px" }}>
          {t("explore_no_results")}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "24px" }}>
          {filtered.map((trade) => {
            const col = SECTOR_COLORS[trade.sector] || { bg: "#F3F4F6", text: "#111827" };
            return (
              <button
                key={trade.id}
                id={`trade-card-${trade.id}`}
                onClick={() => navigate(`/trade/${trade.id}`)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  padding: "16px",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  boxShadow: "var(--shadow-sm)"
                }}
              >
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  backgroundColor: col.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", flexShrink: 0
                }}>
                  {trade.sector === "Electrical" ? "⚡" :
                   trade.sector === "Mechanical" ? "🔧" :
                   trade.sector === "IT" ? "💻" : "🏥"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text)", marginBottom: "4px" }}>
                    {lang === "hi" ? trade.name_hi : trade.name_en}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: "1.4", marginBottom: "6px" }}>
                    {(lang === "hi" ? trade.description_hi : trade.description_en).slice(0, 80)}…
                  </div>
                  <span style={{
                    backgroundColor: col.bg, color: col.text,
                    borderRadius: "999px", padding: "2px 10px",
                    fontSize: "12px", fontWeight: 600
                  }}>
                    {trade.sector}
                  </span>
                </div>
                <ChevronRight size={20} color="var(--color-text-muted)" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TradeListScreen;
