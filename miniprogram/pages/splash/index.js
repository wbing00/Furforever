// splash/index.js
Page({
  data: {
    isLoading: true
  },

  onLoad: function() {
    setTimeout(() => {
      this.setData({ isLoading: false });
    }, 1500);
  },

  enterApp: function() {
    this.checkLoginStatus();
  },

  checkLoginStatus: function() {
    const app = getApp();
    // 如果全局已有登录状态，直接进首页
    if (app.globalData.isLoggedIn) {
      this.navigateToHome();
      return;
    }
    // 检查本地缓存
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const openid = wx.getStorageSync('openid');
      if (userInfo && openid) {
        this.navigateToHome();
        return;
      }
    } catch (e) {}
    // 未登录，跳转到授权页
    wx.navigateTo({ url: '/pages/auth/index' });
  },

  navigateToHome: function() {
    wx.switchTab({ url: '/pages/home/index' });
  },

  onShareAppMessage: function() {
    return {
      title: '宠物日常记录 - 记录每一刻的温暖',
      path: '/pages/splash/index'
    };
  }
});
