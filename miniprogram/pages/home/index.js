// home/index.js
const app = getApp();

Page({
  data: {
    currentPet: null,
    pets: [],
    statusBarHeight: 44,
    navTop: 44,
    navRightPadding: 180,
    currentDate: '',
    currentMonth: '',
    calendarDays: [],
    selectedDate: '',
    calendarYear: 0,
    calendarMonth: 0,
    todayRecord: {
      feeding: false, hydration: false, excretion: false,
      activity: false, sleep: false, mood: false
    },
    recordSummaries: {
      feeding: '未记录', hydration: '未记录', excretion: '未记录',
      activity: '未记录', sleep: '未记录', mood: '未记录'
    },
    aiDailySummary: '今日记录较少，继续记录可获得更完整健康摘要。',
    aiSummarySource: 'rule',
    alertSource: 'rule',
    dailyAlerts: [],
    currentDailyRecord: {},
    showSummaryModal: false,
    showPetModal: false,
    showRecordModal: false,
    recordModalTitle: '',
    recordModalType: '',
    recordModalSummary: '',
    feedingData: { type: '主粮', amount: '', unit: '克' },
    hydrationData: { status: '正常' },
    excretionData: { poopStatus: '正常', peeStatus: '正常' },
    activityData: { duration: '', intensity: '散步' },
    sleepData: { duration: '', quality: '深睡' },
    moodData: { mood: '开心' }
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
    this.refreshAll();
  },

  refreshAll: function () {
    if (!app.globalData.isLoggedIn) {
      wx.navigateTo({ url: '/pages/auth/index' });
      return;
    }
    app.getUserPets(() => {
      this.setData({ currentPet: app.globalData.currentPet, pets: app.globalData.pets });
      if (!app.globalData.currentPet) {
        if (app.globalData.pets.length === 0) this.showNoPetTip();
        return;
      }
      if (!this.data.selectedDate) {
        this.initDate();
      } else {
        this.loadDateRecord(this.data.selectedDate);
        this.generateCalendarDays(this.data.calendarYear || new Date().getFullYear(), this.data.calendarMonth || (new Date().getMonth()+1), this.data.selectedDate);
      }
    });
  },

  initDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const currentDate = `${year}-${month.toString().padStart(2,'0')}-${date.toString().padStart(2,'0')}`;
    this.setData({
      currentDate: `${month}月${date}日 周${weekDays[now.getDay()]}`,
      currentMonth: `${year}年${month}月`,
      selectedDate: currentDate,
      calendarYear: year,
      calendarMonth: month
    });
    this.generateCalendarDays(year, month, currentDate);
    this.loadDateRecord(currentDate);
  },

  // 切换月份
  prevMonth: function () {
    let year = this.data.calendarYear;
    let month = this.data.calendarMonth - 1;
    if (month < 1) { month = 12; year--; }
    this.setData({ calendarYear: year, calendarMonth: month, currentMonth: `${year}年${month}月` });
    this.generateCalendarDays(year, month, this.data.selectedDate);
  },

  nextMonth: function () {
    let year = this.data.calendarYear;
    let month = this.data.calendarMonth + 1;
    if (month > 12) { month = 1; year++; }
    this.setData({ calendarYear: year, calendarMonth: month, currentMonth: `${year}年${month}月` });
    this.generateCalendarDays(year, month, this.data.selectedDate);
  },

  // 生成正方形月历（含前后补位）
  generateCalendarDays: function (year, month, selectedDate) {
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')}`;
    const days = [];
    // 上月补位
    const prevMonthDays = new Date(year, month - 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: '', day: prevMonthDays - i, week: '', isSelected: false, hasRecord: false, isOtherMonth: true, isEmpty: false });
    }
    // 本月
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
      days.push({
        date: dateStr, day: d,
        week: weekDays[new Date(year, month-1, d).getDay()],
        isSelected: dateStr === selectedDate,
        isToday: dateStr === todayStr,
        hasRecord: this.checkLocalHasRecord(dateStr),
        isOtherMonth: false
      });
    }
    // 补满6行42格
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({ date: '', day: d, week: '', isSelected: false, hasRecord: false, isOtherMonth: true });
    }
    this.setData({ calendarDays: days });
  },

  checkLocalHasRecord: function (dateStr) {
    if (!app.globalData.currentPet) return false;
    const key = `daily_record_${dateStr}_${app.globalData.currentPet._id}`;
    try {
      const r = wx.getStorageSync(key);
      if (!r) return false;
      return ['feeding','hydration','excretion','activity','sleep','mood'].some(t => r[t] && Object.keys(r[t]).length > 0);
    } catch (e) { return false; }
  },

  selectDate: function (e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return; // 忽略补位格
    const d = new Date(date);
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const calendarDays = this.data.calendarDays.map(day => ({ ...day, isSelected: day.date === date }));
    this.setData({
      selectedDate: date,
      calendarDays,
      currentDate: `${d.getMonth()+1}月${d.getDate()}日 周${weekDays[d.getDay()]}`
    });
    this.loadDateRecord(date);
  },

  loadDateRecord: function (dateStr) {
    const that = this;
    if (!app.globalData.currentPet || !app.globalData.isLoggedIn) return;
    const petId = app.globalData.currentPet._id;
    const localKey = `daily_record_${dateStr}_${petId}`;
    try { const local = wx.getStorageSync(localKey); if (local) that.applyDailyRecord(local); } catch (e) {}
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: { type: 'getDailyRecord', data: { pet_id: petId, date: dateStr } },
      success: (res) => {
        if (res.result && res.result.success && res.result.data) {
          try { wx.setStorageSync(localKey, res.result.data); } catch (e) {}
          that.applyDailyRecord(res.result.data);
        } else {
          that.applyDailyRecord(null);
        }
      },
      fail: () => {}
    });
  },

  applyDailyRecord: function (record) {
    if (!record) {
      this.setData({
        todayRecord: { feeding:false, hydration:false, excretion:false, activity:false, sleep:false, mood:false },
        recordSummaries: { feeding:'未记录', hydration:'未记录', excretion:'未记录', activity:'未记录', sleep:'未记录', mood:'未记录' },
        aiDailySummary: '今日记录较少，继续记录可获得更完整健康摘要。',
        aiSummarySource: 'rule',
        alertSource: 'rule',
        dailyAlerts: [],
        currentDailyRecord: {}
      });
      return;
    }
    this.setData({
      todayRecord: {
        feeding: !!record.feeding, hydration: !!record.hydration, excretion: !!record.excretion,
        activity: !!record.activity, sleep: !!record.sleep, mood: !!record.mood
      },
      recordSummaries: this.buildSummaries(record),
      aiDailySummary: record.ai_summary || this.buildDailySummaryText(record),
      aiSummarySource: record.ai_summary_source || 'rule',
      alertSource: record.alert_source || 'rule',
      dailyAlerts: record.alerts || this.buildDailyAlerts(record),
      currentDailyRecord: record
    });
  },

  buildSummaries: function (r) {
    const s = { feeding:'未记录', hydration:'未记录', excretion:'未记录', activity:'未记录', sleep:'未记录', mood:'未记录' };
    if (r.feeding) { const f = r.feeding; s.feeding = f.type ? `${f.type}${f.amount ? ' '+f.amount+f.unit : ''}` : '已记录'; }
    if (r.hydration) s.hydration = r.hydration.status || '已记录';
    if (r.excretion) {
      const ex = r.excretion; const parts = [];
      if (ex.poopStatus && ex.poopStatus !== '正常') parts.push(`便便:${ex.poopStatus}`);
      if (ex.peeStatus && ex.peeStatus !== '正常') parts.push(`尿尿:${ex.peeStatus}`);
      s.excretion = parts.length > 0 ? parts.join(' ') : '正常';
    }
    if (r.activity) {
      const ac = r.activity; const parts = [];
      if (ac.duration) parts.push(`${ac.duration}分钟`);
      if (ac.intensity && ac.intensity !== '散步') parts.push(ac.intensity);
      s.activity = parts.length > 0 ? parts.join(' ') : '已记录';
    }
    if (r.sleep) {
      const sl = r.sleep; const parts = [];
      if (sl.duration) parts.push(`${sl.duration}小时`);
      if (sl.quality && sl.quality !== '深睡') parts.push(sl.quality);
      s.sleep = parts.length > 0 ? parts.join(' ') : '已记录';
    }
    if (r.mood) s.mood = r.mood.mood || '已记录';
    return s;
  },

  buildDailySummaryText: function (record) {
    const parts = [];
    if (record.feeding) parts.push(`饮食${record.feeding.type || '已记录'}`);
    if (record.hydration) parts.push(`饮水${record.hydration.status || '已记录'}`);
    if (record.excretion) {
      const ex = record.excretion;
      const exParts = [];
      if (ex.poopStatus && ex.poopStatus !== '正常') exParts.push(`便便${ex.poopStatus}`);
      if (ex.peeStatus && ex.peeStatus !== '正常') exParts.push(`尿尿${ex.peeStatus}`);
      parts.push(exParts.length > 0 ? `排泄${exParts.join('、')}` : '排泄正常');
    }
    if (record.mood) parts.push(`情绪${record.mood.mood || '稳定'}`);
    if (parts.length === 0) return '今日记录较少，继续记录可获得更完整健康摘要。';
    return `今日健康摘要：${parts.join('，')}。`;
  },

  buildDailyAlerts: function (record) {
    const alerts = [];
    if (record.hydration && record.hydration.status === '偏少') alerts.push('今日饮水偏少，建议注意补水。');
    if (record.excretion && record.excretion.poopStatus && record.excretion.poopStatus !== '正常') alerts.push('今日便便状态异常，建议持续观察。');
    return alerts;
  },

  refreshDailyInsightsInBackground: function (petId, date, localKey, mergedRecord) {
    const that = this;
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: { type: 'generateDailyInsights', data: { pet_id: petId, date } },
      success: (insightRes) => {
        if (!(insightRes && insightRes.result && insightRes.result.success && insightRes.result.data)) return;
        const result = insightRes.result.data;
        const refreshed = {
          ...mergedRecord,
          ai_summary: result.summary,
          alerts: result.alerts || [],
          alert_level: result.alertLevel || 'normal',
          ai_summary_source: result.source || 'rule',
          alert_source: result.alertSource || 'rule'
        };
        try { wx.setStorageSync(localKey, refreshed); } catch (e) {}

        const currentPet = app.globalData.currentPet;
        if (currentPet && currentPet._id === petId && that.data.selectedDate === date) {
          that.applyDailyRecord(refreshed);
        }
      }
    });
  },

  openSummaryModal: function () {
    this.setData({ showSummaryModal: true });
  },

  closeSummaryModal: function () {
    this.setData({ showSummaryModal: false });
  },

  onCurrentPetChange: function (pet) {
    this.setData({ currentPet: pet, pets: app.globalData.pets });
    if (this.data.selectedDate) {
      this.loadDateRecord(this.data.selectedDate);
      this.generateCalendarDays(this.data.calendarYear || new Date().getFullYear(), this.data.calendarMonth || (new Date().getMonth()+1), this.data.selectedDate);
    }
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
  showCalendar: function () {},
  selectPet: function (e) {
    const idx = e.currentTarget.dataset.index;
    const pet = e.currentTarget.dataset.pet || this.data.pets[idx];
    if (!pet) return wx.showToast({ title: '宠物数据异常', icon: 'none' });
    app.setCurrentPet(pet);
    this.setData({ currentPet: pet });
    this.hidePetModal();
  },
  addNewPet: function () { wx.switchTab({ url: '/pages/profile/index' }); this.hidePetModal(); },

  recordFeeding: function () { this.openModal('饮食记录', 'feeding'); },
  recordHydration: function () { this.openModal('饮水记录', 'hydration'); },
  recordExcretion: function () { this.openModal('排泄记录', 'excretion'); },
  recordActivity: function () { this.openModal('运动记录', 'activity'); },
  recordSleep: function () { this.openModal('睡眠记录', 'sleep'); },
  recordMood: function () { this.openModal('情绪记录', 'mood'); },
  recordVaccine: function () { wx.showToast({ title: '疫苗记录功能开发中', icon: 'none' }); },
  recordDeworming: function () { wx.showToast({ title: '驱虫记录功能开发中', icon: 'none' }); },
  recordGrooming: function () { wx.showToast({ title: '护理记录功能开发中', icon: 'none' }); },
  recordMedical: function () { wx.showToast({ title: '医疗记录功能开发中', icon: 'none' }); },
  quickRecord: function () { wx.showToast({ title: '请使用各模块卡片记录', icon: 'none' }); },

  openModal: function (title, type) {
    this.setData({
      showRecordModal: true, recordModalTitle: title, recordModalType: type,
      recordModalSummary: this.data.recordSummaries[type] || '未记录'
    });
  },

  hideRecordModal: function () {
    this.setData({ showRecordModal: false, recordModalTitle: '', recordModalType: '' });
  },

  saveRecord: function () {
    const that = this;
    const type = this.data.recordModalType;
    const date = this.data.selectedDate;
    const pet = app.globalData.currentPet;
    if (!pet || !date) { wx.showToast({ title: '请先选择宠物和日期', icon: 'none' }); return; }
    let typeData = {};
    switch (type) {
      case 'feeding':   typeData = this.data.feedingData;   break;
      case 'hydration': typeData = this.data.hydrationData; break;
      case 'excretion': typeData = this.data.excretionData; break;
      case 'activity':  typeData = this.data.activityData;  break;
      case 'sleep':     typeData = this.data.sleepData;     break;
      case 'mood':      typeData = this.data.moodData;      break;
      default: wx.showToast({ title: '该功能正在开发中', icon: 'none' }); return;
    }
    wx.showLoading({ title: '保存中...' });
    const localKey = `daily_record_${date}_${pet._id}`;
    const doSave = (existing) => {
      // 修复：合并所有字段，而不是覆盖
      const merged = {
        ...(existing || {}),
        ...(that.data.currentDailyRecord || {}),
        pet_id: pet._id,
        date: date,
        [type]: typeData  // 添加或更新当前类型的记录
      };
      
      // 确保保留所有已存在的字段
      if (existing) {
        // 保留existing中的所有字段
        Object.keys(existing).forEach(key => {
          if (key !== 'pet_id' && key !== 'date' && key !== '_id' &&
              key !== 'created_at' && key !== 'updated_at' &&
              key !== 'ai_summary' && key !== 'ai_summary_source' &&
              key !== 'ai_summary_updated_at' && key !== 'alert_level' &&
              key !== 'alert_source' && key !== 'alerts' &&
              key !== 'owner_openid') {
            if (!merged[key] && existing[key]) {
              merged[key] = existing[key];
            }
          }
        });
      }
      
      wx.cloud.callFunction({
        name: 'petFunctions',
        data: { type: 'addDailyRecord', data: merged },
        success: () => {
          wx.hideLoading();
          merged.ai_summary = that.buildDailySummaryText(merged);
          merged.alerts = that.buildDailyAlerts(merged);
          merged.alert_level = merged.alerts.length > 0 ? 'warning' : 'normal';
          merged.ai_summary_source = 'rule';
          merged.alert_source = 'rule';
          try { wx.setStorageSync(localKey, merged); } catch (e) {}
              wx.showToast({ title: '保存成功', icon: 'success' });
              that.applyDailyRecord(merged);
              that.hideRecordModal();
              that.generateCalendarDays(that.data.calendarYear || new Date().getFullYear(), that.data.calendarMonth || (new Date().getMonth()+1), date);
              that.refreshDailyInsightsInBackground(pet._id, date, localKey, merged);
        },
        fail: () => {
          wx.hideLoading();
          merged.ai_summary = that.buildDailySummaryText(merged);
          merged.alerts = that.buildDailyAlerts(merged);
          merged.alert_level = merged.alerts.length > 0 ? 'warning' : 'normal';
          merged.ai_summary_source = 'rule';
          merged.alert_source = 'rule';
          try { wx.setStorageSync(localKey, merged); } catch (e) {}
          wx.showToast({ title: '已保存（离线）', icon: 'success' });
          that.applyDailyRecord(merged);
          that.hideRecordModal();
          that.generateCalendarDays(that.data.calendarYear || new Date().getFullYear(), that.data.calendarMonth || (new Date().getMonth()+1), date);
        }
      });
    };
    wx.cloud.callFunction({
      name: 'petFunctions',
      data: { type: 'getDailyRecord', data: { pet_id: pet._id, date: date } },
      success: (res) => {
        const existing = (res.result && res.result.success && res.result.data) ? res.result.data : {};
        doSave(existing);
      },
      fail: () => doSave({})
    });
  },

  selectFeedingType: function (e) { this.setData({ 'feedingData.type': e.currentTarget.dataset.type }); },
  onFeedingAmountInput: function (e) { this.setData({ 'feedingData.amount': e.detail.value }); },
  selectFeedingUnit: function (e) { this.setData({ 'feedingData.unit': e.currentTarget.dataset.unit }); },
  selectHydrationStatus: function (e) { this.setData({ 'hydrationData.status': e.currentTarget.dataset.status }); },
  selectPoopStatus: function (e) { this.setData({ 'excretionData.poopStatus': e.currentTarget.dataset.status }); },
  selectPeeStatus: function (e) { this.setData({ 'excretionData.peeStatus': e.currentTarget.dataset.status }); },
  onActivityDurationInput: function (e) { this.setData({ 'activityData.duration': e.detail.value }); },
  selectActivityIntensity: function (e) { this.setData({ 'activityData.intensity': e.currentTarget.dataset.intensity }); },
  onSleepDurationInput: function (e) { this.setData({ 'sleepData.duration': e.detail.value }); },
  selectSleepQuality: function (e) { this.setData({ 'sleepData.quality': e.currentTarget.dataset.quality }); },
  selectMood: function (e) { this.setData({ 'moodData.mood': e.currentTarget.dataset.mood }); },

  onShareAppMessage: function () {
    return { title: '宠物日常记录 - 记录每一刻的温暖', path: '/pages/home/index' };
  }
});
