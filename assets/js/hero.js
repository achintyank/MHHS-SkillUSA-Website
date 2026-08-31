/* ==========================================================================
   MHHS SkillsUSA — the hero
   --------------------------------------------------------------------------
   Two photographs in one frame. The base is the delegation outside the state
   conference; the reveal is the same chapter inside the national conference.
   The cursor opens a window from one into the other.

   The window is not a shape. It is a FLUID SIMULATION.

   Earlier versions drew a mask — first a soft radial gradient, then a Voronoi
   threshold. Both were shapes being moved around, and both read as a shape
   being moved around. This runs an actual Navier-Stokes solver on the GPU:
   the cursor injects dye and velocity into a field, the field advects itself,
   vorticity confinement puts the curl back in, and it all dissipates. Wherever
   there is dye, the second photograph shows through.

   That is why it billows and trails instead of sliding: nothing here knows
   what shape it is. The shape is whatever the fluid happens to be doing.

   Per frame:
     curl -> vorticity -> divergence -> clear pressure -> Jacobi solve
          -> gradient subtract -> advect velocity -> advect dye -> composite

   Everything is raw WebGL. No library, no build step.

   Falls back cleanly: the <img> underneath is real markup and is what shows
   if WebGL is unavailable, if float render targets are not supported, if a
   texture fails, or if the context is lost.
   ========================================================================== */

(function () {
  "use strict";

  const host = document.querySelector("[data-hero]");
  if (!host) return;

  const D = window.SKILLSUSA;
  const cfg = (D && D.hero) || {};
  const canvas = host.querySelector(".hero__canvas");
  const still = host.querySelector(".hero__still");
  if (!canvas || !still) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------- tuning */
  const SIM = {
    simRes:        cfg.simRes        || 128,   // velocity/pressure grid
    dyeRes:        cfg.dyeRes        || 512,   // dye grid — what you actually see
    densityDiss:   cfg.dissipation   == null ? 0.92 : cfg.dissipation,
    velocityDiss:  cfg.velocityDiss  == null ? 0.24 : cfg.velocityDiss,
    pressureDiss:  0.8,
    pressureIters: cfg.pressureIters || 18,
    curl:          cfg.curl          || 30,    // vorticity — the swirl
    splatRadius:   cfg.splatRadius   || 0.22,
    splatForce:    cfg.splatForce    || 6000,
    idle:          reduced ? 0 : (cfg.idle == null ? 1 : cfg.idle)
  };

  /* ------------------------------------------------------------ sources */
  const supportsWebp = (function () {
    try {
      return document.createElement("canvas")
        .toDataURL("image/webp").indexOf("data:image/webp") === 0;
    } catch (e) { return false; }
  })();

  const widths = cfg.widths || [1280, 2048];
  function pick(stem) {
    const want = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
    let w = widths[0];
    for (let i = 0; i < widths.length; i++) if (widths[i] <= want * 1.15) w = widths[i];
    if (want > widths[widths.length - 1] * 0.6) w = widths[widths.length - 1];
    return stem + "-" + w + "." + (supportsWebp ? "webp" : "jpg");
  }

  const baseSrc = cfg.base && cfg.base.stem ? pick(cfg.base.stem) : still.getAttribute("src");
  const revealSrc = cfg.reveal && cfg.reveal.stem ? pick(cfg.reveal.stem) : null;

  if (baseSrc && still.getAttribute("src") !== baseSrc) still.src = baseSrc;
  if (cfg.base && cfg.base.alt) still.alt = cfg.base.alt;
  if (!revealSrc) return;

  /* --------------------------------------------------------- gl + caps */
  let gl = null, isGL2 = false, halfFloatType = 0, linearOK = false;
  (function initGL() {
    const p = { alpha: false, depth: false, stencil: false, antialias: false,
                preserveDrawingBuffer: false, powerPreference: "high-performance" };
    try { gl = canvas.getContext("webgl2", p); } catch (e) {}
    isGL2 = !!gl;
    if (!gl) {
      try { gl = canvas.getContext("webgl", p) || canvas.getContext("experimental-webgl", p); }
      catch (e) { gl = null; }
    }
    if (!gl) return;

    if (isGL2) {
      gl.getExtension("EXT_color_buffer_float");
      linearOK = !!gl.getExtension("OES_texture_float_linear");
      halfFloatType = gl.HALF_FLOAT;
    } else {
      const hf = gl.getExtension("OES_texture_half_float");
      linearOK = !!gl.getExtension("OES_texture_half_float_linear");
      halfFloatType = hf ? hf.HALF_FLOAT_OES : 0;
    }
  })();
  if (!gl) return;                       // still image stands in

  // Everything is RGBA. Juggling R/RG formats across WebGL 1 and 2 saves a
  // little memory at these grid sizes and costs a lot of branching.
  const internalRGBA = isGL2 ? gl.RGBA16F : gl.RGBA;
  let texType = halfFloatType || gl.UNSIGNED_BYTE;

  // Some drivers advertise the float extension and then fail to complete the
  // framebuffer. Probe a real 4x4 target before trusting it.
  (function probe() {
    if (texType === gl.UNSIGNED_BYTE) { linearOK = true; return; }
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalRGBA, 4, 4, 0, gl.RGBA, texType, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb); gl.deleteTexture(t);
    if (!ok) { texType = gl.UNSIGNED_BYTE; linearOK = true; }
  })();

  const filter = linearOK ? gl.LINEAR : gl.NEAREST;

  /* ------------------------------------------------------------ shaders */
  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("hero shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  const VERT = [
    "precision highp float;",
    "attribute vec2 aPosition;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform vec2 texelSize;",
    "void main(){",
    "  vUv = aPosition * 0.5 + 0.5;",
    "  vL = vUv - vec2(texelSize.x, 0.0);",
    "  vR = vUv + vec2(texelSize.x, 0.0);",
    "  vT = vUv + vec2(0.0, texelSize.y);",
    "  vB = vUv - vec2(0.0, texelSize.y);",
    "  gl_Position = vec4(aPosition, 0.0, 1.0);",
    "}"
  ].join("\n");

  const F = {};

  F.clear = [
    "precision mediump float; precision mediump sampler2D;",
    "varying vec2 vUv; uniform sampler2D uTexture; uniform float value;",
    "void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }"
  ].join("\n");

  // Injects dye and velocity in a soft gaussian at the pointer.
  F.splat = [
    "precision highp float; precision highp sampler2D;",
    "varying vec2 vUv; uniform sampler2D uTarget; uniform float aspectRatio;",
    "uniform vec3 color; uniform vec2 point; uniform float radius;",
    "void main(){",
    "  vec2 p = vUv - point.xy; p.x *= aspectRatio;",
    "  vec3 splat = exp(-dot(p, p) / radius) * color;",
    "  vec3 base = texture2D(uTarget, vUv).xyz;",
    "  gl_FragColor = vec4(base + splat, 1.0);",
    "}"
  ].join("\n");

  // Semi-Lagrangian advection: trace backwards along the velocity field.
  F.advection = [
    "precision highp float; precision highp sampler2D;",
    "varying vec2 vUv; uniform sampler2D uVelocity; uniform sampler2D uSource;",
    "uniform vec2 texelSize; uniform float dt; uniform float dissipation;",
    "void main(){",
    "  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;",
    // Decay is a per-SECOND rate, not a per-frame multiplier. Multiplying by a
    // constant each frame ties the physics to the refresh rate and, at 60fps,
    // kills the velocity field in about a tenth of a second — the dye never
    // gets carried anywhere and it reads as a puff instead of a trail.
    "  float decay = 1.0 + dissipation * dt;",
    "  gl_FragColor = texture2D(uSource, coord) / decay;",
    "  gl_FragColor.a = 1.0;",
    "}"
  ].join("\n");

  F.divergence = [
    "precision mediump float; precision mediump sampler2D;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform sampler2D uVelocity;",
    "void main(){",
    "  float L = texture2D(uVelocity, vL).x;",
    "  float R = texture2D(uVelocity, vR).x;",
    "  float T = texture2D(uVelocity, vT).y;",
    "  float B = texture2D(uVelocity, vB).y;",
    "  vec2 C = texture2D(uVelocity, vUv).xy;",
    "  if (vL.x < 0.0) { L = -C.x; }",
    "  if (vR.x > 1.0) { R = -C.x; }",
    "  if (vT.y > 1.0) { T = -C.y; }",
    "  if (vB.y < 0.0) { B = -C.y; }",
    "  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);",
    "}"
  ].join("\n");

  F.curl = [
    "precision mediump float; precision mediump sampler2D;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform sampler2D uVelocity;",
    "void main(){",
    "  float L = texture2D(uVelocity, vL).y;",
    "  float R = texture2D(uVelocity, vR).y;",
    "  float T = texture2D(uVelocity, vT).x;",
    "  float B = texture2D(uVelocity, vB).x;",
    "  gl_FragColor = vec4(R - L - T + B, 0.0, 0.0, 1.0);",
    "}"
  ].join("\n");

  // Vorticity confinement — pushes energy back into the curl so eddies survive
  // instead of being smeared away by advection. Without this it looks like ink
  // spreading; with it, it looks like smoke.
  F.vorticity = [
    "precision highp float; precision highp sampler2D;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform sampler2D uVelocity; uniform sampler2D uCurl;",
    "uniform float curl; uniform float dt;",
    "void main(){",
    "  float L = texture2D(uCurl, vL).x;",
    "  float R = texture2D(uCurl, vR).x;",
    "  float T = texture2D(uCurl, vT).x;",
    "  float B = texture2D(uCurl, vB).x;",
    "  float C = texture2D(uCurl, vUv).x;",
    "  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));",
    "  force /= length(force) + 0.0001;",
    "  force *= curl * C;",
    "  force.y *= -1.0;",
    "  vec2 vel = texture2D(uVelocity, vUv).xy;",
    "  vel += force * dt;",
    "  vel = min(max(vel, -1000.0), 1000.0);",
    "  gl_FragColor = vec4(vel, 0.0, 1.0);",
    "}"
  ].join("\n");

  F.pressure = [
    "precision mediump float; precision mediump sampler2D;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform sampler2D uPressure; uniform sampler2D uDivergence;",
    "void main(){",
    "  float L = texture2D(uPressure, vL).x;",
    "  float R = texture2D(uPressure, vR).x;",
    "  float T = texture2D(uPressure, vT).x;",
    "  float B = texture2D(uPressure, vB).x;",
    "  float divergence = texture2D(uDivergence, vUv).x;",
    "  float pressure = (L + R + B + T - divergence) * 0.25;",
    "  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);",
    "}"
  ].join("\n");

  F.gradientSubtract = [
    "precision mediump float; precision mediump sampler2D;",
    "varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;",
    "uniform sampler2D uPressure; uniform sampler2D uVelocity;",
    "void main(){",
    "  float L = texture2D(uPressure, vL).x;",
    "  float R = texture2D(uPressure, vR).x;",
    "  float T = texture2D(uPressure, vT).x;",
    "  float B = texture2D(uPressure, vB).x;",
    "  vec2 velocity = texture2D(uVelocity, vUv).xy;",
    "  velocity.xy -= vec2(R - L, T - B);",
    "  gl_FragColor = vec4(velocity, 0.0, 1.0);",
    "}"
  ].join("\n");

  // The only pass that touches the photographs. Dye density is the mask.
  F.composite = [
    "precision highp float; precision highp sampler2D;",
    "varying vec2 vUv;",
    "uniform sampler2D uBase; uniform sampler2D uReveal; uniform sampler2D uDye;",
    "uniform float uCanvasAspect; uniform float uImgAspect;",
    "uniform vec2 uShift; uniform float uActive;",

    // cover-fit with a 5% inset so the parallax shift stays inside the texture
    "vec2 cover(vec2 uv){",
    "  vec2 s = (uCanvasAspect > uImgAspect)",
    "         ? vec2(1.0, uImgAspect / uCanvasAspect)",
    "         : vec2(uCanvasAspect / uImgAspect, 1.0);",
    "  return (uv - 0.5) * s * 0.95 + 0.5;",
    "}",

    "void main(){",
    "  vec2 uv = cover(vUv);",
    // Each layer shifts as a whole, at a different rate. The two sliding
    // against each other is the depth cue. Never per-pixel — displacing one
    // photo by the other's luminance tears it along meaningless contours.
    "  vec3 baseCol   = texture2D(uBase,   clamp(uv + uShift * 0.012, 0.0, 1.0)).rgb;",
    "  vec3 revealCol = texture2D(uReveal, clamp(uv + uShift * 0.034, 0.0, 1.0)).rgb;",

    "  float dye = texture2D(uDye, vUv).r;",
    "  float m = smoothstep(0.02, 0.24, dye) * uActive;",

    "  vec3 col = mix(baseCol, revealCol, m);",
    // gold along the thin leading edge of the dye, where it is wisping out
    "  float edge = smoothstep(0.015, 0.09, dye) * (1.0 - smoothstep(0.09, 0.24, dye));",
    "  col += vec3(1.00, 0.78, 0.17) * edge * 0.30 * uActive;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  /* ------------------------------------------------------------ program */
  function Program(fragSrc) {
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) { this.ok = false; return; }
    const p = gl.createProgram();
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("hero program:", gl.getProgramInfoLog(p));
      this.ok = false; return;
    }
    this.ok = true;
    this.program = p;
    this.uniforms = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(p, i).name;
      this.uniforms[name] = gl.getUniformLocation(p, name);
    }
  }
  Program.prototype.bind = function () { gl.useProgram(this.program); };

  const P = {};
  let allOK = true;
  ["clear", "splat", "advection", "divergence", "curl", "vorticity",
   "pressure", "gradientSubtract", "composite"].forEach(function (k) {
    P[k] = new Program(F[k]);
    if (!P[k].ok) allOK = false;
  });
  if (!allOK) return;                    // still image stands in

  /* ---------------------------------------------------------- geometry */
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const idx = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* -------------------------------------------------------------- FBOs */
  function createFBO(w, h, filt) {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalRGBA, w, h, 0, gl.RGBA, texType, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture: texture, fbo: fbo, width: w, height: h,
      texelSizeX: 1.0 / w, texelSizeY: 1.0 / h,
      attach: function (id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  function createDoubleFBO(w, h, filt) {
    let fbo1 = createFBO(w, h, filt);
    let fbo2 = createFBO(w, h, filt);
    return {
      width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; }, set read(v) { fbo1 = v; },
      get write() { return fbo2; }, set write(v) { fbo2 = v; },
      swap: function () { const t = fbo1; fbo1 = fbo2; fbo2 = t; }
    };
  }

  let dye, velocity, divergenceFBO, curlFBO, pressure;

  function getRes(res) {
    let ar = gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1);
    if (ar < 1) ar = 1.0 / ar;
    const min = Math.round(res), max = Math.round(res * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min } : { width: min, height: max };
  }

  function initFramebuffers() {
    const s = getRes(SIM.simRes), d = getRes(SIM.dyeRes);
    dye = createDoubleFBO(d.width, d.height, filter);
    velocity = createDoubleFBO(s.width, s.height, filter);
    divergenceFBO = createFBO(s.width, s.height, gl.NEAREST);
    curlFBO = createFBO(s.width, s.height, gl.NEAREST);
    pressure = createDoubleFBO(s.width, s.height, gl.NEAREST);
  }

  /* ------------------------------------------------------------- splat */
  function splat(x, y, dx, dy, amount) {
    P.splat.bind();
    gl.uniform1i(P.splat.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(P.splat.uniforms.aspectRatio,
                 gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1));
    gl.uniform2f(P.splat.uniforms.point, x, y);
    gl.uniform3f(P.splat.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(P.splat.uniforms.radius, SIM.splatRadius / 100.0);
    blit(velocity.write); velocity.swap();

    gl.uniform1i(P.splat.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(P.splat.uniforms.color, amount, amount, amount);
    blit(dye.write); dye.swap();
  }

  /* --------------------------------------------------------------- step */
  function step(dt) {
    gl.disable(gl.BLEND);

    P.curl.bind();
    gl.uniform2f(P.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.curl.uniforms.uVelocity, velocity.read.attach(0));
    blit(curlFBO);

    P.vorticity.bind();
    gl.uniform2f(P.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.vorticity.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.vorticity.uniforms.uCurl, curlFBO.attach(1));
    gl.uniform1f(P.vorticity.uniforms.curl, SIM.curl);
    gl.uniform1f(P.vorticity.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    P.divergence.bind();
    gl.uniform2f(P.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.divergence.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergenceFBO);

    P.clear.bind();
    gl.uniform1i(P.clear.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(P.clear.uniforms.value, SIM.pressureDiss);
    blit(pressure.write); pressure.swap();

    P.pressure.bind();
    gl.uniform2f(P.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.pressure.uniforms.uDivergence, divergenceFBO.attach(0));
    for (let i = 0; i < SIM.pressureIters; i++) {
      gl.uniform1i(P.pressure.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    P.gradientSubtract.bind();
    gl.uniform2f(P.gradientSubtract.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(P.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(P.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    P.advection.bind();
    gl.uniform2f(P.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    const velId = velocity.read.attach(0);
    gl.uniform1i(P.advection.uniforms.uVelocity, velId);
    gl.uniform1i(P.advection.uniforms.uSource, velId);
    gl.uniform1f(P.advection.uniforms.dt, dt);
    gl.uniform1f(P.advection.uniforms.dissipation, SIM.velocityDiss);
    blit(velocity.write); velocity.swap();

    gl.uniform2f(P.advection.uniforms.texelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(P.advection.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(P.advection.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(P.advection.uniforms.dissipation, SIM.densityDiss);
    blit(dye.write); dye.swap();
  }

  /* ------------------------------------------------------------- render */
  let baseTex = null, revealTex = null, imgAspect = 2.35;
  let active = 0;
  let sx = 0.5, sy = 0.5;              // smoothed pointer, for the parallax

  function makePhotoTexture(img, unit) {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    return t;
  }

  function render() {
    P.composite.bind();
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.uniform1i(P.composite.uniforms.uBase, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, revealTex);
    gl.uniform1i(P.composite.uniforms.uReveal, 1);
    gl.uniform1i(P.composite.uniforms.uDye, dye.read.attach(2));
    gl.uniform1f(P.composite.uniforms.uCanvasAspect,
                 gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1));
    gl.uniform1f(P.composite.uniforms.uImgAspect, imgAspect);
    gl.uniform2f(P.composite.uniforms.uShift, sx - 0.5, sy - 0.5);
    gl.uniform1f(P.composite.uniforms.uActive, active);
    blit(null);
  }

  /* -------------------------------------------------------------- input */
  let px = -1, py = -1;                // previous pointer, for the splat force
  let pending = null;
  let idleT = 0, nextBurst = 0.5;

  function onMove(e) {
    const r = host.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = 1.0 - (e.clientY - r.top) / r.height;
    if (px < 0) { px = x; py = y; }
    pending = { x: x, y: y, dx: (x - px) * SIM.splatForce, dy: (y - py) * SIM.splatForce };
    px = x; py = y;
    start();
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(host.clientWidth * dpr);
    const h = Math.round(host.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      initFramebuffers();
    }
  }

  /* --------------------------------------------------------------- loop */
  let running = false, raf = 0, last = 0;

  function frame(now) {
    if (!running) { raf = 0; return; }
    let dt = (now - last) / 1000;
    last = now;
    if (!(dt > 0) || dt > 0.05) dt = 0.016;    // clamp tab-switch spikes

    resize();

    if (pending) {
      splat(pending.x, pending.y, pending.dx, pending.dy, 1.0);
      sx += (pending.x - sx) * 0.18;
      sy += (pending.y - sy) * 0.18;
      pending = null;
    }

    // Unprompted bursts, so it keeps billowing with nobody touching it.
    if (SIM.idle > 0) {
      idleT += dt;
      if (idleT > nextBurst) {
        idleT = 0;
        nextBurst = 0.28 + Math.random() * 0.85;
        const a = Math.random() * Math.PI * 2;
        const mag = (0.6 + Math.random() * 1.3) * SIM.splatForce * 0.16 * SIM.idle;
        splat(0.30 + Math.random() * 0.45, 0.30 + Math.random() * 0.42,
              Math.cos(a) * mag, Math.sin(a) * mag, 0.85 * SIM.idle);
      }
    }

    if (!reduced) step(dt);
    active += (1.0 - active) * 0.08;
    render();

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* --------------------------------------------------------------- boot */
  function load(src) {
    return new Promise(function (res, rej) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () { res(img); };
      img.onerror = rej;
      img.src = src;
    });
  }

  Promise.all([load(baseSrc), load(revealSrc)]).then(function (imgs) {
    imgAspect = imgs[0].naturalWidth / imgs[0].naturalHeight;
    baseTex = makePhotoTexture(imgs[0], 0);
    revealTex = makePhotoTexture(imgs[1], 1);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(host.clientWidth * dpr);
    canvas.height = Math.round(host.clientHeight * dpr);
    initFramebuffers();

    // seed it so the first frame is already alive rather than empty
    splat(0.5, 0.5, 0, 220, 0.9);

    host.classList.add("is-live");
    start();
  }).catch(function () {
    host.classList.remove("is-live");
  });

  host.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("resize", function () { resize(); start(); }, { passive: true });
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
    }, { threshold: 0.02 }).observe(host);
  }
  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault(); stop(); host.classList.remove("is-live");
  });
})();
