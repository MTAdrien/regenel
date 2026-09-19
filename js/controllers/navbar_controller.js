import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

export default class extends Controller {
  static targets = ["nav", "toggler", "backdrop", "collapse"];

  connect() {
    this.onScroll();
  }

  onScroll() {
    this.navTarget.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  onShown() {
    this.togglerTarget.classList.add("is-open");
    this.backdropTarget.style.height = `${this.collapseTarget.offsetHeight}px`;
    this.backdropTarget.classList.add("is-visible");
  }

  onHidden() {
    this.togglerTarget.classList.remove("is-open");
    this.backdropTarget.classList.remove("is-visible");
    this.backdropTarget.style.height = "0";
  }
}
