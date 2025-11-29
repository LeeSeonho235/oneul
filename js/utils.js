// utils.js - 유틸리티 함수들

/**
 * 로컬 스토리지 관리
 */
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage get error:', error);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

/**
 * 세션 스토리지 관리
 */
const SessionStorage = {
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('SessionStorage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('SessionStorage get error:', error);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('SessionStorage remove error:', error);
      return false;
    }
  }
};

/**
 * 비밀번호 암호화 (간단한 해시 함수)
 */
const Crypto = {
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
};

/**
 * 유효성 검사 함수들
 */
const Validation = {
  // 이메일 유효성 검사
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // 비밀번호 강도 검사
  getPasswordStrength(password) {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-zA-Z\d]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { level: 'weak', score, checks };
    if (score <= 3) return { level: 'medium', score, checks };
    return { level: 'strong', score, checks };
  },

  // 아이디 유효성 검사
  isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
    return usernameRegex.test(username);
  },

  // 전화번호 유효성 검사
  isValidPhone(phone) {
    const phoneRegex = /^[0-9-+\s()]{10,}$/;
    return phoneRegex.test(phone);
  },

  // 생년월일 유효성 검사
  isValidBirthDate(date) {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 13 && age <= 120;
  }
};

/**
 * 디바운스 함수
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 스로틀 함수
 */
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 알림 메시지 표시
 */
const Notification = {
  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    
    // 스타일 적용
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '10000',
      maxWidth: '400px',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(notification);

    // 자동 제거
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, duration);
  },

  success(message, duration) {
    this.show(message, 'success', duration);
  },

  error(message, duration) {
    this.show(message, 'error', duration);
  },

  warning(message, duration) {
    this.show(message, 'warning', duration);
  },

  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

/**
 * 로딩 스피너 표시/숨김
 */
const Loading = {
  show(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      element.innerHTML = '<div class="loading"></div>';
      element.style.display = 'flex';
      element.style.justifyContent = 'center';
      element.style.alignItems = 'center';
    }
  },

  hide(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (element) {
      element.innerHTML = '';
      element.style.display = '';
    }
  }
};

/**
 * 폼 데이터 수집
 */
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    if (data[key]) {
      // 배열인 경우
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

/**
 * URL 파라미터 파싱
 */
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (let [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

/**
 * 날짜 포맷팅
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 숫자 포맷팅
 */
function formatNumber(num, decimals = 0) {
  return new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * 파일 크기 포맷팅
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 랜덤 ID 생성
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 클립보드에 복사
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    Notification.success('클립보드에 복사되었습니다.');
    return true;
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    Notification.error('클립보드 복사에 실패했습니다.');
    return false;
  }
}

/**
 * 디바이스 타입 감지
 */
function getDeviceType() {
  const width = window.innerWidth;
  
  if (width <= 480) return 'mobile';
  if (width <= 768) return 'tablet';
  if (width <= 1024) return 'laptop';
  return 'desktop';
}

/**
 * 브라우저 정보 감지
 */
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'chrome';
  if (userAgent.includes('Firefox')) return 'firefox';
  if (userAgent.includes('Safari')) return 'safari';
  if (userAgent.includes('Edge')) return 'edge';
  return 'unknown';
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
