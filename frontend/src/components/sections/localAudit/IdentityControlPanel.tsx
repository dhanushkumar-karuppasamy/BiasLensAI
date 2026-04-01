import { SlidersHorizontal } from "lucide-react";

type IdentityControlPanelProps = {
  race: string;
  sex: string;
  maritalStatus: string;
  occupation: string;
  options: {
    race: string[];
    sex: string[];
    maritalStatus: string[];
    occupation: string[];
  };
  onChange: (field: "race" | "sex" | "maritalStatus" | "occupation", value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function IdentityControlPanel({
  race,
  sex,
  maritalStatus,
  occupation,
  options,
  onChange,
}: IdentityControlPanelProps) {
  return (
    <aside className="app-card rounded-2xl p-5 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-2">
          <SlidersHorizontal className="h-4 w-4 text-cyan-700" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Counterfactual Control Panel</h3>
          <p className="text-xs text-slate-500">Select intersecting identities to inspect local outcomes.</p>
        </div>
      </div>

      <div className="space-y-4">
        <SelectField label="Race" value={race} options={options.race} onChange={(value) => onChange("race", value)} />
        <SelectField label="Sex" value={sex} options={options.sex} onChange={(value) => onChange("sex", value)} />
        <SelectField
          label="Marital Status"
          value={maritalStatus}
          options={options.maritalStatus}
          onChange={(value) => onChange("maritalStatus", value)}
        />
        <SelectField
          label="Occupation"
          value={occupation}
          options={options.occupation}
          onChange={(value) => onChange("occupation", value)}
        />
      </div>
    </aside>
  );
}
