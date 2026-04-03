// app.js
App({
  onLaunch: function () {
    this.globalData = {
      env: "cloud1-2gyidrz43058e835",
      userInfo: null,
      openid: null,
      isLoggedIn: false,
      currentPet: null,
      pets: [],
      currentPetChangeCallbacks: [],
      statusBarHeight: 44,
      screenWidth: 375,
      screenHeight: 667,
      navTop: 44,
      navRightPadding: 180
    };

    // 获取系统信息，存储状态栏高度
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.globalData.statusBarHeight = sysInfo.statusBarHeight || 0;
      this.globalData.screenWidth = sysInfo.screenWidth || 375;
      this.globalData.screenHeight = sysInfo.screenHeight || 667;

      const menuRect = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      if (menuRect && menuRect.top) {
        // 顶部内容从胶囊按钮下方开始，避免重叠
        this.globalData.navTop = Math.ceil(menuRect.bottom + 2);
        const rightSafe = Math.max(150, Math.ceil((sysInfo.screenWidth - menuRect.left + 8) * 2));
        this.globalData.navRightPadding = rightSafe; // rpx
      } else {
        this.globalData.navTop = (sysInfo.statusBarHeight || 20) + 32;
        this.globalData.navRightPadding = 180;
      }
    } catch (e) {
      this.globalData.statusBarHeight = 44;
      this.globalData.navTop = 44;
      this.globalData.navRightPadding = 180;
    }

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }

    // 恢复本地缓存的登录状态（避免重启后重新登录）
    this.checkLocalUserInfo();
  },

  // 恢复本地存储的登录信息
  checkLocalUserInfo: function () {
    const that = this;
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const openid = wx.getStorageSync('openid');
      if (userInfo && openid) {
        that.globalData.userInfo = userInfo;
        that.globalData.openid = openid;
        that.globalData.isLoggedIn = true;
        console.log('本地登录状态已恢复');
      }
      const currentPet = wx.getStorageSync('currentPet');
      const pets = wx.getStorageSync('pets');
      if (pets && pets.length > 0) {
        that.globalData.pets = pets;
        that.globalData.currentPet = currentPet || pets[0];
      }
    } catch (e) {
      console.log('恢复本地数据失败:', e);
    }
  },

  // 微信登录：使用 wx.login 获取 code，由云函数换取 openid
  wxLogin: function (callback) {
    const that = this;
    wx.showLoading({ title: '登录中...' });

    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.hideLoading();
          if (callback) callback(false, '获取登录code失败');
          return;
        }

        // 调用云函数获取 openid
        wx.cloud.callFunction({
          name: 'petFunctions',
          data: { type: 'getOpenId' },
          success: (res) => {
            const openid = res.result.openid;
            if (!openid) {
              wx.hideLoading();
              if (callback) callback(false, '获取openid失败');
              return;
            }

            // 获取用户头像昵称（新版API，不弹窗授权）
            wx.getUserInfo({
              success: (userRes) => {
                that._saveLoginInfo(userRes.userInfo, openid, callback);
              },
              fail: () => {
                // 新版微信不支持直接获取，使用默认信息
                const defaultUserInfo = { nickName: '宠物主人', avatarUrl: '' };
                that._saveLoginInfo(defaultUserInfo, openid, callback);
              }
            });
          },
          fail: (err) => {
            wx.hideLoading();
            console.error('云函数调用失败:', err);
            if (callback) callback(false, '云函数不可用，请检查云开发环境');
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('wx.login 失败:', err);
        if (callback) callback(false, 'wx.login 失败');
      }
    });
  },

  // 保存登录信息到全局和本地
  _saveLoginInfo: function (userInfo, openid, callback) {
    const that = this;
    this.globalData.userInfo = userInfo;
    this.globalData.openid = openid;
    this.globalData.isLoggedIn = true;

    wx.setStorageSync('userInfo', userInfo);
    wx.setStorageSync('openid', openid);

    wx.hideLoading();
    console.log('登录成功, openid:', openid);

    // 登录成功后从云端拉取宠物列表
    that.getUserPets((success, pets) => {
      if (callback) callback(true, '登录成功', { userInfo, openid });
    });
  },

  // 从云端获取用户宠物列表（优先云端，失败降级到本地）
  getUserPets: function (callback) {
    const that = this;

    wx.cloud.callFunction({
      name: 'petFunctions',
      data: { type: 'getPets' },
      success: (res) => {
        if (res.result && res.result.success) {
          const pets = res.result.data || [];
          that.globalData.pets = pets;
          wx.setStorageSync('pets', pets);

          if (!that.globalData.currentPet && pets.length > 0) {
            that.setCurrentPet(pets[0]);
          } else if (that.globalData.currentPet && pets.length > 0) {
            // 用云端最新数据刷新 currentPet
            const fresh = pets.find(p => p._id === that.globalData.currentPet._id);
            if (fresh) that.setCurrentPet(fresh);
          }

          console.log('从云端获取宠物列表，数量:', pets.length);
          if (callback) callback(true, pets);
        } else {
          that._fallbackLocalPets(callback);
        }
      },
      fail: (err) => {
        console.warn('获取宠物列表云函数失败，降级到本地:', err);
        that._fallbackLocalPets(callback);
      }
    });
  },

  // 降级：从本地存储读取宠物列表
  _fallbackLocalPets: function (callback) {
    try {
      const pets = wx.getStorageSync('pets') || [];
      this.globalData.pets = pets;
      if (!this.globalData.currentPet && pets.length > 0) {
        this.setCurrentPet(pets[0]);
      }
      if (callback) callback(true, pets);
    } catch (e) {
      this.globalData.pets = [];
      if (callback) callback(false, []);
    }
  },

  // 设置当前宠物并通知所有已注册回调
  setCurrentPet: function (pet) {
    this.globalData.currentPet = pet;
    wx.setStorageSync('currentPet', pet);
    console.log('设置当前宠物:', pet.name);

    // 通知所有页面
    const callbacks = this.globalData.currentPetChangeCallbacks || [];
    callbacks.forEach(cb => {
      try { cb(pet); } catch (e) { console.error('宠物变更回调出错:', e); }
    });
  },

  // 注册宠物变更回调（支持多页面）
  onCurrentPetChange: function (callback) {
    if (!this.globalData.currentPetChangeCallbacks) {
      this.globalData.currentPetChangeCallbacks = [];
    }
    // 避免重复注册同一个函数
    if (!this.globalData.currentPetChangeCallbacks.includes(callback)) {
      this.globalData.currentPetChangeCallbacks.push(callback);
    }
  },

  // 注销宠物变更回调（页面销毁时调用）
  offCurrentPetChange: function (callback) {
    const cbs = this.globalData.currentPetChangeCallbacks || [];
    const idx = cbs.indexOf(callback);
    if (idx > -1) cbs.splice(idx, 1);
  },

  // 检查登录状态
  checkLogin: function (callback) {
    if (this.globalData.isLoggedIn) {
      if (callback) callback(true);
      return true;
    }
    this.wxLogin((success) => {
      if (callback) callback(success);
    });
    return false;
  },

  // 退出登录
  logout: function () {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    this.globalData.isLoggedIn = false;
    this.globalData.currentPet = null;
    this.globalData.pets = [];
    this.globalData.currentPetChangeCallbacks = [];

    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('openid');
    wx.removeStorageSync('currentPet');
    wx.removeStorageSync('pets');

    console.log('用户已退出登录');
    wx.reLaunch({ url: '/pages/splash/index' });
  }
});
