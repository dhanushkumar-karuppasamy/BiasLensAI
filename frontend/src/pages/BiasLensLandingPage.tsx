import { PageShell } from "../components/layout/PageShell";
import { HeroSection } from "../components/sections/hero/HeroSection";
import { LocalAuditSection } from "../components/sections/localAudit/LocalAuditSection";
import { GlobalAuditSection } from "../components/sections/narrative/GlobalAuditSection";
import { RoadmapSection } from "../components/sections/roadmap/RoadmapSection";

export default function BiasLensLandingPage() {
  return (
    <PageShell>
      <HeroSection />
      <GlobalAuditSection />
      <LocalAuditSection />
      <RoadmapSection />
    </PageShell>
  );
}
