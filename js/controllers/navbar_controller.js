import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

export default class extends Controller {
  static targets = ["toggler"];

  connect() {
    this.onScroll();
  }

  onScroll() {
    this.element.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  onShown() {
    this.togglerTarget.classList.add("is-open");
  }

  onHidden() {
    this.togglerTarget.classList.remove("is-open");
  }
}
