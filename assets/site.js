(function () {
    'use strict';

    const header = document.querySelector('.site-header');
    const darkSections = [...document.querySelectorAll('[data-header-theme="dark"]')];
    let observer;
    let scheduled = false;

    // La ligne médiane réelle du header détermine le fond qui le traverse.
    // Les dimensions sont recalculées après redimensionnement et chargement des polices.
    function updateHeader() {
        const box = header.getBoundingClientRect();
        const sampleY = box.top + box.height / 2;
        header.classList.toggle('is-dark', darkSections.some(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= sampleY && rect.bottom > sampleY;
        }));
        header.classList.toggle('is-scrolled', window.scrollY > 1);
        scheduled = false;
    }
    function scheduleHeader() {
        header.classList.toggle('is-scrolled', window.scrollY > 1);
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(updateHeader);
        }
    }
    function observeHeader() {
        const height = header.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${height + 16}px`);
        if (observer) observer.disconnect();
        if ('IntersectionObserver' in window) {
            const top = Math.min(Math.floor(height / 2), window.innerHeight - 1);
            observer = new IntersectionObserver(updateHeader, {
                rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - 1)}px 0px`,
                threshold: 0
            });
            darkSections.forEach(section => observer.observe(section));
        }
        updateHeader();
    }
    // Le scroll passif couvre également un saut d'ancre qui franchit toute une section.
    window.addEventListener('scroll', scheduleHeader, { passive: true });
    window.addEventListener('resize', observeHeader);
    window.addEventListener('pageshow', observeHeader);
    if ('ResizeObserver' in window) new ResizeObserver(observeHeader).observe(header);
    document.fonts.ready.then(observeHeader);
    observeHeader();

    const form = document.querySelector('#contact-form');
    const button = form.querySelector('button');
    const status = document.querySelector('#form-status');
    const fields = [...form.querySelectorAll('[required]')];
    let sending = false;
    button.disabled = false;
    fields.forEach(field => {
        field.addEventListener('input', () => field.setCustomValidity(''));
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;
        fields.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Veuillez remplir ce champ.'));
        if (!form.reportValidity()) return;
        if (form.elements.namedItem('botcheck').checked) return;
        const data = new FormData(form);
        data.set('access_key', window.MAISON_RIVIERA_CONTACT?.accessKey || '');
        fields.forEach(field => data.set(field.name, field.value.trim()));
        // Le champ reste libre pour accepter un téléphone aussi bien qu'un e-mail.
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.get('Pour vous joindre'))) {
            data.set('email', data.get('Pour vous joindre'));
        }
        sending = true;
        button.disabled = true;
        button.textContent = 'Envoi…';
        form.setAttribute('aria-busy', 'true');
        status.textContent = 'Envoi en cours…';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: JSON.stringify(Object.fromEntries(data)),
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                signal: controller.signal
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) throw new Error('Submission failed');
            status.textContent = 'Merci, votre message nous est bien parvenu.';
            form.reset();
        } catch (error) {
            const link = document.createElement('a');
            link.href = 'mailto:maisonriviera.mgmt@gmail.com';
            link.textContent = 'maisonriviera.mgmt@gmail.com';
            status.replaceChildren('Une erreur est survenue. Vous pouvez nous écrire directement à\u00a0', link, '.');
        } finally {
            clearTimeout(timeout);
            sending = false;
            button.disabled = false;
            button.textContent = 'Envoyer';
            form.removeAttribute('aria-busy');
        }
    });
}());
