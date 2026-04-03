const { cloud, db } = require("./runtime");

const addDiary = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, date, title, content, images, mood } = event.data;

    const result = await db.collection("pets_diary").add({
      data: {
        pet_id,
        date,
        owner_openid: wxContext.OPENID,
        title,
        content,
        images: images || [],
        mood,
        created_at: new Date(),
      },
    });

    return {
      success: true,
      data: {
        _id: result._id,
        ...event.data,
      },
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const getDiaries = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { pet_id, page = 1, pageSize = 20 } = event.data;

    const result = await db
      .collection("pets_diary")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
      })
      .orderBy("date", "desc")
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get();

    const countResult = await db
      .collection("pets_diary")
      .where({
        pet_id,
        owner_openid: wxContext.OPENID,
      })
      .count();

    return {
      success: true,
      data: {
        list: result.data,
        total: countResult.total,
        page,
        pageSize,
      },
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const updateDiary = async (event) => {
  try {
    const { _id, ...updateData } = event.data;

    await db.collection("pets_diary").doc(_id).update({
      data: updateData,
    });

    return {
      success: true,
      data: event.data,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

const deleteDiary = async (event) => {
  try {
    const { _id } = event.data;

    await db.collection("pets_diary").doc(_id).remove();

    return {
      success: true,
    };
  } catch (e) {
    return {
      success: false,
      errMsg: e.message,
    };
  }
};

module.exports = {
  addDiary,
  getDiaries,
  updateDiary,
  deleteDiary,
};
