# Votre Projet API

Ce projet API est conçu pour fournir une interface de programmation d'application (API) robuste et flexible pour gérer les utilisateurs, les enchères, et les offres dans une application de vente aux enchères. Utilisant Express.js et PocketBase, cette API offre une série de fonctionnalités permettant une intégration facile avec des applications front-end.

## Fonctionnalités

### Gestion des Utilisateurs

- **Création d'Utilisateurs** : Permet d'ajouter de nouveaux utilisateurs à la base de données.
- **Lecture d'Utilisateurs** : Fournit la possibilité de récupérer les informations des utilisateurs, y compris une liste paginée avec recherche et tri.
- **Mise à jour d'Utilisateurs** : Permet de mettre à jour les informations des utilisateurs, y compris l'ajout et la suppression d'enchères favorites.
- **Suppression d'Utilisateurs** : Offre la possibilité de supprimer des utilisateurs de la base de données.
- **Gestion des Avatars** : Permet de récupérer l'URL de l'avatar d'un utilisateur.
- **Génération d'Utilisateurs Aléatoires** : Fonctionnalité pour générer des utilisateurs aléatoires avec des données fictives pour les tests.
- **Favoris** : Permet aux utilisateurs de gérer leurs enchères favorites.

### Gestion des Enchères

- **Création, Lecture, Mise à jour, et Suppression d'Enchères** : CRUD complet pour gérer les enchères dans l'application.

### Gestion des Offres

- **Lecture des Offres** : Permet de récupérer les offres faites par les utilisateurs sur les enchères.

## Configuration et Installation

Pour configurer et installer l'API, suivez les étapes ci-dessous :

1. Clonez le dépôt sur votre machine locale.
2. Installez les dépendances en exécutant `npm install`.
3. Configurez les variables d'environnement nécessaires pour votre instance PocketBase.
4. Lancez le serveur avec `npm start`.

## Utilisation

L'API est conçue pour être utilisée avec une application front-end. Configurez le CORS pour autoriser les requêtes depuis votre domaine front-end.

### Endpoints

Les endpoints suivants sont disponibles :

- `/users` : Gestion des utilisateurs.
- `/auctions` : Gestion des enchères.
- `/bids` : Gestion des offres.

Pour plus de détails sur les requêtes et les réponses, veuillez consulter la documentation de l'API.

## Sécurité

L'API utilise des mesures de sécurité de base, mais il est recommandé d'implémenter des mécanismes de sécurité supplémentaires selon les besoins de votre application.

## Contribution

Les contributions sont les bienvenues. Veuillez soumettre vos pull requests sur GitHub.

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.