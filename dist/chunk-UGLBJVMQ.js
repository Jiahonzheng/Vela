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

export { DataUnavailableError, dataUnavailableMessage, isDataUnavailableError };
