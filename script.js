const API = "https://script.google.com/macros/s/AKfycbxwP4OEqaDTnl__uRGkhABDKdbL7In6FpFrZpP-wkJi1ltLQAbi1GzV1k58LJ0HTcM/exec";
const WHATSAPP = "2250101538258";
let tousProduits = [];
let produitsAffiches = [];
let panier = [];
let promoAppliquee = 0;
let quantites = {};
let commandeEnCours = false;

const PRODUITS_SECOURS = [];

async function chargerProduits(){
  try{
    let r = await fetch(API + "?t=" + Date.now());
    let data = await r.json();
    if(data && data.produits && data.produits.length > 0){ tousProduits = data.produits; }
    else if(Array.isArray(data) && data.length > 0){ tousProduits = data; }
    else { tousProduits = PRODUITS_SECOURS; }
  }catch(e){ tousProduits = PRODUITS_SECOURS; }
  produitsAffiches = tousProduits;
  afficherProduits();
}

function afficherProduits(){
  let zone = document.getElementById("liste-produits");
  if(!zone) return;
  if(!produitsAffiches.length){ zone.innerHTML = "<p style='text-align:center'>Aucun produit pour le moment.</p>"; return; }
  zone.innerHTML = produitsAffiches.map(p=>{
    let qte = quantites[p.id] || 0;
    return `
    <div class="carte-produit" style="text-align:center; display:flex; flex-direction:column; align-items:center; background:#fff; border-radius:15px; padding:10px; box-shadow:0 2px 8px rgba(0,0,0,0.08); overflow:hidden;">
      <img src="${p.image}" alt="${p.nom}" onerror="this.src='https://via.placeholder.com/300x300?text=ABLAVI'" style="width:100% !important; height:220px !important; object-fit:cover !important; border-radius:12px; display:block;">
      <h3 style="text-align:center; width:100%; margin:8px 0 5px; font-size:16px;">${p.nom}</h3>
      <p style="text-align:center; width:100%; margin:5px 0;">${p.description||""}</p>
      <p style="text-align:center; width:100%; margin:5px 0;"><strong>${p.prix} F CFA</strong> ${p.ancienPrix? `<s>${p.ancienPrix} F CFA</s>`: ""}</p>
      <p style="text-align:center; width:100%; margin:5px 0; font-size:12px;color:${p.stock>0?'green':'red'}">${p.stock>0? 'En stock : '+p.stock : 'Rupture'}</p>
      <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin:10px 0;">
        <button onclick="changerQte('${p.id}', -1)" style="width:35px; height:35px; border-radius:50%; border:1px solid #ff69b4; background:#fff; color:#ff69b4; font-size:20px; font-weight:bold; cursor:pointer;">-</button>
        <span id="qte-${p.id}" style="font-size:18px; font-weight:bold; min-width:25px; text-align:center;">${qte}</span>
        <button onclick="changerQte('${p.id}', 1)" style="width:35px; height:35px; border-radius:50%; border:none; background:#ff69b4; color:#fff; font-size:20px; font-weight:bold; cursor:pointer;">+</button>
      </div>
      <button onclick="ajouterPanier('${p.id}')" ${p.stock<=0?'disabled':''} style="width:100%; padding:12px; background:#ff69b4; color:#fff; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Ajouter au panier</button>
    </div>`;
  }).join("");
}

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
  let p = tousProduits.find(x=> String(x.id)==String(id));
  if(!p) return;
  let qteChoisie = quantites[id] || 0;
  if(qteChoisie === 0){ alert("Choisis d'abord la quantité avec +"); return; }
  let exist = panier.find(x=> String(x.id)==String(id));
  if(exist) exist.qte += qteChoisie; else panier.push({...p, qte: qteChoisie});
  quantites[id] = 0;
  mettreAJourPanier();
  afficherProduits();
}

function mettreAJourPanier(){
  let elNb = document.getElementById("nb-panier");
  if(elNb) elNb.textContent = panier.reduce((a,b)=>a+b.qte,0);
  let sousTotal = panier.reduce((a,b)=>a + Number(b.prix)*b.qte, 0);
  let livraison = sousTotal>0 ? 1000 : 0;
  let reduction = promoAppliquee ? Math.round(sousTotal * promoAppliquee) : 0;
  let total = sousTotal + livraison - reduction;
  let contenu = document.getElementById("contenu-panier");
  if(contenu) contenu.innerHTML = panier.length? panier.map((p,i)=>`<p style="text-align:center">${p.nom} x${p.qte} - ${p.prix*p.qte} F CFA <button onclick="retirerPanier(${i})">✕</button></p>`).join("") : "<p style='text-align:center'>Ton panier est vide</p>";
  let set = (id, val)=>{ let e=document.getElementById(id); if(e) e.textContent = val; };
  set("sous-total", sousTotal);
  set("frais-livraison", livraison);
  set("montant-reduction", reduction);
  set("total-panier", total);
  let ligne = document.getElementById("ligne-reduction");
  if(ligne) ligne.style.display = reduction? "block":"none";
}

function retirerPanier(i){ panier.splice(i,1); mettreAJourPanier(); }

// ===== CORRIGÉ : PANIER QUI S'OUVRE EN HAUT, PAR-DESSUS TOUT =====
function afficherPanier(){
  let m = document.getElementById("panier-modal");
  if(!m) return;
  m.classList.remove("modal-cache");
  m.style.display = "flex";
  m.style.position = "fixed";
  m.style.top = "0";
  m.style.left = "0";
  m.style.width = "100%";
  m.style.height = "100%";
  m.style.zIndex = "99999";
  m.style.justifyContent = "center";
  m.style.alignItems = "flex-start";
  m.style.overflowY = "auto";
  window.scrollTo(0,0);
  document.body.style.overflow = "hidden";
  mettreAJourPanier();
}
function fermerPanier(){
  let m = document.getElementById("panier-modal");
  if(!m) return;
  m.classList.add("modal-cache");
  m.style.display = "none";
  document.body.style.overflow = "";
}
function voirConditions(){
  let c = document.getElementById("conditions-modal");
  if(!c) return;
  c.classList.remove("modal-cache");
  c.style.display = "flex";
  c.style.position = "fixed";
  c.style.top = "0";
  c.style.left = "0";
  c.style.zIndex = "100000";
}
function fermerConditions(){
  let c = document.getElementById("conditions-modal");
  if(!c) return;
  c.classList.add("modal-cache");
  c.style.display = "none";
}

function appliquerPromo(){
  let code = document.getElementById("code-promo").value.trim().toUpperCase();
  let msg = document.getElementById("message-promo");
  if(code==="ABLAVI10"){ promoAppliquee=0.10; msg.textContent="Promo -10% appliquée !"; msg.style.color="green"; }
  else { promoAppliquee=0; msg.textContent="Code invalide"; msg.style.color="red"; }
  mettreAJourPanier();
}

async function payerCommande(){
  if(commandeEnCours) return;
  if(panier.length === 0){ document.getElementById("message-paiement").textContent="Ton panier est vide"; return; }

  let nom = document.getElementById("client-nom").value.trim();
  let tel = document.getElementById("client-whatsapp").value.trim();
  let commune = document.getElementById("client-commune").value.trim();
  let paiement = document.querySelector('input[name="paiement"]:checked')?.value || "Orange Money";
  let accepte = document.getElementById("accepter-conditions").checked;
  if(!nom || !tel || !commune){ document.getElementById("message-paiement").textContent="Remplis nom, WhatsApp et commune"; return; }
  if(!accepte){ document.getElementById("message-paiement").textContent="Coche les conditions"; return; }

  commandeEnCours = true;
  let btnPayer = document.querySelector('button[onclick*="payerCommande"]');
  if(btnPayer){ btnPayer.disabled = true; btnPayer.textContent = "Envoi en cours..."; }

  let total = Number(document.getElementById("total-panier").textContent) || 0;
  let idCmd = "ABL" + Date.now();
  let produitsTxt = panier.map(p=> p.nom+" x"+p.qte).join(", ");
  try{
    await fetch(API,{method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify({type:"commande", idCommande:idCmd, nomClient:nom, telephone:tel, produits:produitsTxt, total:total, paiement:paiement, adresse:commune})});
  }catch(e){}
  let msg = `Bonjour ABLAVI STORE! Je veux commander:%0A%0ACommande ${idCmd}%0A${produitsTxt}%0A%0ANom: ${nom}%0ATel: ${tel}%0ACommune: ${commune}%0APaiement: ${paiement}%0ATotal: ${total} F CFA`;
  window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  document.getElementById("message-paiement").textContent = "Commande enregistrée ! Envoie le reçu sur WhatsApp.";
  panier=[]; promoAppliquee=0; mettreAJourPanier();

  setTimeout(()=>{
    commandeEnCours = false;
    if(btnPayer){ btnPayer.disabled = false; btnPayer.textContent = "ENVOYEZ + LE REÇU DU DEPOT"; }
  }, 3000);
}

chargerProduits();
