export class UIManager {
  constructor(board, svg, componentManager, wireManager, circuitSolver) {
    this.board = board;
    this.svg = svg;
    this.componentManager = componentManager;
    this.wireManager = wireManager;
    this.circuitSolver = circuitSolver;
    this.chkFault = document.getElementById('chk-fault-mode');

    // Notification system
    this.notificationDiv = document.createElement('div');
    this.notificationDiv.id = 'notification';
    this.notificationDiv.style.position = 'fixed';
    this.notificationDiv.style.top = '10px';
    this.notificationDiv.style.right = '10px';
    this.notificationDiv.style.background = 'rgba(0,0,0,0.8)';
    this.notificationDiv.style.color = 'white';
    this.notificationDiv.style.padding = '10px';
    this.notificationDiv.style.borderRadius = '5px';
    this.notificationDiv.style.display = 'none';
    this.notificationDiv.style.zIndex = '1000';
    document.body.appendChild(this.notificationDiv);

    this.initEventListeners();
    this.initHelpModal();
    this.syncSvgSize();
  }

  initEventListeners() {
    // Palette drag
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(it => {
      it.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ type: it.dataset.type, value: it.dataset.value || null }));
      });
    });

    // Board drop
    ['dragover', 'dragenter'].forEach(ev => {
      this.board.addEventListener(ev, e => { e.preventDefault(); });
    });
    this.board.addEventListener('drop', e => {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const rect = this.board.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      this.componentManager.addComponent(data.type, data.value, x, y);
    });

    // Buttons
    const btnSim = document.getElementById('btn-simulate');
    const btnStop = document.getElementById('btn-stop');
    const btnReset = document.getElementById('btn-reset');
    btnSim.addEventListener('click', () => this.applySimulation());
    btnStop.addEventListener('click', () => this.stopSimulation());
    btnReset.addEventListener('click', () => { if (confirm('Resetear tablero?')) this.resetAll(); });

    // Double click for switches/fuses
    this.board.addEventListener('dblclick', e => {
      const compEl = e.target.closest('.component');
      if (!compEl) return;
      const cid = compEl.dataset.id;
      const c = this.componentManager.getComponents()[cid];
      if (c.type === 'switch') {
        const closed = compEl.classList.toggle('closed');
        compEl.style.borderColor = closed ? 'rgba(27,199,177,0.6)' : '';
      }
      if (c.type === 'fuse') {
        c.status.blown = !c.status.blown;
        compEl.style.opacity = c.status.blown ? 0.4 : 1;
      }
    });

    // Resize
    window.addEventListener('resize', () => { this.syncSvgSize(); this.wireManager.updateWiresPositions(); });
    new ResizeObserver(() => { this.syncSvgSize(); this.wireManager.updateWiresPositions(); }).observe(this.board);
  }

  showNotification(message, type = 'info') {
    this.notificationDiv.textContent = message;
    this.notificationDiv.style.background = type === 'error' ? 'rgba(255,0,0,0.8)' : 'rgba(0,128,0,0.8)';
    this.notificationDiv.style.display = 'block';
    setTimeout(() => { this.notificationDiv.style.display = 'none'; }, 3000);
  }

  applySimulation() {
    const components = this.componentManager.getComponents();
    const wires = this.wireManager.getWires();

    // Pre-validation
    const batteries = Object.values(components).filter(c => c.type === 'battery');
    if (batteries.length === 0) {
      this.showNotification('No se encontró batería', 'error');
      console.warn('Simulation failed: No battery found');
      return;
    }

    const res = this.circuitSolver.analyzeCircuitNodal(components, wires);
    // clear previous states
    Object.values(components).forEach(c => { c.status.on = false; c.el.classList.remove('on'); });
    wires.forEach(w => w.line.classList.remove('active'));

    if (!res.ok) {
      this.showNotification('Simulación: ' + res.reason, 'error');
      console.warn('Simulation failed:', res.reason);
      return;
    }

    // mark wires active and animate
    wires.forEach(w => w.line.classList.add('active'));

    // mark components active based on current magnitude
    const currents = res.compCurrents || {};
    const fuseThreshold = 2.0; // A threshold to blow fuses in fault mode
    Object.keys(currents).forEach(cid => {
      const I = Math.abs(currents[cid] || 0);
      const c = components[cid]; if (!c) return;
      if (I > 1e-3) { c.status.on = true; c.el.classList.add('on'); }
      if (c.type === 'fuse' && this.chkFault.checked && I > fuseThreshold) { c.status.blown = true; c.el.style.opacity = 0.4; }
    });

    // update meter displays
    this.updateMeters(res);

    // show a summary
    setTimeout(() => {
      const batt = res.batteryCurrent || 0;
      this.showNotification(`Simulación completa. Corriente batería ≈ ${batt.toFixed(2)} A`);
    }, 100);
  }

  stopSimulation() {
    const components = this.componentManager.getComponents();
    const wires = this.wireManager.getWires();
    wires.forEach(w => w.line.classList.remove('active'));
    Object.values(components).forEach(c => c.el.classList.remove('on'));
    // clear meters
    Object.values(components).forEach(c => {
      if (c.meterDisplay) {
        if (c.type === 'voltmeter') c.meterDisplay.textContent = 'V: --';
        if (c.type === 'ammeter') c.meterDisplay.textContent = 'I: --';
      }
    });
  }

  resetAll() {
    this.componentManager.reset();
    this.wireManager.reset();
  }

  updateMeters(res) {
    if (!res) return;
    const voltages = res.voltages || {};
    const currents = res.compCurrents || {};
    const components = this.componentManager.getComponents();
    const wires = this.wireManager.getWires();
    const connectorNet = this.circuitSolver.getConnectorNet(components, wires);
    Object.values(components).forEach(c => {
      if (!c.meterDisplay) return;
      if (c.type === 'voltmeter') {
        const n1 = connectorNet[c.id + ':left']; const n2 = connectorNet[c.id + ':right'];
        const V1 = voltages[n1] !== undefined ? voltages[n1] : 0;
        const V2 = voltages[n2] !== undefined ? voltages[n2] : 0;
        const diff = (V1 - V2) || 0;
        c.meterDisplay.textContent = `V: ${diff.toFixed(2)} V`;
      }
      if (c.type === 'ammeter') {
        const I = Math.abs(currents[c.id] || 0);
        c.meterDisplay.textContent = `I: ${I.toFixed(3)} A`;
      }
    });
  }

  initHelpModal() {
    const modal = document.getElementById('help-modal');
    const trigger = document.getElementById('help-trigger');
    const closeBtn = document.getElementById('modal-close');
    const closeFooter = document.getElementById('modal-close-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (!modal || !trigger) return;

    const openModal = () => { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; };
    const closeModal = () => { modal.style.display = 'none'; document.body.style.overflow = 'auto'; };

    trigger.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeFooter) closeFooter.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabButtons.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById('tab-' + tab);
        if (pane) pane.classList.add('active');
      });
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.style.display === 'flex') closeModal(); });
  }

  syncSvgSize() {
    const r = this.board.getBoundingClientRect();
    this.svg.setAttribute('width', r.width);
    this.svg.setAttribute('height', r.height);
    this.svg.style.width = '100%';
    this.svg.style.height = '100%';
  }
}