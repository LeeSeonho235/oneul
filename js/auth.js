// auth.js - 인증 관련 기능

/**
 * 인증 상태 관리
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.init();
  }

  init() {
    // 페이지 로드 시 인증 상태 확인
    this.checkAuthStatus();
    
    // 인증 상태 변경 이벤트 리스너 등록
    this.setupEventListeners();
  }

  // 인증 상태 확인
  checkAuthStatus() {
    const user = API.user.getCurrentUser();
    const token = SessionStorage.get('authToken');
    
    if (user && token) {
      this.currentUser = user;
      this.isAuthenticated = true;
      this.updateUI();
    } else {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.updateUI();
    }
  }

  // UI 업데이트
  updateUI() {
    const loginButtons = document.getElementById('loginButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');

    if (this.isAuthenticated) {
      // 로그인된 상태
      if (loginButtons) loginButtons.style.display = 'none';
      if (userInfo) userInfo.style.display = 'flex';
      if (userName) userName.textContent = `${this.currentUser.name}님 환영합니다!`;
    } else {
      // 로그인되지 않은 상태
      if (loginButtons) loginButtons.style.display = 'flex';
      if (userInfo) userInfo.style.display = 'none';
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 로그인 폼 처리
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // 회원가입 폼 처리
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // 비밀번호 재설정 폼 처리
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => this.handlePasswordReset(e));
    }
  }

  // 로그인 처리
  async handleLogin(e) {
    e.preventDefault();
    
    const formData = getFormData(e.target);
    const { username, password } = formData;

    try {
      Loading.show('#loginForm .btn-primary');
      
      const result = await API.user.login(username, password);
      
      if (result.success) {
        this.currentUser = result.user;
        this.isAuthenticated = true;
        this.updateUI();
        
        Notification.success('로그인되었습니다!');
        this.closeModal('loginModal');
        
        // 페이지 새로고침 또는 리다이렉트
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      Notification.error(error.message);
    } finally {
      Loading.hide('#loginForm .btn-primary');
    }
  }

  // 회원가입 처리
  async handleSignup(e) {
    e.preventDefault();
    
    const formData = getFormData(e.target);
    
    try {
      Loading.show('#signupForm .btn-primary');
      
      // 유효성 검사
      await this.validateSignupData(formData);
      
      const result = await API.user.signup(formData);
      
      if (result.success) {
        Notification.success('회원가입이 완료되었습니다!');
        this.closeModal('signupModal');
        
        // 로그인 페이지로 이동
        setTimeout(() => {
          this.showModal('loginModal');
        }, 1000);
      }
    } catch (error) {
      Notification.error(error.message);
    } finally {
      Loading.hide('#signupForm .btn-primary');
    }
  }

  // 회원가입 데이터 유효성 검사
  async validateSignupData(data) {
    const { username, password, passwordConfirm, email, name } = data;

    // 필수 필드 확인
    if (!username || !password || !passwordConfirm || !email || !name) {
      throw new Error('모든 필수 항목을 입력해주세요.');
    }

    // 아이디 유효성 검사
    if (!Validation.isValidUsername(username)) {
      throw new Error('아이디는 영문, 숫자, 언더스코어 4-20자로 입력해주세요.');
    }

    // 아이디 중복 확인 (비동기로 변경)
    const usernameExists = await API.user.isUsernameExists(username);
    if (usernameExists) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    // 비밀번호 강도 검사
    const passwordStrength = Validation.getPasswordStrength(password);
    if (passwordStrength.level === 'weak') {
      throw new Error('비밀번호가 너무 약합니다. 더 강한 비밀번호를 사용해주세요.');
    }

    // 이메일 유효성 검사
    if (!Validation.isValidEmail(email)) {
      throw new Error('올바른 이메일 주소를 입력해주세요.');
    }

    // 이메일 중복 확인 (비동기로 변경)
    const emailExists = await API.user.isEmailExists(email);
    if (emailExists) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // 생년월일 유효성 검사
    if (data.birthDate && !Validation.isValidBirthDate(data.birthDate)) {
      throw new Error('올바른 생년월일을 입력해주세요.');
    }
  }

  // 비밀번호 재설정 처리
  async handlePasswordReset(e) {
    e.preventDefault();
    
    const formData = getFormData(e.target);
    const { email } = formData;

    try {
      Loading.show('#resetPasswordForm .btn-primary');
      
      const result = await API.user.resetPassword(email);
      
      if (result.success) {
        Notification.success(result.message);
        this.closeModal('resetPasswordModal');
      }
    } catch (error) {
      Notification.error(error.message);
    } finally {
      Loading.hide('#resetPasswordForm .btn-primary');
    }
  }

  // 로그아웃 처리
  logout() {
    API.user.logout();
    this.currentUser = null;
    this.isAuthenticated = false;
    this.updateUI();
    
    Notification.success('로그아웃되었습니다.');
    
    // 페이지 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // 모달 표시
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // 모달 닫기
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // 폼 초기화
      const form = modal.querySelector('form');
      if (form) {
        form.reset();
      }
    }
  }

  // 사용자 정보 업데이트
  async updateUserProfile(userData) {
    if (!this.isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      Loading.show('#profileForm .btn-primary');
      
      const result = await API.user.updateUser(this.currentUser.id, userData);
      
      if (result.success) {
        this.currentUser = { ...this.currentUser, ...userData };
        SessionStorage.set('currentUser', this.currentUser);
        this.updateUI();
        
        Notification.success('프로필이 업데이트되었습니다.');
      }
    } catch (error) {
      Notification.error(error.message);
    } finally {
      Loading.hide('#profileForm .btn-primary');
    }
  }

  // 비밀번호 변경
  async changePassword(currentPassword, newPassword) {
    if (!this.isAuthenticated) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      // 현재 비밀번호 확인
      const hashedCurrentPassword = await Crypto.hashPassword(currentPassword);
      if (this.currentUser.password !== hashedCurrentPassword) {
        throw new Error('현재 비밀번호가 올바르지 않습니다.');
      }

      // 새 비밀번호 강도 검사
      const passwordStrength = Validation.getPasswordStrength(newPassword);
      if (passwordStrength.level === 'weak') {
        throw new Error('새 비밀번호가 너무 약합니다.');
      }

      Loading.show('#changePasswordForm .btn-primary');
      
      const result = await API.user.updateUser(this.currentUser.id, {
        password: newPassword
      });
      
      if (result.success) {
        Notification.success('비밀번호가 변경되었습니다.');
        this.closeModal('changePasswordModal');
      }
    } catch (error) {
      Notification.error(error.message);
    } finally {
      Loading.hide('#changePasswordForm .btn-primary');
    }
  }
}

/**
 * 전역 인증 관리자 인스턴스
 */
const authManager = new AuthManager();

/**
 * 전역 함수들 (HTML에서 직접 호출용)
 */
window.showLogin = () => authManager.showModal('loginModal');
window.showSignup = () => authManager.showModal('signupModal');
window.showResetPassword = () => authManager.showModal('resetPasswordModal');
window.closeLogin = () => authManager.closeModal('loginModal');
window.closeSignup = () => authManager.closeModal('signupModal');
window.closeResetPassword = () => authManager.closeModal('resetPasswordModal');
window.logout = () => authManager.logout();

/**
 * 아이디 중복 확인 (실시간)
 */
async function checkUsernameAvailability(username) {
  if (!username) return;
  
  const debouncedCheck = debounce(async (username) => {
    try {
      const exists = await API.user.isUsernameExists(username);
      const isAvailable = !exists;
      const messageElement = document.getElementById('usernameMessage');
      
      if (messageElement) {
        if (isAvailable) {
          messageElement.textContent = '사용 가능한 아이디입니다.';
          messageElement.className = 'validation-message success';
        } else {
          messageElement.textContent = '이미 사용 중인 아이디입니다.';
          messageElement.className = 'validation-message error';
        }
      }
    } catch (error) {
      console.error('아이디 중복 확인 오류:', error);
      const messageElement = document.getElementById('usernameMessage');
      if (messageElement) {
        messageElement.textContent = '중복 확인 중 오류가 발생했습니다.';
        messageElement.className = 'validation-message error';
      }
    }
  }, 500);
  
  debouncedCheck(username);
}

/**
 * 비밀번호 강도 표시
 */
function showPasswordStrength(password) {
  const strengthElement = document.getElementById('passwordStrength');
  
  if (!strengthElement || !password) return;
  
  const strength = Validation.getPasswordStrength(password);
  const strengthText = {
    weak: '약함',
    medium: '보통',
    strong: '강함'
  };
  
  strengthElement.textContent = `비밀번호 강도: ${strengthText[strength.level]}`;
  strengthElement.className = `password-strength strength-${strength.level}`;
}

/**
 * 비밀번호 확인
 */
function checkPasswordMatch(password, confirmPassword) {
  const confirmElement = document.getElementById('passwordConfirm');
  
  if (!confirmElement || !confirmPassword) return;
  
  if (password === confirmPassword) {
    confirmElement.style.borderColor = 'var(--success)';
  } else {
    confirmElement.style.borderColor = 'var(--error)';
  }
}

/**
 * 이메일 중복 확인
 */
async function checkEmailAvailability(email) {
  if (!email) return;
  
  const debouncedCheck = debounce(async (email) => {
    try {
      const exists = await API.user.isEmailExists(email);
      const isAvailable = !exists;
      const messageElement = document.getElementById('emailMessage');
      
      if (messageElement) {
        if (isAvailable) {
          messageElement.textContent = '사용 가능한 이메일입니다.';
          messageElement.className = 'validation-message success';
        } else {
          messageElement.textContent = '이미 사용 중인 이메일입니다.';
          messageElement.className = 'validation-message error';
        }
      }
    } catch (error) {
      console.error('이메일 중복 확인 오류:', error);
      const messageElement = document.getElementById('emailMessage');
      if (messageElement) {
        messageElement.textContent = '중복 확인 중 오류가 발생했습니다.';
        messageElement.className = 'validation-message error';
      }
    }
  }, 500);
  
  debouncedCheck(email);
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
  // 아이디 입력 필드에 실시간 중복 확인 이벤트 추가
  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    usernameInput.addEventListener('input', (e) => {
      checkUsernameAvailability(e.target.value);
    });
  }

  // 비밀번호 입력 필드에 강도 표시 이벤트 추가
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      showPasswordStrength(e.target.value);
    });
  }

  // 비밀번호 확인 필드에 일치 확인 이벤트 추가
  const passwordConfirmInput = document.getElementById('passwordConfirm');
  if (passwordConfirmInput) {
    passwordConfirmInput.addEventListener('input', (e) => {
      const password = document.getElementById('password').value;
      checkPasswordMatch(password, e.target.value);
    });
  }

  // 이메일 입력 필드에 실시간 중복 확인 이벤트 추가
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      checkEmailAvailability(e.target.value);
    });
  }

  // 모달 외부 클릭 시 닫기
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      authManager.closeModal(e.target.id);
    }
  });

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal[style*="flex"]');
      if (openModal) {
        authManager.closeModal(openModal.id);
      }
    }
  });
});

// 전역에서 사용할 수 있도록 window 객체에 추가
window.authManager = authManager;
