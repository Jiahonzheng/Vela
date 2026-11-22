import { msg, textOf } from './chunk-VCYHJS6Q.js';
export { FIELD_FOCUS_CSS, FIELD_FOCUS_RING, injectStyles, overlayScrollbarCss, withAlpha } from '@luxalgo/vela-ui/styles';
export { css, t } from '@luxalgo/vela-ui';
export { applyPlotOverlayTokens, applyTheme, applyThemeTokens, checkTheme, createTheme, ensureUIHost } from '@luxalgo/vela-ui/theme';
export { iconEl, iconMarkup, registerIcon, svg16, svg24 } from '@luxalgo/vela-ui/icons';
export { nextUid, normalizeProps, runMachine, spreadProps } from '@luxalgo/vela-ui/zag';
export { disposeWithin, ownTeardown } from '@luxalgo/vela-ui/dispose';
export { SURFACE_CLOSE_EVENT, SURFACE_OPEN_EVENT } from '@luxalgo/vela-ui/surface-events';
export { applyProps } from '@luxalgo/vela-ui/headless';
export { Tooltip, createTooltip, tooltipController } from '@luxalgo/vela-ui/tooltip';
import { DropdownMenu, createDropdownMenu, dropdownMenuController } from '@luxalgo/vela-ui/dropdown-menu';
export { DropdownMenu, createDropdownMenu, dropdownMenuController } from '@luxalgo/vela-ui/dropdown-menu';
export { ContextMenu, createContextMenu } from '@luxalgo/vela-ui/context-menu';
import { buttonVariants, createButton } from '@luxalgo/vela-ui/button';
export { BUTTON_CSS, BUTTON_STYLE_ID, createButton } from '@luxalgo/vela-ui/button';
import { createBadge } from '@luxalgo/vela-ui/badge';
export { BADGE_CSS, BADGE_STYLE_ID, createBadge } from '@luxalgo/vela-ui/badge';
import { createTabs } from '@luxalgo/vela-ui/tabs';
export { TABS_CSS, TABS_STYLE_ID, createTabs } from '@luxalgo/vela-ui/tabs';
import { createToggleGroup } from '@luxalgo/vela-ui/toggle-group';
export { TOGGLE_GROUP_CSS, TOGGLE_GROUP_STYLE_ID, createToggleGroup } from '@luxalgo/vela-ui/toggle-group';
import { Checkbox, createCheckbox, checkboxController } from '@luxalgo/vela-ui/checkbox';
export { Checkbox, checkboxController, createCheckbox } from '@luxalgo/vela-ui/checkbox';
import { Input, createInput, inputController } from '@luxalgo/vela-ui/input';
export { Input, createInput, inputController } from '@luxalgo/vela-ui/input';
export { Dialog, createDialog, dialogController } from '@luxalgo/vela-ui/dialog';
export { Drawer, createDrawer, drawerController } from '@luxalgo/vela-ui/drawer';
export { Popover, closeOpenPopovers, createPopover, eventDismissedPopover, insetRect, intersectRects, isPopoverOpen, openPopoverTrigger, placePopover, popoverController, viewportRect } from '@luxalgo/vela-ui/popover';
export { createEmpty } from '@luxalgo/vela-ui/empty';
export { Select, createSelect, decorateSelectScroll, fillSelectList, openSelectList, selectController, toggleSelectList } from '@luxalgo/vela-ui/select';
export { NumberInput, clampNumber, createNumberInput, numberInputController, snapToStep } from '@luxalgo/vela-ui/number-input';
export { ColorField, blendOver, buildColorPicker, buildPalette, closeColorPopover, colorField, colorPickerController, combineColor, createColorField, hslHex, splitColor, transparencyChecker } from '@luxalgo/vela-ui/color-picker';
export { FIELD_GAP_PX, buildFieldControl, fieldGrid, fieldGridColumns, fieldRow, fieldSection, fieldSeparator } from '@luxalgo/vela-ui/field';
export { TextArea, createTextArea, textAreaController } from '@luxalgo/vela-ui/text-area';
export { GlyphSelect, WIDTH_FIELD_OPTIONS, closeWidthPopover, createGlyphSelect, glyphSelectController, lineWidthGlyph, widthField, widthFieldOptions } from '@luxalgo/vela-ui/glyph-select';
export { CALLOUT_CSS, CALLOUT_STYLE_ID, CalloutBubble, calloutPanelRows, closesPanel, createCalloutBubble } from '@luxalgo/vela-ui/callout-bubble';
export { DatePicker, createDatePicker, datePickerController, isoDate, normalizeDateInput } from '@luxalgo/vela-ui/date-picker';

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
var Switch = Checkbox;
var createSwitch = createCheckbox;
var switchController = checkboxController;
var TextField = Input;
var createTextField = createInput;
var textFieldController = inputController;
var Menu = DropdownMenu;
var createMenu = createDropdownMenu;
var menuController = dropdownMenuController;
function buttonController(opts = {}) {
  let pressed = opts.pressed;
  let disabled = opts.disabled ?? false;
  let label = opts.label;
  const { variant, size } = buttonVariants.resolve(opts);
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
      ...buttonVariants({ variant, size }),
      "data-pressed": pressed === true,
      "aria-pressed": pressed === void 0 ? void 0 : String(pressed),
      "aria-label": iconOnly ? label : void 0,
      disabled
    })
  };
}
var Button = class {
  constructor(opts = {}) {
    this.handle = createButton(opts);
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
    this.handle = createBadge(opts);
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
    this.handle = createTabs({
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
    this.handle = opts.type === "multiple" ? createToggleGroup({ ...common, type: "multiple", defaultValue: opts.value, onValueChange: opts.onChange }) : createToggleGroup({ ...common, type: "single", defaultValue: opts.value, onValueChange: opts.onChange });
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

export { Badge, Button, KeymapManager, Menu, Switch, Tabs, TextField, ToggleGroup, badgeController, buttonController, createMenu, createSwitch, createTextField, isEditableTarget, menuController, switchController, tabAvailable, textFieldController };
