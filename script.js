// ===== ABLAVI STORE - script.js CORRIGÉ =====
// Numéro officiel pour recevoir les commandes
const NUMERO_ABLAVI = "2250101538258";
const FRAIS_LIVRAISON = 1000;

const produits = [
 
  { id: 16, nom: "Sac à Main Noir Chic", prix: 15000, categorie: "sac", stock: 5, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" },
  { id: 19, nom: "Bracelet Perles", prix: 4000, categorie: "bracelet", stock: 0, image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500" },
  { id: 20, nom: "Montre Femme Dorée", prix: 10000, categorie: "autre", stock: 4, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500" }
];

let panier = [];
let quantitesChoisies = {};
let produitsAdmin = JSON.parse(localStorage.getItem("mesProduits")) || [];
let tousProduits = produits.concat(produitsAdmin);
let reductionAppliquee = 0;
let codePromoUtilise = "";

function getStock(p) {
  let s = JSON.parse(localStorage.getItem("stocksABLAVI")) || {};
  if (s[p.id] !== undefined) return s[p.id];
  return p.stock;
}
function setStock(id, nouveauStock) {
  let s = JSON.parse(localStorage.getItem("stocksABLAVI")) || {};
  s[id] = nouveauStock;
  localStorage.setItem("stocksABLAVI", JSON.stringify(s));
}

function afficherProduits(liste) {
  const zone = document.getElementById("liste-produits");
  if (!zone) return;
  zone.innerHTML = "";
  liste.forEach(p => {
    let stockActuel = getStock(p);
    let enRupture = stockActuel === 0;
    let qte = quantitesChoisies[p.id] || 1;
    let texteStock = enRupture ? `<p style="color:red; font-weight:bold;">❌ Stock épuisé</p>` : `<p style="color:green; font-size:13px;">✅ En stock : ${stockActuel}</p>`;
    let styleImage = enRupture ? `style="opacity:0.5; filter:grayscale(1);"` : "";
    let zoneQuantite = enRupture ? "" : `<div style="display:flex; align-items:center; justify-content:center; gap:10px; margin:8px 0;"><button onclick="changerQuantite(${p.id}, -1, event)" style="width:30px; height:30px; border-radius:50%; border:1px solid #ddd; background:white; cursor:pointer; font-weight:bold;">-</button><span id="qte-${p.id}" style="font-weight:bold;">${qte}</span><button onclick="changerQuantite(${p.id}, 1, event)" style="width:30px; height:30px; border-radius:50%; border:1px solid #ddd; background:#FF69B4; color:white; cursor:pointer; font-weight:bold;">+</button></div>`;
    let bouton = enRupture ? `<button onclick="alertStockEpuise('${p.nom}')" style="background:#999; cursor:not-allowed;">Stock épuisé !</button>` : `<button onclick="ajouterPanier(${p.id})">Ajouter au panier</button>`;
    zone.innerHTML += `<div class="carte"><img src="${p.image}" alt="${p.nom}" ${styleImage} onclick="verifierStock(${p.id})"><h3>${p.nom}</h3><p class="prix">${p.prix} F CFA</p>${texteStock}${zoneQuantite}${bouton}</div>`;
  });
}

function changerQuantite(id, delta, event) {
  if (event) event.stopPropagation();
  let produit = tousProduits.find(p => p.id === id);
  let stockActuel = getStock(produit);
  let actuelle = quantitesChoisies[id] || 1;
  let nouvelle = actuelle + delta;
  if (nouvelle < 1) nouvelle = 1;
  if (nouvelle > stockActuel) {
    alert("⚠️ Il ne reste que " + stockActuel + " en stock pour " + produit.nom);
    nouvelle = stockActuel;
  }
  quantitesChoisies[id] = nouvelle;
  let span = document.getElementById("qte-" + id);
  if (span) span.textContent = nouvelle;
}

function verifierStock(id) {
  const produit = tousProduits.find(p => p.id === id);
  if (produit && getStock(produit) === 0) alert("❌ Désolé, " + produit.nom + " : Stock épuisé !");
}
function alertStockEpuise(nom) {
  alert("❌ Désolé, " + nom + " : Stock épuisé !\nReviens bientôt, on va restocker.");
}
function filtrer(categorie) {
  if (categorie === "tout") afficherProduits(tousProduits);
  else afficherProduits(tousProduits.filter(p => p.categorie === categorie));
  let sec = document.getElementById("produits");
  if (sec) sec.scrollIntoView({ behavior: "smooth" });
}
function rechercher() {
  const mot = document.getElementById("recherche").value.toLowerCase();
  afficherProduits(tousProduits.filter(p => p.nom.toLowerCase().includes(mot)));
}
function ajouterPanier(id) {
  const produit = tousProduits.find(p => p.id === id);
  let stockActuel = getStock(produit);
  if (stockActuel === 0) { alert("❌ Stock épuisé pour " + produit.nom + " !"); return; }
  let qteVoulue = quantitesChoisies[id] || 1;
  let deja = panier.find(item => item.produit.id === id);
  let totalVoulu = qteVoulue + (deja ? deja.quantite : 0);
  if (totalVoulu > stockActuel) { alert("⚠️ Tu ne peux pas commander " + totalVoulu + ", il ne reste que " + stockActuel + " en stock !"); return; }
  if (deja) deja.quantite += qteVoulue;
  else panier.push({ produit: produit, quantite: qteVoulue });
  mettreAJourNbPanier();
  alert(produit.nom + " x" + qteVoulue + " ajouté !");
  quantitesChoisies[id] = 1;
  afficherProduits(tousProduits);
}
function mettreAJourNbPanier() {
  let totalQte = panier.reduce((s, item) => s + item.quantite, 0);
  let el = document.getElementById("nb-panier");
  if (el) el.textContent = totalQte;
}
function afficherPanier() {
  const modal = document.getElementById("panier-modal");
  const contenu = document.getElementById("contenu-panier");
  modal.style.display = "block";
  let msgP = document.getElementById("message-paiement");
  if (msgP) msgP.style.display = "none";
  if (panier.length === 0) {
    contenu.innerHTML = "<p>Panier vide</p>";
    document.getElementById("sous-total").textContent = 0;
    document.getElementById("total-panier").textContent = 0;
    return;
  }
  contenu.innerHTML = panier.map((item, index) => `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:8px 0;"><div><strong>${item.produit.nom}</strong><br><small>${item.produit.prix} F x ${item.quantite} = <strong>${item.produit.prix * item.quantite} F</strong></small></div><div style="display:flex; align-items:center; gap:5px;"><button onclick="changerQtePanier(${index}, -1)" style="width:25px; height:25px; border-radius:50%; border:1px solid #ddd; background:white; cursor:pointer;">-</button><span>${item.quantite}</span><button onclick="changerQtePanier(${index}, 1)" style="width:25px; height:25px; border-radius:50%; border:1px solid #ddd; background:#FF69B4; color:white; cursor:pointer;">+</button><button onclick="retirerArticle(${index})" style="background:red; color:white; border:none; padding:2px 8px; border-radius:10px; cursor:pointer; margin-left:5px;">X</button></div></div>`).join("");
  mettreAJourTotalPanier();
}
function changerQtePanier(index, delta) {
  let item = panier[index];
  let nouvelle = item.quantite + delta;
  if (nouvelle < 1) { retirerArticle(index); return; }
  if (nouvelle > getStock(item.produit)) { alert("⚠️ Stock max : " + getStock(item.produit)); return; }
  item.quantite = nouvelle;
  mettreAJourNbPanier();
  afficherPanier();
}
function retirerArticle(index) {
  panier.splice(index, 1);
  mettreAJourNbPanier();
  afficherPanier();
}
function fermerPanier() { document.getElementById("panier-modal").style.display = "none"; }
function voirConditions() { document.getElementById("conditions-modal").style.display = "block"; }
function fermerConditions() { document.getElementById("conditions-modal").style.display = "none"; }
function appliquerPromo() {
  let code = document.getElementById("code-promo").value.trim().toUpperCase();
  let promos = JSON.parse(localStorage.getItem("promosABLAVI")) || [];
  let trouve = promos.find(p => p.code === code && p.actif);
  let msg = document.getElementById("message-promo");
  if (!trouve) {
    msg.textContent = "❌ Code invalide ou désactivé";
    msg.style.color = "red";
    reductionAppliquee = 0;
    codePromoUtilise = "";
    mettreAJourTotalPanier();
    document.getElementById("ligne-reduction").style.display = "none";
    return;
  }
  let sousTotal = panier.reduce((s, item) => s + (item.produit.prix * item.quantite), 0);
  if (trouve.type === "pourcent") reductionAppliquee = Math.round(sousTotal * trouve.valeur / 100);
  else reductionAppliquee = trouve.valeur;
  codePromoUtilise = code;
  msg.textContent = "✅ Code " + code + " appliqué ! Tu économises " + reductionAppliquee + " F";
  msg.style.color = "green";
  document.getElementById("ligne-reduction").style.display = "block";
  document.getElementById("montant-reduction").textContent = reductionAppliquee;
  mettreAJourTotalPanier();
}
function mettreAJourTotalPanier() {
  let sousTotal = panier.reduce((s, item) => s + (item.produit.prix * item.quantite), 0);
  let elSous = document.getElementById("sous-total");
  if (elSous) elSous.textContent = sousTotal;
  let elTotal = document.getElementById("total-panier");
  if (elTotal) elTotal.textContent = sousTotal + FRAIS_LIVRAISON - reductionAppliquee;
  let elFrais = document.getElementById("frais-livraison");
  if (elFrais) elFrais.textContent = FRAIS_LIVRAISON;
}

function payerCommande() {
  if (panier.length === 0) { alert("Ton panier est vide !"); return; }
  let nom = document.getElementById("client-nom").value.trim();
  let whatsapp = document.getElementById("client-whatsapp").value.trim();
  let commune = document.getElementById("client-commune").value.trim();
  if (!nom || !whatsapp || !commune) { alert("⚠️ Remplis ton nom, ton WhatsApp et ta commune avant de payer !"); return; }
  let accepte = document.getElementById("accepter-conditions").checked;
  if (!accepte) { alert("⚠️ Tu dois cocher 'J'accepte les conditions de paiement' pour payer !"); return; }
  let mode = document.querySelector('input[name="paiement"]:checked').value;
  let sousTotal = panier.reduce((s, item) => s + (item.produit.prix * item.quantite), 0);
  let total = sousTotal + FRAIS_LIVRAISON - reductionAppliquee;
  if (total < 0) total = 0;
  let totalArticles = panier.reduce((s, item) => s + item.quantite, 0);
  let numeroCommande = "ABLAVI-" + Math.floor(Math.random() * 9000 + 1000);

  // 1. Enregistre la commande pour Suivi + Admin (sur cet appareil)
  let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
  commandes.push({
    numero: numeroCommande,
    nom: nom,
    whatsapp: whatsapp,
    commune: commune,
    mode: mode,
    total: total,
    promo: codePromoUtilise,
    articles: panier.map(i => i.produit.nom + " x" + i.quantite),
    statut: "En préparation",
    date: new Date().toLocaleString()
  });
  localStorage.setItem("commandes", JSON.stringify(commandes));

  // 2. Diminue le stock
  panier.forEach(item => {
    let stockActuel = getStock(item.produit);
    let nouveau = stockActuel - item.quantite;
    if (nouveau < 0) nouveau = 0;
    setStock(item.produit.id, nouveau);
  });

  // 3. Message de confirmation dans le panier
  let zone = document.getElementById("message-paiement");
  zone.style.display = "block";
  zone.innerHTML = `<strong>✅ Commande enregistrée !</strong><br>Commande n° : <strong>${numeroCommande}</strong><br>Client : ${nom} (${whatsapp})<br>Livraison : ${commune}<br>Articles : ${totalArticles} - Total : <strong>${total} F CFA</strong><br>Mode : ${mode} ${codePromoUtilise ? "| Promo : " + codePromoUtilise : ""}<br><br>On ouvre WhatsApp pour envoyer ta commande à ABLAVI STORE...`;

  // 4. Envoie la commande sur TON WhatsApp : 01 01 53 82 58
  let texteWhatsApp = "🛍️ NOUVELLE COMMANDE ABLAVI STORE\n\n";
  texteWhatsApp += "Commande n° : " + numeroCommande + "\n";
  texteWhatsApp += "👤 Nom : " + nom + "\n";
  texteWhatsApp += "📱 WhatsApp cliente : " + whatsapp + "\n";
  texteWhatsApp += "📍 Commune : " + commune + "\n";
  texteWhatsApp += "💳 Paiement : " + mode + "\n";
  if (codePromoUtilise) texteWhatsApp += "🎁 Promo : " + codePromoUtilise + " (-" + reductionAppliquee + " F)\n";
  texteWhatsApp += "\n🛍️ ARTICLES :\n";
  texteWhatsApp += panier.map(i => "- " + i.produit.nom + " x" + i.quantite + " = " + (i.produit.prix * i.quantite) + " F").join("\n");
  texteWhatsApp += "\n\nSous-total : " + sousTotal + " F";
  texteWhatsApp += "\nLivraison : " + FRAIS_LIVRAISON + " F";
  if (reductionAppliquee > 0) texteWhatsApp += "\nRéduction : -" + reductionAppliquee + " F";
  texteWhatsApp += "\n💰 TOTAL À PAYER : " + total + " F CFA";

  // Vide le panier
  let panierCopie = [...panier];
  panier = [];
  reductionAppliquee = 0;
  codePromoUtilise = "";
  mettreAJourNbPanier();
  document.getElementById("accepter-conditions").checked = false;
  document.getElementById("client-nom").value = "";
  document.getElementById("client-whatsapp").value = "";
  document.getElementById("client-commune").value = "";
  document.getElementById("code-promo").value = "";
  document.getElementById("message-promo").textContent = "";
  document.getElementById("ligne-reduction").style.display = "none";

  setTimeout(() => {
    afficherProduits(tousProduits);
    // Ouvre WhatsApp vers TOI
    window.open("https://wa.me/" + NUMERO_ABLAVI + "?text=" + encodeURIComponent(texteWhatsApp), "_blank");
  }, 800);
}

afficherProduits(tousProduits);