// src/core/data-unavailable.ts
var NAME = "DataUnavailableError";
var DataUnavailableError = class extends Error {
  constructor(details, message) {
    super(message ?? dataUnavailableMessage(details));
    this.name = NAME;
    this.reason = details.reason;
    if (details.symbol !== void 0) this.symbol = details.symbol;
    if (details.timeframe !== void 0) this.timeframe = details.timeframe;
    if (details.finest !== void 0) this.finest = details.finest;
    if (details.default !== void 0) this.default = details.default;
  }
};
function dataUnavailableMessage(d) {
  const what = d.symbol ?? "The series";
  if (d.reason === "timeframe") {
    const hints = [];
    if (d.finest !== void 0) hints.push(`its finest timeframe is ${d.finest}`);
    if (d.default !== void 0 && d.default !== d.finest) hints.push(`its default timeframe is ${d.default}`);
    return `${what} is not served at ${d.timeframe ?? "this timeframe"}${hints.length > 0 ? `; ${hints.join(", ")}` : ""}`;
  }
  return `${what}${d.timeframe !== void 0 ? ` at ${d.timeframe}` : ""} is not available (${d.reason})`;
}
var optionalString = (v) => v === void 0 || typeof v === "string";
function isDataUnavailableError(e) {
  if (typeof e !== "object" || e === null) return false;
  const o = e;
  return o.name === NAME && typeof o.reason === "string" && typeof o.message === "string" && optionalString(o.symbol) && optionalString(o.timeframe) && optionalString(o.finest) && optionalString(o.default);
}

// src/data/timeframe.ts
var NAMED_TF_MS = { D: 864e5, W: 6048e5, M: 2592e6 };
var UNIT_MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5, M: 2592e6 };
function parseTickTimeframe(timeframe) {
  const tf = timeframe.trim();
  const m = /^(\d*)\s*[tT]$/.exec(tf);
  if (!m) return null;
  const count = m[1] === "" ? 1 : parseInt(m[1], 10);
  return Number.isFinite(count) && count >= 1 ? count : null;
}
function isTickTimeframe(timeframe) {
  return parseTickTimeframe(timeframe) !== null;
}
function isVariableDurationTimeframe(timeframe) {
  return isTickTimeframe(timeframe);
}
function timeframeToMs(timeframe) {
  const tf = timeframe.trim();
  if (NAMED_TF_MS[tf]) return NAMED_TF_MS[tf];
  const m = /^(\d+)\s*([a-zA-Z])?$/.exec(tf);
  if (m) {
    const letter = m[2] ?? "m";
    const mult = UNIT_MS[letter === "M" ? "M" : letter.toLowerCase()];
    if (mult !== void 0) return parseInt(m[1], 10) * mult;
  }
  return 36e5;
}
function minuteBarTimeframe(ticker, timeframe) {
  const match = /^(\d+)\s*S$/i.exec(timeframe.trim());
  if (!match) return timeframe;
  const seconds = Number(match[1]);
  if (seconds > 0 && seconds % 60 === 0) return String(seconds / 60);
  throw new DataUnavailableError({ reason: "timeframe", symbol: ticker, timeframe, finest: "1", default: "1" });
}

export { DataUnavailableError, dataUnavailableMessage, isDataUnavailableError, isTickTimeframe, isVariableDurationTimeframe, minuteBarTimeframe, parseTickTimeframe, timeframeToMs };
