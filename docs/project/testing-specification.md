# Testing Specification — MVP

**Statut** : stratégie de tests exhaustive du MVP, dérivée de l'intégralité du corpus gelé — `discovery.md`, `requirements.md`, `user-stories.md`, `scope-v1.md`, `domain-model.md`, `sitemap.md`, `ui-specification.md`, `frontend-specification.md`, `technical-architecture.md`, `development-tasks.md`, `database-schema.md`, `api-contracts.md`, `server-actions-specification.md`, `prisma-schema-specification.md`, `prisma-config-specification.md`, `sql-migration-specification.md`, `implementation-roadmap.md`, `security-specification.md`. Ce document ne redéfinit aucune règle métier, n'introduit aucune fonctionnalité, aucun rôle supplémentaire et aucun scénario absent du corpus — il traduit ce qui est déjà acté en exigences de test vérifiables.

**Périmètre** : strictement le MVP (`scope-v1.md`, fonctionnalités 1 à 7). Les User Stories US-009 à US-018, US-024, US-025, US-028 et US-030 relèvent de la Version 2 ou 3 (comptes utilisateurs, abonnements, contenus premium, tableau de bord analytique, consultation documentaire enrichie) et **ne sont volontairement couvertes par aucun test dans ce document** — les tester reviendrait à valider une fonctionnalité hors périmètre. US-007 (archives) et US-021/US-029 (newsletter admin) ne sont couvertes que dans leur partie strictement V1 (accessibilité directe d'un contenu Archivé pour US-007 ; lister/retirer pour US-021/US-029), conformément à `api-contracts.md` §6 et `sitemap.md`.

Toute règle de test ci-dessous est reliée à sa source. Lorsqu'un comportement n'est pas explicitement tranché par le corpus, un **point d'arbitrage** est signalé plutôt qu'une règle inventée — dans ce cas, ce document précise ce qu'il est possible de tester dès aujourd'hui et ce qui reste bloqué tant que l'arbitrage n'est pas résolu.

Aucun code n'est produit dans ce document — uniquement des exigences de test, des scénarios et des critères de validation.

---

## 1. Objectifs qualité du projet

- **Fiabilité des règles métier** : chaque invariant et chaque règle de décision (DR-001 à DR-007, `domain-model.md`) doit être vérifié par au moins un test explicite — condition de la crédibilité documentaire visée par le produit (`discovery.md` §6, §9 : « source de référence reconnue »).
- **Intégrité des contenus publiés** : « garantir l'intégrité des contenus publiés, en empêchant toute modification ou accès non autorisé » (`requirements.md` §2.1) — traduit en tests d'autorisation (§7) et de branchement par statut (§5, DR-001).
- **Fiabilité de l'authentification** : « les accès réservés... doivent être protégés par un mécanisme d'authentification fiable » (`requirements.md` §2.1) — traduit en tests d'authentification (§6) et de sécurité (§15).
- **Disponibilité et fiabilité cohérentes avec un usage institutionnel** (`requirements.md` §2.3) — traduit par l'absence de page blanche (états d'erreur qualifiés, `ui-specification.md` §États erreurs) et par les critères de non-régression de `implementation-roadmap.md` (Phase 7-8).
- **Conformité au design system et à l'accessibilité** : les deux checklists déjà actées (`ui-specification.md` §Checklist de conformité Frontend, `frontend-specification.md` §Checklist de conformité Frontend) restent des référentiels de test à part entière, non dupliqués intégralement ici mais repris pour les points qui recoupent des règles métier (§18).
- **Étanchéité du périmètre** : aucune fonctionnalité V2/V3 ne doit être observable dans le produit testé — critère explicite déjà acté (`ui-specification.md` §Checklist, « Périmètre »), repris comme objectif qualité transverse à chaque niveau de test.
- **Zéro bug bloquant ou majeur au go-live** (`implementation-roadmap.md`, Phase 8).

---

## 2. Pyramide de tests retenue

Reprise et consolidée de la stratégie déjà actée dans `implementation-roadmap.md` (§Stratégie de tests) :

| Niveau | Portée | Introduit à partir de |
|---|---|---|
| Tests d'infrastructure | Migration, contraintes, triggers PL/pgSQL | Phase 0A (`implementation-roadmap.md`) |
| Tests unitaires | Validators Zod, utilitaires, logique de services métier isolée | Phase 0B / Phase 3 |
| Tests de composants | États requis des composants partagés et métier | Phase 0B, puis à chaque nouveau composant |
| Tests d'intégration | Une Server Action ou une fonction de lecture, contre la vraie base (Prisma + Supabase) | À la fin de chaque phase (0A à 6) |
| Tests de bout en bout (parcours) | Parcours utilisateurs et administrateur complets (`ui-specification.md` §Parcours) | Dès qu'un parcours est entièrement livré, au plus tard Phase 8 |
| Audit d'accessibilité et responsive | Ensemble des écrans livrés | À la fin de chaque phase, consolidé en Phase 7 |
| Tests de sécurité | CSRF, XSS, injection, énumération, accès non autorisés | Dès la Phase 0A (infrastructure) puis à chaque opération livrée |

La base de la pyramide (unitaire) est la plus large — chaque règle Zod et chaque règle métier isolable y est testée indépendamment de l'interface. Le sommet (parcours de bout en bout) reste le plus étroit, réservé à la continuité entre écrans, jamais utilisé pour vérifier une règle déjà couverte à un niveau inférieur — principe déjà acté (`implementation-roadmap.md` : « le pattern de validation/action serveur établi en Phase 3 est testé une fois en profondeur »).

---

## 3. Tests unitaires

### 3.1 Validators Zod

- Un schéma unique par formulaire/contrat, testé isolément de toute interface (`api-contracts.md` §1.5, `frontend-specification.md` §Validation).
- Chaque champ requis à la publication (Titre, Type de contenu, Catégorie, Zone géographique, Image principale + Texte alternatif) doit échouer la validation si absent **uniquement** dans le contexte « Publier », jamais dans le contexte « Enregistrer le brouillon » (`domain-model.md`, US-001).
- Les mots-clés restent optionnels dans tous les cas, y compris à la publication (`domain-model.md`).
- Le type de contenu, la catégorie et la zone géographique sont des unions de littéraux fermées — une valeur hors énumération doit être rejetée (`frontend-specification.md` §Conventions TypeScript, `database-schema.md` §3).
- Chaque message de validation testé doit correspondre au texte exact déjà fixé lorsqu'il existe (« Le titre est requis pour publier », « Identifiant ou mot de passe incorrect ») — un message générique (« Champ invalide ») constitue un échec de test (`ui-specification.md` §Formulaires, §Checklist).
- Contact : les quatre champs (`nom`, `email`, `sujet`, `message`) sont requis, chacun avec son propre message d'erreur (`server-actions-specification.md` §10.1).
- Newsletter : `email` requis, format d'adresse valide (`server-actions-specification.md` §6.1).

### 3.2 Utilitaires

- Génération de slug à partir du titre/nom (Article, Catégorie, Zone) : lisible, stable, modifiable manuellement ensuite (`technical-architecture.md` §8 point 6).
- Formatage de dates (affichage `date_publication`/`date_derniere_modification`).
- Type de pagination générique (`page`, total, page suivante disponible — `api-contracts.md` §1.6).

### 3.3 Services métier (logique isolée du repository)

- Branchement par statut à l'accès direct (DR-001) testé comme fonction pure isolée de tout rendu de page, avant même son intégration dans un Server Component (`technical-architecture.md` §4.2) — cf. §5.
- Logique de réactivation d'un Inscrit Newsletter désinscrit (`server-actions-specification.md` §7) testée indépendamment de l'interface du formulaire.
- Résolution des filtres combinables de recherche (`categorie`, `zone`, `type`, `date`, `q`) en critères de requête — testée sans dépendre de la base réelle pour la partie construction de la requête.

---

## 4. Tests d'intégration

### 4.1 Prisma

- Chaque objet manuel de la migration existe et se comporte comme spécifié : les 5 fonctions PL/pgSQL, les 4 triggers, les 2 contraintes `CHECK`, l'index GIN (`sql-migration-specification.md` §4 à §7) — vérifié par requête directe (`pg_proc`/`pg_trigger`) ou par tentative d'écriture délibérément invalide (ex. deuxième `administrateur`, publication sans titre).
- Le Client Prisma applicatif se connecte exclusivement via `DATABASE_URL` (poolée) ; toute tentative de requête applicative via `DIRECT_URL` constitue un échec de configuration à détecter (`prisma-config-specification.md` §2, `security-specification.md` §12).
- `prisma migrate status` ne rapporte aucune dérive entre `schema.prisma` et la base testée (`implementation-roadmap.md` Phase 0A).

### 4.2 Server Actions

Chacune des 27 opérations de `server-actions-specification.md` est testée en intégration contre une vraie base (jamais contre un mock du client Prisma, cohérent avec `implementation-roadmap.md` : « Tests d'intégration par feature... contre la vraie base ») :

- Entrées/sorties conformes au gabarit à 11 champs de chaque opération (permission, validation, lecture, écriture, règles métier, erreurs, invalidation de cache, retour).
- Les opérations de mutation déclenchent la revalidation ciblée exacte décrite (`technical-architecture.md` §4.4) — testé explicitement par vérification de l'état des routes publiques après mutation, jamais supposé correct par construction (risque déjà signalé, `technical-architecture.md` §9).

### 4.3 Supabase PostgreSQL

- RLS activé avec politiques de refus total, **ou** API PostgREST/Data API neutralisée — vérifié par une tentative d'accès direct à l'API Data du projet Supabase (pas seulement supposé configuré) : aucune ligne de `administrateur`, `session_administrateur`, `contenu_editorial` (statut `brouillon`) ou `inscrit_newsletter` ne doit être accessible par ce chemin (`prisma-schema-specification.md` §14, `prisma-config-specification.md` §6, `security-specification.md` §12).
- Connexion poolée Supavisor (mode transaction) : test de charge concurrente légère pour détecter une limitation liée aux instructions préparées avant qu'elle ne survienne en production (`prisma-config-specification.md` §3).
- Recherche full-text en français : test contre des contenus réels incluant des noms propres géopolitiques (ex. « Somaliland ») pour valider le comportement de la configuration linguistique `french` (risque déjà signalé, `technical-architecture.md` §9).

---

## 5. Tests des règles métier — DR-001 à DR-007

| Règle | Comportement à tester | Source |
|---|---|---|
| **DR-001** | Un contenu Introuvable ou au statut Brouillon accédé par son `slug` retourne l'état « introuvable », sans exposer de contenu. Un contenu Publié est rendu, indexable, présent dans listes/recherche/sitemap. Un contenu Archivé est rendu à l'identique d'un Publié **mais** exclu des listes, de la recherche, des pages Catégorie/Zone et du sitemap — testé aussi bien en accès direct qu'en absence des surfaces de découverte. Le branchement doit être vérifié comme **unique et centralisé** (un seul point de test suffit à couvrir toutes les pages de listing, qui ne doivent jamais réimplémenter ce branchement) | `technical-architecture.md` §4.2, `domain-model.md`, `api-contracts.md` §3.4 |
| **DR-002** | Une session administrateur expire automatiquement après la durée d'inactivité configurée ; l'accès à une route protégée après expiration redirige vers la Connexion, message neutre, aucun contenu exposé. Une requête valide avant expiration met à jour `derniere_activite_at` | `domain-model.md`, `technical-architecture.md` §4.3, `ui-specification.md` §États erreurs |
| **DR-003** | Le Chapô est optionnel : un contenu sans Chapô doit pouvoir être enregistré en brouillon et publié (sous réserve des autres champs requis) ; lorsqu'il est renseigné, il participe au vecteur de recherche (poids B) et peut être utilisé en aperçu de liste | `domain-model.md`, `technical-architecture.md` §6 (`fn_maj_recherche_vecteur`) |
| **DR-004** | L'Auteur reste un champ texte libre, optionnel, sans validation de format imposée au-delà de la validation Zod générique, sans table ni entité dédiée | `domain-model.md` |
| **DR-005** | `date_publication` est renseignée automatiquement au premier passage à `publie` si absente, puis **verrouillée** : toute tentative de modification ultérieure (y compris par écriture directe) doit échouer via le trigger. `date_derniere_modification` est mise à jour à **chaque** modification, quel que soit le statut — y compris lors d'un simple ajout/retrait de mot-clé (qui déclenche une écriture sur `contenu_editorial` via `fn_maj_recherche_vecteur`) | `domain-model.md`, `database-schema.md` §6, `technical-architecture.md` §6 |
| **DR-006** | Le Corps de texte reste optionnel même pour un contenu Publié — un contenu sans corps doit pouvoir passer `chk_publie_champs_requis` avec succès si les autres champs requis sont présents | `domain-model.md`, `database-schema.md` §4.5 |
| **DR-007** | La `description_courte` d'une Catégorie ou d'une Zone géographique, lorsqu'elle est renseignée, alimente la méta-description SEO de la page publique correspondante ; en son absence, la page reste fonctionnelle (champ optionnel) | `domain-model.md`, `server-actions-specification.md` §4.3 |

---

## 6. Tests d'authentification

- `adminLogin` : succès → session établie (ligne `session_administrateur` créée), redirection Dashboard. Échec (identifiant inconnu **ou** mot de passe incorrect) → message générique unique « Identifiant ou mot de passe incorrect », sans désigner le champ fautif ; mot de passe vidé, identifiant conservé — testé pour les deux causes d'échec avec un résultat strictement identique (`server-actions-specification.md` §1.1, `ui-specification.md` §États erreurs).
- `adminLogout` : suppression effective de la ligne `session_administrateur`, redirection Connexion, aucune confirmation requise, réversible par reconnexion (`server-actions-specification.md` §1.2).
- Garde d'accès session : accès direct à une route protégée sans session → redirection Connexion, aucun contenu exposé ; vérification à deux niveaux (route + layout), testée indépendamment l'une de l'autre pour confirmer que la seconde couche protège effectivement un contournement de la première (`technical-architecture.md` §4.3, `frontend-specification.md`).
- Compte Administrateur unique : une tentative d'insertion d'un second `administrateur` échoue avec le message du trigger `fn_administrateur_unique` (`database-schema.md` §6).
- Cookie de session : httpOnly (non accessible en JavaScript côté client) — vérifié par inspection du cookie émis (`technical-architecture.md` §1.2).

---

## 7. Tests d'autorisation

- Chacune des 27 opérations de `server-actions-specification.md` porte une permission explicite (Publique ou Administrateur, champ #3 du gabarit) — chaque opération réservée à l'administrateur doit être testée **sans session valide** et échouer, indépendamment de la page depuis laquelle elle serait invoquée (`api-contracts.md` §1.4, `security-specification.md` §3).
- Modèle strictement binaire : aucun test ne doit introduire de notion de rôle intermédiaire, de permission différenciée ou de portée d'accès — un test qui vérifierait un tel comportement serait hors périmètre (`domain-model.md`, « Acteur unique de gestion »).
- Le branchement par statut (DR-001, §5) n'est **jamais** un contrôle d'autorisation par rôle — un test ne doit pas confondre l'accès refusé à un Brouillon (règle de visibilité) avec un refus d'autorisation (session absente) : les deux doivent produire des comportements distincts et être testés séparément (`security-specification.md` §3).
- Suppression d'une Catégorie/Zone référencée : testée comme un conflit métier (`CATEGORIE_REFERENCEE`), jamais comme une erreur d'autorisation ou de validation (`api-contracts.md` §1.2, §2.3).

---

## 8. Tests Newsletter

- `subscribeNewsletter` — e-mail inconnu : nouvelle ligne créée, `statut = inscrit` (US-019). E-mail déjà `inscrit` : aucune écriture, confirmation neutre identique à une nouvelle inscription — testé explicitement pour vérifier l'absence de message d'erreur (`api-contracts.md` §4.1, `ui-specification.md`).
- Réactivation après désinscription (`server-actions-specification.md` §7) : une adresse au statut `desinscrit` qui se réinscrit voit sa ligne existante réactivée (`statut → inscrit`, `desinscrit_at → NULL`, nouvelle `date_inscription`, nouveau `jeton_desinscription`) — jamais une nouvelle ligne (contrainte `UNIQUE(email)`) ; l'ancien jeton ne doit plus jamais être valide après cette réactivation.
- Traitement du jeton de désinscription — jeton valide et non consommé : `statut → desinscrit`. Jeton déjà utilisé, invalide ou expiré : **aucune écriture**, mais la **même** confirmation neutre est affichée dans tous les cas (US-020, `api-contracts.md` §4.3) — testé pour les quatre cas avec un résultat utilisateur identique.
- `listSubscribers` : ne retourne **jamais** une ligne au statut `desinscrit` — un inscrit désinscrit (libre-service ou retrait manuel) doit disparaître de cette liste sans action supplémentaire de l'administrateur (`domain-model.md`, `server-actions-specification.md` §8.1).
- `removeSubscriber` : retrait manuel produit le même effet que la désinscription libre-service (`statut → desinscrit`, `desinscrit_at → now()`), passage obligatoire par une Modal de confirmation côté UI (`server-actions-specification.md` §8.2, `ui-specification.md` §Modales).
- Contrainte `UNIQUE(email)` : une tentative d'insertion d'une adresse déjà présente (hors flux applicatif) doit échouer (`database-schema.md` §4.7).
- Mention de confidentialité toujours visible sur les trois emplacements du formulaire d'inscription (`ui-specification.md` §Newsletter).

---

## 9. Tests Recherche

- `searchContent` ne retourne que des contenus au statut `publie` — jamais un Brouillon ni un Archivé (`domain-model.md`, DR-001, `server-actions-specification.md` §9.1).
- Le texte libre (`q`) doit produire des résultats correspondant au titre, au chapô, au corps **et** aux mots-clés (US-022, `technical-architecture.md` §4.6, `database-schema.md` §6) — un mot-clé seul (absent du titre/chapô/corps) doit suffire à faire remonter un contenu, condition explicitement corrigée par `database-schema.md` par rapport à une lecture littérale antérieure de US-022.
- Les filtres `categorie`, `zone`, `type`, `date` sont combinables entre eux et avec `q` (US-023, `api-contracts.md` §1.7).
- Aucun résultat : traité comme un état vide qualifié, jamais comme une erreur — testé pour vérifier l'absence de code d'erreur retourné (US-022, `ui-specification.md`).
- Le lien "Réinitialiser les filtres" apparaît dès qu'un filtre est actif (`ui-specification.md`).
- La requête et les filtres actifs sont conservés lors d'un retour depuis un article consulté (test de parcours, `ui-specification.md` §Persistance de contexte de navigation).
- Compteur de résultats mis à jour et annoncé en live-region (`ui-specification.md` §Accessibilité).
- **Point d'arbitrage** : la construction de `to_tsquery('french', q)` avec un texte contenant des opérateurs propres à la syntaxe `tsquery` (`&`, `|`, `!`, guillemets) n'est pas arbitrée (`security-specification.md` §8) — un test doit au minimum vérifier qu'un tel texte ne provoque ni erreur serveur non gérée ni exposition d'un message technique brut, en attendant que le choix entre `to_tsquery` strict et une fonction plus tolérante (`plainto_tsquery`/`websearch_to_tsquery`) soit tranché.

---

## 10. Tests Contact

- `submitContactForm` : `nom`, `email`, `sujet`, `message` tous requis — chaque champ manquant produit un message spécifique, focus renvoyé au premier champ en erreur (`server-actions-specification.md` §10.1, `ui-specification.md`).
- **Aucune persistance en base** : un test doit vérifier explicitement l'absence d'écriture dans quelque table que ce soit après soumission — conformité à `database-schema.md` (aucun écran de consultation documenté) et à `security-specification.md` §4.
- Notification e-mail effectivement envoyée à l'administrateur via le service transactionnel configuré (`technical-architecture.md` §3.1, `implementation-roadmap.md` Phase 3 — test de bout en bout avec le service réel, pas seulement en simulation).
- Échec technique (réseau/serveur) : message générique unique, saisie utilisateur conservée (`ui-specification.md` §États erreurs).

---

## 11. Tests Dashboard

- `getDashboardData` : nombre de contenus Publiés, nombre de Brouillons, nombre d'Inscrits newsletter **au statut `inscrit` uniquement** (un désinscrit ne doit jamais être compté, cohérent avec §8) — trois compteurs testés indépendamment (`server-actions-specification.md` §2.1).
- Table des 5 derniers contenus modifiés, **tous statuts confondus**, triée par `date_derniere_modification` décroissante (`api-contracts.md` §2.5).
- Aucun graphique, courbe ou statistique avancée ne doit apparaître — contrainte ferme à vérifier par absence, pas seulement par omission non testée (`ui-specification.md` §Dashboard Administrateur).
- État de premier lancement (0 article, 0 inscrit) : compteurs à 0 sans alerte visuelle, invitation neutre (`ui-specification.md` §États vides).
- Ligne de table cliquable dans son ensemble ouvre l'éditeur de l'article correspondant.
- Action "+ Nouvel article" visible sans scroll sur une résolution desktop standard (1024×768).
- La route Dashboard n'est jamais mise en cache (`frontend-specification.md` §Routes administrateur : « dynamique, non mis en cache ») — testé pour vérifier qu'une mutation récente apparaît immédiatement sans dépendre d'une revalidation différée.

---

## 12. Tests Catégories

- `createCategory`/`updateCategory` : `nom` requis, unicité de `nom` et de `slug` vérifiée (échec attendu en cas de doublon) — `server-actions-specification.md` §4.2-§4.3.
- `deleteCategory` : bloquée (`CATEGORIE_REFERENCEE`) si au moins un Contenu éditorial y est associé, **quel que soit son statut** (y compris Brouillon) — testé explicitement avec un contenu au statut Brouillon pour confirmer que le blocage ne dépend pas de la visibilité publique du contenu (`domain-model.md`, `server-actions-specification.md` §4.4).
- Suppression bloquée : aucune Modal de confirmation ne doit s'ouvrir côté UI dans ce cas — l'action est désactivée en amont (`ui-specification.md` §Modales).
- `description_courte` optionnelle : son absence ne doit pas bloquer la création/modification ; sa présence alimente la méta-description SEO de la page Catégorie (DR-007, §5).
- Mutation de Catégorie déclenche la revalidation de la page publique concernée et de la navigation (`server-actions-specification.md` §4.3).
- `listCategories` retourne le nombre d'articles associés par catégorie, tous statuts confondus (base du calcul de blocage de suppression).

---

## 13. Tests Zones géographiques

Symétrique intégral de la Gestion des catégories (§12), mêmes règles et mêmes tests transposés à `zone_geographique` (`domain-model.md` : « Règles métier identiques à celles de la Catégorie », `server-actions-specification.md` §5) :

- `createZone`/`updateZone` : unicité `nom`/`slug`.
- `deleteZone` : bloquée si au moins un Contenu éditorial associé, quel que soit son statut.
- `description_courte` optionnelle, alimente la méta-description de la page Zone géographique (DR-007).
- Filtre secondaire sur la page publique Zone géographique : `categorie` (au lieu de `zone`, déjà donné par le contexte) — inversion à vérifier explicitement par rapport à la page Catégorie (`api-contracts.md` §3.7).

---

## 14. Tests Contenus éditoriaux

### 14.1 Brouillon

- `createArticle` sans aucun champ renseigné doit réussir — aucun champ n'est requis pour un enregistrement en brouillon, y compris le Titre (`domain-model.md`, US-001).
- Un contenu au statut Brouillon n'est **jamais** exposé par une opération de lecture publique (`getHomePageData`, `listPublishedArticles`, `searchContent`, `getCategoryPage`, `getZonePage`) et retourne l'état « introuvable » via `getArticleDetail` (DR-001, §5).
- Aucune revalidation de route publique n'est déclenchée par une mutation sur un Brouillon (`server-actions-specification.md` §3.1 : « Aucune revalidation publique »).
- `getArticleForEdit` doit retourner l'intégralité des champs d'un Brouillon sans branchement par statut (contrairement à `getArticleDetail`) — testé pour confirmer que l'administration peut éditer un contenu incomplet (`server-actions-specification.md` §3.7).

### 14.2 Publié

- `publishArticle` échoue si Titre, Type de contenu, Catégorie, Zone géographique, Image principale ou Texte alternatif est manquant — chaque champ testé indépendamment (`domain-model.md`, `database-schema.md` §6, `chk_publie_champs_requis`).
- Seul le message concernant le Titre est littéralement fixé (« Le titre est requis pour publier ») — **point d'arbitrage** : les messages pour les autres champs (Type, Catégorie, Zone, Image/Alt) ne sont pas rédigés dans les documents source (`api-contracts.md` §7.3) ; un test peut vérifier qu'un message *spécifique* est bien affiché pour chaque champ (principe acté), mais ne peut pas encore vérifier un texte exact non défini.
- `date_publication` renseignée automatiquement si absente au moment de la publication, puis verrouillée (DR-005, §5).
- Un contenu Publié reste modifiable à tout moment (`updateArticle`), y compris son Corps de texte qui reste facultatif (DR-006, §5).
- Toute mutation sur un contenu Publié déclenche la revalidation ciblée des routes publiques concernées (Accueil, Liste, Catégorie, Zone, Recherche, Détail, `sitemap.xml` — `technical-architecture.md` §4.4).
- Toast de confirmation « ✓ Article publié » affiché après succès (`server-actions-specification.md` §3.3, `ui-specification.md`).

### 14.3 Archivé

- `archiveArticle` : transition toujours libre, testée sans exigence de champs — **point d'arbitrage** : l'exigence de champs pour cette transition n'est pas actée (`api-contracts.md` §7.1) ; un test ne doit donc **pas** faire échouer `archiveArticle` sur un contenu incomplet tant que cet arbitrage n'est pas résolu, sous peine d'implémenter une règle non sourcée.
- Un contenu Archivé reste accessible via son URL directe (`getArticleDetail`), rendu à l'identique d'un Publié, mais **exclu** de `listPublishedArticles`, `searchContent`, `getCategoryPage`, `getZonePage` et du sitemap (DR-001, §5).
- Mutation vers Archivé déclenche la revalidation des surfaces de découverte (retrait des listes) tout en conservant la route de détail active (`server-actions-specification.md` §3.5).

### 14.4 Règles transverses au cycle de vie

- Un contenu ne possède jamais plus d'une Catégorie ni plus d'une Zone géographique (`domain-model.md`, US-002) — testé comme invariant de structure (relation 1:1, jamais un tableau).
- Les mots-clés restent facultatifs dans tous les statuts et n'ont aucune existence indépendante du contenu (`ON DELETE CASCADE`, `database-schema.md` §4.6) — testé par suppression du contenu et vérification de la suppression en cascade.
- `deleteArticle` : action irréversible, jamais directe sans passage par une Modal de confirmation côté UI ; suppression en cascade des mots-clés associés ; revalidation ciblée si le contenu était Publié ou Archivé (`server-actions-specification.md` §3.6).
- Les trois statuts communiquent librement dans les deux sens (Brouillon ⇄ Publié ⇄ Archivé) — un test de cycle de vie complet doit vérifier chacune des six transitions possibles au moins une fois (`domain-model.md`, §Cycle de vie des entités).

---

## 15. Tests sécurité

Opérationnalisation des exigences de `security-specification.md` en scénarios de test :

- **CSRF** : vérification d'architecture (revue de code, pas un test d'exécution isolé) que chaque formulaire reste exclusivement lié à une Server Action native, jamais à un appel `fetch` client vers une route mutable séparée (`frontend-specification.md` §Formulaires, `security-specification.md` §6) — à confirmer contre la documentation Next.js 16 effectivement installée avant de considérer ce point clos.
- **XSS** : test que le rendu des champs textuels (`titre`, `chapo`, `auteur`, `sources`, mots-clés) échappe toute balise/script injecté par saisie (comportement JSX par défaut) ; aucun test ne doit valider un rendu HTML brut (`dangerouslySetInnerHTML`) pour le Corps de texte tant que son format n'est pas arbitré (`security-specification.md` §7 — point d'arbitrage).
- **Injection SQL** : test qu'une valeur de recherche (`q`) contenant des caractères de syntaxe SQL/`tsquery` ne produit ni erreur non gérée, ni requête modifiée de façon inattendue ; test que le tri de `listArticles` (champ `date` ou `statut`) ne peut être détourné vers une colonne arbitraire non prévue par l'énumération fermée (`security-specification.md` §8).
- **Énumération** :
  - Connexion : le temps de réponse et le message pour un identifiant inexistant doivent être indiscernables de ceux d'un mot de passe incorrect sur un identifiant existant (`security-specification.md` §9).
  - Newsletter : une adresse déjà inscrite ne doit produire aucun signal distinctif par rapport à une nouvelle inscription (§8).
  - Désinscription : jeton valide, déjà utilisé, invalide ou expiré doivent produire une réponse strictement identique (§8).
- **Accès non autorisés** : chacune des opérations administrateur de `server-actions-specification.md` testée sans session valide (échec attendu, §7) ; tentative d'accès à un Brouillon par son `slug` direct (« introuvable » attendu, §5) ; tentative d'accès aux données sensibles via l'API PostgREST/Data API de Supabase si RLS n'est pas encore vérifié (`security-specification.md` §12, §4.3).
- **Point d'arbitrage — brute force** : aucun mécanisme de limitation de tentatives n'étant spécifié pour la Connexion administrateur, la Newsletter ou le Contact (`security-specification.md` §10), aucun test de ce type ne peut être écrit avant qu'un mécanisme et un seuil soient explicitement choisis — ce document ne peut que constater l'absence, pas la combler.

---

## 16. Jeux de données de test

Jeu de données couvrant l'ensemble des scénarios de test ci-dessus (environnement de test, distinct du seed minimal de production, §17) :

| Entité | Volume minimal requis | Justification |
|---|---|---|
| Compte Administrateur | Exactement 1 | Invariant à tester (`domain-model.md`, §6) — toute tentative d'en créer un second doit échouer |
| Session administrateur | Au moins 1 active + 1 expirée (au-delà de la durée d'inactivité configurée) | Test DR-002 (§5) |
| Catégorie | Au moins 2 : une sans article associé (suppression autorisée), une avec au moins un article associé (suppression bloquée) | Test §12 |
| Zone géographique | Au moins 2, même logique que Catégorie | Test §13 |
| Contenu éditorial — Brouillon | Au moins 1, volontairement incomplet (sans titre ni classification) | Test §14.1 |
| Contenu éditorial — Publié | Au moins 1, complet (tous champs requis), avec Chapô et Corps renseignés, avec et sans mots-clés | Test §14.2, §5 (DR-003, DR-006) |
| Contenu éditorial — Publié sans Chapô ni Corps | Au moins 1 (les deux restent optionnels même Publié) | Test DR-003/DR-006 |
| Contenu éditorial — Archivé | Au moins 1, atteint depuis un état Publié préalable (pour vérifier que `date_publication` reste figée) | Test §14.3, DR-005 |
| Contenu éditorial — mots-clés partagés en apparence | Au moins 2 contenus utilisant un mot-clé de même libellé | Vérifier l'absence de toute gestion transverse du mot-clé (`domain-model.md`) |
| Inscrit Newsletter — actif | Au moins 1, statut `inscrit` | Test §8 |
| Inscrit Newsletter — désinscrit | Au moins 1, atteint par lien à usage unique | Test §8, doit disparaître de `listSubscribers` |
| Inscrit Newsletter — réinscription | Au moins 1 cas de réactivation après désinscription | Test §8, `server-actions-specification.md` §7 |

---

## 17. Données minimales de seed

Distinct du jeu de données de test (§16, exhaustif pour la couverture des tests) : le seed minimal est ce qui rend un environnement fonctionnel et démontrable dès le premier déploiement, cohérent avec la pratique de bootstrap déjà actée par `implementation-roadmap.md` (Phase 0A/1 — insertion manuelle faute d'interface d'administration disponible avant la Phase 5) :

- **1 Compte Administrateur** — prérequis strict, aucun écran de création n'existe dans le produit (`sitemap.md`, `implementation-roadmap.md` Phase 0A).
- **Au moins 1 Catégorie et 1 Zone géographique** — nécessaires pour qu'un premier Contenu éditorial puisse atteindre le statut Publié (champs obligatoires à la publication, `domain-model.md`).
- **Optionnel, recommandé pour la Phase 1** : 1 Contenu éditorial Publié de démonstration, pour valider visuellement les pages publiques dès leur construction (`implementation-roadmap.md` Phase 1 — pratique de bootstrap, à retirer avant la Phase 9).
- **Aucun Inscrit Newsletter n'est requis au seed** : l'état de premier lancement (0 inscrit) est un état légitime et lui-même testé (`ui-specification.md` §États vides, §8, §11).
- Toute donnée de seed insérée à des fins de test/démonstration doit être retirée avant la mise en production (`implementation-roadmap.md` Phase 8-9, `security-specification.md` §14).

---

## 18. Critères de validation MVP

Synthèse des points de validation propres à ce document, en complément (non en remplacement) des checklists déjà actées de `ui-specification.md` §Checklist de conformité Frontend et `frontend-specification.md` §Checklist de conformité Frontend, qui restent les référentiels de conformité visuelle/architecturale :

- [ ] Les 7 règles de décision (DR-001 à DR-007) sont chacune couvertes par au moins un test explicite (§5).
- [ ] Les 27 opérations de `server-actions-specification.md` sont chacune testées en intégration contre une vraie base (§4.2).
- [ ] Les quatre catégories d'erreur (`api-contracts.md` §1.2) sont chacune testées au moins une fois par domaine fonctionnel concerné.
- [ ] Les trois statuts du Contenu éditorial (Brouillon, Publié, Archivé) et leurs six transitions sont couverts (§14.4).
- [ ] Les cas d'énumération (connexion, newsletter, désinscription) produisent une réponse indiscernable dans chacun de leurs sous-cas (§9, §15).
- [ ] Aucune fonctionnalité V2/V3 n'est observable dans les scénarios testés (US-009 à US-018, US-024, US-025, US-028, US-030 absentes de toute suite de test).
- [ ] Les neuf parcours (`ui-specification.md` §Parcours utilisateurs, §Parcours administrateur) s'exécutent de bout en bout sans blocage (`implementation-roadmap.md` Phase 8).

---

## 19. Critères bloquants avant mise en production

Repris et complétés de `implementation-roadmap.md` (Phase 9) et `security-specification.md` (§14), du point de vue strict de la couverture de test :

- [ ] Aucun test lié à DR-001 à DR-007 n'est en échec.
- [ ] Aucune des 27 opérations serveur n'est dépourvue de test d'intégration.
- [ ] La vérification RLS/PostgREST (§4.3) est un test d'intégration exécuté et passé, jamais une simple supposition de configuration.
- [ ] Aucun bug bloquant ou majeur ouvert (`implementation-roadmap.md` Phase 8).
- [ ] Les tests de sécurité d'énumération et d'accès non autorisés (§15) passent intégralement.
- [ ] Aucune donnée de test/seed ne subsiste dans l'environnement de production (§17).
- [ ] Les points d'arbitrage non résolus (§9 `to_tsquery`, §10/§14.3 exigence de champs pour Archiver, §14.2 messages de validation par champ, §15 brute force) sont, à défaut d'être tranchés, explicitement documentés comme risques acceptés avant la mise en production — jamais silencieusement ignorés.

---

## 20. Tableau de traçabilité : User Story → Règles métier → Tests obligatoires

Limité au périmètre MVP (cf. note de périmètre en tête de document) :

| User Story | Règle métier concernée | Tests obligatoires |
|---|---|---|
| US-001 (Création et rédaction) | Aucun champ requis pour un Brouillon (`domain-model.md`) | §3.1, §14.1 |
| US-002 (Catégorisation) | Une seule Catégorie et une seule Zone par contenu, toutes deux obligatoires à la publication | §3.1, §12, §13, §14.2 |
| US-003 (Métadonnées et mots-clés) | Mots-clés libres et optionnels, participant à la recherche (DR-003 pour le Chapô) | §5 (DR-003), §9, §14.4 |
| US-004 (Statut d'un contenu) | Cycle de vie Brouillon ⇄ Publié ⇄ Archivé, DR-001 | §5 (DR-001), §14 |
| US-005 (Modification d'un contenu publié) | Modifiable à tout moment, DR-005, DR-006 | §5 (DR-005, DR-006), §14.2 |
| US-006 (Partage d'un contenu) | Accès libre sans restriction (`domain-model.md`) | §5 (DR-001) — le partage lui-même relève de la conformité UI (`ui-specification.md`), hors périmètre de ce document |
| US-007 (Consultation des archives, partiel — DR-001) | Accessibilité directe d'un contenu Archivé, sans vue de navigation dédiée (V2) | §5 (DR-001), §14.3 |
| US-008 (Consultation publique sans compte) | Aucune authentification requise pour le contenu Publié | §7, §14.2 |
| US-019 (Inscription newsletter) | Unicité de l'e-mail, traitement neutre du cas déjà inscrit | §8 |
| US-020 (Désinscription newsletter) | Traitement neutre identique quel que soit l'état du jeton | §8, §9, §15 |
| US-021 (partiel — lister les inscrits) | Liste restreinte au statut `inscrit` | §8, §11 |
| US-022 (Recherche par mots-clés) | Couverture titre/chapô/corps/mots-clés, statut Publié uniquement | §9 |
| US-023 (Filtrage des résultats) | Filtres combinables, réinitialisables | §9 |
| US-026 (Espace de gestion centralisé) | Autorisation Administrateur sur l'ensemble des opérations de mutation | §6, §7, §12, §13, §14 |
| US-027 (Gestion des catégories/zones) | Suppression bloquée si référencée, aucune gestion globale des tags | §12, §13 |
| US-029 (partiel — inscrits newsletter) | Cohérent avec US-021 | §8, §11 |

---

Aucun document existant n'a été modifié pour produire cette spécification. Aucun code de test n'y figure.
