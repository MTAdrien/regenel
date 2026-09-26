export const START = "prenom";

const ZONE_HINT = "Choix multiple possible s'il s'agit de plusieurs zones différentes.";
const IMAGES = "https://res.cloudinary.com/uwqsnkse/image/upload/f_auto,q_auto,c_limit,w_480";

export const QUESTIONS = {
  prenom: {
    text: "Quel est ton prénom ?",
    type: "text",
    placeholder: "Ton prénom",
    next: "pourQui",
  },
  pourQui: {
    text: "Pour qui est le diagnostic ?",
    answers: [
      { label: "Pour moi", next: "genre" },
      { label: "Pour un proche", next: "genre", proche: true },
    ],
  },
  genre: {
    text: "Tu es :",
    textProche: "Ton proche est :",
    answers: [
      { label: "Homme", next: "zoneHomme" },
      { label: "Femme", next: "zoneFemme", feminin: true },
    ],
  },
  zoneHomme: {
    text: "Pour quelle(s) zone(s) souhaites-tu consulter ?",
    textProche: "Pour quelle(s) zone(s) {proche} souhaite-t-{il} consulter ?",
    hint: ZONE_HINT,
    type: "multiple",
    answers: [
      { label: "Cheveux", next: "cheveuxHomme" },
      { label: "Barbe", next: "barbe" },
      { label: "Sourcils", next: "sourcils" },
    ],
    next: "anciennete",
  },
  zoneFemme: {
    text: "Pour quelle(s) zone(s) souhaites-tu consulter ?",
    textProche: "Pour quelle(s) zone(s) {proche} souhaite-t-{il} consulter ?",
    hint: ZONE_HINT,
    type: "multiple",
    answers: [
      { label: "Cheveux", next: "cheveuxFemme" },
      { label: "Sourcils", next: "sourcils" },
    ],
    next: "anciennete",
  },
  cheveuxHomme: {
    text: "Quelle(s) zone(s) sont concernées par ta perte de cheveux ?",
    textProche: "Quelle(s) zone(s) sont concernées par la perte de cheveux de {proche} ?",
    hint: ZONE_HINT,
    type: "multiple",
    answers: [
      { label: "Ligne frontale", image: `${IMAGES}/homme-ligne-frontale` },
      { label: "Golfes temporaux", image: `${IMAGES}/homme-golfes-temporaux` },
      { label: "Toupet", image: `${IMAGES}/homme-toupet` },
      { label: "Vertex", image: `${IMAGES}/homme-vertex` },
      { label: "Couronne", image: `${IMAGES}/homme-couronne`, exclusive: true },
    ],
    next: "end",
  },
  barbe: {
    text: "Quelle(s) zone(s) de ta barbe souhaites-tu densifier ?",
    textProche: "Quelle(s) zone(s) de sa barbe {proche} souhaite-t-{il} densifier ?",
    hint: ZONE_HINT,
    type: "multiple",
    answers: [
      { label: "Barbe complète", image: `${IMAGES}/barbe-complete`, exclusive: true },
      { label: "Joues", image: `${IMAGES}/barbe-joue` },
      { label: "Bouc", image: `${IMAGES}/barbe-bouc` },
      { label: "Moustache", image: `${IMAGES}/barbe-moustache` },
    ],
    next: "end",
  },
  cheveuxFemme: {
    text: "Comment décrirais-tu ta perte de cheveux ?",
    textProche: "Comment décrirais-tu la perte de cheveux de {proche} ?",
    type: "image",
    answers: [
      { label: "Perte légère", image: `${IMAGES}/alopecie-stade1`, next: "end" },
      { label: "Perte moyenne", image: `${IMAGES}/alopecie-stade2`, next: "end" },
      { label: "Forte perte", image: `${IMAGES}/alopecie-stade3`, next: "end" },
    ],
  },
  sourcils: {
    text: "Quel stade correspond le mieux à tes sourcils ?",
    textProche: "Quel stade correspond le mieux aux sourcils de {proche} ?",
    type: "image",
    answers: [1, 2, 3, 4, 5].map((stade) => ({
      label: `Stade ${stade}`,
      image: `${IMAGES}/sourcils-stade${stade}`,
      next: "end",
    })),
  },
  anciennete: {
    text: "Depuis combien de temps constates-tu cette situation ?",
    textProche: "Depuis combien de temps {proche} constate-t-{il} cette situation ?",
    answers: [
      { label: "Moins de 6 mois", next: "medecin" },
      { label: "6 mois à 2 ans", next: "medecin" },
      { label: "Plus de 2 ans", next: "medecin" },
      { label: "Je ne sais pas précisément", next: "medecin" },
    ],
  },
  medecin: {
    text: "As-tu déjà consulté un médecin ou dermatologue pour cela ?",
    textProche: "{Proche} a-t-{il} déjà consulté un médecin ou dermatologue pour cela ?",
    answers: [
      { label: "Oui, avec un diagnostic posé", next: "sante" },
      { label: "Oui, sans conclusion claire", next: "sante" },
      { label: "Non, jamais consulté", next: "sante" },
      { label: "Non, je préfère explorer d'autres voies d'abord", next: "sante" },
    ],
  },
  sante: {
    text: "Y a-t-il des éléments de santé que tu souhaites me mentionner et qui pourraient être liés à ta situation ?",
    textProche: "Y a-t-il des éléments de santé que tu souhaites me mentionner et qui pourraient être liés à la situation de {proche} ?",
    hint: "Facultatif.",
    type: "text",
    multiline: true,
    optional: true,
    next: "visio",
  },
  visio: {
    text: "Tu es disponible pour un échange visio de 30 minutes :",
    answers: [
      { label: "En semaine l'après-midi", next: "connu" },
      { label: "Le week-end", next: "connu" },
      { label: "En semaine le matin", next: "connu" },
      { label: "En soirée", next: "connu" },
    ],
  },
  connu: {
    text: "Comment as-tu connu Regenel ?",
    hint: "Choix multiple possible.",
    type: "multiple",
    answers: [
      { label: "Instagram" },
      { label: "Facebook" },
      { label: "Recommandation de professionnels (médecin, spécialiste reconstruction capillaire...)" },
      { label: "Bouche à oreille" },
      { label: "Autre", other: true },
    ],
    next: "ville",
  },
  ville: {
    text: "Quelle est ta ville de résidence ?",
    textProche: "Quelle est la ville de résidence de {proche} ?",
    type: "text",
    placeholder: "Ville",
    next: "email",
  },
  email: {
    text: "Merci d'indiquer ici ton adresse mail",
    hint: "Elle me permettra de te confirmer la prise en compte de ton diagnostic et de t'envoyer le lien de rendez-vous.",
    type: "text",
    inputType: "email",
    placeholder: "prenom@exemple.fr",
    next: "end",
  },
};
