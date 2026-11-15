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

## Passe de correction (revue du rendu)

Anomalies trouvées en inspectant les pages rendues, puis corrigées :

- **Jetons d'espacement qui écrasaient la largeur** — `--spacing-xs/sm/md/lg/xl` redéfinissaient
  l'échelle Tailwind : `max-w-xl` valait 32 px, `max-w-sm` 8 px, d'où des colonnes d'un mot et des
  pages illisibles. Ces jetons sont supprimés, les classes concernées utilisent le pas numérique
  standard (`gap-3`, `p-5`, `max-w-xl`, …).
- **Hydratation** — `DemoBanner` rendait un `<p>` dans le `<p>` de `SidebarFooter` ; il rend
  maintenant un `<span>`.
- **Cesium** — `viewer.scene.traverse` n'existe pas (l'API est `Scene.primitives`), le globe échouait ;
  appel retiré. Le viewer passe en `requestRenderMode` (pas de boucle de rendu continue, utile sur
  portable) et la destruction est protégée en cas de contexte WebGL déjà libéré.
- **Valeurs inventées** — l'accueil affichait un azimut, une élévation, un flux et une éphéméride
  codés en dur, l'explorateur une élévation et des visibilités fabriquées, l'analyse des coordonnées
  vides, la fiche publique une « qualité du calcul » sans source : toutes ces valeurs proviennent
  désormais des données de démonstration de l'API.
- **Cohérence des séries** — le mock produisait `steps + 1` points (borne de fin inclusive) ; il en
  produit maintenant exactement `steps`.
- **Mobile** — la carte « Analyses récentes » du tableau de bord débordait horizontalement
  (`min-w-0`), et le tiroir de navigation restait focusable une fois fermé (`inert`).

Non vérifié visuellement : captures d'écran indisponibles pendant la passe (fenêtre de prévisualisation
non dessinée). Les pages ont été contrôlées via le DOM rendu et la console du navigateur.
