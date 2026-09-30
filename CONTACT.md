# Formulaire Maison Riviera — Web3Forms

Le formulaire existant envoie ses quatre champs obligatoires par fetch à https://api.web3forms.com/submit, sans navigation ni rechargement. Les noms transmis reprennent les quatre libellés. La clé publique fournie figure dans assets/contact-config.js ; le destinataire dépend du compte Web3Forms associé.

Le champ « Pour vous joindre » accepte toujours un téléphone ou un e-mail. Une adresse e-mail est également transmise sous `email` pour permettre la réponse. Les champs vides ou composés uniquement d’espaces sont refusés. Le bouton est bloqué pendant l’envoi ; le formulaire est réinitialisé uniquement après une réponse HTTP positive contenant `success: true`. Un échec conserve les réponses. Le délai maximal est de 20 secondes ; un délai dépassé peut survenir même si le serveur a reçu le message.

Le honeypot invisible `botcheck` bloque localement les soumissions lorsqu’il est coché. Web3Forms documente encore ce champ, mais considère désormais cette protection comme limitée et préconise un CAPTCHA. Aucun CAPTCHA visuel n’a été ajouté. Sans JavaScript, le lien e-mail existant reste disponible.

## Test local

1. Depuis le dossier du site : `python3 -m http.server 4173`.
2. Ouvrir http://localhost:4173/#contact et remplir les quatre champs avec des données de test identifiables.
3. Cliquer sur Envoyer. Vérifier dans Réseau une requête POST vers Web3Forms, avec les quatre libellés et la clé. La réponse doit contenir `success: true`.
4. Vérifier le message « Merci, votre message nous est bien parvenu. », sans navigation, puis la réception réelle du mail (et les indésirables) dans la boîte associée au compte.
5. Vérifier qu’un champ vide empêche l’envoi. Pour simuler un échec, passer les outils développeur en mode réseau Hors connexion après chargement, puis soumettre : les valeurs doivent rester présentes et le message d’erreur doit contenir un lien mailto. Revenir en ligne.

## Test GitHub Pages

Après votre publication habituelle, ouvrir l’URL GitHub Pages ou le domaine personnalisé et effectuer un rechargement forcé pour charger les nouveaux scripts. Refaire les étapes 2 à 5 avec un message distinct. Si des restrictions de domaine sont activées dans Web3Forms, vérifier qu’elles permettent le domaine utilisé et localhost pour les tests locaux. La réception effective doit être vérifiée dans la boîte mail ; une réponse API positive ne suffit pas à prouver la livraison.

Documentation : https://docs.web3forms.com/how-to-guides/html-and-javascript
Honeypot : https://docs.web3forms.com/getting-started/customizations/spam-protection/spam-protection
