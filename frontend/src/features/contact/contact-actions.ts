"use server";

import { MessageContactRepository } from "@/lib/db/message-contact-repository";
import { contactMessageSchema } from "@/features/contact/contact-schema";
import { sendEmail } from "@/lib/email/send-email";
import { verifyTurnstile } from "@/lib/turnstile";

const MESSAGE_ROBOT = "La vérification anti-robot a échoué. Merci de réessayer.";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  values?: { nom: string; email: string; objet: string; message: string };
};

// Server Action du formulaire de contact (REPO-7, D6 : stockage en base + consultation
// admin — aucun envoi e-mail sortant, aucune dépendance externe). Message de succès
// repris littéralement de Corne de l'Afrique.dc.html l.416, y compris en cas de piège à
// robots déclenché : jamais un signal permettant à un script de savoir qu'il a été
// bloqué (même principe que CONFIRMATION_MESSAGE dans newsletter-actions.ts, protection
// contre l'énumération).
const MESSAGE_SUCCES = "Merci. La rédaction vous répondra dans les meilleurs délais.";

export async function submitContactMessage(
  _previousState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  // Piège à robots (honeypot, cf. contact-form.tsx) : un visiteur réel ne peut pas
  // renseigner ce champ (hors flux visuel, exclu de l'arbre d'accessibilité). Réponse de
  // succès neutre sans écriture en base si renseigné.
  const piege = String(formData.get("site_web") ?? "").trim();
  if (piege.length > 0) {
    return { status: "success", message: MESSAGE_SUCCES };
  }

  const values = {
    nom: String(formData.get("nom") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    objet: String(formData.get("objet") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
  };

  if (!(await verifyTurnstile(formData))) {
    return { status: "error", message: MESSAGE_ROBOT, values };
  }

  const parsed = contactMessageSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Merci de vérifier les champs du formulaire.",
      values,
    };
  }

  await MessageContactRepository.create(parsed.data);

  // Alerte à la rédaction (Resend) ; « Répondre » écrit directement à l'expéditeur.
  const destinataire = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (destinataire) {
    await sendEmail({
      to: destinataire,
      replyTo: parsed.data.email,
      subject: `[Contact] ${parsed.data.objet} — ${parsed.data.nom}`,
      text: `Nouveau message reçu via le formulaire de contact.

Nom : ${parsed.data.nom}
Courriel : ${parsed.data.email}
Objet : ${parsed.data.objet}

${parsed.data.message}

— Tous les messages : /admin/contact`,
    });
  }

  return { status: "success", message: MESSAGE_SUCCES };
}
