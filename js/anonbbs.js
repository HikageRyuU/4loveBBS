(function() {
  // 生成饼干
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^ h >>> 16) >>> 0;
  }

  function mulberry32(seed) {
    return function() {
      seed += 0x6D2B79F5;
      let t = seed;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function generateCookie(threadId, floorIndex) {
    const seed = xmur3(threadId + '_floor_' + floorIndex);
    const random = mulberry32(seed);
    const chars = 'BbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(random() * chars.length)];
    }
    return 'No.' + result;
  }

  // 格式化时间
  function formatTime(timestamp) {
    const d = new Date(timestamp);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${day} ${h}:${min}:${s}`;
  }

  let floorsInited = false;
  function initFloors() {
    if (floorsInited) return;
    const floors = document.querySelectorAll('.reply-floor');
    if (!floors.length || !window.THREAD_BASE_TIME) return;
    floorsInited = true;

    let accumulatedTime = window.THREAD_BASE_TIME;
    let realFloorNum = 0;

    floors.forEach((floor) => {
      if (floor.dataset.fold) {
        const foldNum = parseInt(floor.dataset.fold, 10) || 0;
        realFloorNum += foldNum;
        return; 
      }

      if (floor.querySelector('.floor-header')) return;

      try {
        const header = document.createElement('div');
        header.className = 'floor-header';
        const cookieEl = document.createElement('span');
        cookieEl.className = 'floor-cookie';
        const customCookie = floor.dataset.cookie;
        cookieEl.textContent = customCookie || generateCookie(window.THREAD_ID, realFloorNum);

        if (floor.dataset.op === 'true') {
          const opBadge = document.createElement('span');
          opBadge.className = 'floor-badge op-badge';
          opBadge.textContent = '楼主';
          header.appendChild(opBadge);
          cookieEl.classList.add('op-cookie');
        }

        if (floor.dataset.admin === 'true') {
          const adminBadge = document.createElement('span');
          adminBadge.className = 'floor-admin-badge';
          adminBadge.textContent = '管理员';
          header.appendChild(adminBadge);
          cookieEl.classList.add('admin-cookie');
        }

        const timeOffset = parseInt(floor.dataset.timeOffset) || 0;
        accumulatedTime += timeOffset * 1000;
        const timeEl = document.createElement('span');
        timeEl.className = 'floor-time';
        timeEl.textContent = formatTime(accumulatedTime);

        header.appendChild(cookieEl);
        header.appendChild(timeEl);
        floor.insertBefore(header, floor.firstChild);

        const footer = document.createElement('div');
        footer.className = 'floor-footer';
        footer.innerHTML = `
          <span class="floor-number">第 ${realFloorNum} 层</span>
          <span class="floor-action">举报</span>
          <span class="floor-action">引用</span>
        `;
        floor.appendChild(footer);
        realFloorNum += 1;
      } catch (e) {}
    });
  }

  window.showToast = function(msg) {
    const toast = document.getElementById('fakeToast');
    if (!toast) return; 
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 1500);
  }

  // 伪发帖
  function initFakePostForm() {
    const form = document.getElementById('fake-post-form');
    if (!form) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const titleInput = form.querySelector('[name=title]');
      if (titleInput && !titleInput.value.trim()) {
        showToast('请输入帖子标题');
        return;
      }
      const btn = form.querySelector('.submit-btn');
      const originalText = btn.textContent;
      btn.textContent = '提交中...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        showToast('请先登录');
        form.reset();
        setTimeout(() => location.reload(), 800);
      }, 600);
    });
  }

  // 伪签到
  function initFakeCheckin() {
    const checkinBtn = document.getElementById('checkinBtn');
    if (!checkinBtn) return;
    checkinBtn.addEventListener('click', function() {
      showToast('请先登录');
      setTimeout(() => location.reload(), 800);
    });
  }

  // 伪登录
  function initFakeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      showToast('请先注册');
    });
  }

  function initAll() {
    initFloors();
    initFakePostForm();
    initFakeCheckin();
    initFakeLogin();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();