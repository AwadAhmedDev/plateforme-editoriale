import { ContenuEditorialRepository } from "@/lib/db/contenu-editorial-repository";
import { estimerTempsLecture } from "@/features/articles/reading-time";
import { TYPE_CONTENU_LABELS } from "@/features/articles/type-contenu-labels";

export type HomeAnalyseItem = {
  slug: string;
  titre: string;
  chapo: string | null;
  imagePrincipaleUrl: string;
  imageAltText: string;
  typeLabel: string;
  zoneNom: string;
  zoneSlug: string;
  auteur: string | null;
  tempsLecture: string;
};

const ANALYSES_LIMIT = 4;
// `rapport` ajouté après vérification contre une capture d'écran réelle du design : le
// 4e élément affiché dans cette section y est bien "RAPPORT · CORNE (RÉGIONAL)", pas
// seulement analyse/enquête.
const TYPES_ANALYSES = ["analyse", "enquete", "rapport"] as const;

// Section "Analyses & enquêtes approfondies" de l'Accueil (bandeau 2 colonnes, REPO-4 :
// Corne de l'Afrique.dc.html l.141-165) : restreinte aux types `analyse`/`enquete`/
// `rapport` — affiche typeLabel (pas categorieNom, contrairement aux autres sections de
// l'Accueil : design l.156, "{{ item.typeLabel }} · {{ item.countryLabel }}"). Composant
// appelant omet la section entière si aucun contenu Publié de ces types n'existe encore
// (même convention qu'ailleurs : jamais un titre de section sans contenu).
export async function getHomeAnalyses(): Promise<HomeAnalyseItem[]> {
  const items = await ContenuEditorialRepository.findLatestPublishedByTypes([...TYPES_ANALYSES], ANALYSES_LIMIT);

  return items.map((item) => ({
    slug: item.slug,
    titre: item.titre!,
    chapo: item.chapo,
    imagePrincipaleUrl: item.imagePrincipaleUrl!,
    imageAltText: item.imageAltText!,
    typeLabel: TYPE_CONTENU_LABELS[item.typeContenu!] ?? item.typeContenu!,
    zoneNom: item.zone!.nom,
    zoneSlug: item.zone!.slug,
    auteur: item.auteur,
    tempsLecture: estimerTempsLecture(item.corps),
  }));
}
