(() => {
  const root = document.documentElement;
  const pages = [...document.querySelectorAll('[data-page]')];
  const navLinks = [...document.querySelectorAll('nav [data-route]')];
  const titleByRoute = {
    '/': 'Jessie Lu — Personal Portfolio',
    '/about': 'About | Jessie Lu',
    '/experience': 'Experience | Jessie Lu',
    '/projects': 'Projects | Jessie Lu',
    '/contact': 'Contact | Jessie Lu'
  };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function currentLocation() {
    const raw = location.hash.slice(1) || '/';
    const hashAt = raw.indexOf('#');
    return {
      route: (hashAt < 0 ? raw : raw.slice(0, hashAt)).replace(/\/$/, '') || '/',
      anchor: hashAt < 0 ? '' : raw.slice(hashAt + 1)
    };
  }

  function animateHeading(heading) {
    if (!heading || reducedMotion.matches) return;
    const target = heading.dataset.scramble;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let tick = 0;
    clearInterval(heading._scrambleTimer);
    heading._scrambleTimer = setInterval(() => {
      heading.textContent = [...target].map((char, index) => {
        if (char === ' ' || index < tick / 2) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      tick += 1;
      if (tick >= target.length * 2 + 2) {
        heading.textContent = target;
        clearInterval(heading._scrambleTimer);
      }
    }, 35);
  }

  function route() {
    const { route: wanted, anchor } = currentLocation();
    const activeRoute = titleByRoute[wanted] ? wanted : '/';
    document.body.dataset.route = activeRoute;
    document.title = titleByRoute[activeRoute];
    pages.forEach(page => {
      const active = page.dataset.page === activeRoute;
      page.hidden = !active;
      if (active) {
        const animated = page.querySelector('.enter');
        if (animated) {
          animated.classList.remove('enter');
          void animated.offsetWidth;
          animated.classList.add('enter');
        }
        animateHeading(page.querySelector('[data-scramble]'));
      }
    });
    navLinks.forEach(link => {
      if (link.dataset.route === activeRoute) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    requestAnimationFrame(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView();
      else scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  const themeButton = document.querySelector('.theme-toggle');
  const savedTheme = localStorage.getItem('jessie-rebuild-theme');
  root.dataset.theme = savedTheme === 'light' ? 'light' : 'dark';

  function refreshThemeLabel() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    document.querySelector('meta[name="theme-color"]').content = dark ? '#141113' : '#f8f7f5';
  }
  refreshThemeLabel();
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jessie-rebuild-theme', root.dataset.theme);
    refreshThemeLabel();
  });

  document.querySelectorAll('.spot-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - box.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - box.top}px`);
    });
  });

  document.querySelectorAll('.magnet-zone').forEach(zone => {
    const target = zone.firstElementChild;
    zone.addEventListener('pointermove', event => {
      if (reducedMotion.matches) return;
      const box = zone.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      target.style.transform = `translate(${dx / 7}px, ${dy / 7}px)`;
    });
    zone.addEventListener('pointerleave', () => { target.style.transform = ''; });
  });

  const copyButton = document.querySelector('.copy-button');
  copyButton.addEventListener('click', async () => {
    const status = document.querySelector('.copy-message');
    try {
      await navigator.clipboard.writeText('zhaojiel@andrew.cmu.edu');
      status.textContent = 'Email copied.';
    } catch {
      status.textContent = 'You can select and copy the email address above.';
    }
  });

  class ReactBitsParticleText {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.container = canvas.parentElement;
      this.ctx = canvas.getContext('2d');
      this.options = {
        text: 'React Bits',
        particleSize: 2,
        density: 4,
        color: '#ffffff',
        highlightColor: '#8b5cf6',
        scatter: 180,
        gatherDuration: 1600,
        stagger: 420,
        pointerRepel: 40,
        repelRadius: 120,
        idleDrift: .7,
        fontSize: 'clamp(3rem, 12vw, 8rem)',
        fontWeight: 800,
        fontFamily: 'Arial, Helvetica, sans-serif',
        glow: true,
        ...options
      };
      this.particles = [];
      this.pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };
      this.gathering = false;
      this.gatherStart = 0;
      this.width = 0;
      this.height = 0;
      this.animationFrame = null;
      this.resizeFrame = null;
      this.buildId = 0;
      this.reduced = reducedMotion.matches;
      this.render = this.render.bind(this);
      this.queueSample = this.queueSample.bind(this);
      this.bind();
      this.sampleText();
    }

    clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
    easeOutCubic(value) { return 1 - Math.pow(1 - value, 3); }

    toRgb(hex) {
      const value = hex.replace('#', '').trim();
      if (!/^[0-9a-f]{6}$/i.test(value)) return null;
      return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
      };
    }

    mixColor(from, to, amount) {
      const channel = key => Math.round(from[key] + (to[key] - from[key]) * amount);
      return `rgb(${channel('r')}, ${channel('g')}, ${channel('b')})`;
    }

    resolveFontSize(value) {
      if (typeof value === 'number') return value;
      const probe = document.createElement('span');
      probe.textContent = 'M';
      Object.assign(probe.style, {
        position: 'absolute',
        visibility: 'hidden',
        pointerEvents: 'none',
        fontSize: value,
        fontWeight: String(this.options.fontWeight),
        fontFamily: this.options.fontFamily
      });
      this.container.appendChild(probe);
      const size = parseFloat(getComputedStyle(probe).fontSize) || 96;
      probe.remove();
      return size;
    }

    async waitForFont(font) {
      if (!document.fonts) return;
      try { await document.fonts.load(font); } catch {}
      await document.fonts.ready;
    }

    bind() {
      this.canvas.addEventListener('pointerenter', event => this.trackPointer(event));
      this.canvas.addEventListener('pointermove', event => this.trackPointer(event));
      this.canvas.addEventListener('pointerleave', () => { this.pointer.active = false; });
      reducedMotion.addEventListener('change', event => {
        this.reduced = event.matches;
        this.sampleText();
      });
      new ResizeObserver(this.queueSample).observe(this.container);
    }

    trackPointer(event) {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = event.clientX - rect.left;
      this.pointer.y = event.clientY - rect.top;
      this.pointer.active = true;
    }

    queueSample() {
      if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = requestAnimationFrame(() => this.sampleText());
    }

    scatterAndGather(fromTargets = false) {
      if (!this.particles.length) return;
      const spread = this.reduced ? 0 : this.options.scatter;
      this.particles.forEach(particle => {
        if (fromTargets) {
          const angle = particle.seed * Math.PI * 2;
          const distance = spread * (.35 + particle.depth * .75);
          particle.x = particle.targetX + Math.cos(angle) * distance + (particle.depth - .5) * spread * .55;
          particle.y = particle.targetY + Math.sin(angle) * distance + (particle.seed - .5) * spread * .55;
        }
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = this.reduced ? 0 : particle.seed * this.options.stagger;
      });
      this.gatherStart = performance.now();
      this.gathering = true;
    }

    async sampleText() {
      const currentBuild = ++this.buildId;
      const rect = this.container.getBoundingClientRect();
      this.width = Math.floor(rect.width);
      this.height = Math.floor(rect.height);
      if (this.width <= 0 || this.height <= 0) return;

      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.floor(this.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(this.height * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let fontSize = this.resolveFontSize(this.options.fontSize);
      let font = `${this.options.fontWeight} ${fontSize}px ${this.options.fontFamily}`;
      await this.waitForFont(font);
      if (currentBuild !== this.buildId) return;

      const raster = document.createElement('canvas');
      const rasterCtx = raster.getContext('2d', { willReadFrequently: true });
      rasterCtx.font = font;
      let metrics = rasterCtx.measureText(this.options.text);
      const maxTextWidth = this.width * .92;
      if (metrics.width > maxTextWidth) {
        fontSize = Math.max(18, fontSize * (maxTextWidth / metrics.width));
        font = `${this.options.fontWeight} ${fontSize}px ${this.options.fontFamily}`;
        await this.waitForFont(font);
        if (currentBuild !== this.buildId) return;
        rasterCtx.font = font;
        metrics = rasterCtx.measureText(this.options.text);
      }

      const left = Math.ceil(metrics.actualBoundingBoxLeft || 0);
      const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width);
      const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * .78);
      const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * .22);
      const padding = Math.max(12, Math.ceil(fontSize * .08));
      raster.width = Math.max(1, left + right) + padding * 2;
      raster.height = Math.max(1, ascent + descent) + padding * 2;
      rasterCtx.font = font;
      rasterCtx.textAlign = 'left';
      rasterCtx.textBaseline = 'alphabetic';
      rasterCtx.fillStyle = '#fff';
      rasterCtx.fillText(this.options.text, padding - left, padding + ascent);

      const image = rasterCtx.getImageData(0, 0, raster.width, raster.height);
      const targets = [];
      const step = Math.max(2, Math.floor(this.options.density));
      for (let y = 0; y < raster.height; y += step) {
        for (let x = 0; x < raster.width; x += step) {
          const alpha = image.data[(y * raster.width + x) * 4 + 3];
          if (alpha > 40) {
            targets.push({
              x: this.width / 2 - raster.width / 2 + x,
              y: this.height / 2 - raster.height / 2 + y,
              alpha: alpha / 255
            });
          }
        }
      }

      const maxParticles = Math.max(900, Math.min(5200, Math.floor((this.width * this.height) / 90)));
      const stride = Math.max(1, Math.ceil(targets.length / maxParticles));
      const base = this.toRgb(this.options.color);
      const highlight = this.toRgb(this.options.highlightColor);
      this.particles = targets.filter((_, index) => index % stride === 0).map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = .45 + (((index * 233 + 97) % 1000) / 1000) * .9;
        const blend = this.clamp(target.x / Math.max(1, this.width) + (seed - .5) * .35, 0, 1);
        const color = base && highlight ? this.mixColor(base, highlight, blend) : this.options.color;
        const angle = seed * Math.PI * 2;
        const distance = (this.reduced ? 0 : this.options.scatter) * (.35 + depth * .75);
        const startX = target.x + Math.cos(angle) * distance + (seed - .5) * this.options.scatter * .45;
        const startY = target.y + Math.sin(angle) * distance + (depth - .9) * this.options.scatter * .45;
        return {
          x: this.reduced ? target.x : startX,
          y: this.reduced ? target.y : startY,
          startX,
          startY,
          targetX: target.x,
          targetY: target.y,
          size: Math.max(.6, this.options.particleSize * (.75 + target.alpha * .45)),
          color,
          seed,
          depth,
          delay: seed * this.options.stagger
        };
      });

      this.pointer.x = this.pointer.smoothX = this.width / 2;
      this.pointer.y = this.pointer.smoothY = this.height / 2;
      if (this.reduced) {
        this.particles.forEach(particle => {
          particle.x = particle.startX = particle.targetX;
          particle.y = particle.startY = particle.targetY;
          particle.delay = 0;
        });
        this.gathering = false;
      } else {
        this.scatterAndGather(false);
      }
      if (this.animationFrame === null) this.animationFrame = requestAnimationFrame(this.render);
    }

    drawParticle(particle) {
      this.ctx.fillStyle = particle.color;
      if (particle.size <= 2.1) {
        this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        return;
      }
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    render(now) {
      const { ctx, options } = this;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.shadowBlur = options.glow && !this.reduced ? options.particleSize * 3 : 0;
      ctx.shadowColor = options.highlightColor;
      this.pointer.smoothX += (this.pointer.x - this.pointer.smoothX) * .18;
      this.pointer.smoothY += (this.pointer.y - this.pointer.smoothY) * .18;
      let complete = true;

      this.particles.forEach(particle => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        let progress = 1;
        if (this.gathering) {
          const local = (now - this.gatherStart - particle.delay) / Math.max(1, this.reduced ? 1 : options.gatherDuration);
          progress = this.clamp(local, 0, 1);
          const eased = this.easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!this.reduced && options.idleDrift > 0) {
          const time = now * .001;
          baseX += Math.sin(time * .9 + particle.seed * 10) * options.idleDrift * particle.depth;
          baseY += Math.cos(time * .75 + particle.depth * 10) * options.idleDrift * particle.depth;
        }

        if (this.pointer.active && !this.reduced) {
          const dx = baseX - this.pointer.smoothX;
          const dy = baseY - this.pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < options.repelRadius) {
            const force = Math.pow(1 - distance / options.repelRadius, 2) * options.pointerRepel;
            baseX += dx / distance * force;
            baseY += dy / distance * force;
          }
        }

        const follow = this.reduced ? 1 : .22;
        particle.x += (baseX - particle.x) * follow;
        particle.y += (baseY - particle.y) * follow;
        ctx.globalAlpha = this.clamp(.35 + progress * .65, 0, 1);
        this.drawParticle(particle);
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      if (this.gathering && complete) this.gathering = false;
      this.animationFrame = requestAnimationFrame(this.render);
    }
  }

  new ReactBitsParticleText(document.getElementById('name-particles'), {
    text: 'JESSIE LU',
    particleSize: 1.8,
    density: 3,
    color: '#d72c49',
    highlightColor: '#ff6a80',
    scatter: 160,
    gatherDuration: 1600,
    stagger: 420,
    pointerRepel: 55,
    repelRadius: 100,
    idleDrift: .12,
    fontSize: 'clamp(78px, 16vw, 220px)',
    fontWeight: 800,
    glow: false
  });
  addEventListener('hashchange', route);
  document.getElementById('year').textContent = new Date().getFullYear();
  route();
})();
