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

// ─── Citation Popover (light theme) ──────────────────────────────────────────
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
    <div className="absolute left-full top-1/2 -translate-y-1/2 z-[100] w-[300px] ml-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden pointer-events-auto">
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
          Source · Page {page}
        </span>
        <span className="text-[9px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-medium">
          UDRAI
        </span>
      </div>
      <div className="m-3 p-3 bg-gray-50 border border-gray-100 rounded-md text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
        {snippet}
      </div>
      <div className="px-3 py-2 flex justify-end border-t border-gray-100">
        <button
          type="button"
          onClick={onViewFullPage}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
    <div ref={ref} className="relative inline-flex">
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
        className={`w-[26px] h-[26px] rounded-md border flex items-center justify-center flex-shrink-0 text-gray-500 transition-colors ${
          open ? "border-gray-300 bg-gray-100" : "border-gray-200 hover:bg-gray-50"
        }`}
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
      className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center py-3.5 px-5 border-b border-gray-100 transition-colors hover:bg-gray-50/80 ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      }`}
    >
      <div className="flex flex-col gap-1.5 pl-0" style={{ paddingLeft: field.nested ? 20 : 0 }}>
        <div className="flex items-center gap-1.5">
          {field.nested && (
            <div className="w-0.5 h-8 bg-gray-300 rounded flex-shrink-0 -mt-0.5" />
          )}
          <span className="text-xs text-gray-500 font-medium">{field.question}</span>
        </div>
        {high ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-900">{field.answer}</span>
            <span className="text-[10px] bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-medium">
              ✓ {field.confidence}% MATCH
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleSave}
              className="text-sm text-gray-900 w-[220px] px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50/50 outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400"
            />
            {saved && (
              <span className="text-[10px] text-green-600 font-medium">✓ Saved</span>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 min-w-[44px]">
        <span className={`text-xs font-semibold ${high ? "text-green-600" : "text-amber-600"}`}>
          {field.confidence}%
        </span>
        <div className="w-9 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-300 ${
              high ? "bg-green-500" : "bg-amber-500"
            }`}
            style={{ width: `${field.confidence}%` }}
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
  data: _data,
  documents: _documents = [],
  onCitationClick,
  donorId,
}: DRAISectionProps) {
  const donorDisplayId = donorId || "#81028";

  return (
    <div className="bg-white rounded-lg shadow overflow-visible">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Donor Risk Assessment Interview (DRAI)
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Donor ID: {donorDisplayId}</span>
          <span className="text-gray-300">·</span>
          <span className="text-blue-600 font-medium uppercase tracking-wide">
            UDRAI — Donor Risk Assessment Interview
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-3 px-5 py-2 border-b border-gray-200 bg-gray-50/80">
        {["Extracted Field / Answer", "Conf.", "Src"].map((h, i) => (
          <span
            key={h}
            className={`text-[10px] text-gray-500 uppercase tracking-wider font-medium ${
              i > 0 ? "text-center" : "text-left"
            }`}
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
  );
}
