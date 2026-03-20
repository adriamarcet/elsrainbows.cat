export function setupMobileMenu(toggle, menu) {
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    menu.classList.toggle("is-open");
  });
}

export function setupHeaderScroll(header, win = window, threshold = 24) {
  if (!header || !win) return;

  let isScrollTicking = false;
  function syncHeaderState() {
    header.classList.toggle("is-scrolled", win.scrollY > threshold);
    isScrollTicking = false;
  }

  win.addEventListener(
    "scroll",
    () => {
      if (isScrollTicking) return;
      isScrollTicking = true;
      win.requestAnimationFrame(syncHeaderState);
    },
    { passive: true },
  );

  syncHeaderState();
}

export function setupSlideshow({
  slides,
  dots,
  prefersReducedMotion,
  setIntervalFn = setInterval,
  intervalMs = 4000,
}) {
  if (!Array.isArray(slides) || slides.length === 0) {
    return { showSlide: () => {}, start: () => null };
  }

  let current = slides.findIndex((slide) => slide.classList.contains("is-active"));
  if (current < 0) {
    current = 0;
    slides[0].classList.add("is-active");
  }

  function showSlide(next) {
    slides[current].classList.remove("is-active");
    dots[current]?.classList.remove("is-active");

    current = next;

    slides[current].classList.add("is-active");
    dots[current]?.classList.add("is-active");
  }

  function start() {
    if (slides.length <= 1 || prefersReducedMotion) return null;

    return setIntervalFn(() => {
      const next = (current + 1) % slides.length;
      showSlide(next);
    }, intervalMs);
  }

  return { showSlide, start };
}

function updateFormFeedback(form, message, isError = false) {
  const feedback = form.querySelector("[data-form-feedback]");
  if (!feedback) return;

  feedback.hidden = false;
  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
  feedback.classList.toggle("is-success", !isError);
}

function submitNetlifyForm(form, fetchFn) {
  if (form.dataset.submitting === "true") return;

  const formData = new FormData(form);
  form.dataset.submitting = "true";

  fetchFn("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData).toString(),
  })
    .then((response) => {
      if (response && "ok" in response && !response.ok) {
        throw new Error("Form submission failed");
      }

      updateFormFeedback(form, "Gracies! Hem rebut el missatge.");
      form.reset();
    })
    .catch(() => {
      updateFormFeedback(form, "No s'ha pogut enviar. Torna-ho a provar en uns minuts.", true);
    })
    .finally(() => {
      delete form.dataset.submitting;
    });
}

export function setupNetlifyAjaxForm(form, { fetchFn = fetch } = {}) {
  if (!form || typeof fetchFn !== "function") return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitNetlifyForm(form, fetchFn);
  });
}

export function setupNetlifyAjaxDelegation(doc = document, { fetchFn = fetch } = {}) {
  if (!doc || typeof fetchFn !== "function") return;

  doc.addEventListener("submit", (event) => {
    if (event.defaultPrevented) return;

    const form = event.target;
    if (!form || typeof form.matches !== "function") return;
    if (!form.matches("form[data-netlify='true'], form[name='contacte-rainbows']")) return;

    event.preventDefault();
    submitNetlifyForm(form, fetchFn);
  });
}

export function setFooterYear(yearElement, date = new Date()) {
  if (!yearElement) return;
  yearElement.textContent = String(date.getFullYear());
}

export function hydrateObfuscatedEmails(doc = document, { atobFn } = {}) {
  if (!doc || typeof doc.querySelectorAll !== "function") return;

  const decode =
    typeof atobFn === "function"
      ? atobFn
      : (value) => {
          try {
            if (typeof window !== "undefined" && typeof window.atob === "function") {
              return window.atob(value);
            }
          } catch (_error) {
            return "";
          }
          return "";
        };

  const emailNodes = doc.querySelectorAll("[data-email-b64]");
  emailNodes.forEach((node) => {
    const encoded = node.getAttribute("data-email-b64") || "";
    const email = decode(encoded);
    if (!email || !email.includes("@")) return;

    node.textContent = email;

    if (typeof node.matches === "function" && node.matches("a")) {
      node.removeAttribute("href");
      node.removeAttribute("rel");
    }
  });
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function setupAudioDock(doc = document) {
  if (!doc || typeof doc.querySelectorAll !== "function") return;

  const dock = doc.querySelector("[data-audio-dock]");
  if (!dock) return;

  const songNodes = Array.from(doc.querySelectorAll(".song"));
  const entries = songNodes
    .map((song) => {
      const audio = song.querySelector("audio");
      const title = song.querySelector("h3")?.textContent?.trim() || "Cançó sense títol";
      return audio ? { song, audio, title } : null;
    })
    .filter(Boolean);

  if (entries.length === 0) {
    dock.hidden = true;
    return;
  }

  doc.body?.classList.add("has-player-dock");
  dock.classList.add("is-collapsed");
  dock.querySelector(".player-dock__mini")?.setAttribute("aria-hidden", "false");

  const titleEls = Array.from(dock.querySelectorAll("[data-audio-title]"));
  const currentTimeEl = dock.querySelector("[data-audio-current]");
  const durationEl = dock.querySelector("[data-audio-duration]");
  const progressEl = dock.querySelector("[data-audio-progress]");
  const playBtns = Array.from(dock.querySelectorAll("[data-audio-play]"));
  const prevBtns = Array.from(dock.querySelectorAll("[data-audio-prev]"));
  const nextBtns = Array.from(dock.querySelectorAll("[data-audio-next]"));
  const listBtn = dock.querySelector("[data-audio-list]");
  const minimizeBtns = Array.from(dock.querySelectorAll("[data-audio-minimize]"));
  const closeBtns = Array.from(dock.querySelectorAll("[data-audio-close]"));

  let activeIndex = 0;
  let activeAudio = entries[0].audio;
  let isSeeking = false;
  let resizeTimer = null;

  entries.forEach((entry) => {
    const status = doc.createElement("span");
    status.className = "song-status";
    status.textContent = "Reproduint";
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-hidden", "true");
    entry.song.querySelector(".song-head")?.appendChild(status);
    entry.statusEl = status;
  });

  function pauseOtherAudios(current) {
    entries.forEach((entry) => {
      if (entry.audio !== current && !entry.audio.paused) {
        entry.audio.pause();
      }
    });
  }

  function setActive(index, { autoplay = false } = {}) {
    const boundedIndex = ((index % entries.length) + entries.length) % entries.length;
    const entry = entries[boundedIndex];
    if (!entry) return;

    if (activeAudio && activeAudio !== entry.audio) {
      activeAudio.pause();
    }

    activeIndex = boundedIndex;
    activeAudio = entry.audio;

    titleEls.forEach((node) => {
      node.textContent = entry.title;
      node.setAttribute("data-title", entry.title);
    });
    updateProgressFromAudio();
    updatePlayingState();
    updateSongIndicators();

    if (autoplay) {
      activeAudio.play().catch(() => {});
    }
  }

  function updateProgressFromAudio() {
    if (!activeAudio) return;
    const duration = activeAudio.duration;
    const current = activeAudio.currentTime || 0;

    if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
    if (durationEl) durationEl.textContent = duration ? formatTime(duration) : "--:--";

    if (progressEl && !isSeeking) {
      const ratio = duration ? current / duration : 0;
      progressEl.value = String(Math.round(ratio * 1000));
    }
  }

  function updatePlayingState() {
    if (!activeAudio) return;
    const isPlaying = !activeAudio.paused;
    dock.classList.toggle("is-playing", isPlaying);
    playBtns.forEach((btn) => {
      btn.setAttribute("aria-label", isPlaying ? "Pausar cançó" : "Reproduir cançó");
    });
  }

  function updateMiniMarquee() {
    const miniTitle = dock.querySelector(".player-dock__title--mini");
    if (!miniTitle) return;
    const textSpan = miniTitle.querySelector("[data-audio-title]");
    if (!textSpan) return;

    miniTitle.classList.remove("is-marquee");

    const probe = doc.createElement("span");
    probe.textContent = "00000000000000000000";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.whiteSpace = "nowrap";
    miniTitle.appendChild(probe);
    const twentyChWidth = probe.getBoundingClientRect().width;
    probe.remove();

    const containerWidth = miniTitle.getBoundingClientRect().width;
    const textWidth = textSpan.getBoundingClientRect().width;

    if (containerWidth < twentyChWidth && textWidth > containerWidth) {
      miniTitle.classList.add("is-marquee");
    }
  }

  function updateSongIndicators() {
    entries.forEach((entry) => {
      const isActive = entry.audio === activeAudio && !activeAudio.paused;
      entry.song.classList.toggle("is-playing", isActive);
      if (entry.statusEl) {
        entry.statusEl.setAttribute("aria-hidden", isActive ? "false" : "true");
      }
    });
  }

  function playNext() {
    if (entries.length === 0) return;
    let nextIndex = activeIndex + 1;
    setActive(nextIndex, { autoplay: true });
  }

  function playPrev() {
    if (entries.length === 0) return;
    let prevIndex = activeIndex - 1;
    setActive(prevIndex, { autoplay: true });
  }

  entries.forEach((entry, index) => {
    const { audio } = entry;

    audio.addEventListener("play", () => {
      activeAudio = audio;
      activeIndex = index;
      pauseOtherAudios(audio);
      titleEls.forEach((node) => {
        node.textContent = entry.title;
        node.setAttribute("data-title", entry.title);
      });
      updatePlayingState();
      updateSongIndicators();
    updateMiniMarquee();
    updateProgressFromAudio();
    });

    audio.addEventListener("pause", () => {
      if (activeAudio !== audio) return;
      updateMiniMarquee();
      updatePlayingState();
      updateSongIndicators();
    });

    audio.addEventListener("timeupdate", () => {
      if (activeAudio !== audio) return;
      updateProgressFromAudio();
    });

    audio.addEventListener("durationchange", () => {
      if (activeAudio !== audio) return;
      updateProgressFromAudio();
    });

    audio.addEventListener("ended", () => {
      if (activeAudio !== audio) return;
      updatePlayingState();
      updateSongIndicators();
    });
  });

  if (playBtns.length) {
    playBtns.forEach((playBtn) => {
      playBtn.addEventListener("click", () => {
        if (!activeAudio) return;
        if (activeAudio.paused) {
          activeAudio.play().catch(() => {});
        } else {
          activeAudio.pause();
        }
      });
    });
  }

  if (prevBtns.length) {
    prevBtns.forEach((prevBtn) => {
      prevBtn.addEventListener("click", () => playPrev());
    });
  }

  if (nextBtns.length) {
    nextBtns.forEach((nextBtn) => {
      nextBtn.addEventListener("click", () => playNext());
    });
  }


  if (progressEl) {
    progressEl.addEventListener("pointerdown", () => {
      isSeeking = true;
    });
    progressEl.addEventListener("pointerup", () => {
      isSeeking = false;
    });
    progressEl.addEventListener("input", () => {
      if (!activeAudio || !Number.isFinite(activeAudio.duration)) return;
      const ratio = Number(progressEl.value) / 1000;
      activeAudio.currentTime = ratio * activeAudio.duration;
      updateProgressFromAudio();
    });
    progressEl.addEventListener("change", () => {
      isSeeking = false;
    });
  }

  if (listBtn) {
    listBtn.addEventListener("click", () => {
      doc.querySelector("#lletres")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (minimizeBtns.length) {
    minimizeBtns.forEach((minimizeBtn) => {
      minimizeBtn.addEventListener("click", () => {
        dock.classList.toggle("is-collapsed");
        const isCollapsed = dock.classList.contains("is-collapsed");
        dock.querySelector(".player-dock__mini")?.setAttribute(
          "aria-hidden",
          isCollapsed ? "false" : "true",
        );
      });
    });
  }

  if (closeBtns.length) {
    closeBtns.forEach((closeBtn) => {
      closeBtn.addEventListener("click", () => {
        dock.hidden = true;
        doc.body?.classList.remove("has-player-dock");
      });
    });
  }

  if (typeof window !== "undefined") {
    window.addEventListener("resize", () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(updateMiniMarquee, 150);
    });
  }

  setActive(0);
  updateMiniMarquee();
}

export function initPage(doc = document, win = window) {
  const toggle = doc.querySelector(".nav-toggle");
  const menu = doc.querySelector("#menu");
  const header = doc.querySelector(".site-header");

  setupMobileMenu(toggle, menu);
  setupHeaderScroll(header, win);

  const slides = Array.from(doc.querySelectorAll(".slide"));
  const dots = Array.from(doc.querySelectorAll(".dot"));
  const prefersReducedMotion =
    typeof win.matchMedia === "function"
      ? win.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const slideshow = setupSlideshow({ slides, dots, prefersReducedMotion });
  slideshow.start();

  const fetchFn = typeof win.fetch === "function" ? win.fetch.bind(win) : null;
  const form = doc.querySelector("form[data-netlify='true'], form[name='contacte-rainbows']");
  setupNetlifyAjaxForm(form, { fetchFn });
  setupNetlifyAjaxDelegation(doc, { fetchFn });

  const atobFn = typeof win.atob === "function" ? win.atob.bind(win) : null;
  hydrateObfuscatedEmails(doc, { atobFn });

  const year = doc.querySelector("#year");
  setFooterYear(year);

  setupAudioDock(doc);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initPage(document, window);
}
