"use client";

import { useState } from "react";
import { Button, Modal, Tabs, TabsPanel } from "@/components/ui";

export function InteractiveShowcase() {
  const [tab, setTab] = useState("soleil");
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-md md:grid-cols-2">
      <div className="rounded border border-outline-variant bg-container p-md">
        <Tabs
          ariaLabel="Démonstration d'onglets"
          items={[
            { id: "soleil", label: "Soleil" },
            { id: "terre", label: "Terre" },
            { id: "horizon", label: "Horizon" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <TabsPanel id="soleil" value={tab} className="mt-sm text-body-md">
          Azimut solaire / élévation locale / flux incident.
        </TabsPanel>
        <TabsPanel id="terre" value={tab} className="mt-sm text-body-md">
          Visibilité géométrique de la Terre.
        </TabsPanel>
        <TabsPanel id="horizon" value={tab} className="mt-sm text-body-md">
          Profil d&apos;horizon topographique 0° à 360°.
        </TabsPanel>
      </div>
      <div className="flex flex-col items-start gap-sm rounded border border-outline-variant bg-container p-md">
        <p className="font-mono text-label-md uppercase text-on-surface-variant">Modale</p>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Ouvrir la modale
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Confirmer le lancement"
          description="Le run sera ajouté à la file de calcul."
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Lancer
              </Button>
            </>
          }
        >
          <p className="text-body-md text-on-surface-variant">
            Échap ferme la fenêtre, le focus revient au bouton déclencheur.
          </p>
        </Modal>
      </div>
    </div>
  );
}
