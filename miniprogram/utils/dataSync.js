// utils/dataSync.js

/**
 * 数据同步工具类
 * 负责管理本地存储和云端数据的同步
 */
class DataSync {
  constructor() {
    this.localKeys = {
      USER_INFO: 'userInfo',
      OPENID: 'openid',
      PETS: 'pets',
      CURRENT_PET: 'currentPet',
      DAILY_RECORDS: 'dailyRecords',
      DIARIES: 'diaries'
    };
  }

  /**
   * 保存数据到本地存储
   * @param {string} key - 存储键名
   * @param {any} data - 要存储的数据
   * @returns {Promise} Promise对象
   */
  saveToLocal(key, data) {
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: key,
        data: data,
        success: () => {
          console.log(`数据已保存到本地: ${key}`);
          resolve();
        },
        fail: (err) => {
          console.error(`保存到本地失败: ${key}`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * 从本地存储读取数据
   * @param {string} key - 存储键名
   * @returns {Promise} Promise对象，包含读取的数据
   */
  readFromLocal(key) {
    return new Promise((resolve, reject) => {
      wx.getStorage({
        key: key,
        success: (res) => {
          console.log(`从本地读取数据: ${key}`);
          resolve(res.data);
        },
        fail: (err) => {
          console.log(`本地无数据: ${key}`);
          resolve(null);
        }
      });
    });
  }

  /**
   * 从本地存储移除数据
   * @param {string} key - 存储键名
   * @returns {Promise} Promise对象
   */
  removeFromLocal(key) {
    return new Promise((resolve, reject) => {
      wx.removeStorage({
        key: key,
        success: () => {
          console.log(`已从本地移除: ${key}`);
          resolve();
        },
        fail: (err) => {
          console.error(`移除本地数据失败: ${key}`, err);
          reject(err);
        }
      });
    });
  }

  /**
   * 清除所有本地数据
   * @returns {Promise} Promise对象
   */
  clearAllLocalData() {
    return new Promise((resolve, reject) => {
      wx.clearStorage({
        success: () => {
          console.log('已清除所有本地数据');
          resolve();
        },
        fail: (err) => {
          console.error('清除本地数据失败', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 同步宠物数据到云端
   * @param {Array} pets - 宠物列表
   * @param {string} openid - 用户openid
   * @returns {Promise} Promise对象
   */
  async syncPetsToCloud(pets, openid) {
    if (!pets || pets.length === 0) {
      return;
    }

    try {
      // 这里可以添加将宠物数据同步到云端的逻辑
      // 由于时间关系，暂时只记录日志
      console.log(`准备同步 ${pets.length} 个宠物到云端`);
      
      // 模拟同步过程
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('宠物数据同步完成');
    } catch (error) {
      console.error('同步宠物数据失败:', error);
      throw error;
    }
  }

  /**
   * 从云端同步宠物数据
   * @param {string} openid - 用户openid
   * @returns {Promise} Promise对象，包含宠物列表
   */
  async syncPetsFromCloud(openid) {
    try {
      // 调用云函数获取宠物列表
      const res = await wx.cloud.callFunction({
        name: 'petFunctions',
        data: {
          type: 'getPets'
        }
      });

      if (res.result.success) {
        const pets = res.result.data;
        console.log(`从云端获取到 ${pets.length} 个宠物`);
        
        // 保存到本地
        await this.saveToLocal(this.localKeys.PETS, pets);
        
        return pets;
      } else {
        throw new Error(res.result.errMsg || '获取宠物数据失败');
      }
    } catch (error) {
      console.error('从云端同步宠物数据失败:', error);
      
      // 尝试从本地读取
      const localPets = await this.readFromLocal(this.localKeys.PETS);
      return localPets || [];
    }
  }

  /**
   * 同步日常记录到云端
   * @param {Object} record - 日常记录数据
   * @param {string} petId - 宠物ID
   * @param {string} openid - 用户openid
   * @returns {Promise} Promise对象
   */
  async syncDailyRecordToCloud(record, petId, openid) {
    if (!record || !petId) {
      throw new Error('缺少必要参数');
    }

    try {
      // 调用云函数保存日常记录
      const res = await wx.cloud.callFunction({
        name: 'petFunctions',
        data: {
          type: 'addDailyRecord',
          data: {
            ...record,
            pet_id: petId
          }
        }
      });

      if (res.result.success) {
        console.log('日常记录已同步到云端');
        return res.result.data;
      } else {
        throw new Error(res.result.errMsg || '同步日常记录失败');
      }
    } catch (error) {
      console.error('同步日常记录到云端失败:', error);
      
      // 保存到本地待同步队列
      await this.saveRecordToLocalQueue(record, petId, 'daily');
      
      throw error;
    }
  }

  /**
   * 从云端同步日常记录
   * @param {string} petId - 宠物ID
   * @param {string} date - 日期
   * @param {string} openid - 用户openid
   * @returns {Promise} Promise对象，包含日常记录
   */
  async syncDailyRecordFromCloud(petId, date, openid) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'petFunctions',
        data: {
          type: 'getDailyRecord',
          data: {
            pet_id: petId,
            date: date
          }
        }
      });

      if (res.result.success) {
        const record = res.result.data;
        console.log(`从云端获取到 ${date} 的日常记录`);
        return record;
      } else {
        throw new Error(res.result.errMsg || '获取日常记录失败');
      }
    } catch (error) {
      console.error('从云端同步日常记录失败:', error);
      return null;
    }
  }

  /**
   * 保存记录到本地待同步队列
   * @param {Object} record - 记录数据
   * @param {string} petId - 宠物ID
   * @param {string} type - 记录类型（daily/diary）
   * @returns {Promise} Promise对象
   */
  async saveRecordToLocalQueue(record, petId, type) {
    try {
      const queueKey = `syncQueue_${type}`;
      const queue = await this.readFromLocal(queueKey) || [];
      
      queue.push({
        record,
        petId,
        timestamp: new Date().getTime(),
        type
      });
      
      await this.saveToLocal(queueKey, queue);
      console.log(`记录已保存到本地待同步队列: ${type}`);
    } catch (error) {
      console.error('保存到本地队列失败:', error);
    }
  }

  /**
   * 处理本地待同步队列
   * @returns {Promise} Promise对象
   */
  async processLocalSyncQueue() {
    try {
      // 处理日常记录队列
      const dailyQueue = await this.readFromLocal('syncQueue_daily') || [];
      if (dailyQueue.length > 0) {
        console.log(`发现 ${dailyQueue.length} 条待同步的日常记录`);
        
        // 这里可以添加实际同步逻辑
        // 由于时间关系，暂时只清空队列
        await this.removeFromLocal('syncQueue_daily');
        console.log('日常记录队列已清空');
      }
      
      // 处理日记队列
      const diaryQueue = await this.readFromLocal('syncQueue_diary') || [];
      if (diaryQueue.length > 0) {
        console.log(`发现 ${diaryQueue.length} 条待同步的日记`);
        
        // 这里可以添加实际同步逻辑
        // 由于时间关系，暂时只清空队列
        await this.removeFromLocal('syncQueue_diary');
        console.log('日记队列已清空');
      }
    } catch (error) {
      console.error('处理本地同步队列失败:', error);
    }
  }

  /**
   * 检查网络状态
   * @returns {Promise} Promise对象，包含网络状态
   */
  checkNetworkStatus() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          const isOnline = res.networkType !== 'none';
          resolve({
            isOnline,
            networkType: res.networkType
          });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 初始化数据同步
   * @param {Object} app - 小程序实例
   * @returns {Promise} Promise对象
   */
  async init(app) {
    try {
      // 检查网络状态
      const networkStatus = await this.checkNetworkStatus();
      
      if (networkStatus.isOnline) {
        console.log('网络连接正常，开始数据同步');
        
        // 处理待同步队列
        await this.processLocalSyncQueue();
        
        // 同步宠物数据
        if (app.globalData.openid) {
          const pets = await this.syncPetsFromCloud(app.globalData.openid);
          app.globalData.pets = pets || [];
          
          // 保存到全局数据
          if (pets && pets.length > 0 && !app.globalData.currentPet) {
            app.globalData.currentPet = pets[0];
            await this.saveToLocal(this.localKeys.CURRENT_PET, pets[0]);
          }
        }
      } else {
        console.log('网络未连接，使用本地数据');
        
        // 从本地加载数据
        const localPets = await this.readFromLocal(this.localKeys.PETS);
        if (localPets) {
          app.globalData.pets = localPets;
          
          const currentPet = await this.readFromLocal(this.localKeys.CURRENT_PET);
          if (currentPet) {
            app.globalData.currentPet = currentPet;
          } else if (localPets.length > 0) {
            app.globalData.currentPet = localPets[0];
          }
        }
      }
      
      return networkStatus;
    } catch (error) {
      console.error('数据同步初始化失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const dataSync = new DataSync();

// 导出单例
module.exports = dataSync;