// Données
const produits = {
    pizzas: [{
        id: 'reine',
        nom: 'REINE',
        prix: 12.00,
        composition: ['Sauce tomate', 'Jambon blanc italien', 'Champignons', 'Fior di latte'],
        supplements: [
            { nom: 'Roquette', prix: 0.50 },
            { nom: 'Reblochon', prix: 2.00 },
            { nom: 'Œuf', prix: 1.00 }
        ]
    }]
};

let prixDefautReine = 12.00;
let commande = [];
let pressTimer;
let pressStartTime;
let isProcessingPress = false;

// Init
document.addEventListener('DOMContentLoaded', () => {
    initProduits();
    initEventListeners();
    updatePrixBouton();
});

function initProduits() {
    // Déjà 1 produit en HTML
}

function initEventListeners() {
    const productBtns = document.querySelectorAll('.product-btn');
    
    productBtns.forEach(btn => {
        // LOGIQUE SIMPLIFIÉE : priorité tap > long press > double click
        let timeoutId;
        
        // Touch
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handlePressStart(e, btn);
        }, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            handlePressEnd(e, btn);
        }, { passive: false });
        
        // Mouse
        btn.addEventListener('mousedown', (e) => {
            handlePressStart(e, btn);
        });
        
        btn.addEventListener('mouseup', (e) => {
            handlePressEnd(e, btn);
        });
        
        btn.addEventListener('mouseleave', () => {
            clearTimeout(timeoutId);
        });
        
        // Double click SEULEMENT si pas de press processing
        btn.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (!isProcessingPress) {
                ouvrirModalComposition('reine');
            }
        });
    });

    // Modals (inchangé)
    document.getElementById('save-product-price').onclick = savePrixProduit;
    document.getElementById('cancel-price').onclick = fermerModal;
    document.getElementById('close-comp').onclick = fermerModal;
    document.getElementById('save-order-price').onclick = savePrixCommande;
    document.getElementById('cancel-order-price').onclick = fermerModal;

    document.querySelectorAll('.modal').forEach(modal => {
        modal.onclick = (e) => { if (e.target === modal) fermerModal(); };
    });
}

function handlePressStart(e, btn) {
    if (isProcessingPress) return;
    
    pressStartTime = Date.now();
    isProcessingPress = true;
    
    const timeoutId = setTimeout(() => {
        // Appui long détecté
        ouvrirModalPrixProduit();
        isProcessingPress = false;
    }, 600); // 600ms long press
    
    // Stocke timeout pour clear
    btn._timeoutId = timeoutId;
}

function handlePressEnd(e, btn) {
    const elapsed = Date.now() - pressStartTime;
    
    clearTimeout(btn._timeoutId);
    
    if (elapsed < 400 && !isProcessingPress) { // Tap court < 400ms
        ajouterArticleCommande('reine');
    }
    
    setTimeout(() => { isProcessingPress = false; }, 100);
}

// Fonctions modals et commande IDENTIQUES à la V1
// (je ne les recopie pas pour économiser l'espace, garde les mêmes de app.js précédent)

function updatePrixBouton() {
    const priceEl = document.querySelector('.product-price');
    priceEl.textContent = prixDefautReine.toFixed(2) + '€';
    priceEl.dataset.price = prixDefautReine;
}

function ouvrirModalPrixProduit() {
    document.getElementById('new-product-price').value = prixDefautReine.toFixed(2);
    document.getElementById('modal-price').classList.add('active');
}

function savePrixProduit() {
    const np = parseFloat(document.getElementById('new-product-price').value);
    if (!isNaN(np)) {
        prixDefautReine = np;
        updatePrixBouton();
    }
    fermerModal();
}

function ouvrirModalComposition(id) {
    const p = produits.pizzas[0];
    document.getElementById('comp-title').textContent = p.nom;
    document.getElementById('composition').innerHTML = '<strong>Composition :</strong><br>' + p.composition.join(', ');
    let sHtml = '<strong>Suppléments :</strong><ul class="suppl-list">';
    p.supplements.forEach(s => sHtml += `<li>${s.nom} (+${s.prix.toFixed(2)}€)</li>`);
    sHtml += '</ul>';
    document.getElementById('supplements').innerHTML = sHtml;
    document.getElementById('modal-comp').classList.add('active');
}

function ajouterArticleCommande(id) {
    commande.push({ id, nom: 'REINE', prix: prixDefautReine, quantite: 1 });
    majAffichageCommande();
}

function majAffichageCommande() {
    const container = document.getElementById('order-items');
    container.innerHTML = '';
    
    const grouped = {};
    commande.forEach((item, i) => {
        if (!grouped[item.id]) grouped[item.id] = { ...item, indices: [], totalQty: 0 };
        grouped[item.id].indices.push(i);
        grouped[item.id].totalQty++;
    });
    
    Object.values(grouped).forEach(group => {
        const ligne = document.createElement('div');
        ligne.className = 'order-item';
        ligne.dataset.groupId = group.id;
        ligne.innerHTML = `${group.nom} ×${group.totalQty} : ${(group.prix * group.totalQty).toFixed(2)}€`;
        ligne.ondblclick = () => ouvrirModalPrixCommande(group.indices[0], group.id);
        container.appendChild(ligne);
    });
    
    const total = commande.reduce((s, i) => s + i.prix, 0);
    document.getElementById('total').textContent = total.toFixed(2) + '€';
}

function ouvrirModalPrixCommande(index, groupId) {
    document.getElementById('new-order-price').value = commande[index].prix.toFixed(2);
    document.getElementById('apply-all').dataset.groupId = groupId;
    document.getElementById('modal-order-price').classList.add('active');
}

function savePrixCommande() {
    const np = parseFloat(document.getElementById('new-order-price').value);
    const groupId = document.getElementById('apply-all').dataset.groupId;
    const applyAll = document.getElementById('apply-all').checked;
    
    if (!isNaN(np)) {
        commande.forEach((item, i) => {
            if (item.id === groupId && (applyAll || /* logique simplifiée */ true)) {
                item.prix = np;
            }
        });
        majAffichageCommande();
    }
    fermerModal();
}

function fermerModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
// Données en dur pour prototype
const produits = {
    pizzas: [
        {
            id: 'reine',
            nom: 'Reine',
            prix: 12.00,
            composition: ['Sauce tomate', 'Jambon blanc italien', 'Champignons', 'Fior di latte'],
            supplements: [
                { nom: 'Roquette', prix: 0.50 },
                { nom: 'Reblochon', prix: 2.00 },
                { nom: 'Œuf', prix: 1.00 }
            ]
        }
    ]
};

let prixDefautReine = 12.00; // Modifiable par appui long
let commande = [];
let longPressTimer;
let isLongPress = false;
let dblClickTimer;

// Init
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    updatePrixBouton();
});

function initEventListeners() {
    // Sur tous les boutons produit
    document.querySelectorAll('.product-btn').forEach(btn => {
        // Touch events pour tactile
        let touchStartTime;
        let touchId;

        btn.addEventListener('touchstart', handleTouchStart);
        btn.addEventListener('touchend', handleTouchEnd);
        btn.addEventListener('touchcancel', () => clearTimeout(longPressTimer));

        // Mouse pour desktop
        btn.addEventListener('mousedown', handleMouseDown);
        btn.addEventListener('mouseup', handleMouseUp);
        btn.addEventListener('mouseleave', () => clearTimeout(longPressTimer));

        // Double clic natif
        btn.addEventListener('dblclick', handleDoubleClick);
    });

    // Modals
    document.getElementById('save-product-price').addEventListener('click', savePrixProduit);
    document.getElementById('cancel-price').addEventListener('click', fermerModal);
    document.getElementById('close-comp').addEventListener('click', fermerModal);
    document.getElementById('save-order-price').addEventListener('click', savePrixCommande);
    document.getElementById('cancel-order-price').addEventListener('click', fermerModal);

    // Fermeture modals par clic dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) fermerModal();
        });
    });
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartTime = Date.now();
    touchId = touch.identifier;
    longPressTimer = setTimeout(() => {
        isLongPress = true;
        ouvrirModalPrixProduit();
    }, 500); // 500ms pour appui long
}

function handleTouchEnd(e) {
    e.preventDefault();
    clearTimeout(longPressTimer);
    if (isLongPress) {
        isLongPress = false;
        return;
    }
    const elapsed = Date.now() - touchStartTime;
    if (elapsed < 200) { // Tap court
        ajouterArticleCommande('reine');
    }
}

function handleMouseDown(e) {
    longPressTimer = setTimeout(() => {
        ouvrirModalPrixProduit();
    }, 500);
}

function handleMouseUp(e) {
    clearTimeout(longPressTimer);
}

function handleDoubleClick(e) {
    e.preventDefault();
    ouvrirModalComposition('reine');
}

// Modals
function ouvrirModalPrixProduit() {
    document.getElementById('new-product-price').value = prixDefautReine.toFixed(2);
    document.getElementById('modal-price').classList.add('active');
}

function savePrixProduit() {
    const nouveauPrix = parseFloat(document.getElementById('new-product-price').value);
    if (!isNaN(nouveauPrix)) {
        prixDefautReine = nouveauPrix;
        updatePrixBouton();
        fermerModal();
    }
}

function ouvrirModalComposition(produitId) {
    const produit = produits.pizzas.find(p => p.id === produitId);
    document.getElementById('comp-title').textContent = produit.nom;
    
    document.getElementById('composition').innerHTML = 
        '<strong>Composition :</strong><br>' + produit.composition.join(', ');
    
    let supplHtml = '<strong>Suppléments :</strong><ul class="suppl-list">';
    produit.supplements.forEach(s => {
        supplHtml += `<li>${s.nom} (+${s.prix.toFixed(2)}€)</li>`;
    });
    supplHtml += '</ul>';
    document.getElementById('supplements').innerHTML = supplHtml;
    
    document.getElementById('modal-comp').classList.add('active');
}

// Commande
function ajouterArticleCommande(produitId) {
    commande.push({
        id: produitId,
        nom: 'Reine',
        prix: prixDefautReine,
        quantite: 1
    });
    majAffichageCommande();
}

function majAffichageCommande() {
    const container = document.getElementById('order-items');
    container.innerHTML = '';

    // Grouper par produit identique
    const grouped = {};
    commande.forEach(item => {
        if (!grouped[item.id]) grouped[item.id] = { ...item, totalQty: 0 };
        grouped[item.id].totalQty++;
    });

    Object.values(grouped).forEach((item, index) => {
        const ligne = document.createElement('div');
        ligne.className = 'order-item';
        ligne.dataset.index = index;
        ligne.innerHTML = `
            ${item.nom} x${item.totalQty} : ${(item.prix * item.totalQty).toFixed(2)}€
        `;
        ligne.addEventListener('dblclick', () => ouvrirModalPrixCommande(index));
        container.appendChild(ligne);
    });

    const total = commande.reduce((sum, item) => sum + item.prix, 0);
    document.getElementById('total').textContent = total.toFixed(2) + ' €';
}

function ouvrirModalPrixCommande(indexLigne) {
    const prixLigne = commande[indexLigne].prix;
    document.getElementById('new-order-price').value = prixLigne.toFixed(2);
    document.getElementById('apply-all').dataset.index = indexLigne;
    document.getElementById('modal-order-price').classList.add('active');
}

function savePrixCommande() {
    const nouveauPrix = parseFloat(document.getElementById('new-order-price').value);
    const index = parseInt(document.getElementById('apply-all').dataset.index);
    const applyAll = document.getElementById('apply-all').checked;
    
    if (!isNaN(nouveauPrix)) {
        if (applyAll) {
            // Appliquer à toutes les lignes identiques
            commande.forEach((item, i) => {
                if (item.id === commande[index].id) {
                    item.prix = nouveauPrix;
                }
            });
        } else {
            commande[index].prix = nouveauPrix;
        }
        majAffichageCommande();
        fermerModal();
    }
}

function updatePrixBouton() {
    document.querySelector('.product-price').textContent = prixDefautReine.toFixed(2) + ' €';
    document.querySelector('.product-price').dataset.price = prixDefautReine;
}

function fermerModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}
