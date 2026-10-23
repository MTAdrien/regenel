import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

export default class extends Controller {
  static targets = ["name", "email", "phone", "message", "website", "submit", "status"];

  async submit(event) {
    event.preventDefault();

    if (!this.element.reportValidity()) return;

    const button = this.submitTarget;
    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Envoi en cours…";

    this.statusTarget.textContent = "";
    this.statusTarget.className = "contact-status";
    this.statusTarget.setAttribute("role", "status");

    const payload = {
      nom: this.nameTarget.value.trim(),
      email: this.emailTarget.value.trim(),
      telephone: this.phoneTarget.value.trim(),
      message: this.messageTarget.value.trim(),
      website: this.websiteTarget.value,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Impossible d'envoyer votre message.");
      }

      this.statusTarget.textContent = result.confirmationSent === false
        ? "Votre message a bien été transmis à Regenel."
        : "Votre message a bien été envoyé. Merci de nous avoir contactés !";
      this.statusTarget.classList.add("is-success");
      this.element.reset();
    } catch (error) {
      this.statusTarget.textContent = error.message || "Une erreur est survenue. Merci de réessayer.";
      this.statusTarget.classList.add("is-error");
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}
