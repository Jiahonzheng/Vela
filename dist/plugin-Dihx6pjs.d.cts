import { i as MessageDescriptor, a as MessageArgs, L as LocalePack, b as LocalizationOptions, T as Translator, M as MessageLike } from './types-DXVlW2vL.cjs';
import { X as DrawingTypeKey, ar as DrawingStyle, h as SerializedDrawing, g as Drawing, O as OHLCV, n as SymbolFacts, D as DataProvider, S as SymbolInfo, B as BarRange, U as Unsubscribe, bd as SeriesKind, d as VelaTheme } from './DataProvider-l65c5k9q.cjs';
import { g as DataControl, a as SidebarComposition } from './contributions-CwSc8Qq7.cjs';
import './side-panel-TCLdOEYq.cjs';
import '@luxalgo/vela-ui/icons';
import './keymap-Bv49ugg9.cjs';
import '@luxalgo/vela-ui/palette';

/** Values a message interpolates. */
type MessageValues = Readonly<Record<string, string | number>>;

/**
 * Declare a translatable message: a stable, dotted id and its English text in ICU message
 * syntax (`'{count, plural, one {# bar} other {# bars}}'`). The descriptor is inert data;
 * a translator's `t()` resolves it. The build extracts every `msg()` call with literal
 * arguments into the English catalog, so keep both arguments string literals.
 */
declare function msg(id: string, defaultMessage: string): MessageDescriptor;
/**
 * A message with values bound to its arguments, for display text declared before its
 * values are known to the code that renders it (`withValues(BAND, { n: 2 })` reads
 * "Band #2"). A translator formats the bound values; values passed to `t()` win.
 */
declare function withValues(message: MessageDescriptor, values: MessageArgs): MessageDescriptor;

/**
 * Register a locale pack: a locale tag and its messages (id → ICU message). Several packs
 * may share a tag (the core's, a plugin's, the host's); for the same id the pack
 * registered last wins. Registration is a call, never an import side effect. Returns the
 * disposer that removes this pack again.
 */
declare function registerLocale(pack: LocalePack): () => void;
/** The tags of every registered pack, in registration order (duplicates collapsed). */
declare function registeredLocales(): string[];

/**
 * A standalone translator for UI built outside a chart (a kit component, a host panel).
 * Charts, workspaces and widgets carry their own as `i18n`.
 */
declare function createTranslator(options?: LocalizationOptions): Translator;

/** What a drawing type contributes to the toolbar + factory (renderer-neutral). */
interface DrawingTypeMeta {
    type: DrawingTypeKey;
    /** Toolbar group id (e.g. `'lines'`, `'shapes'`, `'annotations'`). */
    group: string;
    /** The tool's name (toolbar, settings, object tree); a message reads in the chart's language. */
    label: MessageLike;
    /** Inline SVG markup for the toolbar button — no DOM, renderer paints it. */
    icon: string;
    defaultStyle: DrawingStyle;
    /** The tool's body REPLACES the series pixels inside its area (an opaque inset): a fresh
     *  instance then starts ABOVE the pane's series stack instead of just under the candles —
     *  under them its content would be buried. The user can still reorder it afterwards. */
    coversSeries?: boolean;
    /** One short sentence prompting the placement gesture, shown by the renderer at the
     *  bottom of the chart while the tool is armed and no placement has started yet. */
    placementHint?: MessageLike;
    /** Build an instance from a (partial) serialized record. Serves create + deserialize. */
    create(init: Partial<SerializedDrawing> & {
        paneId: string;
    }): Drawing;
}
/** Register (or replace) a drawing type. Built-ins register at module load; new
 *  types (fibs/patterns) call this — no base/port/facade change. */
declare function registerDrawingType(meta: DrawingTypeMeta): void;
/** A registered type as the read APIs hand it out: its label and hint as plain text. */
type ResolvedDrawingTypeMeta = DrawingTypeMeta & {
    label: string;
    placementHint?: string;
};
/** A registered drawing type, its label and hint in `i18n`'s language (English without one). */
declare function getDrawingType(type: string, i18n?: Translator): ResolvedDrawingTypeMeta | undefined;
/** Every registered drawing type, labels in `i18n`'s language (English without one). */
declare function drawingTypes(i18n?: Translator): ResolvedDrawingTypeMeta[];
/** Build a fresh drawing of `type` on `paneId`, seeding the type's default style. */
declare function createDrawing(type: DrawingTypeKey, init: Partial<SerializedDrawing> & {
    paneId: string;
}): Drawing | null;
/** Rehydrate a {@link Drawing} from a plain record, or null for an unknown type. */
declare function deserializeDrawing(doc: SerializedDrawing): Drawing | null;

/**
 * The authoritative, user-controlled pan/zoom state of the time axis.
 *
 * - `barSpacing`: pixels between adjacent bar centers (the zoom level).
 * - `rightOffset`: how many bar-widths the LAST bar sits from the right edge
 *   (the pan position). May be negative (last bar scrolled off the right).
 *
 * The chart width and bar count are NOT part of this state — they are owned by
 * the renderer (resize / setBars) and combined with the viewport in the
 * CoordinateSystem to produce pixel coordinates.
 */
interface ViewportState {
    barSpacing: number;
    rightOffset: number;
}

/** A pane's price window (after autoscale + margins). `log` ⇒ logarithmic mapping;
 *  `invert` ⇒ the axis is flipped (high at the bottom), stamped per frame from the pane. */
interface PriceScale {
    min: number;
    max: number;
    log?: boolean;
    invert?: boolean;
}
/** A pane's vertical pixel extent within the chart's data area (media px). */
interface PaneBounds {
    top: number;
    height: number;
}
/**
 * The ONE authoritative coordinate transform, shared by every layer (data
 * backend, canvas2d chrome, DOM overlays). Two decoupled axes:
 *
 * - X: a fractional **logical bar index** mapped to pixels by the viewport
 *   (`barSpacing` + `rightOffset`); bar TIME ↔ logical is a separate mapping
 *   over the loaded bar times so time and spacing stay independent.
 * - Y: a per-pane **linear/log/percent price** mapped within that pane's bounds.
 *
 * Everything is in media (CSS) pixels; `toBitmap` converts to device pixels for
 * crisp drawing. Keeping a single instance is what keeps all layers aligned.
 */
declare class CoordinateSystem {
    private widthPx;
    private dataHeightPx;
    private devicePixelRatio;
    private viewport;
    private pitchScale;
    private times;
    private intervalMs;
    setSize(width: number, dataHeight: number, dpr: number): void;
    setBars(times: readonly number[]): void;
    /**
     * Append one new bar time in O(1). The bar cadence is stable, so the median
     * interval is NOT re-derived (a full re-sort per live tick would be O(n log n)).
     * It's only derived lazily — via the robust median over the bars seen so far —
     * while it's still unknown (cold start at <2 bars); the warm path is a single
     * push. `barCount` reads `times.length`, so the new bar is visible immediately.
     */
    appendBar(time: number): void;
    setViewport(viewport: ViewportState): void;
    getViewport(): ViewportState;
    /**
     * Spacing multiplier applied to the center-to-center pixel PITCH between adjacent
     * bars (and hence the crosshair's snap step) — independent of the zoom (`barSpacing`).
     * `1` = default; `>1` spreads bars apart with real gaps; `<1` tightens them. It changes
     * only where bars SIT (`logicalToX`/`xToLogical`), never their raw zoom value, so candle
     * bodies keep their width — the extra pitch becomes gap. Body width tracks
     * {@link bodySpacing} so a `<1` multiplier shrinks bodies to fit instead of overlapping.
     */
    setPitchScale(scale: number): void;
    get spacingScale(): number;
    /** Effective center-to-center pixel pitch between adjacent bars (zoom × spacing multiplier). */
    pxPerBar(): number;
    /**
     * Pixel basis for element (candle/bar/column) BODY width. Kept at the raw zoom pitch so
     * bodies keep their width while the multiplier only adds gap; capped at the effective pitch
     * so a `<1` multiplier tightens bodies to fit rather than overlapping the neighbours.
     */
    bodySpacing(): number;
    get width(): number;
    get height(): number;
    get dpr(): number;
    get barCount(): number;
    get barInterval(): number;
    /** The logical index that sits exactly at the right pixel edge of the chart. */
    get rightEdgeLogical(): number;
    logicalToX(logical: number): number;
    xToLogical(x: number): number;
    timeToLogical(ms: number): number;
    logicalToTime(logical: number): number;
    timeToX(ms: number): number;
    /** True after a bar's expected end and before the next loaded bar. */
    isInCompressedGap(ms: number): boolean;
    priceToY(price: number, scale: PriceScale, bounds: PaneBounds): number;
    yToPrice(y: number, scale: PriceScale, bounds: PaneBounds): number;
    visibleLogicalRange(): {
        from: number;
        to: number;
    };
    visibleTimeRange(): {
        from: number;
        to: number;
    };
    toBitmap(mediaPx: number): number;
}

/**
 * A 1:1, TIME-PRESERVING per-bar transform a price style applies to the chart's bar
 * stream (Heikin Ashi is the first). The orchestrator applies it at its single outbound
 * bar seam, so the renderer, the scripting engines, and the native indicators all see
 * one consistent VIEW while the raw series stays the untouched source of truth (the
 * `'bar'` event and `chart.data` stay on the raw plane).
 *
 * Deliberately NOT a contract for styles that change the bar count or time axis
 * (Renko, Kagi, Point & Figure) — those need a different seam.
 */
interface BarTransform {
    /** Derive the full view series from the raw series (front-to-back; may be recursive). */
    full(raw: readonly OHLCV[]): OHLCV[];
    /** Derive ONE view bar from a raw bar + the PREVIOUS view bar (live tick / append; O(1)). */
    next(raw: OHLCV, prevView: OHLCV | undefined): OHLCV;
}

/** The environment a chart hands to a style's data engine when the style activates. */
interface SeriesDataEngineHost {
    /** The chart's symbol (as configured, provider prefix stripped by the data layer). */
    symbol: string;
    /** The chart's timeframe (canonical string, e.g. `'60'`). */
    timeframe: string;
    /** Whether the chart runs live (streaming forming bar) or static history. False during
     *  a bar replay — entering and leaving replay REBUILDS the engine, so this never
     *  changes within one host's lifetime. */
    live: boolean;
    /** The chart's trading session (`'regular'` | `'extended'`); undefined = regular /
     *  no session model. A session switch reloads the market and REBUILDS the engine,
     *  so this never changes within one host's lifetime. */
    session?: string;
    /** The chart's CURRENT view bars (post-transform) — read fresh, never cache. */
    bars: () => readonly OHLCV[];
    /** The chart's data control surface (`chart.data`) — providers, capabilities, resolution. */
    data: DataControl;
    /** Push the style's per-bar layer data to the renderer (the `<id>` native channel). */
    pushData: (data: unknown) => void;
    /** Push the ranges still loading (the `<id>-pending` channel — skeleton/reveal UIs). */
    pushPending: (ranges: ReadonlyArray<readonly [number, number]>) => void;
}
/**
 * A per-chart data engine behind a chart type: created on first entry into the style,
 * suspended/resumed as the user switches styles, replaced by a fresh engine when the
 * market or the replay state changes, stopped when the chart is destroyed.
 * All methods are fire-and-forget from the chart's point of view — the engine owns its
 * own scheduling and pushes results through the host channels. The host forwards pushes
 * only from the chart's current, unsuspended engine: work still in flight when the
 * engine is suspended or stopped never reaches the scene.
 */
interface SeriesDataEngine {
    start(host: SeriesDataEngineHost): void;
    /** The style was left, or a market switch began — stop fetching/pushing, keep state
     *  for a cheap resume. Host pushes are dropped from here until `resume()`. */
    suspend(): void;
    /** The style was re-entered — re-push what the layer shows (nothing pushed while
     *  suspended reached it). */
    resume(): void;
    /** The chart is going away, or the engine is being replaced — release everything.
     *  Its host drops every push from here on. */
    stop(): void;
    /** The visible range changed (pan/zoom) while the style is active. */
    onViewport?(range: {
        from: number;
        to: number;
    }): void;
    /** The chart's bars changed while the style is active — a live tick, a new bar (a
     *  replayed one included), or older history prepended. Re-read `host.bars()`; an
     *  engine that streams its own live data may ignore ticks while `host.live`. */
    onBars?(): void;
    /** New settings values from the chart-settings dialog (the type's SDK section).
     *  Also delivered once just BEFORE `start()` whenever stored values exist (a
     *  persisted config, a market switch recreating the engine) — an engine must
     *  accept a pre-start call as pure configuration, so it never fetches on
     *  schema defaults the user has edited away. */
    onSettings?(values: Record<string, unknown>): void;
}
/** One registered chart type. */
interface ChartTypeDefinition {
    /** The price-style id (`'heikinashi'`; a plugin might register `'footprint'`, `'renko'`…). */
    id: string;
    /** Human-readable label for style pickers. Defaults to the id. A message (`msg()`)
     *  reads in the chart's language. */
    label?: MessageLike;
    /** Raw `<svg>` markup for style pickers (surfaced as icon id `style-<id>`). */
    icon?: string;
    /** Optional SETTINGS SECTION rendered inside the chart-settings dialog — declarative
     *  rows (never DOM). Values persist in the renderer config under `chartTypes.<id>`
     *  and are pushed to the type's `<id>-settings` native-data channel on change. */
    settings?: ChartTypeSettingsSection;
    /** View-bar transform applied at the chart's outbound bar seam (1:1, time-preserving). */
    barTransform?: BarTransform;
    /**
     * Whether the type participates in extended tickers (`"SYM;id"` — scripts request the
     * transformed series via `ticker.*`). Defaults to `true` when `barTransform` is set:
     * a transform-based type is exactly what the data plane can re-derive server-side.
     */
    tickerModifier?: boolean;
    /** Factory for the style's per-chart data engine (created lazily on first activation). */
    dataEngine?: () => SeriesDataEngine;
    /**
     * What the renderer paints for the PRICE SERIES while this style is active.
     * `'candles'` (default) keeps the base candle painting under the type's layers;
     * `'none'` suppresses it — for types whose renderer layer fully REPLACES the
     * price representation (an order-flow grid, bricks, …). Axes, grid, volume,
     * indicators and drawings are unaffected.
     */
    basePainting?: 'candles' | 'none';
    /**
     * Whether the style can draw a symbol, from the facts its data source states about it
     * (`SymbolFacts`: `ohlc: false` for one value per bar, `volume: false` for no volume).
     * Return `false` and the style menus grey the type out for that symbol, and a chart set
     * to it shows a close-based style (a line) instead, without changing the chosen style:
     * the type comes back on the next symbol it supports. Only called once the facts are
     * known; while they are not, every type applies. Absent ⇒ the type applies to every
     * symbol. Keep it pure and cheap: the chart calls it on every symbol change and menu build.
     */
    supports?(facts: Readonly<SymbolFacts>): boolean;
}
/**
 * A declarative visibility condition on another row's CURRENT value (stored value,
 * or that row's `defval` while unset). Pure data — the dialog evaluates it live as
 * the user edits, so dependent rows appear/disappear without a rebuild.
 * `anyOf` wins over `equals` when both are given.
 */
interface SettingsRowCondition {
    key: string;
    equals?: boolean | string | number;
    anyOf?: readonly (boolean | string | number)[];
}
/** A row's visibility gate: one condition, or several AND-ed together. */
type SettingsRowWhen = SettingsRowCondition | readonly SettingsRowCondition[];
/**
 * An inline color swatch on a toggle row — the color(s) the toggle governs, edited
 * right on the toggle's row (dimmed while the toggle is off) instead of a
 * conditionally revealed row below. Each swatch stores under its own bag key.
 */
interface SettingsRowSwatch {
    key: string;
    /** Names the color for the swatch's tooltip (`'Highlight color'`). */
    label: MessageLike;
    defval: string;
    /**
     * Optional visibility gate, evaluated live against the values bag exactly like a
     * row's own `when` — lets one toggle row swap its swatch set as another value
     * changes (a mode's two colors while it is on, its one alternative while off).
     * A gated swatch is EXEMPT from the toggle-off dim: its gate already says when
     * it matters, and it may exist specifically for the off state.
     */
    when?: SettingsRowWhen;
}
/**
 * An inline LINE-WIDTH dropdown on a toggle row — sits beside the row's color
 * swatches (dimmed with them while the toggle is off) and stores a px number under
 * its own bag key. The control offers the classic drawing-bar weights (1–5 px),
 * each option previewed as a line at that weight.
 */
interface SettingsRowWidth {
    key: string;
    /** Names the control for its tooltip (`'Line width'`). */
    label: MessageLike;
    defval: number;
}
/**
 * An inline NUMBER input on a toggle row — sits AHEAD of the row's color swatches
 * (dimmed with them while the toggle is off) and stores a number under its own bag
 * key. For the one value the toggle governs (a percent, a count) — the declarative
 * alternative to a separate `number` row gated on the toggle.
 */
interface SettingsRowInlineNumber {
    key: string;
    /** Names the input for its tooltip (`'Value area (%)'`). */
    label: MessageLike;
    defval: number;
    min?: number;
    max?: number;
    step?: number;
}
/**
 * A select option: a bare string (value = label) or a `[value, label]` pair when the
 * stored id differs from the human-readable text (`['bidAskProfile', 'Bid × Ask Profile']`).
 */
type SettingsSelectOption = string | readonly [value: string, label: MessageLike];
/**
 * One INLINE CONTROL on a composite `row` — the composable unit every value row is
 * made of. Each keyed control stores under its own bag key; `label` names it for the
 * control's tooltip. A control may carry its own `when` gate (same shape as a row's),
 * evaluated live against the values bag: a gated control appears/disappears as other
 * values change, and is EXEMPT from the row's toggle-off dim — its gate already says
 * when it matters, and it may exist specifically for the off state.
 *
 * - `number` — a compact number input. With `placeholder`, an input at the default
 *   value renders EMPTY showing it, and clearing the input stores the default back —
 *   the placeholder names the "unset" state (`'Off'` for a 0-disables bound).
 * - `color` — a color swatch opening the shared color picker.
 * - `width` — a line-width dropdown (the classic drawing-bar 1–5 px weights, each
 *   option previewed as a line at that weight), storing a px number.
 * - `select` — a dropdown over {@link SettingsSelectOption}s.
 * - `hint` — display-only dimmed text between controls (the `–` of a min–max pair,
 *   a unit); stores nothing.
 */
type SettingsInlineControl = {
    kind: 'number';
    key: string;
    label: MessageLike;
    defval: number;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: MessageLike;
    when?: SettingsRowWhen;
} | {
    kind: 'color';
    key: string;
    label: MessageLike;
    defval: string;
    when?: SettingsRowWhen;
} | {
    kind: 'width';
    key: string;
    label: MessageLike;
    defval: number;
    when?: SettingsRowWhen;
} | {
    kind: 'select';
    key: string;
    label: MessageLike;
    options: readonly SettingsSelectOption[];
    defval: string;
    when?: SettingsRowWhen;
} | {
    kind: 'hint';
    text: MessageLike;
};
/**
 * One declarative settings row. To add a NEW inline control kind, see
 * docs/architecture/settings-rows.md.
 *
 * `heading` titles a GROUP of rows: the heading plus everything after it up to the next
 * heading. In a flat `rows` section headings render as inline group titles; inside
 * `instances`/`subsections` (or a `layout: 'grouped'` section) they become entries of
 * the pane's group TOC (see {@link ChartTypeSettingsSection}).
 *
 * `header` is an in-pane subgroup title: same visual as a flat heading, but inside a
 * structured pane it stays in the rows column (does NOT become a TOC entry). Use it to
 * cluster rows inside a TOC group (e.g. Colors / Values under Display).
 *
 * `row` is the COMPOSITE form every value row reduces to: a label, an optional leading
 * `toggle` (a checkbox storing a boolean under `toggle.key`; while off, the row's
 * controls dim and ignore input), and an ordered list of {@link SettingsInlineControl}s
 * in the control column. Any mix of control kinds in any order — no per-combination
 * SDK surface.
 *
 * The remaining kinds are SUGAR over `row` (see {@link normalizeSettingsRow}):
 * - `toggle` — a checkbox row; optional inline `number`, color `colors`, and `width`
 *   attachments render in that order.
 * - `number` / `color` / `select` — one control on its own row.
 * - `range` — a min–max pair (two number inputs under `minKey`/`maxKey`, both seeded
 *   from the shared `defval`, with `placeholder` naming the unset state).
 *
 * Any row may carry `when` — it is shown only while the condition holds.
 */
type SettingsRowDescriptor = {
    kind: 'heading';
    label: MessageLike;
    when?: SettingsRowWhen;
} | {
    kind: 'header';
    label: MessageLike;
    when?: SettingsRowWhen;
} | {
    kind: 'row';
    label: MessageLike;
    toggle?: {
        key: string;
        defval: boolean;
    };
    controls: readonly SettingsInlineControl[];
    when?: SettingsRowWhen;
} | {
    kind: 'toggle';
    key: string;
    label: MessageLike;
    defval: boolean;
    number?: SettingsRowInlineNumber;
    colors?: readonly SettingsRowSwatch[];
    width?: SettingsRowWidth;
    when?: SettingsRowWhen;
} | {
    kind: 'number';
    key: string;
    label: MessageLike;
    defval: number;
    min?: number;
    max?: number;
    step?: number;
    when?: SettingsRowWhen;
} | {
    kind: 'color';
    key: string;
    label: MessageLike;
    defval: string;
    when?: SettingsRowWhen;
} | {
    kind: 'select';
    key: string;
    label: MessageLike;
    options: readonly SettingsSelectOption[];
    defval: string;
    when?: SettingsRowWhen;
} | {
    kind: 'range';
    label: MessageLike;
    minKey: string;
    maxKey: string;
    defval: number;
    min?: number;
    max?: number;
    step?: number;
    placeholder?: MessageLike;
    when?: SettingsRowWhen;
};
/** A value-carrying row (everything except the key-less `heading`/`header` titles). */
type SettingsValueRow = Exclude<SettingsRowDescriptor, {
    kind: 'heading' | 'header';
}>;
/** The canonical row shape every {@link SettingsValueRow} reduces to (the `row` kind's fields). */
interface NormalizedSettingsRow {
    label: MessageLike;
    toggle?: {
        key: string;
        defval: boolean;
    };
    controls: readonly SettingsInlineControl[];
    when?: SettingsRowWhen;
}
/**
 * Reduce a value row to the canonical composite shape — the ONE contract view layers
 * render and the persistence layer enumerates. The sugar kinds map exactly onto their
 * historical rendering: `toggle` attachments in number → colors → width order, `range`
 * as two number controls around a `–` hint (placeholder semantics preserved).
 */
declare function normalizeSettingsRow(r: SettingsValueRow): NormalizedSettingsRow;
/** One value a settings row stores: its bag key, runtime type, and registry default. */
interface SettingsRowValueKey {
    key: string;
    type: 'boolean' | 'number' | 'string';
    defval: boolean | number | string;
}
/**
 * EVERY key a row stores (toggle key + each keyed inline control), with its expected
 * type and default — the single enumeration the dialog seeds from and the factory
 * reset restores, so no key can fall through a kind-specific walk.
 */
declare function settingsRowValueKeys(r: SettingsRowDescriptor): SettingsRowValueKey[];
/**
 * One tab of a section's INSTANCE STRIP — a repeated block of settings (e.g. one of
 * several overlays a style can paint). The dialog shows a tab per PRESENT instance,
 * a dashed `+` that turns on the next absent one, and an `×` on the active removable
 * tab that turns it off. Presence is the boolean at `enableKey` (stored in the same
 * per-type bag as every other value); an instance without `enableKey` is always
 * present and not removable — the base instance.
 */
interface ChartTypeSettingsInstance {
    label: MessageLike;
    /** Boolean bag key controlling presence; omitted = always present, not removable. */
    enableKey?: string;
    rows: readonly SettingsRowDescriptor[];
}
/** An indented sub-entry under the section's rail tab, with its own pane of rows. */
interface ChartTypeSettingsSubsection {
    title: MessageLike;
    rows: readonly SettingsRowDescriptor[];
    /**
     * Boolean bag key that masters this pane. While it is false, every row EXCEPT the
     * one whose `key` matches stays visible but grayed out (not hidden) — so users can
     * still browse and preview settings with the feature off. The matching toggle is
     * typically the first row of the Display group.
     */
    enableKey?: string;
}
/**
 * A chart type's settings tab. Two forms:
 *
 * - **Flat**: `rows` only — rendered as one scrollable pane, `heading` rows as inline
 *   group titles (the historical form). `layout: 'grouped'` upgrades the same rows to
 *   the GROUP TOC presentation (below) without declaring an instance strip.
 * - **Structured**: `instances` (and optionally `subsections`) — the pane opens with an
 *   instance TAB STRIP, and each instance's rows are organized by a GROUP TOC on the
 *   left of the pane (right of the dialog's tab rail) built from its `heading` rows
 *   (rows before the first heading always show above the groups; selecting a TOC entry
 *   shows only that group's rows). `subsections` add indented rail entries under the
 *   section's tab, each a pane with the same TOC treatment. A TOC entry hides itself
 *   while every row of its group is hidden by `when` gates.
 *
 * All values — every instance and subsection included — live in the ONE per-type bag
 * (`config.chartTypes[<id>]`), so consumers keep receiving a single flat object.
 */
interface ChartTypeSettingsSection {
    /** Section heading in the settings dialog. */
    title: MessageLike;
    /** Flat form. Ignored when `instances` is declared. */
    rows?: readonly SettingsRowDescriptor[];
    /** How `rows` are presented: `'flat'` (default) renders headings as inline group
     *  titles; `'grouped'` promotes them to a group TOC beside the rows (the structured
     *  pane's presentation, without an instance strip). Ignored with `instances`. */
    layout?: 'flat' | 'grouped';
    /** Structured form: the pane's instance tab strip. */
    instances?: readonly ChartTypeSettingsInstance[];
    /** Indented sub-entries under this section's rail tab. */
    subsections?: readonly ChartTypeSettingsSubsection[];
    /** `'active'` (default): shown only while this chart type is the active price style;
     *  `'always'`: shown whenever the type is registered. */
    visibility?: 'always' | 'active';
    /** Rail position: `'end'` (default, after the built-in tabs) or `'after-symbol'`
     *  (directly under the Symbol tab). Subsections follow their parent. */
    placement?: 'after-symbol' | 'end';
}
/** Register (or replace) a chart type. */
declare function registerChartType(def: ChartTypeDefinition): void;
/** Remove a registered chart type (built-ins can be re-registered via their register fn). */
declare function unregisterChartType(id: string): void;
/** The definition behind a price-style id, or undefined for built-ins/unknown ids. */
declare function chartType(id: unknown): ChartTypeDefinition | undefined;
/** Every registered chart type (registration order). */
declare function chartTypes(): ChartTypeDefinition[];
/** Ids that act as extended-ticker modifiers (`"SYM;id"`). */
declare function tickerModifierIds(): string[];

/**
 * Parse a tick-count timeframe (`1T`, `100T`, `1000T`, or bare `T` ⇒ `1`). Returns the
 * positive integer tick count, or `null` for any non-tick timeframe.
 */
declare function parseTickTimeframe(timeframe: string): number | null;
/** Whether `timeframe` is a tick-count resolution (`1T`, `100T`, …). */
declare function isTickTimeframe(timeframe: string): boolean;
/**
 * Whether bars on `timeframe` have no fixed wall-clock duration (tick bars, etc.).
 * Fixed-duration assumptions — time-based gap healing, bar-close countdowns, and
 * time-keyed deduplication — stand down for these series.
 */
declare function isVariableDurationTimeframe(timeframe: string): boolean;
/**
 * Bar duration in ms for a Vela timeframe: a bare number is **minutes** (Pine
 * resolution — `60` = 1h, `240` = 4h), `D`/`W`/`M` are the named periods, also with a
 * count (`1D`, `2W`, `3M`, `12M`), `S` counts seconds (`30S`), and the `15m`/`4h`/`1d`/`1w`
 * aliases are also accepted. Letters are case-insensitive except `M` (month) vs `m`
 * (minute). Falls back to 1h for anything unparsed.
 */
declare function timeframeToMs(timeframe: string): number;

/**
 * Context handed to a {@link SeriesAdapter} for one `(provider, ticker, timeframe)` request.
 * Everything needed to read base data, metadata, or extended provider surfaces without
 * reaching into feed internals.
 */
interface SeriesAdapterContext {
    /** Registered provider name (e.g. `'binance'`). */
    readonly providerName: string;
    /** The registered provider instance (narrow with a type guard for extended feeds). */
    readonly provider: DataProvider;
    /** Provider-scoped ticker (without the `provider:` prefix). */
    readonly ticker: string;
    /** Requested chart timeframe (e.g. `'100T'`). */
    readonly timeframe: string;
    /** Trading session (`'regular'` | `'extended'`), when declared. */
    readonly session?: string;
    /** Cached per-symbol metadata from the owning provider, when available. */
    symbolInfo(): Promise<SymbolInfo | undefined>;
}
/**
 * A pluggable series adapter for custom or synthetic timeframe families (tick bars, volume
 * bars, range bars, derived resolutions). Registered globally through
 * {@link registerSeriesAdapter}; `MultiProviderFeed` consults registered adapters before
 * calling a provider's `getBars`/`subscribe` directly.
 */
interface SeriesAdapter {
    /** Stable id — re-registering an id replaces the previous adapter. */
    readonly id: string;
    /** Return true when this adapter handles `(timeframe, provider)` (first match wins). */
    matches(timeframe: string, provider: DataProvider, providerName: string): boolean;
    /** Fetch historical bars for the adapted series. Throw `DataUnavailableError` to refuse permanently. */
    getBars(ctx: SeriesAdapterContext, range: BarRange): Promise<OHLCV[]>;
    /** Stream live updates for the adapted series. Absent ⇒ the feed polls `getBars`. */
    subscribe?(ctx: SeriesAdapterContext, onBar: (bar: OHLCV) => void): Unsubscribe;
    /** Optional per-symbol availability check powering timeframe picker gating. */
    supports?(ctx: Omit<SeriesAdapterContext, 'timeframe'>, timeframe: string): boolean | Promise<boolean>;
}
/**
 * Register a {@link SeriesAdapter}. Re-registering the same `id` replaces it. Returns a
 * disposer that removes this registration (leaving any later replacement intact).
 */
declare function registerSeriesAdapter(adapter: SeriesAdapter): () => void;
/** Remove a registered series adapter by id. */
declare function unregisterSeriesAdapter(id: string): void;
/** All currently registered series adapters, in registration order. */
declare function seriesAdapters(): readonly SeriesAdapter[];

/** Things that need a stable id within an indicator instance. */
type IdentifiableKind = SeriesKind | 'fill' | 'background' | 'hline' | 'line' | 'box' | 'label' | 'polyline' | 'linefill' | 'table';
/**
 * Content-addressed id for a plotted element, stable across re-runs of
 * identical source.
 *
 * Deliberately NOT an engine's own callsite counter: those renumber whenever the
 * source is edited (insert a plot near the top and every downstream callsite
 * shifts), so keying persistent state on one would silently rebind to the wrong
 * element. The ordinal disambiguates multiple plots that share a title within one
 * indicator. Every engine MUST mint its series ids through this — it is the
 * identity contract value patches are keyed by.
 */
declare function stableSeriesId(parts: {
    instanceId: string;
    kind: IdentifiableKind;
    title: string;
    ordinal: number;
}): string;

/**
 * Whether `style` can draw the symbol `facts` describe. `null`/`undefined` facts (not known
 * yet, or a source that states none) ⇒ every style applies. A registered type answers
 * through its `supports` predicate (a throwing one counts as supporting).
 */
declare function priceStyleApplies(style: string, facts: Readonly<SymbolFacts> | null | undefined): boolean;
/**
 * The style a chart set to `style` draws for the symbol `facts` describe: `style` itself
 * when it applies, else the first of {@link PRICE_STYLE_FALLBACKS} among `known` (the style
 * ids that exist right now) that applies, else `style` (nothing better to offer).
 */
declare function shownPriceStyle(style: string, facts: Readonly<SymbolFacts> | null | undefined, known: readonly string[]): string;

/**
 * Register default values for renderer features — every chart built afterwards applies
 * them once its renderer is mounted, before the first paint. Keys are renderer feature
 * names (`chart.renderer.features`); one the active renderer does not support is warned
 * about and ignored, exactly as `renderer.set()` does.
 *
 * These are DEFAULTS, not locks: an explicit `chart.renderer.set(...)`, an applied config
 * template, or the user's own in-chart settings still win afterwards. Charts already
 * built are untouched. Returns a disposer that removes precisely the values it set
 * (leaving any later re-registration of the same key in place).
 */
declare function registerRendererDefaults(values: Record<string, unknown>): () => void;
/** Drop registered defaults by key — all of them when called with no arguments. */
declare function unregisterRendererDefaults(...keys: string[]): void;
/** The defaults a chart applies at construction (empty when no plugin registered any). */
declare function rendererDefaults(): Record<string, unknown>;

/** The shell options a plugin may give a default. */
interface ShellDefaults {
    /** The right-edge toolbar (`sidebar`), as a shell option takes it. */
    sidebar?: boolean | SidebarComposition;
    /** Default timeframe presets for shells constructed without an explicit `timeframes` option. */
    timeframes?: readonly string[];
}
/**
 * Register defaults for shell options. Every shell built afterwards uses one where its host
 * gave no value for that option: the host's own value, `false` included, always wins. Shells
 * already built are untouched. Returns a disposer that removes precisely the values it set
 * (leaving any later re-registration of the same key in place).
 */
declare function registerShellDefaults(values: ShellDefaults): () => void;
/** Drop registered defaults by key — all of them when called with no arguments. */
declare function unregisterShellDefaults(...keys: Array<keyof ShellDefaults>): void;
/** The defaults a shell applies at construction (empty when no plugin registered any). */
declare function shellDefaults(): ShellDefaults;

/** Everything a layer needs to paint one frame. */
interface RendererLayerArgs {
    /** The chart's CURRENT view bars (post bar-transform). */
    bars: readonly OHLCV[];
    /** The layer's channel payload (last `setNativeData(id, …)` push; undefined before the first). */
    data: unknown;
    /** The type's SDK settings values (`<id>-settings` channel; {} before any edit). */
    settings: Record<string, unknown>;
    /** Time ranges still loading (`<id>-pending` channel) — skeleton/reveal UIs. */
    pending: ReadonlyArray<readonly [number, number]>;
    coords: CoordinateSystem;
    /** The scale + bounds of the pane the layer paints on: the pane of the native
     *  indicator that owns this channel (its type equals the layer id), else the price
     *  pane — so a layer-backed indicator moved to its own pane takes its layer along. */
    scale: PriceScale;
    bounds: PaneBounds;
    theme: VelaTheme;
    /** The active price style — layers tied to a chart type gate their visibility on it. */
    priceStyle: string;
    /** Frame clock (ms) for pulses/fades; monotonic within a session. */
    nowMs: number;
    /** Plot-relative pointer position, or null when the pointer is off the plot. Layers
     *  that hover-test set `repaintOnCursor` on their definition so pointer moves repaint
     *  them (only data-tier frames repaint layers otherwise). */
    cursor: {
        x: number;
        y: number;
    } | null;
    /** The chart's translator: `i18n.t(msg(...))` for text a layer paints, and
     *  `i18n.format` for its numbers and dates, in the chart's locale. */
    i18n: Translator;
}
/** How a layer dims/slims the BASE painting under it (see
 *  {@link RendererLayerInstance.modulateBase}). Omitted fields keep their defaults. */
interface BasePaintingModulation {
    /** Candle body width multiplier, (0..1] (1 = full width). */
    candleBodyScale?: number;
    /** Candle body-fill opacity, [0..1] (wick + border keep their own opacity). */
    candleBodyAlpha?: number;
    /** Gridline opacity, [0..1] (fade the grid as a reveal-under layer opens). */
    gridAlpha?: number;
}
/** One live layer instance (per mounted renderer). */
interface RendererLayerInstance {
    /** The renderer created (and owns) this transparent canvas — keep the reference, paint into it. */
    mount(canvas: HTMLCanvasElement): void;
    /** Paint one frame. Always clear/redraw your own canvas — the renderer never clears it for you. */
    render(args: RendererLayerArgs): void;
    /** Return true while the layer needs CONTINUOUS frames (a pulse/fade) — keeps the animator alive. */
    animating?(): boolean;
    /**
     * How the base painting (candles, grid) should be dimmed/slimmed under this layer for
     * the CURRENT frame — a gradual counterpart of the chart type's all-or-nothing
     * `basePainting: 'none'`. Called after `render` on every mounted layer that implements
     * it (chart-type and overlay alike); returning null (or omitting the method) is no
     * opinion. When several layers speak, each field keeps the strongest (smallest)
     * request. Values are clamped by the renderer.
     */
    modulateBase?(args: RendererLayerArgs): BasePaintingModulation | null;
    /** The renderer unmounted — release everything (the canvas itself is removed by the renderer). */
    destroy?(): void;
}
/** One registered layer kind. */
interface RendererLayerDefinition {
    /** The layer id — also its native-data channel (`setNativeData(id, …)` / `id + '-pending'`). */
    id: string;
    /** Stacking: `'below-data'` = behind the candles (reveal-under styles); `'above-data'` =
     *  over the candles, under the chrome/axes. Default `'above-data'`. A layer owned by a
     *  native indicator (its type equals the layer id) follows that indicator's z key in
     *  the pane stacking instead (`seriesOrder` / the object tree), mounting in front.
     *  Either way the gridlines stay BELOW every layer (they live on the backdrop canvas
     *  at the bottom of the pile) — no stacking puts a layer behind the grid. */
    placement?: 'below-data' | 'above-data';
    /** Repaint this layer when the pointer moves (hover hit-testing UIs). Off by default:
     *  pointer moves normally repaint only the crosshair overlay, not the layers. */
    repaintOnCursor?: boolean;
    /** Instance factory — called once per mounted renderer, plus once per mounted instance
     *  of a `multiInstance` native indicator whose type equals this id (each instance paints
     *  through its own layer instance and canvas, fed by its own channel). */
    create(): RendererLayerInstance;
}
/** Register (or replace) a renderer layer. Renderers mounted AFTER registration pick it up. */
declare function registerRendererLayer(def: RendererLayerDefinition): void;
declare function unregisterRendererLayer(id: string): void;
/** Every registered layer definition (registration order). */
declare function rendererLayers(): RendererLayerDefinition[];

export { shellDefaults as $, getDrawingType as A, type BarTransform as B, type ChartTypeDefinition as C, type DrawingTypeMeta as D, isTickTimeframe as E, isVariableDurationTimeframe as F, msg as G, normalizeSettingsRow as H, type IdentifiableKind as I, parseTickTimeframe as J, priceStyleApplies as K, registerChartType as L, type MessageValues as M, type NormalizedSettingsRow as N, registerDrawingType as O, registerLocale as P, registerRendererDefaults as Q, type RendererLayerArgs as R, type SettingsSelectOption as S, registerRendererLayer as T, registerSeriesAdapter as U, registerShellDefaults as V, registeredLocales as W, rendererDefaults as X, rendererLayers as Y, seriesAdapters as Z, settingsRowValueKeys as _, type BasePaintingModulation as a, shownPriceStyle as a0, stableSeriesId as a1, tickerModifierIds as a2, timeframeToMs as a3, unregisterChartType as a4, unregisterRendererDefaults as a5, unregisterRendererLayer as a6, unregisterSeriesAdapter as a7, unregisterShellDefaults as a8, withValues as a9, type ChartTypeSettingsInstance as b, type ChartTypeSettingsSection as c, type ChartTypeSettingsSubsection as d, type RendererLayerDefinition as e, type RendererLayerInstance as f, type SeriesAdapter as g, type SeriesAdapterContext as h, type SeriesDataEngine as i, type SeriesDataEngineHost as j, type SettingsInlineControl as k, type SettingsRowCondition as l, type SettingsRowDescriptor as m, type SettingsRowInlineNumber as n, type SettingsRowSwatch as o, type SettingsRowValueKey as p, type SettingsRowWhen as q, type SettingsRowWidth as r, type SettingsValueRow as s, type ShellDefaults as t, chartType as u, chartTypes as v, createDrawing as w, createTranslator as x, deserializeDrawing as y, drawingTypes as z };
