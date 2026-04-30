// ===== STATE =====
const WIN_IDS = ['about', 'links', 'work', 'contact'];
const state = {};
WIN_IDS.forEach(id => {
  state[id] = { open: false, minimized: false, maximized: false };
});

let zTop = 100;

// ===== OPEN =====
function openWindow(id) {
  const el = document.getElementById('window-' + id);
  const s = state[id];

  if (s.open && !s.minimized) {
    focusWindow(id);
    return;
  }

  s.open = true;
  s.minimized = false;
  el.classList.add('active');
  el.classList.remove('minimized');
  removeTaskbarBtn(id);

  // Pop-in animation
  el.style.opacity = '0';
  el.style.transform = 'scale(0.94) translateY(12px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
    el.style.opacity = '1';
    el.style.transform = 'scale(1) translateY(0)';
    setTimeout(() => { el.style.transition = ''; }, 200);
  });

  focusWindow(id);
}

// ===== CLOSE =====
function closeWindow(id) {
  const el = document.getElementById('window-' + id);
  el.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.96)';
  setTimeout(() => {
    el.classList.remove('active', 'focused', 'maximized');
    el.style.transition = '';
    el.style.opacity = '';
    el.style.transform = '';
    Object.assign(state[id], { open: false, minimized: false, maximized: false });
    removeTaskbarBtn(id);
  }, 140);
}

// ===== MINIMIZE =====
function minimizeWindow(id) {
  const el = document.getElementById('window-' + id);
  el.style.transition = 'opacity 0.14s ease, transform 0.14s ease';
  el.style.opacity = '0';
  el.style.transform = 'scale(0.9) translateY(20px)';
  setTimeout(() => {
    el.classList.remove('active', 'focused');
    el.style.transition = '';
    el.style.opacity = '';
    el.style.transform = '';
    state[id].minimized = true;
    addTaskbarBtn(id);
  }, 140);
}

// ===== MAXIMIZE =====
function maximizeWindow(id) {
  const el = document.getElementById('window-' + id);
  const s = state[id];
  if (s.maximized) {
    el.classList.remove('maximized');
    s.maximized = false;
  } else {
    el.classList.add('maximized');
    s.maximized = true;
    focusWindow(id);
  }
}

// ===== FOCUS =====
function focusWindow(id) {
  WIN_IDS.forEach(w => document.getElementById('window-' + w).classList.remove('focused'));
  const el = document.getElementById('window-' + id);
  el.classList.add('focused');
  zTop++;
  el.style.zIndex = zTop;
}

// ===== TASKBAR =====
function addTaskbarBtn(id) {
  if (document.getElementById('tb-' + id)) return;
  const btn = document.createElement('button');
  btn.className = 'taskbar-btn';
  btn.id = 'tb-' + id;
  btn.textContent = id;
  btn.onclick = () => restoreWindow(id);
  document.getElementById('taskbar').appendChild(btn);
}

function removeTaskbarBtn(id) {
  const btn = document.getElementById('tb-' + id);
  if (btn) btn.remove();
}

function restoreWindow(id) {
  const el = document.getElementById('window-' + id);
  state[id].minimized = false;
  el.classList.add('active');
  el.style.opacity = '0';
  el.style.transform = 'scale(0.94) translateY(12px)';
  requestAnimationFrame(() => {
    el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
    el.style.opacity = '1';
    el.style.transform = 'scale(1) translateY(0)';
    setTimeout(() => { el.style.transition = ''; }, 200);
  });
  focusWindow(id);
  removeTaskbarBtn(id);
}

// Click anywhere on window to focus
WIN_IDS.forEach(id => {
  document.getElementById('window-' + id).addEventListener('mousedown', () => focusWindow(id));
});

// ===== DRAG =====
let dragging = null, offX = 0, offY = 0;

function startDrag(e, windowId) {
  const id = windowId.replace('window-', '');
  if (state[id].maximized) return;

  dragging = document.getElementById(windowId);
  const rect = dragging.getBoundingClientRect();
  offX = e.clientX - rect.left;
  offY = e.clientY - rect.top;
  focusWindow(id);
  e.preventDefault();
}

document.addEventListener('mousemove', e => {
  if (!dragging) return;
  const dw = document.getElementById('desktop').getBoundingClientRect();
  let x = e.clientX - dw.left - offX;
  let y = e.clientY - dw.top  - offY;
  // Clamp so window stays on screen
  x = Math.max(0, Math.min(x, dw.width  - dragging.offsetWidth));
  y = Math.max(40, Math.min(y, dw.height - 60));
  dragging.style.left = x + 'px';
  dragging.style.top  = y + 'px';
});

document.addEventListener('mouseup', () => { dragging = null; });