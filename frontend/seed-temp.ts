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

  // Pays (REPO-1, B2) : Éthiopie/Somalie/Kenya déjà présents conservés tels quels
  // (slugs identiques dans COUNTRIES du design) ; 5 pays ajoutés. Ordre et libellés
  // repris littéralement de COUNTRIES dans Corne de l'Afrique.dc.html.
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
  // l'ordre des tableaux ci-dessus, qui reflète désormais l'ordre éditorial du
  // design, pas un ordre technique arbitraire.
  const analysesPays = categories.find((c) => c.slug === "analyses-pays")!;
  const ethiopie = zones.find((z) => z.slug === "ethiopie")!;
  const somalie = zones.find((z) => z.slug === "somalie")!;
  const kenya = zones.find((z) => z.slug === "kenya")!;

  // Les 7 articles de démonstration ci-dessous datent de l'ancien positionnement
  // (Politique/Économie/Société) : aucun ne relève des thématiques Asile & protection /
  // Migrations / Droits humains / Juridique / Interviews du nouveau design — reclassés
  // dans "Analyses pays" (seule rubrique restante à portée générale par pays), sans
  // réécriture de titre/chapô/corps/auteur (hors périmètre de REPO-1, qui ne porte que
  // sur la taxonomie — voir analyse préalable). Zones inchangées : ethiopie/somalie/kenya
  // restent des pays valides du nouveau design, aucune raison de les modifier.
  const articles = [
    {
      slug: "dossier-dynamiques-regionales-corne-afrique",
      titre: "Dossier : comprendre les dynamiques régionales de la Corne de l'Afrique",
      chapo:
        "Un tour d'horizon synthétique des enjeux politiques, économiques et sécuritaires qui structurent la région, pour resituer l'actualité dans son contexte de long terme.",
      corps:
        "Ce dossier propose une lecture transversale des grands équilibres régionaux de la Corne de l'Afrique, à l'usage des lecteurs qui découvrent la zone comme de ceux qui en suivent l'actualité au quotidien.\n\nIl reprend, axe par axe, les principales lignes de force identifiées par la rédaction : rapports de force politiques, trajectoires économiques nationales et enjeux sécuritaires transfrontaliers.\n\nCe dossier sera mis à jour au fil des publications, à mesure que de nouvelles analyses viendront enrichir chacun de ces axes.",
      categorieId: analysesPays.id,
      zoneId: ethiopie.id,
      auteur: "Rédaction",
      image: "article-1.png",
      motsCles: ["dossier", "analyse régionale", "corne de l'afrique"],
      joursDecalage: 0,
      typeContenu: "dossier_thematique" as const,
    },
    {
      slug: "ethiopie-reforme-fonciere-regions-rurales",
      titre: "L'Éthiopie engage une réforme foncière dans les régions rurales",
      chapo: "Le gouvernement fédéral annonce un plan de clarification des titres fonciers destiné aux exploitants agricoles.",
      corps:
        "Le ministère de l'Agriculture a présenté cette semaine un plan pluriannuel visant à sécuriser les droits fonciers dans plusieurs régions rurales du pays.\n\nCe programme, financé en partie par des bailleurs internationaux, doit permettre à des dizaines de milliers d'exploitants agricoles d'obtenir un titre de propriété officiel.\n\nLes autorités locales seront chargées du déploiement sur le terrain, avec un premier bilan attendu d'ici la fin de l'année.",
      categorieId: analysesPays.id,
      zoneId: ethiopie.id,
      auteur: "Amina Tesfaye",
      image: "article-1.png",
      motsCles: ["agriculture", "réforme", "foncier"],
      joursDecalage: 1,
    },
    {
      slug: "somalie-peche-diversification-economique",
      titre: "La Somalie mise sur la pêche pour diversifier son économie",
      chapo: "Un nouveau plan national entend développer la filière halieutique le long des côtes somaliennes.",
      corps:
        "Longtemps sous-exploitée, la filière pêche fait l'objet d'un plan de relance porté par le ministère des Ressources marines.\n\nL'objectif est de moderniser les infrastructures portuaires et de former une nouvelle génération de pêcheurs aux techniques durables.\n\nDes discussions sont en cours avec plusieurs partenaires régionaux pour financer les premières étapes du projet.",
      categorieId: analysesPays.id,
      zoneId: somalie.id,
      auteur: "Hodan Warsame",
      image: "article-2.png",
      motsCles: ["pêche", "économie", "développement"],
      joursDecalage: 3,
    },
    {
      slug: "kenya-education-numerique-programmes",
      titre: "Le Kenya renforce ses programmes d'éducation numérique",
      chapo: "De nouveaux centres d'apprentissage numérique ouvrent dans plusieurs comtés du pays.",
      corps:
        "Le ministère de l'Éducation a inauguré une série de centres équipés en matériel informatique, destinés aux élèves du secondaire.\n\nCe programme s'inscrit dans une stratégie plus large de modernisation du système éducatif kényan.\n\nDes formations pour les enseignants sont également prévues au cours des prochains mois.",
      categorieId: analysesPays.id,
      zoneId: kenya.id,
      auteur: "James Otieno",
      image: "article-3.png",
      motsCles: ["éducation", "numérique", "jeunesse"],
      joursDecalage: 5,
    },
    {
      slug: "addis-abeba-sommet-regional-securite",
      titre: "Addis-Abeba accueille un sommet régional sur la sécurité",
      chapo: "Les chefs d'État de la région se sont réunis pour discuter de coopération sécuritaire.",
      corps:
        "Le sommet, organisé sur deux jours, a rassemblé des délégations venues de toute la Corne de l'Afrique.\n\nLes discussions ont porté sur le partage de renseignement et la coordination des forces frontalières.\n\nUn communiqué final doit être publié dans les prochains jours.",
      categorieId: analysesPays.id,
      zoneId: ethiopie.id,
      auteur: "Amina Tesfaye",
      image: "article-4.png",
      motsCles: ["diplomatie", "sécurité", "sommet"],
      joursDecalage: 8,
    },
    {
      slug: "nairobi-investissements-technologiques",
      titre: "Nairobi attire de nouveaux investissements technologiques",
      chapo: "Plusieurs entreprises internationales annoncent l'ouverture de bureaux dans la capitale kényane.",
      corps:
        "La zone d'innovation de Nairobi continue d'attirer des investisseurs étrangers dans le secteur des technologies.\n\nCes annonces confirment la position du Kenya comme pôle technologique régional.\n\nLes autorités locales espèrent que ces investissements créeront plusieurs milliers d'emplois qualifiés.",
      categorieId: analysesPays.id,
      zoneId: kenya.id,
      auteur: "James Otieno",
      image: "article-5.png",
      motsCles: ["technologie", "investissement", "emploi"],
      joursDecalage: 12,
    },
    {
      slug: "mogadiscio-reconstruction-infrastructures-sanitaires",
      titre: "Mogadiscio reconstruit ses infrastructures sanitaires",
      chapo: "Un vaste programme de rénovation des hôpitaux de la capitale a été lancé cette semaine.",
      corps:
        "Le ministère de la Santé a présenté un calendrier de rénovation pour plusieurs établissements hospitaliers de la capitale.\n\nCe programme vise à améliorer l'accès aux soins pour les habitants des quartiers les plus densément peuplés.\n\nLes premiers travaux devraient débuter dans les semaines à venir.",
      categorieId: analysesPays.id,
      zoneId: somalie.id,
      auteur: "Hodan Warsame",
      image: "article-6.png",
      motsCles: ["santé", "infrastructure", "reconstruction"],
      joursDecalage: 15,
    },
  ];

  for (const a of articles) {
    const datePublication = new Date(Date.now() - a.joursDecalage * 24 * 60 * 60 * 1000);
    await prisma.contenuEditorial.upsert({
      where: { slug: a.slug },
      // REPO-1 : réassigne categorieId/zoneId même si l'article existe déjà (rejeu sur
      // une base seedée avant ce lot) — sans cela, les 7 articles de démonstration
      // resteraient rattachés aux anciennes rubriques Politique/Économie/Société,
      // empêchant leur suppression (onDelete: Restrict) ci-dessous.
      update: { categorieId: a.categorieId, zoneId: a.zoneId },
      create: {
        slug: a.slug,
        titre: a.titre,
        chapo: a.chapo,
        corps: a.corps,
        typeContenu: "typeContenu" in a ? a.typeContenu : "article",
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

  // Anciennes rubriques (Politique/Économie/Société) : supprimées une fois tous les
  // articles ci-dessus reclassés vers les 6 nouvelles rubriques (plus aucune référence
  // entrante, onDelete: Restrict ne bloque donc pas). Idempotent (deleteMany).
  await prisma.categorie.deleteMany({ where: { slug: { in: ["politique", "economie", "societe"] } } });

  console.log(`Seed terminé : ${categories.length} catégories, ${zones.length} zones, ${articles.length} articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
