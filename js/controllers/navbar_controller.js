import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

export default class extends Controller {
  static targets = ["nav", "toggler", "backdrop", "collapse"];

  connect() {
    this.onScroll();
    this.resizeObserver = new ResizeObserver(() => this.syncHeight());
    this.resizeObserver.observe(this.collapseTarget);
  }

  disconnect() {
    this.resizeObserver?.disconnect();
  }

  onScroll() {
    this.navTarget.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  syncHeight() {
    this.backdropTarget.style.height = `${this.navTarget.offsetHeight + this.collapseTarget.offsetHeight}px`;
  }

  onShow() {
    this.togglerTarget.classList.add("is-open");
    this.backdropTarget.classList.add("is-visible");
  }

  onHide() {
    this.togglerTarget.classList.remove("is-open");
    this.backdropTarget.classList.remove("is-visible");
  }
}
