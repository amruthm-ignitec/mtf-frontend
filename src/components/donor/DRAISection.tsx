import { useState, useRef, useEffect } from "react";
import { Document } from "../../utils/documentUtils";

// ─── Mock data for DRAI tab (dummy / mock tab) ─────────────────────────────────
const FIELDS = [
  {
    id: 1,
    question: "2. Previous blood transfusion in last 12 months?",
    answer: "No",
    confidence: 99,
    nested: false,
    sourceSnippet:
      "Q2: Have you received a blood transfusion in the past 12 months?\n[X] No   [ ] Yes\nIf yes, specify date: ______",
    sourcePage: 3,
  },
  {
    id: 2,
    question: "3. Exposure to toxic substances or radiation?",
    answer: "No known exposure reported",
    confidence: 97,
    nested: false,
    sourceSnippet:
      "Section 3 — Occupational / Environmental Exposure\nToxic substances or ionising radiation:  [X] None reported\nDetails: N/A",
    sourcePage: 4,
  },
  {
    id: 3,
    question: "4a. Recent travel outside country of residence?",
    answer: "Yes — Europe (vacation)",
    confidence: 96,
    nested: false,
    sourceSnippet:
      "4a. International travel in last 6 months?\n[ ] No  [X] Yes\nDestination(s): Europe (vacation)\nDuration: 14 days",
    sourcePage: 4,
  },
  {
    id: 4,
    question: "↳ 4a(i). When was last visit? Duration?",
    answer: "June 2024 — approx. 2 wks",
    confidence: 71,
    nested: true,
    sourceSnippet:
      "4a(i). [Handwritten — partially legible]\n\"June [?] 2024  ~2 wee[ks?]\"\nNote: ink smear over day value",
    sourcePage: 4,
  },
  {
    id: 5,
    question: "5. Current or recent medications (last 4 weeks)?",
    answer: "None",
    confidence: 98,
    nested: false,
    sourceSnippet:
      "Section 5 — Medications\nAre you currently taking any prescription or over-the-counter medications?\n[X] No   [ ] Yes\nIf yes, list: ________________",
    sourcePage: 5,
  },
  {
    id: 6,
    question: "6. History of hepatitis or jaundice?",
    answer: "No",
    confidence: 99,
    nested: false,
    sourceSnippet:
      "6. Have you ever had hepatitis or jaundice (yellowing of skin/eyes)?\n[ ] Yes   [X] No\nIf yes, type and date: ______",
    sourcePage: 5,
  },
  {
    id: 7,
    question: "7. Tattoo, piercing, or acupuncture in last 12 months?",
    answer: "No",
    confidence: 94,
    nested: false,
    sourceSnippet:
      "7. In the past 12 months have you had a tattoo, piercing, or acupuncture?\n[X] No   [ ] Yes\nDate(s) if yes: ______",
    sourcePage: 6,
  },
  {
    id: 8,
    question: "8. Sexual behaviour / high-risk exposure?",
    answer: "No high-risk exposure",
    confidence: 92,
    nested: false,
    sourceSnippet:
      "Section 8 — Sexual Health\nAny high-risk sexual exposure in last 12 months?\n[ ] Yes   [X] No\nDeclaration signed: ________",
    sourcePage: 6,
  },
  {
    id: 9,
    question: "↳ 8(i). Last sexual contact date (if applicable)?",
    answer: "N/A",
    confidence: 88,
    nested: true,
    sourceSnippet:
      "8(i). [Not applicable — donor selected No above]\nField left blank.",
    sourcePage: 6,
  },
  {
    id: 10,
    question: "9. Ever tested positive for HIV, HBV, HCV, or HTLV?",
    answer: "No",
    confidence: 99,
    nested: false,
    sourceSnippet:
      "9. Have you ever tested positive for HIV, Hepatitis B, Hepatitis C, or HTLV?\n[ ] Yes   [X] No",
    sourcePage: 7,
  },
];

interface DraiField {
  id: number;
  question: string;
  answer: string;
  confidence: number;
  nested: boolean;
  sourceSnippet: string;
  sourcePage: number;
}

const isHigh = (c: number) => c >= 95;

// ─── Citation Popover ───────────────────────────────────────────────────────
function CitationPopover({
  snippet,
  page,
  onViewFullPage,
}: {
  snippet: string;
  page: number;
  onViewFullPage?: () => void;
}) {
  return (
    <div
      className="citation-popover"
      style={{
        position: "absolute",
        left: "calc(100% + 12px)",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 100,
        width: 300,
        background: "#0d1117",
        border: "1px solid #30363d",
        borderRadius: 8,
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        overflow: "hidden",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #21262d",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#161b22",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#8b949e",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Source · Page {page}
        </span>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            color: "#3fb950",
            background: "rgba(63,185,80,0.1)",
            padding: "2px 6px",
            borderRadius: 3,
          }}
        >
          UDRAI
        </span>
      </div>
      <div
        style={{
          margin: 12,
          padding: 12,
          background: "#0a0d12",
          border: "1px solid #21262d",
          borderRadius: 6,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "#c9d1d9",
          whiteSpace: "pre-wrap",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)",
            pointerEvents: "none",
            borderRadius: 6,
          }}
        />
        {snippet}
      </div>
      <div style={{ padding: "8px 12px 10px", display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onViewFullPage}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#58a6ff",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            letterSpacing: "0.04em",
            padding: 0,
          }}
        >
          View Full Page →
        </button>
      </div>
    </div>
  );
}

function SourceButton({
  snippet,
  page,
  onViewFullPage,
}: {
  snippet: string;
  page: number;
  onViewFullPage?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-flex" }}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => {
          setTimeout(() => {
            if (!ref.current?.querySelector(":hover")) setOpen(false);
          }, 80);
        }}
        onClick={() => setOpen((v) => !v)}
        title="View source"
        style={{
          width: 26,
          height: 26,
          borderRadius: 6,
          border: "1px solid #30363d",
          background: open ? "#21262d" : "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
          flexShrink: 0,
          color: "#8b949e",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </button>
      {open && (
        <CitationPopover
          snippet={snippet}
          page={page}
          onViewFullPage={onViewFullPage}
        />
      )}
    </div>
  );
}

function DataRow({
  field,
  index,
  onCitationClick,
}: {
  field: DraiField;
  index: number;
  onCitationClick?: (documentName: string, pageNumber?: number) => void;
}) {
  const high = isHigh(field.confidence);
  const [editVal, setEditVal] = useState(field.answer);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleViewFullPage = () => {
    onCitationClick?.("UDRAI — Donor Risk Assessment Interview", field.sourcePage);
  };

  return (
    <div
      className="data-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        gap: "12px",
        alignItems: "center",
        padding: "14px 20px",
        borderBottom: "1px solid #161b22",
        background: index % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
        transition: "background 0.15s",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingLeft: field.nested ? 20 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {field.nested && (
            <div
              style={{
                width: 2,
                height: 32,
                background: "#30363d",
                borderRadius: 2,
                flexShrink: 0,
                position: "relative",
                top: -2,
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8b949e",
              letterSpacing: "0.02em",
            }}
          >
            {field.question}
          </span>
        </div>
        {high ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 15,
                color: "#e6edf3",
                letterSpacing: "-0.01em",
              }}
            >
              {field.answer}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                background: "rgba(63,185,80,0.12)",
                color: "#3fb950",
                border: "1px solid rgba(63,185,80,0.25)",
                padding: "2px 6px",
                borderRadius: 4,
                letterSpacing: "0.06em",
              }}
            >
              ✓ {field.confidence}% MATCH
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <input
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleSave}
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 15,
                color: "#e6edf3",
                background: "rgba(210,153,34,0.07)",
                border: "1.5px solid rgba(210,153,34,0.55)",
                borderRadius: 6,
                padding: "4px 10px",
                outline: "none",
                width: 220,
                letterSpacing: "-0.01em",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = "0 0 0 3px rgba(210,153,34,0.18)";
                e.target.style.borderColor = "rgba(210,153,34,0.9)";
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = "rgba(210,153,34,0.55)";
              }}
            />
            {saved && (
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#3fb950",
                }}
              >
                ✓ Saved
              </span>
            )}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          minWidth: 44,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: high ? "#3fb950" : "#d29522",
          }}
        >
          {field.confidence}%
        </span>
        <div
          style={{
            width: 36,
            height: 4,
            background: "#21262d",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${field.confidence}%`,
              height: "100%",
              background: high
                ? "linear-gradient(90deg, #3fb950, #56d364)"
                : "linear-gradient(90deg, #d29522, #e3b341)",
              borderRadius: 99,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>
      <SourceButton
        snippet={field.sourceSnippet}
        page={field.sourcePage}
        onViewFullPage={handleViewFullPage}
      />
    </div>
  );
}

// ─── DRAI Section (mock tab with dummy data) ───────────────────────────────────
export interface DRAISectionProps {
  data?: unknown;
  documents?: Document[];
  onCitationClick?: (sourceDocument: string, pageNumber?: number, documentId?: number) => void;
  donorId?: string;
}

export default function DRAISection({
  data,
  documents = [],
  onCitationClick,
  donorId,
}: DRAISectionProps) {
  const donorDisplayId = donorId || "#81028";

  return (
    <>
      <style>{`
        .drai-card-wrap .data-row:hover {
          background: rgba(255,255,255,0.025) !important;
        }
      `}</style>
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "24px 20px 48px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            color: "#484f58",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Queue</span>
          <span style={{ color: "#30363d" }}>›</span>
          <span>Donor Records</span>
          <span style={{ color: "#30363d" }}>›</span>
          <span style={{ color: "#8b949e" }}>{donorDisplayId}</span>
        </div>

        <div
          className="drai-card-wrap"
          style={{
            width: "100%",
            maxWidth: 680,
            background: "#0d1117",
            border: "1px solid #21262d",
            borderRadius: 12,
            overflow: "visible",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset",
          }}
        >
          <div
            style={{
              padding: "20px 20px 18px",
              borderBottom: "1px solid #21262d",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#e6edf3",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Donor ID: {donorDisplayId}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#484f58",
                    letterSpacing: "0.04em",
                  }}
                >
                  Document:
                </span>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#58a6ff",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  UDRAI — Donor Risk Assessment Interview
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 12,
              padding: "8px 20px",
              borderBottom: "1px solid #161b22",
              background: "#090c10",
            }}
          >
            {["Extracted Field / Answer", "Conf.", "Src"].map((h, i) => (
              <span
                key={h}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#484f58",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textAlign: i > 0 ? "center" : "left",
                }}
              >
                {h}
              </span>
            ))}
          </div>

          <div>
            {FIELDS.map((field, i) => (
              <DataRow
                key={field.id}
                field={field}
                index={i}
                onCitationClick={(docName, pageNum) =>
                  onCitationClick?.(docName, pageNum, undefined)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
