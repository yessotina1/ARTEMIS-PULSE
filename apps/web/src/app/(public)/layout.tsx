import { PublicFooter, PublicHeader } from "@/components/layout/public-header";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-sm focus:py-xs focus:font-mono focus:text-on-primary"
      >
        Aller au contenu
      </a>
      <PublicHeader />
      <main id="contenu" className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
