// ADMIN - VERSION VIDE
// On a tout effacé. Aucun produit en dur, aucun produit de test.

const MDP = "ablavi123"; // <-- Si ton mot de passe est différent, change-le ici

let produits = []; // VIDE
let commandes = []; // VIDE
let promos = [];

// On efface aussi les anciens produits qui étaient cachés dans le navigateur
localStorage.removeItem("produits");
localStorage.removeItem("ablavi_produits");
localStorage.removeItem("mesProduits");
localStorage.removeItem("stock");
localStorage.setItem("ablavi_promos", "[]");

function verifierMdp(){
  let mdp = document.getElementById("mdp").value;
  if(mdp === MDP){
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").classList.remove("admin-cache");
    mettreAJourDashboard();
    afficherStock();
    afficherCommandes();
    afficherMesProduits();
    afficherPromos();
  } else {
    alert("Mot de passe incorrect");
  }
}

function montrerOnglet(nom, btn){
  document.querySelectorAll(".onglet").forEach(b=>b.classList.remove("actif"));
  if(btn) btn.classList.add("actif");
  ["dashboard","stock","commandes","ajout","promos"].forEach(id=>{
    document.getElementById("onglet-"+id).classList.add("onglet-cache");
  });
  document.getElementById("onglet-"+nom).classList.remove("onglet-cache");
  if(nom==="stock") afficherStock();
  if(nom==="commandes") afficherCommandes();
  if(nom==="ajout") afficherMesProduits();
  if(nom==="promos") afficherPromos();
}

function mettreAJourDashboard(){
  // Tout est calculé depuis la liste vide = 0 partout
  let totalVentes = 0;
  document.getElementById("dash-ventes").textContent = totalVentes + " F";
  document.getElementById("dash-commandes").textContent = commandes.length;
  document.getElementById("dash-produits").textContent = produits.length; // = 0
  document.getElementById("dash-epuises").textContent = 0; // = 0
  document.getElementById("nb-commandes").textContent = commandes.length;
  document.getElementById("top-produit").textContent = "Aucune vente pour le moment";
  document.getElementById("dernieres-commandes").innerHTML = "Aucune commande";
}

function afficherStock(){
  let zone = document.getElementById("liste-admin");
  if(!zone) return;
  zone.innerHTML = "<p>Stock vide. On va lier avec le Sheet après.</p>";
}

function afficherMesProduits(){
  let zone = document.getElementById("liste-mes-produits");
  if(!zone) return;
  zone.innerHTML = "<p>Aucun produit.</p>";
}

function afficherCommandes(){
  let zone = document.getElementById("liste-commandes");
  if(!zone) return;
  zone.innerHTML = "<p>Aucune commande</p>";
}

function ajouterProduit(){
  alert("On a tout effacé. On va lier avec le Sheet d'abord, après tu pourras ajouter.");
}

function creerPromo(){
  alert("On va lier avec le Sheet d'abord.");
}

function afficherPromos(){
  let zone = document.getElementById("liste-promos");
  if(!zone) return;
  zone.innerHTML = "<p>Aucune promo</p>";
}
