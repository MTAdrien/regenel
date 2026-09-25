export const START = "prenom";

export const QUESTIONS = {
  prenom: {
    text: "Pour commencer, quel est ton prénom ?",
    type: "text",
    placeholder: "Ton prénom",
    next: "pourQui",
  },
  pourQui: {
    text: "Pour qui est le diagnostic ?",
    answers: [
      { label: "Pour moi", next: "genre" },
      { label: "Pour un proche", next: "genre" },
    ],
  },
  genre: {
    text: "Tu es :",
    answers: [
      { label: "Homme", next: "end" },
      { label: "Femme", next: "end" },
    ],
  },
};
