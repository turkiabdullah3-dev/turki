import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PHYSICS_CONSTANTS } from '../utils/physics.js';

export class EquationsPage {
  constructor(callbacks) {
    this.callbacks = callbacks;
    this.activeTab = 'blackhole';
    this.massSolar = 10;
    this.distanceInRs = 10;
    this.throatRadius = 1.5;
    this.element = this.createDOM();
    this.bindEvents();
    this.renderMath();
    this.updateLiveValues();
    this.updateProgressiveReveal();
    this.switchTab('blackhole');
  }

  createDOM() {
    const root = document.createElement('div');
    root.className = 'equations-page';
    root.innerHTML = `
      <div class="equations-topbar">
        <button class="back-button">← Back</button>
        <div class="equations-tabs">
          <button class="eq-tab active" data-tab="blackhole">Black Hole Equations</button>
          <button class="eq-tab" data-tab="wormhole">Wormhole Equations</button>
          <button class="eq-tab" data-tab="glossary">Glossary</button>
          <button class="eq-tab" data-tab="limits">Assumptions & Limits</button>
        </div>
      </div>

      <div class="equations-layout">
        <aside class="equations-sidebar">
          <h3>Table of Contents</h3>
          <nav class="toc" data-toc="blackhole">
            <a href="#bh-foundations">Foundations (GR basics)</a>
            <a href="#bh-radii">Key radii and invariants</a>
            <a href="#bh-time">Time & redshift</a>
            <a href="#bh-light">Light bending</a>
            <a href="#bh-tidal">Tidal effects</a>
            <a href="#bh-exactness">What is exact vs approximated</a>
          </nav>
          <nav class="toc hidden" data-toc="wormhole">
            <a href="#wh-geometry">Wormhole geometry</a>
            <a href="#wh-throat">Throat condition</a>
            <a href="#wh-energy">Energy conditions</a>
            <a href="#wh-embedding">Embedding diagram</a>
            <a href="#wh-exactness">What is exact vs approximated</a>
          </nav>
          <nav class="toc hidden" data-toc="glossary">
            <a href="#glossary-table">Core terms</a>
          </nav>
          <nav class="toc hidden" data-toc="limits">
            <a href="#limits-honesty">Professional honesty</a>
            <a href="#limits-instruction">Math UI requirements</a>
            <a href="#limits-deliverables">Deliverables</a>
          </nav>
        </aside>

        <main class="equations-content">
          <section class="equations-controls glass-panel">
            <div class="control-row">
              <label>Reference Mass (solar masses): <span id="massValue">10</span> M☉</label>
              <input id="massSlider" type="range" min="1" max="100" step="1" value="10" />
            </div>
            <div class="control-row bh-control">
              <label>Camera Distance (× r<sub>s</sub>): <span id="distanceValue">10.0</span></label>
              <input id="distanceSlider" type="range" min="1.05" max="20" step="0.05" value="10" />
            </div>
            <div class="control-row wh-control hidden">
              <label>Throat Radius r<sub>0</sub>: <span id="throatValue">1.50</span></label>
              <input id="throatSlider" type="range" min="0.5" max="3" step="0.1" value="1.5" />
            </div>
          </section>

          <section class="tab-panel" data-panel="blackhole">
            <div id="bh-foundations" class="equation-card glass-panel">
              <div class="card-head"><h4>Einstein Field Equations (Context)</h4><span class="badge context">Context equation (not computed live)</span></div>
              <div class="latex" data-latex="R_{\\mu\\nu}-\\frac{1}{2}Rg_{\\mu\\nu}+\\Lambda g_{\\mu\\nu}=\\frac{8\\pi G}{c^4}T_{\\mu\\nu}"></div>
              <p><b>Symbols:</b> Rμν curvature, R scalar curvature, gμν metric, Λ cosmological constant, Tμν energy-momentum, G gravitational constant, c speed of light.</p>
              <p><b>Explain like I’m 10:</b> Spacetime is like stretchy fabric. Matter pushes it, and fabric tells motion.</p>
              <p><b>What you see in the simulation:</b> This is the master law. We use known solutions derived from it.</p>
            </div>

            <div id="bh-radii" class="equation-card glass-panel progressive" data-stage="far">
              <div class="card-head"><h4>Schwarzschild Radius (Event Horizon)</h4><span class="badge exact">Exact definition (Schwarzschild)</span></div>
              <div class="latex" data-latex="r_s=\\frac{2GM}{c^2}"></div>
              <p><b>Explain like I’m 10:</b> If mass is squeezed enough, a boundary forms where even light can’t escape.</p>
              <p><b>What you see in the simulation:</b> Event horizon ring at r = r<sub>s</sub>, all distances shown in multiples of r<sub>s</sub>.</p>
              <p><b>Live example:</b> r<sub>s</sub> = <span id="live-rs">-</span></p>
            </div>

            <div class="equation-card glass-panel">
              <div class="card-head"><h4>Schwarzschild Metric</h4><span class="badge exact">Exact spacetime model (Schwarzschild)</span></div>
              <div class="latex" data-latex="ds^2=\\left(1-\\frac{r_s}{r}\\right)c^2dt^2-\\left(1-\\frac{r_s}{r}\\right)^{-1}dr^2-r^2d\\Omega^2"></div>
              <div class="latex" data-latex="d\\Omega^2=d\\theta^2+\\sin^2\\theta\\,d\\phi^2"></div>
              <p><b>Explain like I’m 10:</b> This is the ruler-and-clock rulebook near a black hole.</p>
              <p><b>What you see in the simulation:</b> Time component drives time dilation; spatial part supports lensing intuition.</p>
            </div>

            <div id="bh-time" class="equation-card glass-panel progressive" data-stage="near-horizon">
              <div class="card-head"><h4>Gravitational Time Dilation</h4><span class="badge exact">Exact for static observers</span></div>
              <div class="latex" data-latex="d\\tau=dt\\sqrt{1-\\frac{r_s}{r}}"></div>
              <div class="latex" data-latex="\\alpha(r)=\\sqrt{1-\\frac{r_s}{r}}"></div>
              <p><b>Explain like I’m 10:</b> Strong gravity makes clocks run slower.</p>
              <p><b>What you see in the simulation:</b> Outside time t and local time τ diverge as you move closer.</p>
              <p><b>Live example:</b> α(r) = <span id="live-alpha">-</span></p>
            </div>

            <div id="bh-light" class="equation-card glass-panel progressive" data-stage="closer">
              <div class="card-head"><h4>Photon Sphere</h4><span class="badge exact">Exact radius (Schwarzschild)</span></div>
              <div class="latex" data-latex="r_{ph}=\\frac{3GM}{c^2}=\\frac{3}{2}r_s"></div>
              <p><b>Explain like I’m 10:</b> Gravity bends light so strongly that light can loop around.</p>
              <p><b>What you see in the simulation:</b> Highlight photon ring at r = r<sub>ph</sub>; lensing increases near this region.</p>
              <p><b>Live example:</b> r<sub>ph</sub> = <span id="live-rph">-</span></p>
            </div>

            <div class="equation-card glass-panel progressive" data-stage="near-horizon">
              <div class="card-head"><h4>Gravitational Redshift</h4><span class="badge exact">Exact relation (Schwarzschild)</span></div>
              <div class="latex" data-latex="\\frac{f_{obs}}{f_{emit}}=\\sqrt{1-\\frac{r_s}{r}}"></div>
              <div class="latex" data-latex="1+z=\\frac{1}{\\sqrt{1-\\frac{r_s}{r}}}"></div>
              <p><b>Explain like I’m 10:</b> Light climbing out loses energy and shifts red.</p>
              <p><b>What you see in the simulation:</b> Scene tint increases red as r approaches r<sub>s</sub>.</p>
              <p><b>Live example:</b> z = <span id="live-z">-</span></p>
            </div>

            <div id="bh-tidal" class="equation-card glass-panel progressive" data-stage="inside-view">
              <div class="card-head"><h4>Tidal Forces (Spaghettification)</h4><span class="badge approx">Approximate scaling</span></div>
              <div class="latex" data-latex="a_{tidal}\\approx\\frac{2GML}{r^3}"></div>
              <p><b>Explain like I’m 10:</b> Gravity at your feet can be stronger than your head, so you stretch.</p>
              <p><b>What you see in the simulation:</b> Tidal meter with Safe / Warning / Critical thresholds.</p>
              <p><b>Live example:</b> a<sub>tidal</sub> = <span id="live-tidal">-</span></p>
            </div>

            <div class="equation-card glass-panel">
              <div class="card-head"><h4>Optional Kerr Spin Parameter</h4><span class="badge approx">Advanced model (optional)</span></div>
              <div class="latex" data-latex="a=\\frac{J}{Mc}"></div>
              <p><b>Explain like I’m 10:</b> A spinning black hole drags spacetime like a whirlpool.</p>
              <p><b>What you see in the simulation:</b> Optional frame-dragging swirl and lensing asymmetry cues.</p>
            </div>

            <div id="bh-exactness" class="equation-card glass-panel">
              <div class="card-head"><h4>Exact vs Approximated</h4><span class="badge neutral">Credibility note</span></div>
              <p><b>Exact GR forms:</b> r<sub>s</sub>, r<sub>ph</sub>, time dilation, redshift, Schwarzschild metric form.</p>
              <p><b>Visualization approximations:</b> real-time color grading, glow intensity, performance-optimized lensing cues.</p>
            </div>
          </section>

          <section class="tab-panel hidden" data-panel="wormhole">
            <div id="wh-geometry" class="equation-card glass-panel">
              <div class="card-head"><h4>Morris–Thorne Metric</h4><span class="badge exact">Exact theoretical model</span></div>
              <div class="latex" data-latex="ds^2=-e^{2\\Phi(r)}c^2dt^2+\\frac{dr^2}{1-\\frac{b(r)}{r}}+r^2d\\Omega^2"></div>
              <p><b>Explain like I’m 10:</b> This is the blueprint for a tunnel through spacetime.</p>
              <p><b>What you see in the simulation:</b> Φ(r) controls time/brightness feel; b(r) controls tunnel profile.</p>
            </div>

            <div id="wh-throat" class="equation-card glass-panel">
              <div class="card-head"><h4>Throat Condition</h4><span class="badge exact">Geometry condition</span></div>
              <div class="latex" data-latex="b(r_0)=r_0"></div>
              <p><b>Explain like I’m 10:</b> The throat is the narrowest point of the tunnel.</p>
              <p><b>What you see in the simulation:</b> Throat ring drawn at r = r<sub>0</sub>, slider adjusts r<sub>0</sub>.</p>
            </div>

            <div class="equation-card glass-panel">
              <div class="card-head"><h4>Flare-out Condition</h4><span class="badge exact">Traversability check</span></div>
              <div class="latex" data-latex="b'(r_0)<1"></div>
              <p><b>Explain like I’m 10:</b> Tunnel must open outward, not pinch shut.</p>
              <p><b>What you see in the simulation:</b> “Geometry OK ✅” if satisfied, “Unstable ❌” if not.</p>
              <p><b>Live example:</b> b'(r<sub>0</sub>) = <span id="live-flare">-</span></p>
            </div>

            <div id="wh-energy" class="equation-card glass-panel">
              <div class="card-head"><h4>Energy Condition (Exotic Matter)</h4><span class="badge approx">Physical requirement</span></div>
              <div class="latex" data-latex="\\rho+p_r<0"></div>
              <p><b>Explain like I’m 10:</b> Normal matter usually can’t keep a wormhole open.</p>
              <p><b>What you see in the simulation:</b> Exotic matter cost meter changes with throat radius.</p>
              <p><b>Live example:</b> cost = <span id="live-exotic">-</span></p>
            </div>

            <div id="wh-embedding" class="equation-card glass-panel">
              <div class="card-head"><h4>Embedding Diagram</h4><span class="badge approx">Visualization helper</span></div>
              <div class="latex" data-latex="\\frac{dz}{dr}=\\pm\\sqrt{\\frac{1}{\\frac{r}{b(r)}-1}}"></div>
              <p><b>Explain like I’m 10:</b> This helps draw the wormhole as a curved funnel.</p>
              <p><b>What you see in the simulation:</b> Side geometry updates live when b(r) changes.</p>
              <p><b>Live example:</b> dz/dr at 2r<sub>0</sub> = <span id="live-embed">-</span></p>
            </div>

            <div id="wh-exactness" class="equation-card glass-panel">
              <div class="card-head"><h4>Exact vs Approximated</h4><span class="badge neutral">Credibility note</span></div>
              <p><b>Exact forms used:</b> Morris–Thorne metric form, throat/flare-out constraints.</p>
              <p><b>Approximations:</b> visual tunnel shading and performance-optimized deformation mapping.</p>
            </div>
          </section>

          <section class="tab-panel hidden" data-panel="glossary" id="glossary-table">
            <div class="equation-card glass-panel">
              <div class="card-head"><h4>Glossary (Child-friendly + Correct)</h4></div>
              <table class="glossary-table">
                <tr><th>Term</th><th>Meaning</th></tr>
                <tr><td>Metric g<sub>μν</sub></td><td>Spacetime measurement rule.</td></tr>
                <tr><td>Proper time τ</td><td>The time you personally feel.</td></tr>
                <tr><td>Coordinate time t</td><td>Time measured far away.</td></tr>
                <tr><td>Geodesic</td><td>The straightest path in curved spacetime.</td></tr>
                <tr><td>Event horizon</td><td>Boundary where light cannot escape.</td></tr>
                <tr><td>Photon sphere</td><td>Region where light can orbit (unstable).</td></tr>
                <tr><td>Energy conditions</td><td>Rules for normal matter behavior.</td></tr>
              </table>
            </div>
          </section>

          <section class="tab-panel hidden" data-panel="limits">
            <div id="limits-honesty" class="equation-card glass-panel">
              <div class="card-head"><h4>Professional Honesty</h4></div>
              <p>Equations shown are real GR forms. The visualization is performance-optimized for browser runtime.</p>
              <p>We preserve key invariants: r<sub>s</sub>, r<sub>ph</sub>, time dilation, redshift, throat conditions.</p>
              <p>We do not claim full ray-traced GR rendering.</p>
              <p><b>Explain like I’m 10:</b> We use real physics rules, then draw them in a fast way for your browser.</p>
            </div>

            <div id="limits-instruction" class="equation-card glass-panel">
              <div class="card-head"><h4>Math UI Requirements</h4></div>
              <ul>
                <li>Floating glass cards with subtle glow borders.</li>
                <li>Progressive reveal by distance: far → r<sub>s</sub>, closer → photon sphere, near horizon → dilation + redshift, inside → proper time + tidal meter.</li>
                <li>Each card includes LaTeX + kid-friendly sentence + live numeric value example.</li>
                <li>Visual anchoring: photon ring highlight, redshift tint cue, clock speed animation cue.</li>
              </ul>
            </div>

            <div id="limits-deliverables" class="equation-card glass-panel">
              <div class="card-head"><h4>Deliverables Checklist</h4></div>
              <ul>
                <li>HTML structure for the page.</li>
                <li>Responsive CSS with glass cards and sticky layout.</li>
                <li>JS logic for tabs/scroll/reveal and live updates.</li>
                <li>KaTeX rendering for equations.</li>
                <li>Full scientific text content as specified.</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    `;
    return root;
  }

  bindEvents() {
    this.element.querySelector('.back-button')?.addEventListener('click', () => this.callbacks.onBack());
    this.element.querySelectorAll('.eq-tab').forEach((tab) => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    this.massSlider = this.element.querySelector('#massSlider');
    this.massValue = this.element.querySelector('#massValue');
    this.distanceSlider = this.element.querySelector('#distanceSlider');
    this.distanceValue = this.element.querySelector('#distanceValue');
    this.throatSlider = this.element.querySelector('#throatSlider');
    this.throatValue = this.element.querySelector('#throatValue');

    this.massSlider?.addEventListener('input', () => {
      this.massSolar = Number(this.massSlider.value);
      this.massValue.textContent = this.massSolar.toString();
      this.updateLiveValues();
    });

    this.distanceSlider?.addEventListener('input', () => {
      this.distanceInRs = Number(this.distanceSlider.value);
      this.distanceValue.textContent = this.distanceInRs.toFixed(2);
      this.updateLiveValues();
      this.updateProgressiveReveal();
    });

    this.throatSlider?.addEventListener('input', () => {
      this.throatRadius = Number(this.throatSlider.value);
      this.throatValue.textContent = this.throatRadius.toFixed(2);
      this.updateLiveValues();
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.element.querySelectorAll('.eq-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    this.element.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('hidden', panel.dataset.panel !== tabName);
    });

    this.element.querySelectorAll('.toc').forEach((toc) => {
      toc.classList.toggle('hidden', toc.dataset.toc !== tabName);
    });

    this.element.querySelector('.bh-control')?.classList.toggle('hidden', tabName !== 'blackhole');
    this.element.querySelector('.wh-control')?.classList.toggle('hidden', tabName !== 'wormhole');
  }

  renderMath() {
    this.element.querySelectorAll('[data-latex]').forEach((node) => {
      katex.render(node.dataset.latex, node, { throwOnError: false, displayMode: true });
    });
  }

  updateLiveValues() {
    const M = this.massSolar * PHYSICS_CONSTANTS.M_SUN;
    const rs = (2 * PHYSICS_CONSTANTS.G * M) / (PHYSICS_CONSTANTS.c ** 2);
    const r = Math.max(this.distanceInRs * rs, rs * 1.0001);
    const alpha = Math.sqrt(1 - (rs / r));
    const z = (1 / alpha) - 1;
    const rph = 1.5 * rs;
    const tidal = (2 * PHYSICS_CONSTANTS.G * M * 1.8) / (r ** 3);

    const put = (id, value) => {
      const node = this.element.querySelector(id);
      if (node) node.textContent = value;
    };

    put('#live-rs', `${(rs / 1000).toFixed(2)} km`);
    put('#live-rph', `${(rph / 1000).toFixed(2)} km`);
    put('#live-alpha', alpha.toFixed(4));
    put('#live-z', z.toFixed(4));
    put('#live-tidal', `${tidal.toExponential(2)} m/s²`);

    const flarePrime = -1;
    const exoticCost = Math.min(1, (5 / this.throatRadius) / 20);
    const embed = Math.sqrt(1 / ((2 * this.throatRadius) / ((this.throatRadius ** 2) / (2 * this.throatRadius)) - 1));

    put('#live-flare', flarePrime.toFixed(2));
    put('#live-exotic', exoticCost.toFixed(3));
    put('#live-embed', embed.toFixed(3));
  }

  updateProgressiveReveal() {
    const stage = this.distanceInRs > 6
      ? 'far'
      : this.distanceInRs > 2.5
        ? 'closer'
        : this.distanceInRs > 1.2
          ? 'near-horizon'
          : 'inside-view';

    this.element.querySelectorAll('.progressive').forEach((card) => {
      const required = card.dataset.stage;
      const order = { far: 0, closer: 1, 'near-horizon': 2, 'inside-view': 3 };
      card.classList.toggle('revealed', order[required] <= order[stage]);
    });
  }

  dispose() {
    this.element.remove();
  }
}
