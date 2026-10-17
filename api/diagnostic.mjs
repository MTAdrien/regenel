import { v2 as cloudinary } from "cloudinary";
import { Resend } from "resend";

cloudinary.config({ secure: true });
const resend = new Resend(process.env.RESEND_API_KEY);
const SENDER = process.env.DIAGNOSTIC_FROM_EMAIL || "Regenel <onboarding@resend.dev>";
const MAX_ANSWERS = 40;
const MAX_PHOTOS = 4;

const escape = (text) => String(text).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
const isEmail = (value) => typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function signedPhotoLink(publicId) {
  const photo = await cloudinary.api.resource(String(publicId), { type: "authenticated" });
  if (photo.asset_folder !== "diagnostics") throw new Error("Photo inattendue");
  return cloudinary.url(photo.public_id, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    transformation: [{ width: 1600, crop: "limit" }],
  });
}

function diagnosticEmail(prenom, answers, photoLinks) {
  const rows = answers
    .map(({ question = "", answer = "" }) => `<tr><td style="padding:8px;vertical-align:top"><strong>${escape(String(question).slice(0, 300))}</strong></td><td style="padding:8px">${escape(String(answer).slice(0, 3000)) || "<em>Non renseigné</em>"}</td></tr>`)
    .join("");
  const photos = photoLinks
    .map((link, index) => `<li><a href="${escape(link)}">Photo ${index + 1}</a></li>`)
    .join("");
  return `<h2>Nouveau diagnostic de ${escape(prenom)}</h2><table style="border-collapse:collapse">${rows}</table><h3>Photos</h3><ul>${photos}</ul>`;
}

function confirmationEmail(prenom) {
  const calendly = process.env.CALENDLY_URL;
  return `<p>Bonjour ${escape(prenom)},</p><p>Merci, ton diagnostic est bien reçu. Je l'étudie avec attention avant notre échange en visio.</p>${calendly ? `<p>Si ce n'est pas encore fait, tu peux réserver ton créneau ici : <a href="${escape(calendly)}">réserver ma visio</a>.</p>` : ""}<p>À très vite,<br>Regenel</p>`;
}

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Méthode non autorisée." });

  const { answers, photos = [], prenom = "", email, website } = request.body ?? {};
  if (website) return response.status(200).json({ ok: true });
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS || !isEmail(email) || !Array.isArray(photos)) {
    return response.status(400).json({ error: "Diagnostic incomplet." });
  }

  try {
    const photoLinks = await Promise.all(photos.slice(0, MAX_PHOTOS).map(signedPhotoLink));

    const sent = await resend.emails.send({
      from: SENDER,
      to: process.env.DIAGNOSTIC_TO_EMAIL,
      replyTo: email,
      subject: `Nouveau diagnostic — ${String(prenom).slice(0, 80)}`,
      html: diagnosticEmail(prenom, answers, photoLinks),
    });
    if (sent.error) throw new Error(sent.error.message);

    if (process.env.DIAGNOSTIC_FROM_EMAIL) {
      await resend.emails.send({
        from: SENDER,
        to: email,
        subject: "Ton diagnostic Regenel est bien reçu",
        html: confirmationEmail(prenom),
      });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("diagnostic:", error?.error?.message ?? error?.message ?? "erreur inconnue");
    return response.status(500).json({ error: "L'envoi du diagnostic a échoué." });
  }
}
