// Smooth scroll (if needed)
gsap.registerPlugin(ScrollTrigger);

// Animate hero section
gsap.from(".content h1", {
  y: 60,
  opacity: 0,
  duration: 1.2,
  ease: "power2.out"
});

gsap.from(".emoji-container img", {
  scrollTrigger: ".emoji-container",
  y: 20,
  opacity: 0,
  stagger: 0.1,
  duration: 1
});

gsap.utils.toArray(".video-card").forEach(card => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 80%",
    },
    y: 30,
    opacity: 0,
    duration: 1,
    ease: "power2.out"
  });
});
const buttons = document.querySelectorAll('.nav-btn');
const indicator = document.getElementById('navIndicator');

function updateIndicator(el) {
  const rect = el.getBoundingClientRect();
  indicator.style.width = `${rect.width}px`;
  indicator.style.left = `${el.offsetLeft}px`;
}

buttons.forEach(btn => {
  btn.addEventListener('click', () => updateIndicator(btn));
});

// Default highlight
window.addEventListener('load', () => {
  const activePage = location.pathname.split("/").pop();
  const defaultBtn = [...buttons].find(btn => btn.textContent.toLowerCase() === activePage.replace(".html", ""));
  if (defaultBtn) updateIndicator(defaultBtn);
  else updateIndicator(buttons[0]); // fallback
});
