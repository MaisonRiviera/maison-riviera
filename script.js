(() => {
    const dialog = document.querySelector('#press-kit-dialog');
    if (!dialog) return;

    const trigger = document.querySelector('.press-kit-trigger');
    const closeButton = dialog.querySelector('.press-kit-close');
    const viewer = dialog.querySelector('.press-kit-viewer');
    const status = dialog.querySelector('.press-kit-status');
    const mobile = window.matchMedia('(max-width: 767px)');
    let scrollPosition;
    let bodyStyle;
    let rootOverflow;
    let startedOutside = false;

    function loadPDF() {
        viewer.replaceChildren();
        viewer.hidden = true;
        status.hidden = false;
        status.textContent = 'Chargement du press kit…';
        const pages = window.pressKitPages?.[mobile.matches ? 'vertical' : 'horizontal'];
        if (!pages?.length) {
            status.textContent = 'Le press kit n’est pas encore disponible.';
            return;
        }
        pages.forEach((page, index) => {
            const figure = document.createElement('figure');
            figure.className = 'press-kit-page';
            const image = document.createElement('img');
            image.src = page.src;
            image.width = page.width;
            image.height = page.height;
            image.alt = `Press kit LEGALY — page ${index + 1} sur ${pages.length}`;
            image.loading = index === 0 ? 'eager' : 'lazy';
            image.addEventListener('error', () => {
                status.hidden = false;
                status.textContent = 'Une page du press kit n’a pas pu être chargée. Veuillez réessayer.';
            });
            figure.append(image);
            const layer = document.createElement('div');
            layer.className = 'press-kit-annotations';
            for (const annotation of page.links || []) {
                const link = document.createElement('a');
                link.href = annotation.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.setAttribute('aria-label', `${annotation.label} (nouvel onglet)`);
                Object.assign(link.style, {
                    left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`,
                    width: `${annotation.width * 100}%`, height: `${annotation.height * 100}%`
                });
                layer.append(link);
            }
            figure.append(layer);
            if (page.text) {
                const caption = document.createElement('figcaption');
                caption.className = 'press-kit-transcript';
                caption.textContent = page.text;
                figure.append(caption);
            }
            viewer.append(figure);
        });
        viewer.hidden = false;
        status.hidden = true;
        viewer.scrollTop = 0;
        positionAnnotations();
    }

    function positionAnnotations() {
        viewer.querySelectorAll('.press-kit-page').forEach((figure) => {
            const image = figure.querySelector('img');
            const layer = figure.querySelector('.press-kit-annotations');
            // Reproduit object-fit: contain, y compris ses marges centrées.
            const scale = Math.min(image.clientWidth / image.width, image.clientHeight / image.height);
            const width = image.width * scale;
            const height = image.height * scale;
            Object.assign(layer.style, {
                left: `${image.offsetLeft + (image.clientWidth - width) / 2}px`,
                top: `${image.offsetTop + (image.clientHeight - height) / 2}px`,
                width: `${width}px`, height: `${height}px`
            });
        });
    }

    new ResizeObserver(positionAnnotations).observe(viewer);

    trigger.addEventListener('click', () => {
        if (dialog.open) return;
        scrollPosition = { x: window.scrollX, y: window.scrollY };
        bodyStyle = document.body.getAttribute('style');
        rootOverflow = document.documentElement.style.overflow;
        const scrollbar = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.overflow = 'hidden';
        Object.assign(document.body.style, {
            position: 'fixed', top: `-${scrollPosition.y}px`,
            left: `-${scrollPosition.x}px`, width: '100%',
            paddingRight: `${scrollbar}px`
        });
        // showModal rend le reste de la page inerte et confine le focus.
        dialog.showModal();
        closeButton.focus({ preventScroll: true });
        loadPDF();
    });

    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        dialog.close();
    });

    const isOutside = (event) => {
        const rect = dialog.getBoundingClientRect();
        return event.clientX < rect.left || event.clientX > rect.right
            || event.clientY < rect.top || event.clientY > rect.bottom;
    };
    dialog.addEventListener('pointerdown', (event) => {
        startedOutside = event.target === dialog && isOutside(event);
    });
    dialog.addEventListener('click', (event) => {
        if (startedOutside && event.target === dialog && isOutside(event)) dialog.close();
        startedOutside = false;
    });

    dialog.addEventListener('close', () => {
        viewer.replaceChildren();
        viewer.hidden = true;
        document.documentElement.style.overflow = rootOverflow;
        if (bodyStyle === null) document.body.removeAttribute('style');
        else document.body.setAttribute('style', bodyStyle);
        window.scrollTo(scrollPosition.x, scrollPosition.y);
        trigger.focus({ preventScroll: true });
    });

    mobile.addEventListener('change', () => {
        if (dialog.open) loadPDF();
    });
})();
