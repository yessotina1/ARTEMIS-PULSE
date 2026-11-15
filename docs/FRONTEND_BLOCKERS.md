# ARTEMIS PULSE — Blocages front-end

Aucune tâche n'a été arrêtée après trois échecs : `npm run lint` et `npm run build` passent
sur toutes les tâches livrées.

## Points à vérifier côté équipe

1. **Assets Cesium** — `node_modules/cesium/Build/Cesium` est copié dans `apps/web/public/cesium`
   par `scripts/copy-cesium.mjs` (déclenché par `predev`/`prebuild`). Le dossier est ignoré par Git.
   Le rendu 3D n'a pas été vérifié visuellement dans un navigateur ; seul le build de production
   a été validé. La carte polaire 2D sert de repli si WebGL ou Cesium échoue.
2. **Dépôt Git** — `apps/web` était enregistré dans l'index du dépôt parent comme un lien de
   sous-module sans `.gitmodules` ni dépôt imbriqué, ce qui rendait tout commit impossible.
   Le lien a été remplacé par le suivi normal des fichiers du dossier (aucun fichier supprimé).
3. **Authentification** — l'UI est branchée sur un store local (`localStorage`), sans appel API.
   Aucune route d'authentification n'est supposée disponible.
4. **Téléchargement de rapports** — aucune route de téléchargement n'est définie dans le cahier ;
   l'action « Télécharger (démo) » exporte localement les métadonnées du rapport en JSON.
