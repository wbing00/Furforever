const { getOpenId } = require("./lib/auth");
const {
  createPet,
  getPets,
  updatePet,
  deletePet,
} = require("./lib/pets");
const {
  addDailyRecord,
  getDailyRecord,
  getDailyRecordsByRange,
} = require("./lib/dailyRecords");
const { generateDailyInsights } = require("./lib/insights");
const {
  addDiary,
  getDiaries,
  updateDiary,
  deleteDiary,
} = require("./lib/diary");

exports.main = async (event) => {
  switch (event.type) {
    case "getOpenId":
      return getOpenId();
    case "createPet":
      return createPet(event);
    case "getPets":
      return getPets();
    case "updatePet":
      return updatePet(event);
    case "deletePet":
      return deletePet(event);
    case "addDailyRecord":
      return addDailyRecord(event);
    case "getDailyRecord":
      return getDailyRecord(event);
    case "getDailyRecordsByRange":
      return getDailyRecordsByRange(event);
    case "generateDailyInsights":
      return generateDailyInsights(event);
    case "addDiary":
      return addDiary(event);
    case "getDiaries":
      return getDiaries(event);
    case "updateDiary":
      return updateDiary(event);
    case "deleteDiary":
      return deleteDiary(event);
    default:
      return {
        success: false,
        errMsg: "Unknown operation type",
      };
  }
};
