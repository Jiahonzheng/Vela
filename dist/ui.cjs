'use strict';

var styles = require('@luxalgo/vela-ui/styles');
var velaUi = require('@luxalgo/vela-ui');
var theme = require('@luxalgo/vela-ui/theme');
var icons = require('@luxalgo/vela-ui/icons');
var zag = require('@luxalgo/vela-ui/zag');
var dispose = require('@luxalgo/vela-ui/dispose');
var surfaceEvents = require('@luxalgo/vela-ui/surface-events');
var headless = require('@luxalgo/vela-ui/headless');
var tooltip = require('@luxalgo/vela-ui/tooltip');
var dropdownMenu = require('@luxalgo/vela-ui/dropdown-menu');
var contextMenu = require('@luxalgo/vela-ui/context-menu');
var button = require('@luxalgo/vela-ui/button');
var badge = require('@luxalgo/vela-ui/badge');
var tabs = require('@luxalgo/vela-ui/tabs');
var toggleGroup = require('@luxalgo/vela-ui/toggle-group');
var checkbox = require('@luxalgo/vela-ui/checkbox');
var input = require('@luxalgo/vela-ui/input');
var dialog = require('@luxalgo/vela-ui/dialog');
var drawer = require('@luxalgo/vela-ui/drawer');
var popover = require('@luxalgo/vela-ui/popover');
var empty = require('@luxalgo/vela-ui/empty');
var select = require('@luxalgo/vela-ui/select');
var numberInput = require('@luxalgo/vela-ui/number-input');
var colorPicker = require('@luxalgo/vela-ui/color-picker');
var field = require('@luxalgo/vela-ui/field');
var textArea = require('@luxalgo/vela-ui/text-area');
var glyphSelect = require('@luxalgo/vela-ui/glyph-select');
var calloutBubble = require('@luxalgo/vela-ui/callout-bubble');
var datePicker = require('@luxalgo/vela-ui/date-picker');

// src/ui/index.ts

// src/core/i18n/message.ts
function msg(id, defaultMessage) {
  return Object.freeze({ id, defaultMessage });
}

// src/core/format/numbers.ts
var BIDI_MARKS = /[‎‏؜]/g;
function stripBidiMarks(text) {
  return text.replace(BIDI_MARKS, "");
}
var numberFormats = /* @__PURE__ */ new Map();
function numberFormat(settings, options) {
  const key = `${settings.locale}|${settings.numberingSystem}|${JSON.stringify(options)}`;
  let nf = numberFormats.get(key);
  if (!nf) {
    try {
      nf = new Intl.NumberFormat(settings.locale, { ...options, numberingSystem: settings.numberingSystem });
    } catch {
      nf = new Intl.NumberFormat("en", options);
    }
    numberFormats.set(key, nf);
  }
  return nf;
}
var symbolCache = /* @__PURE__ */ new Map();
function numberSymbols(settings) {
  const key = `${settings.locale}|${settings.numberingSystem}`;
  let sym = symbolCache.get(key);
  if (sym) return sym;
  const parts = numberFormat(settings, { useGrouping: false, minimumFractionDigits: 1, maximumFractionDigits: 1 }).formatToParts(-1.5);
  const decimal = stripBidiMarks(parts.find((p) => p.type === "decimal")?.value ?? ".") || ".";
  const minus = stripBidiMarks(parts.find((p) => p.type === "minusSign")?.value ?? "-") || "-";
  const plain = numberFormat(settings, { useGrouping: false, maximumFractionDigits: 0 });
  const digits = Array.from({ length: 10 }, (_, d) => stripBidiMarks(plain.format(d)));
  const ascii = decimal === "." && minus === "-" && digits.every((d, i) => d === String(i));
  sym = { ascii, decimal, minus, digits };
  symbolCache.set(key, sym);
  return sym;
}
function localizeAscii(text, settings) {
  const sym = numberSymbols(settings);
  if (sym.ascii) return text;
  let out = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) out += sym.digits[code - 48];
    else if (ch === ".") out += sym.decimal;
    else if (ch === "-") out += sym.minus;
    else out += ch;
  }
  return out;
}
function localizeDigits(text, settings) {
  const sym = numberSymbols(settings);
  if (sym.digits.every((d, i) => d === String(i))) return text;
  return text.replace(/[0-9]/g, (d) => sym.digits[Number(d)]);
}
var clampDecimals = (d) => Number.isFinite(d) ? Math.max(0, Math.min(20, Math.trunc(d))) : 2;
function formatFixed(value, decimals, settings) {
  return localizeAscii(value.toFixed(clampDecimals(decimals)), settings);
}
function formatGrouped(value, decimals, settings) {
  const d = clampDecimals(decimals);
  return stripBidiMarks(numberFormat(settings, { minimumFractionDigits: d, maximumFractionDigits: d }).format(value));
}
function formatMessageNumber(value, settings, style) {
  if (style === "integer") return stripBidiMarks(numberFormat(settings, { maximumFractionDigits: 0 }).format(value));
  if (style === "percent") return stripBidiMarks(numberFormat(settings, { style: "percent" }).format(value));
  return stripBidiMarks(numberFormat(settings, {}).format(value));
}
function formatPercent(value, options, settings) {
  const d = clampDecimals(options?.decimals ?? 2);
  const signed = options?.signed ?? true;
  if (settings.english) {
    const text = signed ? `${value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(d)}%` : `${value.toFixed(d)}%`;
    return localizeAscii(text, settings);
  }
  const nf = numberFormat(settings, { style: "percent", minimumFractionDigits: d, maximumFractionDigits: d, signDisplay: signed ? "always" : "auto" });
  return stripBidiMarks(nf.format(value / 100));
}
function formatPrice(value, options, settings) {
  const mode = options.mode ?? "price";
  if (mode === "percent") return formatPercent(value, { decimals: options.decimals, signed: true }, settings);
  if (mode === "indexed" || !options.grouping) return formatFixed(value, options.decimals, settings);
  return formatGrouped(value, options.decimals, settings);
}
var COMPACT_STEPS = [
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"]
];
function formatCompact(value, options, settings) {
  const d = clampDecimals(options?.decimals ?? 2);
  const trim = options?.trimZeros ?? true;
  if (settings.english) {
    const a = Math.abs(value);
    let div = 1;
    let suffix = "";
    for (const [step, s] of COMPACT_STEPS) {
      if (a >= step) {
        div = step;
        suffix = s;
        break;
      }
    }
    const scaled = value / div;
    const text = trim ? Number(scaled.toFixed(d)).toString() : scaled.toFixed(d);
    return localizeAscii(text, settings) + suffix;
  }
  const nf = numberFormat(settings, { notation: "compact", compactDisplay: "short", maximumFractionDigits: d, minimumFractionDigits: trim ? 0 : d });
  return stripBidiMarks(nf.format(value));
}

// src/core/format/dates.ts
var EN_MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var EN_WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var pad2 = (n) => n < 10 ? `0${n}` : String(n);
var DAY_MS = 864e5;
var zoneParsers = /* @__PURE__ */ new Map();
function zoneOffsetMs(ms, timeZone) {
  if (!timeZone || timeZone === "UTC") return 0;
  let dtf = zoneParsers.get(timeZone);
  if (dtf === void 0) {
    try {
      dtf = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      dtf = null;
    }
    zoneParsers.set(timeZone, dtf);
  }
  if (!dtf) return 0;
  try {
    const parts = dtf.formatToParts(new Date(ms));
    const get = (t2) => Number(parts.find((p) => p.type === t2)?.value);
    const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
    return asUTC - ms;
  } catch {
    return 0;
  }
}
var dateFormats = /* @__PURE__ */ new Map();
function dateFormat(settings, options) {
  const key = `${settings.locale}|${settings.numberingSystem}|${JSON.stringify(options)}`;
  let dtf = dateFormats.get(key);
  if (!dtf) {
    const full = { ...options, timeZone: "UTC", calendar: "gregory", numberingSystem: settings.numberingSystem };
    try {
      dtf = new Intl.DateTimeFormat(settings.locale, full);
    } catch {
      dtf = new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC", calendar: "gregory" });
    }
    dateFormats.set(key, dtf);
  }
  return dtf;
}
function clockOptions(settings, withSeconds = false) {
  const sec = withSeconds ? { second: "2-digit" } : {};
  if (settings.hourCycle === "h23") return { hour: "2-digit", minute: "2-digit", ...sec, hourCycle: "h23" };
  if (settings.hourCycle === "h12") return { hour: "numeric", minute: "2-digit", ...sec, hourCycle: "h12" };
  return { hour: "numeric", minute: "2-digit", ...sec };
}
function englishClock(wall, settings, withSeconds = false) {
  if (settings.hourCycle === "h23") {
    const base = `${pad2(wall.getUTCHours())}:${pad2(wall.getUTCMinutes())}`;
    return localizeAscii(withSeconds ? `${base}:${pad2(wall.getUTCSeconds())}` : base, settings);
  }
  return stripBidiMarks(dateFormat(settings, clockOptions(settings, withSeconds)).format(wall));
}
var TICK_OPTIONS = {
  year: { year: "numeric" },
  month: { month: "short" },
  day: { month: "short", day: "numeric" }
};
var isClockUnit = (unit) => unit === "hour" || unit === "minute" || unit === "second";
function formatTimeTick(ms, options, settings) {
  const wall = new Date(ms + (options.offsetMs ?? 0));
  const unit = options.unit;
  const withSeconds = unit === "second";
  if (settings.english) {
    if (isClockUnit(unit)) return englishClock(wall, settings, withSeconds);
    const month = EN_MONTHS_SHORT[wall.getUTCMonth()];
    if (unit === "year") return localizeAscii(String(wall.getUTCFullYear()), settings);
    if (unit === "month") return month;
    return localizeAscii(`${month} ${wall.getUTCDate()}`, settings);
  }
  const opts = isClockUnit(unit) ? clockOptions(settings, withSeconds) : TICK_OPTIONS[unit];
  return stripBidiMarks(dateFormat(settings, opts).format(wall));
}
function formatTimeStamp(ms, options, settings) {
  const wall = new Date(ms + zoneOffsetMs(ms, options?.timeZone ?? "UTC"));
  const withTime = options?.withTime ?? true;
  const withSeconds = options?.withSeconds === true;
  if (settings.english) {
    const date = localizeAscii(
      `${EN_WEEKDAYS_SHORT[wall.getUTCDay()]} ${wall.getUTCDate()} ${EN_MONTHS_SHORT[wall.getUTCMonth()]} '${pad2(wall.getUTCFullYear() % 100)}`,
      settings
    );
    return withTime ? `${date} ${englishClock(wall, settings, withSeconds)}` : date;
  }
  const opts = { weekday: "short", day: "numeric", month: "short", year: "2-digit", ...withTime ? clockOptions(settings, withSeconds) : {} };
  return stripBidiMarks(dateFormat(settings, opts).format(wall));
}
function countdownText(ms) {
  const total = Math.max(0, Math.ceil(ms / 1e3));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600);
  const pad = (v) => String(v).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
function spanParts(ms) {
  const m = Math.abs(ms);
  const HR = 36e5;
  const MIN = 6e4;
  if (m >= DAY_MS) {
    const d = Math.floor(m / DAY_MS);
    const h = Math.round(m % DAY_MS / HR);
    return h ? [[d, "day"], [h, "hour"]] : [[d, "day"]];
  }
  if (m >= HR) {
    const h = Math.floor(m / HR);
    const mn = Math.round(m % HR / MIN);
    return mn ? [[h, "hour"], [mn, "minute"]] : [[h, "hour"]];
  }
  if (m >= MIN) return [[Math.round(m / MIN), "minute"]];
  return [[Math.round(m / 1e3), "second"]];
}
var EN_UNIT = { day: "d", hour: "h", minute: "m", second: "s" };
function formatDuration(ms, options, settings) {
  if ((options?.style ?? "countdown") === "countdown") return localizeDigits(countdownText(ms), settings);
  const parts = spanParts(ms);
  if (settings.english) return localizeDigits(parts.map(([n, u]) => `${n}${EN_UNIT[u]}`).join(" "), settings);
  return parts.map(([n, unit]) => stripBidiMarks(numberFormat(settings, { style: "unit", unit, unitDisplay: "narrow" }).format(n))).join(" ");
}
var clockFormats = /* @__PURE__ */ new Map();
function formatClock(ms, options, settings) {
  const timeZone = options?.timeZone ?? "UTC";
  const seconds = options?.seconds ?? true;
  const english2 = settings.english && settings.hourCycle === "h23";
  const key = `${english2 ? "en-GB" : settings.locale}|${settings.numberingSystem}|${settings.hourCycle}|${timeZone}|${seconds}`;
  let dtf = clockFormats.get(key);
  if (dtf === void 0) {
    const base = { hour: "2-digit", minute: "2-digit", ...seconds ? { second: "2-digit" } : {}, timeZone };
    try {
      dtf = english2 ? new Intl.DateTimeFormat("en-GB", { ...base, hour12: false }) : new Intl.DateTimeFormat(settings.locale, {
        ...base,
        calendar: "gregory",
        numberingSystem: settings.numberingSystem,
        ...settings.hourCycle === "locale" ? {} : { hourCycle: settings.hourCycle }
      });
    } catch {
      dtf = null;
    }
    clockFormats.set(key, dtf);
  }
  if (!dtf) return "";
  try {
    return stripBidiMarks(dtf.format(new Date(ms)));
  } catch {
    return "";
  }
}

// src/core/format/formatters.ts
function builtinFormatters(settings) {
  return {
    price: (value, options) => formatPrice(value, options, settings),
    percent: (value, options) => formatPercent(value, options, settings),
    compact: (value, options) => formatCompact(value, options, settings),
    timeTick: (ms, options) => formatTimeTick(ms, options, settings),
    timeStamp: (ms, options) => formatTimeStamp(ms, options, settings),
    duration: (ms, options) => formatDuration(ms, options, settings),
    clock: (ms, options) => formatClock(ms, options, settings)
  };
}
var warned = false;
function viaHost(host, value, ctx, fallback) {
  try {
    const out = host(value, ctx);
    if (typeof out === "string") return out;
  } catch (err) {
    if (!warned) {
      warned = true;
      console.warn("[vela] a host formatter threw; the built-in formatting is used instead.", err);
    }
  }
  return fallback();
}
function resolveFormatters(settings, overrides) {
  const base = builtinFormatters(settings);
  if (!overrides) return base;
  const ctx = (surface, defaultSurface, timeZone, fallback) => ({
    locale: settings.locale,
    timeZone: timeZone ?? "UTC",
    surface: surface ?? defaultSurface,
    fallback
  });
  const o = overrides;
  return {
    price(value, options) {
      const fallback = () => base.price(value, options);
      if (typeof o.price !== "function") return fallback();
      return viaHost(o.price, value, { ...ctx(options.surface, "priceAxis", void 0, fallback), decimals: options.decimals, mintick: options.mintick, mode: options.mode ?? "price", paneId: options.paneId, grouping: options.grouping ?? false }, fallback);
    },
    percent(value, options) {
      const fallback = () => base.percent(value, options);
      if (typeof o.percent !== "function") return fallback();
      return viaHost(o.percent, value, { ...ctx(options?.surface, "statusLine", void 0, fallback), decimals: options?.decimals ?? 2, signed: options?.signed ?? true }, fallback);
    },
    compact(value, options) {
      const fallback = () => base.compact(value, options);
      if (typeof o.compact !== "function") return fallback();
      return viaHost(o.compact, value, { ...ctx(options?.surface, "priceAxis", void 0, fallback), decimals: options?.decimals ?? 2, trimZeros: options?.trimZeros ?? true }, fallback);
    },
    timeTick(ms, options) {
      const fallback = () => base.timeTick(ms, options);
      if (typeof o.timeTick !== "function") return fallback();
      return viaHost(o.timeTick, ms, { ...ctx(options.surface, "timeAxis", options.timeZone, fallback), unit: options.unit, major: options.major, offsetMs: options.offsetMs ?? 0 }, fallback);
    },
    timeStamp(ms, options) {
      const fallback = () => base.timeStamp(ms, options);
      if (typeof o.timeStamp !== "function") return fallback();
      return viaHost(o.timeStamp, ms, { ...ctx(options?.surface, "crosshair", options?.timeZone, fallback), withTime: options?.withTime ?? true, ...options?.withSeconds !== void 0 ? { withSeconds: options.withSeconds } : {} }, fallback);
    },
    duration(ms, options) {
      const fallback = () => base.duration(ms, options);
      if (typeof o.duration !== "function") return fallback();
      return viaHost(o.duration, ms, { ...ctx(options?.surface, "lastPrice", void 0, fallback), style: options?.style ?? "countdown" }, fallback);
    },
    clock(ms, options) {
      const fallback = () => base.clock(ms, options);
      if (typeof o.clock !== "function") return fallback();
      return viaHost(o.clock, ms, { ...ctx(options?.surface, "clock", options?.timeZone, fallback), seconds: options?.seconds ?? true }, fallback);
    }
  };
}

// src/core/i18n/icu.ts
var Parser = class {
  constructor(src) {
    this.src = src;
    this.i = 0;
  }
  parse() {
    const nodes = this.message(false, 0);
    if (this.i < this.src.length) throw this.error("unmatched }");
    return nodes;
  }
  error(what) {
    return new SyntaxError(`[vela] message syntax: ${what} at ${this.i} in "${this.src}"`);
  }
  /** Text and arguments up to an unmatched `}` (left unread) or the end. */
  message(inPlural, depth) {
    if (depth > 8) throw this.error("nesting too deep");
    const src = this.src;
    const out = [];
    let text = "";
    const flush = () => {
      if (text) out.push(text);
      text = "";
    };
    while (this.i < src.length) {
      const ch = src[this.i];
      if (ch === "'") {
        const next = src[this.i + 1];
        if (next === "'") {
          text += "'";
          this.i += 2;
        } else if (next === "{" || next === "}" || inPlural && next === "#") {
          this.i += 1;
          while (this.i < src.length) {
            const c = src[this.i];
            if (c === "'") {
              if (src[this.i + 1] === "'") {
                text += "'";
                this.i += 2;
                continue;
              }
              this.i += 1;
              break;
            }
            text += c;
            this.i += 1;
          }
        } else {
          text += "'";
          this.i += 1;
        }
      } else if (ch === "{") {
        flush();
        this.i += 1;
        out.push(this.argument(depth));
      } else if (ch === "}") {
        break;
      } else if (ch === "#" && inPlural) {
        flush();
        out.push({ kind: "pound" });
        this.i += 1;
      } else {
        text += ch;
        this.i += 1;
      }
    }
    flush();
    return out;
  }
  skipSpace() {
    while (this.i < this.src.length && /\s/.test(this.src[this.i])) this.i += 1;
  }
  word() {
    this.skipSpace();
    const start = this.i;
    while (this.i < this.src.length && !/[\s,{}]/.test(this.src[this.i])) this.i += 1;
    return this.src.slice(start, this.i);
  }
  expect(ch) {
    this.skipSpace();
    if (this.src[this.i] !== ch) throw this.error(`expected "${ch}"`);
    this.i += 1;
  }
  /** After a `{`: the argument through its closing `}`. */
  argument(depth) {
    const name = this.word();
    if (!name) throw this.error("empty argument name");
    this.skipSpace();
    if (this.src[this.i] === "}") {
      this.i += 1;
      return { kind: "arg", name };
    }
    this.expect(",");
    const type = this.word();
    this.skipSpace();
    if (type === "number") {
      let style;
      if (this.src[this.i] === ",") {
        this.i += 1;
        style = this.word() || void 0;
      }
      this.expect("}");
      return { kind: "arg", name, format: "number", style };
    }
    if (type === "plural" || type === "selectordinal" || type === "select") {
      this.expect(",");
      let offset = 0;
      this.skipSpace();
      if (type !== "select" && this.src.startsWith("offset:", this.i)) {
        this.i += "offset:".length;
        offset = Number(this.word());
        if (!Number.isFinite(offset)) throw this.error("bad offset");
      }
      const options = {};
      for (; ; ) {
        this.skipSpace();
        if (this.src[this.i] === "}") {
          this.i += 1;
          break;
        }
        const key = this.word();
        if (!key) throw this.error("expected a selector");
        this.expect("{");
        options[key] = this.message(type !== "select", depth + 1);
        this.expect("}");
      }
      if (!options.other) throw this.error(`"${name}" has no "other" option`);
      return type === "select" ? { kind: "select", name, options } : { kind: "plural", name, ordinal: type === "selectordinal", offset, options };
    }
    throw this.error(`unknown argument type "${type}"`);
  }
};
var parsed = /* @__PURE__ */ new Map();
var PARSE_CACHE_CAP = 2e3;
function parseMessage(source) {
  let nodes = parsed.get(source);
  if (!nodes) {
    nodes = new Parser(source).parse();
    if (parsed.size >= PARSE_CACHE_CAP) parsed.clear();
    parsed.set(source, nodes);
  }
  return nodes;
}
var pluralRules = /* @__PURE__ */ new Map();
function rulesFor(locale, ordinal) {
  const key = `${locale}|${ordinal ? "o" : "c"}`;
  let pr = pluralRules.get(key);
  if (!pr) {
    try {
      pr = new Intl.PluralRules(locale, { type: ordinal ? "ordinal" : "cardinal" });
    } catch {
      pr = new Intl.PluralRules("en", { type: ordinal ? "ordinal" : "cardinal" });
    }
    pluralRules.set(key, pr);
  }
  return pr;
}
function render(nodes, values, rt, pound) {
  let out = "";
  for (const node of nodes) {
    if (typeof node === "string") {
      out += node;
      continue;
    }
    if (node.kind === "pound") {
      out += pound == null ? "#" : rt.formatNumber(pound);
      continue;
    }
    const raw = values?.[node.name];
    if (node.kind === "arg") {
      if (raw === void 0) out += `{${node.name}}`;
      else if (typeof raw === "number") out += rt.formatNumber(raw, node.format === "number" ? node.style : void 0);
      else if (node.format === "number" && raw.trim() !== "" && Number.isFinite(Number(raw))) out += rt.formatNumber(Number(raw), node.style);
      else out += raw;
      continue;
    }
    if (node.kind === "select") {
      const branch2 = node.options[String(raw)] ?? node.options.other;
      out += render(branch2, values, rt, pound);
      continue;
    }
    const n = typeof raw === "number" ? raw : Number(raw);
    let branch;
    if (Number.isFinite(n)) {
      branch = node.options[`=${n}`] ?? node.options[rulesFor(rt.locale, node.ordinal).select(n - node.offset)];
    }
    out += render(branch ?? node.options.other, values, rt, Number.isFinite(n) ? n - node.offset : null);
  }
  return out;
}
function formatMessage(source, values, rt) {
  if (source.indexOf("{") < 0 && source.indexOf("'") < 0) return source;
  return render(parseMessage(source), values, rt, null);
}

// src/core/format/calendar.ts
var SUNDAY_REGIONS = /* @__PURE__ */ new Set([
  "AG",
  "AS",
  "BD",
  "BR",
  "BS",
  "BT",
  "BW",
  "BZ",
  "CA",
  "CN",
  "CO",
  "DM",
  "DO",
  "ET",
  "GT",
  "GU",
  "HK",
  "HN",
  "ID",
  "IL",
  "IN",
  "JM",
  "JP",
  "KE",
  "KH",
  "KR",
  "LA",
  "MH",
  "MM",
  "MO",
  "MT",
  "MX",
  "MZ",
  "NI",
  "NP",
  "PA",
  "PE",
  "PH",
  "PK",
  "PR",
  "PT",
  "PY",
  "SA",
  "SG",
  "SV",
  "TH",
  "TT",
  "TW",
  "UM",
  "US",
  "VE",
  "VI",
  "WS",
  "YE",
  "ZA",
  "ZW"
]);
var SATURDAY_REGIONS = /* @__PURE__ */ new Set(["AE", "AF", "BH", "DJ", "DZ", "EG", "IQ", "IR", "JO", "KW", "LY", "OM", "QA", "SD", "SY"]);
function localeWeekStart(locale) {
  let loc;
  try {
    loc = new Intl.Locale(locale);
  } catch {
    return 1;
  }
  try {
    const wl = loc;
    const info = typeof wl.getWeekInfo === "function" ? wl.getWeekInfo() : wl.weekInfo;
    const firstDay = info?.firstDay;
    if (typeof firstDay === "number") return firstDay === 7 ? 0 : firstDay === 6 ? 6 : 1;
  } catch {
  }
  let region = loc.region;
  if (!region) {
    try {
      region = loc.maximize().region;
    } catch {
      region = void 0;
    }
  }
  if (region && SUNDAY_REGIONS.has(region)) return 0;
  if (region && SATURDAY_REGIONS.has(region)) return 6;
  return 1;
}

// src/core/i18n/locale.ts
function canonicalLocale(tag) {
  const raw = typeof tag === "string" ? tag.trim() : "";
  if (!raw) return "en";
  try {
    return Intl.getCanonicalLocales(raw)[0] ?? raw;
  } catch {
    return raw;
  }
}
function parseLocale(tag) {
  try {
    return new Intl.Locale(tag);
  } catch {
    return null;
  }
}
function languageOf(tag) {
  return (parseLocale(tag)?.language ?? tag.split(/[-_]/)[0] ?? tag).toLowerCase();
}
function fallbackChain(tag) {
  const out = [];
  const add = (t2) => {
    if (t2 && !out.includes(t2)) out.push(t2);
  };
  add(tag);
  const loc = parseLocale(tag);
  if (loc) {
    const base = loc.baseName;
    add(base);
    const parts = base.split("-");
    let impliedScript;
    if (!loc.script) {
      try {
        impliedScript = loc.maximize().script;
      } catch {
        impliedScript = void 0;
      }
    }
    for (let i = parts.length - 1; i >= 1; i -= 1) {
      if (i === 1 && impliedScript && loc.region) add(`${loc.language}-${impliedScript}`);
      add(parts.slice(0, i).join("-"));
    }
    if (impliedScript && !loc.region) add(`${loc.language}-${impliedScript}`);
    try {
      const usual = new Intl.Locale(loc.language).maximize();
      if (usual.region && usual.script === (loc.script ?? impliedScript)) add(`${loc.language}-${usual.region}`);
    } catch {
    }
  }
  add("en");
  return out;
}
var RTL_SCRIPTS = /* @__PURE__ */ new Set(["Arab", "Hebr", "Thaa", "Syrc", "Nkoo", "Adlm", "Rohg", "Mand", "Samr", "Yezi"]);
var RTL_LANGUAGES = /* @__PURE__ */ new Set(["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ckb", "ks"]);
function localeDirection(tag) {
  const loc = parseLocale(tag);
  if (loc) {
    try {
      const tl = loc;
      const info = typeof tl.getTextInfo === "function" ? tl.getTextInfo() : tl.textInfo;
      if (info?.direction === "rtl" || info?.direction === "ltr") return info.direction;
    } catch {
    }
    try {
      const script = loc.script ?? loc.maximize().script;
      if (script) return RTL_SCRIPTS.has(script) ? "rtl" : "ltr";
    } catch {
    }
  }
  return RTL_LANGUAGES.has(languageOf(tag)) ? "rtl" : "ltr";
}
var numberingCache = /* @__PURE__ */ new Map();
function resolveNumberingSystem(tag, requested) {
  const key = `${tag}|${requested ?? ""}`;
  const cached = numberingCache.get(key);
  if (cached) return cached;
  let nu = "latn";
  try {
    if (requested === "locale") nu = new Intl.NumberFormat(tag).resolvedOptions().numberingSystem;
    else if (requested) nu = new Intl.NumberFormat(tag, { numberingSystem: requested }).resolvedOptions().numberingSystem;
    else {
      const ext = parseLocale(tag)?.numberingSystem;
      if (ext) nu = new Intl.NumberFormat(tag).resolvedOptions().numberingSystem;
    }
  } catch {
    nu = "latn";
  }
  numberingCache.set(key, nu);
  return nu;
}

// src/core/i18n/registry.ts
var entries = [];
var version = 0;
var merged = /* @__PURE__ */ new Map();
function messagesFor(chain) {
  const key = chain.join("|");
  const hit = merged.get(key);
  if (hit && hit.version === version) return hit.map;
  const map = /* @__PURE__ */ new Map();
  for (let c = chain.length - 1; c >= 0; c -= 1) {
    const tag = chain[c];
    for (const e of entries) {
      if (e.tag !== tag) continue;
      for (const [id, text] of Object.entries(e.messages)) {
        if (typeof text === "string") map.set(id, text);
      }
    }
  }
  merged.set(key, { version, map });
  return map;
}

// src/core/i18n/translator.ts
function isMessageDescriptor(m) {
  return typeof m === "object" && m !== null && typeof m.id === "string" && typeof m.defaultMessage === "string";
}
var warnedSyntax = false;
function resolveArgs(args, resolve) {
  if (!args) return void 0;
  let out = null;
  for (const key of Object.keys(args)) {
    const v = args[key];
    if (typeof v === "object" && v !== null) {
      out ?? (out = { ...args });
      out[key] = resolve(v);
    }
  }
  return out ?? args;
}
var LocaleState = class {
  constructor(options = {}) {
    this.runtime = {
      locale: "en",
      formatNumber: (value, style) => formatMessageNumber(value, this.settings, style)
    };
    this.opts = { ...options };
    this.resolve();
  }
  /** The options as last set (unresolved). */
  get options() {
    return this.opts;
  }
  /** Whether the host chose a locale; Vela stamps `lang` only then. */
  get localeExplicit() {
    return this.opts.locale !== void 0;
  }
  /** Whether the host chose a direction; Vela stamps `dir` only then. */
  get directionExplicit() {
    return this.opts.direction !== void 0;
  }
  /** Apply a change: fields present in `next` replace (an explicit `undefined` restores
   *  the default), absent fields keep their current value. */
  update(next) {
    const patch = typeof next === "string" ? { locale: next } : next;
    this.opts = { ...this.opts, ...patch };
    for (const key of Object.keys(this.opts)) {
      if (this.opts[key] === void 0) delete this.opts[key];
    }
    this.resolve();
  }
  resolve() {
    const o = this.opts;
    const locale = canonicalLocale(o.locale);
    const numberingSystem = resolveNumberingSystem(locale, o.numberingSystem);
    const hourCycle = o.hourCycle === "h12" || o.hourCycle === "locale" ? o.hourCycle : "h23";
    this.settings = { locale, numberingSystem, hourCycle, english: languageOf(locale) === "en" };
    this.chain = fallbackChain(locale);
    this.resolvedDirection = o.direction === "rtl" || o.direction === "ltr" ? o.direction : o.direction === "auto" ? localeDirection(locale) : "ltr";
    this.resolvedWeekStart = o.weekStart === 0 || o.weekStart === 1 || o.weekStart === 6 ? o.weekStart : localeWeekStart(locale);
    this.runtime.locale = locale;
    this.formatters = resolveFormatters(this.settings, o.formatters);
  }
  get locale() {
    return this.settings.locale;
  }
  get direction() {
    return this.resolvedDirection;
  }
  get numberingSystem() {
    return this.settings.numberingSystem;
  }
  get hourCycle() {
    return this.settings.hourCycle;
  }
  get weekStart() {
    return this.resolvedWeekStart;
  }
  get format() {
    return this.formatters;
  }
  /** The resolved settings the built-in formatters and calendar helpers read. */
  get formatSettings() {
    return this.settings;
  }
  t(message, args) {
    if (typeof message === "string") return message;
    if (!isMessageDescriptor(message)) return message == null ? "" : String(message);
    const { id, defaultMessage } = message;
    const bound = message.values;
    const values = resolveArgs(bound ? args ? { ...bound, ...args } : bound : args, (m) => this.t(m));
    const override = this.opts.messages?.[id];
    const source = typeof override === "string" ? override : messagesFor(this.chain).get(id) ?? defaultMessage;
    try {
      return formatMessage(source, values, this.runtime);
    } catch (err) {
      if (!warnedSyntax) {
        warnedSyntax = true;
        console.warn(`[vela] message "${id}" could not be formatted; the English text is used instead.`, err);
      }
      if (source === defaultMessage) return defaultMessage;
      try {
        return formatMessage(defaultMessage, values, this.runtime);
      } catch {
        return defaultMessage;
      }
    }
  }
};
var english = null;
function englishTranslator() {
  english ?? (english = new LocaleState());
  return english;
}

// src/core/i18n/text.ts
function textOf(i18n, message, values) {
  return (i18n ?? englishTranslator()).t(message, values);
}

// src/ui/keymap.ts
var KEY_ALIASES = {
  esc: "escape",
  space: " ",
  plus: "+",
  minus: "-",
  del: "delete",
  return: "enter",
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown"
};
var MAC_GLYPHS = { meta: "⌘", ctrl: "⌃", alt: "⌥", shift: "⇧" };
var KEY_TEXT = {
  ctrl: msg("ui.keys.ctrl", "Ctrl"),
  alt: msg("ui.keys.alt", "Alt"),
  shift: msg("ui.keys.shift", "Shift"),
  meta: msg("ui.keys.meta", "Win"),
  space: msg("ui.keys.space", "Space"),
  general: msg("ui.keys.general", "General")
};
function parseChord(spec, mac) {
  const parts = spec.toLowerCase().split("+").map((p) => p.trim()).filter((p, i, a) => p !== "" || a[i - 1] === "");
  const chord = { ctrl: false, meta: false, alt: false, shift: false, key: "" };
  for (const raw of parts) {
    const p = raw === "" ? "+" : raw;
    if (p === "mod") mac ? chord.meta = true : chord.ctrl = true;
    else if (p === "ctrl" || p === "control") chord.ctrl = true;
    else if (p === "meta" || p === "cmd" || p === "command") chord.meta = true;
    else if (p === "alt" || p === "option") chord.alt = true;
    else if (p === "shift") chord.shift = true;
    else chord.key = KEY_ALIASES[p] ?? p;
  }
  return chord;
}
function chordKeyOf(ev) {
  const key = String(ev.key ?? "").toLowerCase();
  if (key.length !== 1 || /^[a-z0-9]$/.test(key) || !/\p{L}/u.test(key)) return key;
  const m = /^Key([A-Z])$|^Digit([0-9])$/.exec(ev.code ?? "");
  return m ? (m[1] ?? m[2]).toLowerCase() : key;
}
function eventMatches(ev, c) {
  return ev.ctrlKey === c.ctrl && ev.metaKey === c.meta && ev.altKey === c.alt && // Shift is part of producing many printable keys ('?', '+') — only enforce it
  // when the chord names a non-printable/letter key where shift is a real modifier.
  (c.key.length > 1 || /^[a-z0-9 ]$/.test(c.key) ? ev.shiftKey === c.shift : true) && chordKeyOf(ev) === c.key;
}
function isEditableTarget(ev) {
  const t2 = ev.target;
  if (!t2 || typeof t2 !== "object") return false;
  const tag = (t2.tagName ?? "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (t2.isContentEditable === true) return true;
  return (typeof t2.getAttribute === "function" ? t2.getAttribute("role") : null) === "textbox";
}
function displayChord(spec, mac, i18n) {
  const c = parseChord(spec, mac);
  const name = (m) => textOf(i18n, m);
  const keyLabel = c.key === " " ? name(KEY_TEXT.space) : c.key.length === 1 ? c.key.toUpperCase() : c.key.charAt(0).toUpperCase() + c.key.slice(1);
  if (mac) {
    return (c.ctrl ? MAC_GLYPHS.ctrl : "") + (c.alt ? MAC_GLYPHS.alt : "") + (c.shift ? MAC_GLYPHS.shift : "") + (c.meta ? MAC_GLYPHS.meta : "") + keyLabel;
  }
  const mods = [c.ctrl && name(KEY_TEXT.ctrl), c.alt && name(KEY_TEXT.alt), c.shift && name(KEY_TEXT.shift), c.meta && name(KEY_TEXT.meta)].filter(Boolean);
  return [...mods, keyLabel].join("+");
}
var KeymapManager = class {
  constructor(opts = {}) {
    this.descriptors = /* @__PURE__ */ new Map();
    this.rebinds = /* @__PURE__ */ new Map();
    this.scopeStack = [];
    this.target = null;
    this.onKeydown = (ev) => {
      this.handleKeydown(ev);
    };
    this.mac = opts.platform !== void 0 ? opts.platform === "mac" : typeof navigator !== "undefined" && /mac|iphone|ipad/i.test(navigator.platform ?? "");
    this.baseScope = opts.baseScope ?? "chart";
  }
  /** Register (or replace, by id) a binding. Returns a disposer. */
  register(desc) {
    this.descriptors.set(desc.id, desc);
    return () => {
      if (this.descriptors.get(desc.id) === desc) this.descriptors.delete(desc.id);
    };
  }
  unregister(id) {
    this.descriptors.delete(id);
    this.rebinds.delete(id);
  }
  /** User-level rebinding: overrides the descriptor's default chords (null resets). */
  rebind(id, keys) {
    if (keys === null) this.rebinds.delete(id);
    else this.rebinds.set(id, Array.isArray(keys) ? [...keys] : [keys]);
  }
  /** Snapshot for a shortcuts help panel / rebinding UI: labels, categories and key
   *  names in `i18n`'s language (English when absent). */
  bindings(i18n) {
    return [...this.descriptors.values()].map((d) => {
      const keys = this.activeKeys(d);
      return {
        id: d.id,
        label: textOf(i18n, d.label),
        category: textOf(i18n, d.category ?? KEY_TEXT.general),
        scope: d.scope ?? this.baseScope,
        keys,
        display: keys.map((k) => displayChord(k, this.mac, i18n))
      };
    });
  }
  pushScope(scope) {
    this.scopeStack.push(scope);
    return () => this.popScope(scope);
  }
  /** Pops the TOPMOST occurrence of `scope` (tolerates out-of-order teardown). */
  popScope(scope) {
    const i = this.scopeStack.lastIndexOf(scope);
    if (i >= 0) this.scopeStack.splice(i, 1);
  }
  get activeScope() {
    return this.scopeStack[this.scopeStack.length - 1] ?? this.baseScope;
  }
  attach(target) {
    this.detach();
    this.target = target;
    target.addEventListener("keydown", this.onKeydown);
  }
  detach() {
    this.target?.removeEventListener("keydown", this.onKeydown);
    this.target = null;
  }
  /** The matcher — public so hosts/tests can feed events from their own listeners. */
  handleKeydown(ev) {
    const editable = isEditableTarget(ev);
    for (const d of this.descriptors.values()) {
      const scope = d.scope ?? this.baseScope;
      if (scope !== "global" && scope !== this.activeScope) continue;
      if (editable && !d.allowInInput) continue;
      if (d.when && !d.when()) continue;
      for (const spec of this.activeKeys(d)) {
        if (eventMatches(ev, parseChord(spec, this.mac))) {
          if (d.preventDefault !== false) {
            ev.preventDefault?.();
            ev.stopPropagation?.();
          }
          d.run(ev);
          return true;
        }
      }
    }
    return false;
  }
  destroy() {
    this.detach();
    this.descriptors.clear();
    this.rebinds.clear();
    this.scopeStack.length = 0;
  }
  activeKeys(d) {
    return this.rebinds.get(d.id) ?? (Array.isArray(d.keys) ? d.keys : [d.keys]);
  }
};
var Switch = checkbox.Checkbox;
var createSwitch = checkbox.createCheckbox;
var switchController = checkbox.checkboxController;
var TextField = input.Input;
var createTextField = input.createInput;
var textFieldController = input.inputController;
var Menu = dropdownMenu.DropdownMenu;
var createMenu = dropdownMenu.createDropdownMenu;
var menuController = dropdownMenu.dropdownMenuController;
function buttonController(opts = {}) {
  let pressed = opts.pressed;
  let disabled = opts.disabled ?? false;
  let label = opts.label;
  const { variant, size } = button.buttonVariants.resolve(opts);
  const iconOnly = size.startsWith("icon");
  return {
    variant,
    size,
    iconOnly,
    get pressed() {
      return pressed;
    },
    get disabled() {
      return disabled;
    },
    setPressed: (v) => pressed = v,
    setDisabled: (v) => disabled = v,
    setLabel: (v) => label = v,
    rootProps: () => ({
      type: "button",
      "data-slot": "button",
      ...button.buttonVariants({ variant, size }),
      "data-pressed": pressed === true,
      "aria-pressed": pressed === void 0 ? void 0 : String(pressed),
      "aria-label": iconOnly ? label : void 0,
      disabled
    })
  };
}
var Button = class {
  constructor(opts = {}) {
    this.handle = button.createButton(opts);
    this.el = this.handle.el;
  }
  get pressed() {
    return this.handle.pressed;
  }
  setPressed(pressed) {
    this.handle.setPressed(pressed);
  }
  setDisabled(disabled) {
    this.handle.setDisabled(disabled);
  }
  /** New text (or, for an `icon*` size, a new accessible name). */
  setText(text) {
    this.handle.setText(text);
  }
};
function badgeController(opts = {}) {
  let variant = opts.variant ?? "default";
  return {
    get variant() {
      return variant;
    },
    setVariant: (v) => variant = v,
    rootProps: () => ({ "data-slot": "badge", "data-variant": variant, "data-count": opts.count === true })
  };
}
var Badge = class {
  constructor(opts) {
    this.handle = badge.createBadge(opts);
    this.el = this.handle.el;
  }
  setText(text) {
    this.handle.setText(text);
  }
  setVariant(variant) {
    this.handle.setVariant(variant);
  }
};
function withValue(item) {
  if ("value" in item) return item;
  const { id, ...rest } = item;
  return { ...rest, value: id };
}
var tabAvailable = (item) => !item.disabled && !item.hidden;
var Tabs = class {
  constructor(opts) {
    this.handle = tabs.createTabs({
      items: opts.items.map(withValue),
      defaultValue: opts.value,
      onValueChange: opts.onChange,
      orientation: opts.orientation,
      activationMode: opts.activationMode,
      dir: opts.dir,
      variant: opts.variant,
      className: opts.className,
      triggerClassName: opts.tabClassName
    });
    this.el = this.handle.el;
  }
  get value() {
    return this.handle.value;
  }
  /** Show a tab as selected without notifying. */
  setValue(id) {
    this.handle.setValue(id);
  }
  setItems(items) {
    this.handle.setItems(items.map(withValue));
  }
  /** Hide or show a tab. Hiding the selected tab selects the first available one (notified). */
  setHidden(id, hidden) {
    this.handle.setHidden(id, hidden);
  }
  /** The button of a tab (null: unknown id). */
  tab(id) {
    return this.handle.trigger(id);
  }
  /** Make `el` the panel of tab `id`. */
  attachPanel(id, el) {
    this.handle.panel(id, el);
  }
  destroy() {
    this.handle.destroy();
  }
};
var ToggleGroup = class {
  constructor(opts) {
    const common = {
      items: opts.items.map(withValue),
      label: opts.label,
      iconOnly: opts.iconOnly,
      dir: opts.dir,
      size: opts.size,
      fill: opts.fill,
      className: opts.className
    };
    this.handle = opts.type === "multiple" ? toggleGroup.createToggleGroup({ ...common, type: "multiple", defaultValue: opts.value, onValueChange: opts.onChange }) : toggleGroup.createToggleGroup({ ...common, type: "single", defaultValue: opts.value, onValueChange: opts.onChange });
    this.el = this.handle.el;
  }
  /** The options turned on. */
  get values() {
    return this.handle.values;
  }
  /** Show options as on without notifying. */
  setValue(value) {
    this.handle.setValue(value);
  }
  setItems(items) {
    this.handle.setItems(items.map(withValue));
  }
  destroy() {
    this.handle.destroy();
  }
};

Object.defineProperty(exports, "FIELD_FOCUS_CSS", {
  enumerable: true,
  get: function () { return styles.FIELD_FOCUS_CSS; }
});
Object.defineProperty(exports, "FIELD_FOCUS_RING", {
  enumerable: true,
  get: function () { return styles.FIELD_FOCUS_RING; }
});
Object.defineProperty(exports, "injectStyles", {
  enumerable: true,
  get: function () { return styles.injectStyles; }
});
Object.defineProperty(exports, "overlayScrollbarCss", {
  enumerable: true,
  get: function () { return styles.overlayScrollbarCss; }
});
Object.defineProperty(exports, "withAlpha", {
  enumerable: true,
  get: function () { return styles.withAlpha; }
});
Object.defineProperty(exports, "css", {
  enumerable: true,
  get: function () { return velaUi.css; }
});
Object.defineProperty(exports, "t", {
  enumerable: true,
  get: function () { return velaUi.t; }
});
Object.defineProperty(exports, "applyPlotOverlayTokens", {
  enumerable: true,
  get: function () { return theme.applyPlotOverlayTokens; }
});
Object.defineProperty(exports, "applyTheme", {
  enumerable: true,
  get: function () { return theme.applyTheme; }
});
Object.defineProperty(exports, "applyThemeTokens", {
  enumerable: true,
  get: function () { return theme.applyThemeTokens; }
});
Object.defineProperty(exports, "checkTheme", {
  enumerable: true,
  get: function () { return theme.checkTheme; }
});
Object.defineProperty(exports, "createTheme", {
  enumerable: true,
  get: function () { return theme.createTheme; }
});
Object.defineProperty(exports, "ensureUIHost", {
  enumerable: true,
  get: function () { return theme.ensureUIHost; }
});
Object.defineProperty(exports, "iconEl", {
  enumerable: true,
  get: function () { return icons.iconEl; }
});
Object.defineProperty(exports, "iconMarkup", {
  enumerable: true,
  get: function () { return icons.iconMarkup; }
});
Object.defineProperty(exports, "registerIcon", {
  enumerable: true,
  get: function () { return icons.registerIcon; }
});
Object.defineProperty(exports, "svg16", {
  enumerable: true,
  get: function () { return icons.svg16; }
});
Object.defineProperty(exports, "svg24", {
  enumerable: true,
  get: function () { return icons.svg24; }
});
Object.defineProperty(exports, "nextUid", {
  enumerable: true,
  get: function () { return zag.nextUid; }
});
Object.defineProperty(exports, "normalizeProps", {
  enumerable: true,
  get: function () { return zag.normalizeProps; }
});
Object.defineProperty(exports, "runMachine", {
  enumerable: true,
  get: function () { return zag.runMachine; }
});
Object.defineProperty(exports, "spreadProps", {
  enumerable: true,
  get: function () { return zag.spreadProps; }
});
Object.defineProperty(exports, "disposeWithin", {
  enumerable: true,
  get: function () { return dispose.disposeWithin; }
});
Object.defineProperty(exports, "ownTeardown", {
  enumerable: true,
  get: function () { return dispose.ownTeardown; }
});
Object.defineProperty(exports, "SURFACE_CLOSE_EVENT", {
  enumerable: true,
  get: function () { return surfaceEvents.SURFACE_CLOSE_EVENT; }
});
Object.defineProperty(exports, "SURFACE_OPEN_EVENT", {
  enumerable: true,
  get: function () { return surfaceEvents.SURFACE_OPEN_EVENT; }
});
Object.defineProperty(exports, "applyProps", {
  enumerable: true,
  get: function () { return headless.applyProps; }
});
Object.defineProperty(exports, "Tooltip", {
  enumerable: true,
  get: function () { return tooltip.Tooltip; }
});
Object.defineProperty(exports, "createTooltip", {
  enumerable: true,
  get: function () { return tooltip.createTooltip; }
});
Object.defineProperty(exports, "tooltipController", {
  enumerable: true,
  get: function () { return tooltip.tooltipController; }
});
Object.defineProperty(exports, "DropdownMenu", {
  enumerable: true,
  get: function () { return dropdownMenu.DropdownMenu; }
});
Object.defineProperty(exports, "createDropdownMenu", {
  enumerable: true,
  get: function () { return dropdownMenu.createDropdownMenu; }
});
Object.defineProperty(exports, "dropdownMenuController", {
  enumerable: true,
  get: function () { return dropdownMenu.dropdownMenuController; }
});
Object.defineProperty(exports, "ContextMenu", {
  enumerable: true,
  get: function () { return contextMenu.ContextMenu; }
});
Object.defineProperty(exports, "createContextMenu", {
  enumerable: true,
  get: function () { return contextMenu.createContextMenu; }
});
Object.defineProperty(exports, "BUTTON_CSS", {
  enumerable: true,
  get: function () { return button.BUTTON_CSS; }
});
Object.defineProperty(exports, "BUTTON_STYLE_ID", {
  enumerable: true,
  get: function () { return button.BUTTON_STYLE_ID; }
});
Object.defineProperty(exports, "createButton", {
  enumerable: true,
  get: function () { return button.createButton; }
});
Object.defineProperty(exports, "BADGE_CSS", {
  enumerable: true,
  get: function () { return badge.BADGE_CSS; }
});
Object.defineProperty(exports, "BADGE_STYLE_ID", {
  enumerable: true,
  get: function () { return badge.BADGE_STYLE_ID; }
});
Object.defineProperty(exports, "createBadge", {
  enumerable: true,
  get: function () { return badge.createBadge; }
});
Object.defineProperty(exports, "TABS_CSS", {
  enumerable: true,
  get: function () { return tabs.TABS_CSS; }
});
Object.defineProperty(exports, "TABS_STYLE_ID", {
  enumerable: true,
  get: function () { return tabs.TABS_STYLE_ID; }
});
Object.defineProperty(exports, "createTabs", {
  enumerable: true,
  get: function () { return tabs.createTabs; }
});
Object.defineProperty(exports, "TOGGLE_GROUP_CSS", {
  enumerable: true,
  get: function () { return toggleGroup.TOGGLE_GROUP_CSS; }
});
Object.defineProperty(exports, "TOGGLE_GROUP_STYLE_ID", {
  enumerable: true,
  get: function () { return toggleGroup.TOGGLE_GROUP_STYLE_ID; }
});
Object.defineProperty(exports, "createToggleGroup", {
  enumerable: true,
  get: function () { return toggleGroup.createToggleGroup; }
});
Object.defineProperty(exports, "Checkbox", {
  enumerable: true,
  get: function () { return checkbox.Checkbox; }
});
Object.defineProperty(exports, "checkboxController", {
  enumerable: true,
  get: function () { return checkbox.checkboxController; }
});
Object.defineProperty(exports, "createCheckbox", {
  enumerable: true,
  get: function () { return checkbox.createCheckbox; }
});
Object.defineProperty(exports, "Input", {
  enumerable: true,
  get: function () { return input.Input; }
});
Object.defineProperty(exports, "createInput", {
  enumerable: true,
  get: function () { return input.createInput; }
});
Object.defineProperty(exports, "inputController", {
  enumerable: true,
  get: function () { return input.inputController; }
});
Object.defineProperty(exports, "Dialog", {
  enumerable: true,
  get: function () { return dialog.Dialog; }
});
Object.defineProperty(exports, "createDialog", {
  enumerable: true,
  get: function () { return dialog.createDialog; }
});
Object.defineProperty(exports, "dialogController", {
  enumerable: true,
  get: function () { return dialog.dialogController; }
});
Object.defineProperty(exports, "Drawer", {
  enumerable: true,
  get: function () { return drawer.Drawer; }
});
Object.defineProperty(exports, "createDrawer", {
  enumerable: true,
  get: function () { return drawer.createDrawer; }
});
Object.defineProperty(exports, "drawerController", {
  enumerable: true,
  get: function () { return drawer.drawerController; }
});
Object.defineProperty(exports, "Popover", {
  enumerable: true,
  get: function () { return popover.Popover; }
});
Object.defineProperty(exports, "closeOpenPopovers", {
  enumerable: true,
  get: function () { return popover.closeOpenPopovers; }
});
Object.defineProperty(exports, "createPopover", {
  enumerable: true,
  get: function () { return popover.createPopover; }
});
Object.defineProperty(exports, "eventDismissedPopover", {
  enumerable: true,
  get: function () { return popover.eventDismissedPopover; }
});
Object.defineProperty(exports, "insetRect", {
  enumerable: true,
  get: function () { return popover.insetRect; }
});
Object.defineProperty(exports, "intersectRects", {
  enumerable: true,
  get: function () { return popover.intersectRects; }
});
Object.defineProperty(exports, "isPopoverOpen", {
  enumerable: true,
  get: function () { return popover.isPopoverOpen; }
});
Object.defineProperty(exports, "openPopoverTrigger", {
  enumerable: true,
  get: function () { return popover.openPopoverTrigger; }
});
Object.defineProperty(exports, "placePopover", {
  enumerable: true,
  get: function () { return popover.placePopover; }
});
Object.defineProperty(exports, "popoverController", {
  enumerable: true,
  get: function () { return popover.popoverController; }
});
Object.defineProperty(exports, "viewportRect", {
  enumerable: true,
  get: function () { return popover.viewportRect; }
});
Object.defineProperty(exports, "createEmpty", {
  enumerable: true,
  get: function () { return empty.createEmpty; }
});
Object.defineProperty(exports, "Select", {
  enumerable: true,
  get: function () { return select.Select; }
});
Object.defineProperty(exports, "createSelect", {
  enumerable: true,
  get: function () { return select.createSelect; }
});
Object.defineProperty(exports, "decorateSelectScroll", {
  enumerable: true,
  get: function () { return select.decorateSelectScroll; }
});
Object.defineProperty(exports, "fillSelectList", {
  enumerable: true,
  get: function () { return select.fillSelectList; }
});
Object.defineProperty(exports, "openSelectList", {
  enumerable: true,
  get: function () { return select.openSelectList; }
});
Object.defineProperty(exports, "selectController", {
  enumerable: true,
  get: function () { return select.selectController; }
});
Object.defineProperty(exports, "toggleSelectList", {
  enumerable: true,
  get: function () { return select.toggleSelectList; }
});
Object.defineProperty(exports, "NumberInput", {
  enumerable: true,
  get: function () { return numberInput.NumberInput; }
});
Object.defineProperty(exports, "clampNumber", {
  enumerable: true,
  get: function () { return numberInput.clampNumber; }
});
Object.defineProperty(exports, "createNumberInput", {
  enumerable: true,
  get: function () { return numberInput.createNumberInput; }
});
Object.defineProperty(exports, "numberInputController", {
  enumerable: true,
  get: function () { return numberInput.numberInputController; }
});
Object.defineProperty(exports, "snapToStep", {
  enumerable: true,
  get: function () { return numberInput.snapToStep; }
});
Object.defineProperty(exports, "ColorField", {
  enumerable: true,
  get: function () { return colorPicker.ColorField; }
});
Object.defineProperty(exports, "blendOver", {
  enumerable: true,
  get: function () { return colorPicker.blendOver; }
});
Object.defineProperty(exports, "buildColorPicker", {
  enumerable: true,
  get: function () { return colorPicker.buildColorPicker; }
});
Object.defineProperty(exports, "buildPalette", {
  enumerable: true,
  get: function () { return colorPicker.buildPalette; }
});
Object.defineProperty(exports, "closeColorPopover", {
  enumerable: true,
  get: function () { return colorPicker.closeColorPopover; }
});
Object.defineProperty(exports, "colorField", {
  enumerable: true,
  get: function () { return colorPicker.colorField; }
});
Object.defineProperty(exports, "colorPickerController", {
  enumerable: true,
  get: function () { return colorPicker.colorPickerController; }
});
Object.defineProperty(exports, "combineColor", {
  enumerable: true,
  get: function () { return colorPicker.combineColor; }
});
Object.defineProperty(exports, "createColorField", {
  enumerable: true,
  get: function () { return colorPicker.createColorField; }
});
Object.defineProperty(exports, "hslHex", {
  enumerable: true,
  get: function () { return colorPicker.hslHex; }
});
Object.defineProperty(exports, "splitColor", {
  enumerable: true,
  get: function () { return colorPicker.splitColor; }
});
Object.defineProperty(exports, "transparencyChecker", {
  enumerable: true,
  get: function () { return colorPicker.transparencyChecker; }
});
Object.defineProperty(exports, "FIELD_GAP_PX", {
  enumerable: true,
  get: function () { return field.FIELD_GAP_PX; }
});
Object.defineProperty(exports, "buildFieldControl", {
  enumerable: true,
  get: function () { return field.buildFieldControl; }
});
Object.defineProperty(exports, "fieldGrid", {
  enumerable: true,
  get: function () { return field.fieldGrid; }
});
Object.defineProperty(exports, "fieldGridColumns", {
  enumerable: true,
  get: function () { return field.fieldGridColumns; }
});
Object.defineProperty(exports, "fieldRow", {
  enumerable: true,
  get: function () { return field.fieldRow; }
});
Object.defineProperty(exports, "fieldSection", {
  enumerable: true,
  get: function () { return field.fieldSection; }
});
Object.defineProperty(exports, "fieldSeparator", {
  enumerable: true,
  get: function () { return field.fieldSeparator; }
});
Object.defineProperty(exports, "TextArea", {
  enumerable: true,
  get: function () { return textArea.TextArea; }
});
Object.defineProperty(exports, "createTextArea", {
  enumerable: true,
  get: function () { return textArea.createTextArea; }
});
Object.defineProperty(exports, "textAreaController", {
  enumerable: true,
  get: function () { return textArea.textAreaController; }
});
Object.defineProperty(exports, "GlyphSelect", {
  enumerable: true,
  get: function () { return glyphSelect.GlyphSelect; }
});
Object.defineProperty(exports, "WIDTH_FIELD_OPTIONS", {
  enumerable: true,
  get: function () { return glyphSelect.WIDTH_FIELD_OPTIONS; }
});
Object.defineProperty(exports, "closeWidthPopover", {
  enumerable: true,
  get: function () { return glyphSelect.closeWidthPopover; }
});
Object.defineProperty(exports, "createGlyphSelect", {
  enumerable: true,
  get: function () { return glyphSelect.createGlyphSelect; }
});
Object.defineProperty(exports, "glyphSelectController", {
  enumerable: true,
  get: function () { return glyphSelect.glyphSelectController; }
});
Object.defineProperty(exports, "lineWidthGlyph", {
  enumerable: true,
  get: function () { return glyphSelect.lineWidthGlyph; }
});
Object.defineProperty(exports, "widthField", {
  enumerable: true,
  get: function () { return glyphSelect.widthField; }
});
Object.defineProperty(exports, "widthFieldOptions", {
  enumerable: true,
  get: function () { return glyphSelect.widthFieldOptions; }
});
Object.defineProperty(exports, "CALLOUT_CSS", {
  enumerable: true,
  get: function () { return calloutBubble.CALLOUT_CSS; }
});
Object.defineProperty(exports, "CALLOUT_STYLE_ID", {
  enumerable: true,
  get: function () { return calloutBubble.CALLOUT_STYLE_ID; }
});
Object.defineProperty(exports, "CalloutBubble", {
  enumerable: true,
  get: function () { return calloutBubble.CalloutBubble; }
});
Object.defineProperty(exports, "calloutPanelRows", {
  enumerable: true,
  get: function () { return calloutBubble.calloutPanelRows; }
});
Object.defineProperty(exports, "closesPanel", {
  enumerable: true,
  get: function () { return calloutBubble.closesPanel; }
});
Object.defineProperty(exports, "createCalloutBubble", {
  enumerable: true,
  get: function () { return calloutBubble.createCalloutBubble; }
});
Object.defineProperty(exports, "DatePicker", {
  enumerable: true,
  get: function () { return datePicker.DatePicker; }
});
Object.defineProperty(exports, "createDatePicker", {
  enumerable: true,
  get: function () { return datePicker.createDatePicker; }
});
Object.defineProperty(exports, "datePickerController", {
  enumerable: true,
  get: function () { return datePicker.datePickerController; }
});
Object.defineProperty(exports, "isoDate", {
  enumerable: true,
  get: function () { return datePicker.isoDate; }
});
Object.defineProperty(exports, "normalizeDateInput", {
  enumerable: true,
  get: function () { return datePicker.normalizeDateInput; }
});
exports.Badge = Badge;
exports.Button = Button;
exports.KeymapManager = KeymapManager;
exports.Menu = Menu;
exports.Switch = Switch;
exports.Tabs = Tabs;
exports.TextField = TextField;
exports.ToggleGroup = ToggleGroup;
exports.badgeController = badgeController;
exports.buttonController = buttonController;
exports.createMenu = createMenu;
exports.createSwitch = createSwitch;
exports.createTextField = createTextField;
exports.menuController = menuController;
exports.switchController = switchController;
exports.tabAvailable = tabAvailable;
exports.textFieldController = textFieldController;
