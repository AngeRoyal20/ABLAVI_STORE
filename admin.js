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
  ["dashboard","stock","commandes","promos"].forEach(id=> document.getElementById("onglet-"+id).classList.add("onglet-cache"));
  document.getElementById("onglet-"+nom).classList.remove("onglet-cache");
}

async function chargerTout(){
  try{
    let r = await fetch(API);
    let data = await r.json();
    if(Array.isArray(data)){ produits=data; commandes=[]; }
    else { produits=data.produits||[]; commandes=data.commandes||[]; }
  }catch(e){ produits=[]; commandes=[]; }
  let epuises = produits.filter(p=> Number(p.stock)<=0).length;
  let totalVentes = commandes.reduce((a,b)=> a + (Number(b.total)||0),0);
  let set=(id,v)=>{let el=document.getElementById(id); if(el) el.textContent=v;};
  set("dash-ventes", totalVentes+" F"); set("dash-commandes", commandes.length);
  set("dash-produits", produits.length); set("dash-epuises", epuises);
  set("nb-commandes", commandes.length);
  let der=document.getElementById("dernieres-commandes");
  if(der) der.innerHTML = commandes.length ? commandes.slice(-3).reverse().map(c=>`<p>${c.idCommande} - ${c.nomClient} - ${c.total} F</p>`).join("") : "Aucune commande";
  afficherStock(); afficherCommandes();
}

function afficherStock(){
  let zone=document.getElementById("liste-admin");
  if(!zone) return;
  if(!produits.length){ zone.innerHTML="<p>Stock vide.</p>"; return; }
  zone.innerHTML = produits.map(p=>`
    <div class="carte" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div><b>${p.nom}</b><br>${p.prix} F - ${p.categorie}</div>
      <div style="display:flex;align-items:center;gap:6px">
        <button class="btn-moins" onclick="changerStock('${p.id}', -1)">-</button>
        <b>Stock: ${p.stock}</b>
        <button class="btn-plus" onclick="changerStock('${p.id}', 1)">+</button>
      </div>
      <div style="display:flex;gap:5px;align-items:center">
        <input type="number" id="restock-${p.id}" value="10" min="1" style="width:65px">
        <button class="btn-restock" onclick="restockerChoisir('${p.id}')">Restocker</button>
      </div>
      <button class="btn-suppr" onclick="supprimerProduit('${p.id}')">Supprimer</button>
    </div>`).join("");
}

async function changerStock(id, delta){
  // GET au lieu de POST = Google ne bloque plus
  await fetch(API + "?action=updateStock&id=" + id + "&delta=" + delta);
  setTimeout(chargerTout, 1200);
}

async function restockerChoisir(id){
  let qte = Number(document.getElementById("restock-"+id).value)||0;
  if(qte<=0){ alert("Mets un nombre, ex: 10"); return; }
  await fetch(API + "?action=updateStock&id=" + id + "&delta=" + qte);
  alert("Restock +"+qte+" envoyé ! Attends 2 secondes.");
  setTimeout(chargerTout, 1500);
}

async function supprimerProduit(id){
  if(!confirm("Supprimer ?")) return;
  await fetch(API + "?action=supprimer&id=" + id);
  setTimeout(chargerTout, 1200);
}

function afficherCommandes(){
  let zone=document.getElementById("liste-commandes");
  if(!zone) return;
  if(!commandes.length){ zone.innerHTML="<p>Aucune commande</p>"; return; }
  zone.innerHTML = commandes.map(c=>`<div class="carte"><b>${c.idCommande}</b> - ${c.nomClient}<br>${c.produits} - <b>${c.total} F</b></div>`).join("");
}
function afficherPromos(){
  let zone=document.getElementById("liste-promos");
  if(zone) zone.innerHTML="<p>Aucune promo</p>";
}
