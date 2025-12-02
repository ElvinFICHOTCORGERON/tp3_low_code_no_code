document.addEventListener("DOMContentLoaded", () => {
  const nombreDisquesInput = document.getElementById("nombreDisques");
  const demarrerBouton = document.getElementById("demarrerJeu");

  // Référence aux tours
  const tour1 = document.getElementById("tour-1");
  const tour2 = document.getElementById("tour-2");
  const tour3 = document.getElementById("tour-3");
  const tours = [tour1, tour2, tour3];

  // Paramètres pour le calcul de la taille des disques
  // Ces valeurs sont en pixels et permettent de définir la plage de variation de la largeur.
  const LARGEUR_MAX_DISQUE = 200; // Largeur du plus grand disque (pour N disques)
  const LARGEUR_MIN_DISQUE = 80; // Largeur du plus petit disque (taille 1)

  /**
   * Nettoie les tours en supprimant tous les disques précédents.
   */
  function nettoyerTours() {
    tours.forEach((tour) => {
      // Suppression de tous les éléments ayant la classe 'disque'
      const disques = tour.querySelectorAll(".disque");
      disques.forEach((disque) => disque.remove());
    });
  }

  /**
   * Initialise le jeu en créant N disques sur la première tour.
   * @param {number} N - Le nombre de disques à créer (de 3 à 8).
   */
  function initialiserJeu(N) {
    // 1. Nettoyer l'aire de jeu (important pour redémarrer une partie)
    nettoyerTours();

    // Si N est 1 ou 2, il y a une division par 0 ou un problème, mais N >= 3 est géré par la validation.
    // Calculer l'incrément de largeur entre chaque taille de disque
    const ecartLargeur = (LARGEUR_MAX_DISQUE - LARGEUR_MIN_DISQUE) / (N - 1);

    // 2. Créer les disques de la taille N (plus grand) à la taille 1 (plus petit)
    // La boucle va du plus grand au plus petit.
    // L'ajout au DOM avec 'column-reverse' dans le CSS garantit l'ordre (plus grand en bas, plus petit en haut).
    for (let taille = N; taille >= 1; taille--) {
      const disque = document.createElement("div");
      disque.classList.add("disque");

      // Stocker la taille du disque dans un attribut de donnée (data-taille)
      disque.dataset.taille = taille;

      // Calculer la largeur : (taille - 1) permet d'avoir 0 pour le plus petit et N-1 pour le plus grand.
      const largeur = LARGEUR_MIN_DISQUE + (taille - 1) * ecartLargeur;

      disque.style.width = `${largeur}px`;

      // Ajouter le disque à la première tour (tour-1)
      tour1.appendChild(disque);
    }

    console.log(`Jeu initialisé avec ${N} disques sur la Tour 1.`);
  }

  // Gestionnaire d'événement pour le bouton Démarrer
  demarrerBouton.addEventListener("click", () => {
    const nombre = parseInt(nombreDisquesInput.value);

    // Validation simple du nombre d'anneaux
    if (nombre < 3 || nombre > 8 || isNaN(nombre)) {
      alert("Veuillez choisir un nombre d'anneaux valide entre 3 et 8.");
      return;
    }

    initialiserJeu(nombre);
  });

  // Au début, l'affichage est vide. La fonction initialiserJeu n'est appelée qu'au clic.
  // nettoyerTours() peut être appelé ici si jamais il y avait du contenu initial statique,
  // mais ici ce n'est pas nécessaire car nous partons d'un HTML vide.
});
