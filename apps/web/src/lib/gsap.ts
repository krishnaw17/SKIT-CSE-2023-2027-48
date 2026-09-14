import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Global GSAP defaults — matching the design brief
gsap.defaults({
  ease: 'power3.out',
  duration: 0.8,
});

// Smooth scroll integration
ScrollTrigger.config({
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load,resize',
});

export { gsap, ScrollTrigger };

// ============================================================================
// Animation presets — consistent across all GSAP usage
// ============================================================================

/** Fade-up with optional stagger for lists */
export function animateFadeUp(
  targets: gsap.TweenTarget,
  options: gsap.TweenVars = {},
) {
  return gsap.from(targets, {
    y: 32,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    ...options,
  });
}

/** Fade-up triggered by scroll */
export function animateOnScroll(
  targets: gsap.TweenTarget,
  trigger: string | Element,
  options: gsap.TweenVars = {},
) {
  return gsap.from(targets, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      once: true,
    },
    ...options,
  });
}

/** Stagger cards animation */
export function animateStagger(
  targets: gsap.TweenTarget,
  trigger: string | Element,
  staggerAmount = 0.12,
) {
  return gsap.from(targets, {
    y: 32,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: staggerAmount,
    scrollTrigger: {
      trigger,
      start: 'top 85%',
      once: true,
    },
  });
}

/** Animated counter */
export function animateCounter(
  element: Element,
  target: number,
  suffix = '',
  duration = 1.5,
) {
  const obj = { value: 0 };
  return gsap.to(obj, {
    value: target,
    duration,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: element,
      start: 'top 80%',
      once: true,
    },
    onUpdate() {
      element.textContent = `${Math.round(obj.value).toLocaleString()}${suffix}`;
    },
  });
}

/** Word-by-word text reveal */
export function animateWordReveal(
  container: Element,
  options: gsap.TweenVars = {},
) {
  const words = container.querySelectorAll('.word');
  return gsap.from(words, {
    y: '110%',
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.06,
    ...options,
  });
}
