// ===== WINDOW MANAGER =====

const windows = ['about', 'links', 'process', 'contact'];
const windowStates = {};
let zCounter = 10;

// Init state
windows.forEach(id => {
  windowStates[id] = { open: false, minimized: false, maximized: false };
});

function openWindow(id) {
  const el = document.getElementById('window-' + id);
  const state = windowStates[id];

  if (state.open && !state.minimized) {
    focusWindow(id);
    return;
  }

  state.open = true;
  state.minimized = false;
  el.classList.add('active');
  el.classList.remove('minimized');
  focusWindow(id);
  removeTaskbarBtn(id);

  // Animate in
  el.style.opacity = '0';
  el.style.transform = 'scale(0.96) translateY(8px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '1';
    el.style.transform = 'scale(1) translateY(0)';
  });

  el.addEventListener('mousedown', () => focusWindow(id));
}

function closeWindow(id) {
  const el = document.getElementById('window-' + id);
  const state = windowStates[id];

  el.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.95)';

  setTimeout(() => {
    el.classList.remove('active', 'focused', 'maximized', 'minimized');
    el.style.transform = '';
    el.style.opacity = '';
    state.open = false;
    state.minimized = false;
    state.maximized = false;
    removeTaskbarBtn(id);
  }, 150);
}

function minimizeWindow(id) {
  const el = document.getElementById('window-' + id);
  const state = windowStates[id];

  el.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.92) translateY(20px)';

  setTimeout(() => {
    el.classList.add('minimized');
    el.classList.remove('active', 'focused');
    el.style.transform = '';
    el.style.opacity = '';
    state.minimized = true;
    addTaskbarBtn(id);
  }, 150);
}

function maximizeWindow(id) {
  const el = document.getElementById('window-' + id);
  const state = windowStates[id];

  if (state.maximized) {
    el.classList.remove('maximized');
    state.maximized = false;
  } else {
    el.classList.add('maximized');
    state.maximized = true;
    focusWindow(id);
  }
}

function focusWindow(id) {
  windows.forEach(w => {
    document.getElementById('window-' + w).classList.remove('focused');
  });
  const el = document.getElementById('window-' + id);
  el.classList.add('focused');
  zCounter++;
  el.style.zIndex = zCounter;
}

// ===== TASKBAR =====
function addTaskbarBtn(id) {
  const taskbar = document.getElementById('taskbar');
  if (document.getElementById('tb-' + id)) return;

  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'tb-' + id;
  btn.textContent = id.charAt(0).toUpperCase() + id.slice(1);
  btn.onclick = () => restoreWindow(id);
  taskbar.appendChild(btn);
}

function removeTaskbarBtn(id) {
  const btn = document.getElementById('tb-' + id);
  if (btn) btn.remove();
}

function restoreWindow(id) {
  const el = document.getElementById('window-' + id);
  const state = windowStates[id];

  el.classList.remove('minimized');
  el.classList.add('active');
  state.minimized = false;

  el.style.opacity = '0';
  el.style.transform = 'scale(0.96) translateY(8px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '1';
    el.style.transform = 'scale(1) translateY(0)';
  });

  focusWindow(id);
  removeTaskbarBtn(id);
}

// ===== DRAG =====
let dragging = null;
let dragOffX = 0, dragOffY = 0;

function startDrag(e, id) {
  const el = document.getElementById(id);
  const state = windowStates[id.replace('window-', '')];
  if (state && state.maximized) return; // don't drag maximized

  dragging = el;
  const rect = el.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  focusWindow(id.replace('window-', ''));

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
}

function onDrag(e) {
  if (!dragging) return;
  const desktop = document.getElementById('desktop');
  const dRect = desktop.getBoundingClientRect();

  let x = e.clientX - dRect.left - dragOffX;
  let y = e.clientY - dRect.top - dragOffY;

  // Clamp to desktop bounds
  x = Math.max(0, Math.min(x, dRect.width - dragging.offsetWidth));
  y = Math.max(0, Math.min(y, dRect.height - 48 - dragging.offsetHeight));

  dragging.style.left = x + 'px';
  dragging.style.top = y + 'px';
}

function stopDrag() {
  dragging = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}