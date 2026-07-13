(function() {
  // 生成饼干
  function generateCookie(threadId, floorIndex) {
    const seed = threadId + '_floor_' + floorIndex;
    let hash = 5381;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) + hash) + seed.charCodeAt(i);
      hash = hash | 0;
    }

    let n = Math.abs(hash);
    const chars = 'BbCcDdEeFfGgHhJjKkLlMmNnPpQqRrSsTtUuVvWwXxYyZz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      n = (n * 1145141919 + 12345) & 0x7fffffff;
      result += chars[n % chars.length];
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

  function initFloors() {
    const floors = document.querySelectorAll('.reply-floor');
    if (!floors.length || !window.THREAD_BASE_TIME) return;

    let accumulatedTime = window.THREAD_BASE_TIME;

    floors.forEach((floor, index) => {
      try {
        // 楼层头部
        const header = document.createElement('div');
        header.className = 'floor-header';

        // 饼干
        const cookieEl = document.createElement('span');
        cookieEl.className = 'floor-cookie';
        const customCookie = floor.dataset.cookie;
        cookieEl.textContent = customCookie || generateCookie(window.THREAD_ID, index);

        // 楼主徽章
        if (floor.dataset.op === 'true') {
          const opBadge = document.createElement('span');
          opBadge.className = 'floor-badge op-badge';
          opBadge.textContent = '楼主';
          header.appendChild(opBadge);
          cookieEl.classList.add('op-cookie');
        }

        // 管理员徽章
        if (floor.dataset.admin === 'true') {
          const adminBadge = document.createElement('span');
          adminBadge.className = 'floor-admin-badge';
          adminBadge.textContent = '管理员';
          header.appendChild(adminBadge);
          cookieEl.classList.add('admin-cookie');
        }

        // 计算并显示时间
        const timeOffset = parseInt(floor.dataset.timeOffset) || 0;
        accumulatedTime += timeOffset * 1000;
        const timeEl = document.createElement('span');
        timeEl.className = 'floor-time';
        timeEl.textContent = formatTime(accumulatedTime);

        header.appendChild(cookieEl);
        header.appendChild(timeEl);
        floor.insertBefore(header, floor.firstChild);

        // 楼层底部
        const footer = document.createElement('div');
        footer.className = 'floor-footer';
        footer.innerHTML = `
          <span class="floor-number">第 ${index} 层</span>
          <span class="floor-action">举报</span>
          <span class="floor-action">引用</span>
        `;
        floor.appendChild(footer);

      } catch (e) {
      }
    });
  }

  // 兼容DOM加载状态
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloors);
  } else {
    initFloors();
  }
})();

// 伪发帖
(function initFakePostForm() {
  const form = document.getElementById('fake-post-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = form.querySelector('[name=title]').value.trim();
    
    if (!title) {
      alert('请输入帖子标题');
      return;
    }

    const btn = form.querySelector('.submit-btn');
    const originalText = btn.textContent;
    btn.textContent = '提交中...';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
      alert('发布失败');
      form.reset();
    }, 600);
  });
})();