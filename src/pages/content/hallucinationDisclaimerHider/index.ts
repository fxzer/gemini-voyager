/**
 * Hallucination Disclaimer Hider - Hides the AI hallucination disclaimer
 *
 * This module automatically hides the hallucination disclaimer element
 * that appears at the bottom of Gemini responses.
 */

const DISCLAIMER_SELECTOR = 'hallucination-disclaimer';
const HIDDEN_CLASS = 'gv-disclaimer-hidden';

let observer: MutationObserver | null = null;

/**
 * Hide a single disclaimer element
 */
function hideDisclaimer(element: Element): void {
  if (!(element instanceof HTMLElement)) return;
  if (!element.classList.contains(HIDDEN_CLASS)) {
    element.classList.add(HIDDEN_CLASS);
  }
}

/**
 * Find and hide all disclaimer elements in the document
 */
function hideAllDisclaimers(): void {
  const disclaimers = document.querySelectorAll(DISCLAIMER_SELECTOR);
  disclaimers.forEach(hideDisclaimer);
}

/**
 * Initialize the disclaimer hider
 */
function init(): void {
  // Hide existing disclaimers
  hideAllDisclaimers();

  // Observe for dynamically added disclaimers
  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node instanceof HTMLElement) {
          if (node.matches(DISCLAIMER_SELECTOR)) {
            hideDisclaimer(node);
          }
          // Also check children
          const children = node.querySelectorAll(DISCLAIMER_SELECTOR);
          children.forEach(hideDisclaimer);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Cleanup function
 */
function cleanup(): void {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Remove hidden class from all disclaimers
  document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => {
    el.classList.remove(HIDDEN_CLASS);
  });
}

/**
 * Start the disclaimer hider
 */
export function startDisclaimerHider(): () => void {
  // Only run on gemini.google.com
  if (location.hostname !== 'gemini.google.com') {
    return () => {};
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure Gemini's UI is rendered
    setTimeout(init, 100);
  }

  return cleanup;
}
