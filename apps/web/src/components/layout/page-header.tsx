import Link from "next/link";
import { Icon } from "@/components/ui";

export function PageHeader({
  title,
  eyebrow,
  description,
  actions,
  breadcrumb,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: { href?: string; label: string }[];
}) {
  return (
    <header className="mb-md">
      {breadcrumb ? (
        <nav aria-label="Fil d'Ariane" className="mb-xs">
          <ol className="flex flex-wrap items-center gap-xs font-mono text-label-sm text-on-surface-variant">
            {breadcrumb.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-xs">
                {index > 0 ? (
                  <Icon name="chevron-right" size={12} className="text-outline" />
                ) : null}
                {item.href ? (
                  <Link href={item.href} className="hover:text-on-surface hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-sm">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-label-md uppercase tracking-widest text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="text-headline-lg font-heading leading-tight">{title}</h1>
          {description ? (
            <p className="mt-xs max-w-3xl text-body-md text-on-surface-variant">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-sm">{actions}</div> : null}
      </div>
    </header>
  );
}
