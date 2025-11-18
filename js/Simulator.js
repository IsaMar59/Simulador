import { CircuitSolver } from './CircuitSolver.js';
import { ComponentManager } from './ComponentManager.js';
import { WireManager } from './WireManager.js';
import { UIManager } from './UIManager.js';

class Simulator {
  constructor() {
    const board = document.getElementById('board');
    const svg = document.getElementById('wireLayer');

    this.circuitSolver = new CircuitSolver();
    this.componentManager = new ComponentManager(board, (compId, which) => this.wireManager.onConnectorClick(compId, which));
    this.wireManager = new WireManager(svg, board, this.componentManager.getComponents());
    this.uiManager = new UIManager(board, svg, this.componentManager, this.wireManager, this.circuitSolver);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Simulator();
});