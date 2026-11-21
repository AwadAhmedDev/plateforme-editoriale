import { DEMO_MODE } from "@/lib/demo";

// Démo publique : visible sur toutes les pages, pour qu'aucun visiteur ne prenne les
// articles de démonstration pour de l'information réelle.
export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div
      role="note"
      className="border-b border-[#e6c97a] bg-[#fdf3d8] px-4 py-2 text-center font-ui text-sm text-[#4a3700]"
    >
      Site de démonstration (portfolio) : les articles sont des contenus fictifs rédigés pour illustrer
      la plateforme, pas une source d&apos;information.
    </div>
  );
}

// Rappel en tête de chaque article, pour un lecteur arrivé directement par un lien partagé.
export function DemoArticleNotice() {
  if (!DEMO_MODE) return null;
  return (
    <p role="note" className="mt-4 rounded-sm border border-[#e6c97a] bg-[#fdf3d8] px-3 py-2 font-ui text-sm text-[#4a3700]">
      Article de démonstration : contenu fictif, ne pas citer comme source.
    </p>
  );
}
