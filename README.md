# audit-rgaa
Web accessibility audit tool based on the French RGAA (Référentiel Général d'Amélioration de l'Accessibilité)

## Déployer le projet sur GitHub

Oui, c'est possible.

### 1) Publier le code sur GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<votre-utilisateur>/<votre-repo>.git
git push -u origin main
```

### 2) Déployer l'interface sur GitHub Pages (optionnel)

Si vous souhaitez héberger le frontend sur GitHub Pages :

1. Ouvrir **Settings > Pages** dans votre dépôt
2. Choisir **GitHub Actions** comme source de déploiement
3. Ajouter un workflow de build/déploiement du dossier `frontend`
