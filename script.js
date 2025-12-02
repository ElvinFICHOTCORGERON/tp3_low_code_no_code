document.addEventListener("DOMContentLoaded", () => {
  const nombreDisquesInput = document.getElementById("nombreDisques");
  const demarrerBouton = document.getElementById("demarrerJeu");
  const demoBouton = document.getElementById("demoAutomatique"); // NOUVEAU SÉLECTEUR

  const tour1 = document.getElementById("tour-1");
  const tour2 = document.getElementById("tour-2");
  const tour3 = document.getElementById("tour-3");
  const tours = [tour1, tour2, tour3];

  const LARGEUR_MAX_DISQUE = 200;
  const LARGEUR_MIN_DISQUE = 80;

  // VARIABLES D'ÉTAT DU JEU
  let disqueSelectionne = null;
  let estEnCoursDeJeu = false;

  // NOUVELLES VARIABLES POUR LA DÉMO
  let estDemoEnCours = false;
  let sequenceDeMouvements = [];
  const DELAI_MOUVEMENT = 500; // Délai en ms pour chaque étape de l'animation

  // -------------------------------------------------------------------
  // FONCTIONS UTILITAIRES DE DÉMO
  // -------------------------------------------------------------------

  /**
   * Crée une promesse pour attendre un certain délai (ms).
   * Utilisé avec 'await' pour mettre la démo en pause entre les mouvements.
   */
  function attendre(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * ALGORITHME RÉCURSIF DES TOURS DE HANOÏ
   * Calcule la séquence de mouvements optimaux.
   * @param {number} n - Le nombre de disques à déplacer.
   * @param {string} sourceId - ID de la tour source.
   * @param {string} cibleId - ID de la tour cible.
   * @param {string} auxiliaireId - ID de la tour auxiliaire.
   */
  function deplacerDisquesHanoi(n, sourceId, cibleId, auxiliaireId) {
    if (n === 0) return;

    // 1. Déplacer n-1 disques de la Source à l'Auxiliaire (en utilisant la Cible)
    deplacerDisquesHanoi(n - 1, sourceId, auxiliaireId, cibleId);

    // 2. Déplacer le n-ième disque (le plus grand) de la Source à la Cible
    // On stocke le mouvement (ID de la source et ID de la cible)
    sequenceDeMouvements.push({
      source: sourceId,
      cible: cibleId,
    });

    // 3. Déplacer n-1 disques de l'Auxiliaire à la Cible (en utilisant la Source)
    deplacerDisquesHanoi(n - 1, auxiliaireId, cibleId, sourceId);
  }

  /**
   * Exécute un mouvement de la séquence avec des animations et un délai.
   */
  async function executerMouvementVisuel(sourceTourId, cibleTourId) {
    const tourSource = document.getElementById(sourceTourId);
    const tourCible = document.getElementById(cibleTourId);

    // Le disque à déplacer est toujours le dernier enfant de la source
    const disqueAMouvoir = tourSource.querySelector(".disque:last-child");

    if (!disqueAMouvoir) {
      console.error("Erreur démo : Disque introuvable.");
      return;
    }

    // 1. VISUALISATION : Sélection du disque
    disqueAMouvoir.classList.add("selectionne");
    await attendre(DELAI_MOUVEMENT / 2);

    // 2. MOUVEMENT : Transfert DOM du disque
    tourCible.appendChild(disqueAMouvoir);

    // 3. VISUALISATION : Désélection
    disqueAMouvoir.classList.remove("selectionne");
    await attendre(DELAI_MOUVEMENT / 2); // Délai avant le prochain mouvement
  }

  /**
   * Fonction principale pour lancer la démo après calcul de l'algorithme.
   */
  async function lancerDemoAutomatique() {
    // Contrainte : Ne pas lancer si la partie n'est pas lancée ou si la démo est déjà en cours
    if (!estEnCoursDeJeu || estDemoEnCours) {
      alert("Veuillez d'abord Démarrer le jeu.");
      return;
    }

    estDemoEnCours = true;

    // Désactiver les contrôles utilisateur/jeu pendant la démo
    demarrerBouton.disabled = true;
    demoBouton.disabled = true;
    tours.forEach((tour) => tour.removeEventListener("click", gererClicTour));
    tours.forEach((tour) =>
      tour
        .querySelectorAll(".disque")
        .forEach((d) => d.removeEventListener("click", gererClicDisque))
    );

    // 1. Calculer la séquence optimale
    sequenceDeMouvements = [];
    const N = parseInt(nombreDisquesInput.value);

    // Algorithme standard : de tour-1 à tour-3 en utilisant tour-2
    deplacerDisquesHanoi(N, "tour-1", "tour-3", "tour-2");

    console.log(
      `Début de la résolution pour ${N} disques (${sequenceDeMouvements.length} coups requis)...`
    );

    // 2. Exécuter chaque mouvement visuellement
    for (const mouvement of sequenceDeMouvements) {
      await executerMouvementVisuel(mouvement.source, mouvement.cible);
    }

    alert("Démonstration terminée !");

    // Rétablir l'état
    estDemoEnCours = false;
    estEnCoursDeJeu = false;
    demarrerBouton.disabled = false;

    // Nettoyer pour un éventuel redémarrage
    nettoyerTours();
  }

  // -------------------------------------------------------------------
  // LOGIQUE D'INITIALISATION ET DE JEU (Mise à jour pour la démo)
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
    demoBouton.disabled = false; // Activer le bouton de démo

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
      // S'assurer que les écouteurs sont attachés pour le mode joueur
      tour.removeEventListener("click", gererClicTour);
      tour.addEventListener("click", gererClicTour);
    });

    console.log(`Jeu initialisé avec ${N} disques sur la Tour 1.`);
  }

  // GESTIONNAIRES DE CLIC JOUEUR (bloqués pendant la démo)

  function gererClicDisque(e) {
    // Bloquer si la démo est en cours
    if (!estEnCoursDeJeu || estDemoEnCours) return;

    const disqueClique = e.currentTarget;
    // ... (reste de la logique de sélection inchangée) ...
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
    // Bloquer si la démo est en cours
    if (!estEnCoursDeJeu || !disqueSelectionne || estDemoEnCours) return;

    const tourCible = e.currentTarget;
    // ... (reste de la logique de déplacement et validation inchangée) ...
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
      tourCible.appendChild(disqueSelectionne);
      disqueSelectionne.classList.remove("selectionne");
      disqueSelectionne = null;

      verifierFinJeu();
    }
  }

  function verifierFinJeu() {
    const nombreDisques = parseInt(nombreDisquesInput.value);

    if (
      tour2.querySelectorAll(".disque").length === nombreDisques ||
      tour3.querySelectorAll(".disque").length === nombreDisques
    ) {
      estEnCoursDeJeu = false;
      demoBouton.disabled = true;
      alert(
        `Félicitations ! Vous avez complété le jeu des Tours de Hanoï avec ${nombreDisques} disques !`
      );
    }
  }

  // ÉCOUTEURS D'ÉVÉNEMENTS
  demarrerBouton.addEventListener("click", () => {
    const nombre = parseInt(nombreDisquesInput.value);

    if (nombre < 3 || nombre > 8 || isNaN(nombre)) {
      alert("Veuillez choisir un nombre d'anneaux valide entre 3 et 8.");
      return;
    }

    initialiserJeu(nombre);
  });

  // NOUVEAU ÉCOUTEUR
  demoBouton.addEventListener("click", lancerDemoAutomatique);

  // Initialisation au chargement pour s'assurer que le HTML est vide
  nettoyerTours();
});
