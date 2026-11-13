const API = "https://script.google.com/macros/s/AKfycbxwP4OEqaDTnl__uRGkhABDKdbL7In6FpFrZpP-wkJi1ltLQAbi1GzV1k58LJ0HTcM/exec";
const MDP = "ablavi123";
let produits = [];
let commandes = [];

function verifierMdp(){
  if(document.getElementById("mdp").value === MDP){
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").classList.remove("admin-cache");
    chargerTout();
  } else alert("Mot de passe incorrect");
}

function montrerOnglet(nom, btn){
  document.querySelectorAll(".onglet-btn").forEach(b=>b.classList.remove("actif"));
  if(btn) btn.classList.add("actif");
  ["dashboard","stock","commandes","ajout","promos"].forEach(id=>{
    document.getElementById("onglet-"+id).classList.add("onglet-cache");
  });
  document.getElementById("onglet-"+nom).classList.remove("onglet-cache");
}

async function chargerTout(){
  try{
    let r = await fetch(API);
    let data = await r.json();
    if(Array.isArray(data)){ produits = data; commandes = []; }
    else { produits = data.produits || []; commandes = data.commandes || []; }
  }catch(e){ produits=[]; commandes=[]; }

  let epuises = produits.filter(p=> Number(p.stock)<=0).length;
  let totalVentes = commandes.reduce((a,b)=> a + (Number(b.total)||0), 0);
  let set = (id,v)=>{ let el=document.getElementById(id); if(el) el.textContent=v; };
  set("dash-ventes", totalVentes + " F");
  set("dash-commandes", commandes.length);
  set("dash-produits", produits.length);
  set("dash-epuises", epuises);
  set("nb-commandes", commandes.length);
  set("top-produit", produits.length ? produits[0].nom : "-");
  let der = document.getElementById("dernieres-commandes");
  if(der) der.innerHTML = commandes.length ? commandes.slice(-3).reverse().map(c=>`<p>${c.idCommande} - ${c.nomClient} - ${c.total} F</p>`).join("") : "Aucune commande";
  afficherStock();
  afficherCommandes();
  afficherMesProduits();
}

// Envoi corrigé pour Google : text/plain sinon POST bloqué
async function envoyer(data){
  await fetch(API, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify(data)});
}

function afficherStock(){
  let zone = document.getElementById("liste-admin");
  if(!zone) return;
  if(!produits.length){ zone.innerHTML="<p>Stock vide.</p>"; return; }
  zone.innerHTML = produits.map(p=>`
    <div class="carte" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div><b>${p.nom}</b><br>${p.prix} F - ${p.categorie}<br><small>ID: ${p.id}</small></div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-moins" onclick="changerStock('${p.id}', -1)">-</button>
        <b>Stock: ${p.stock}</b>
        <button class="btn-plus" onclick="changerStock('${p.id}', 1)">+</button>
      </div>
      <button class="btn-restock" onclick="changerStock('${p.id}', 10)">Restocker +10</button>
      <button class="btn-suppr" onclick="supprimerProduit('${p.id}')">Supprimer</button>
    </div>`).join("");
}

async function changerStock(id, delta){
  await envoyer({type:"updateStock", id, delta});
  // Petite pause pour laisser le Sheet écrire
  setTimeout(chargerTout, 800);
}

function afficherMesProduits(){
  let zone = document.getElementById("liste-mes-produits");
  if(zone) zone.innerHTML = produits.length ? produits.map(p=>`<p>${p.nom} - ${p.stock} en stock</p>`).join("") : "<p>Aucun produit.</p>";
}

function afficherCommandes(){
  let zone = document.getElementById("liste-commandes");
  if(!zone) return;
  if(!commandes.length){ zone.innerHTML="<p>Aucune commande</p>"; return; }
  zone.innerHTML = commandes.map(c=>`<div class="carte"><b>${c.idCommande}</b> - ${c.nomClient} (${c.telephone})<br>${c.produits} - <b>${c.total} F</b> - ${c.paiement}</div>`).join("");
}

async function ajouterProduit(){
  let nom = document.getElementById("nom").value.trim();
  let prix = document.getElementById("prix").value;
  let ancienPrix = document.getElementById("ancien-prix").value || 0;
  let categorie = document.getElementById("categorie").value;
  let stock = document.getElementById("stock").value || 0;
  let image = document.getElementById("image").value;
  let description = document.getElementById("description").value;

  if(!nom || !prix){ alert("Mets nom et prix"); return; }

  // ID = automatique dans Apps Script avec Date.now()
  await envoyer({type:"ajoutProduit", nom, prix, ancienPrix, categorie, image, description, stock});
  alert("Produit ajouté ! Il va apparaître dans le Sheet + sur le site + dans Stock.");
  ["nom","prix","ancien-prix","stock","image","description"].forEach(id=> document.getElementById(id).value="");
  setTimeout(chargerTout, 1000);
}

async function supprimerProduit(id){
  if(!confirm("Supprimer ?")) return;
  await envoyer({type:"supprimerProduit", id});
  setTimeout(chargerTout, 800);
}

function creerPromo(){ alert("Promos après."); }
function afficherPromos(){
  let zone = document.getElementById("liste-promos");
  if(zone) zone.innerHTML="<p>Aucune promo</p>";
}
