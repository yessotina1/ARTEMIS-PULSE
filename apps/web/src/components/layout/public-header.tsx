import Link from "next/link";
import { DemoBanner, Icon } from "@/components/ui";
import { PUBLIC_NAV } from "./nav-config";

export function PublicHeader() {
  return (
    <header className="border-b border-outline-variant bg-container-low">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-md px-margin-mobile md:px-margin">
        <Link href="/" className="flex items-center gap-sm">
          <span aria-hidden className="grid size-8 place-items-center rounded border border-primary/40 text-primary">
            <Icon name="moon" size={18} />
          </span>
          <span>
            <span className="block font-heading text-headline-sm leading-none tracking-tight">
              ARTEMIS PULSE
            </span>
            <span className="font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
              Visibilité lunaire
            </span>
          </span>
        </Link>

        <nav aria-label="Navigation publique" className="ml-auto hidden items-center gap-md md:flex">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-body-md text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-sm md:ml-md">
          <DemoBanner className="hidden lg:inline-flex" />
          <Link
            href="/connexion"
            className="rounded border border-grid px-sm py-xs font-mono text-label-md uppercase tracking-wider text-on-surface hover:border-outline hover:bg-container-high"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="rounded border border-primary-container bg-primary-container px-sm py-xs font-mono text-label-md font-semibold uppercase tracking-wider text-[#03161b] hover:bg-accent-hover"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-xl border-t border-outline-variant bg-container-low">
      <div className="mx-auto grid max-w-6xl gap-md px-margin-mobile py-lg md:grid-cols-3 md:px-margin">
        <div>
          <p className="font-heading text-headline-sm">ARTEMIS PULSE</p>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            Console de planification de la visibilité géométrique Soleil / Terre aux sites du pôle
            Sud lunaire. Données de démonstration.
          </p>
        </div>
        <div>
          <p className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
            Ressources
          </p>
          <ul className="mt-xs space-y-xs text-body-sm">
            <li><Link href="/documentation" className="hover:text-primary">Documentation</Link></li>
            <li><Link href="/sites/shackleton-rim-001" className="hover:text-primary">Fiche publique d&apos;un site</Link></li>
            <li><Link href="/demo" className="hover:text-primary">Analyse de démonstration</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
            Limites
          </p>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            Terre visible = visibilité géométrique, pas une garantie de liaison radio.
            <br />
            Soleil visible ≠ énergie produite.
          </p>
        </div>
      </div>
      <p className="border-t border-outline-variant/60 px-margin-mobile py-sm font-mono text-label-sm text-on-surface-variant md:px-margin">
        Éphémérides DE440 · MOLA/LOLA DEM · version des données 2029.1
      </p>
    </footer>
  );
}
