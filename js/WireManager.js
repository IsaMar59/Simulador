export class WireManager {
  constructor(svg, board, components) {
    this.svg = svg;
    this.board = board;
    this.components = components; // reference to components
    this.wires = []; // {id, a:{comp,conn}, b:{comp,conn}, line}
    this.pendingConnector = null;
  }

  onConnectorClick(compId, which) {
    const comp = this.components[compId];
    const connKey = compId + ':' + which;
    if (this.pendingConnector === null) {
      this.pendingConnector = { compId, which };
      this.highlightConnector(compId, which, true);
    } else {
      // if same connector clicked -> cancel
      if (this.pendingConnector.compId === compId && this.pendingConnector.which === which) {
        this.highlightConnector(compId, which, false); this.pendingConnector = null; return;
      }
      // create wire
      const id = 'w' + (this.wires.length + 1);
      const a = { comp: this.pendingConnector.compId, which: this.pendingConnector.which };
      const b = { comp: compId, which };
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      line.classList.add('wire', 'flow-anim');
      this.svg.appendChild(line);
      this.wires.push({ id, a, b, line });
      this.highlightConnector(a.comp, a.which, false);
      this.pendingConnector = null;
      this.updateWiresPositions();
    }
  }

  highlightConnector(compId, which, on) {
    const el = this.components[compId].el.querySelector('.connector.' + which);
    if (!el) return;
    el.style.boxShadow = on ? '0 0 8px rgba(27,199,177,0.6)' : 'none';
  }

  updateWiresPositions() {
    const rect = this.board.getBoundingClientRect();
    this.wires.forEach(w => {
      const aEl = this.components[w.a.comp].el.querySelector('.connector.' + w.a.which);
      const bEl = this.components[w.b.comp].el.querySelector('.connector.' + w.b.which);
      if (!aEl || !bEl) return;
      const aRect = aEl.getBoundingClientRect(); const bRect = bEl.getBoundingClientRect();
      const ax = aRect.left - rect.left + aRect.width / 2; const ay = aRect.top - rect.top + aRect.height / 2;
      const bx = bRect.left - rect.left + bRect.width / 2; const by = bRect.top - rect.top + bRect.height / 2;
      // draw a simple cubic curve
      const dx = Math.abs(bx - ax);
      const c1x = ax + dx * 0.3; const c1y = ay;
      const c2x = bx - dx * 0.3; const c2y = by;
      const d = `M ${ax} ${ay} C ${c1x} ${c1y} ${c2x} ${c2y} ${bx} ${by}`;
      w.line.setAttribute('d', d);
    });
  }

  reset() {
    this.wires.forEach(w => { if (w.line && w.line.parentElement) w.line.parentElement.removeChild(w.line); });
    this.wires.length = 0;
    this.pendingConnector = null;
  }

  getWires() {
    return this.wires;
  }
}