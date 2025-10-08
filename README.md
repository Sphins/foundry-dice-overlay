

## Intégration OBS (Molten Hosting)

1. Ouvrez les réglages du module et, si souhaité, définissez un **Token de lecture**.
2. Dans OBS, ajoutez une **Source Navigateur** et ciblez :
   ```
   https://<ton-domaine-molten>/modules/foundry-dice-overlay/public/overlay.html?token=<votreToken>
   ```
   (Le paramètre `token` est optionnel si vous ne l’avez pas défini.)
3. L’overlay se connecte au flux SSE : `/modules/foundry-dice-overlay/stream?token=...`.

### Tests rapides
- Faites un jet en tant que **MJ** : selon le paramètre *Filtres des jets MJ* (`Afficher tous les jets` / `Masquer les jets du MJ`), l’entrée apparaîtra (ou non).
- Un jet de test local est affiché au chargement si aucun message n’arrive sous 5 secondes (diagnostic).

