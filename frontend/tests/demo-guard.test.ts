import { beforeEach, describe, expect, it, vi } from "vitest";

// Session, base de données et cache Next simulés : on teste le garde du compte de
// démonstration tel qu'il est branché dans les vraies Server Actions et lectures admin.
const getCurrentSession = vi.fn();
const findById = vi.fn();
const categorieRepository = {
  findByNom: vi.fn(),
  findBySlug: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};
const findAllInscritsPagines = vi.fn();

vi.mock("@/features/admin-auth/session", () => ({ getCurrentSession }));
vi.mock("@/lib/db/admin-repository", () => ({ AdminRepository: { findById } }));
vi.mock("@/lib/db/categorie-repository", () => ({ CategorieRepository: categorieRepository }));
vi.mock("@/lib/db/contenu-editorial-repository", () => ({ ContenuEditorialRepository: {} }));
vi.mock("@/lib/db/inscrit-newsletter-repository", () => ({
  InscritNewsletterRepository: { findAllInscritsPagines },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { estCompteDemo, refusSiCompteDemo } = await import("@/lib/auth/require-admin-session");
const { createCategory } = await import("@/features/taxonomies/categorie-actions");
const { listSubscribers } = await import("@/features/newsletter/list-subscribers");
const { DEMO_MASQUE, DEMO_REFUS } = await import("@/lib/demo");

const connecteEn = (identifiant: string) => {
  getCurrentSession.mockResolvedValue({ authenticated: true, administrateurId: "id-1", sessionId: "s-1" });
  findById.mockResolvedValue({ id: "id-1", identifiant });
};

const formulaire = (champs: Record<string, string>) => {
  const donnees = new FormData();
  for (const [cle, valeur] of Object.entries(champs)) donnees.append(cle, valeur);
  return donnees;
};

beforeEach(() => vi.clearAllMocks());

describe("garde du compte de démonstration", () => {
  it("ne reconnaît le compte démo que pour une session valide du compte « demo »", async () => {
    getCurrentSession.mockResolvedValue({ authenticated: false });
    expect(await estCompteDemo()).toBe(false);

    connecteEn("admin");
    expect(await refusSiCompteDemo()).toBeNull();

    connecteEn("demo");
    expect(await refusSiCompteDemo()).toEqual(DEMO_REFUS);
  });

  it("refuse une écriture du compte démo sans jamais toucher la base", async () => {
    connecteEn("demo");
    const resultat = await createCategory({ status: "idle", message: null }, formulaire({ nom: "Test" }));
    expect(resultat).toEqual(DEMO_REFUS);
    expect(categorieRepository.create).not.toHaveBeenCalled();
  });

  it("laisse l'administrateur réel écrire", async () => {
    connecteEn("admin");
    categorieRepository.findByNom.mockResolvedValue(null);
    categorieRepository.findBySlug.mockResolvedValue(null);
    const resultat = await createCategory({ status: "idle", message: null }, formulaire({ nom: "Test" }));
    expect(resultat.status).toBe("success");
    expect(categorieRepository.create).toHaveBeenCalledOnce();
  });

  it("masque les e-mails des inscrits et ignore la recherche par adresse pour le compte démo", async () => {
    const inscrits = {
      items: [{ id: "1", email: "personne@exemple.fr", dateInscription: new Date("2026-08-02") }],
      total: 1,
      hasNextPage: false,
      page: 1,
    };
    findAllInscritsPagines.mockResolvedValue(inscrits);

    connecteEn("demo");
    const demo = await listSubscribers({ page: 1, email: "personne@exemple.fr" });
    expect(demo.items[0].email).toBe(DEMO_MASQUE);
    expect(findAllInscritsPagines).toHaveBeenLastCalledWith({ page: 1 });

    connecteEn("admin");
    const admin = await listSubscribers({ page: 1 });
    expect(admin.items[0].email).toBe("personne@exemple.fr");
  });
});
