const app = getApp();

Page({
  data: {
    updatedAt: '2026-03-25',
    navTop: 44,
    navRightPadding: 180
  },

  onLoad: function () {
    this.setData({
      navTop: app.globalData.navTop || 44,
      navRightPadding: app.globalData.navRightPadding || 180
    });
  },

  goBack: function () {
    wx.navigateBack({ delta: 1 });
  }
});
