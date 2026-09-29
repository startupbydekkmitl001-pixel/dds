/**
 * Compiles one tile loop and exposes TILE.draw(phase). Time comes only from the paused
 * GSAP timeline registered in index.html, so any frame is a pure function of its time
 * (HyperFrames seeks; nothing free-runs).
 * Dev: open index.html?scene=leave&theme=dark&t=1.5 in a browser and call
 * renderAt(seconds) from the console.
 */
(function () {
  const LOOP = 6;
  const q = new URLSearchParams(location.search);
  const hv = window.__hyperframes && window.__hyperframes.getVariables ? window.__hyperframes.getVariables() : {};
  const sceneName = q.get('scene') || hv.scene || 'attendance';
  const theme = (q.get('theme') || hv.theme) === 'dark' ? 'dark' : 'light';
  const scene = window.TILE.scenes[sceneName];
  if (!scene) throw new Error('Unknown scene: ' + sceneName);

  const canvas = document.getElementById('gl');
  const gl = canvas.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, alpha: false });
  if (!gl) throw new Error('WebGL2 is unavailable');

  // Palette -> GLSL constants, so a scene reads C_DEEP, C_MID... in linear light.
  const pal = scene.palette[theme];
  const consts = Object.keys(pal)
    .map((k) => 'const vec3 C_' + k + ' = ' + window.TILE.lin(pal[k]) + ';')
    .join('\n');
  const src = window.TILE.header + (theme === 'dark' ? '#define DARK 1\n' : '') + consts + '\n' + scene.glsl + window.TILE.footer;

  function compile(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || '';
      // Surface the offending source line, since GLSL logs only give numbers.
      const lines = source.split('\n');
      const m = /ERROR: \d+:(\d+)/.exec(log);
      const at = m ? lines[parseInt(m[1], 10) - 1] : '';
      throw new Error('Shader compile failed: ' + log + '\n>> ' + at);
    }
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, window.TILE.vertex));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, src));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Link failed: ' + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uOrigin = gl.getUniformLocation(prog, 'uOrigin');
  const uPhase = gl.getUniformLocation(prog, 'uPhase');
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.uniform2f(uOrigin, 0, 0);

  function draw(phase) {
    gl.uniform1f(uPhase, phase);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  window.TILE.draw = draw;
  window.renderAt = (t) => draw((((t % LOOP) + LOOP) % LOOP) / LOOP);

  if (q.has('sheet')) {
    // Dev only: ?sheet=0,1.5,3,4.5 draws those times in a 2x2 grid to judge motion at a glance.
    const times = q.get('sheet').split(',').map(parseFloat);
    const w = canvas.width / 2, h = canvas.height / 2;
    times.slice(0, 4).forEach((t, i) => {
      const x = (i % 2) * w, y = (1 - Math.floor(i / 2)) * h;
      gl.viewport(x, y, w, h);
      gl.uniform2f(uRes, w, h);
      gl.uniform2f(uOrigin, x, y);
      draw((t % LOOP) / LOOP);
    });
  } else {
    draw(q.has('t') ? (parseFloat(q.get('t')) % LOOP) / LOOP : 0);
  }
})();
