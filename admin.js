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
  ["dashboard","commandes","promos"].forEach(id=> document.getElementById("onglet-"+id).classList.add("onglet-cache"));
  document.getElementById("onglet-"+nom).classList.remove("onglet-cache");
}

async function chargerTout(){
  try{
    // CORRIGÉ : ?t= pour éviter le cache, sinon Admin affiche toujours 0
    let r = await fetch(API + "?t=" + Date.now());
    let data = await r.json();
    console.log("Données reçues :", data);

    // CORRIGÉ : On lit les 2 formats, ancien et nouveau
    if(data && data.produits){
      produits = data.produits || [];
      commandes = data.commandes || [];
    } else if(Array.isArray(data)){
      produits = data;
      commandes = [];
    } else {
      produits = [];
      commandes = [];
    }
  }catch(e){ 
    console.log("Erreur chargement", e);
    produits=[]; commandes=[]; 
  }

  let epuises = produits.filter(p=> Number(p.stock)<=0).length;
  let totalVentes = commandes.reduce((a,b)=> a + (Number(b.total)||0),0);
  let set=(id,v)=>{let el=document.getElementById(id); if(el) el.textContent=v;};
  set("dash-ventes", totalVentes+" F");
  set("dash-commandes", commandes.length);
  set("dash-produits", produits.length);
  set("dash-epuises", epuises);
  set("nb-commandes", commandes.length);

  let der=document.getElementById("dernieres-commandes");
  if(der) der.innerHTML = commandes.length ? commandes.slice(-3).reverse().map(c=>`<p>${c.idCommande} - ${c.nomClient} - ${c.total} F</p>`).join("") : "Aucune commande";

  afficherCommandes();
}

function afficherCommandes(){
  let zone=document.getElementById("liste-commandes");
  if(!zone) return;
  if(!commandes.length){ zone.innerHTML="<p>Aucune commande</p>"; return; }
  zone.innerHTML = commandes.map(c=>`<div class="carte"><b>${c.idCommande}</b> - ${c.nomClient} (${c.telephone||""})<br>${c.produits} - <b>${c.total} F</b> - ${c.paiement||""} - ${c.adresse||""}</div>`).join("");
}

function afficherPromos(){
  let zone=document.getElementById("liste-promos");
  if(zone) zone.innerHTML="<p>Aucune promo</p>";
}
