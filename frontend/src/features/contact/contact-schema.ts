import { z } from "zod";

// Options de l'"Objet" du formulaire de contact, reprises littéralement du <select> de
// Corne de l'Afrique.dc.html (l.423) — union fermée, jamais une chaîne libre.
export const OBJETS_CONTACT = [
  "Information / signalement",
  "Accès documentaire",
  "Partenariat institutionnel",
  "Proposition d'entretien",
  "Autre",
] as const;

// Schéma de validation du formulaire de contact (REPO-7, D6 : stockage en base, pas
// d'envoi e-mail sortant). Ne valide que des objets déjà extraits d'un FormData — même
// convention que article-schema.ts, l'extraction reste la responsabilité de la Server
// Action appelante.
export const contactMessageSchema = z.object({
  // Bornes max : sans elles, un robot ayant passé le honeypot peut écrire des Mo en base.
  nom: z.string().trim().min(1, "Merci d'indiquer votre nom.").max(120, "Nom trop long (120 caractères maximum)."),
  email: z
    .string()
    .trim()
    .min(1, "Merci d'indiquer votre courriel.")
    .max(254, "Adresse e-mail trop longue.")
    .email("Adresse e-mail invalide."),
  objet: z.enum(OBJETS_CONTACT),
  message: z
    .string()
    .trim()
    .min(1, "Merci de rédiger un message.")
    .max(5000, "Votre message est trop long (5 000 caractères maximum)."),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
