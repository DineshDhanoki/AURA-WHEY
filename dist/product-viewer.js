(() => {
  const glass = plus => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6M6 10h8${plus ? 'M10 6v8' : ''}"/></svg>`;
  let dialog, stage, photo, trigger, zoom = 1, x = 0, y = 0, drag;
  function paint() {
    const width = stage.clientWidth, height = stage.clientHeight;
    const fit = Math.min(width / (photo.naturalWidth || 1), height / (photo.naturalHeight || 1));
    const maxX = Math.max(0, ((photo.naturalWidth || 1) * fit * zoom - width) / 2);
    const maxY = Math.max(0, ((photo.naturalHeight || 1) * fit * zoom - height) / 2);
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    photo.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    stage.classList.toggle('is-zoomed', zoom > 1);
    dialog.querySelector('[data-viewer="out"]').disabled = zoom <= 1;
    dialog.querySelector('[data-viewer="in"]').disabled = zoom >= 4;
    dialog.querySelector('output').textContent = `${Math.round(zoom * 100)}%`;
  }
  function changeZoom(next) {
    const previous = zoom;
    zoom = Math.min(4, Math.max(1, next));
    x *= zoom / previous; y *= zoom / previous;
    paint();
  }
  function endDrag(event) {
    if (!drag || (event && event.pointerId !== drag.id)) return;
    const id = drag.id;
    drag = null;
    if (stage.hasPointerCapture(id)) stage.releasePointerCapture(id);
    stage.classList.remove('is-dragging');
  }
  function createViewer() {
    dialog = document.createElement('dialog');
    dialog.className = 'product-viewer';
    dialog.setAttribute('aria-label', 'Product image viewer');
    dialog.innerHTML = `<div class="viewer-toolbar"><div class="viewer-zoom" role="group" aria-label="Image zoom"><button type="button" data-viewer="out" aria-label="Zoom out">${glass(false)}</button><button type="button" data-viewer="reset" aria-label="Reset zoom"><output aria-live="polite">100%</output></button><button type="button" data-viewer="in" aria-label="Zoom in">${glass(true)}</button></div><button type="button" data-viewer="close" aria-label="Close image viewer" autofocus>✕</button></div><div class="viewer-stage" tabindex="0" role="group" aria-label="Product image. Zoom in, then drag or use arrow keys to move."><img draggable="false" alt="" /></div><p class="viewer-help">Zoom in, then drag to explore</p>`;
    document.body.append(dialog);
    stage = dialog.querySelector('.viewer-stage');
    photo = stage.querySelector('img');
    photo.addEventListener('load', paint);
    dialog.addEventListener('click', event => {
      const action = event.target.closest('[data-viewer]')?.dataset.viewer;
      if (action === 'close' || event.target === dialog) dialog.close();
      if (action === 'in') changeZoom(zoom + .5);
      if (action === 'out') changeZoom(zoom - .5);
      if (action === 'reset') { x = y = 0; changeZoom(1); }
    });
    dialog.addEventListener('close', () => {
      endDrag();
      document.body.classList.remove('product-viewer-open');
      if (trigger?.isConnected) trigger.focus();
    });
    stage.addEventListener('pointerdown', event => {
      if (zoom <= 1 || !event.isPrimary || event.button !== 0) return;
      event.preventDefault();
      stage.focus({ preventScroll: true });
      drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x, y };
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      x = drag.x + event.clientX - drag.startX;
      y = drag.y + event.clientY - drag.startY;
      paint();
    });
    for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) stage.addEventListener(name, endDrag);
    stage.addEventListener('keydown', event => {
      const move = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
      if (move && zoom > 1) { event.preventDefault(); x += move[0]; y += move[1]; paint(); }
      if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(zoom + .5); }
      if (event.key === '-') { event.preventDefault(); changeZoom(zoom - .5); }
    });
    window.addEventListener('resize', () => { if (dialog.open) paint(); });
    window.addEventListener('popstate', () => { if (dialog.open) dialog.close(); });
  }
  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-image-viewer]');
    if (!opener) return;
    if (!dialog) createViewer();
    trigger = opener;
    const source = opener.querySelector('img');
    zoom = 1; x = y = 0;
    photo.src = source.currentSrc || source.src;
    photo.alt = source.alt;
    dialog.showModal();
    document.body.classList.add('product-viewer-open');
    paint();
  });
})();
