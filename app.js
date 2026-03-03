// Données et variables identiques V2
const produits = { /* même que V2 */ };
let prixDefautReine = 12.00;
let commande = [];
let pressTimer, isProcessingPress = false;

// Init + events identiques V2 (handlePressStart/End corrigés)
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updatePrixBouton();
    setupTypeListener();
    majAffichageCommande(); // Force affichage initial
});

function setupTypeListener() {
    document.getElementById('order-type').addEventListener('change', (e) => {
        const header = document.getElementById('order-header');
        if (e.target.value === 'À emporter') {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
    });
}

// CORRECTION : majAffichageCommande
function majAffichageCommande() {
    const container = document.getElementById('order-items');
    
    if (commande.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;font-size:18px;">Commande vide</div>';
    } else {
        // Grouper identiques
        const grouped = {};
        commande.forEach((item, globalIndex) => {
            const key = item.id;
            if (!grouped[key]) {
                grouped[key] = {
                    nom: item.nom,
                    prixUnitaire: item.prix,
                    quantite: 0,
                    total: 0,
                    indices: []
                };
            }
            grouped[key].quantite++;
            grouped[key].total += item.prix;
            grouped[key].indices.push(globalIndex);
        });

        container.innerHTML = '';
        Object.values(grouped).forEach(group => {
            const ligne = document.createElement('div');
            ligne.className = 'order-item';
            ligne.dataset.groupKey = group.nom;
            ligne.innerHTML = `
                <span>${group.nom} ×${group.quantite}</span>
                <span>${group.total.toFixed(2)}€</span>
            `;
            ligne.addEventListener('dblclick', () => ouvrirModalPrixCommande(group.indices[0]));
            container.appendChild(ligne);
        });
    }

    const total = commande.reduce((sum, item) => sum + item.prix, 0);
    document.getElementById('total').textContent = total.toFixed(0) + '€';
}

// Les autres fonctions identiques V2
// handlePressStart/End, modals, etc. restent les mêmes
