import { useMemo, useState } from "react";
import { identityOptions, localProfiles } from "../../../data/localAudit.mock";
import { ShapWaterfallMockChart } from "../../../charts/ShapWaterfallMockChart";
import { SectionContainer } from "../../layout/SectionContainer";
import { SectionHeader } from "../../shared/SectionHeader";
import { IdentityControlPanel } from "./IdentityControlPanel";
import { WhatIfSummaryCard } from "./WhatIfSummaryCard";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function LocalAuditSection() {
  const [race, setRace] = useState(identityOptions.race[0]);
  const [sex, setSex] = useState(identityOptions.sex[0]);
  const [maritalStatus, setMaritalStatus] = useState(identityOptions.maritalStatus[1]);
  const [occupation, setOccupation] = useState(identityOptions.occupation[1]);

  const selectedProfile = useMemo(() => {
    const exact = localProfiles.find(
      (profile) =>
        profile.race === race &&
        profile.sex === sex &&
        profile.maritalStatus === maritalStatus &&
        profile.occupation === occupation
    );

    if (exact) {
      return exact;
    }

    const raceIndex = identityOptions.race.indexOf(race);
    const sexIndex = identityOptions.sex.indexOf(sex);
    const maritalIndex = identityOptions.maritalStatus.indexOf(maritalStatus);
    const occupationIndex = identityOptions.occupation.indexOf(occupation);

    const seed = raceIndex * 13 + sexIndex * 7 + maritalIndex * 5 + occupationIndex * 3;
    const base = localProfiles[((seed % localProfiles.length) + localProfiles.length) % localProfiles.length];

    const racePenalty = race === "Black" ? -0.1 : race === "Other" ? -0.05 : 0;
    const sexPenalty = sex === "Female" ? -0.04 : 0.02;
    const maritalBoost = maritalStatus === "Married-civ-spouse" ? 0.08 : maritalStatus === "Never-married" ? -0.03 : -0.01;
    const occupationBoost =
      occupation === "Exec-managerial"
        ? 0.12
        : occupation === "Prof-specialty"
          ? 0.08
          : occupation === "Tech-support"
            ? 0.03
            : -0.02;

    const score = clamp(base.score + racePenalty + sexPenalty + maritalBoost + occupationBoost, 0.18, 0.86);
    const amplitude = clamp(0.85 + (seed % 7) * 0.05, 0.8, 1.2);

    const shap = base.shap.map((item, idx) => {
      const wobble = ((seed + idx * 3) % 5 - 2) * 0.01;
      let feature = item.feature;
      if (feature.startsWith("occupation=")) {
        feature = `occupation=${occupation.toLowerCase()}`;
      }
      return {
        feature,
        impact: Number((item.impact * amplitude + wobble).toFixed(2)),
      };
    });

    return {
      ...base,
      id: `generated-${seed}`,
      label: `${race} + ${sex} + ${maritalStatus}`,
      race,
      sex,
      maritalStatus,
      occupation,
      score,
      shap,
    };
  }, [race, sex, maritalStatus, occupation]);

  return (
    <SectionContainer id="local-audit" className="pt-8 md:pt-12">
      <SectionHeader
        eyebrow="Section 3 · Local Audit"
        title="Intersectional Deep Dive: What-If Engine"
        description="Simulate overlapping identities and inspect how individual feature contributions shift a specific prediction in the proxy-bias model."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.3fr]">
        <div className="space-y-5 xl:sticky xl:top-24">
          <IdentityControlPanel
            race={race}
            sex={sex}
            maritalStatus={maritalStatus}
            occupation={occupation}
            options={identityOptions}
            onChange={(field, value) => {
              if (field === "race") setRace(value);
              if (field === "sex") setSex(value);
              if (field === "maritalStatus") setMaritalStatus(value);
              if (field === "occupation") setOccupation(value);
            }}
          />
          <WhatIfSummaryCard label={selectedProfile.label} score={selectedProfile.score} />
        </div>

        <ShapWaterfallMockChart data={selectedProfile.shap} />
      </div>
    </SectionContainer>
  );
}
