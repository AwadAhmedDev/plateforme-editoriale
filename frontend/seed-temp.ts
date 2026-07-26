import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  // Rubriques (REPO-1, B1) : remplacent Politique/Économie/Société — ordre et
  // libellés repris littéralement de RUBRIQUES dans Corne de l'Afrique.dc.html.
  const categories = await Promise.all(
    [
      { nom: "Asile & protection", slug: "asile", descriptionCourte: "Droit d'asile, statut de réfugié et protection internationale dans la région." },
      { nom: "Migrations", slug: "migrations", descriptionCourte: "Routes migratoires, déplacements et diaspora de la Corne de l'Afrique." },
      { nom: "Droits humains", slug: "droits-humains", descriptionCourte: "Violations, mécanismes de protection et défense des droits humains." },
      { nom: "Juridique", slug: "juridique", descriptionCourte: "Cadres juridiques nationaux et internationaux applicables à la région." },
      { nom: "Analyses pays", slug: "analyses-pays", descriptionCourte: "Analyses politiques, économiques et sécuritaires par pays." },
      { nom: "Interviews", slug: "interviews", descriptionCourte: "Entretiens avec des acteurs et témoins de la région." },
    ].map((c) =>
      prisma.categorie.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );

  // Pays (REPO-1, B2) : ordre et libellés repris littéralement de COUNTRIES dans
  // Corne de l'Afrique.dc.html.
  const zones = await Promise.all(
    [
      { nom: "Somalie", slug: "somalie", descriptionCourte: "Actualités liées à la Somalie." },
      { nom: "Djibouti", slug: "djibouti", descriptionCourte: "Actualités liées à Djibouti." },
      { nom: "Somaliland", slug: "somaliland", descriptionCourte: "Actualités liées au Somaliland." },
      { nom: "Éthiopie", slug: "ethiopie", descriptionCourte: "Actualités liées à l'Éthiopie." },
      { nom: "Érythrée", slug: "erythree", descriptionCourte: "Actualités liées à l'Érythrée." },
      { nom: "Kenya", slug: "kenya", descriptionCourte: "Actualités liées au Kenya." },
      { nom: "Soudan", slug: "soudan", descriptionCourte: "Actualités liées au Soudan." },
      { nom: "Corne (régional)", slug: "regional", descriptionCourte: "Actualités concernant l'ensemble de la région." },
    ].map((z) =>
      prisma.zoneGeographique.upsert({ where: { slug: z.slug }, update: {}, create: z })
    )
  );

  // Recherche par slug (plutôt qu'une déstructuration positionnelle) : robuste à
  // l'ordre des tableaux ci-dessus, qui reflète l'ordre éditorial du design, pas un
  // ordre technique arbitraire.
  const parSlugCategorie = (slug: string) => categories.find((c) => c.slug === slug)!;
  const parSlugZone = (slug: string) => zones.find((z) => z.slug === slug)!;

  // Anciens articles de démonstration (Lot Homepage, hors périmètre du repositionnement
  // éditorial REPO-1→9) : sans rapport avec les thématiques Asile & protection /
  // Migrations / Droits humains / Juridique / Analyses pays / Interviews du nouveau
  // design — remplacés intégralement (pas de reclassement, contrairement à REPO-1) par
  // le corpus ci-dessous, aligné sur le contenu réellement montré par Corne de
  // l'Afrique.dc.html (écrans Accueil/Recherche). Supprimés avant la création des
  // nouveaux articles : idempotent (deleteMany par slug), aucune erreur si déjà absents.
  const anciensSlugs = [
    "dossier-dynamiques-regionales-corne-afrique",
    "ethiopie-reforme-fonciere-regions-rurales",
    "somalie-peche-diversification-economique",
    "kenya-education-numerique-programmes",
    "addis-abeba-sommet-regional-securite",
    "nairobi-investissements-technologiques",
    "mogadiscio-reconstruction-infrastructures-sanitaires",
  ];
  await prisma.contenuMotCle.deleteMany({ where: { contenu: { slug: { in: anciensSlugs } } } });
  await prisma.contenuEditorial.deleteMany({ where: { slug: { in: anciensSlugs } } });

  // Corpus éditorial (REPO-10, alignement contenu sur le design) : 14 contenus Publiés,
  // couvrant les 6 rubriques, les 8 pays et les 6 valeurs de TypeContenu (dont `rapport`,
  // resté sans contenu depuis REPO-1). Texte générique et illustratif — aucun fait,
  // organisation ou statistique présenté comme réel ou vérifié ; sujets traités
  // (asile, violences de genre, déplacement) volontairement non graphiques, sur un
  // registre documentaire neutre cohérent avec la ligne éditoriale du média fictif.
  const articles = [
    {
      slug: "ethiopie-rapport-dispositif-asile-afflux-regional",
      titre: "Rapport pays : le dispositif d'asile éthiopien face à l'afflux régional",
      chapo: "Cadre légal, capacités d'accueil, coopération internationale : un rapport documentaire destiné aux praticiens du droit d'asile.",
      corps:
        "Ce rapport pays dresse un état des lieux du cadre légal éthiopien en matière d'asile, de son articulation avec les conventions internationales ratifiées par le pays et des procédures effectivement suivies par les autorités compétentes.\n\nIl détaille les capacités d'accueil actuelles, les délais moyens de traitement des dossiers et les principaux points de friction identifiés par les praticiens du droit d'asile et les organisations d'accompagnement juridique.\n\nUne section dédiée revient sur les mécanismes de coopération avec les agences internationales présentes dans la région, ainsi que sur les évolutions réglementaires envisagées à moyen terme.",
      categorieId: parSlugCategorie("juridique").id,
      zoneId: parSlugZone("ethiopie").id,
      auteur: "La rédaction",
      image: "djibouti-cote-portuaire.jpg",
      motsCles: ["asile", "droit", "rapport pays"],
      // 20, pas 0 : laisse "voies-de-recours-refugies-region" (rapport, plus proche du
      // design confirmé par capture) et "ethiopie-barrage-nil-bleu-populations-
      // deplacees" occuper les positions les plus récentes du bandeau "Analyses &
      // enquêtes approfondies" (getHomeAnalyses, limite 4) plutôt que de les
      // concurrencer.
      joursDecalage: 20,
      typeContenu: "rapport" as const,
    },
    {
      slug: "somalie-demandes-asile-femmes-violences-genre",
      titre: "Ce que les demandes d'asile de femmes somaliennes disent des violences de genre",
      chapo: "Un examen des motifs invoqués dans les dossiers d'asile déposés par des femmes fuyant conflits et violences ciblées.",
      corps:
        "L'analyse porte sur un ensemble de dossiers de demande d'asile déposés par des femmes originaires de Somalie, en s'attachant aux motifs recevables tels qu'exposés devant les instances compétentes, sans reproduire les détails les plus sensibles des récits individuels.\n\nElle met en évidence la manière dont les violences fondées sur le genre sont qualifiées juridiquement selon les juridictions, ainsi que les écarts d'appréciation qui en résultent d'un pays d'accueil à l'autre.\n\nLes limites documentaires de cet exercice sont également discutées : la difficulté à établir des preuves recevables et l'accompagnement psychosocial souvent nécessaire en parallèle de la procédure.",
      categorieId: parSlugCategorie("asile").id,
      zoneId: parSlugZone("somalie").id,
      auteur: "La rédaction",
      image: "port-conteneurs-grues.jpg",
      motsCles: ["asile", "genre", "protection"],
      // 21, pas 1 : même raison que joursDecalage sur "ethiopie-rapport-dispositif-
      // asile-afflux-regional" ci-dessus — laisse les 4 éléments confirmés par capture
      // d'écran occuper le bandeau "Analyses & enquêtes approfondies" de l'Accueil.
      joursDecalage: 21,
      typeContenu: "analyse" as const,
    },
    {
      slug: "ethiopie-barrage-nil-bleu-populations-deplacees",
      titre: "Le grand barrage du Nil bleu et ses populations déplacées",
      chapo: "Au-delà de la diplomatie de l'eau entre Éthiopie, Soudan et Égypte, des communautés entières ont dû quitter leurs terres.",
      corps:
        "Si les négociations diplomatiques autour du grand barrage de la Renaissance concentrent l'attention régionale, la construction a également entraîné le déplacement de plusieurs communautés riveraines, dont le relogement s'est étalé sur plusieurs années.\n\nCette enquête documente les modalités de compensation prévues, leur mise en œuvre effective et les recours dont disposent les populations concernées lorsque les indemnisations sont jugées insuffisantes.\n\nElle replace enfin ces déplacements dans le contexte plus large des tensions diplomatiques entre l'Éthiopie, le Soudan et l'Égypte autour du partage des eaux du Nil.",
      categorieId: parSlugCategorie("analyses-pays").id,
      zoneId: parSlugZone("ethiopie").id,
      auteur: "La rédaction",
      // Photo réelle (fournie par l'utilisateur) : port à conteneurs et grues au
      // crépuscule — même image que le design réutilise pour cet article et pour
      // "ethiopie-somaliland-accord-populations-deplacees" ci-dessous.
      image: "port-conteneurs-grues.jpg",
      motsCles: ["barrage", "déplacement", "diplomatie de l'eau"],
      joursDecalage: 2,
      typeContenu: "enquete" as const,
    },
    {
      slug: "djibouti-carrefour-migratoire-peninsule-arabique",
      titre: "Djibouti, carrefour migratoire entre Corne de l'Afrique et péninsule Arabique",
      chapo: "Port et aéroport de Djibouti concentrent une part croissante des flux migratoires vers le Golfe.",
      corps:
        "La position géographique de Djibouti en fait un point de passage privilégié pour les personnes originaires de la Corne de l'Afrique en direction de la péninsule Arabique, par voie maritime comme aérienne.\n\nCet article revient sur les infrastructures concernées, les acteurs qui organisent ces déplacements et les risques documentés par les organisations présentes sur place.\n\nIl aborde également les réponses apportées par les autorités djiboutiennes et leurs partenaires internationaux face à l'augmentation de ces flux.",
      categorieId: parSlugCategorie("migrations").id,
      zoneId: parSlugZone("djibouti").id,
      auteur: "La rédaction",
      // Photo réelle (fournie par l'utilisateur, pas un placeholder générique) : ville
      // côtière de la mer Rouge au coucher du soleil, cohérente avec le rôle de
      // carrefour maritime de Djibouti décrit ci-dessus.
      image: "djibouti-cote-portuaire.jpg",
      motsCles: ["migration", "golfe", "transit"],
      joursDecalage: 3,
      typeContenu: "article" as const,
    },
    {
      slug: "corne-afrique-routes-migratoires-trois-cartes",
      titre: "Les routes migratoires de la Corne de l'Afrique, en trois cartes",
      chapo: "Itinéraires terrestres et maritimes, points de passage, zones à risque : un tour d'horizon des principales routes migratoires régionales.",
      corps:
        "Ce dossier propose une lecture cartographique des principales routes migratoires qui traversent la Corne de l'Afrique, depuis les zones de départ jusqu'aux points de sortie régionaux.\n\nIl distingue les itinéraires terrestres, souvent empruntés par étapes, des traversées maritimes plus directes mais aussi plus risquées, et situe les principaux points de passage identifiés par les organisations humanitaires.\n\nCe dossier sera mis à jour au fil des publications, à mesure que de nouvelles données viendront enrichir chacun de ces itinéraires.",
      categorieId: parSlugCategorie("migrations").id,
      zoneId: parSlugZone("regional").id,
      auteur: "La rédaction",
      image: "orpaillage-mains-tamis.jpg",
      motsCles: ["cartographie", "routes migratoires", "dossier"],
      joursDecalage: 4,
      typeContenu: "dossier_thematique" as const,
    },
    {
      slug: "kenya-entretien-ong-camps-refugies",
      titre: "« Les camps ne sont pas une solution durable » — entretien avec une responsable d'ONG au Kenya",
      chapo: "Une responsable d'une organisation d'aide aux réfugiés revient sur les limites du modèle des camps de longue durée.",
      corps:
        "Après plusieurs années passées à coordonner des programmes d'assistance dans des camps de réfugiés au Kenya, notre interlocutrice revient sur les limites structurelles de ce modèle d'accueil, pensé pour l'urgence mais souvent prolongé sur plusieurs décennies.\n\nElle détaille les alternatives testées localement — intégration économique, accès à l'éducation hors camp, dispositifs de logement urbain — et les obstacles administratifs qui freinent leur généralisation.\n\nL'entretien aborde enfin la question du financement international, dont la baisse progressive complique la planification à long terme des organisations de terrain.",
      categorieId: parSlugCategorie("interviews").id,
      zoneId: parSlugZone("kenya").id,
      auteur: "La rédaction",
      image: "routes-mer-rouge-porte-conteneurs.jpg",
      motsCles: ["entretien", "camps de réfugiés", "ong"],
      joursDecalage: 5,
      typeContenu: "interview" as const,
    },
    {
      slug: "soudan-entretien-juriste-documenter-proteger",
      titre: "Juriste au Soudan : « Documenter, c'est déjà protéger »",
      chapo: "Entretien avec une avocate spécialisée dans l'assistance juridique aux personnes déplacées par le conflit.",
      corps:
        "Basée dans un centre d'assistance juridique, notre interlocutrice explique pourquoi la simple documentation des situations individuelles — identité, parcours, biens perdus — constitue déjà, selon elle, une première forme de protection pour les personnes déplacées.\n\nElle revient sur les difficultés pratiques de ce travail dans un contexte de conflit actif : accès limité à certaines zones, insécurité pour les équipes, archives administratives endommagées ou inaccessibles.\n\nL'entretien se conclut sur les perspectives de reconstruction des dispositifs d'état civil, condition jugée essentielle à la résolution durable des situations de déplacement.",
      categorieId: parSlugCategorie("interviews").id,
      zoneId: parSlugZone("soudan").id,
      auteur: "La rédaction",
      image: "djibouti-cote-portuaire.jpg",
      motsCles: ["entretien", "assistance juridique", "déplacement"],
      joursDecalage: 6,
      typeContenu: "interview" as const,
    },
    {
      slug: "erythree-temoignages-diaspora",
      titre: "Érythrée : ce que documentent les témoignages de la diaspora",
      chapo: "Recoupement de témoignages recueillis auprès de ressortissants érythréens ayant quitté le pays ces cinq dernières années.",
      corps:
        "Cette enquête s'appuie sur un ensemble de témoignages recueillis auprès de membres de la diaspora érythréenne installés dans différents pays d'accueil, recoupés autant que possible avec les rapports d'organisations internationales spécialisées.\n\nElle documente les circonstances de départ le plus souvent évoquées, ainsi que les parcours migratoires empruntés jusqu'à l'obtention d'un statut de protection.\n\nLes auteurs rappellent les limites méthodologiques de ce type de recueil : biais de sélection des témoins disponibles et impossibilité de vérification indépendante sur place.",
      categorieId: parSlugCategorie("droits-humains").id,
      zoneId: parSlugZone("erythree").id,
      auteur: "La rédaction",
      image: "port-conteneurs-grues.jpg",
      motsCles: ["diaspora", "témoignages", "enquête"],
      joursDecalage: 7,
      typeContenu: "enquete" as const,
    },
    {
      slug: "somaliland-mecanismes-locaux-protection-deplaces",
      titre: "Somaliland : les mécanismes locaux de protection des personnes déplacées",
      chapo: "Face à l'absence de reconnaissance internationale, des dispositifs locaux tentent de combler le vide juridique.",
      corps:
        "En l'absence de reconnaissance internationale de son statut, le Somaliland a développé des dispositifs administratifs propres pour encadrer l'accueil et la protection des personnes déplacées présentes sur son territoire.\n\nCet article détaille le fonctionnement de ces mécanismes locaux, leur articulation informelle avec les cadres juridiques internationaux existants, et les zones grises qui en résultent pour les personnes concernées.\n\nIl évoque enfin les initiatives de coopération technique engagées avec certaines organisations internationales, malgré l'absence de reconnaissance diplomatique formelle.",
      categorieId: parSlugCategorie("droits-humains").id,
      zoneId: parSlugZone("somaliland").id,
      auteur: "La rédaction",
      image: "orpaillage-mains-tamis.jpg",
      motsCles: ["protection", "déplacement interne", "cadre local"],
      joursDecalage: 8,
      typeContenu: "article" as const,
    },
    {
      slug: "kenya-nouvelle-loi-refugies",
      titre: "Kenya : ce que change la nouvelle loi sur les réfugiés",
      chapo: "Adoptée après plusieurs années de négociation, la réforme légale kényane redéfinit les droits économiques des réfugiés.",
      corps:
        "La réforme législative kényane relative au statut des réfugiés introduit plusieurs changements significatifs, en particulier sur le plan des droits économiques : accès élargi au marché du travail formel et possibilité, sous conditions, de circuler hors des zones d'installation historiques.\n\nCette analyse détaille les mécanismes d'application prévus par le texte, les décrets d'exécution encore attendus et les premières réactions des organisations de la société civile.\n\nElle met en perspective cette réforme avec les engagements internationaux pris par le Kenya en matière d'intégration économique des populations réfugiées.",
      categorieId: parSlugCategorie("juridique").id,
      zoneId: parSlugZone("kenya").id,
      auteur: "La rédaction",
      image: "routes-mer-rouge-porte-conteneurs.jpg",
      motsCles: ["loi", "réfugiés", "droits économiques"],
      joursDecalage: 9,
      typeContenu: "analyse" as const,
    },
    {
      slug: "somalie-diaspora-partenaire-economique",
      titre: "Somalie : la diaspora, premier partenaire économique du pays",
      chapo: "Les transferts de fonds de la diaspora somalienne dépassent largement l'aide internationale au développement.",
      corps:
        "Les transferts de fonds envoyés par la diaspora somalienne représentent, selon plusieurs estimations concordantes, un volume nettement supérieur à celui de l'aide internationale au développement reçue par le pays.\n\nCet article revient sur les canaux utilisés pour ces transferts, les secteurs économiques qui en bénéficient le plus directement et les difficultés d'accès aux services bancaires classiques rencontrées par une partie de la diaspora.\n\nIl aborde enfin les projets de structuration de ces flux portés par certaines institutions financières régionales.",
      categorieId: parSlugCategorie("migrations").id,
      zoneId: parSlugZone("somalie").id,
      auteur: "La rédaction",
      image: "djibouti-cote-portuaire.jpg",
      motsCles: ["diaspora", "transferts de fonds", "économie"],
      joursDecalage: 10,
      typeContenu: "article" as const,
    },
    {
      slug: "soudan-asile-interne-categorie-hors-statistiques",
      titre: "Soudan : l'asile interne, une catégorie qui échappe aux statistiques",
      chapo: "Les personnes déplacées à l'intérieur du pays restent largement absentes des cadres de protection internationale.",
      corps:
        "Contrairement aux personnes ayant franchi une frontière internationale, celles déplacées à l'intérieur même du Soudan relèvent d'un régime de protection distinct, moins outillé sur le plan statistique comme sur le plan juridique.\n\nCette analyse revient sur les raisons de cet écart de traitement, les tentatives récentes d'harmonisation des cadres de suivi, et les conséquences concrètes pour l'accès à l'assistance humanitaire.\n\nElle souligne enfin le rôle des acteurs locaux, souvent seuls en mesure de documenter ces situations sur la durée.",
      categorieId: parSlugCategorie("asile").id,
      zoneId: parSlugZone("soudan").id,
      auteur: "La rédaction",
      image: "port-conteneurs-grues.jpg",
      motsCles: ["déplacement interne", "statistiques", "protection"],
      joursDecalage: 11,
      typeContenu: "analyse" as const,
    },
    {
      slug: "corne-afrique-region-sept-crises-entremelees",
      titre: "Corne de l'Afrique : une région, sept crises entremêlées",
      chapo: "Panorama des dynamiques régionales qui se recoupent et se renforcent mutuellement, d'un pays à l'autre.",
      corps:
        "Conflits armés, tensions frontalières, sécheresses récurrentes, crises économiques : les dynamiques qui traversent la Corne de l'Afrique se recoupent rarement selon les frontières nationales.\n\nCet article propose un panorama synthétique de ces dynamiques régionales, en s'attachant à leurs points de contact plutôt qu'à une lecture strictement pays par pays.\n\nIl sera mis à jour au fil des publications, à mesure que de nouvelles analyses viendront enrichir chacun de ces axes.",
      categorieId: parSlugCategorie("analyses-pays").id,
      zoneId: parSlugZone("regional").id,
      auteur: "La rédaction",
      // Reprend la photo du hero (voies-de-recours-refugies-region) : la grille
      // "Actualités & terrain" n'a que 4 vraies photos à répartir sur 4 cartes,
      // cette 4e carte partageait auparavant celle de la 2e (orpaillage-mains-tamis.jpg).
      image: "routes-mer-rouge-porte-conteneurs.jpg",
      motsCles: ["panorama régional", "analyse", "dynamiques"],
      joursDecalage: 12,
      typeContenu: "article" as const,
    },
    {
      slug: "ethiopie-defenseurs-droits-humains-sous-pression",
      titre: "Éthiopie : les défenseurs des droits humains sous pression",
      chapo: "Plusieurs organisations locales rapportent une multiplication des obstacles administratifs à leur travail documentaire.",
      corps:
        "Plusieurs organisations éthiopiennes de défense des droits humains font état, ces derniers mois, d'une multiplication des obstacles administratifs rencontrés dans le cadre de leur travail de documentation.\n\nCette enquête recense les types d'obstacles rapportés — délais d'enregistrement, restrictions d'accès à certaines zones, exigences de justification renforcées — et les recoupe avec les textes réglementaires en vigueur.\n\nElle donne également la parole à plusieurs de ces organisations sur les stratégies d'adaptation mises en place pour poursuivre leur mission documentaire.",
      categorieId: parSlugCategorie("droits-humains").id,
      zoneId: parSlugZone("ethiopie").id,
      auteur: "La rédaction",
      image: "routes-mer-rouge-porte-conteneurs.jpg",
      motsCles: ["droits humains", "société civile", "documentation"],
      joursDecalage: 13,
      typeContenu: "enquete" as const,
    },
    // Les 3 articles ci-dessous reprennent des titres confirmés directement contre une
    // capture d'écran réelle du design (section Homepage "Analyses & enquêtes
    // approfondies") — mêmes types/rubriques/pays que ceux affichés (Analyse·Éthiopie,
    // Enquête·Soudan, Rapport·Corne(régional)). Placés en fin de tableau et datés
    // joursDecalage 0-2 : avec "ethiopie-barrage-nil-bleu-populations-deplacees"
    // (déjà présent, enquête), ce sont les 4 contenus analyse/enquête/rapport les plus
    // récents — donc ceux affichés par getHomeAnalyses (limite 4), reproduisant les 4
    // mêmes éléments que la capture.
    {
      slug: "ethiopie-somaliland-accord-populations-deplacees",
      titre: "L'accord Éthiopie–Somaliland et ses conséquences pour les populations déplacées",
      chapo: "Derrière l'enjeu de l'accès à la mer, les tensions frontalières fragilisent des zones où vivent des milliers de déplacés internes.",
      corps:
        "L'accord conclu entre l'Éthiopie et le Somaliland autour d'un accès à la façade maritime a ravivé des tensions frontalières dans plusieurs zones où sont déjà installées des populations déplacées internes.\n\nCette analyse revient sur les termes rendus publics de l'accord, les réactions des autorités somaliennes et des pays voisins, et les conséquences documentées pour les communautés vivant dans les zones frontalières concernées.\n\nElle souligne enfin la fragilité des dispositifs d'assistance existants dans ces zones, déjà sous tension avant même la signature de l'accord.",
      categorieId: parSlugCategorie("analyses-pays").id,
      zoneId: parSlugZone("ethiopie").id,
      auteur: "La rédaction",
      // Même photo que "ethiopie-barrage-nil-bleu-populations-deplacees" : le design
      // réutilise cette image pour les deux cartes de la section Analyses & enquêtes.
      image: "port-conteneurs-grues.jpg",
      motsCles: ["accord bilatéral", "frontières", "déplacement"],
      joursDecalage: 1,
      typeContenu: "analyse" as const,
    },
    {
      slug: "soudan-or-finance-milices-exil-civils",
      titre: "Enquête : l'or qui finance les milices et pousse les civils à l'exil",
      chapo: "Les routes de contrebande d'or entre Soudan et Érythrée financent des groupes armés dont les exactions alimentent les départs forcés.",
      corps:
        "Cette enquête retrace les grandes lignes des routes de contrebande d'or identifiées entre le Soudan et l'Érythrée, à partir de rapports d'organisations spécialisées dans le suivi des économies de guerre.\n\nElle documente le rôle de ce financement dans l'équipement et la solde de plusieurs groupes armés actifs dans la région, et le lien établi par plusieurs témoignages entre leurs exactions et des départs forcés de populations civiles.\n\nElle rappelle enfin les limites de ce type de traçage économique, mené en grande partie depuis l'extérieur des zones concernées.",
      categorieId: parSlugCategorie("droits-humains").id,
      zoneId: parSlugZone("soudan").id,
      auteur: "La rédaction",
      // Photo réelle (fournie par l'utilisateur) : orpaillage artisanal, mains et tamis —
      // même image que celle montrée par le design pour cet article.
      image: "orpaillage-mains-tamis.jpg",
      motsCles: ["or", "économie de guerre", "milices"],
      joursDecalage: 0,
      typeContenu: "enquete" as const,
    },
    {
      slug: "voies-de-recours-refugies-region",
      titre: "Quelles voies de recours pour les réfugiés de la région ?",
      chapo: "Un rapport juridique sur les protections offertes par le droit international et leurs limites concrètes sur le terrain.",
      corps:
        "Ce rapport recense les principales voies de recours ouvertes aux personnes réfugiées dans la région, telles que prévues par les conventions internationales et les législations nationales applicables.\n\nIl met en regard ces protections théoriques avec leur mise en œuvre effective, en s'appuyant sur des cas documentés par des organisations d'assistance juridique présentes dans plusieurs pays de la région.\n\nUne dernière section identifie les principales limites pratiques rencontrées par les personnes cherchant à faire valoir ces recours, indépendamment du pays d'accueil concerné.",
      categorieId: parSlugCategorie("juridique").id,
      zoneId: parSlugZone("regional").id,
      auteur: "La rédaction",
      // Photo réelle (fournie par l'utilisateur) : vue aérienne d'un détroit de la mer
      // Rouge avec porte-conteneurs — même image que celle montrée par le design pour
      // cet article.
      image: "routes-mer-rouge-porte-conteneurs.jpg",
      motsCles: ["droit international", "recours", "réfugiés"],
      joursDecalage: 0,
      typeContenu: "rapport" as const,
    },
  ];

  for (const a of articles) {
    const datePublication = new Date(Date.now() - a.joursDecalage * 24 * 60 * 60 * 1000);
    await prisma.contenuEditorial.upsert({
      where: { slug: a.slug },
      // datePublication volontairement absente de `update` : trigger DR-005
      // (déjà en production, cf. AGENTS.md §Auth) — la date de publication ne peut
      // plus être modifiée une fois renseignée. Un rejeu de ce script sur des
      // articles déjà seedés ne doit donc réécrire que le contenu, jamais la date.
      update: {
        titre: a.titre,
        chapo: a.chapo,
        corps: a.corps,
        typeContenu: a.typeContenu,
        categorieId: a.categorieId,
        zoneId: a.zoneId,
        auteur: a.auteur,
        imagePrincipaleUrl: `/seed/${a.image}`,
        imageAltText: a.titre,
      },
      create: {
        slug: a.slug,
        titre: a.titre,
        chapo: a.chapo,
        corps: a.corps,
        typeContenu: a.typeContenu,
        categorieId: a.categorieId,
        zoneId: a.zoneId,
        imagePrincipaleUrl: `/seed/${a.image}`,
        imageAltText: a.titre,
        imageLargeur: 800,
        imageHauteur: 450,
        auteur: a.auteur,
        statut: "publie",
        datePublication,
        motsCles: {
          create: a.motsCles.map((motCle) => ({ motCle })),
        },
      },
    });
  }

  console.log(`Seed terminé : ${categories.length} catégories, ${zones.length} zones, ${articles.length} articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
