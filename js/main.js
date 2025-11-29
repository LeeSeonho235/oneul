// main.js - 메인 기능 및 페이지 공통 로직

/**
 * 메인 애플리케이션 클래스
 */
class FoodRecommendationApp {
  constructor() {
    this.currentUser = null;
    this.nutritionData = null;
    this.recommendations = [];
    this.init();
  }

  init() {
    // 페이지 로드 시 초기화
    this.setupEventListeners();
    this.loadUserData();
    this.initializePage();
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 영양소 입력 폼 처리
    const nutritionForm = document.getElementById('nutritionForm');
    if (nutritionForm) {
      nutritionForm.addEventListener('submit', (e) => this.handleNutritionSubmit(e));
    }

    // 음식 추천 버튼
    const recommendBtn = document.getElementById('recommendBtn');
    if (recommendBtn) {
      recommendBtn.addEventListener('click', () => this.getRecommendations());
    }

    // 찜하기 버튼들
    document.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn')) {
        this.toggleFavorite(e.target.closest('.favorite-btn'));
      }
      // 좋아요 버튼 처리 (찜 버튼이 아닌 경우)
      if (e.target.closest('.like-btn') && !e.target.closest('.favorite-btn')) {
        this.toggleLike(e.target.closest('.like-btn'));
      }
    });

    // 레시피 상세보기
    document.addEventListener('click', (e) => {
      if (e.target.closest('.recipe-detail-btn')) {
        const btn = e.target.closest('.recipe-detail-btn');
        const recipeId = btn.dataset.recipeId || btn.dataset.foodName;
        if (recipeId) {
          this.showRecipeDetail(recipeId);
        }
      }
    });
  }

  // 사용자 데이터 로드
  loadUserData() {
    this.currentUser = API.user.getCurrentUser();
    
    if (this.currentUser) {
      // 로그인된 사용자의 최근 영양소 데이터 로드
      this.nutritionData = API.nutrition.getLatestNutritionData(this.currentUser.id);
    }
  }

  // 페이지 초기화
  async initializePage() {
    // 현재 페이지에 따른 초기화
    const currentPage = this.getCurrentPage();
    
    // 서버 상태 확인 (백그라운드)
    this.checkServerHealth();
    
    switch (currentPage) {
      case 'index':
        this.initializeMainPage();
        break;
      case 'recipe-detail':
        this.initializeRecipeDetailPage();
        break;
      case 'favorites':
        this.initializeFavoritesPage();
        break;
      case 'profile':
        this.initializeProfilePage();
        break;
    }
  }
  
  // 서버 상태 확인
  async checkServerHealth() {
    const statusElement = document.getElementById('serverStatus');
    const statusText = document.getElementById('serverStatusText');
    
    if (!statusElement || !statusText) return;
    
    try {
      statusElement.style.display = 'block';
      statusText.textContent = '서버 연결 확인 중...';
      statusText.style.color = 'var(--muted)';
      
      const isHealthy = await API.health.checkHealth();
      
      if (isHealthy) {
        statusText.textContent = '✓ 서버 연결 정상';
        statusText.style.color = 'var(--success)';
        setTimeout(() => {
          statusElement.style.display = 'none';
        }, 3000);
      } else {
        statusText.textContent = '⚠ 서버 연결 확인 실패';
        statusText.style.color = 'var(--warning)';
      }
    } catch (error) {
      console.error('서버 상태 확인 오류:', error);
      statusText.textContent = '✗ 서버 연결 실패';
      statusText.style.color = 'var(--error)';
    }
  }

  // 현재 페이지 확인
  getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    
    if (filename === 'index' || filename === '') return 'index';
    if (filename === 'recipe-detail') return 'recipe-detail';
    if (filename === 'favorites') return 'favorites';
    if (filename === 'profile') return 'profile';
    
    return 'index';
  }

  // 메인 페이지 초기화
  initializeMainPage() {
    // 최근 영양소 데이터가 있으면 폼에 채우기
    if (this.nutritionData) {
      this.populateNutritionForm(this.nutritionData);
    }

  }

  // 영양소 폼에 데이터 채우기
  populateNutritionForm(data) {
    const form = document.getElementById('nutritionForm');
    if (!form) return;

    Object.keys(data).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && data[key]) {
        input.value = data[key];
      }
    });
  }

  // 영양소 데이터 제출 처리
  async handleNutritionSubmit(e) {
    e.preventDefault();
    
    const formData = getFormData(e.target);
    
    // 숫자 타입으로 변환
    formData.protein = parseFloat(formData.protein);
    formData.carbs = parseFloat(formData.carbs);
    formData.fat = parseFloat(formData.fat);
    
    console.log('영양소 데이터:', formData); // 디버깅용
    
    try {
      // 유효성 검사
      this.validateNutritionData(formData);
      
      // 데이터 저장
      if (this.currentUser) {
        await API.nutrition.saveNutritionData(this.currentUser.id, formData);
      }
      
      this.nutritionData = formData;
      
      Notification.success('영양소 정보가 저장되었습니다!');
      
      // 추천 결과 페이지로 이동
      setTimeout(() => {
        window.location.href = `recommendations.html?protein=${formData.protein}&carbs=${formData.carbs}&fat=${formData.fat}`;
      }, 1000);
      
    } catch (error) {
      console.error('영양소 제출 오류:', error); // 디버깅용
      Notification.error(error.message);
    }
  }

  // 영양소 데이터 유효성 검사
  validateNutritionData(data) {
    const { protein, carbs, fat } = data;
    
    if (!protein || !carbs || !fat) {
      throw new Error('모든 영양소를 입력해주세요.');
    }
    
    if (protein < 0 || carbs < 0 || fat < 0) {
      throw new Error('영양소는 0 이상의 값을 입력해주세요.');
    }
    
    if (protein > 200 || carbs > 500 || fat > 100) {
      throw new Error('영양소 값이 너무 큽니다. 올바른 값을 입력해주세요.');
    }
  }

  // 음식 추천 받기
  async getRecommendations() {
    // 현재 폼에서 영양소 데이터 가져오기
    const nutritionForm = document.getElementById('nutritionForm');
    if (!nutritionForm) {
      Notification.warning('영양소 입력 폼을 찾을 수 없습니다.');
      return;
    }

    const formData = getFormData(nutritionForm);
    
    // 숫자 타입으로 변환
    const nutritionData = {
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat)
    };

    console.log('추천 요청 데이터:', nutritionData);

    // 유효성 검사
    try {
      this.validateNutritionData(nutritionData);
    } catch (error) {
      Notification.error(error.message);
      return;
    }

    // 로딩 표시
    const recommendBtn = document.getElementById('recommendBtn');
    const recommendBtnText = document.getElementById('recommendBtnText');
    if (recommendBtn && recommendBtnText) {
      recommendBtn.disabled = true;
      recommendBtnText.textContent = '추천 중...';
    }

    try {
      // 서버 상태 확인
      const isHealthy = await API.health.checkHealth();
      if (!isHealthy) {
        Notification.warning('서버 연결에 문제가 있을 수 있습니다. 계속 진행합니다...');
      }
    } catch (error) {
      console.warn('서버 상태 확인 실패:', error);
    }

    // 추천 결과 페이지로 이동
    window.location.href = `recommendations.html?protein=${nutritionData.protein}&carbs=${nutritionData.carbs}&fat=${nutritionData.fat}`;
  }


  // 추천 결과 표시
  async displayRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;

    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>추천할 음식이 없습니다</h2>
          <p>다른 영양소 값을 입력해보세요.</p>
        </div>
      `;
      return;
    }

    // 각 음식의 찜 여부 확인
    const favoriteChecks = await Promise.all(
      recommendations.map(async (food) => {
        const foodName = food.menu_name || food.name || food.menuName || '';
        if (this.currentUser && foodName) {
          try {
            const isFavorite = await API.favorites.isFavorite(this.currentUser.id, foodName);
            return { food, isFavorite };
          } catch (error) {
            return { food, isFavorite: false };
          }
        }
        return { food, isFavorite: false };
      })
    );

    const recommendationsHTML = favoriteChecks.map(({ food, isFavorite }, index) => {
      const foodName = food.menu_name || food.name || food.menuName || '메뉴';
      const imageUrl = food.image_url || food.imageUrl || food.image || 'https://via.placeholder.com/400x300/2d3748/ffffff?text=음식+이미지';
      const calories = food.calories || food.calorie || 0;
      const protein = food.protein || food.protein_g || 0;
      const carbs = food.carbs || food.carbohydrate || food.carbohydrate_g || 0;
      const fat = food.fat || food.fat_g || 0;
      
      return `
        <div class="food-card" data-recipe-id="${foodName}">
          <div class="food-image">
            <img src="${imageUrl}" alt="${foodName}" onerror="this.src='https://via.placeholder.com/400x300/2d3748/ffffff?text=음식+이미지'">
          </div>
          
          <div class="food-content">
            <h3 class="food-title">${foodName}</h3>
            
            <div class="food-nutrition">
              ${calories ? `
              <div class="nutrition-item">
                <span class="nutrition-value">${calories}</span>
                <span class="nutrition-label">kcal</span>
              </div>
              ` : ''}
              ${protein ? `
              <div class="nutrition-item">
                <span class="nutrition-value">${protein}g</span>
                <span class="nutrition-label">단백질</span>
              </div>
              ` : ''}
              ${carbs ? `
              <div class="nutrition-item">
                <span class="nutrition-value">${carbs}g</span>
                <span class="nutrition-label">탄수</span>
              </div>
              ` : ''}
              ${fat ? `
              <div class="nutrition-item">
                <span class="nutrition-value">${fat}g</span>
                <span class="nutrition-label">지방</span>
              </div>
              ` : ''}
            </div>
            
            <div class="food-actions">
              <button class="btn btn-primary recipe-detail-btn" data-recipe-id="${foodName}" data-food-name="${foodName}">
                자세히
              </button>
              ${this.currentUser ? `
              <button class="like-btn ${isFavorite ? 'liked' : ''}" data-food-name="${foodName}">
                <span class="heart-icon">${isFavorite ? '❤️' : '🤍'}</span>
                <span class="like-count">0</span>
              </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="food-recommendations-grid">
        ${recommendationsHTML}
      </div>
    `;
  }

  // 찜하기 토글
  async toggleFavorite(button) {
    if (!this.currentUser) {
      Notification.warning('로그인이 필요합니다.');
      return;
    }

    const foodName = button.dataset.recipeId || button.dataset.menuName || button.dataset.foodName;
    if (!foodName) {
      Notification.error('음식 이름을 찾을 수 없습니다.');
      return;
    }

    try {
      const isCurrentlyFavorite = await API.favorites.isFavorite(this.currentUser.id, foodName);

      if (isCurrentlyFavorite) {
        await API.favorites.removeFromFavorites(this.currentUser.id, foodName);
        const heartIcon = button.querySelector('.heart-icon');
        if (heartIcon) {
          heartIcon.textContent = '🤍';
        }
        button.classList.remove('liked');
        Notification.success('찜 목록에서 제거되었습니다.');
      } else {
        await API.favorites.addToFavorites(this.currentUser.id, foodName);
        const heartIcon = button.querySelector('.heart-icon');
        if (heartIcon) {
          heartIcon.textContent = '❤️';
        }
        button.classList.add('liked');
        Notification.success('찜 목록에 추가되었습니다.');
      }
    } catch (error) {
      console.error('찜 토글 오류:', error);
      Notification.error(error.message || '오류가 발생했습니다.');
    }
  }

  // 좋아요 토글
  toggleLike(likeButton) {
    const heartIcon = likeButton.querySelector('.heart-icon');
    const likeCount = likeButton.querySelector('.like-count');
    const currentCount = parseInt(likeCount.textContent);
    
    if (likeButton.classList.contains('liked')) {
      // 좋아요 취소
      likeButton.classList.remove('liked');
      heartIcon.textContent = '🤍';
      likeCount.textContent = currentCount - 1;
    } else {
      // 좋아요 추가
      likeButton.classList.add('liked');
      heartIcon.textContent = '❤️';
      likeCount.textContent = currentCount + 1;
    }
    
    // 좋아요 애니메이션
    likeButton.style.transform = 'scale(1.1)';
    setTimeout(() => {
      likeButton.style.transform = 'scale(1)';
    }, 150);
  }

  // 레시피 상세보기
  async showRecipeDetail(recipeId) {
    // recipeId가 음식 이름인 경우
    const foodName = recipeId;
    window.location.href = `recipe-detail.html?name=${encodeURIComponent(foodName)}`;
  }

  // 레시피 상세 페이지 초기화
  async initializeRecipeDetailPage() {
    const urlParams = getUrlParams();
    const recipeName = urlParams.name || urlParams.id;
    
    if (!recipeName) {
      Notification.error('레시피를 찾을 수 없습니다.');
      window.location.href = 'index.html';
      return;
    }

    try {
      // 백엔드에서 레시피 정보 가져오기
      const recipe = await API.recipe.getRecipeByName(recipeName);
      
      if (!recipe || recipe.message) {
        // FoodDatabase에서 찾기
        const localRecipe = API.food.getFoodById(recipeName);
        if (localRecipe) {
          this.displayRecipeDetail(localRecipe);
        } else {
          Notification.error('레시피를 찾을 수 없습니다.');
          window.location.href = 'index.html';
        }
      } else {
        this.displayRecipeDetail(recipe);
      }
    } catch (error) {
      console.error('레시피 로드 오류:', error);
      // FoodDatabase에서 찾기
      const localRecipe = API.food.getFoodById(recipeName);
      if (localRecipe) {
        this.displayRecipeDetail(localRecipe);
      } else {
        Notification.error('레시피를 불러오는 중 오류가 발생했습니다.');
        window.location.href = 'index.html';
      }
    }
  }

  // 레시피 상세 정보 표시
  async displayRecipeDetail(recipe) {
    const container = document.getElementById('recipeDetailContainer');
    if (!container) return;

    const recipeName = recipe.name || recipe.menu_name || recipe.id || '';
    let isFavorite = false;
    
    if (this.currentUser && recipeName) {
      try {
        isFavorite = await API.favorites.isFavorite(this.currentUser.id, recipeName);
      } catch (error) {
        console.error('찜 여부 확인 오류:', error);
      }
    }

    const calories = recipe.calories || recipe.calorie || 0;
    const protein = recipe.protein || recipe.protein_g || 0;
    const carbs = recipe.carbs || recipe.carbohydrate || recipe.carbohydrate_g || 0;
    const fat = recipe.fat || recipe.fat_g || 0;
    const imageUrl = recipe.image_url || recipe.imageUrl || recipe.image || '';
    
    container.innerHTML = `
      <div class="recipe-detail">
        <div class="recipe-header">
          <h1>${recipeName}</h1>
          ${recipe.category ? `<div class="recipe-category">${this.getCategoryName(recipe.category)}</div>` : ''}
        </div>
        
        ${imageUrl ? `
        <div class="recipe-image" style="text-align: center; margin-bottom: var(--spacing-xl);">
          <img src="${imageUrl}" alt="${recipeName}" style="max-width: 100%; border-radius: 12px; box-shadow: var(--shadow-lg);">
        </div>
        ` : ''}
        
        ${(calories || protein || carbs || fat) ? `
        <div class="recipe-nutrition">
          <h2>영양 정보</h2>
          <div class="nutrition-grid">
            ${calories ? `
            <div class="nutrition-card">
              <div class="nutrition-value">${calories}</div>
              <div class="nutrition-label">칼로리 (kcal)</div>
            </div>
            ` : ''}
            ${protein ? `
            <div class="nutrition-card">
              <div class="nutrition-value">${protein}</div>
              <div class="nutrition-label">단백질 (g)</div>
            </div>
            ` : ''}
            ${carbs ? `
            <div class="nutrition-card">
              <div class="nutrition-value">${carbs}</div>
              <div class="nutrition-label">탄수화물 (g)</div>
            </div>
            ` : ''}
            ${fat ? `
            <div class="nutrition-card">
              <div class="nutrition-value">${fat}</div>
              <div class="nutrition-label">지방 (g)</div>
            </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
        
        ${recipe.ingredients && recipe.ingredients.length > 0 ? `
        <div class="recipe-ingredients">
          <h2>재료</h2>
          <ul class="ingredients-list">
            ${recipe.ingredients.map(ingredient => 
              `<li>${ingredient}</li>`
            ).join('')}
          </ul>
        </div>
        ` : ''}
        
        ${recipe.recipe && recipe.recipe.steps && recipe.recipe.steps.length > 0 ? `
        <div class="recipe-steps">
          <h2>조리 방법</h2>
          <ol class="steps-list">
            ${recipe.recipe.steps.map((step, index) => 
              `<li><span class="step-number">${index + 1}</span>${step}</li>`
            ).join('')}
          </ol>
        </div>
        ` : ''}
        
        ${recipe.recipe && recipe.recipe.tips ? `
        <div class="recipe-tips">
          <h2>요리 팁</h2>
          <div class="tip-content">
            <p>${recipe.recipe.tips}</p>
          </div>
        </div>
        ` : ''}
        
        ${recipe.recipe && (recipe.recipe.cookingTime || recipe.recipe.difficulty) ? `
        <div class="recipe-meta">
          ${recipe.recipe.cookingTime ? `
          <div class="meta-item">
            <span class="meta-label">조리 시간</span>
            <span class="meta-value">${recipe.recipe.cookingTime}</span>
          </div>
          ` : ''}
          ${recipe.recipe.difficulty ? `
          <div class="meta-item">
            <span class="meta-label">난이도</span>
            <span class="meta-value">${recipe.recipe.difficulty}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${recipe.description ? `
        <div class="recipe-description" style="margin-bottom: var(--spacing-xl); padding: var(--spacing-lg); background: rgba(255, 255, 255, 0.05); border-radius: 12px;">
          <p style="color: var(--muted); line-height: 1.6;">${recipe.description}</p>
        </div>
        ` : ''}
        
        <div class="recipe-actions">
          <button class="btn btn-outline" onclick="history.back()">
            뒤로가기
          </button>
          ${this.currentUser ? `
            <button class="btn ${isFavorite ? 'btn-error' : 'btn-primary'} favorite-btn" 
                    data-food-name="${recipeName}">
              ${isFavorite ? '❤️ 찜함' : '🤍 찜하기'}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // 카테고리 이름 변환
  getCategoryName(category) {
    const categoryNames = {
      korean: '한식',
      chinese: '중식',
      japanese: '일식',
      western: '양식',
      thai: '태국음식',
      indian: '인도음식',
      mexican: '멕시코음식',
      italian: '이탈리아음식'
    };
    
    return categoryNames[category] || category;
  }

  // 찜한 레시피 페이지 초기화
  async initializeFavoritesPage() {
    if (!this.currentUser) {
      Notification.warning('로그인이 필요합니다.');
      window.location.href = 'index.html';
      return;
    }

    try {
      const favorites = await API.favorites.getFavorites(this.currentUser.id);
      this.displayFavorites(favorites);
    } catch (error) {
      console.error('찜 목록 로드 오류:', error);
      Notification.error('찜 목록을 불러오는 중 오류가 발생했습니다.');
    }
  }

  // 찜한 레시피 목록 표시
  displayFavorites(favorites) {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;

    if (favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h2>찜한 레시피가 없습니다</h2>
          <p>맛있는 음식을 찾아서 찜해보세요!</p>
          <a href="index.html" class="btn btn-primary">음식 추천 받기</a>
        </div>
      `;
      return;
    }

    const favoritesHTML = favorites.map(recipe => {
      const foodName = recipe.name || recipe.id || '';
      return `
        <div class="favorite-card" data-recipe-id="${foodName}">
          <div class="favorite-header">
            <h3>${foodName}</h3>
            ${recipe.category ? `<div class="favorite-category">${this.getCategoryName(recipe.category)}</div>` : ''}
          </div>
          
          ${(recipe.calories || recipe.protein || recipe.carbs || recipe.fat) ? `
          <div class="favorite-nutrition">
            ${recipe.calories ? `<span class="nutrition-item">${recipe.calories}kcal</span>` : ''}
            ${recipe.protein ? `<span class="nutrition-item">단백질 ${recipe.protein}g</span>` : ''}
            ${recipe.carbs ? `<span class="nutrition-item">탄수화물 ${recipe.carbs}g</span>` : ''}
            ${recipe.fat ? `<span class="nutrition-item">지방 ${recipe.fat}g</span>` : ''}
          </div>
          ` : ''}
          
          <div class="favorite-actions">
            <button class="btn btn-outline recipe-detail-btn" data-recipe-id="${foodName}" data-food-name="${foodName}">
              레시피 보기
            </button>
            <button class="btn btn-error favorite-btn" data-food-name="${foodName}">
              ❤️ 찜함
            </button>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="favorites-grid">
        ${favoritesHTML}
      </div>
    `;
  }

  // 프로필 페이지 초기화
  initializeProfilePage() {
    if (!this.currentUser) {
      Notification.warning('로그인이 필요합니다.');
      window.location.href = 'index.html';
      return;
    }

    this.populateProfileForm();
  }

  // 프로필 폼에 데이터 채우기
  populateProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;

    Object.keys(this.currentUser).forEach(key => {
      const input = form.querySelector(`[name="${key}"]`);
      if (input && this.currentUser[key] && key !== 'password') {
        input.value = this.currentUser[key];
      }
    });
  }
}

// 전역 애플리케이션 인스턴스
const app = new FoodRecommendationApp();

// 전역에서 사용할 수 있도록 window 객체에 추가
window.app = app;
