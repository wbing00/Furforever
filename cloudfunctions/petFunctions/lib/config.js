const DEFAULT_SUMMARY = "今日记录较少，继续记录可获得更完整健康摘要。";
const DOUBAO_API_URL =
  process.env.DOUBAO_API_URL || "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || "";
const DOUBAO_MODEL = process.env.DOUBAO_MODEL || "";

module.exports = {
  DEFAULT_SUMMARY,
  DOUBAO_API_URL,
  DOUBAO_API_KEY,
  DOUBAO_MODEL,
};
