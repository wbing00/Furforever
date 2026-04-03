const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const normalizeText = (value, fallback = "未记录") => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const sanitizeAlerts = (alerts) => {
  if (!Array.isArray(alerts)) return [];
  return alerts
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const mergeUniqueAlerts = (...groups) => Array.from(new Set(groups.flat().filter(Boolean)));

const safeParseJsonFromText = (text) => {
  if (!text) return null;

  const trimmed = String(text).trim();

  try {
    return JSON.parse(trimmed);
  } catch (e) {}

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (e) {}
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch (e) {}
  }

  return null;
};

module.exports = {
  formatDate,
  normalizeText,
  sanitizeAlerts,
  mergeUniqueAlerts,
  safeParseJsonFromText,
};
