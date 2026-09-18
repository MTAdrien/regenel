import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";

const DESKTOP_BREAKPOINT = 768;
const MIN_SWIPE_DISTANCE = 50;

export default class extends Controller {
  static targets = ["track", "item", "prevButton", "nextButton"];
  static values = {
    desktopVisible: { type: Number, default: 3 },
    mobileVisible: { type: Number, default: 1 },
    autoplayDelay: { type: Number, default: 5000 },
  };

  connect() {
    this.currentIndex = 0;
    this.touchStartX = 0;
    this.visibleCards = this.mobileVisibleValue;
    this.sync();
    this.startAutoplay();
  }

  disconnect() {
    this.stopAutoplay();
  }

  getLastIndex() {
    return this.itemTargets.length - this.visibleCards;
  }

  updateButtons() {
    this.prevButtonTarget.disabled = this.currentIndex === 0;
    this.nextButtonTarget.disabled = this.currentIndex === this.getLastIndex();
  }

  updateTrack() {
    const step = this.itemTargets.length > 1
      ? this.itemTargets[1].offsetLeft - this.itemTargets[0].offsetLeft
      : this.itemTargets[0].offsetWidth;
    this.trackTarget.style.transform = `translateX(-${this.currentIndex * step}px)`;
  }

  sync() {
    this.visibleCards = window.innerWidth >= DESKTOP_BREAKPOINT
      ? this.desktopVisibleValue
      : this.mobileVisibleValue;

    if (this.currentIndex > this.getLastIndex()) {
      this.currentIndex = Math.max(this.getLastIndex(), 0);
    }

    this.updateTrack();
    this.updateButtons();
  }

  startAutoplay() {
    this.autoplayTimer = setInterval(() => {
      this.currentIndex = this.currentIndex === this.getLastIndex() ? 0 : this.currentIndex + 1;
      this.sync();
    }, this.autoplayDelayValue);
  }

  stopAutoplay() {
    clearInterval(this.autoplayTimer);
  }

  next() {
    if (this.currentIndex < this.getLastIndex()) {
      this.currentIndex++;
      this.sync();
    }
    this.stopAutoplay();
    this.startAutoplay();
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.sync();
    }
    this.stopAutoplay();
    this.startAutoplay();
  }

  touchStart(event) {
    this.touchStartX = event.touches[0].clientX;
  }

  touchEnd(event) {
    const distance = event.changedTouches[0].clientX - this.touchStartX;
    if (distance < -MIN_SWIPE_DISTANCE) this.next();
    if (distance > MIN_SWIPE_DISTANCE) this.previous();
  }
}
