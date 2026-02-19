import { useState, useRef, useEffect } from "react";
import { Droplets, Radiation, Plane, Pill, Stethoscope, FileText } from "lucide-react";
import { Document } from "../../utils/documentUtils";

// ─── Mock data for DRAI tab (dummy / mock tab) ─────────────────────────────────
const FIELDS: DraiField[] = [
  {
    id: 1,
    question: "2. Previous blood transfusion in last 12 months?",
    answer: "No",
    nested: false,
    section: "transfusion",
    sourceSnippet:
      "Q2: Have you received a blood transfusion in the past 12 months?\n[X] No   [ ] Yes\nIf yes, specify date: ______",
    sourcePage: 3,
  },
  {
    id: 2,
    question: "3. Exposure to toxic substances or radiation?",
    answer: "No known exposure reported",
    nested: false,
    section: "exposure",
    sourceSnippet:
      "Section 3 — Occupational / Environmental Exposure\nToxic substances or ionising radiation:  [X] None reported\nDetails: N/A",
    sourcePage: 4,
  },
  {
    id: 3,
    question: "4a. Recent travel outside country of residence?",
    answer: "Yes — Europe (vacation)",
    nested: false,
    section: "travel",
    sourceSnippet:
      "4a. International travel in last 6 months?\n[ ] No  [X] Yes\nDestination(s): Europe (vacation)\nDuration: 14 days",
    sourcePage: 4,
  },
  {
    id: 4,
    question: "↳ 4a(i). When was last visit? Duration?",
    answer: "June 2024 — approx. 2 wks",
    nested: true,
    section: "travel",
    sourceSnippet:
      "4a(i). [Handwritten — partially legible]\n\"June [?] 2024  ~2 wee[ks?]\"\nNote: ink smear over day value",
    sourcePage: 4,
  },
  {
    id: 5,
    question: "5. Current or recent medications (last 4 weeks)?",
    answer: "None",
    nested: false,
    section: "medications",
    sourceSnippet:
      "Section 5 — Medications\nAre you currently taking any prescription or over-the-counter medications?\n[X] No   [ ] Yes\nIf yes, list: ________________",
    sourcePage: 5,
  },
  {
    id: 6,
    question: "6. History of hepatitis or jaundice?",
    answer: "No",
    nested: false,
    section: "health",
    sourceSnippet:
      "6. Have you ever had hepatitis or jaundice (yellowing of skin/eyes)?\n[ ] Yes   [X] No\nIf yes, type and date: ______",
    sourcePage: 5,
  },
  {
    id: 7,
    question: "7. Tattoo, piercing, or acupuncture in last 12 months?",
    answer: "No",
    nested: false,
    section: "health",
    sourceSnippet:
      "7. In the past 12 months have you had a tattoo, piercing, or acupuncture?\n[X] No   [ ] Yes\nDate(s) if yes: ______",
    sourcePage: 6,
  },
  {
    id: 8,
    question: "8. Sexual behaviour / high-risk exposure?",
    answer: "No high-risk exposure",
    nested: false,
    section: "health",
    sourceSnippet:
      "Section 8 — Sexual Health\nAny high-risk sexual exposure in last 12 months?\n[ ] Yes   [X] No\nDeclaration signed: ________",
    sourcePage: 6,
  },
  {
    id: 9,
    question: "↳ 8(i). Last sexual contact date (if applicable)?",
    answer: "N/A",
    nested: true,
    section: "health",
    sourceSnippet:
      "8(i). [Not applicable — donor selected No above]\nField left blank.",
    sourcePage: 6,
  },
  {
    id: 10,
    question: "9. Ever tested positive for HIV, HBV, HCV, or HTLV?",
    answer: "No",
    nested: false,
    section: "health",
    sourceSnippet:
      "9. Have you ever tested positive for HIV, Hepatitis B, Hepatitis C, or HTLV?\n[ ] Yes   [X] No",
    sourcePage: 7,
  },
];

const SECTION_CONFIG: Record<string, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  transfusion: { label: "Transfusion & exposure", Icon: Droplets },
  exposure: { label: "Transfusion & exposure", Icon: Radiation },
  travel: { label: "Travel", Icon: Plane },
  medications: { label: "Medications", Icon: Pill },
  health: { label: "Health & risk", Icon: Stethoscope },
};

interface DraiField {
  id: number;
  question: string;
  answer: string;
  nested: boolean;
  section: string;
  sourceSnippet: string;
  sourcePage: number;
}

// Group fields by section (merge transfusion + exposure into one)
function groupBySection(fields: DraiField[]): { title: string; Icon: React.ComponentType<{ className?: string }>; fields: DraiField[] }[] {
  const map = new Map<string, DraiField[]>();
  for (const f of fields) {
    const config = SECTION_CONFIG[f.section] || { label: "Other", Icon: FileText };
    const key = config.label;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(f);
  }
  const order = ["Transfusion & exposure", "Travel", "Medications", "Health & risk", "Other"];
  return order.filter((title) => map.has(title)).map((title) => {
    const firstKey = Object.keys(SECTION_CONFIG).find((k) => SECTION_CONFIG[k].label === title);
    return {
      title,
      Icon: firstKey ? SECTION_CONFIG[firstKey].Icon : FileText,
      fields: map.get(title)!,
    };
  });
}

function isLowRisk(answer: string): boolean {
  const a = answer.toLowerCase();
  return a === "no" || a === "none" || a === "n/a" || a.startsWith("no ") || a.includes("no known") || a.includes("no high-risk");
}

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
  onCitationClick,
}: {
  field: DraiField;
  onCitationClick?: (documentName: string, pageNumber?: number) => void;
}) {
  const handleViewFullPage = () => {
    onCitationClick?.("UDRAI — Donor Risk Assessment Interview", field.sourcePage);
  };
  const lowRisk = isLowRisk(field.answer);

  return (
    <div
      className={`flex gap-4 items-start py-4 px-4 rounded-lg transition-colors hover:bg-gray-50/80 ${
        field.nested ? "ml-4 pl-4 border-l-2 border-gray-200" : ""
      }`}
    >
      <div
        className={`flex-shrink-0 w-1 rounded-full min-h-[2rem] ${
          lowRisk ? "bg-emerald-400" : "bg-amber-400"
        }`}
        title={lowRisk ? "Low risk" : "Review"}
        aria-hidden
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-xs text-gray-500 leading-snug">{field.question}</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug">{field.answer}</p>
      </div>
      <div className="flex-shrink-0">
        <SourceButton
          snippet={field.sourceSnippet}
          page={field.sourcePage}
          onViewFullPage={handleViewFullPage}
        />
      </div>
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

// Quick-view chips for at-a-glance analysis
function QuickSummary({ fields }: { fields: DraiField[] }) {
  const transfusion = fields.find((f) => f.question.includes("blood transfusion"));
  const travel = fields.find((f) => f.section === "travel" && !f.nested);
  const medications = fields.find((f) => f.section === "medications");
  const items = [
    transfusion && { label: "Transfusion", value: transfusion.answer, low: isLowRisk(transfusion.answer) },
    travel && { label: "Travel", value: travel.answer, low: isLowRisk(travel.answer) },
    medications && { label: "Medications", value: medications.answer, low: isLowRisk(medications.answer) },
  ].filter(Boolean) as { label: string; value: string; low: boolean }[];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, value, low }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            low
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          <span className="text-gray-500">{label}:</span>
          <span className="max-w-[140px] truncate" title={value}>{value}</span>
        </span>
      ))}
    </div>
  );
}

export default function DRAISection({
  data: _data,
  documents: _documents = [],
  onCitationClick,
  donorId,
}: DRAISectionProps) {
  const donorDisplayId = donorId || "#81028";
  const sections = groupBySection(FIELDS);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible">
      <div className="px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Donor Risk Assessment Interview (DRAI)
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Donor ID: {donorDisplayId}
              <span className="mx-2 text-gray-300">·</span>
              <span className="text-blue-600 font-medium">UDRAI</span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Quick view</p>
          <QuickSummary fields={FIELDS} />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {sections.map(({ title, Icon, fields: sectionFields }) => (
          <section key={title} className="rounded-xl border border-gray-100 bg-gray-50/40 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-white/80">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                {title}
              </h4>
            </div>
            <div className="divide-y divide-gray-100/80">
              {sectionFields.map((field) => (
                <DataRow
                  key={field.id}
                  field={field}
                  onCitationClick={(docName, pageNum) =>
                    onCitationClick?.(docName, pageNum, undefined)
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
