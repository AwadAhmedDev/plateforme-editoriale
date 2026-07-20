import type { Metadata } from "next";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";

// Page Newsletter dédiée (sitemap.md, ui-specification.md §Newsletter) : formulaire à
// un seul champ (e-mail). Aucun layout public dédié n'est créé — le groupe de routes
// (public) reste une pure convention d'organisation, sans nav/footer tant qu'aucune
// autre page publique n'existe (aucun lien vers une page inexistante).
//
// Metadata (Lot L10, contrat validé) : title statique reprenant le <h1> tel quel,
// aucune description spécifique — même choix que /, /articles, /recherche.
export const metadata: Metadata = {
  title: "Newsletter",
  alternates: {
    canonical: "/newsletter",
  },
};

export default function NewsletterPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-7">
      <h1 className="font-editorial text-3xl">Newsletter</h1>
      <p className="text-sm text-text-secondary">
        Recevez les nouvelles publications, analyses et actualités du média directement par e-mail.
      </p>
      <NewsletterForm />
    </main>
  );
}
