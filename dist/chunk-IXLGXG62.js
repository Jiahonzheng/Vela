import { DataUnavailableError } from './chunk-UGLBJVMQ.js';

// src/data/timeframe.ts
var NAMED_TF_MS = { D: 864e5, W: 6048e5, M: 2592e6 };
var UNIT_MS = { s: 1e3, m: 6e4, h: 36e5, d: 864e5, w: 6048e5, M: 2592e6 };
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

export { minuteBarTimeframe, timeframeToMs };
