document.addEventListener("DOMContentLoaded", () => {
  const nombreDisquesInput = document.getElementById("nombreDisques");
  const demarrerBouton = document.getElementById("demarrerJeu");

  demarrerBouton.addEventListener("click", () => {
    const nombre = nombreDisquesInput.value;
    // Ceci est juste pour tester que le bouton fonctionne
    console.log(`Démarrage du jeu avec ${nombre} disques.`);
    // Les fonctions pour générer les disques seront ajoutées ici à l'étape 2
  });
});
