"use server";

import { redirect } from "next/navigation";
import { adminLogin } from "@/features/admin-auth/actions";

export type LoginFormState = { error: string | null; identifiant: string };

// Pont entre le <form> de /admin/connexion et la Server Action `adminLogin` déjà
// validée (server-actions-specification.md §1.1) : aucune règle d'authentification
// ici, uniquement l'extraction des champs du formulaire et la redirection en cas de
// succès — le message d'échec restitué est exactement celui renvoyé par adminLogin.
//
// L'identifiant soumis est renvoyé dans l'état pour être restitué côté client : après
// résolution d'une Server Action liée à un <form>, React réinitialise lui-même tous les
// champs non contrôlés (y compris l'identifiant) — comportement qui contredirait
// « identifiant conservé » (ui-specification.md §Formulaires) sans cette restitution.
export async function loginFormAction(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const identifiant = String(formData.get("identifiant") ?? "");
  const motDePasse = String(formData.get("motDePasse") ?? "");

  const result = await adminLogin(identifiant, motDePasse);

  if (result.success) {
    redirect("/admin");
  }

  return { error: result.error, identifiant };
}
