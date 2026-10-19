import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.CONTACT_FROM_EMAIL || "Regenel <onboarding@resend.dev>";
const TO_EMAIL = process.env.CONTACT_TO_EMAIL;

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", };
    return entities[char];
  });

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function notificationEmail(nom, email, telephone, message) {
  return `
    <h2>Nouvelle demande de contact depuis le site Regenel</h2>

    <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(telephone || "Non renseigné")}</p>

    <h3>Message</h3>

    <p>${escapeHtml(message)}</p>`;
}

function confirmationEmail(nom) {
  return `
    <h2>Confirmation de prise de contact</h2>

    <p>Bonjour ${escapeHtml(nom)},</p>

    <p>
      Merci d'avoir contacté Regenel.
      Votre message a bien été transmis.
    </p>

    <p>
      Nous reviendrons vers vous dans les meilleurs délais.
    </p>

    <p>À bientôt,<br>Laëticia praticienne Regenel</p>
  `;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Méthode non autorisée.",
    });
  }

  const { nom, email, telephone = "", message, website = "", } = request.body ?? {};

  if (website) return response.status(200).json({ ok: true });
  if (typeof nom !== "string" || !nom.trim() || nom.length > 100 || !isEmail(email) || typeof message !== "string" || !message.trim() || message.length > 5000 || typeof telephone !== "string" || telephone.length > 30) {
    return response.status(400).json({ error: "Merci de vérifier les informations du formulaire.", });
  }
  if (!process.env.RESEND_API_KEY || !TO_EMAIL) {
    console.error("contact: configuration Resend incomplète.");

    return response.status(500).json({
      error: "Le service de contact est momentanément indisponible.",
    });
  }

  const nomClient = nom.trim();
  const emailClient = email.trim();
  const telephoneClient = telephone.trim();
  const messageClient = message.trim();

  try {
    const notification = await resend.emails.send({
      from: SENDER,
      to: TO_EMAIL,
      replyTo: emailClient,
      subject: `Nouveau message de contact — ${nomClient}`,
      html: notificationEmail(nomClient, emailClient, telephoneClient, messageClient),
    });

    if (notification.error) throw new Error(notification.error.message);

    const confirmation = await resend.emails.send({
      from: SENDER,
      to: emailClient,
      subject: "Nous avons bien reçu votre message",
      html: confirmationEmail(nomClient),
    });

    if (confirmation.error) {
      console.error("contact: notification envoyée, mais confirmation échouée.", confirmation.error.message);

      return response.status(200).json({
        ok: true,
        confirmationSent: false,
      });
    }

    return response.status(200).json({ ok: true, confirmationSent: true, });
  } catch (error) {
    console.error("contact:", error?.message ?? "Erreur inconnue");

    return response.status(500).json({ error: "L'envoi de votre message a échoué. Merci de réessayer.", });
  }
}
