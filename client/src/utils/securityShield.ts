/**
 * Auralis Security Shield & Anti-Inspection Engine
 * Defends against DevTools inspection, element tampering, context menu extraction,
 * and unauthorized source viewing.
 */

let isShieldActive = false;
let lockoutOverlay: HTMLDivElement | null = null;

function createLockoutOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'auralis-security-shield-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '999999';
  overlay.style.backgroundColor = '#000000';
  overlay.style.color = '#ffffff';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '24px';
  overlay.style.textAlign = 'center';
  overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  overlay.style.userSelect = 'none';

  overlay.innerHTML = `
    <div style="max-width: 480px; background: #121212; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 36px 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.85);">
      <div style="width: 64px; height: 64px; margin: 0 auto 20px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center; color: #ef4444; font-size: 30px;">
        🛡️
      </div>
      <h2 style="font-size: 22px; font-weight: 800; margin: 0 0 10px; color: #ffffff; letter-spacing: -0.02em;">
        Security Shield Active
      </h2>
      <p style="font-size: 13px; color: #b3b3b3; line-height: 1.6; margin: 0 0 20px;">
        Developer inspection tools and DOM tampering are strictly restricted on Auralis.
      </p>
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; font-size: 12px; color: #1ed760; font-weight: 600;">
        Please close developer tools to continue streaming.
      </div>
    </div>
  `;
  return overlay;
}

function showLockout() {
  if (!lockoutOverlay) {
    lockoutOverlay = createLockoutOverlay();
  }
  if (!document.body.contains(lockoutOverlay)) {
    document.body.appendChild(lockoutOverlay);
  }
}

function hideLockout() {
  if (lockoutOverlay && document.body.contains(lockoutOverlay)) {
    document.body.removeChild(lockoutOverlay);
  }
}

export function initSecurityShield() {
  if (isShieldActive || typeof window === 'undefined') return;
  isShieldActive = true;

  // 1. Disable Context Menu (Right Click)
  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    },
    true
  );

  // 2. Intercept DevTools Keyboard Shortcuts
  window.addEventListener(
    'keydown',
    (e) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier) {
        const key = e.key.toUpperCase();

        // Ctrl/Cmd + Shift + I/J/C/K (DevTools & Console)
        if (e.shiftKey && (key === 'I' || key === 'J' || key === 'C' || key === 'K')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        // Ctrl/Cmd + U (View Source), Ctrl/Cmd + S (Save Page), Ctrl/Cmd + P (Print)
        if (key === 'U' || key === 'S' || key === 'P') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    },
    true
  );

  // 3. Disable Drag and Drop of Images and Content
  document.addEventListener(
    'dragstart',
    (e) => {
      e.preventDefault();
      return false;
    },
    true
  );

  // 4. Sanitize Console Output
  try {
    const noop = () => {};
    console.log = noop;
    console.info = noop;
    console.debug = noop;
    console.dir = noop;
    console.table = noop;

    // Display anti-tamper warning if console is opened
    setInterval(() => {
      try {
        console.clear();
      } catch {}
    }, 2500);
  } catch {}

  // 5. DevTools Detection via Viewport Disparity & Anti-Debugger Trap
  const threshold = 160;

  const checkDevTools = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isDevToolsOpen = widthDiff > threshold || heightDiff > threshold;

    if (isDevToolsOpen) {
      showLockout();
    } else {
      hideLockout();
    }
  };

  window.addEventListener('resize', checkDevTools);
  setInterval(checkDevTools, 800);

  // 6. Anti-Debugger Protection Loop
  setInterval(() => {
    const startTime = performance.now();
    // Anti-tamper inspection checkpoint
    (function () {
      debugger;
    })();
    const timeTaken = performance.now() - startTime;
    if (timeTaken > 100) {
      showLockout();
    }
  }, 1200);
}
