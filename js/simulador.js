// Simulador básico - drag & drop, conectar por conectores, simulación DC simple
(function(){
  const board = document.getElementById('board');
  const svg = document.getElementById('wireLayer');
  const paletteItems = document.querySelectorAll('.palette-item');
  const btnSim = document.getElementById('btn-simulate');
  const btnStop = document.getElementById('btn-stop');
  const btnReset = document.getElementById('btn-reset');
  const chkFault = document.getElementById('chk-fault-mode');

  let idCounter = 1;
  const components = {}; // id -> {type,value,el,connectors:{a,b}}
  const wires = []; // {id, a:{comp,conn}, b:{comp,conn}, line}
  let pendingConnector = null;

  // enable palette drag
  paletteItems.forEach(it=>{
    it.addEventListener('dragstart', e=>{
      e.dataTransfer.setData('text/plain', JSON.stringify({type:it.dataset.type, value:it.dataset.value||null}));
    });
  });

  // allow drop on board
  ['dragover','dragenter'].forEach(ev=>{
    board.addEventListener(ev,e=>{e.preventDefault();});
  });
  board.addEventListener('drop', e=>{
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    addComponent(data.type, data.value, x, y);
  });

  // Create a visual component and connectors
  function addComponent(type, value, x, y){
    const id = 'c'+(idCounter++);
    const el = document.createElement('div');
    el.className = 'component comp-'+type;
    el.style.left = x+'px'; el.style.top = y+'px';
    el.dataset.id = id;
    const title = document.createElement('div'); title.className='title'; title.textContent = type.toUpperCase();
    el.appendChild(title);
    // extras
    const info = document.createElement('div'); info.className='info'; info.style.fontSize='0.8rem'; info.style.marginTop='6px';
    if(value) info.textContent = (type==='battery'? value+'V' : (type==='resistor'? value+'Ω' : ''));
    el.appendChild(info);

    // meter display for voltmeter/ammeter
    let meterDisplay = null;
    if(type==='voltmeter' || type==='ammeter'){
      meterDisplay = document.createElement('div'); meterDisplay.className='meter-read'; meterDisplay.textContent = type==='voltmeter' ? 'V: --' : 'I: --';
      meterDisplay.style.marginTop='8px'; meterDisplay.style.fontSize='0.85rem'; meterDisplay.style.color='var(--muted)';
      el.appendChild(meterDisplay);
    }

    // connectors left and right for simplicity
    const left = document.createElement('div'); left.className='connector left'; left.dataset.which='left';
    const right = document.createElement('div'); right.className='connector right'; right.dataset.which='right';
    el.appendChild(left); el.appendChild(right);

    board.appendChild(el);

    // store
  components[id] = {id,type,value: value?Number(value):null, el, connectors:{left:null,right:null}, status:{on:false,blown:false}, meterDisplay };

    // make component draggable inside board
    makeMovable(el);

    // connector click handlers for creating wires
    [left,right].forEach(conn => {
      conn.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        onConnectorClick(id, conn.dataset.which);
      });
    });
  }

  function makeMovable(el){
    let ox=0,oy=0,dx=0,dy=0,dragging=false;
    el.addEventListener('pointerdown', e=>{
      if(e.target.classList.contains('connector')) return; // don't start move on connector
      dragging=true; el.setPointerCapture(e.pointerId);
      const rect = el.getBoundingClientRect(); const boardRect = board.getBoundingClientRect();
      ox = e.clientX - rect.left; oy = e.clientY - rect.top;
    });
    window.addEventListener('pointermove', e=>{
      if(!dragging) return;
      const boardRect = board.getBoundingClientRect();
      let nx = e.clientX - boardRect.left - ox; let ny = e.clientY - boardRect.top - oy;
      nx = Math.max(0, Math.min(boardRect.width-30, nx)); ny = Math.max(0, Math.min(boardRect.height-30, ny));
      el.style.left = nx+'px'; el.style.top = ny+'px';
      updateWiresPositions();
    });
    window.addEventListener('pointerup', e=>{ if(dragging){ dragging=false; try{ el.releasePointerCapture(e.pointerId);}catch(e){} } });
  }

  // connector workflow
  function onConnectorClick(compId, which){
    const comp = components[compId];
    const connKey = compId+':'+which;
    if(pendingConnector === null){
      pendingConnector = {compId, which};
      highlightConnector(compId, which, true);
    } else {
      // if same connector clicked -> cancel
      if(pendingConnector.compId === compId && pendingConnector.which === which){
        highlightConnector(compId, which, false); pendingConnector = null; return;
      }
      // create wire
      const id = 'w'+(wires.length+1);
      const a = {comp: pendingConnector.compId, which: pendingConnector.which};
      const b = {comp: compId, which};
      const line = document.createElementNS('http://www.w3.org/2000/svg','path');
      line.classList.add('wire','flow-anim');
      svg.appendChild(line);
      wires.push({id,a,b,line});
      highlightConnector(a.comp, a.which, false);
      pendingConnector = null;
      updateWiresPositions();
    }
  }

  function highlightConnector(compId, which, on){
    const el = components[compId].el.querySelector('.connector.'+which);
    if(!el) return; el.style.boxShadow = on ? '0 0 8px rgba(27,199,177,0.6)' : 'none';
  }

  function updateWiresPositions(){
    const rect = board.getBoundingClientRect();
    wires.forEach(w=>{
      const aEl = components[w.a.comp].el.querySelector('.connector.'+w.a.which);
      const bEl = components[w.b.comp].el.querySelector('.connector.'+w.b.which);
      if(!aEl||!bEl) return;
      const aRect = aEl.getBoundingClientRect(); const bRect = bEl.getBoundingClientRect();
      const ax = aRect.left - rect.left + aRect.width/2; const ay = aRect.top - rect.top + aRect.height/2;
      const bx = bRect.left - rect.left + bRect.width/2; const by = bRect.top - rect.top + bRect.height/2;
      // draw a simple cubic curve
      const dx = Math.abs(bx-ax);
      const c1x = ax + dx*0.3; const c1y = ay;
      const c2x = bx - dx*0.3; const c2y = by;
      const d = `M ${ax} ${ay} C ${c1x} ${c1y} ${c2x} ${c2y} ${bx} ${by}`;
      w.line.setAttribute('d', d);
    });
  }

  // Basic circuit analysis: support single battery and single path (series)
  function analyzeCircuit(){
    // find batteries
    const batteries = Object.values(components).filter(c=>c.type==='battery');
    if(batteries.length===0) return {ok:false, reason:'No se encontró batería'};
    const battery = batteries[0];
    const V = battery.value||12;

    // build graph nodes as connector endpoints; nodeId by connectivity
    // each connector is a node; wires join connectors
    const connNodes = {};
    // initialize node id map
    Object.values(components).forEach(c=>{
      ['left','right'].forEach(w=>{ connNodes[c.id+':'+w] = {comp:c.id, which:w, edges:[]} });
    });
    wires.forEach(w=>{
      const aKey = w.a.comp+':'+w.a.which; const bKey = w.b.comp+':'+w.b.which;
      connNodes[aKey].edges.push(bKey);
      connNodes[bKey].edges.push(aKey);
    });

    // find connector keys for battery positive/negative: assume left=neg right=pos for battery
    const bpos = battery.id+':right'; const bneg = battery.id+':left';

    // find path from bpos to bneg (simple path) via DFS
    const visited = new Set(); let path=null;
    function dfs(u, curPath){
      if(u===bneg){ path = [...curPath]; return true; }
      visited.add(u);
      for(const v of (connNodes[u].edges||[])){
        if(visited.has(v)) continue;
        if(dfs(v, curPath.concat([v]))) return true;
      }
      return false;
    }
    dfs(bpos, [bpos]);
    if(!path){ return {ok:false, reason:'No hay camino cerrado entre + y - de la batería (circuito abierto o falta de conexiones)'}; }

    // collect components encountered along path (unique)
    const compPath = new Set();
    path.forEach(connKey=>{
      const compId = connNodes[connKey].comp; compPath.add(compId);
    });
    // remove battery itself
    compPath.delete(battery.id);

    // compute total resistance of series components: resistors and bulb/motor loads
    let Rtot = 0; let hasSwitchOpen=false; let fuseBlown=false;
    compPath.forEach(cid=>{
      const c = components[cid];
      if(c.type==='resistor') Rtot += (c.value||10);
      if(c.type==='bulb' || c.type==='motor') Rtot += (c.value||5);
      if(c.type==='switch'){ if(!c.el.classList.contains('closed')) hasSwitchOpen=true; }
      if(c.type==='fuse' && c.status.blown) fuseBlown=true;
    });

    if(hasSwitchOpen) return {ok:false, reason:'Hay un interruptor abierto en la trayectoria'};
    if(fuseBlown) return {ok:false, reason:'Fusible quemado en la trayectoria'};
    if(Rtot<=0) return {ok:false, reason:'Resistencia nula (posible cortocircuito)'};

    const I = V / Rtot; // A
    return {ok:true, V, I, Rtot, path, compPath:Array.from(compPath)};
  }

  // Advanced: Nodal analysis solver for DC circuits (supports resistors, loads, switches, fuses, single battery reference)
  function analyzeCircuitNodal(){
    // Build connector list and union-find nets from wires
    const connKeys = [];
    Object.values(components).forEach(c=>{ connKeys.push(c.id+':left'); connKeys.push(c.id+':right'); });

    // union-find
    const parent = {};
    function find(x){ if(parent[x]===undefined) parent[x]=x; return parent[x]===x?x:(parent[x]=find(parent[x])); }
    function unite(a,b){ const ra=find(a), rb=find(b); if(ra!==rb) parent[rb]=ra; }

    wires.forEach(w=>{ const a=w.a.comp+':'+w.a.which; const b=w.b.comp+':'+w.b.which; unite(a,b); });

    // map connector -> net id
    const netMap = {}; let netCount=0;
    connKeys.forEach(k=>{
      const r = find(k);
      if(!(r in netMap)) netMap[r] = 'n'+(++netCount);
    });
    // assign each connector to net
    const connectorNet = {};
    connKeys.forEach(k=>{ connectorNet[k] = netMap[find(k)]; });

    // find battery and set reference (ground)
    const batteries = Object.values(components).filter(c=>c.type==='battery');
    if(batteries.length===0) return {ok:false, reason:'No se encontró batería'};
    const battery = batteries[0]; const Vbat = battery.value||12;
    const bposNet = connectorNet[battery.id+':right'];
    const bnegNet = connectorNet[battery.id+':left'];
    if(!bposNet || !bnegNet) return {ok:false, reason:'La batería no está conectada correctamente'};

    // nodes: each net except ground (bneg) is a variable; but node at bpos is a known voltage Vbat
    const groundNet = bnegNet;
    const knownVoltages = {};
    knownVoltages[bnegNet] = 0;
    knownVoltages[bposNet] = Vbat;

    // list unknown nets
    const nets = new Set(Object.values(connectorNet));
    const unknownNets = Array.from(nets).filter(n=>!(n in knownVoltages));
    const idxOf = {}; unknownNets.forEach((n,i)=> idxOf[n]=i);

    const N = unknownNets.length;
    // build A matrix NxN and b vector
    const A = Array.from({length:N}, ()=>Array.from({length:N}, ()=>0));
    const b = Array.from({length:N}, ()=>0);

    // helper: add conductance between two nets (i,j) with value g
    function addConductance(n1,n2,g){
      if(n1===n2) return; // between same net ignored
      const i = idxOf[n1]; const j = idxOf[n2];
      if(i!==undefined) A[i][i] += g; else if(knownVoltages[n1]!==undefined) b[idxOf[n2]] += g*knownVoltages[n1];
      if(j!==undefined) A[j][j] += g; else if(knownVoltages[n2]!==undefined) b[idxOf[n1]] += g*knownVoltages[n2];
      if(i!==undefined && j!==undefined){ A[i][j] -= g; A[j][i] -= g; }
    }

    // iterate components and assemble
    Object.values(components).forEach(c=>{
      const k1 = c.id+':left'; const k2 = c.id+':right';
      const n1 = connectorNet[k1]; const n2 = connectorNet[k2];
      if(!n1 || !n2) return;
      if(c.type==='resistor' || c.type==='bulb' || c.type==='motor'){
        const R = (c.value && c.value>0) ? c.value : (c.type==='resistor'?10:5);
        const g = 1/ R;
        // if switch open or fuse blown treat as open circuit
        addConductance(n1,n2,g);
      } else if(c.type==='ammeter'){
        // ammeter modeled as very low resistance (near short) to measure current
        addConductance(n1,n2, 1/0.001);
      } else if(c.type==='voltmeter'){
        // voltmeter modeled as very high resistance to avoid loading circuit
        addConductance(n1,n2, 1/1e6);
      } else if(c.type==='switch'){
        const closed = c.el.classList.contains('closed');
        if(closed){ addConductance(n1,n2, 1/0.01 ); } // low R when closed
      } else if(c.type==='fuse'){
        if(!c.status.blown){ addConductance(n1,n2, 1/0.01 ); }
      } else if(c.type==='battery'){
        // voltage source handled via knownVoltages above
      }
    });

    // handle case with no unknown nodes (all known) -> trivial
    if(N===0){
      // compute currents through components
      const voltages = {};
      Object.keys(connectorNet).forEach(k=>{ const net=connectorNet[k]; voltages[net]= knownVoltages[net]; });
      const compCurrents = {};
      Object.values(components).forEach(c=>{
        const n1 = connectorNet[c.id+':left']; const n2 = connectorNet[c.id+':right'];
        const V1 = voltages[n1]||0; const V2 = voltages[n2]||0;
        let I = 0;
        if(c.type==='resistor' || c.type==='bulb' || c.type==='motor'){ const R=(c.value||10); I=(V1-V2)/R; }
        if(c.type==='switch') I = c.el.classList.contains('closed') ? (V1-V2)/0.01 : 0;
        compCurrents[c.id]=I;
      });
      return {ok:true, voltages, compCurrents};
    }

    // solve linear system A x = b
    function solveLinear(A,b){
      const n = A.length; const M = A.map(r=>r.slice()); const B = b.slice();
      for(let k=0;k<n;k++){
        // find pivot
        let iMax = k; let maxVal = Math.abs(M[k][k]);
        for(let i=k+1;i<n;i++){ if(Math.abs(M[i][k])>maxVal){ maxVal=Math.abs(M[i][k]); iMax=i; } }
        if(maxVal < 1e-12) return null; // singular
        // swap rows
        if(iMax!==k){ [M[k], M[iMax]] = [M[iMax], M[k]]; [B[k], B[iMax]]=[B[iMax], B[k]]; }
        // normalize and eliminate
        const pivot = M[k][k];
        for(let j=k;j<n;j++) M[k][j] /= pivot; B[k]/=pivot;
        for(let i=0;i<n;i++) if(i!==k){ const factor = M[i][k]; for(let j=k;j<n;j++) M[i][j] -= factor*M[k][j]; B[i] -= factor*B[k]; }
      }
      return B;
    }

    const x = solveLinear(A,b);
    if(x===null) return {ok:false, reason:'Sistema singular (no se puede resolver)'};

    // assemble voltages
    const voltages = {};
    Object.keys(connectorNet).forEach(k=>{ const net = connectorNet[k]; if(knownVoltages[net]!==undefined) voltages[net]=knownVoltages[net]; else voltages[net]= x[idxOf[net]]; });

    // compute currents per component
    const compCurrents = {};
    Object.values(components).forEach(c=>{
      const n1 = connectorNet[c.id+':left']; const n2 = connectorNet[c.id+':right'];
      const V1 = voltages[n1]||0; const V2 = voltages[n2]||0;
      let I = 0;
  if(c.type==='resistor' || c.type==='bulb' || c.type==='motor'){ const R=(c.value||10); I=(V1-V2)/R; }
  else if(c.type==='ammeter'){ const R = 0.001; I=(V1-V2)/R; }
      else if(c.type==='switch') I = c.el.classList.contains('closed') ? (V1-V2)/0.01 : 0;
      else if(c.type==='fuse') I = (!c.status.blown) ? (V1-V2)/0.01 : 0;
      else if(c.type==='battery'){
        // current delivered by battery: sum of currents leaving positive node across connected components
        I = 0; // compute later
      }
      compCurrents[c.id]=I;
    });

    // compute battery current by summing currents of elements connected to its positive net
    let batteryCurrent = 0;
    Object.values(wires); // noop to keep linter quiet
    Object.values(components).forEach(c=>{
      const n1 = connectorNet[c.id+':left']; const n2 = connectorNet[c.id+':right'];
      if(n1===bposNet || n2===bposNet){ batteryCurrent += Math.abs(compCurrents[c.id]||0); }
    });

    return {ok:true, voltages, compCurrents, batteryCurrent};
  }

  function applySimulation(){
    const res = analyzeCircuitNodal();
    // clear previous states
    Object.values(components).forEach(c=>{ c.status.on=false; c.el.classList.remove('on'); });
    wires.forEach(w=> w.line.classList.remove('active'));

    if(!res.ok){ alert('Simulación: ' + res.reason); return; }

    // mark wires active and animate
    wires.forEach(w=> w.line.classList.add('active'));

    // mark components active based on current magnitude
    const currents = res.compCurrents || {};
    const fuseThreshold = 2.0; // A threshold to blow fuses in fault mode
    Object.keys(currents).forEach(cid=>{
      const I = Math.abs(currents[cid]||0);
      const c = components[cid]; if(!c) return;
      if(I > 1e-3) { c.status.on = true; c.el.classList.add('on'); }
      if(c.type==='fuse' && chkFault.checked && I > fuseThreshold){ c.status.blown = true; c.el.style.opacity = 0.4; }
    });

    // update meter displays (voltmeters and ammeters)
    updateMeters(res);

    // show a summary: battery current
    setTimeout(()=>{
      const batt = res.batteryCurrent || 0;
      alert(`Simulación completa. Corriente batería ≈ ${batt.toFixed(2)} A`);
    }, 100);
  }

  // Stop (clear animations)
  function stopSimulation(){
    wires.forEach(w=> w.line.classList.remove('active'));
    Object.values(components).forEach(c=> c.el.classList.remove('on'));
    // clear meters
    Object.values(components).forEach(c=>{
      if(c.meterDisplay){
        if(c.type==='voltmeter') c.meterDisplay.textContent = 'V: --';
        if(c.type==='ammeter') c.meterDisplay.textContent = 'I: --';
      }
    });
  }

  function resetAll(){
    // remove components and wires
    Object.values(components).forEach(c=>{ if(c.el && c.el.parentElement) c.el.parentElement.removeChild(c.el); });
    Object.keys(components).forEach(k=> delete components[k]);
    wires.forEach(w=> { if(w.line && w.line.parentElement) w.line.parentElement.removeChild(w.line); });
    wires.length = 0; idCounter = 1;
  }

  // toggle switch by double click
  board.addEventListener('dblclick', e=>{
    const compEl = e.target.closest('.component'); if(!compEl) return;
    const cid = compEl.dataset.id; const c = components[cid];
    if(c.type==='switch'){
      const closed = compEl.classList.toggle('closed'); compEl.style.borderColor = closed ? 'rgba(27,199,177,0.6)' : '';
    }
    if(c.type==='fuse'){
      c.status.blown = !c.status.blown; compEl.style.opacity = c.status.blown ? 0.4 : 1;
    }
  });

  // control wiring updates on window resize
  window.addEventListener('resize', updateWiresPositions);
  // buttons
  btnSim.addEventListener('click', applySimulation);
  btnStop.addEventListener('click', stopSimulation);
  btnReset.addEventListener('click', ()=>{ if(confirm('Resetear tablero?')) resetAll(); });

  // helper: periodically reposition wire svg size
  function syncSvgSize(){ const r = board.getBoundingClientRect(); svg.setAttribute('width', r.width); svg.setAttribute('height', r.height); svg.style.width='100%'; svg.style.height='100%';}
  new ResizeObserver(()=>{ syncSvgSize(); updateWiresPositions(); }).observe(board);
  syncSvgSize();

  // Update meter displays using results from analyzer
  function updateMeters(res){
    if(!res) return;
    const voltages = res.voltages || {};
    const currents = res.compCurrents || {};
    Object.values(components).forEach(c=>{
      if(!c.meterDisplay) return;
      if(c.type==='voltmeter'){
        const n1 = (c.id+':left'); const n2 = (c.id+':right');
        // need to map connector->net: reconstruct quickly using wires (reuse analyzeCircuitNodal's approach?)
        // Easiest: get voltages map returned by analyzer keyed by net id; but we store voltages by net
        // Here we approximate: measure voltage difference using nearest connector nets by calling analyzeCircuitNodal result voltages.
        // Find connector nets by reconstructing connectorNet mapping locally (cheap)
        const connKeys = [];
        Object.values(components).forEach(cc=>{ connKeys.push(cc.id+':left'); connKeys.push(cc.id+':right'); });
        const parent = {};
        function find(x){ if(parent[x]===undefined) parent[x]=x; return parent[x]===x?x:(parent[x]=find(parent[x])); }
        function unite(a,b){ const ra=find(a), rb=find(b); if(ra!==rb) parent[rb]=ra; }
        wires.forEach(w=>{ unite(w.a.comp+':'+w.a.which, w.b.comp+':'+w.b.which); });
        const netMap = {}; let netCount=0;
        connKeys.forEach(k=>{ const r=find(k); if(!(r in netMap)) netMap[r]='n'+(++netCount); });
        const connectorNet = {};
        connKeys.forEach(k=>{ connectorNet[k] = netMap[find(k)]; });
        const v1net = connectorNet[c.id+':left']; const v2net = connectorNet[c.id+':right'];
        const V1 = voltages[v1net]!==undefined ? voltages[v1net] : (voltages[c.id+':left']||0);
        const V2 = voltages[v2net]!==undefined ? voltages[v2net] : (voltages[c.id+':right']||0);
        const diff = (V1 - V2) || 0;
        c.meterDisplay.textContent = `V: ${diff.toFixed(2)} V`;
      }
      if(c.type==='ammeter'){
        const I = Math.abs(currents[c.id] || 0);
        c.meterDisplay.textContent = `I: ${I.toFixed(3)} A`;
      }
    });
  }

  // Initialize help modal interactivity
  function initHelpModal(){
    const modal = document.getElementById('help-modal');
    const trigger = document.getElementById('help-trigger');
    const closeBtn = document.getElementById('modal-close');
    const closeFooter = document.getElementById('modal-close-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if(!modal || !trigger) return;

    const openModal = ()=>{ modal.style.display='flex'; document.body.style.overflow='hidden'; };
    const closeModal = ()=>{ modal.style.display='none'; document.body.style.overflow='auto'; };

    trigger.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(closeFooter) closeFooter.addEventListener('click', closeModal);

    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

    tabButtons.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const tab = btn.dataset.tab;
        tabButtons.forEach(b=>b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.getElementById('tab-'+tab);
        if(pane) pane.classList.add('active');
      });
    });

    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.style.display==='flex') closeModal(); });
  }

  // initialize help modal
  try{ initHelpModal(); }catch(e){ /* ignore if DOM not ready */ }

})();
