export class ComponentManager {
  constructor(board, onConnectorClick) {
    this.board = board;
    this.onConnectorClick = onConnectorClick;
    this.idCounter = 1;
    this.components = {}; // id -> component
  }

  // Create a visual component and connectors
  addComponent(type, value, x, y) {
    const id = 'c' + (this.idCounter++);
    const el = document.createElement('div');
    el.className = 'component comp-' + type;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.dataset.id = id;
    const title = document.createElement('div'); title.className = 'title'; title.textContent = type.toUpperCase();
    el.appendChild(title);
    // extras
    const info = document.createElement('div'); info.className = 'info'; info.style.fontSize = '0.8rem'; info.style.marginTop = '6px';
    if (value) info.textContent = (type === 'battery' ? value + 'V' : (type === 'resistor' ? value + 'Ω' : ''));
    el.appendChild(info);

    // meter display for voltmeter/ammeter
    let meterDisplay = null;
    if (type === 'voltmeter' || type === 'ammeter') {
      meterDisplay = document.createElement('div'); meterDisplay.className = 'meter-read'; meterDisplay.textContent = type === 'voltmeter' ? 'V: --' : 'I: --';
      meterDisplay.style.marginTop = '8px'; meterDisplay.style.fontSize = '0.85rem'; meterDisplay.style.color = 'var(--muted)';
      el.appendChild(meterDisplay);
    }

    // connectors left and right for simplicity
    const left = document.createElement('div'); left.className = 'connector left'; left.dataset.which = 'left';
    const right = document.createElement('div'); right.className = 'connector right'; right.dataset.which = 'right';
    el.appendChild(left); el.appendChild(right);

    this.board.appendChild(el);

    // store
    this.components[id] = { id, type, value: value ? Number(value) : null, el, connectors: { left: null, right: null }, status: { on: false, blown: false }, meterDisplay };

    // make component draggable inside board
    this.makeMovable(el);

    // connector click handlers for creating wires
    [left, right].forEach(conn => {
      conn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this.onConnectorClick(id, conn.dataset.which);
      });
    });
  }

  makeMovable(el) {
    let ox = 0, oy = 0, dx = 0, dy = 0, dragging = false;
    el.addEventListener('pointerdown', e => {
      if (e.target.classList.contains('connector')) return; // don't start move on connector
      dragging = true; el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect(); const boardRect = this.board.getBoundingClientRect();
      ox = e.clientX - rect.left; oy = e.clientY - rect.top;
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const boardRect = this.board.getBoundingClientRect();
      let nx = e.clientX - boardRect.left - ox; let ny = e.clientY - boardRect.top - oy;
      nx = Math.max(0, Math.min(boardRect.width - 30, nx)); ny = Math.max(0, Math.min(boardRect.height - 30, ny));
      el.style.left = nx + 'px'; el.style.top = ny + 'px';
      // updateWiresPositions will be called externally
    });
    window.addEventListener('pointerup', e => { if (dragging) { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (e) { } } });
  }

  reset() {
    Object.values(this.components).forEach(c => { if (c.el && c.el.parentElement) c.el.parentElement.removeChild(c.el); });
    Object.keys(this.components).forEach(k => delete this.components[k]);
    this.idCounter = 1;
  }

  getComponents() {
    return this.components;
  }
}