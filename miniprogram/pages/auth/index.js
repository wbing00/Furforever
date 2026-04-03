// auth/index.js
const app = getApp();

Page({
  data: {
    isLoading: false
  },

  onLoad: function () {
    if (app.globalData.isLoggedIn) {
      this.navigateToHome();
    }
  },

  // 点击微信登录按钮
  handleLogin: function () {
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    app.wxLogin((success, message) => {
      this.setData({ isLoading: false });
      if (success) {
        wx.showToast({ title: '登录成功', icon: 'success', duration: 1000 });
        setTimeout(() => this.navigateToHome(), 1000);
      } else {
        wx.showToast({ title: message || '登录失败，请重试', icon: 'none', duration: 2000 });
      }
    });
  },

  // 跳过登录
  skipAuth: function () {
    wx.showModal({
      title: '提示',
      content: '跳过登录后，数据将仅保存在本地，无法同步到云端。确定跳过吗？',
      success: (res) => {
        if (res.confirm) this.navigateToHome();
      }
    });
  },

  navigateToHome: function () {
    wx.switchTab({ url: '/pages/home/index' });
  },

  onShareAppMessage: function () {
    return { title: '宠物日常记录 - 记录每一刻的温暖', path: '/pages/auth/index' };
  }
});
