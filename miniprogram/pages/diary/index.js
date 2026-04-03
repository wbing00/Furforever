// diary/index.js
const app = getApp();

Page({
  data: {
    currentPet: null,
    pets: [],
    statusBarHeight: 44,
    navTop: 44,
    navRightPadding: 180,
    diaries: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    statusBarHeight: 44,
    showPetModal: false,
    // 写日记弹窗
    showDiaryModal: false,
    diaryForm: {
      title: '',
      content: '',
      mood: '开心',
      images: []
    },
    moodOptions: ['开心', '好奇', '愤怒', '焦虑', '胆小', 'Emo', '正常'],
    moodIcons: { '开心': '😊', '好奇': '🤔', '愤怒': '😠', '焦虑': '😰', '胆小': '😨', 'Emo': '😔', '正常': '😐' }
  },

  _petChangeCallback: null,

  onLoad: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight || 44,
      navTop: app.globalData.navTop || 44,
      navRightPadding: app.globalData.navRightPadding || 180
    });
    this._petChangeCallback = this.onCurrentPetChange.bind(this);
    app.onCurrentPetChange(this._petChangeCallback);
  },

  onUnload: function () {
    if (this._petChangeCallback) app.offCurrentPetChange(this._petChangeCallback);
  },

  onShow: function () {
    this.refreshData();
  },

  checkLoginStatus: function () {
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/index' });
      return false;
    }
    return true;
  },

  refreshData: function () {
    if (!this.checkLoginStatus()) return;
      app.getUserPets(() => {
        this.setData({
          currentPet: app.globalData.currentPet,
          pets: app.globalData.pets
        });
      if (!app.globalData.currentPet) {
        if (app.globalData.pets.length === 0) this.showNoPetTip();
        return;
      }
        this.loadDiaries(true);
      });
  },

  loadDiaries: function (reset) {
    const that = this;
    if (!app.globalData.currentPet || !app.globalData.isLoggedIn) return;
    if (this.data.isLoading) return;
    this.setData({ isLoading: true });
    const page = reset ? 1 : this.data.page;
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: {
        type: 'getDiaries',
        data: { pet_id: app.globalData.currentPet._id, page: page, pageSize: this.data.pageSize }
      },
      success: (res) => {
        if (res.result && res.result.success) {
          const list = res.result.data.list || [];
          const total = res.result.data.total || 0;
          const formatted = list.map(d => that.formatDiary(d));
          const diaries = reset ? formatted : [...that.data.diaries, ...formatted];
          that.setData({
            diaries: diaries,
            page: page + 1,
            hasMore: diaries.length < total,
            isLoading: false
          });
        } else {
          that.setData({ isLoading: false });
        }
      },
      fail: () => {
        that.setData({ isLoading: false });
      }
    });
  },

  formatDiary: function (diary) {
    const date = new Date(diary.date);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const moodIcons = { '开心': '😊', '好奇': '🤔', '愤怒': '😠', '焦虑': '😰', '胆小': '😨', 'Emo': '😔', '正常': '😐' };
    return {
      ...diary,
      displayDate: { day: day, month: `${month}月`, week: `周${weekDays[date.getDay()]}` },
      moodIcon: moodIcons[diary.mood] || '😐',
      contentPreview: diary.content && diary.content.length > 100 ? diary.content.substring(0, 100) + '...' : (diary.content || '')
    };
  },

  onCurrentPetChange: function (pet) {
    this.setData({ currentPet: pet, pets: app.globalData.pets });
    this.loadDiaries(true);
  },

  showNoPetTip: function () {
    wx.showModal({
      title: '提示', content: '您还没有添加宠物，是否现在添加？',
      confirmText: '添加宠物', cancelText: '稍后',
      success: (res) => { if (res.confirm) wx.switchTab({ url: '/pages/profile/index' }); }
    });
  },

  switchPet: function () { this.setData({ showPetModal: true }); },
  hidePetModal: function () { this.setData({ showPetModal: false }); },
  stopPropagation: function () {},
  selectPet: function (e) {
    const idx = e.currentTarget.dataset.index;
    const pet = e.currentTarget.dataset.pet || this.data.pets[idx];
    if (!pet) return wx.showToast({ title: '宠物数据异常', icon: 'none' });
    app.setCurrentPet(pet);
    this.setData({ currentPet: pet });
    this.hidePetModal();
  },
  addNewPet: function () { wx.switchTab({ url: '/pages/profile/index' }); this.hidePetModal(); },

  // 创建日记
  createDiary: function () {
    if (!app.globalData.currentPet) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
    this.setData({
      showDiaryModal: true,
      diaryForm: { title: '', content: '', mood: '开心', images: [], date: dateStr }
    });
  },

  hideDiaryModal: function () {
    this.setData({ showDiaryModal: false });
  },

  onDiaryTitleInput: function (e) { this.setData({ 'diaryForm.title': e.detail.value }); },
  onDiaryContentInput: function (e) { this.setData({ 'diaryForm.content': e.detail.value }); },
  selectDiaryMood: function (e) { this.setData({ 'diaryForm.mood': e.currentTarget.dataset.mood }); },

  // 上传图片
  chooseImages: function () {
    const that = this;
    const current = this.data.diaryForm.images || [];
    if (current.length >= 9) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 9 - current.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showLoading({ title: '上传中...' });
        const uploadTasks = res.tempFiles.map(file => {
          return new Promise((resolve, reject) => {
            const ext = file.tempFilePath.split('.').pop() || 'jpg';
            const cloudPath = `diary_images/${app.globalData.openid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            wx.cloud.uploadFile({
              cloudPath: cloudPath,
              filePath: file.tempFilePath,
              success: (uploadRes) => resolve(uploadRes.fileID),
              fail: (err) => reject(err)
            });
          });
        });
        Promise.all(uploadTasks).then(fileIDs => {
          wx.hideLoading();
          that.setData({ 'diaryForm.images': [...current, ...fileIDs] });
          wx.showToast({ title: `已上传${fileIDs.length}张图片`, icon: 'success' });
        }).catch(err => {
          wx.hideLoading();
          console.error('上传图片失败:', err);
          wx.showToast({ title: '部分图片上传失败', icon: 'none' });
        });
      }
    });
  },

  removeImage: function (e) {
    const idx = e.currentTarget.dataset.index;
    const images = [...this.data.diaryForm.images];
    images.splice(idx, 1);
    this.setData({ 'diaryForm.images': images });
  },

  previewDiaryImage: function (e) {
    const idx = e.currentTarget.dataset.index;
    const images = this.data.diaryForm.images;
    wx.previewImage({ current: images[idx], urls: images });
  },

  // 保存日记
  saveDiary: function () {
    const that = this;
    const form = this.data.diaryForm;
    if (!form.content || form.content.trim() === '') {
      wx.showToast({ title: '请输入日记内容', icon: 'none' });
      return;
    }
    const pet = app.globalData.currentPet;
    if (!pet) {
      wx.showToast({ title: '请先选择宠物', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '保存中...' });
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: {
        type: 'addDiary',
        data: {
          pet_id: pet._id,
          date: form.date,
          title: form.title || '无标题',
          content: form.content,
          images: form.images || [],
          mood: form.mood
        }
      },
      success: (res) => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          wx.showToast({ title: '日记保存成功', icon: 'success' });
          that.hideDiaryModal();
          that.loadDiaries(true);
        } else {
          wx.showToast({ title: '保存失败，请重试', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('保存日记失败:', err);
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  },

  deleteDiary: function (e) {
    const that = this;
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除', content: '确定要删除这篇日记吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'petFunctions',
            data: { type: 'deleteDiary', data: { _id: id } },
            success: () => {
              that.setData({ diaries: that.data.diaries.filter(d => d._id !== id) });
              wx.showToast({ title: '删除成功', icon: 'success' });
            },
            fail: () => wx.showToast({ title: '删除失败', icon: 'none' })
          });
        }
      }
    });
  },

  previewImage: function (e) {
    const idx = e.currentTarget.dataset.index;
    const images = e.currentTarget.dataset.images;
    wx.previewImage({ current: images[idx], urls: images });
  },

  loadMore: function () {
    if (this.data.hasMore && !this.data.isLoading) this.loadDiaries(false);
  },

  onShareAppMessage: function () {
    return { title: '宠物日记 - 记录成长点滴', path: '/pages/diary/index' };
  }
});
