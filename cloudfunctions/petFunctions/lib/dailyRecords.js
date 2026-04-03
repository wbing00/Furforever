const { cloud, db } = require("./runtime");

const addDailyRecord = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, date, ...recordData } = event.data;

    const existing = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        date,
        owner_openid: wxContext.OPENID,
      })
      .get();

    let result;
    let recordId = "";

    if (existing.data.length > 0) {
      const existingRecord = existing.data[0];
      const mergedData = {
        ...existingRecord,
        ...recordData,
        updated_at: new Date(),
      };

      delete mergedData._id;
      delete mergedData.created_at;
      delete mergedData.owner_openid;

      await db.collection("pets_daily_records").doc(existingRecord._id).update({
        data: mergedData,
      });

      result = { updated: 1 };
      recordId = existingRecord._id;
    } else {
      result = await db.collection("pets_daily_records").add({
        data: {
          pet_id,
          date,
          owner_openid: wxContext.OPENID,
          ...recordData,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      recordId = result._id;
    }

    return {
      success: true,
      data: {
        ...result,
        _id: recordId,
      },
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const getDailyRecord = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, date } = event.data;

    const result = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        date,
        owner_openid: wxContext.OPENID,
      })
      .get();

    return {
      success: true,
      data: result.data.length > 0 ? result.data[0] : null,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const getDailyRecordsByRange = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, startDate, endDate } = event.data;

    const result = await db
      .collection("pets_daily_records")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
        date: db.command.gte(startDate).and(db.command.lte(endDate)),
      })
      .orderBy("date", "asc")
      .get();

    return {
      success: true,
      data: result.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

module.exports = {
  addDailyRecord,
  getDailyRecord,
  getDailyRecordsByRange,
};
