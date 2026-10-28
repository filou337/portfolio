# Portfolio — Philippe Roumbo

Consultant Data / Data Engineer — Azure Data Factory, Databricks, PySpark, Power BI, Azure DevOps.

## 🔗 Portfolio en ligne

**https://filou337.github.io/portfolio/**

| | |
|---|---|
| Site | [filou337.github.io/portfolio](https://filou337.github.io/portfolio/) |
| CV (PDF) | [Portfolio_Philippe_ROUMBO.pdf](https://filou337.github.io/portfolio/Portfolio_Philippe_ROUMBO.pdf) |
| QR code | [qr_portfolio_sables.svg](qr_portfolio_sables.svg) |

## Contenu du dépôt

| Fichier | Description |
|---|---|
| `index.html` | Le portfolio — page autonome, bilingue FR/EN, thème clair/sombre |
| `Portfolio_Philippe_ROUMBO.pdf` | Version PDF imprimable |
| `qr_portfolio_sables.svg` | QR code renvoyant vers le portfolio |
| `CV_…_FR.pdf` / `LM_…_FR.pdf` | CV et lettre de motivation en français (envoyés par e-mail) |
| `CV_…_EN.pdf` / `Cover_Letter_…_EN.pdf` | Resume et cover letter en anglais (envoyés par e-mail) |
| `apps-script/Code.gs` | Script Google Apps Script qui envoie les e-mails |

## Publication

Le site est servi par GitHub Pages depuis la branche `main` (racine du dépôt).
Toute modification de `index.html` poussée sur `main` est publiée automatiquement
en une minute environ.

## Envoi automatique du CV + lettre de motivation

Sur le portfolio, le bouton **« Recevoir CV + lettre par e-mail »** ouvre une fenêtre où le visiteur
saisit son adresse et choisit la langue (🇫🇷 / 🇬🇧, présélectionnée selon la langue du site).
Il reçoit alors un e-mail aux couleurs du portfolio avec, en pièces jointes :

- **FR** : `CV_Philippe_ROUMBO_Analytics_Engineer_FR.pdf` + `LM_Philippe_ROUMBO_Analytics_Engineer_FR.pdf`
- **EN** : `CV_Philippe_ROUMBO_Analytics_Engineer_EN.pdf` + `Cover_Letter_Philippe_ROUMBO_Analytics_Engineer_EN.pdf`

L'envoi passe par ton compte Gmail via Google Apps Script (gratuit) : le message part de ton adresse
et les réponses te reviennent directement.

### 1. Créer le script

1. Va sur https://script.google.com, connecté avec le compte Gmail qui doit envoyer les mails, puis **Nouveau projet**.
2. Remplace le contenu de `Code.gs` par celui de [`apps-script/Code.gs`](apps-script/Code.gs).
3. Renomme le projet, par exemple « Portfolio – envoi CV ».
4. Choisis la fonction `testEnvoi` en haut et clique sur **Exécuter**. Accepte les autorisations demandées.
   - Si « Google n'a pas validé cette application » s'affiche : **Paramètres avancés** → **Accéder à … (non sécurisé)**. C'est normal pour un script personnel.
   - Tu reçois deux e-mails de test (FR et EN) avec leurs pièces jointes.

> Les PDF doivent être en ligne avant le test : vérifie que
> https://filou337.github.io/portfolio/CV_Philippe_ROUMBO_Analytics_Engineer_FR.pdf s'ouvre.

### 2. Le publier

1. **Déployer** → **Nouveau déploiement** → type **Application Web**.
2. **Exécuter en tant que** : Moi — **Qui a accès** : Tout le monde.
3. **Déployer**, puis copie l'URL qui finit par `/exec`.

### 3. Brancher le portfolio

Dans `index.html`, remplace la valeur de :

```js
var CV_ENDPOINT = 'COLLE_ICI_L_URL_DE_TON_APPLICATION_WEB_APPS_SCRIPT';
```

par ton URL `/exec`, puis commit et push. Fais un test complet sur le site avec une autre adresse, en FR puis en EN.

### Bon à savoir

- **Modifier le message** : textes `TEXT.fr` / `TEXT.en` dans `Code.gs`, puis **Déployer** → **Gérer les déploiements** → crayon → **Nouvelle version** (un *nouveau* déploiement changerait l'URL).
- **Changer un document** : remplace le PDF dans le dépôt en gardant le même nom de fichier. Rien d'autre à faire.
- **Notifications** : à chaque envoi, tu reçois « Portfolio : CV + LM envoyés à … ». Pour les couper : `NOTIFY_TO: ''`.
- **Anti-abus** : champ piège invisible contre les robots ; une même adresse n'est servie qu'une fois toutes les 12 h, sauf renvoi confirmé par le visiteur (2 max) ; 40 envois max par jour (Gmail gratuit ≈ 100 destinataires/jour).
