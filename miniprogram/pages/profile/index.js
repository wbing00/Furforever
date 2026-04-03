// profile/index.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    currentPet: null,
    pets: [],
    statusBarHeight: 44,
    navTop: 44,
    navRightPadding: 180,
    showEditProfile: false,
    editNickName: '',
    showDeletePetModal: false,
    deletePetTarget: null,
    deleteCountdown: 0,
    showAddPetModal: false,
    petForm: {
      name: '', type: '', typeIndex: 0, breed: '',
      gender: 'unknown', birthday: '', weight: ''
    },
    petTypes: ['\u732b', '\u72d7', '\u5154', '\u9e1f', '\u9f20', '\u5176\u4ed6'],
    today: ''
  },

  _petChangeCallback: null,

  onLoad: function(options) {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
      navTop: app.globalData.navTop || 44,
      navRightPadding: app.globalData.navRightPadding || 180
    });
    this.checkLoginStatus();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    this.setData({ today: todayStr });
    this._petChangeCallback = this.onCurrentPetChange.bind(this);
    app.onCurrentPetChange(this._petChangeCallback);
    if (options.action === 'addPet') this.showAddPetModal();
  },

  onUnload: function() {
    if (this._petChangeCallback) app.offCurrentPetChange(this._petChangeCallback);
    this.clearDeleteCountdown();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.refreshData();
  },

  // 检查登录状态
  checkLoginStatus: function() {
    if (!app.globalData.isLoggedIn) {
      // 未登录，跳转到授权页面
      wx.navigateTo({
        url: '/pages/auth/index',
      });
      return;
    }
    
    // 已登录，初始化数据
    this.initData();
  },

  // 初始化数据
  initData: function() {
    // 设置用户信息
    this.setData({
      userInfo: app.globalData.userInfo || {},
      currentPet: app.globalData.currentPet,
      pets: app.globalData.pets
    });
  },

  // 刷新数据
  refreshData: function() {
    // 刷新宠物列表
    if (app.globalData.isLoggedIn) {
      app.getUserPets(() => {
        this.setData({
          currentPet: app.globalData.currentPet,
          pets: app.globalData.pets
        });
      });
    }
  },

  // 当前宠物变更回调
  onCurrentPetChange: function(pet) {
    this.setData({
      currentPet: pet
    });
  },

  // 查看/编辑用户信息
  viewUserInfo: function() {
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      showEditProfile: true,
      editNickName: userInfo.nickName || ''
    });
  },

  hideEditProfile: function() {
    this.setData({ showEditProfile: false });
  },

  // 微信官方选择头像
  onChooseAvatar: function(e) {
    const avatarUrl = e.detail.avatarUrl;
    const userInfo = Object.assign({}, app.globalData.userInfo || {}, { avatarUrl });
    app.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    this.setData({ userInfo });
  },

  onNickNameInput: function(e) {
    this.setData({ editNickName: e.detail.value });
  },

  saveProfile: function() {
    const nickName = this.data.editNickName.trim() || '\u5ba0\u7269\u4e3b\u4eba';
    const userInfo = Object.assign({}, app.globalData.userInfo || {}, { nickName });
    app.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
    this.setData({ userInfo, showEditProfile: false });
    wx.showToast({ title: '\u4fdd\u5b58\u6210\u529f', icon: 'success' });
  },

  // 选择宠物
  selectPet: function(e) {
    const idx = e.currentTarget.dataset.index;
    const pet = e.currentTarget.dataset.pet || this.data.pets[idx];
    if (!pet) {
      wx.showToast({ title: '宠物数据异常，请重试', icon: 'none' });
      return;
    }
    app.setCurrentPet(pet);
    this.setData({ currentPet: pet });
    wx.showToast({ title: `已切换到${pet.name}`, icon: 'success' });
  },

  // 长按删除宠物
  onPetLongPress: function(e) {
    const idx = e.currentTarget.dataset.index;
    const pet = e.currentTarget.dataset.pet || this.data.pets[idx];
    if (!pet || !pet._id) return;
    this.clearDeleteCountdown();
    this.setData({
      showDeletePetModal: true,
      deletePetTarget: pet,
      deleteCountdown: 5
    });
    this._deleteTimer = setInterval(() => {
      const next = this.data.deleteCountdown - 1;
      if (next <= 0) {
        this.clearDeleteCountdown();
        this.setData({ deleteCountdown: 0 });
      } else {
        this.setData({ deleteCountdown: next });
      }
    }, 1000);
  },

  hideDeletePetModal: function() {
    this.clearDeleteCountdown();
    this.setData({
      showDeletePetModal: false,
      deletePetTarget: null,
      deleteCountdown: 0
    });
  },

  clearDeleteCountdown: function() {
    if (this._deleteTimer) {
      clearInterval(this._deleteTimer);
      this._deleteTimer = null;
    }
  },

  confirmDeletePet: function() {
    if (this.data.deleteCountdown > 0 || !this.data.deletePetTarget) return;
    const pet = this.data.deletePetTarget;
    wx.showLoading({ title: '删除中...' });
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: { type: 'deletePet', data: { _id: pet._id } },
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({ title: '删除成功', icon: 'success' });
          this.hideDeletePetModal();
          app.getUserPets(() => {
            this.setData({
              currentPet: app.globalData.currentPet,
              pets: app.globalData.pets
            });
          });
        } else {
          wx.showToast({ title: (res.result && res.result.errMsg) || '删除失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  },

  // 添加宠物
  addPet: function() {
    this.showAddPetModal();
  },

  // 显示添加宠物弹窗
  showAddPetModal: function() {
    this.setData({
      showAddPetModal: true,
      petForm: {
        name: '',
        type: '',
        typeIndex: 0,
        breed: '',
        gender: 'unknown',
        birthday: '',
        weight: ''
      }
    });
  },

  // 隐藏添加宠物弹窗
  hideAddPetModal: function() {
    this.setData({
      showAddPetModal: false
    });
  },

  // 阻止事件冒泡
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡
  },

  // 宠物类型变更
  onTypeChange: function(e) {
    const index = e.detail.value;
    this.setData({
      'petForm.type': this.data.petTypes[index],
      'petForm.typeIndex': index
    });
  },

  // 选择性别
  selectGender: function(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'petForm.gender': gender
    });
  },

  // 生日变更
  onBirthdayChange: function(e) {
    this.setData({
      'petForm.birthday': e.detail.value
    });
  },

  // 提交宠物表单
  submitPetForm: function(e) {
    const that = this;
    const formData = e.detail.value;
    
    // 验证表单
    if (!formData.name || formData.name.trim() === '') {
      wx.showToast({
        title: '请输入宠物名称',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.type || formData.type.trim() === '') {
      wx.showToast({
        title: '请选择宠物类型',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载中
    wx.showLoading({
      title: '添加中...',
    });
    
    // 准备数据
    const petData = {
      name: formData.name.trim(),
      type: formData.type,
      breed: formData.breed.trim() || '未知',
      gender: formData.gender,
      birthday: formData.birthday || '',
      weight: formData.weight ? parseFloat(formData.weight) : 0,
      avatar: this.getPetAvatar(formData.type, formData.gender)
    };
    
    // 调用云函数添加宠物
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: {
        type: 'createPet',
        data: petData
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.result.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
          
          // 关闭弹窗
          that.hideAddPetModal();
          
          // 刷新宠物列表
          app.getUserPets(() => {
            that.setData({
              currentPet: app.globalData.currentPet,
              pets: app.globalData.pets
            });
            
            // 如果这是第一个宠物，设置为当前宠物
            if (app.globalData.pets.length === 1) {
              app.setCurrentPet(app.globalData.pets[0]);
            }
          });
        } else {
          wx.showToast({
            title: res.result.errMsg || '添加失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('添加宠物失败:', err);
        
        // 模拟成功（用于演示）
        wx.showToast({
          title: '添加成功（演示）',
          icon: 'success'
        });
        
        // 关闭弹窗
        that.hideAddPetModal();
        
        // 添加模拟数据
        const mockPet = {
          _id: 'mock_' + Date.now(),
          ...petData,
          age: '未知'
        };
        
        const newPets = [...that.data.pets, mockPet];
        that.setData({
          pets: newPets
        });
        
        // 更新全局数据
        app.globalData.pets = newPets;
        if (!app.globalData.currentPet) {
          app.setCurrentPet(mockPet);
        }
      }
    });
  },

  // 根据类型和性别获取宠物头像
  getPetAvatar: function(type, gender) {
    const avatars = {
      '猫': gender === 'male' ? '🐱' : '🐈',
      '狗': gender === 'male' ? '🐶' : '🐕',
      '兔': '🐰',
      '鸟': '🐦',
      '鼠': '🐭',
      '其他': '🐾'
    };
    return avatars[type] || '🐾';
  },

  // 查看数据统计
  viewStatistics: function() {
    wx.showModal({
      title: '数据统计',
      content: '统计功能开发中，即将上线',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 查看提醒设置
  viewReminders: function() {
    wx.showModal({
      title: '提醒设置',
      content: '提醒功能开发中，即将上线',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 数据备份
  backupData: function() {
    wx.showModal({
      title: '数据备份',
      content: '备份功能开发中，即将上线',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 查看使用帮助
  viewHelp: function() {
    wx.showModal({
      title: '使用帮助',
      content: '1. 添加宠物信息\n2. 记录日常状态\n3. 查看历史记录\n4. 管理多个宠物\n\n更多帮助内容开发中...',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 查看隐私政策
  viewPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/privacy/index'
    });
  },

  // 查看关于我们
  viewAbout: function() {
    wx.showModal({
      title: '关于我们',
      content: '宠物日常记录 v1.0\n\n记录每一刻的温暖\n\n© 2026 宠物日常记录团队',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 退出登录
  logout: function() {
    const that = this;
    
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.logout();
        }
      }
    });
  },

  // 反馈建议
  giveFeedback: function() {
    wx.showModal({
      title: '反馈建议',
      content: '感谢您的反馈！\n\n反馈功能开发中，即将上线',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onShareAppMessage: function() {
    return {
      title: '宠物档案 - 管理我的宠物',
      path: '/pages/profile/index'
    };
  }
});
