"use server";

import { MessageContactRepository } from "@/lib/db/message-contact-repository";
import { contactMessageSchema } from "@/features/contact/contact-schema";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string | null;
  values?: { nom: string; email: string; objet: string; message: string };
};

// Server Action du formulaire de contact (REPO-7, D6 : stockage en base + consultation
// admin — aucun envoi e-mail sortant, aucune dépendance externe). Message de succès
// repris littéralement de Corne de l'Afrique.dc.html l.416.
export async function submitContactMessage(
  _previousState: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const values = {
    nom: String(formData.get("nom") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    objet: String(formData.get("objet") ?? ""),
    message: String(formData.get("message") ?? "").trim(),
  };

  const parsed = contactMessageSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Merci de vérifier les champs du formulaire.",
      values,
    };
  }

  await MessageContactRepository.create(parsed.data);

  return { status: "success", message: "Merci. La rédaction vous répondra dans les meilleurs délais." };
}
