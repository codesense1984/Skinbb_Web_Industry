// Common Motion One animation presets
// Keep durations <= 0.25s for snappy UI

// Fade
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { duration: 0.22, easing: [0.22, 0.8, 0.22, 1] },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.22, easing: [0.22, 0.8, 0.22, 1] },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 12 },
  transition: { duration: 0.22 },
};

// Scale / Zoom
export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.18 },
};

export const zoomIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.25, easing: [0.16, 1, 0.3, 1] },
};

// Slide
export const slideUp = {
  initial: { y: 40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 40, opacity: 0 },
  transition: { duration: 0.25, easing: [0.16, 1, 0.3, 1] },
};

export const slideDown = {
  initial: { y: -40, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -40, opacity: 0 },
  transition: { duration: 0.25, easing: [0.16, 1, 0.3, 1] },
};

export const slideLeft = {
  initial: { x: -40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
  transition: { duration: 0.25, easing: [0.16, 1, 0.3, 1] },
};

export const slideRight = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
  transition: { duration: 0.25, easing: [0.16, 1, 0.3, 1] },
};

// Stagger utility
export const staggerChildren = (delay = 0.05) => ({
  animate: { transition: { staggerChildren: delay } },
});

// Bounce (subtle)
export const bounceIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
};
