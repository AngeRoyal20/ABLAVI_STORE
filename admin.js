const API = "https://script.google.com/macros/s/AKfycbxwP4OEqaDTnl__uRGkhABDKdbL7In6FpFrZpP-wkJi1ltLQAbi1GzV1k58LJ0HTcM/exec";
const MDP = "ablavi123";

let produits = [];
let commandes = [];
let promos = [];

// On ne touche plus au localStorage, tout vient du Sheet maintenant

function verifierMdp(){
  let mdp = document.getElementById("mdp").value;
  if(mdp === MDP){
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").classList.remove("admin-cache");
    chargerTout();
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

// ===== LIEN AVEC LE SHEET =====
async function chargerTout(){
  // 1. Produits depuis le Sheet
  try{
    let r = await fetch(API);
    let data = await r.json();
    // Si Apps Script renvoie un tableau direct, ou {produits: [...]}
    produits = Array.isArray(data) ? data : (data.produits || []);
  }catch(e){ produits = []; }

  // 2. Commandes depuis le Sheet
  try{
    let r2 = await fetch(API + "?type=commandes");
    let data2 = await r2.json();
    commandes = Array.isArray(data2) ? data2 : (data2.commandes || []);
  }catch(e){ commandes = []; }

  mettreAJourDashboard();
  afficherStock();
  afficherCommandes();
  afficherMesProduits();
  afficherPromos();
}

function mettreAJourDashboard(){
  let epuises = produits.filter(p=> Number(p.stock) <= 0).length;
  let totalVentes = commandes.reduce((a,b)=> a + (Number(b.total)||0), 0);
  
  document.getElementById("dash-ventes").textContent = totalVentes + " F";
  document.getElementById("dash-commandes").textContent = commandes.length;
  document.getElementById("dash-produits").textContent = produits.length;
  document.getElementById("dash-epuises").textContent = epuises;
  document.getElementById("nb-commandes").textContent = commandes.length;
  document.getElementById("top-produit").textContent = produits.length ? produits[0].nom : "Aucun produit";
  document.getElementById("dernieres-commandes").innerHTML = commandes.length ? commandes.slice(-3).reverse().map(c=>`<p>${c.idCommande || c.id} - ${c.nomClient || c.nom} - ${c.total} F</p>`).join("") : "Aucune commande";
}

function afficherStock(){
  let zone = document.getElementById("liste-admin");
  if(!zone) return;
  if(!produits.length){ zone.innerHTML = "<p>Stock vide. Vérifie ton Sheet.</p>"; return; }
  zone.innerHTML = produits.map(p=>`
    <div style="display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;padding:10px;margin:5px 0;border-radius:8px">
      <div><b>${p.nom}</b><br>${p.prix} F - Stock: ${p.stock} - ${p.categorie || ""}</div>
      <button onclick="supprimerProduit('${p.id}')" style="background:red;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">Supprimer</button>
    </div>`).join("");
}

function afficherMesProduits(){
  let zone = document.getElementById("liste-mes-produits");
  if(!zone) return;
  zone.innerHTML = produits.length ? produits.map(p=>`<p>${p.nom} - ${p.stock} en stock</p>`).join("") : "<p>Aucun produit.</p>";
}

function afficherCommandes(){
  let zone = document.getElementById("liste-commandes");
  if(!zone) return;
  if(!commandes.length){ zone.innerHTML = "<p>Aucune commande</p>"; return; }
  zone.innerHTML = commandes.map(c=>`<p><b>${c.idCommande || c.id}</b> - ${c.nomClient || c.nom} - ${c.produits} - ${c.total} F - ${c.paiement || ""}</p>`).join("");
}

// ===== AJOUTER / SUPPRIMER DANS LE SHEET =====
async function ajouterProduit(){
  let nom = document.getElementById("nom").value;
  let prix = document.getElementById("prix").value;
  let ancienPrix = document.getElementById("ancien-prix").value || 0;
  let categorie = document.getElementById("categorie").value;
  let image = document.getElementById("image").value;
  let description = document.getElementById("description").value;
  let stock = document.getElementById("stock").value || 0;
  if(!nom || !prix){ alert("Mets nom et prix"); return; }
  await fetch(API,{method:"POST", body: JSON.stringify({type:"ajoutProduit", nom, prix, ancienPrix, categorie, image, description, stock})});
  alert("Produit ajouté au Sheet !");
  // On vide le formulaire
  document.getElementById("nom").value = "";
  document.getElementById("prix").value = "";
  chargerTout();
}

async function supprimerProduit(id){
  if(!confirm("Supprimer ce produit du Sheet ?")) return;
  await fetch(API,{method:"POST", body: JSON.stringify({type:"supprimerProduit", id})});
  chargerTout();
}

function creerPromo(){
  alert("Promos : on fera après, d'abord produits.");
}

function afficherPromos(){
  let zone = document.getElementById("liste-promos");
  if(!zone) return;
  zone.innerHTML = "<p>Aucune promo</p>";
}
