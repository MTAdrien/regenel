import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";
import { START, QUESTIONS } from "../data/diagnostic_tree.js";

export default class extends Controller {
  static targets = ["card", "question", "answers", "answerTemplate", "textForm", "textInput", "backButton", "summary", "summaryList"];

  connect() {
    this.restart();
  }

  show(id, previousAnswer = "") {
    const question = QUESTIONS[id];
    const isText = question.type === "text";
    const isInteracting = this.element.contains(document.activeElement);
    this.currentId = id;

    this.questionTarget.textContent = question.text;
    this.answersTarget.replaceChildren(...(isText ? [] : question.answers.map((answer) => this.buildAnswer(answer))));
    this.answersTarget.hidden = isText;
    this.textFormTarget.hidden = !isText;
    this.textInputTarget.placeholder = question.placeholder ?? "";
    this.textInputTarget.value = previousAnswer;
    this.backButtonTarget.disabled = this.history.length === 0;

    if (!isInteracting) return;
    if (isText) {
      this.textInputTarget.focus();
    } else {
      this.questionTarget.focus();
    }
  }

  buildAnswer(answer) {
    const button = this.answerTemplateTarget.content.firstElementChild.cloneNode(true);
    button.textContent = answer.label;
    button.dataset.diagnosticNextParam = answer.next;
    button.dataset.diagnosticLabelParam = answer.label;
    return button;
  }

  choose({ params: { next, label } }) {
    this.record(label, next);
  }

  submitText(event) {
    event.preventDefault();
    const value = this.textInputTarget.value.trim();
    if (value) this.record(value, QUESTIONS[this.currentId].next);
  }

  record(answer, next) {
    this.history.push({ id: this.currentId, answer });

    if (next === "end") {
      this.finish();
    } else {
      this.show(next);
    }
  }

  back() {
    const previous = this.history.pop();
    if (previous) this.show(previous.id, previous.answer);
  }

  finish() {
    this.summaryListTarget.replaceChildren(...this.history.map(({ id, answer }) => {
      const item = document.createElement("li");
      const question = document.createElement("strong");
      question.textContent = QUESTIONS[id].text;
      item.append(question, document.createElement("br"), answer);
      return item;
    }));

    this.cardTarget.hidden = true;
    this.summaryTarget.hidden = false;
  }

  restart() {
    this.history = [];
    this.summaryTarget.hidden = true;
    this.cardTarget.hidden = false;
    this.show(START);
  }
}
