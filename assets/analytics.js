/* Observation uniquement : les liens assurent eux-mêmes la navigation. */
(function () {
    'use strict';

    function trackClick(event) {
        // auxclick couvre l'ouverture au bouton central, sans compter le clic droit.
        if (event.type === 'auxclick' && event.button !== 1) return;
        var link = event.target.closest && event.target.closest('a[data-analytics-event]');
        if (!link || typeof window.gtag !== 'function') return;

        var name = link.dataset.analyticsEvent;
        var parameters;
        if (name === 'click_artiste') {
            parameters = { source_page: 'home', destination: 'artiste' };
        } else if (name === 'click_home') {
            parameters = { source_page: 'artiste', destination: 'home' };
        } else if (name === 'open_press_kit') {
            parameters = { click_source: link.dataset.clickSource, artist: 'legaly' };
        } else {
            return;
        }

        try {
            window.gtag('event', name, parameters);
        } catch (error) {
            // Un échec Analytics ne doit pas perturber l'interaction.
        }
    }

    document.addEventListener('click', trackClick, { passive: true });
    document.addEventListener('auxclick', trackClick, { passive: true });
}());
