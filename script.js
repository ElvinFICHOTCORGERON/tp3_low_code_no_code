document.addEventListener("DOMContentLoaded", () => {
  const nombreDisquesInput = document.getElementById("nombreDisques");
  const demarrerBouton = document.getElementById("demarrerJeu");

  const tour1 = document.getElementById("tour-1");
  const tour2 = document.getElementById("tour-2");
  const tour3 = document.getElementById("tour-3");
  const tours = [tour1, tour2, tour3];

  const LARGEUR_MAX_DISQUE = 200;
  const LARGEUR_MIN_DISQUE = 80;

  // VARIABLES D'ÉTAT DU JEU
  let disqueSelectionne = null; // Stocke l'élément disque cliqué
  let estEnCoursDeJeu = false;

  // -------------------------------------------------------------------
  // I. LOGIQUE D'INITIALISATION (Mise à jour pour ajouter les écouteurs)
  // -------------------------------------------------------------------

  function nettoyerTours() {
    // ... (fonction inchangée : supprime les disques existants) ...
    tours.forEach((tour) => {
      const disques = tour.querySelectorAll(".disque");
      disques.forEach((disque) => disque.remove());
    });
  }

  function initialiserJeu(N) {
    nettoyerTours();
    estEnCoursDeJeu = true;
    const ecartLargeur = (LARGEUR_MAX_DISQUE - LARGEUR_MIN_DISQUE) / (N - 1);

    for (let taille = N; taille >= 1; taille--) {
      const disque = document.createElement("div");
      disque.classList.add("disque");
      disque.dataset.taille = taille;
      const largeur = LARGEUR_MIN_DISQUE + (taille - 1) * ecartLargeur;
      disque.style.width = `${largeur}px`;

      // NOUVEAUTÉ : Ajouter l'écouteur de clic à chaque disque créé
      disque.addEventListener("click", gererClicDisque);

      tour1.appendChild(disque);
    }

    // NOUVEAUTÉ : Ajouter l'écouteur de clic à chaque tour
    tours.forEach((tour) => {
      tour.addEventListener("click", gererClicTour);
    });

    console.log(`Jeu initialisé avec ${N} disques sur la Tour 1.`);
  }

  // -------------------------------------------------------------------
  // II. LOGIQUE DE DÉPLACEMENT
  // -------------------------------------------------------------------

  /**
   * Gère le clic sur un disque pour le sélectionner ou le désélectionner.
   * @param {Event} e - L'événement de clic.
   */
  function gererClicDisque(e) {
    if (!estEnCoursDeJeu) return;

    const disqueClique = e.currentTarget;

    if (disqueSelectionne === disqueClique) {
      // Clic sur le disque déjà sélectionné : le désélectionner
      disqueSelectionne.classList.remove("selectionne");
      disqueSelectionne = null;
    } else if (disqueSelectionne) {
      // Un disque est déjà sélectionné, on ne peut pas en sélectionner un autre.
      // On force la désélection de l'ancien si on clique ailleurs qu'en haut de la tour.
      // On attend que l'utilisateur clique sur une tour.
      return;
    } else {
      // Aucun disque sélectionné : tenter de sélectionner celui cliqué
      const tourParente = disqueClique.parentElement;

      // On ne peut sélectionner que le disque qui est au sommet de sa tour
      // column-reverse fait que le dernier enfant est le disque du haut
      if (tourParente.lastElementChild === disqueClique) {
        disqueSelectionne = disqueClique;
        disqueSelectionne.classList.add("selectionne");
      } else {
        console.warn("Seul le disque du dessus peut être sélectionné.");
      }
    }
    // Empêche l'événement de se propager à la tour
    e.stopPropagation();
  }

  /**
   * Gère le clic sur une tour pour y déposer le disque sélectionné.
   * @param {Event} e - L'événement de clic.
   */
  function gererClicTour(e) {
    if (!estEnCoursDeJeu || !disqueSelectionne) return; // Rien à faire si pas de disque en main

    const tourCible = e.currentTarget;

    // 1. Validation de la règle des Tours de Hanoï
    const disqueDuDessus = tourCible.querySelector(".disque:last-child");
    const tailleDisqueSelectionne = parseInt(disqueSelectionne.dataset.taille);

    let mouvementValide = true;

    if (disqueDuDessus) {
      const tailleDisqueDuDessus = parseInt(disqueDuDessus.dataset.taille);

      // Règle : on ne peut pas poser un anneau sur un anneau plus petit que soi-même
      if (tailleDisqueSelectionne > tailleDisqueDuDessus) {
        mouvementValide = false;
        alert(
          "Règle enfreinte : vous ne pouvez pas placer un anneau plus grand sur un plus petit."
        );
      }
    }

    // 2. Exécution du déplacement si valide
    if (mouvementValide) {
      tourCible.appendChild(disqueSelectionne);
      disqueSelectionne.classList.remove("selectionne");
      disqueSelectionne = null; // Le disque est déposé

      verifierFinJeu();
    }
  }

  /**
   * Vérifie si toutes les conditions de victoire sont remplies (tous les disques sur Tour 2 ou Tour 3).
   */
  function verifierFinJeu() {
    const nombreDisques = parseInt(nombreDisquesInput.value);

    // Victoire sur la tour 2 ou 3
    if (
      tour2.querySelectorAll(".disque").length === nombreDisques ||
      tour3.querySelectorAll(".disque").length === nombreDisques
    ) {
      estEnCoursDeJeu = false;
      alert(
        `Félicitations ! Vous avez complété le jeu des Tours de Hanoï avec ${nombreDisques} disques !`
      );
    }
  }

  // -------------------------------------------------------------------
  // III. GESTION DU DÉMARRAGE
  // -------------------------------------------------------------------

  demarrerBouton.addEventListener("click", () => {
    const nombre = parseInt(nombreDisquesInput.value);

    if (nombre < 3 || nombre > 8 || isNaN(nombre)) {
      alert("Veuillez choisir un nombre d'anneaux valide entre 3 et 8.");
      return;
    }

    initialiserJeu(nombre);
  });
});
