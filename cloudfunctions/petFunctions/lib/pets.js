const { cloud, db } = require("./runtime");

const createPet = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const { name, type, breed, birthday, weight, gender, avatar } = event.data;

    const result = await db.collection("pets").add({
      data: {
        owner_openid: wxContext.OPENID,
        name,
        type,
        breed,
        birthday,
        weight,
        gender,
        avatar,
        created_at: new Date(),
        updated_at: new Date(),
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

const getPets = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const result = await db
      .collection("pets")
      .where({
        owner_openid: wxContext.OPENID,
      })
      .orderBy("created_at", "desc")
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

const updatePet = async (event) => {
  try {
    const { _id, ...updateData } = event.data;
    updateData.updated_at = new Date();

    await db.collection("pets").doc(_id).update({
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

const deletePet = async (event) => {
  try {
    const { _id } = event.data;

    await db.collection("pets").doc(_id).remove();

    const wxContext = cloud.getWXContext();
    await db
      .collection("pets_daily_records")
      .where({
        pet_id: _id,
        owner_openid: wxContext.OPENID,
      })
      .remove();

    await db
      .collection("pets_diary")
      .where({
        pet_id: _id,
        owner_openid: wxContext.OPENID,
      })
      .remove();

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
  createPet,
  getPets,
  updatePet,
  deletePet,
};
