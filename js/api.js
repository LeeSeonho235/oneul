// api.js - API 통신 및 데이터 관리

/**
 * API 설정
 */
// api.js - API 통신 및 데이터 관리

/**
 * API 설정
 **/

// api.js (최종 확인)
// api.js

const DEFAULT_API_BASE_URL = 'https://oneul.site'; // 도메인 고정
const PROD_API_BASE_URL = 'https://oneul.site'; // 도메인 고정

function resolveApiBaseUrl() {
  // 환경에 관계없이 도메인 주소를 반환하여 API를 원격 서버로 보냅니다.
  return PROD_API_BASE_URL; // 또는 DEFAULT_API_BASE_URL;
}
// ...
/*function resolveApiBaseUrl() {
  try {
    const origin = window.location.origin;
    if (origin.includes('oneul.site')) {
      // oneul.site 에서 실행 시 프로덕션 주소 사용
      return PROD_API_BASE_URL; 
    }
  } catch (error) {
    // ...
  }
  // 그 외 (로컬 파일 등)에서는 기본 주소 사용
  return DEFAULT_API_BASE_URL;
}*/

const APIConfig = {
  // API 서버 기본 URL (resolveApiBaseUrl 호출)
  baseURL: resolveApiBaseUrl(),
  
  // api.js - API 통신 및 데이터 관리

// ... (baseURL은 그대로 'https://oneul.site'로 유지합니다)

// API 엔드포인트에 '/api' 경로를 명시적으로 추가
endpoints: {
  health: '/api/health',
  recommendMenu: '/api/recommend/menu',
  imageByName: '/api/images/by-name',
  searchNutrition: '/api/search/nutrition',  // 영양소 검색 엔드포인트 수정
  syncNutrition: '/api/sync/nutrition',
  syncRecipes: '/api/sync/recipes',
  syncImages: '/api/sync/images',
  signup: '/api/auth/signup',
  login: '/api/auth/login',
  getCurrentUser: '/api/auth/me',
  addFavorite: '/api/favorites',
  removeFavorite: '/api/favorites',
  getFavorites: '/api/favorites',
  checkFavorite: '/api/favorites/check',
  getRecipe: '/api/recipes'
},
// ...
  // API 엔드포인트
  /*endpoints: {
    health: '/health',
    recommendMenu: '/recommend/menu',
    imageByName: '/images/by-name',
    searchNutrition: '/search/nutrition',  // 영양소 검색 엔드포인트 추가
    syncNutrition: '/sync/nutrition',
    syncRecipes: '/sync/recipes',
    syncImages: '/sync/images',
    signup: '/auth/signup',
    login: '/auth/login',
    getCurrentUser: '/auth/me',
    addFavorite: '/favorites',
    removeFavorite: '/favorites',
    getFavorites: '/favorites',
    checkFavorite: '/favorites/check',
    getRecipe: '/recipes'
  },*/
  
  // 인증 토큰 가져오기
  getAuthToken() {
    return SessionStorage.get('authToken');
  },
  
  // 인증 헤더 가져오기
  getAuthHeaders() {
    const token = this.getAuthToken();
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  },
  
  // API 요청 헬퍼
  async request(endpoint, options = {}) {
    // 전체 URL 구성
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders()
      },
      // CORS 설정
      mode: 'cors',
      credentials: 'omit',
    };
    
    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      // 응답이 JSON이 아닐 수 있으므로 처리
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { detail: errorText };
        }
        throw new Error(errorData.detail || `API 오류: ${response.status} ${response.statusText}`);
      }
      
      // Content-Type 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // JSON이 아닌 경우 텍스트로 반환
        return await response.text();
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      
      // 네트워크 오류인 경우
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
      }
      
      throw error;
    }
  }
};

/**
 * 음식 데이터베이스
 */
const FoodDatabase = {
  // 음식 카테고리별 데이터
  categories: {
    korean: [
      {
        id: 'kimchi-jjigae',
        name: '김치찌개',
        category: 'korean',
        calories: 180,
        protein: 12,
        carbs: 15,
        fat: 8,
        image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop',
        description: '신선한 김치와 돼지고기가 만나 더욱 깊은 맛을 선사하는 대표적인 한국 음식',
        ingredients: ['김치', '돼지고기', '두부', '대파', '마늘'],
        recipe: {
          steps: [
            '김치를 적당한 크기로 자른다',
            '돼지고기를 볶는다',
            '김치를 넣고 볶는다',
            '물을 넣고 끓인다',
            '두부와 대파를 넣고 마무리한다'
          ],
          tips: '김치가 신맛이 강할수록 더 맛있다',
          cookingTime: '30분',
          difficulty: '쉬움'
        }
      },
      {
        id: 'bulgogi',
        name: '불고기',
        category: 'korean',
        calories: 250,
        protein: 20,
        carbs: 8,
        fat: 15,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        description: '달콤한 양념에 재운 소고기가 부드럽고 감칠맛 나는 한국의 대표 구이 요리',
        ingredients: ['소고기', '양파', '당근', '간장', '설탕', '마늘'],
        recipe: {
          steps: [
            '소고기를 얇게 썬다',
            '양념을 만든다',
            '고기를 양념에 재운다',
            '야채를 준비한다',
            '팬에 볶아 완성한다'
          ],
          tips: '고기는 미리 얼려서 썰면 더 얇게 썰 수 있다',
          cookingTime: '45분',
          difficulty: '보통'
        }
      },
      {
        id: 'perilla-leaf-pickle',
        name: '깻잎장아찌',
        category: 'korean',
        calories: 45,
        protein: 3,
        carbs: 8,
        fat: 1,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        description: '비타민C, 비타민A, 철분 등 영양으로 가득한 깻잎을 간장으로 절인 건강한 반찬',
        ingredients: ['깻잎', '간장', '마늘', '생강', '설탕'],
        recipe: {
          steps: [
            '깻잎을 깨끗이 씻어 물기를 제거한다',
            '간장 양념을 만든다',
            '깻잎을 양념에 재운다',
            '냉장고에서 하루 숙성시킨다'
          ],
          tips: '깻잎은 손질할 때 상하지 않게 조심한다',
          cookingTime: '20분',
          difficulty: '쉬움'
        }
      },
      {
        id: 'cucumber-cold-soup',
        name: '오이냉국',
        category: 'korean',
        calories: 25,
        protein: 1,
        carbs: 6,
        fat: 0,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        description: '아삭아삭한 오이와 새콤달콤한 냉국의 조화로 여름철 시원함을 선사하는 전통 국물 요리',
        ingredients: ['오이', '식초', '설탕', '소금', '찬물'],
        recipe: {
          steps: [
            '오이를 적당한 크기로 자른다',
            '냉국 양념을 만든다',
            '오이를 양념에 넣는다',
            '찬물을 부어 완성한다'
          ],
          tips: '오이는 너무 얇게 자르지 않는다',
          cookingTime: '15분',
          difficulty: '쉬움'
        }
      },
      {
        id: 'beef-skewers',
        name: '쇠고기산적',
        category: 'korean',
        calories: 280,
        protein: 25,
        carbs: 12,
        fat: 15,
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
        description: '고기와 버섯이 잘 어우러져 질리지 않는 맛으로 남녀노소 모두 좋아하는 꼬치 요리',
        ingredients: ['쇠고기', '버섯', '양파', '간장', '설탕', '마늘'],
        recipe: {
          steps: [
            '쇠고기와 야채를 적당한 크기로 자른다',
            '양념을 만든다',
            '재료를 꼬치에 꽂는다',
            '양념을 발라 구운다'
          ],
          tips: '꼬치에 꽂을 때는 간격을 일정하게 한다',
          cookingTime: '40분',
          difficulty: '보통'
        }
      },
      {
        id: 'beef-mushroom-stirfry',
        name: '쇠고기양송이볶음',
        category: 'korean',
        calories: 220,
        protein: 22,
        carbs: 10,
        fat: 12,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        description: '쫄깃하고 부드러운 쇠고기와 양송이의 만남이 일품인 영양 가득한 볶음 요리',
        ingredients: ['쇠고기', '양송이', '양파', '간장', '설탕', '마늘'],
        recipe: {
          steps: [
            '쇠고기와 양송이를 준비한다',
            '양념을 만든다',
            '쇠고기를 먼저 볶는다',
            '양송이를 넣고 함께 볶는다'
          ],
          tips: '양송이는 너무 오래 볶지 않는다',
          cookingTime: '25분',
          difficulty: '쉬움'
        }
      },
      {
        id: 'braised-burdock',
        name: '우엉조림',
        category: 'korean',
        calories: 85,
        protein: 2,
        carbs: 18,
        fat: 2,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        description: '아삭한 우엉을 맛깔스러운 양념으로 조려낸 영양만점의 전통 반찬',
        ingredients: ['우엉', '간장', '설탕', '참기름', '깨'],
        recipe: {
          steps: [
            '우엉을 껍질을 벗기고 씻는다',
            '우엉을 적당한 크기로 자른다',
            '양념을 만든다',
            '우엉을 양념에 조린다'
          ],
          tips: '우엉은 식초물에 담가두면 색이 변하지 않는다',
          cookingTime: '35분',
          difficulty: '보통'
        }
      },
      {
        id: 'stirfried-anchovies',
        name: '멸치볶음',
        category: 'korean',
        calories: 120,
        protein: 15,
        carbs: 8,
        fat: 3,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        description: '고소하고 짭짤한 맛으로 밥 한 공기 뚝딱 해치우게 만드는 대표적인 밑반찬',
        ingredients: ['멸치', '간장', '설탕', '마늘', '생강'],
        recipe: {
          steps: [
            '멸치를 깨끗이 씻는다',
            '양념을 만든다',
            '멸치를 볶는다',
            '양념을 넣고 볶아 완성한다'
          ],
          tips: '멸치는 머리와 내장을 제거한다',
          cookingTime: '20분',
          difficulty: '쉬움'
        }
      },
      {
        id: 'braised-mackerel-radish',
        name: '갈치무조림',
        category: 'korean',
        calories: 200,
        protein: 20,
        carbs: 15,
        fat: 8,
        image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
        description: '구이가 지겨울 때 조림으로 즐기는 갈치와 무의 완벽한 조화',
        ingredients: ['갈치', '무', '간장', '설탕', '고춧가루', '마늘'],
        recipe: {
          steps: [
            '갈치를 토막내어 준비한다',
            '무를 적당한 크기로 자른다',
            '양념을 만든다',
            '갈치와 무를 양념에 조린다'
          ],
          tips: '갈치는 미리 소금에 절여두면 비린내가 줄어든다',
          cookingTime: '50분',
          difficulty: '보통'
        }
      },
      {
        id: 'chicken-bulgogi',
        name: '닭불고기',
        category: 'korean',
        calories: 180,
        protein: 18,
        carbs: 12,
        fat: 6,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        description: '닭고기로 만든 불고기로 부드럽고 달콤한 간장 양념이 일품인 건강한 구이 요리',
        ingredients: ['닭고기', '양파', '당근', '간장', '설탕', '마늘'],
        recipe: {
          steps: [
            '닭고기를 적당한 크기로 자른다',
            '양념을 만든다',
            '닭고기를 양념에 재운다',
            '팬에 볶아 완성한다'
          ],
          tips: '닭고기는 너무 오래 볶으면 질겨진다',
          cookingTime: '30분',
          difficulty: '쉬움'
        }
      }
    ],
    chinese: [
      {
        id: 'kung-pao-chicken',
        name: '궁보계정',
        category: 'chinese',
        calories: 320,
        protein: 25,
        carbs: 20,
        fat: 18,
        ingredients: ['닭고기', '땅콩', '건고추', '양파', '마늘', '생강'],
        recipe: {
          steps: [
            '닭고기를 다진다',
            '양념을 만든다',
            '닭고기를 볶는다',
            '야채를 넣고 볶는다',
            '땅콩을 넣고 마무리한다'
          ],
          tips: '땅콩은 마지막에 넣어야 바삭함을 유지한다',
          cookingTime: '25분',
          difficulty: '보통'
        }
      }
    ],
    japanese: [
      {
        id: 'teriyaki-salmon',
        name: '데리야키 연어',
        category: 'japanese',
        calories: 280,
        protein: 22,
        carbs: 12,
        fat: 16,
        ingredients: ['연어', '간장', '미림', '설탕', '생강'],
        recipe: {
          steps: [
            '연어를 준비한다',
            '데리야키 소스를 만든다',
            '연어를 구운다',
            '소스를 발라 완성한다'
          ],
          tips: '연어는 너무 오래 구우면 퍽퍽해진다',
          cookingTime: '20분',
          difficulty: '쉬움'
        }
      }
    ],
    western: [
      {
        id: 'grilled-chicken',
        name: '그릴 치킨',
        category: 'western',
        calories: 220,
        protein: 28,
        carbs: 5,
        fat: 10,
        ingredients: ['닭가슴살', '올리브오일', '레몬', '로즈마리', '마늘'],
        recipe: {
          steps: [
            '닭가슴살을 준비한다',
            '양념을 만든다',
            '닭고기를 재운다',
            '그릴에서 구운다',
            '레몬을 곁들여 완성한다'
          ],
          tips: '닭가슴살은 미리 두드려주면 더 부드럽다',
          cookingTime: '35분',
          difficulty: '쉬움'
        }
      }
    ]
  },

  // 모든 음식 데이터 가져오기
  getAllFoods() {
    const allFoods = [];
    Object.values(this.categories).forEach(foods => {
      allFoods.push(...foods);
    });
    return allFoods;
  },

  // 카테고리별 음식 가져오기
  getFoodsByCategory(category) {
    return this.categories[category] || [];
  },

  // ID로 음식 찾기
  getFoodById(id) {
    const allFoods = this.getAllFoods();
    return allFoods.find(food => food.id === id);
  },

};

/**
 * 사용자 데이터 관리
 */
const UserAPI = {
  // 회원가입
  async signup(userData) {
    try {
      // 성별 변환 (male -> M, female -> F, other -> O)
      const genderMap = {
        'male': 'M',
        'female': 'F',
        'other': 'O'
      };
      
      // 국적 변환 (korean -> DOMESTIC, foreigner -> FOREIGN)
      const nationalityMap = {
        'korean': 'DOMESTIC',
        'foreigner': 'FOREIGN'
      };
      
      // 선호 음식 종류 변환
      const cuisineMap = {
        'korean': 'KOR',
        'chinese': 'CHN',
        'japanese': 'JPN',
        'western': 'WES'
      };
      
      // 알레르기 변환
      const allergyMap = {
        'milk': 'MILK',
        'egg': 'EGG',
        'peanut': 'PEANUT',
        'nuts': 'TREENUT',
        'gluten': 'GLUTEN',
        'seafood': 'SHELLFISH',
        'none': 'NONE'
      };
      
      const signupData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name_ko: userData.name,
        birth_date: userData.birthDate,
        gender: genderMap[userData.gender] || userData.gender,
        nationality: nationalityMap[userData.nationality] || userData.nationality,
        food_preferences: (userData.foodPreferences || []).map(p => cuisineMap[p] || p),
        allergies: (userData.allergies || []).map(a => allergyMap[a] || a)
      };
      
      const response = await APIConfig.request(APIConfig.endpoints.signup, {
        method: 'POST',
        body: JSON.stringify(signupData)
      });
      
      if (response.success && response.token) {
        SessionStorage.set('authToken', response.token);
        SessionStorage.set('currentUser', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  // 로그인
  async login(username, password) {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.login, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.success && response.token) {
        SessionStorage.set('authToken', response.token);
        SessionStorage.set('currentUser', response.user);
      }
      
      return response;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  logout() {
    SessionStorage.remove('authToken');
    SessionStorage.remove('currentUser');
    return { success: true };
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser() {
    return SessionStorage.get('currentUser');
  },
  
  // 서버에서 현재 사용자 정보 가져오기
  async fetchCurrentUser() {
    try {
      const user = await APIConfig.request(APIConfig.endpoints.getCurrentUser);
      SessionStorage.set('currentUser', user);
      return user;
    } catch (error) {
      console.error('사용자 정보 조회 오류:', error);
      // 오류 발생 시 로컬 스토리지에서 가져오기
      return this.getCurrentUser();
    }
  },

  // 사용자 정보 업데이트
  async updateUser(userId, updateData) {
    // TODO: 백엔드 API가 추가되면 구현
    throw new Error('아직 구현되지 않았습니다.');
  },

  // 아이디 중복 확인 (백엔드에서 처리)
  async isUsernameExists(username) {
    try {
      // 회원가입 시도로 중복 확인 (실제로는 별도 엔드포인트가 필요)
      await APIConfig.request(APIConfig.endpoints.signup, {
        method: 'POST',
        body: JSON.stringify({
          username,
          email: 'test@test.com',
          password: 'test',
          name_ko: 'test',
          birth_date: '2000-01-01',
          gender: 'M',
          nationality: 'DOMESTIC'
        })
      });
      return false;
    } catch (error) {
      if (error.message.includes('이미 사용 중인 아이디')) {
        return true;
      }
      return false;
    }
  },

  // 이메일 중복 확인 (백엔드에서 처리)
  async isEmailExists(email) {
    try {
      // 회원가입 시도로 중복 확인 (실제로는 별도 엔드포인트가 필요)
      await APIConfig.request(APIConfig.endpoints.signup, {
        method: 'POST',
        body: JSON.stringify({
          username: 'testuser',
          email,
          password: 'test',
          name_ko: 'test',
          birth_date: '2000-01-01',
          gender: 'M',
          nationality: 'DOMESTIC'
        })
      });
      return false;
    } catch (error) {
      if (error.message.includes('이미 사용 중인 이메일')) {
        return true;
      }
      return false;
    }
  },

  // 비밀번호 재설정
  async resetPassword(email) {
    // TODO: 백엔드 API가 추가되면 구현
    throw new Error('아직 구현되지 않았습니다.');
  }
};

/**
 * 영양소 데이터 관리
 */
const NutritionAPI = {
  // 영양소 데이터 저장
  saveNutritionData(userId, nutritionData) {
    const key = `nutrition_${userId}`;
    const existingData = Storage.get(key, []);
    
    const data = {
      id: generateId('nutrition'),
      userId,
      ...nutritionData,
      createdAt: new Date().toISOString()
    };

    existingData.push(data);
    Storage.set(key, existingData);

    return { success: true, data };
  },

  // 영양소 데이터 조회
  getNutritionData(userId) {
    const key = `nutrition_${userId}`;
    return Storage.get(key, []);
  },

  // 최근 영양소 데이터 조회
  getLatestNutritionData(userId) {
    const data = this.getNutritionData(userId);
    return data.length > 0 ? data[data.length - 1] : null;
  },

  // 영양소 기반 음식 검색 (DB 기반)
  async searchNutrition(carb, protein, fat, tolerance = 5.0) {
    try {
      // 상대 경로 사용: /api/search/nutrition (Nginx가 /api 요청을 백엔드로 포워딩)
      const endpoint = `${APIConfig.endpoints.searchNutrition}?carb=${carb}&protein=${protein}&fat=${fat}&tolerance=${tolerance}`;
      const data = await APIConfig.request(endpoint, {
        method: 'GET'
      });
      
      if (data.message) {
        return { success: false, message: data.message };
      }
      
      return { success: true, results: data };
    } catch (error) {
      console.error('영양소 검색 오류:', error);
      throw new Error('영양소 검색 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 찜한 레시피 관리
 */
const FavoritesAPI = {
  // 찜한 레시피 추가
  async addToFavorites(userId, foodName) {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.addFavorite, {
        method: 'POST',
        body: JSON.stringify({ food_name: foodName })
      });
      return response;
    } catch (error) {
      console.error('찜 추가 오류:', error);
      throw error;
    }
  },

  // 찜한 레시피 제거
  async removeFromFavorites(userId, foodName) {
    try {
      const response = await APIConfig.request(
        `${APIConfig.endpoints.removeFavorite}/${encodeURIComponent(foodName)}`,
        {
          method: 'DELETE'
        }
      );
      return response;
    } catch (error) {
      console.error('찜 제거 오류:', error);
      throw error;
    }
  },

  // 찜한 레시피 목록 조회
  async getFavorites(userId) {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.getFavorites);
      if (response.success && response.favorites) {
        // 음식 이름으로 FoodDatabase에서 정보 가져오기
        return response.favorites.map(fav => {
          const food = FoodDatabase.getAllFoods().find(f => f.name === fav.food_name);
          return food || { id: fav.food_name, name: fav.food_name };
        }).filter(Boolean);
      }
      return [];
    } catch (error) {
      console.error('찜 목록 조회 오류:', error);
      return [];
    }
  },

  // 찜한 레시피 여부 확인
  async isFavorite(userId, foodName) {
    try {
      const response = await APIConfig.request(
        `${APIConfig.endpoints.checkFavorite}/${encodeURIComponent(foodName)}`
      );
      return response.is_favorite || false;
    } catch (error) {
      console.error('찜 여부 확인 오류:', error);
      return false;
    }
  }
};

/**
 * 이미지 검색 API
 */
const ImageAPI = {
  // 음식 이름으로 이미지 URL 검색
  async getImageByName(foodName) {
    try {
      const response = await APIConfig.request(
        `${APIConfig.endpoints.imageByName}?name=${encodeURIComponent(foodName)}`
      );
      
      // 응답 구조: { name: "김치찌개", image_url: "/static/kfood/kimchistew.jpg" }
      if (response && response.image_url) {
        const originalImageUrl = response.image_url; // <- 백엔드가 보낸 원본 이미지 주소

        
        const finalImageUrl = `${APIConfig.baseURL}/img-proxy?url=${encodeURIComponent(originalImageUrl)}`;
        
        // 이 주소가 브라우저에서 사용됩니다.
        return finalImageUrl;
      }
      
      return null;
    } catch (error) {
      console.error('이미지 검색 오류:', error);
      return null;
    }
  },
  
  // 여러 음식 이름에 대한 이미지 URL 일괄 검색
  async getImagesByNames(foodNames) {
    const imagePromises = foodNames.map(name => 
      this.getImageByName(name).then(url => ({ name, url }))
    );
    
    const results = await Promise.all(imagePromises);
    const imageMap = {};
    
    results.forEach(({ name, url }) => {
      imageMap[name] = url;
    });
    
    return imageMap;
  }
};

/**
 * 음식 추천 API
 */
const RecommendationAPI = {
  // 영양소 기반 음식 추천
 // api.js - RecommendationAPI.recommendFoods 함수 내부 (370줄 근처)

 async recommendFoods(nutritionData, userPreferences = {}) {
  try {
      const { protein, carbs, fat } = nutritionData;

      // 요청 데이터는 백엔드가 요구하는 필드명(protein, carbs, fat)으로 JSON Body에 담습니다.
      const requestBody = {
          protein: parseFloat(protein), // float 요구에 맞춰 명시적으로 변환
          carbs: parseFloat(carbs),     // float 요구에 맞춰 명시적으로 변환
          fat: parseFloat(fat),         // float 요구에 맞춰 명시적으로 변환
      };

      // 백엔드 API 호출: POST 메서드로 변경하고 JSON Body를 보냅니다.
      const data = await APIConfig.request(APIConfig.endpoints.recommendMenu, {
          method: 'POST', // <-- GET에서 POST로 변경
          body: JSON.stringify(requestBody) // <-- JSON Body 추가
      });

      console.log('API 원본 응답:', data);
    
      
      // 응답 처리: 배열이 아니면 배열로 변환
      let recommendations = [];
      
      if (Array.isArray(data)) {
        recommendations = data;
      } else if (data && typeof data === 'object') {
        // 단일 객체인 경우
        if (data.menu_name || data.image_url) {
          recommendations = [data];
        } else if (data.recommendations && Array.isArray(data.recommendations)) {
          // 응답이 { recommendations: [...] } 형태인 경우
          recommendations = data.recommendations;
        } else if (data.data && Array.isArray(data.data)) {
          // 응답이 { data: [...] } 형태인 경우
          recommendations = data.data;
        } else {
          recommendations = [data];
        }
      }
      
      console.log('처리된 추천 목록:', recommendations);
      
      // 이미지 URL 가져오기

      const enrichedRecommendations = await this.enrichWithImages(recommendations);

      return {
        success: true, // <-- 성공으로 반환
        recommendations: enrichedRecommendations, // <-- 빈 배열 또는 데이터 포함
        nutritionData
      };
    } catch (error) {
      console.error('추천 API 오류:', error);
      return {
          success: false,
          recommendations: [],
          message: '음식 추천 중 오류가 발생했습니다. (서버 연결 실패 또는 DB 오류)'
      };
    }
  },
  
// ... (나머지 코드)
  
  // 추천 결과에 이미지 URL 추가
  async enrichWithImages(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return recommendations;
    }
    
    // 이미지 URL이 없는 항목들에 대해 이미지 검색
    const enriched = await Promise.all(
      recommendations.map(async (menu) => {
        const menuName = menu.menu_name || menu.name || menu.menuName || '';
        
        // 이미 이미지 URL이 있으면 그대로 사용
        if (menu.image_url || menu.imageUrl || menu.image) {
          return menu;
        }
        
        // 이미지 URL이 없으면 검색
        if (menuName) {
          const imageUrl = await ImageAPI.getImageByName(menuName);
          if (imageUrl) {
            return {
              ...menu,
              image_url: imageUrl,
              imageUrl: imageUrl,
              image: imageUrl
            };
          }
        }
        
        // 이미지를 찾지 못한 경우 기본 이미지 사용
        return {
          ...menu,
          image_url: 'https://via.placeholder.com/400x300/2d3748/ffffff?text=음식+이미지',
          imageUrl: 'https://via.placeholder.com/400x300/2d3748/ffffff?text=음식+이미지',
          image: 'https://via.placeholder.com/400x300/2d3748/ffffff?text=음식+이미지'
        };
      })
    );
    
    return enriched;
  }
};

/**
 * 서버 상태 확인 API
 */
const HealthAPI = {
  // 서버 상태 확인
  async checkHealth() {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.health);
      return response.ok === true;
    } catch (error) {
      console.error('서버 상태 확인 오류:', error);
      return false;
    }
  }
};

/**
 * 레시피 API
 */
const RecipeAPI = {
  // 레시피 이름으로 상세 정보 가져오기
  async getRecipeByName(recipeName) {
    try {
      // 백엔드 API에서 레시피 정보 가져오기
      const recipe = await APIConfig.request(
        `${APIConfig.endpoints.getRecipe}/${encodeURIComponent(recipeName)}`
      );
      
      // 이미지가 없으면 이미지 API로 가져오기
      if (!recipe.image_url) {
        const imageInfo = await ImageAPI.getImageByName(recipeName);
        if (imageInfo) {
          recipe.image_url = imageInfo;
          recipe.imageUrl = imageInfo;
          recipe.image = imageInfo;
        }
      }
      
      return recipe;
    } catch (error) {
      console.error('레시피 정보 가져오기 오류:', error);
      // 오류 발생 시 기본 정보 반환
      try {
        const imageInfo = await ImageAPI.getImageByName(recipeName);
        return {
          name: recipeName,
          image_url: imageInfo,
          imageUrl: imageInfo,
          image: imageInfo
        };
      } catch (imgError) {
        return {
          name: recipeName,
          message: '레시피 정보를 찾을 수 없습니다.'
        };
      }
    }
  },
  
  // 레시피 상세 정보 가져오기
  async getRecipeDetail(recipeName) {
    return await this.getRecipeByName(recipeName);
  }
};

/**
 * 동기화 API
 */
const SyncAPI = {
  // 식품영양 DB 동기화
  async syncNutrition() {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.syncNutrition, {
        method: 'POST'
      });
      
      // 응답 구조: { saved: 100, estimated_total: 1200, pages_fetched: 5 }
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('식품영양 DB 동기화 오류:', error);
      throw new Error('식품영양 DB 동기화 중 오류가 발생했습니다.');
    }
  },
  
  // 레시피 DB 동기화
  async syncRecipes() {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.syncRecipes, {
        method: 'POST'
      });
      
      // 응답 구조: { saved: 200, pages_fetched: 2 }
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('레시피 DB 동기화 오류:', error);
      throw new Error('레시피 DB 동기화 중 오류가 발생했습니다.');
    }
  },
  
  // 이미지 DB 동기화
  async syncImages() {
    try {
      const response = await APIConfig.request(APIConfig.endpoints.syncImages, {
        method: 'POST'
      });
      
      // 응답 구조: { saved: 87 }
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('이미지 DB 동기화 오류:', error);
      throw new Error('이미지 DB 동기화 중 오류가 발생했습니다.');
    }
  }
};

/**
 * 통합 API 객체
 */
const API = {
  config: APIConfig,
  user: UserAPI,
  nutrition: NutritionAPI,
  favorites: FavoritesAPI,
  recommendation: RecommendationAPI,
  image: ImageAPI,
  health: HealthAPI,
  recipe: RecipeAPI,
  sync: SyncAPI,
  food: FoodDatabase
};

// 전역에서 사용할 수 있도록 window 객체에 추가
window.API = API;
