/**
 * Control background opacity on each section depending on scroll position
 */
document.addEventListener('DOMContentLoaded', () => {
  const bgSections = document.querySelectorAll('.section');
  const mainElement = document.querySelector('.quisom');
  
  // Cacheamos las imágenes de fondo de cada sección para no leer el CSS en cada frame
  const sectionsData = Array.from(bgSections).map(section => {
    return {
      el: section,
      bgImg: getComputedStyle(section).getPropertyValue('--bg-img').trim()
    };
  });
  
  const updateOpacities = () => {
    const vh = window.innerHeight;
    let maxOpacity = 0;
    let activeBgImg = '';
    let activeSectionId = '';

    sectionsData.forEach(data => {
      const rect = data.el.getBoundingClientRect();
      
      const distance = Math.max(vh, rect.height - vh);
      const startY = (vh - rect.height) / 2 + distance / 2;
      const progress = (startY - rect.y) / distance;
      
      if (progress >= 0 && progress <= 1) {
        let opacity = 0;
        if (progress <= 0.5) {
          opacity = progress * 2;
        } else {
          opacity = 1 - ((progress - 0.5) * 2);
        }
        
        // Elegimos la sección que tenga más opacidad en este instante
        if (opacity > maxOpacity) {
          maxOpacity = opacity;
          if (data.bgImg) activeBgImg = data.bgImg;
          activeSectionId = data.el.id;
        }
      }
    });

    if (mainElement) {
      mainElement.style.setProperty('--active-bg-opacity', maxOpacity.toFixed(3));
      if (activeBgImg) mainElement.style.setProperty('--active-bg-img', activeBgImg);
      if (activeSectionId) mainElement.setAttribute('data-active-section', activeSectionId);
    }
  };

  let isTicking = false;
  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(() => {
        updateOpacities();
        isTicking = false;
      });
      isTicking = true;
    }
  }, { passive: true });
  
  window.addEventListener('resize', () => {
    window.requestAnimationFrame(updateOpacities);
  }, { passive: true });
  
  updateOpacities();
});
