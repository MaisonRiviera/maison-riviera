# Analytics Maison Riviera — intégration locale

Les deux pages publiques, `index.html` et `artiste.html`, chargent une fois la balise officielle gtag.js pour `G-8PL722ZNS5`, en tête du head après l'encodage. Le domaine googletagmanager.com héberge aussi gtag.js : aucun conteneur Google Tag Manager n'est utilisé. `assets/analytics.js` observe uniquement les liens annotés.

| Interaction | Événement | Paramètres |
| --- | --- | --- |
| ARTISTE sur l'accueil | `click_artiste` | `source_page: home`, `destination: artiste` |
| ACCUEIL sur la page artiste | `click_home` | `source_page: artiste`, `destination: home` |
| Texte du Press Kit | `open_press_kit` | `click_source: text`, `artist: legaly` |
| Photo du Press Kit | `open_press_kit` | `click_source: image`, `artist: legaly` |

Le logo n'est pas instrumenté. Aucun lien de plateforme externe n'existe actuellement, donc aucun événement `click_external` n'est ajouté.

Les href, cibles et comportements natifs des liens sont conservés. Aucun preventDefault, temporisateur, callback de navigation ni lecteur PDF n'est ajouté. Un clic est enregistré sans attendre l'envoi réseau. En cas de blocage de GA4 ou de départ très rapide, la réception d'un événement n'est pas garantie ; la navigation reste prioritaire.

## Vérification dans GA4 après intégration du consentement

- Vérifier que les mesures améliorées du flux Web sont activées dans l'administration GA4 : ce réglage n'est pas contrôlé par le code du site.
- Vérifier pages vues et événements dans Temps réel / DebugView (activer temporairement le mode debug avec les outils Google pour la session de test).
- Créer les dimensions personnalisées de portée événement `source_page`, `destination`, `click_source` et `artist` pour exploiter leurs valeurs dans les rapports et explorations.
- Filtrer sur `open_press_kit` et répartir le nombre d'événements par `click_source`. C'est une mesure des clics d'ouverture, pas une preuve du chargement ou de la lecture du PDF.
- Si la mesure améliorée des téléchargements est activée, GA4 peut également envoyer `file_download` sur ces liens PDF. Ne pas l'additionner à `open_press_kit` pour calculer le total d'ouvertures. Aucun événement automatique n'est recréé manuellement.

## Consentement et confidentialité — à terminer avant publication

**L'intégration actuelle charge GA4 immédiatement, sans CMP ni recueil du consentement. Elle peut transmettre des données à Google et déposer des cookies Analytics. Elle n'est pas une mise en conformité RGPD.** Aucune bannière ni présomption de consentement n'a été ajoutée.

Choisir et intégrer une CMP avec une interface validée. Pour un Consent Mode basique, bloquer le chargement du script distant et les commandes js/config/event avant accord ; ne pas mettre en attente les clics antérieurs au consentement pour les rejouer ensuite. La CMP doit réappliquer le choix sur chaque page, permettre refus et retrait et gérer les cookies existants lors du retrait.

Le point d'intégration est le bloc GA4 isolé dans chaque head et l'appel unique à gtag dans `assets/analytics.js`. Avant toute commande de mesure, la CMP devra initialiser les états Consent Mode (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) à `denied`, puis transmettre les choix réels via `gtag('consent', 'update', ...)`. Ne pas accorder les finalités publicitaires sur la base du seul accord à la mesure d'audience. En mode basique, maintenir aussi les scripts Google bloqués avant accord : le seul état denied n'empêche pas tous les envois en mode avancé.

Compléter l'information de confidentialité (finalités, destinataires, cookies, durées de conservation, transferts et garanties applicables, droits et retrait), vérifier les paramètres de conservation et de partage dans GA4, puis tester accord/refus/retrait et changements de page. Ces points nécessitent une validation adaptée au site ; Consent Mode ne recueille pas lui-même le consentement.

Références :
- Installation officielle : https://developers.google.com/tag-platform/gtagjs
- Consent Mode : https://developers.google.com/tag-platform/security/concepts/consent-mode
- Mise en œuvre du consentement : https://developers.google.com/tag-platform/security/guides/consent
- CNIL, mesure d'audience : https://www.cnil.fr/fr/mesurer-la-frequentation-de-vos-sites-web-et-de-vos-applications
- Mesures améliorées : https://support.google.com/analytics/answer/9216061?hl=fr
- Dimensions personnalisées : https://support.google.com/analytics/answer/14240153?hl=fr
