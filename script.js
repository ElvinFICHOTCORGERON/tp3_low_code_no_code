// --- CONSTANTES ET ÉLÉMENTS DU DOM ---
const TOWERS = [
  document.getElementById("tower-1"),
  document.getElementById("tower-2"),
  document.getElementById("tower-3"),
];
const numDiscsInput = document.getElementById("numDiscs");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const autoSolveButton = document.getElementById("autoSolveButton");
const toggleThemeButton = document.getElementById("toggleTheme");
const minMovesSpan = document.getElementById("minMoves");
const currentMovesSpan = document.getElementById("currentMoves");
const winModal = document.getElementById("win-modal");
const finalMovesSpan = document.getElementById("finalMoves");
const optimalityMessage = document.getElementById("optimalityMessage");
const closeModalButton = document.getElementById("closeModal");
const DISC_HEIGHT = 25; // Hauteur fixe d'un disque
const DISC_MARGIN = 2; // Marge entre les disques
const BASE_HEIGHT = 30; // Hauteur de la base de la tour

// --- ÉTAT GLOBAL DU JEU ---
let numDiscs = 3;
let currentMoves = 0;
let minRequiredMoves = 7;
let selectedDisc = null; // Référence au disque DOM sélectionné
let gameInProgress = false;
let isAutoSolving = false;
let moveQueue = []; // File d'attente pour la résolution automatique

// --- FONCTIONS UTILITAIRES ---

/**
 * Calcule la formule du score minimal : (2^n - 1)
 * @param {number} n - Le nombre de disques.
 * @returns {number} Le nombre minimum de coups.
 */
function calculateMinMoves(n) {
  return Math.pow(2, n) - 1;
}

/**
 * Met à jour l'affichage du score.
 */
function updateScoreDisplay() {
  currentMovesSpan.textContent = currentMoves;
  minMovesSpan.textContent = minRequiredMoves;
}

/**
 * Crée un disque DOM et lui applique le style approprié.
 * @param {number} size - La taille (index) du disque.
 * @returns {HTMLElement} Le disque créé.
 */
function createDisc(size) {
  const disc = document.createElement("div");
  disc.classList.add("disc");
  disc.setAttribute("data-size", size);
  // Largeur : 150px pour le plus grand (taille 8), 50px pour le plus petit (taille 1)
  const width = 50 + size * 12.5;
  disc.style.width = `${width}px`;
  disc.style.zIndex = size + 2; // Z-Index basé sur la taille pour l'empilement visuel
  return disc;
}

/**
 * Calcule la position verticale (bas) d'un disque sur une tour.
 * @param {HTMLElement} tower - L'élément DOM de la tour.
 * @returns {string} La valeur CSS 'bottom'.
 */
function getDiscPosition(tower) {
  const stackHeight = tower.querySelectorAll(".disc").length;
  // Position = Hauteur de la base + (Nombre de disques * (Hauteur du disque + Marge))
  const bottom = BASE_HEIGHT + stackHeight * (DISC_HEIGHT + DISC_MARGIN);
  return `${bottom}px`;
}

// --- LOGIQUE DU JEU ---

/**
 * Initialise le jeu : vide les tours et place les disques sur la première tour.
 */
function initializeGame() {
  // 1. Récupération et validation du nombre d'anneaux
  numDiscs = parseInt(numDiscsInput.value);
  if (isNaN(numDiscs) || numDiscs < 3 || numDiscs > 8) {
    alert("Veuillez choisir un nombre d'anneaux entre 3 et 8.");
    numDiscs = 3; // Réinitialisation par défaut
    numDiscsInput.value = 3;
  }

  // 2. Réinitialisation de l'état
  gameInProgress = true;
  currentMoves = 0;
  minRequiredMoves = calculateMinMoves(numDiscs);
  selectedDisc = null;
  isAutoSolving = false;
  moveQueue = [];

  // 3. Réinitialisation de l'UI
  TOWERS.forEach(
    (t) => (t.innerHTML = `<div class="base">Tour ${t.id.slice(-1)}</div>`)
  );
  updateScoreDisplay();
  winModal.style.display = "none";

  // 4. Création et placement des disques sur la première tour (Towers[0])
  for (let i = numDiscs; i >= 1; i--) {
    const disc = createDisc(i);
    TOWERS[0].appendChild(disc);
    // Positionnement immédiat
    disc.style.bottom = getDiscPosition(TOWERS[0]);
  }

  // 5. Mise à jour des boutons
  startButton.disabled = true;
  resetButton.disabled = false;
  autoSolveButton.disabled = false;
  numDiscsInput.disabled = true;
}

/**
 * Gère la sélection/déplacement d'un disque au clic sur une tour.
 * @param {Event} e - L'événement de clic.
 */
function handleTowerClick(e) {
  if (!gameInProgress || isAutoSolving) return;

  const clickedTower = e.currentTarget;
  const topDisc = clickedTower.querySelector(".disc:last-child"); // Le disque le plus haut

  if (!selectedDisc) {
    // --- ÉTAPE 1 : SÉLECTION DU DISQUE ---
    if (topDisc) {
      // Un disque ne peut être sélectionné que s'il est au sommet de sa tour
      selectedDisc = topDisc;
      selectedDisc.classList.add("selected");
    }
  } else {
    // --- ÉTAPE 2 : DÉPLACEMENT DU DISQUE ---
    const sourceTower = selectedDisc.parentElement;
    const targetTower = clickedTower;
    const targetTopDisc = topDisc;

    // Règle 1 : La cible ne peut pas être la tour source
    if (sourceTower === targetTower) {
      selectedDisc.classList.remove("selected");
      selectedDisc = null;
      return;
    }

    const selectedSize = parseInt(selectedDisc.getAttribute("data-size"));
    const targetTopSize = targetTopDisc
      ? parseInt(targetTopDisc.getAttribute("data-size"))
      : Infinity;

    // Règle 2 : Un disque ne peut pas être placé sur un disque plus petit
    if (selectedSize < targetTopSize) {
      // Déplacement Valide
      moveDisc(sourceTower, targetTower, selectedDisc);
    } else {
      // Déplacement Invalide
      alert(
        "Règle Hanoï : Un disque ne peut pas être placé sur un disque plus petit !"
      );
      selectedDisc.classList.remove("selected");
      selectedDisc = null;
    }
  }
}

/**
 * Effectue le mouvement d'un disque avec une animation fluide.
 * @param {HTMLElement} sourceTower - La tour de départ.
 * @param {HTMLElement} targetTower - La tour d'arrivée.
 * @param {HTMLElement} disc - Le disque à déplacer.
 * @param {boolean} isAuto - Indique si c'est un mouvement automatique.
 */
function moveDisc(sourceTower, targetTower, disc, isAuto = false) {
  if (!isAuto) {
    // En mode manuel, on s'assure que le disque est bien le haut de la tour source
    const sourceTopDisc = sourceTower.querySelector(".disc:last-child");
    if (disc !== sourceTopDisc) return;
  }

  // 1. Mise à jour des classes et du DOM
  disc.classList.remove("selected");
  targetTower.appendChild(disc); // Ajout au DOM de la cible (change l'empilement)

  // 2. Calcul de la nouvelle position verticale
  // ATTENTION : La hauteur est calculée APRES l'insertion dans la cible
  const newBottom = getDiscPosition(targetTower);

  // 3. Application de la transition
  // Le disque est déjà dans le DOM de la cible, on lui applique sa position finale.
  // La propriété 'transition' dans le CSS assure le glissement fluide.
  disc.style.bottom = newBottom;

  // 4. Mise à jour de l'état du jeu (après le mouvement)
  currentMoves++;
  updateScoreDisplay();

  // 5. Réinitialisation du disque sélectionné
  selectedDisc = null;

  // 6. Vérification de la victoire
  if (!isAuto) {
    checkWinCondition();
  }
}

/**
 * Vérifie si la partie est gagnée (tous les disques sur la tour 3).
 */
function checkWinCondition() {
  // La tour de destination est TOWERS[2] (Tour 3)
  const tower3Discs = TOWERS[2].querySelectorAll(".disc").length;

  if (tower3Discs === numDiscs) {
    gameInProgress = false;
    startButton.disabled = true;
    resetButton.disabled = false;
    autoSolveButton.disabled = true;
    numDiscsInput.disabled = false;

    // Affichage du modal de victoire
    finalMovesSpan.textContent = currentMoves;
    const optimal = currentMoves === minRequiredMoves;

    optimalityMessage.textContent = optimal
      ? "C'est parfait ! Vous avez atteint le nombre de coups minimal."
      : `Le nombre de coups minimal est ${minRequiredMoves}. Vous pouvez faire mieux !`;

    winModal.style.display = "flex";
  }
}

// --- ALGORITHME RÉCURSIF DE HANOÏ ---

/**
 * Algorithme récursif pour résoudre les Tours de Hanoï.
 * Il génère une séquence de mouvements stockée dans `moveQueue`.
 * @param {number} n - Nombre de disques à déplacer.
 * @param {number} source - Index de la tour source (0, 1, 2).
 * @param {number} destination - Index de la tour destination (0, 1, 2).
 * @param {number} auxiliary - Index de la tour auxiliaire (0, 1, 2).
 */
function hanoiSolver(n, source, destination, auxiliary) {
  if (n === 0) return;

  // 1. Déplacer n-1 disques de la source vers l'auxiliaire
  hanoiSolver(n - 1, source, auxiliary, destination);

  // 2. Déplacer le plus grand disque restant de la source vers la destination
  moveQueue.push({
    from: source,
    to: destination,
  });

  // 3. Déplacer n-1 disques de l'auxiliaire vers la destination
  hanoiSolver(n - 1, auxiliary, destination, source);
}

/**
 * Lance la résolution automatique en utilisant la file d'attente.
 */
function startAutoSolve() {
  if (!gameInProgress) return;

  isAutoSolving = true;
  startButton.disabled = true;
  resetButton.disabled = true;
  autoSolveButton.disabled = true;
  numDiscsInput.disabled = true;

  // 1. Recalculer l'état initial (important en cas de partie déjà commencée)
  initializeGame(); // Remet tous les disques sur la tour 1.

  // 2. Générer la séquence de mouvements
  hanoiSolver(numDiscs, 0, 2, 1); // De la tour 1 (index 0) à la tour 3 (index 2), via la tour 2 (index 1)

  // 3. Exécuter les mouvements
  executeNextMove();
}

/**
 * Exécute le mouvement suivant dans la file d'attente avec un délai.
 */
function executeNextMove() {
  if (moveQueue.length === 0) {
    isAutoSolving = false;
    checkWinCondition(); // Déclenche la notification de victoire
    return;
  }

  const move = moveQueue.shift();
  const sourceTower = TOWERS[move.from];
  const targetTower = TOWERS[move.to];
  const discToMove = sourceTower.querySelector(".disc:last-child");

  if (discToMove) {
    moveDisc(sourceTower, targetTower, discToMove, true);

    // Délai pour l'animation visuelle (doit être > vitesse de transition CSS)
    setTimeout(executeNextMove, 400);
  }
}

// --- GESTION DES ÉVÉNEMENTS ---

// 1. Initialisation / Démarrage
startButton.addEventListener("click", initializeGame);

// 2. Réinitialisation (revient à l'état "avant démarrer")
resetButton.addEventListener("click", () => {
  TOWERS.forEach(
    (t) => (t.innerHTML = `<div class="base">Tour ${t.id.slice(-1)}</div>`)
  );
  gameInProgress = false;
  currentMoves = 0;
  minRequiredMoves = calculateMinMoves(parseInt(numDiscsInput.value));
  updateScoreDisplay();
  startButton.disabled = false;
  resetButton.disabled = true;
  autoSolveButton.disabled = true;
  numDiscsInput.disabled = false;
  winModal.style.display = "none";
});

// 3. Clic sur les tours pour jouer
TOWERS.forEach((tower) => {
  tower.addEventListener("click", handleTowerClick);
});

// 4. Résolution automatique
autoSolveButton.addEventListener("click", startAutoSolve);

// 5. Fermeture du modal (et réinitialisation pour rejouer)
closeModalButton.addEventListener("click", () => {
  winModal.style.display = "none";
  // Réinitialisation pour permettre de rejouer
  document.getElementById("resetButton").click();
});

// 6. Gestion du thème clair/sombre
toggleThemeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
});

// 7. Mise à jour du score minimal lors du changement du nombre d'anneaux
numDiscsInput.addEventListener("change", () => {
  numDiscs = parseInt(numDiscsInput.value);
  numDiscsInput.value = Math.min(8, Math.max(3, numDiscs)); // Validation visuelle
  minRequiredMoves = calculateMinMoves(numDiscs);
  minMovesSpan.textContent = minRequiredMoves;
});

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialiser les valeurs du score min au chargement
  numDiscs = parseInt(numDiscsInput.value);
  minRequiredMoves = calculateMinMoves(numDiscs);
  updateScoreDisplay();
  // Assurer le bon état initial des boutons
  startButton.disabled = false;
  resetButton.disabled = true;
  autoSolveButton.disabled = true;
});
