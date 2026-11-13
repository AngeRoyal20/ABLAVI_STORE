const API = "https://script.google.com/macros/s/AKfycbxwP4OEqaDTnl__uRGkhABDKdbL7In6FpFrZpP-wkJi1ltLQAbi1GzV1k58LJ0HTcM/exec";
const MDP = "ablavi123";
let produits = [];
let commandes = [];

function verifierMdp(){
  let mdp = document.getElementById("mdp").value;
  if(mdp === MDP){
    document.getElementById("login").style.display = "none";
    document.getElementById("admin").classList.remove("admin-cache");
    chargerTout();
  } else alert("Mot de passe incorrect");
}

function montrerOnglet(nom, btn){
  document.querySelectorAll(".onglet").forEach(b=>b.classList.remove("actif"));
  if(btn) btn.classList.add("actif");
  ["dashboard","stock","commandes","ajout","promos"].forEach(id=>{
    let el = document.getElementById("onglet-"+id);
    if(el) el.classList.add("onglet-cache");
  });
  let cible = document.getElementById("onglet-"+nom);
  if(cible) cible.classList.remove("onglet-cache");
}

async function chargerTout(){
  try{
    let r = await fetch(API);
    let data = await r.json();
    // Nouveau format : {produits, commandes} OU ancien format : tableau
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
  set("top-produit", produits.length ? produits[0].nom : "Aucun produit");
  
  let der = document.getElementById("dernieres-commandes");
  if(der){
    if(!commandes.length) der.innerHTML = "Aucune commande";
    else der.innerHTML = commandes.slice(-3).reverse().map(c=>`<p>${c.idCommande} - ${c.nomClient} - ${c.total} F</p>`).join("");
  }
  afficherStock();
  afficherCommandes();
  afficherMesProduits();
}

// ===== STOCK AVEC + / - =====
function afficherStock(){
  let zone = document.getElementById("liste-admin");
  if(!zone) return;
  if(!produits.length){ zone.innerHTML="<p>Stock vide.</p>"; return; }
  zone.innerHTML = produits.map(p=>`
    <div style="display:flex;justify-content:space-between;align-items:center;border:1px solid #eee;padding:10px;margin:5px 0;border-radius:8px;flex-wrap:wrap;gap:8px">
      <div><b>${p.nom}</b><br>${p.prix} F - ${p.categorie}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <button onclick="changerStock('${p.id}', -1)" style="width:32px;height:32px;border-radius:50%;border:1px solid #ddd;cursor:pointer;font-size:18px">-</button>
        <b>Stock: ${p.stock}</b>
        <button onclick="changerStock('${p.id}', 1)" style="width:32px;height:32px;border-radius:50%;background:#ff5a8a;color:#fff;border:none;cursor:pointer;font-size:18px">+</button>
      </div>
      <button onclick="supprimerProduit('${p.id}')" style="background:red;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer">Supprimer</button>
    </div>`).join("");
}

async function changerStock(id, delta){
  await fetch(API,{method:"POST", body: JSON.stringify({type:"updateStock", id, delta})});
  chargerTout();
}

function afficherMesProduits(){
  let zone = document.getElementById("liste-mes-produits");
  if(!zone) return;
  zone.innerHTML = produits.length ? produits.map(p=>`<p>${p.nom} - ${p.stock} en stock</p>`).join("") : "<p>Aucun produit.</p>";
}

function afficherCommandes(){
  let zone = document.getElementById("liste-commandes");
  if(!zone) return;
  if(!commandes.length){ zone.innerHTML="<p>Aucune commande pour le moment</p>"; return; }
  zone.innerHTML = commandes.map(c=>`<p><b>${c.idCommande}</b> - ${c.nomClient} (${c.telephone})<br>${c.produits} - <b>${c.total} F</b> - ${c.paiement}</p><hr>`).join("");
}

// ===== AJOUTER - marche même si les id dans admin.html sont différents =====
function getVal(...ids){
  for(let id of ids){
    let el = document.getElementById(id);
    if(el && el.value) return el.value;
  }
  // Cherche par placeholder si pas d'id
  return "";
}

async function ajouterProduit(){
  let nom = getVal("nom","nouveau-nom","nom-produit") || document.querySelector('#onglet-ajout input[placeholder*="Nom" i]')?.value || "";
  let prix = getVal("prix","nouveau-prix") || document.querySelectorAll('#onglet-ajout input')[1]?.value || "";
  let ancienPrix = getVal("ancien-prix","ancienPrix") || 0;
  let categorie = getVal("categorie","nouvelle-categorie") || document.querySelector('#onglet-ajout select')?.value || "";
  let stock = getVal("stock","nouveau-stock") || 0;
  let image = getVal("image","nouvelle-image") || "";
  let description = getVal("description","nouvelle-description") || "";

  // Si le formulaire utilise des inputs sans id, on prend dans l'ordre
  let inputs = document.querySelectorAll('#onglet-ajout input');
  if(!nom && inputs[0]) nom = inputs[0].value;
  if(!prix && inputs[1]) prix = inputs[1].value;

  if(!nom || !prix){ alert("Mets au moins le nom et le prix"); return; }
  await fetch(API,{method:"POST", body: JSON.stringify({type:"ajoutProduit", nom, prix, ancienPrix, categorie, image, description, stock})});
  alert("Produit ajouté au Sheet !");
  // Vide les champs
  document.querySelectorAll('#onglet-ajout input').forEach(i=> i.value="");
  let ta = document.querySelector('#onglet-ajout textarea'); if(ta) ta.value="";
  chargerTout();
}

async function supprimerProduit(id){
  if(!confirm("Supprimer ce produit ?")) return;
  await fetch(API,{method:"POST", body: JSON.stringify({type:"supprimerProduit", id})});
  chargerTout();
}

function creerPromo(){ alert("Promos : après."); }
function afficherPromos(){
  let zone = document.getElementById("liste-promos");
  if(zone) zone.innerHTML="<p>Aucune promo</p>";
}
