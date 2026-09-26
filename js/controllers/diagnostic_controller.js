import { Controller } from "https://unpkg.com/@hotwired/stimulus@3.2.2/dist/stimulus.js";
import { START, QUESTIONS } from "../data/diagnostic_tree.js";

const OTHER_SEPARATOR = " : ";

export default class extends Controller {
  static targets = [
    "card", "question", "hint", "answers", "answerTemplate", "imageAnswerTemplate", "form", "textInput", "textArea",
    "choices", "choiceInput", "otherInput", "checkboxTemplate", "imageCheckboxTemplate", "backButton", "summary", "summaryList",
  ];

  connect() {
    this.restart();
  }

  get isProche() {
    return this.history.some((entry) => entry.proche);
  }

  get isFeminin() {
    return this.history.some((entry) => entry.feminin);
  }

  // En mode proche, {proche}, {Proche} et {il} s'accordent avec le genre choisi.
  textFor(question) {
    if (!this.isProche || !question.textProche) return question.text;

    const proche = this.isFeminin ? "ta proche" : "ton proche";
    return question.textProche
      .replaceAll("{proche}", proche)
      .replaceAll("{Proche}", proche[0].toUpperCase() + proche.slice(1))
      .replaceAll("{il}", this.isFeminin ? "elle" : "il");
  }

  textFieldFor(question) {
    return question.multiline ? this.textAreaTarget : this.textInputTarget;
  }

  show(id, previousAnswer) {
    const question = QUESTIONS[id];
    const isText = question.type === "text";
    const isMultiple = question.type === "multiple";
    const isImage = question.type === "image";
    const hasImages = question.answers?.some((answer) => answer.image) ?? false;
    const isInteracting = this.element.contains(document.activeElement);
    this.currentId = id;

    this.questionTarget.textContent = this.textFor(question);
    this.hintTarget.textContent = question.hint ?? "";
    this.hintTarget.hidden = !question.hint;

    this.answersTarget.hidden = isText || isMultiple;
    this.answersTarget.classList.toggle("is-images", isImage);
    this.answersTarget.replaceChildren(...(this.answersTarget.hidden ? [] : question.answers.map((answer) => this.buildAnswer(answer, isImage))));

    this.formTarget.hidden = !(isText || isMultiple);
    [this.textInputTarget, this.textAreaTarget].forEach((field) => {
      const isActive = isText && field === this.textFieldFor(question);
      field.hidden = !isActive;
      field.disabled = !isActive;
      field.required = !question.optional;
      field.placeholder = question.placeholder ?? "";
      field.value = isActive ? previousAnswer ?? "" : "";
    });
    this.textInputTarget.type = question.inputType ?? "text";

    const checkedAnswers = isMultiple ? previousAnswer ?? [] : [];
    this.choicesTarget.hidden = !isMultiple;
    this.choicesTarget.classList.toggle("is-images", hasImages);
    this.choicesTarget.replaceChildren(...(isMultiple ? question.answers.map((answer, index) => this.buildChoice(answer, index, checkedAnswers)) : []));
    const otherLabel = question.answers?.find((answer) => answer.other)?.label;
    const otherAnswer = otherLabel && checkedAnswers.find((answer) => answer.startsWith(otherLabel + OTHER_SEPARATOR));
    this.otherInputTarget.value = otherAnswer ? otherAnswer.slice((otherLabel + OTHER_SEPARATOR).length) : "";
    this.syncOther();

    this.backButtonTarget.disabled = this.history.length === 0;

    if (!isInteracting) return;
    if (isText) {
      this.textFieldFor(question).focus();
    } else {
      this.questionTarget.focus();
    }
  }

  buildAnswer(answer, isImage) {
    const template = isImage ? this.imageAnswerTemplateTarget : this.answerTemplateTarget;
    const button = template.content.firstElementChild.cloneNode(true);
    if (isImage) {
      button.querySelector("img").src = answer.image;
      button.querySelector("span").textContent = answer.label;
    } else {
      button.textContent = answer.label;
    }
    button.dataset.diagnosticNextParam = answer.next;
    button.dataset.diagnosticLabelParam = answer.label;
    if (answer.proche) button.dataset.diagnosticProcheParam = "true";
    if (answer.feminin) button.dataset.diagnosticFemininParam = "true";
    return button;
  }

  buildChoice(answer, index, checkedAnswers) {
    const template = answer.image ? this.imageCheckboxTemplateTarget : this.checkboxTemplateTarget;
    const choice = template.content.firstElementChild.cloneNode(true);
    const input = choice.querySelector("input");
    const label = choice.querySelector("label");
    input.id = `diagnostic-choice-${index}`;
    input.value = answer.label;
    input.checked = checkedAnswers.some((checked) => checked === answer.label || checked.startsWith(answer.label + OTHER_SEPARATOR));
    input.dataset.exclusive = Boolean(answer.exclusive);
    input.dataset.other = Boolean(answer.other);
    label.htmlFor = input.id;
    if (answer.image) {
      label.querySelector("img").src = answer.image;
      label.querySelector("span").textContent = answer.label;
    } else {
      label.textContent = answer.label;
    }
    return choice;
  }

  get otherChoice() {
    return this.choiceInputTargets.find((input) => input.dataset.other === "true");
  }

  // Le champ "précise ta réponse" n'apparaît que lorsque la réponse "other" est cochée.
  syncOther() {
    const isVisible = Boolean(this.otherChoice?.checked);
    this.otherInputTarget.hidden = !isVisible;
    this.otherInputTarget.disabled = !isVisible;
  }

  // Une réponse "exclusive" ne peut pas être cochée avec les autres : cocher l'une décoche l'autre.
  toggleChoice({ target }) {
    this.choiceInputTargets[0].setCustomValidity("");

    if (target.checked) {
      const isExclusive = target.dataset.exclusive === "true";
      this.choiceInputTargets
        .filter((input) => input !== target && (isExclusive || input.dataset.exclusive === "true"))
        .forEach((input) => { input.checked = false; });
    }

    this.syncOther();
    if (target === this.otherChoice && target.checked) this.otherInputTarget.focus();
  }

  choose({ params: { next, label, proche, feminin } }) {
    this.record(label, next, { proche, feminin });
  }

  submit(event) {
    event.preventDefault();
    const question = QUESTIONS[this.currentId];

    if (question.type === "multiple") {
      const checked = this.choiceInputTargets.filter((input) => input.checked);
      if (checked.length === 0) {
        this.choiceInputTargets[0].setCustomValidity("Choisis au moins une réponse.");
        this.choiceInputTargets[0].reportValidity();
        return;
      }

      const other = this.otherInputTarget.value.trim();
      if (this.otherChoice?.checked && !other) {
        this.otherInputTarget.value = "";
        this.otherInputTarget.reportValidity();
        return;
      }

      const labels = checked.map((input) => input.value);
      const answer = checked.map((input) => (input === this.otherChoice ? input.value + OTHER_SEPARATOR + other : input.value));
      const branches = question.answers
        .filter((choice) => choice.next && labels.includes(choice.label))
        .map((choice) => choice.next);
      this.record(answer, question.next, {}, branches);
    } else {
      const value = this.textFieldFor(question).value.trim();
      if (value || question.optional) this.record(value, question.next);
    }
  }

  // Les questions ouvertes par un choix multiple passent avant la suite de ce choix.
  // "end" termine une branche : on reprend alors la file, puis le récapitulatif.
  record(answer, next, { proche = false, feminin = false } = {}, branches = []) {
    this.history.push({ id: this.currentId, answer, proche, feminin, queue: this.queue });

    const [nextId, ...queue] = [...branches, next, ...this.queue].filter((id) => id !== "end");
    this.queue = queue;

    if (nextId) {
      this.show(nextId);
    } else {
      this.finish();
    }
  }

  back() {
    const previous = this.history.pop();
    if (!previous) return;
    this.queue = previous.queue;
    this.show(previous.id, previous.answer);
  }

  finish() {
    this.summaryListTarget.replaceChildren(...this.history.map(({ id, answer }) => {
      const item = document.createElement("li");
      const question = document.createElement("strong");
      question.textContent = this.textFor(QUESTIONS[id]);
      item.append(question, document.createElement("br"), [answer].flat().join(", ") || "Non renseigné");
      return item;
    }));

    this.cardTarget.hidden = true;
    this.summaryTarget.hidden = false;
  }

  restart() {
    this.history = [];
    this.queue = [];
    this.summaryTarget.hidden = true;
    this.cardTarget.hidden = false;
    this.show(START);
  }
}
