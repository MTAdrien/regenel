import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

export default class extends Controller {
  connect() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    this.observer.observe(this.element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}
