import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const categories = await Promise.all(
    [
      { nom: "Politique", slug: "politique", descriptionCourte: "Vie politique et institutions de la région." },
      { nom: "Économie", slug: "economie", descriptionCourte: "Économie, commerce et développement régional." },
      { nom: "Société", slug: "societe", descriptionCourte: "Société, éducation et santé dans la région." },
    ].map((c) =>
      prisma.categorie.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );

  const zones = await Promise.all(
    [
      { nom: "Éthiopie", slug: "ethiopie", descriptionCourte: "Actualités liées à l'Éthiopie." },
      { nom: "Somalie", slug: "somalie", descriptionCourte: "Actualités liées à la Somalie." },
      { nom: "Kenya", slug: "kenya", descriptionCourte: "Actualités liées au Kenya." },
    ].map((z) =>
      prisma.zoneGeographique.upsert({ where: { slug: z.slug }, update: {}, create: z })
    )
  );

  const [politique, economie, societe] = categories;
  const [ethiopie, somalie, kenya] = zones;

  const articles = [
    {
      slug: "dossier-dynamiques-regionales-corne-afrique",
      titre: "Dossier : comprendre les dynamiques régionales de la Corne de l'Afrique",
      chapo:
        "Un tour d'horizon synthétique des enjeux politiques, économiques et sécuritaires qui structurent la région, pour resituer l'actualité dans son contexte de long terme.",
      corps:
        "Ce dossier propose une lecture transversale des grands équilibres régionaux de la Corne de l'Afrique, à l'usage des lecteurs qui découvrent la zone comme de ceux qui en suivent l'actualité au quotidien.\n\nIl reprend, axe par axe, les principales lignes de force identifiées par la rédaction : rapports de force politiques, trajectoires économiques nationales et enjeux sécuritaires transfrontaliers.\n\nCe dossier sera mis à jour au fil des publications, à mesure que de nouvelles analyses viendront enrichir chacun de ces axes.",
      categorieId: politique.id,
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
      categorieId: politique.id,
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
      categorieId: economie.id,
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
      categorieId: societe.id,
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
      categorieId: politique.id,
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
      categorieId: economie.id,
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
      categorieId: societe.id,
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
      update: {},
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

  console.log(`Seed terminé : ${categories.length} catégories, ${zones.length} zones, ${articles.length} articles.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
