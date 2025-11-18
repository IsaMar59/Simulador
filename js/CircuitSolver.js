export class CircuitSolver {
  constructor() {
    // No state here, methods take components and wires as params
  }

  // Advanced: Nodal analysis solver for DC circuits (supports resistors, loads, switches, fuses, single battery reference)
  analyzeCircuitNodal(components, wires) {
    // Build connector list and union-find nets from wires
    const connKeys = [];
    Object.values(components).forEach(c => { connKeys.push(c.id + ':left'); connKeys.push(c.id + ':right'); });

    // union-find
    const parent = {};
    const find = (x) => { if (parent[x] === undefined) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
    const unite = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };

    wires.forEach(w => { const a = w.a.comp + ':' + w.a.which; const b = w.b.comp + ':' + w.b.which; unite(a, b); });

    // map connector -> net id
    const netMap = {}; let netCount = 0;
    connKeys.forEach(k => {
      const r = find(k);
      if (!(r in netMap)) netMap[r] = 'n' + (++netCount);
    });
    // assign each connector to net
    const connectorNet = {};
    connKeys.forEach(k => { connectorNet[k] = netMap[find(k)]; });

    // find battery and set reference (ground)
    const batteries = Object.values(components).filter(c => c.type === 'battery');
    if (batteries.length === 0) return { ok: false, reason: 'No se encontró batería' };
    const battery = batteries[0]; const Vbat = battery.value || 12;
    const bposNet = connectorNet[battery.id + ':right'];
    const bnegNet = connectorNet[battery.id + ':left'];
    if (!bposNet || !bnegNet) return { ok: false, reason: 'La batería no está conectada correctamente' };

    // nodes: each net except ground (bneg) is a variable; but node at bpos is a known voltage Vbat
    const groundNet = bnegNet;
    const knownVoltages = {};
    knownVoltages[bnegNet] = 0;
    knownVoltages[bposNet] = Vbat;

    // list unknown nets
    const nets = new Set(Object.values(connectorNet));
    const unknownNets = Array.from(nets).filter(n => !(n in knownVoltages));
    const idxOf = {}; unknownNets.forEach((n, i) => idxOf[n] = i);

    const N = unknownNets.length;
    // build A matrix NxN and b vector
    const A = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
    const b = Array.from({ length: N }, () => 0);

    // helper: add conductance between two nets (i,j) with value g
    const addConductance = (n1, n2, g) => {
      if (n1 === n2) return; // between same net ignored
      const i = idxOf[n1]; const j = idxOf[n2];
      if (i !== undefined) A[i][i] += g; else if (knownVoltages[n1] !== undefined) b[idxOf[n2]] += g * knownVoltages[n1];
      if (j !== undefined) A[j][j] += g; else if (knownVoltages[n2] !== undefined) b[idxOf[n1]] += g * knownVoltages[n2];
      if (i !== undefined && j !== undefined) { A[i][j] -= g; A[j][i] -= g; }
    };

    // iterate components and assemble
    Object.values(components).forEach(c => {
      const k1 = c.id + ':left'; const k2 = c.id + ':right';
      const n1 = connectorNet[k1]; const n2 = connectorNet[k2];
      if (!n1 || !n2) return;
      if (c.type === 'resistor' || c.type === 'bulb' || c.type === 'motor') {
        const R = (c.value && c.value > 0) ? c.value : (c.type === 'resistor' ? 10 : 5);
        const g = 1 / R;
        // if switch open or fuse blown treat as open circuit
        addConductance(n1, n2, g);
      } else if (c.type === 'ammeter') {
        // ammeter modeled as very low resistance (near short) to measure current
        addConductance(n1, n2, 1 / 0.001);
      } else if (c.type === 'voltmeter') {
        // voltmeter modeled as very high resistance to avoid loading circuit
        addConductance(n1, n2, 1 / 1e6);
      } else if (c.type === 'switch') {
        const closed = c.el.classList.contains('closed');
        if (closed) { addConductance(n1, n2, 1 / 0.01); } // low R when closed
      } else if (c.type === 'fuse') {
        if (!c.status.blown) { addConductance(n1, n2, 1 / 0.01); }
      } else if (c.type === 'battery') {
        // voltage source handled via knownVoltages above
      }
    });

    // handle case with no unknown nodes (all known) -> trivial
    if (N === 0) {
      // compute currents through components
      const voltages = {};
      Object.keys(connectorNet).forEach(k => { const net = connectorNet[k]; voltages[net] = knownVoltages[net]; });
      const compCurrents = {};
      Object.values(components).forEach(c => {
        const n1 = connectorNet[c.id + ':left']; const n2 = connectorNet[c.id + ':right'];
        const V1 = voltages[n1] || 0; const V2 = voltages[n2] || 0;
        let I = 0;
        if (c.type === 'resistor' || c.type === 'bulb' || c.type === 'motor') { const R = (c.value || 10); I = (V1 - V2) / R; }
        if (c.type === 'switch') I = c.el.classList.contains('closed') ? (V1 - V2) / 0.01 : 0;
        compCurrents[c.id] = I;
      });
      return { ok: true, voltages, compCurrents };
    }

    // solve linear system A x = b
    const solveLinear = (A, b) => {
      const n = A.length; const M = A.map(r => r.slice()); const B = b.slice();
      for (let k = 0; k < n; k++) {
        // find pivot
        let iMax = k; let maxVal = Math.abs(M[k][k]);
        for (let i = k + 1; i < n; i++) { if (Math.abs(M[i][k]) > maxVal) { maxVal = Math.abs(M[i][k]); iMax = i; } }
        if (maxVal < 1e-12) return null; // singular
        // swap rows
        if (iMax !== k) { [M[k], M[iMax]] = [M[iMax], M[k]]; [B[k], B[iMax]] = [B[iMax], B[k]]; }
        // normalize and eliminate
        const pivot = M[k][k];
        for (let j = k; j < n; j++) M[k][j] /= pivot; B[k] /= pivot;
        for (let i = 0; i < n; i++) if (i !== k) { const factor = M[i][k]; for (let j = k; j < n; j++) M[i][j] -= factor * M[k][j]; B[i] -= factor * B[k]; }
      }
      return B;
    };

    const x = solveLinear(A, b);
    if (x === null) return { ok: false, reason: 'Sistema singular (no se puede resolver)' };

    // assemble voltages
    const voltages = {};
    Object.keys(connectorNet).forEach(k => { const net = connectorNet[k]; if (knownVoltages[net] !== undefined) voltages[net] = knownVoltages[net]; else voltages[net] = x[idxOf[net]]; });

    // compute currents per component
    const compCurrents = {};
    Object.values(components).forEach(c => {
      const n1 = connectorNet[c.id + ':left']; const n2 = connectorNet[c.id + ':right'];
      const V1 = voltages[n1] || 0; const V2 = voltages[n2] || 0;
      let I = 0;
      if (c.type === 'resistor' || c.type === 'bulb' || c.type === 'motor') { const R = (c.value || 10); I = (V1 - V2) / R; }
      else if (c.type === 'ammeter') { const R = 0.001; I = (V1 - V2) / R; }
      else if (c.type === 'switch') I = c.el.classList.contains('closed') ? (V1 - V2) / 0.01 : 0;
      else if (c.type === 'fuse') I = (!c.status.blown) ? (V1 - V2) / 0.01 : 0;
      else if (c.type === 'battery') {
        // current delivered by battery: sum of currents leaving positive node across connected components
        I = 0; // compute later
      }
      compCurrents[c.id] = I;
    });

    // compute battery current by summing currents of elements connected to its positive net
    let batteryCurrent = 0;
    Object.values(components).forEach(c => {
      const n1 = connectorNet[c.id + ':left']; const n2 = connectorNet[c.id + ':right'];
      if (n1 === bposNet || n2 === bposNet) { batteryCurrent += Math.abs(compCurrents[c.id] || 0); }
    });

    return { ok: true, voltages, compCurrents, batteryCurrent };
  }

  // Helper to get connectorNet for updateMeters
  getConnectorNet(components, wires) {
    const connKeys = [];
    Object.values(components).forEach(c => { connKeys.push(c.id + ':left'); connKeys.push(c.id + ':right'); });
    const parent = {};
    const find = (x) => { if (parent[x] === undefined) parent[x] = x; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
    const unite = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
    wires.forEach(w => { unite(w.a.comp + ':' + w.a.which, w.b.comp + ':' + w.b.which); });
    const netMap = {}; let netCount = 0;
    connKeys.forEach(k => { const r = find(k); if (!(r in netMap)) netMap[r] = 'n' + (++netCount); });
    const connectorNet = {};
    connKeys.forEach(k => { connectorNet[k] = netMap[find(k)]; });
    return connectorNet;
  }
}