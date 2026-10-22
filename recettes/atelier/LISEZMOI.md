# Atelier des illustrations

Les illustrations aquarelle de `../illus/` sont fabriquées ici :

1. `dessins.js` : dessins vectoriels de base (100 × 100).
2. `node rendu.js dessins.js /tmp/rendus` : rend chaque dessin en deux passes (couleurs / traits) avec Playwright.
3. `python3 aquarelle.py /tmp/rendus ../illus 360` : effet aquarelle (bords irréguliers, pigment, grain, trait sépia). Nécessite numpy, opencv-python-headless, pillow.
4. `cp /tmp/rendus/_meta.json . && node manifeste.js` : régénère `../illus.js`.
