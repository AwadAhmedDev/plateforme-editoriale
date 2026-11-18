// Envoi d'e-mails transactionnels via l'API HTTP de Resend (https://resend.com/docs/api-reference/emails/send-email)
// — un simple fetch, aucun SDK ajouté. Texte brut uniquement : aucun contenu saisi par un
// visiteur n'est jamais interprété comme du HTML (pas d'injection possible).
//
// Ne lève jamais : l'e-mail est un effet secondaire. L'écriture en base (message de
// contact, inscription) a déjà eu lieu et ne doit pas échouer parce que Resend est
// indisponible ou pas encore configuré.
type EmailParams = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, text, replyTo }: EmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("[email] RESEND_API_KEY ou EMAIL_FROM absente : e-mail non envoyé.", { subject });
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.error("[email] Resend a refusé l'envoi.", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Échec réseau vers Resend.", error);
    return false;
  }
}
