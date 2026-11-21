"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { InscritNewsletterRepository } from "@/lib/db/inscrit-newsletter-repository";
import { generateNewsletterToken } from "@/lib/newsletter/token";
import { ensureAdministrateurAuthentifie, refusSiCompteDemo } from "@/lib/auth/require-admin-session";
import { sendEmail } from "@/lib/email/send-email";
import { verifyTurnstile } from "@/lib/turnstile";
import { resoudreSiteUrl } from "@/lib/site-url";

// E-mail de bienvenue, envoyé uniquement à une adresse nouvellement (ré)inscrite : jamais
// à une adresse déjà inscrite, pour ne pas faire du formulaire un outil de spam.
async function envoyerConfirmation(email: string, jeton: string) {
  const lien = new URL(`/newsletter/desinscription?token=${encodeURIComponent(jeton)}`, resoudreSiteUrl()).toString();
  await sendEmail({
    to: email,
    subject: "Bienvenue — newsletter Corne de l'Afrique",
    text: `Merci pour votre inscription à la newsletter Corne de l'Afrique.

Vous recevrez une édition par semaine : analyses, enquêtes et actualités sur la Corne de l'Afrique.

Pour vous désinscrire à tout moment : ${lien}`,
  });
}

// Server Actions Newsletter (server-actions-specification.md §6, §8.2).
export type NewsletterActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  values?: { email: string };
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Message de confirmation strictement identique pour les trois issues possibles
// (e-mail inconnu, déjà inscrit, réactivation après désinscription) — protection contre
// l'énumération (security-specification.md §9, US-019) : aucun signal ne doit permettre
// de distinguer ces cas.
const CONFIRMATION_MESSAGE = "Merci, votre inscription à la newsletter est confirmée.";

export async function subscribeNewsletter(
  _previousState: NewsletterActionState,
  formData: FormData
): Promise<NewsletterActionState> {
  // Piège à robots (honeypot, cf. newsletter-form.tsx) : un visiteur réel ne peut pas
  // renseigner ce champ. Réponse neutre identique au succès réel si rempli — même
  // principe que CONFIRMATION_MESSAGE ci-dessous, jamais de signal de détection.
  const piege = String(formData.get("site_web") ?? "").trim();
  if (piege.length > 0) {
    return { status: "success", message: CONFIRMATION_MESSAGE };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const values = { email };

  if (email.length === 0 || !EMAIL_REGEX.test(email)) {
    return { status: "error", message: "Adresse e-mail invalide.", values };
  }

  if (!(await verifyTurnstile(formData))) {
    return { status: "error", message: "La vérification anti-robot a échoué. Merci de réessayer.", values };
  }

  const existante = await InscritNewsletterRepository.findByEmail(email);

  if (!existante) {
    try {
      const jeton = generateNewsletterToken();
      await InscritNewsletterRepository.create({ email, jetonDesinscription: jeton });
      await envoyerConfirmation(email, jeton);
    } catch (error) {
      // Concurrence sur UNIQUE(email) : une autre requête a inscrit cette adresse entre la
      // lecture et l'écriture. Traité comme une confirmation neutre standard, jamais une erreur.
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) {
        throw error;
      }
    }
  } else if (existante.statut === "desinscrit") {
    const jeton = generateNewsletterToken();
    const { count } = await InscritNewsletterRepository.reactivate(existante.id, jeton);
    if (count > 0) await envoyerConfirmation(email, jeton);
  }
  // existante.statut === "inscrit" : aucune écriture, confirmation neutre identique.

  return { status: "success", message: CONFIRMATION_MESSAGE };
}

export async function removeSubscriber(
  id: string,
  _previousState: NewsletterActionState,
  _formData: FormData
): Promise<NewsletterActionState> {
  await ensureAdministrateurAuthentifie();
  const refusDemo = await refusSiCompteDemo();
  if (refusDemo) return refusDemo;

  const existante = await InscritNewsletterRepository.findById(id);
  if (!existante) {
    return { status: "error", message: "Inscrit introuvable." };
  }

  await InscritNewsletterRepository.updateStatutDesinscrit(id);
  revalidatePath("/admin/newsletter");

  return { status: "success", message: "Inscrit retiré." };
}
