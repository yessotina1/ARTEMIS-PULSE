import { PageHeader } from "@/components/layout/page-header";
import { AssumptionBanner } from "@/components/ui";

export default function DocumentationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="Hypothèses et limites"
        description="Ce que le front affiche, ce qu'il ne calcule pas."
      />
      <AssumptionBanner
        model="MOLA/LOLA DEM 20 m, éphémérides DE440, réfraction nulle"
        source="SPICE / MOON_PA_DE440"
        version="2029.1"
      />
    </>
  );
}
