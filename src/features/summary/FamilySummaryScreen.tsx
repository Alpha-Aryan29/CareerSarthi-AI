import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { useSession } from "../../hooks/useSession";
import Button from "../../components/ui/Button";
import ListenButton from "../../components/ui/ListenButton";
import tradesData from "../../data/trades.json";
import interestData from "../../data/interest_options.json";
import concernData from "../../data/concern_categories.json";
import type { Trade, TradeRanking } from "../../types";

// Maps interest codes to trade codes
const INTEREST_TO_TRADE: Record<string, string[]> = {
  electrical: ["trade-001"],
  mechanical: ["trade-002"],
  computers: ["trade-003"],
  healthcare: ["trade-004"],
  beauty_wellness: [],
};

// Education eligibility — all our trades need at least 8th pass
const EDU_ORDER: Record<string, number> = {
  "8th_pass": 1,
  "10th_pass": 2,
  "12th_pass": 3,
  "graduate": 4,
};

function rankTrades(
  interests: string[],
  educationId: string
): TradeRanking[] {
  const trades = tradesData as Trade[];
  const results: TradeRanking[] = [];

  for (const trade of trades) {
    const matchedInterests = interests.filter((i) =>
      (INTEREST_TO_TRADE[i] || []).includes(trade.id)
    );
    const eduEligible = (EDU_ORDER[educationId] || 0) >= 1; // all need 8th pass
    const score = matchedInterests.length * 2 + (eduEligible ? 1 : 0);

    if (score > 0) {
      const reasons_en: string[] = [];
      const reasons_hi: string[] = [];

      if (matchedInterests.length > 0) {
        reasons_en.push(`Interest match (${matchedInterests.length} of your interests align)`);
        reasons_hi.push(`रुचि मिलान (आपकी ${matchedInterests.length} रुचि मिलती है)`);
      }
      if (eduEligible) {
        reasons_en.push("Education level meets entry requirement (8th Pass or above)");
        reasons_hi.push("शिक्षा स्तर प्रवेश आवश्यकता को पूरा करता है (8वीं पास या अधिक)");
      }

      results.push({ trade, score, reasons_en, reasons_hi });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

const FamilySummaryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const {
    learnerInterestIds,
    learnerEducationId,
    parentConcernIds,
  } = useSession();

  const topTrades = useMemo(
    () => rankTrades(learnerInterestIds, learnerEducationId || "8th_pass"),
    [learnerInterestIds, learnerEducationId]
  );

  const selectedConcerns = concernData.filter((c) =>
    parentConcernIds.includes(c.code)
  );
  const selectedInterests = interestData.filter((i) =>
    learnerInterestIds.includes(i.code)
  );

  const sectorBadgeColors: Record<string, string> = {
    Electrical: "#FEF3C7",
    Mechanical: "#DBEAFE",
    IT: "#D1FAE5",
    Healthcare: "#FCE7F3",
  };

  return (
    <div className="screen-padding" style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <h1 style={{ marginBottom: "6px", fontSize: "22px" }}>{t("summary_title")}</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px", marginBottom: "20px" }}>
        {t("summary_ranking_rule")}
      </p>

      {/* Agreement/Difference Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {selectedInterests.length > 0 && (
          <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "10px", fontWeight: 600 }}>
              {t("summary_learner_interests")}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedInterests.map((i) => (
                <span key={i.code} style={{
                  backgroundColor: "#D1FAE5",
                  color: "#065F46",
                  borderRadius: "999px",
                  padding: "4px 12px",
                  fontSize: "14px",
                  fontWeight: 500
                }}>
                  {lang === "hi" ? i.label_hi : i.label_en}
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedConcerns.length > 0 && (
          <div style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "16px",
            padding: "16px",
            boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "10px", fontWeight: 600 }}>
              {t("summary_parent_concerns")}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedConcerns.map((c) => (
                <span key={c.code} style={{
                  backgroundColor: "#FEF3C7",
                  color: "#92400E",
                  borderRadius: "999px",
                  padding: "4px 12px",
                  fontSize: "14px",
                  fontWeight: 500
                }}>
                  {lang === "hi" ? c.label_hi : c.label_en}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Trades */}
      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>{t("summary_top_trades")}</h2>

      {topTrades.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>{t("summary_no_trades")}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
          {topTrades.map((ranking, index) => (
            <div
              key={ranking.trade.id}
              style={{
                backgroundColor: "var(--color-surface)",
                border: index === 0 ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: index === 0 ? "var(--shadow-md)" : "var(--shadow-sm)",
                position: "relative",
                cursor: "pointer"
              }}
              onClick={() => navigate(`/trade/${ranking.trade.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/trade/${ranking.trade.id}`)}
            >
              {index === 0 && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "16px",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  borderRadius: "999px",
                  padding: "2px 12px",
                  fontSize: "12px",
                  fontWeight: 700
                }}>
                  #{index + 1} Best Match
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text)" }}>
                    {lang === "hi" ? ranking.trade.name_hi : ranking.trade.name_en}
                  </div>
                  <div style={{ marginTop: "2px" }}>
                    <span style={{
                      backgroundColor: sectorBadgeColors[ranking.trade.sector] || "#F3F4F6",
                      color: "var(--color-text)",
                      borderRadius: "999px",
                      padding: "2px 10px",
                      fontSize: "12px",
                      fontWeight: 500
                    }}>
                      {ranking.trade.sector}
                    </span>
                  </div>
                </div>
                <ListenButton text={lang === "hi" ? ranking.trade.name_hi : ranking.trade.name_en} />
              </div>

              <p style={{ fontSize: "14px", color: "var(--color-text-muted)", margin: "0 0 10px 0" }}>
                {lang === "hi" ? ranking.trade.description_hi : ranking.trade.description_en}
              </p>

              {/* Why lines */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "10px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted)", marginBottom: "6px" }}>
                  WHY THIS TRADE
                </div>
                {(lang === "hi" ? ranking.reasons_hi : ranking.reasons_en).map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: "6px", alignItems: "flex-start", fontSize: "13px", color: "var(--color-text)", marginBottom: "4px" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={() => navigate("/sentiment-start")}
        style={{ marginTop: "auto" }}
      >
        {t("summary_btn_talk")}
      </Button>
    </div>
  );
};

export default FamilySummaryScreen;
