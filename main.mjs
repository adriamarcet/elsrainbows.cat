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

export function setupNetlifyAjaxForm(form, { fetchFn = fetch } = {}) {
  if (!form || typeof fetchFn !== "function") return;

  const feedback = form.querySelector("[data-form-feedback]");

  const updateFeedback = (message, isError = false) => {
    if (!feedback) return;

    feedback.hidden = false;
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
    feedback.classList.toggle("is-success", !isError);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const myForm = event.target;
    const formData = new FormData(myForm);

    fetchFn("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      .then((response) => {
        if (response && "ok" in response && !response.ok) {
          throw new Error("Form submission failed");
        }
        updateFeedback("Gracies! Hem rebut el missatge.");
        myForm.reset();
      })
      .catch(() => {
        updateFeedback("No s'ha pogut enviar. Torna-ho a provar en uns minuts.", true);
      });
  };

  form.addEventListener("submit", handleSubmit);
}

export function setFooterYear(yearElement, date = new Date()) {
  if (!yearElement) return;
  yearElement.textContent = String(date.getFullYear());
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

  const form = doc.querySelector("form[data-netlify='true']");
  setupNetlifyAjaxForm(form, { fetchFn: win.fetch?.bind(win) });

  const year = doc.querySelector("#year");
  setFooterYear(year);
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initPage(document, window);
}
