import type { ReactNode } from 'react';

/** Shared shell for the legal pages — consistent typography for prose. */
export default function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted">Last updated {updated}</p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-fg/90 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-fg [&_a]:text-violet-light [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-fg">
        {children}
      </div>
    </article>
  );
}
