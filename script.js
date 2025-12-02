document.addEventListener("DOMContentLoaded", () => {
  const nombreDisquesInput = document.getElementById("nombreDisques");
  const demarrerBouton = document.getElementById("demarrerJeu");
  const demoBouton = document.getElementById("demoAutomatique");
  const resetBouton = document.getElementById("resetJeu"); // NOUVEAU SÉLECTEUR
  const toggleThemeBouton = document.getElementById("toggleTheme"); // NOUVEAU SÉLECTEUR

  const compteurCoupsSpan = document.getElementById("compteurCoups");
  const scoreMinimalSpan = document.getElementById("scoreMinimal");

  const tour1 = document.getElementById("tour-1");
  const tour2 = document.getElementById("tour-2");
  const tour3 = document.getElementById("tour-3");
  const tours = [tour1, tour2, tour3];

  const LARGEUR_MAX_DISQUE = 200;
  const LARGEUR_MIN_DISQUE = 80;

  // VARIABLES D'ÉTAT DU JEU
  let disqueSelectionne = null;
  let estEnCoursDeJeu = false;

  // NOUVELLES VARIABLES D'ÉTAT ET STATS
  let estDemoEnCours = false;
  let sequenceDeMouvements = [];
  let coupsActuels = 0; // Compteur de coups
  let nbDisquesInitial = 0;
  const DELAI_MOUVEMENT = 500;

  // -------------------------------------------------------------------
  // I. LOGIQUE D'ÉTAT ET STATS
  // -------------------------------------------------------------------

  function mettreAJourCompteur() {
    coupsActuels++;
    compteurCoupsSpan.textContent = `Coups: ${coupsActuels}`;
  }

  function mettreAJourScoreOptimal(N) {
    nbDisquesInitial = N;
    // Calcul du score minimal : (2^n) - 1
    const scoreMin = Math.pow(2, N) - 1;
    scoreMinimalSpan.textContent = `Optimal: ${scoreMin}`;
  }

  /**
   * Réinitialise l'état du jeu à son initialisation (vide).
   */
  function reinitialiserJeu() {
    nettoyerTours();

    coupsActuels = 0;
    compteurCoupsSpan.textContent = `Coups: 0`;
    scoreMinimalSpan.textContent = `Optimal: ${
      Math.pow(2, parseInt(nombreDisquesInput.value)) - 1
    }`;

    estEnCoursDeJeu = false;
    estDemoEnCours = false;
    disqueSelectionne = null;

    // Mettre à jour les contrôles
    demarrerBouton.disabled = false;
    demoBouton.disabled = true;
    resetBouton.disabled = true;

    console.log("Jeu réinitialisé.");
  }

  // -------------------------------------------------------------------
  // II. INITIALISATION ET NETTOYAGE
  // -------------------------------------------------------------------

  function nettoyerTours() {
    tours.forEach((tour) => {
      const disques = tour.querySelectorAll(".disque");
      disques.forEach((disque) => disque.remove());
    });
    demoBouton.disabled = true;
  }

  function initialiserJeu(N) {
    nettoyerTours();
    estEnCoursDeJeu = true;
    estDemoEnCours = false;
    demarrerBouton.disabled = true;
    demoBouton.disabled = false;
    resetBouton.disabled = false;
    coupsActuels = 0;
    mettreAJourScoreOptimal(N);
    compteurCoupsSpan.textContent = `Coups: 0`;

    const ecartLargeur = (LARGEUR_MAX_DISQUE - LARGEUR_MIN_DISQUE) / (N - 1);

    for (let taille = N; taille >= 1; taille--) {
      const disque = document.createElement("div");
      disque.classList.add("disque");
      disque.dataset.taille = taille;
      const largeur = LARGEUR_MIN_DISQUE + (taille - 1) * ecartLargeur;
      disque.style.width = `${largeur}px`;

      disque.addEventListener("click", gererClicDisque);

      tour1.appendChild(disque);
    }

    tours.forEach((tour) => {
      tour.removeEventListener("click", gererClicTour);
      tour.addEventListener("click", gererClicTour);
    });

    console.log(`Jeu initialisé avec ${N} disques sur la Tour 1.`);
  }

  // -------------------------------------------------------------------
  // III. LOGIQUE DU MODE JOUEUR
  // -------------------------------------------------------------------

  // ... (gererClicDisque inchangé, à l'exception de l'ajout du blocage de la démo) ...
  function gererClicDisque(e) {
    if (!estEnCoursDeJeu || estDemoEnCours) return;

    const disqueClique = e.currentTarget;

    if (disqueSelectionne === disqueClique) {
      disqueSelectionne.classList.remove("selectionne");
      disqueSelectionne = null;
    } else if (disqueSelectionne) {
      return;
    } else {
      const tourParente = disqueClique.parentElement;
      if (tourParente.lastElementChild === disqueClique) {
        disqueSelectionne = disqueClique;
        disqueSelectionne.classList.add("selectionne");
      } else {
        console.warn("Seul le disque du dessus peut être sélectionné.");
      }
    }
    e.stopPropagation();
  }

  function gererClicTour(e) {
    if (!estEnCoursDeJeu || !disqueSelectionne || estDemoEnCours) return;

    const tourCible = e.currentTarget;
    const disqueDuDessus = tourCible.querySelector(".disque:last-child");
    const tailleDisqueSelectionne = parseInt(disqueSelectionne.dataset.taille);

    let mouvementValide = true;

    if (disqueDuDessus) {
      const tailleDisqueDuDessus = parseInt(disqueDuDessus.dataset.taille);
      if (tailleDisqueSelectionne > tailleDisqueDuDessus) {
        mouvementValide = false;
        alert(
          "Règle enfreinte : vous ne pouvez pas placer un anneau plus grand sur un plus petit."
        );
      }
    }

    if (mouvementValide) {
      // AJOUT DU COMPTEUR
      mettreAJourCompteur();

      tourCible.appendChild(disqueSelectionne);
      disqueSelectionne.classList.remove("selectionne");
      disqueSelectionne = null;

      verifierFinJeu();
    }
  }

  /**
   * Détecte la victoire et affiche le score.
   */
  function verifierFinJeu() {
    // La règle exige que la victoire soit sur la dernière tour (tour-3)
    if (tour3.querySelectorAll(".disque").length === nbDisquesInitial) {
      estEnCoursDeJeu = false;
      demoBouton.disabled = true;
      resetBouton.disabled = false;

      const scoreMinimal = Math.pow(2, nbDisquesInitial) - 1;
      let message = `Félicitations ! Vous avez terminé le jeu en ${coupsActuels} coups.`;

      if (coupsActuels === scoreMinimal) {
        message += ` Vous avez atteint le score minimal de ${scoreMinimal} coups ! (Score Parfait)`;
      } else {
        message += ` Le score optimal était de ${scoreMinimal} coups.`;
      }

      alert(message);
    }
  }

  // -------------------------------------------------------------------
  // IV. LOGIQUE DU MODE AUTOMATIQUE (Mise à jour pour le compteur)
  // -------------------------------------------------------------------

  function attendre(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function deplacerDisquesHanoi(n, sourceId, cibleId, auxiliaireId) {
    if (n === 0) return;
    deplacerDisquesHanoi(n - 1, sourceId, auxiliaireId, cibleId);
    sequenceDeMouvements.push({ source: sourceId, cible: cibleId });
    deplacerDisquesHanoi(n - 1, auxiliaireId, cibleId, sourceId);
  }

  async function executerMouvementVisuel(sourceTourId, cibleTourId) {
    const tourSource = document.getElementById(sourceTourId);
    const tourCible = document.getElementById(cibleTourId);
    const disqueAMouvoir = tourSource.querySelector(".disque:last-child");

    if (!disqueAMouvoir) return;

    // ANIMATION FLUIDE : L'animation DOM est gérée par le CSS 'transition'
    // Nous ajoutons simplement la classe pour l'effet de "lift" (transform: translateY)
    disqueAMouvoir.classList.add("selectionne");
    await attendre(DELAI_MOUVEMENT / 2);

    // Le glissement est géré par la transition CSS lorsque l'élément change de parent (appendChild)
    tourCible.appendChild(disqueAMouvoir);

    // Mettre à jour le compteur pour la démo aussi
    mettreAJourCompteur();

    disqueAMouvoir.classList.remove("selectionne");
    await attendre(DELAI_MOUVEMENT / 2);
  }

  async function lancerDemoAutomatique() {
    if (!estEnCoursDeJeu || estDemoEnCours) {
      alert("Veuillez d'abord Démarrer le jeu.");
      return;
    }

    // Réinitialisation du compteur pour la démo
    coupsActuels = 0;
    compteurCoupsSpan.textContent = `Coups: 0`;

    estDemoEnCours = true;
    demarrerBouton.disabled = true;
    demoBouton.disabled = true;

    // Désactiver les écouteurs du joueur
    tours.forEach((tour) => tour.removeEventListener("click", gererClicTour));
    tours.forEach((tour) =>
      tour
        .querySelectorAll(".disque")
        .forEach((d) => d.removeEventListener("click", gererClicDisque))
    );

    sequenceDeMouvements = [];
    const N = parseInt(nombreDisquesInput.value);

    deplacerDisquesHanoi(N, "tour-1", "tour-3", "tour-2");

    for (const mouvement of sequenceDeMouvements) {
      await executerMouvementVisuel(mouvement.source, mouvement.cible);
    }

    alert("Démonstration terminée !");

    // Fin de la démo
    verifierFinJeu();
    estDemoEnCours = false;
    demarrerBouton.disabled = true; // Reste désactivé car la partie est finie
    demoBouton.disabled = true;
    resetBouton.disabled = false;
  }

  // -------------------------------------------------------------------
  // V. GESTION DU THÈME
  // -------------------------------------------------------------------

  function toggleTheme() {
    const body = document.body;
    if (body.classList.contains("theme-clair")) {
      body.classList.remove("theme-clair");
      body.classList.add("theme-sombre");
      toggleThemeBouton.textContent = "Mode Clair";
    } else {
      body.classList.remove("theme-sombre");
      body.classList.add("theme-clair");
      toggleThemeBouton.textContent = "Mode Sombre";
    }
  }

  // -------------------------------------------------------------------
  // VI. ÉCOUTEURS D'ÉVÉNEMENTS
  // -------------------------------------------------------------------
  demarrerBouton.addEventListener("click", () => {
    const nombre = parseInt(nombreDisquesInput.value);
    if (nombre < 3 || nombre > 8 || isNaN(nombre)) {
      alert("Veuillez choisir un nombre d'anneaux valide entre 3 et 8.");
      return;
    }
    initialiserJeu(nombre);
  });

  demoBouton.addEventListener("click", lancerDemoAutomatique);

  // NOUVEAU ÉCOUTEUR
  resetBouton.addEventListener("click", reinitialiserJeu);

  // NOUVEAU ÉCOUTEUR
  toggleThemeBouton.addEventListener("click", toggleTheme);

  // Initialisation au chargement
  reinitialiserJeu();
  mettreAJourScoreOptimal(parseInt(nombreDisquesInput.value));
});
