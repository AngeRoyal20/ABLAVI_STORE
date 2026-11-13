const API = "https://script.google.com/macros/s/AKfycbxwP4OEqaDTnl__uRGkhABDKdbL7In6FpFrZpP-wkJi1ltLQAbi1GzV1k58LJ0HTcM/exec";
const WHATSAPP = "2250101538258";
let tousProduits = [];
let produitsAffiches = [];
let panier = [];
let promoAppliquee = 0;
let quantites = {}; // <-- Pour garder le nombre choisi sur chaque produit

// Produits de secours - VIDE : plus de produits de test
const PRODUITS_SECOURS = [];

async function chargerProduits(){
  try{
    let r = await fetch(API);
    let data = await r.json();
    if(data && data.length>0){ tousProduits = data; }
    else { tousProduits = PRODUITS_SECOURS; }
  }catch(e){ tousProduits = PRODUITS_SECOURS; }
  produitsAffiches = tousProduits;
  afficherProduits();
}

function afficherProduits(){
  let zone = document.getElementById("liste-produits");
  if(!zone) return;
  if(!produitsAffiches.length){ zone.innerHTML = "<p>Aucun produit pour le moment.</p>"; return; }
  zone.innerHTML = produitsAffiches.map(p=>{
    let qte = quantites[p.id] || 0;
    return `
    <div class="carte-produit">
      <img src="${p.image}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/300x300?text=ABLAVI'">
      <h3>${p.nom}</h3>
      <p>${p.description||""}</p>
      <p><strong>${p.prix} F CFA</strong> ${p.ancienPrix? `<s>${p.ancienPrix} F CFA</s>`: ""}</p>
      <p style="font-size:12px;color:${p.stock>0?'green':'red'}">${p.stock>0? 'En stock : '+p.stock : 'Rupture'}</p>
      
      <!-- COMPTEUR QUI COMMENCE A 0 -->
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin:10px 0;">
        <button onclick="changerQte(${p.id}, -1)" style="width:35px; height:35px; border-radius:50%; border:1px solid #ff69b4; background:#fff; color:#ff69b4; font-size:20px; font-weight:bold; cursor:pointer;">-</button>
        <span id="qte-${p.id}" style="font-size:18px; font-weight:bold; min-width:25px; text-align:center;">${qte}</span>
        <button onclick="changerQte(${p.id}, 1)" style="width:35px; height:35px; border-radius:50%; border:none; background:#ff69b4; color:#fff; font-size:20px; font-weight:bold; cursor:pointer;">+</button>
      </div>

      <button onclick="ajouterPanier(${p.id})" ${p.stock<=0?'disabled':''} style="width:100%; padding:12px; background:#ff69b4; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Ajouter au panier</button>
    </div>`;
  }).join("");
}

// FONCTION POUR LE + ET - QUI COMMENCE A 0
function changerQte(id, delta){
  let actuelle = quantites[id] || 0;
  let nouvelle = actuelle + delta;
  if(nouvelle < 0) nouvelle = 0;
  if(nouvelle > 99) nouvelle = 99;
  quantites[id] = nouvelle;
  let span = document.getElementById("qte-"+id);
  if(span) span.textContent = nouvelle;
}

function filtrer(cat){
  if(cat==="tout"){ produitsAffiches = tousProduits; }
  else { produitsAffiches = tousProduits.filter(p=> (p.categorie||"").toLowerCase().includes(cat.toLowerCase())); }
  afficherProduits();
}

function rechercher(){
  let mot = document.getElementById("recherche").value.toLowerCase();
  produitsAffiches = tousProduits.filter(p=> (p.nom+" "+(p.description||"")).toLowerCase().includes(mot));
  afficherProduits();
}

function ajouterPanier(id){
  let p = tousProduits.find(x=> x.id==id);
  if(!p) return;
  let qteChoisie = quantites[id] || 0;
  if(qteChoisie === 0){ alert("Choisis d'abord la quantité avec +"); return; }
  let exist = panier.find(x=> x.id==id);
  if(exist) exist.qte += qteChoisie; else panier.push({...p, qte: qteChoisie});
  quantites[id] = 0; // On remet à 0 après ajout
  mettreAJourPanier();
  afficherProduits(); // Pour remettre l'affichage à 0
  // CORRIGÉ : On n'ouvre PLUS le panier tout seul, il reste caché dans l'onglet Panier
}

function mettreAJourPanier(){
  document.getElementById("nb-panier").textContent = panier.reduce((a,b)=>a+b.qte,0);
  let sousTotal = panier.reduce((a,b)=>a + Number(b.prix)*b.qte, 0);
  let livraison = sousTotal>0 ? 1000 : 0;
  let reduction = promoAppliquee ? Math.round(sousTotal * promoAppliquee) : 0;
  let total = sousTotal + livraison - reduction;
  document.getElementById("contenu-panier").innerHTML = panier.length? panier.map((p,i)=>`<p>${p.nom} x${p.qte} - ${p.prix*p.qte} F CFA <button onclick="retirerPanier(${i})">✕</button></p>`).join("") : "<p>Ton panier est vide</p>";
  document.getElementById("sous-total").textContent = sousTotal;
  document.getElementById("frais-livraison").textContent = livraison;
  document.getElementById("montant-reduction").textContent = reduction;
  document.getElementById("total-panier").textContent = total;
  document.getElementById("ligne-reduction").style.display = reduction? "block":"none";
}

function retirerPanier(i){ panier.splice(i,1); mettreAJourPanier(); }
function afficherPanier(){ document.getElementById("panier-modal").classList.remove("modal-cache"); mettreAJourPanier(); }
function fermerPanier(){ document.getElementById("panier-modal").classList.add("modal-cache"); }
function voirConditions(){ document.getElementById("conditions-modal").classList.remove("modal-cache"); }
function fermerConditions(){ document.getElementById("conditions-modal").classList.add("modal-cache"); }

function appliquerPromo(){
  let code = document.getElementById("code-promo").value.trim().toUpperCase();
  let msg = document.getElementById("message-promo");
  if(code==="ABLAVI10"){ promoAppliquee=0.10; msg.textContent="Promo -10% appliquée !"; msg.style.color="green"; }
  else { promoAppliquee=0; msg.textContent="Code invalide"; msg.style.color="red"; }
  mettreAJourPanier();
}

async function payerCommande(){
  let nom = document.getElementById("client-nom").value;
  let tel = document.getElementById("client-whatsapp").value;
  let commune = document.getElementById("client-commune").value;
  let paiement = document.querySelector('input[name="paiement"]:checked')?.value || "Orange Money";
  let accepte = document.getElementById("accepter-conditions").checked;
  if(!nom || !tel || !commune){ document.getElementById("message-paiement").textContent="Remplis nom, WhatsApp et commune"; return; }
  if(!accepte){ document.getElementById("message-paiement").textContent="Coche les conditions"; return; }
  let total = document.getElementById("total-panier").textContent;
  let idCmd = "ABL" + Date.now();
  let produitsTxt = panier.map(p=> p.nom+" x"+p.qte).join(", ");
  try{
    await fetch(API,{method:"POST", body: JSON.stringify({type:"commande", idCommande:idCmd, nomClient:nom, telephone:tel, produits:produitsTxt, total:total, paiement:paiement, adresse:commune})});
  }catch(e){}
  let msg = `Bonjour ABLAVI STORE! Je veux commander:%0A%0ACommande ${idCmd}%0A${produitsTxt}%0A%0ANom: ${nom}%0ATel: ${tel}%0ACommune: ${commune}%0APaiement: ${paiement}%0ATotal: ${total} F CFA`;
  window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  document.getElementById("message-paiement").textContent = "Commande enregistrée ! Envoie le reçu sur WhatsApp.";
  panier=[]; promoAppliquee=0; mettreAJourPanier();
}

chargerProduits();
