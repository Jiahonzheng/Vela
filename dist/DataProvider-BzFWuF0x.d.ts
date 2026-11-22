import { M as MessageLike, T as Translator, m as TextDirection, b as LocalizationOptions } from './types-CsUd831-.js';
import { ThemeSettings, UiTheme } from '@luxalgo/vela-ui/theme';

/**
 * Canonical time in Vela: Unix epoch **milliseconds**.
 *
 * This matches JS `Date` and the bar `openTime` every provider and scripting
 * engine speaks. Each renderer converts to its own unit at its boundary (a
 * second-based adapter divides by 1000).
 */
type Millis = number;

/** A single price bar. `time` is the bar's open time in epoch ms. */
interface OHLCV {
    time: Millis;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

/** Value-series kinds drawn as a connected/point series. */
type LineLikeKind = 'line' | 'area' | 'step' | 'histogram' | 'columns' | 'circles' | 'cross';
/**
 * All renderable series kinds. NOTE: `fill`, `background`, and `hline` are
 * intentionally NOT series kinds — they are modeled as overlays on a pane
 * (see scene.ts), and `barcolor` is a recolor of the price candles, not a
 * series.
 */
type SeriesKind = LineLikeKind | 'candle' | 'bar' | 'markers';
type LineStyle = 'solid' | 'dashed' | 'dotted';
/** A single point of a value series. `value: null` marks a gap (whitespace). */
interface SeriesPoint {
    time: Millis;
    value: number | null;
    /** Per-point color override (e.g. `plot(x, color = cond ? c1 : c2)`). */
    color?: string;
}
interface LineLikeStyle {
    color: string;
    width: number;
    lineStyle: LineStyle;
    /** Baseline for histogram/area; ignored by the line family. */
    base?: number;
}
interface CandleStyle {
    up: string;
    down: string;
    wickUp?: string;
    wickDown?: string;
    borderUp?: string;
    borderDown?: string;
}
/** Per-bar plotcandle/plotbar override (body / wick / border colours). */
interface CandleBarColor {
    color?: string;
    wickColor?: string;
    borderColor?: string;
}
interface MarkerPoint {
    time: Millis;
    position: 'aboveBar' | 'belowBar' | 'inBar';
    /** Neutral shape token (e.g. 'arrowUp', 'circle', 'square'); mapped per renderer. */
    shape: string;
    color: string;
    text?: string;
    size?: 'tiny' | 'small' | 'normal' | 'large' | 'huge';
}
/** A chart surface a series can show on (see {@link SeriesDisplay}). */
type SeriesSurface = 'pane' | 'priceScale' | 'legend' | 'dataWindow';
/**
 * Where a series shows, surface by surface. Every flag defaults to shown; `false` takes
 * the series off that one surface while it keeps anchoring fills:
 * - `pane` — painted in its pane;
 * - `priceScale` — present on the price scale: its values keep the pane's autoscale in
 *   view, and back any axis value label a renderer draws for it;
 * - `legend` — its value beside the indicator's legend title;
 * - `dataWindow` — its row in the data window.
 * A series off both the pane and the price scale has no on-chart extent, so it never
 * stretches the scale (see {@link seriesInScale}).
 */
interface SeriesDisplay {
    pane?: boolean;
    priceScale?: boolean;
    legend?: boolean;
    dataWindow?: boolean;
}
interface SeriesBase {
    /** Content-addressed, stable across re-runs of identical source (see identity.ts). */
    id: string;
    /** The series' name: its identity for engines and hosts (output keys, series ids). */
    title: string;
    /** What the legend, the data window and the settings show instead of {@link title}, in
     *  the chart's language. Absent ⇒ {@link title}. */
    displayTitle?: MessageLike;
    /** Pane this series belongs to; resolved by the orchestrator. */
    paneId: string;
    /** Declared draw-order intent; the renderer owns final z-ordering. */
    zOrder?: number;
    /**
     * `false` hides the series from every surface — a fill anchor that shows nowhere.
     * The shorthand form: when {@link display} is set it decides instead, surface by surface.
     */
    visible?: boolean;
    /** Per-surface visibility; absent ⇒ every surface {@link visible} allows. */
    display?: SeriesDisplay;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
interface LineLikeSeries extends SeriesBase {
    kind: LineLikeKind;
    /**
     * One entry per bar the indicator ran over, index-aligned to the bars: entry `i` draws on
     * bar `i`, whatever its `time`. Entries past the last bar draw on the bar slots after it,
     * one per slot, so a series shifted forward continues into the chart's right whitespace;
     * give them the times those slots would have. A gap is a `value: null` entry.
     */
    points: SeriesPoint[];
    style: LineLikeStyle;
}
interface CandleSeries extends SeriesBase {
    kind: 'candle' | 'bar';
    /** One entry per bar the indicator ran over, index-aligned like `points`. A bar with no
     *  candle is an empty slot (or an entry with `NaN` prices): it draws nothing, and the
     *  candles after it stay on their own bars. Never compact the array to drop it. */
    bars: OHLCV[];
    style?: Partial<CandleStyle>;
    /** Per-bar plotcandle/plotbar colours, aligned to `bars` by index (null ≡ use defaults). */
    barColors?: Array<CandleBarColor | null>;
}
interface MarkerSeries extends SeriesBase {
    kind: 'markers';
    markers: MarkerPoint[];
}
type SeriesSpec = LineLikeSeries | CandleSeries | MarkerSeries;
/** Whether a series shows on `surface`: its `display` flag when it carries one, else its `visible` shorthand. */
declare function seriesShownOn(spec: Pick<SeriesSpec, 'visible' | 'display'>, surface: SeriesSurface): boolean;
/**
 * Whether a series takes part in its pane's autoscale: it is painted there, or its value
 * sits on the price scale. A series that only reports a value (legend, data window) has
 * nothing on the chart to keep in view and must not stretch the scale.
 */
declare function seriesInScale(spec: Pick<SeriesSpec, 'visible' | 'display'>): boolean;

/**
 * Renderer-neutral models for Pine drawing objects (`line.new`, `box.new`, …).
 * Coordinates are kept in their Pine form, tagged by {@link DrawingXLoc}: the
 * renderer converts a bar index or epoch-ms time to a pixel via the time scale.
 */
/** How a drawing's x-coordinates are interpreted (Pine `xloc`). */
type DrawingXLoc = 'bar_index' | 'bar_time';
/** Pine `extend`: which side(s) the drawing runs out to the chart edge. */
type DrawingExtend = 'none' | 'left' | 'right' | 'both';
type BoxTextSize = 'auto' | 'tiny' | 'small' | 'normal' | 'large' | 'huge';
type BoxHAlign = 'left' | 'center' | 'right';
type BoxVAlign = 'top' | 'center' | 'bottom';
type BoxFontFamily = 'default' | 'monospace';
/**
 * A Pine `line.new(...)`. `x1/x2` are bar indices (xloc `bar_index`) or epoch ms
 * (xloc `bar_time`); `y1/y2` are prices.
 */
interface DrawingLine {
    id: string;
    paneId: string;
    xloc: DrawingXLoc;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    extend: DrawingExtend;
    /** Stroke color. `undefined` → use the renderer's default foreground color. */
    color?: string;
    /** `na` color → the line exists but is not stroked (e.g. a linefill anchor). */
    invisible: boolean;
    /** Pine line width in px (uncapped, unlike a series `lineWidth`). */
    width: number;
    style: LineStyle;
    /** Arrowhead at the first point (`style_arrow_left` / `style_arrow_both`). */
    arrowLeft: boolean;
    /** Arrowhead at the second point (`style_arrow_right` / `style_arrow_both`). */
    arrowRight: boolean;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** A Pine `box.new(...)`. `left/right` follow `xloc`; `top/bottom` are prices. */
interface DrawingBox {
    id: string;
    paneId: string;
    xloc: DrawingXLoc;
    left: number;
    top: number;
    right: number;
    bottom: number;
    extend: DrawingExtend;
    /** Fill color (may carry alpha). `undefined` → no fill (`na`). */
    bgColor?: string;
    /** Border color. `undefined` → no border (`na`). */
    borderColor?: string;
    borderWidth: number;
    borderStyle: LineStyle;
    /** Box text. `undefined`/empty → no text drawn. */
    text?: string;
    /** Text color. `undefined` → auto-contrast against the fill. */
    textColor?: string;
    textSize: BoxTextSize;
    hAlign: BoxHAlign;
    vAlign: BoxVAlign;
    /** `text.wrap_auto` → wrap to the box width; otherwise single line per `\n`. */
    wrap: boolean;
    fontFamily: BoxFontFamily;
    bold: boolean;
    italic: boolean;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** Pine `label.style_*` (the bubble/pointer variants and the point-marker shapes). */
type LabelStyle = 'label_up' | 'label_down' | 'label_left' | 'label_right' | 'label_center' | 'label_lower_left' | 'label_lower_right' | 'label_upper_left' | 'label_upper_right' | 'circle' | 'square' | 'diamond' | 'flag' | 'arrowup' | 'arrowdown' | 'triangleup' | 'triangledown' | 'cross' | 'xcross' | 'text_outline' | 'none';
/**
 * Where a label/marker anchors vertically. Pine `yloc` (price/abovebar/belowbar)
 * plus the `plotshape` pane-relative `location.top`/`location.bottom`.
 */
type LabelYLoc = 'price' | 'abovebar' | 'belowbar' | 'top' | 'bottom';
/** A Pine `label.new(...)`. `x` follows `xloc`; `y` is a price (used when yloc='price'). */
interface DrawingLabel {
    id: string;
    paneId: string;
    xloc: DrawingXLoc;
    x: number;
    y: number;
    yloc: LabelYLoc;
    text?: string;
    style: LabelStyle;
    /** Bubble / marker color. `undefined` → renderer default. */
    color?: string;
    textColor?: string;
    size: BoxTextSize;
    textAlign: BoxHAlign;
    tooltip?: string;
    fontFamily: BoxFontFamily;
    /** Pine `text_formatting` — bold/italic text, matching the box text options. */
    bold?: boolean;
    italic?: boolean;
    /** na bubble/marker color → render text only (no bubble/shape fill). */
    noFill?: boolean;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** One vertex of a polyline (Pine `chart.point`). `x` follows `xloc`; `price` is y. */
interface PolylinePoint {
    xloc: DrawingXLoc;
    x: number;
    price: number;
}
/** A Pine `polyline.new(...)` — a multi-point path, optionally curved and/or closed. */
interface DrawingPolyline {
    id: string;
    paneId: string;
    points: PolylinePoint[];
    curved: boolean;
    closed: boolean;
    /** Stroke color. `undefined` → no stroke. */
    lineColor?: string;
    /** Fill color (closed paths). `undefined` → no fill. */
    fillColor?: string;
    lineWidth: number;
    lineStyle: LineStyle;
    /** Arrowheads at segment starts/ends (`line.style_arrow_*`). */
    arrowLeft: boolean;
    arrowRight: boolean;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** A Pine `linefill.new(line1, line2, color)` — the band between two lines. */
interface DrawingLinefill {
    id: string;
    paneId: string;
    line1: DrawingLine;
    line2: DrawingLine;
    /** Fill color. `undefined` → nothing drawn. */
    color?: string;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** Pine `position.*` — which chart corner/edge a table anchors to. */
type TablePosition = 'top_left' | 'top_center' | 'top_right' | 'middle_left' | 'middle_center' | 'middle_right' | 'bottom_left' | 'bottom_center' | 'bottom_right';
/** One `table.cell(...)`. */
interface TableCell {
    text?: string;
    textColor?: string;
    bgColor?: string;
    hAlign: BoxHAlign;
    vAlign: BoxVAlign;
    /** A named size, or Pine's integer `text_size` as a raw pixel value. */
    textSize: BoxTextSize | number;
    fontFamily: BoxFontFamily;
    tooltip?: string;
    bold: boolean;
    italic: boolean;
    /** Cell width as a percent of the pane's width (absent/0 = size to content). */
    width?: number;
    /** Cell height as a percent of the pane's height (absent/0 = size to content). */
    height?: number;
    /** A non-origin cell absorbed by a `table.merge_cells` region → not rendered.
     *  Engines may also (spuriously) stamp this on the merge ORIGIN — renderers must
     *  resolve visibility against `DrawingTable.merges`, not this flag alone. */
    merged?: boolean;
}
/** A `table.merge_cells` region (inclusive, in column/row coordinates). */
interface TableMerge {
    startCol: number;
    startRow: number;
    endCol: number;
    endRow: number;
}
/** A Pine `table.new(...)` — a DOM-overlay grid anchored to a chart corner. */
interface DrawingTable {
    id: string;
    paneId: string;
    position: TablePosition;
    columns: number;
    rows: number;
    bgColor?: string;
    frameColor?: string;
    frameWidth: number;
    borderColor?: string;
    borderWidth: number;
    /** Row-major: `cells[row][col]`; entries may be null (empty cell). */
    cells: Array<Array<TableCell | null>>;
    /** Merged-cell regions (`table.merge_cells`); origin spans, others are dropped. */
    merges: TableMerge[];
    /** `force_overlay` → anchor to the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}

type PaneKind = 'price' | 'study';
interface Pane {
    id: string;
    kind: PaneKind;
    /** Display order, top-to-bottom; the price pane is conventionally order 0. */
    order: number;
    /** Relative height weight among panes (the renderer normalizes). Omitted keeps the
     *  weight an existing pane already has; a new pane gets the renderer's default. */
    heightWeight?: number;
    title?: string;
}
/** One bar's vertical gradient stop for a gradient `fill()` (color@price). */
interface FillGradientStop {
    topValue: number;
    bottomValue: number;
    topColor: string;
    bottomColor: string;
}
/** A band fill between two value series (Pine `fill(plot1, plot2, ...)`). */
interface Fill {
    id: string;
    paneId: string;
    /** RESOLVED series ids (the orchestrator resolves Pine plot refs to ids). */
    fromSeriesId: string;
    toSeriesId: string;
    /** Flat band color (no per-bar variation). */
    color?: string;
    /** Per-bar solid color (conditional fills), aligned to the anchor points by index. */
    colors?: Array<string | null>;
    /** Per-bar vertical gradient (gradient-fill overload), aligned by index. */
    gradient?: Array<FillGradientStop | null>;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** A vertical background tint over a time span (Pine `bgcolor()` / session bands). */
interface Background {
    id: string;
    paneId: string;
    /** Inclusive start, epoch ms. */
    from: Millis;
    /** Exclusive end, epoch ms. */
    to: Millis;
    color: string;
    /** `force_overlay` → render on the price pane regardless of the indicator's pane. */
    overlay?: boolean;
}
/** A horizontal price line (Pine `hline()`). */
interface PriceLine {
    id: string;
    paneId: string;
    price: number;
    color?: string;
    lineStyle?: LineStyle;
    width?: number;
    title?: string;
    /** {@link title} in the chart's language. Absent ⇒ {@link title}. */
    displayTitle?: MessageLike;
}
/**
 * The renderer-neutral, full description of what to draw. In the engine-owned
 * design the orchestrator usually drives the renderer per-indicator
 * (`mountIndicator`), but `Scene` is the conceptual aggregate the reconciler
 * diffs against.
 */
interface Scene {
    bars: OHLCV[];
    panes: Pane[];
    series: SeriesSpec[];
    fills: Fill[];
    backgrounds: Background[];
    priceLines: PriceLine[];
    lines?: DrawingLine[];
    boxes?: DrawingBox[];
    labels?: DrawingLabel[];
    polylines?: DrawingPolyline[];
    linefills?: DrawingLinefill[];
    tables?: DrawingTable[];
}

/**
 * One order execution of a strategy indicator — the unit painted on the chart as a
 * trade marker (direction arrow + optional label/quantity text + a tick at the exact
 * fill price). Executions anchor to their FILL bar and always render on the PRICE
 * pane, whatever pane the indicator's plots landed on: a fill price only means
 * something on the price scale.
 */
interface TradeExecution {
    /** Fill bar (bar open time, epoch ms) — the bar the marker unit anchors to. */
    time: Millis;
    /** Exact fill price — anchors the price tick on the bar's edge. */
    price: number;
    /** A buy paints an up arrow below the bar; a sell a down arrow above it. */
    side: 'buy' | 'sell';
    /**
     * Entries paint a plain arrow in the position side's entry color; exits paint a
     * capped arrow (a bar between tip and price bar) in the shared exit color.
     */
    kind: 'entry' | 'exit';
    /** Text line next to the arrow — the order id, or its comment when one was given. */
    label?: string;
    /** Filled quantity (magnitude); painted signed (`+` for buys, `-` for sells). */
    qty?: number;
    /** Shared by the executions of one round-trip (an entry and its exits). */
    tradeId?: string;
}

/**
 * Renderer-neutral indicator input schema — Vela's own shape, owned here so no
 * scripting language's own input model leaks into core (each engine maps its
 * declarations onto this at its boundary). Drives the renderer's settings dialog
 * (the gear settings UI).
 */

type InputType = 'int' | 'float' | 'bool' | 'string' | 'source' | 'color' | 'price' | 'time' | 'session' | 'timeframe' | 'symbol' | 'text_area';
type InputValue = number | string | boolean;
/**
 * The display side of an input: what the settings dialog and the legend SHOW, in the
 * chart's language. The input's own `title`, `group` and `options` stay what they are
 * (a script reads them, layouts persist the option values), and this side-car only
 * changes how they read. Each field is optional and falls back to the identity field.
 */
interface InputDisplay {
    /** Shown instead of `title`. */
    title?: MessageLike;
    /** Shown instead of `tooltip`. */
    tooltip?: MessageLike;
    /** Shown instead of `group` as the section heading. */
    group?: MessageLike;
    /** Shown label per stored option value (`'Close'` → a translated "Close"). Values
     *  without an entry show as themselves. */
    options?: Readonly<Record<string, MessageLike>>;
}
/**
 * A multi-select string input: the settings dialog shows its `options` as checkboxes in one
 * dropdown. The stored value stays ONE string, the checked options joined by `separator` in
 * `options` order (`'On bar close, On order fill'`), so layouts, `setInputs` and saved state
 * handle it like any string input.
 */
interface InputMultiple {
    /** Joins the checked options in the stored value, such as `', '`. */
    separator: string;
    /** Options that are always checked: their checkboxes are disabled, and the value always
     *  holds them. */
    locked?: readonly string[];
}
/** A help mark on a group's section heading (see {@link InputSchema.groupHelp}). */
interface InputGroupHelp {
    /** The mark's tooltip and accessible name. */
    text?: MessageLike;
    /** Opened in a new tab when the mark is clicked. Only `http:` and `https:` URLs are
     *  honoured; any other URL leaves the mark a tooltip only. */
    url?: string;
}
/**
 * Host-provided symbol picker for the settings dialog's `input.symbol` control. Called when the
 * user activates the field: the host opens its own symbol-selection UI (e.g. the app's ticker
 * menu) seeded with the `current` symbol, and reports the chosen one back through `onPick`. When
 * no picker is wired, `input.symbol` falls back to a plain text field.
 */
type SymbolPickerFn = (current: string, onPick: (symbol: string) => void) => void;
/** One visibility condition on another input's current value: `equals` matches a single
 *  value (a toggle, one dropdown choice), `anyOf` matches a set (several choices). */
interface InputCondition {
    key: string;
    equals?: InputValue;
    anyOf?: readonly InputValue[];
}
/** An input's visibility gate: one condition, or several AND-ed together. */
type InputWhen = InputCondition | readonly InputCondition[];
/**
 * Evaluate a visibility gate against the dialog's resolved current values (an input's
 * stored value, else its `defval`). No gate ⇒ visible. Mirrors the chart-settings row
 * gate (`settingsRowVisible`) so both dialogs share one condition vocabulary.
 */
declare function inputVisible(when: InputWhen | undefined, values: Record<string, InputValue>): boolean;
interface InputSchema {
    /** Stable key used by `setInput()` — the engine's own variable id, falling back to `title`. */
    key: string;
    /** Display label shown in the settings dialog. */
    title: string;
    type: InputType;
    defval: InputValue;
    min?: number;
    max?: number;
    step?: number;
    /** Choices for a dropdown (`input.string(..., options=[...])`). */
    options?: readonly string[];
    /** Grouping label for the dialog layout. */
    group?: string;
    /** Inline grouping label (controls placed on one row). */
    inline?: string;
    /** Settings-dialog tab hosting this input; unset ⇒ the default "Inputs" tab. */
    tab?: string;
    /** Visibility gate: the input's row shows only while the condition(s) pass against
     *  the dialog's current values — re-evaluated live on every edit. Inputs sharing an
     *  `inline=` row show while ANY member's gate passes. A hidden input keeps its value. */
    when?: InputWhen;
    tooltip?: string;
    /** Translatable display text for this input (see {@link InputDisplay}). */
    display?: InputDisplay;
    /** Check several `options` at once (see {@link InputMultiple}). Read on a `string` input
     *  with `options` only. */
    multiple?: InputMultiple;
    /** A help mark beside this input's `group` heading (see {@link InputGroupHelp}). The first
     *  input of a group that carries one sets it; an input without a `group` shows none. */
    groupHelp?: InputGroupHelp;
}
/**
 * The DELTAS of a value bag against its schema's declaration defaults — what state
 * persistence stores (a default that later changes in the script must not stay frozen
 * in every saved document). Structural comparison (arrays/objects by JSON); keys the
 * schema does not declare are ignored. `undefined` = nothing deviates.
 */
declare function inputDeltas(schema: readonly InputSchema[], values: Record<string, InputValue>): Record<string, InputValue> | undefined;

/** Declaration metadata from the Pine `indicator()` / `strategy()` call. */
interface IndicatorMeta {
    title: string;
    shorttitle?: string;
    overlay: boolean;
    precision?: number;
    format?: string;
}
/** Where an indicator's plots are placed. */
type PaneHint = 'price' | 'new';
/** One label of a categorical pane axis: `frac` is the label's center as a fraction of
 *  the pane's height (0 = top, 1 = bottom). */
interface PaneAxisBand {
    frac: number;
    label: string;
}
/** A pane's value-axis override (see {@link IndicatorModel.paneAxis}): `'none'` = a
 *  blank axis; band labels = a categorical axis, one label per content band/row. */
type PaneAxis = 'none' | {
    bands: PaneAxisBand[];
};
/**
 * Everything one `addIndicator()` produces — the unit the orchestrator mounts
 * on the renderer. Renderer-neutral.
 */
interface IndicatorModel {
    /** Per-instance id (stable). */
    id: string;
    /** Full display name (picker, inspect, and every surface with no {@link shorttitle}). */
    title: string;
    /**
     * Compact label the legend chip, the settings dialog and the object tree's rows show
     * instead of the full {@link title}. Absent ⇒ all use {@link title}. Mirrors Pine
     * `indicator(..., shorttitle=)`.
     */
    shorttitle?: string;
    /** What the chart SHOWS for {@link title}, in its language (a native indicator's
     *  translatable name). Absent ⇒ {@link title}. */
    displayTitle?: MessageLike;
    /** What the chart shows for {@link shorttitle}. Absent ⇒ {@link shorttitle}. */
    displayShorttitle?: MessageLike;
    overlay: boolean;
    paneHint: PaneHint;
    /**
     * Marks a NATIVE indicator (core-computed, no Pine engine) and its type (e.g. `'volume'`,
     * `'volume'`). Absent ⇒ an ordinary Pine indicator. Drives native-only legend styling
     * (distinct title color) + list ordering (native indicators pin to the top).
     */
    native?: {
        type: string;
        /**
         * The renderer-layer data channel this instance's bespoke payload (`pushData`) lands
         * on, when it differs from the type: set for an instance of a `multiInstance` type,
         * so a renderer mounts a DEDICATED layer instance (own canvas, own pane, own stacking)
         * reading this channel instead of the shared per-type layer. Absent ⇒ the type is the
         * channel (single-instance natives, the built-in volume/VPVR).
         */
        channel?: string;
    };
    /** `false` ⇒ no legend row and no pane listing for this indicator (host-owned chrome); absent ⇒ a row. */
    legend?: boolean;
    /**
     * Value-axis override for the pane this indicator OWNS — declared by content that is
     * not value-mapped (e.g. a bespoke renderer layer painting in pixel bands), where a
     * derived price scale would label meaningless numbers. `'none'` leaves the axis blank;
     * band labels place text at fractions of the pane's height (a categorical axis — one
     * label per band/row, e.g. `frac: 0.25` centers a label in the top quarter). Either way
     * the renderer draws no price ticks, no horizontal gridlines, and no crosshair value
     * chip in that pane. Only honored while such indicators are the pane's sole content —
     * any real series merged into the pane takes the scale (and its labels) back over.
     */
    paneAxis?: PaneAxis;
    /** Resolved pane id, filled in by the orchestrator after routing. */
    paneId?: string;
    /**
     * When true, this indicator renders on its OWN price scale within its pane (a
     * dedicated axis column to the right of the pane's scale), independent of the
     * pane's master scale — set when the indicator is merged into a pane it does not
     * own. Absent/false ⇒ it shares the pane's scale (the norm; script overlays like
     * a moving average keep sharing the price scale).
     */
    ownScale?: boolean;
    /**
     * Chart time (epoch ms) of the execution's FIRST bar. Index-aligned payloads —
     * dense series point/bar arrays and `bar_index` drawing coordinates — count from
     * this bar, so a renderer aligns them to the chart via the offset of this time in
     * its bar array. Absent ⇒ the model spans the whole chart (offset 0, the norm);
     * set by engines that ran over a SUFFIX of the bars (e.g. mid-backfill).
     */
    anchorTime?: Millis;
    series: SeriesSpec[];
    fills: Fill[];
    backgrounds: Background[];
    priceLines: PriceLine[];
    /** Pine `line.new(...)` drawings (optional; absent ≡ none). */
    lines?: DrawingLine[];
    /** Pine `box.new(...)` drawings (optional; absent ≡ none). */
    boxes?: DrawingBox[];
    /** Pine `label.new(...)` drawings (optional; absent ≡ none). */
    labels?: DrawingLabel[];
    /** Pine `polyline.new(...)` drawings (optional; absent ≡ none). */
    polylines?: DrawingPolyline[];
    /** Pine `linefill.new(...)` fills (optional; absent ≡ none). */
    linefills?: DrawingLinefill[];
    /** Pine `table.new(...)` DOM overlays (optional; absent ≡ none). */
    tables?: DrawingTable[];
    /** Pine `barcolor(...)` per-bar candle recolor (time→color; absent/empty ≡ none). */
    barColors?: Array<{
        time: Millis;
        color: string;
    }>;
    /** Strategy order executions, painted as trade markers on the PRICE pane (optional; absent ≡ none). */
    trades?: TradeExecution[];
    /** Input schema parsed from the Pine source (drives the renderer's settings dialog). */
    inputs: InputSchema[];
    /** Current input values (defaults merged with any user/add-time overrides). */
    inputValues: Record<string, InputValue>;
    /** Declaration-props schema (the settings dialog's "Properties" tab). Absent ≡ none. */
    props?: InputSchema[];
    /** Current prop values (effective defaults merged with any user/add-time overrides). */
    propValues?: Record<string, InputValue>;
}

interface DirtyRange {
    from: Millis;
    to: Millis;
}
/** Per-series changed tail in a value patch. */
type SeriesValueDelta = {
    seriesId: string;
    kind: 'points';
    points: SeriesPoint[];
} | {
    seriesId: string;
    kind: 'bars';
    bars: OHLCV[];
    /**
     * The series' per-bar colors (see `CandleSeries.barColors`), index-aligned to `bars`.
     * Omitted keeps the current ones; the orchestrator always states them, `[]` included,
     * so a run that emits no colors clears the previous set instead of leaving it on new bars.
     */
    barColors?: Array<CandleBarColor | null>;
} | {
    seriesId: string;
    kind: 'markers';
    markers: MarkerPoint[];
};
/**
 * Value-only update to existing series — legal as an in-place renderer update
 * (the renderer chooses `update()` vs `setData(tail)` by time comparison).
 */
interface ValuePatch {
    kind: 'value';
    indicatorId: string;
    dirty: DirtyRange;
    /**
     * The emitting run's anchor (see `IndicatorModel.anchorTime`): a re-run over a
     * DIFFERENT bar window arrives as a value patch, so the anchor must travel with
     * it for index-aligned rendering to re-derive its offset. `null` states the run
     * spanned the WHOLE chart and clears any previous anchor — an omitted key cannot,
     * so a model that once had an anchor would otherwise keep that stale offset.
     */
    anchorTime?: Millis | null;
    series: SeriesValueDelta[];
    /**
     * Full drawing snapshots for this tick. Pine drawing containers are emitted
     * as a small, capped, already-final set each run, so live updates replace
     * the whole set rather than diffing. Absent ≡ unchanged/none.
     */
    lines?: DrawingLine[];
    boxes?: DrawingBox[];
    labels?: DrawingLabel[];
    polylines?: DrawingPolyline[];
    linefills?: DrawingLinefill[];
    tables?: DrawingTable[];
    /** Trade executions follow the same full-snapshot-per-tick pattern as the drawings. */
    trades?: TradeExecution[];
    /**
     * The run's `fill()` bands. Their per-bar `colors` / `gradient` are index-aligned like the
     * series points, so a re-run over a different bar window (a deeper history, a page of older
     * bars) must replace them together with the points: kept, the previous run's colors slide
     * onto whatever candles now hold their indices, and the bars past them get no fill at all.
     * Absent keeps the current set.
     */
    fills?: Fill[];
    /** The run's `bgcolor()` spans (time-keyed). Absent keeps the current set. */
    backgrounds?: Background[];
    /** The run's `hline()`s. Absent keeps the current set. */
    priceLines?: PriceLine[];
    /** The run's `barcolor()` recolors (time-keyed; `[]` clears them). Absent keeps the current set. */
    barColors?: Array<{
        time: Millis;
        color: string;
    }>;
}
/**
 * Structural change — series added/removed/kind-changed, or panes changed.
 * Forces a remount of the affected series (a series' kind is fixed at creation
 * in most backends).
 */
interface SchemaPatch {
    kind: 'schema';
    indicatorId: string;
    added: SeriesSpec[];
    removed: string[];
    changed: Array<{
        seriesId: string;
        reason: 'kind' | 'pane';
    }>;
}
type ScenePatch = ValuePatch | SchemaPatch;

/** A function that detaches a previously-registered subscription. */
type Unsubscribe = () => void;

/**
 * A once-per-second wall-clock pulse. Every subscriber receives the SAME `now` for a
 * given second, so chrome that displays time (a bottom-bar clock, a countdown-to-bar-close
 * chip) can be driven from one source and never disagrees about which second it is.
 */
interface WallClock {
    /** Called shortly after every wall-clock second boundary with that instant (epoch ms). */
    onTick(cb: (now: number) => void): Unsubscribe;
}
/**
 * The device clock, corrected by what live candles prove about it. Time chrome (the
 * countdown to bar close, the bottom-bar clock) reads this device's clock, but candles
 * open on the exchange's. On a device running a few seconds slow, the next candle lands
 * while the clock still reads before its open time, so a 1-minute countdown read `01:04`
 * the moment it arrived and stayed those seconds high all minute.
 *
 * A candle can't arrive before it opens, so one whose open time is still ahead of the
 * device clock when it arrives proves the clock is slow by at least that gap. The
 * correction keeps the largest gap seen and adds it to the device clock. A correct or fast
 * clock leaves no trace in candle times and reads unchanged (a fast clock still hides the
 * countdown a moment early, until the next candle arrives). It learns only from intraday
 * candles and only gaps up to {@link MAX_CORRECTION_MS}, and it forgets what it learned
 * when the device clock is set or the machine sleeps: the old gap no longer applies.
 */
declare class ClockCorrection {
    private readonly deviceNow;
    private readonly monotonic;
    /** How far behind the device clock is proven to run, in ms (0: nothing proves it slow). */
    private behindMs;
    /** Device clock minus monotonic clock at the last read: a jump in it is a clock step. */
    private skew;
    constructor(deviceNow?: () => number, monotonic?: () => number);
    /** A candle opening at `openMs`, on an `intervalMs` cadence, has just arrived. */
    observeCandle(openMs: number, intervalMs: number): void;
    /** How many ms the device clock is proven to run behind (0 when nothing proves it slow). */
    get offsetMs(): number;
    /** The corrected time (epoch ms): the device clock plus the proven lag. */
    now(): number;
    /** Forget what was learned. */
    reset(): void;
    /** Read the device clock, dropping the correction when the clock was set or the machine slept. */
    private readDevice;
}
/** The page's one correction: every chart teaches it and every time display reads it. */
declare const clockCorrection: ClockCorrection;
/**
 * A {@link WallClock} aligned to the wall clock's second boundaries. Free-running
 * `setInterval(1000)` timers start at an arbitrary sub-second phase and slide against
 * each other, so two of them sample different seconds part of the time; this one
 * re-arms a `setTimeout` to the NEXT boundary after every tick, so it fires just past
 * `hh:mm:ss.000` regardless of when it was started or how long the callback took (a
 * throttled background tab simply skips seconds — it never drifts). Runs only while it
 * has subscribers: zero idle timers when nothing displays time. Its seconds are those of
 * the corrected clock ({@link clockCorrection}) unless it is given another.
 */
declare class SecondClock implements WallClock {
    private readonly now;
    private readonly subs;
    private timer;
    constructor(now?: () => number);
    onTick(cb: (now: number) => void): Unsubscribe;
    /** Milliseconds from `now` to just past the next second boundary. */
    static delayToNextSecond(now: number): number;
    private arm;
}

/**
 * Async series access for data-driven drawings — the ranged, any-timeframe sibling
 * of {@link Projector.barsInRange}. Painting stays synchronous: a read either serves
 * bars from cache or reports `loading` while a fetch runs in the background; the
 * gateway then fires {@link DrawingSeriesGateway.onUpdate} so the renderer repaints
 * and the next read finds the bars. Neutral by design — any drawing that needs bars
 * of a finer timeframe than the chart's reads through this seam.
 */
/** One OHLC(V) bar as the gateway returns it (`time` = bar open, epoch ms). */
interface DrawingSeriesBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}
/**
 * The synchronous answer to a series read. `ready` and `loading` carry the RESOLVED
 * timeframe (an `'auto'` request comes back concrete) and its bar duration so consumers
 * never re-derive timeframe math. `loading` may carry best-effort PARTIAL bars from
 * previously fetched overlapping windows, so a resize keeps painting what it already
 * has while the widened fetch runs; `unavailable` is a terminal state for this
 * request — no fetch was started.
 */
type DrawingSeriesState = {
    state: 'loading';
    timeframe: string;
    barMs: number;
    bars?: ReadonlyArray<DrawingSeriesBar>;
} | {
    state: 'ready';
    bars: ReadonlyArray<DrawingSeriesBar>;
    timeframe: string;
    barMs: number;
} | {
    state: 'unavailable';
    /** `no-source` = the market has no ranged feed (inline data); `none-lower` = NO
     *  offered timeframe is below the chart's (the chart is already at the finest);
     *  `not-lower` = the explicit pick does not subdivide the chart's (lower picks
     *  exist); `too-wide` = the range would need more bars than the gateway's cap. */
    reason: 'no-source' | 'none-lower' | 'not-lower' | 'too-wide';
};
/**
 * The core-owned gateway the renderer hands drawings via {@link Projector.seriesInRange}.
 * `timeframe` accepts a canonical value (`'5'`, `'60'`, `'D'`) or `'auto'` — the gateway
 * resolves `'auto'` against the chart's own timeframe and refuses anything not strictly
 * lower than it.
 */
interface DrawingSeriesGateway {
    /** Synchronous cache read for the CHART's OWN symbol; kicks a background fetch on a miss. */
    seriesInRange(timeframe: string, from: number, to: number): DrawingSeriesState;
    /** Fires when a background fetch lands new bars (the renderer repaints on it). */
    onUpdate(listener: () => void): Unsubscribe;
}

/**
 * Geometry seam for user drawings. A drawing stores its anchors in DATA space
 * ({@link DrawingPoint}); every pixel it needs is resolved on demand through a
 * {@link Projector} the renderer supplies. The model never stores pixels, so a
 * drawing survives reload, pan/zoom, bar-prepend, and timezone changes — the
 * same invariant Pine drawings get from `xloc:'bar_time'`.
 */

/** A drawing anchor in DATA space (epoch-ms time + data-space price). */
interface DrawingPoint {
    /** Epoch ms — resolved to a fractional logical bar index by the time scale. */
    time: number;
    /** Data-space price (not normalized, not pane-relative). */
    price: number;
}
/** Axes a handle is free to move along — drives drag constraints + handle generation. */
type FreeAxis = 'both' | 'x' | 'y' | 'none';
/**
 * Magnet (snap-to-candle) strength. `off` never snaps; `strong` always snaps the
 * anchor to the nearest bar/OHLC; `weak` snaps only when the candle point is within
 * a small pixel radius of the cursor (so you can place freely between candles).
 * Holding Ctrl/Cmd is a momentary `strong` override regardless of the sticky mode.
 */
type SnapMode = 'off' | 'weak' | 'strong';
/**
 * The renderer-supplied data→pixel transform. The native renderer builds it from
 * its {@link CoordinateSystem} (`xOf = timeToX`, `yOf = priceToY` against the
 * pane's live scale + bounds); any other renderer can build the same from its own
 * coordinate closures. Defined in core so the model depends only on the interface.
 */
interface Projector {
    /** Pixel x for an epoch-ms time (extrapolates past either edge). */
    xOf(time: number): number;
    /** Pixel y for a price on a pane; `null` when the pane is gone. */
    yOf(price: number, paneId: string): number | null;
    /** Known price precision for this pane, when supplied by the renderer. */
    priceDecimals?(paneId: string): number | undefined;
    /** Inverse — pixel → data point on a pane (used on create/drag commit). */
    pxToPoint(x: number, y: number, paneId: string): DrawingPoint;
    /** Which pane owns a pixel y, or `null` outside every pane. */
    paneIdAtY(y: number): string | null;
    /**
     * A pane's vertical pixel extent, or `null` when the pane is gone. `height` is 0 while
     * the pane is hidden (collapsed to a legend strip, or zeroed by another pane's maximize) —
     * painters clip each drawing to this rect so panes stay visually separated; optional.
     */
    paneRect?(paneId: string): {
        top: number;
        height: number;
    } | null;
    /** Approximate whole bars between two times (for measurement labels); optional. */
    barsBetween?(t1: number, t2: number): number;
    /**
     * OHLC(V) bars whose time falls within `[from, to]` (inclusive), in ascending time —
     * the data a statistical drawing (e.g. a regression channel or anchored VWAP) fits
     * against. `volume` is optional (some feeds omit it). Optional itself: renderers without
     * series access (or with user-drawings disabled) may omit the method, and such drawings
     * then degrade gracefully to an anchor-only fallback.
     */
    barsInRange?(from: number, to: number): ReadonlyArray<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
    }>;
    /**
     * Bars of a FINER timeframe than the chart's, for the same symbol — the async sibling
     * of {@link barsInRange} (see {@link DrawingSeriesGateway}): a cache read that reports
     * `loading` while the background fetch runs, after which the renderer repaints.
     * Optional: renderers without a series gateway omit it, and such drawings degrade to
     * an anchors-only rendering.
     */
    seriesInRange?(timeframe: string, from: number, to: number): DrawingSeriesState;
    /** Plot width in media px (excludes the right price-axis strip). */
    readonly width: number;
    /** Plot height in media px (excludes the bottom time-axis strip). */
    readonly height: number;
}

/**
 * The cosmetic payload shared by every drawing (the "settings" a user edits).
 * Reuses the Pine {@link LineStyle} so dash patterns resolve through the same
 * `dashPattern()` helper the renderer already uses.
 */
interface DrawingStyle {
    lineColor: string;
    lineWidth: number;
    lineStyle: LineStyle;
    /** Fill (box / closed path); `undefined` ⇒ no fill. */
    fillColor?: string;
    /** Fill opacity 0..1 (applied over `fillColor`). */
    fillOpacity?: number;
    arrowLeft?: boolean;
    arrowRight?: boolean;
    /** Run the line past its first anchor to the chart edge (trend line). */
    extendLeft?: boolean;
    /** Run the line past its second anchor to the chart edge (trend line). */
    extendRight?: boolean;
}
/** A drawing's editable text/annotation block. */
interface DrawingText {
    value: string;
    /** `undefined` ⇒ auto-contrast against the fill/background. */
    color?: string;
    size: 'tiny' | 'small' | 'normal' | 'large' | 'huge' | 'auto';
    hAlign: 'left' | 'center' | 'right';
    vAlign: 'top' | 'center' | 'bottom';
    bold?: boolean;
    italic?: boolean;
    /** Where a line's label sits along it (line tools); absent = the middle. */
    place?: 'start' | 'middle' | 'end';
    /** Which side of the line its label sits on (line tools); absent = above. */
    side?: 'above' | 'below';
}

/**
 * A data-driven settings schema. Each {@link SettingsField} names a dot-path into
 * a drawing (`'style.lineColor'`, `'text.value'`) plus a control `kind`, so the
 * renderer's settings popup builds controls generically — adding a new drawing
 * type is a schema entry, not new UI code.
 */

type FieldKind = 'color' | 'number' | 'select' | 'lineStyle' | 'boolean' | 'text' | 'opacity';
interface SettingsField {
    /** Dot-path into the drawing, e.g. `'style.lineColor'`, `'text.value'`, `'locked'`. */
    path: string;
    /** What the settings show; a message reads in the chart's language. */
    label: MessageLike;
    kind: FieldKind;
    /** number/opacity bounds. */
    min?: number;
    max?: number;
    step?: number;
    /** select options. */
    options?: ReadonlyArray<{
        value: string;
        label: MessageLike;
    }>;
    /** Cosmetic grouping in the popup. */
    group?: 'line' | 'fill' | 'text' | 'behavior';
    /** Only offered while another setting holds one of these values (an option that matters
     *  only in some modes). */
    when?: {
        path: string;
        in: readonly unknown[];
    };
    /** A color that follows another setting until one is picked (a rectangle's midline takes
     *  the border color): the path whose value the control shows while this one is unset. */
    fallback?: string;
    /** The label of the one row this field shares with the next one: a color and its line
     *  style ("Midline" for "Midline color" + "Midline style"), or an upper and a lower color
     *  ("Bands"). */
    rowLabel?: MessageLike;
}
interface SettingsSchema {
    fields: SettingsField[];
    /**
     * The text **is** the drawing (a text label, a note, a callout) rather than an optional label on
     * a shape. The settings popup then puts the text controls — color, size, bold, italic — on the
     * bar itself instead of tucking them under the text field.
     */
    textIsContent?: boolean;
}

/**
 * The interactive user-drawing types. The lean-core set ships first; new types
 * (fibs/patterns) extend the union + register a class — no base/port change.
 */
type DrawingTypeKey = 'trendline' | 'hline' | 'ray' | 'extendedline' | 'vline' | 'hray' | 'crossline' | 'infoline' | 'trendangle' | 'box' | 'text' | 'note' | 'pricenote' | 'comment' | 'pricelabel' | 'signpost' | 'parallelchannel' | 'disjointchannel' | 'flattopbottom' | 'regressionchannel' | 'anchoredvwap' | 'fixedrangevp' | 'pitchfork' | 'schiffpitchfork' | 'modifiedschiffpitchfork' | 'insidepitchfork' | 'arrow' | 'callout' | 'ellipse' | 'triangle' | 'polyline' | 'freehand' | 'highlighter' | 'circle' | 'rotatedrect' | 'path' | 'arc' | 'curve' | 'arrowmarkup' | 'arrowmarkdown' | 'flagmark' | 'iconstamp' | 'fibretracement' | 'fibextension' | 'fibextensiontrend' | 'fibfan' | 'fibtimezones' | 'fibchannel' | 'fibspeedfan' | 'trendfibtime' | 'fibcircles' | 'fibarcs' | 'fibwedge' | 'fibspiral' | 'gannfan' | 'gannbox' | 'gannsquare' | 'dedekind' | 'sonic' | 'supersonic' | 'goldensonic' | 'goldensupersonic' | 'datepricerange' | 'position' | 'magnifier' | 'xabcd' | 'abcd' | 'elliottimpulse' | 'elliottcorrection' | 'headshoulders' | 'gartley' | 'bat' | 'butterfly' | 'crab' | 'shark' | 'cypher' | 'fairvaluegap' | 'orderblock' | 'liquidity';
/** One anchor's role + which axes its handle may move along. */
interface AnchorSlot {
    role: string;
    free: FreeAxis;
}
/**
 * The plain-JSON shape of one drawing — the ONLY representation that crosses the
 * renderer port and the persistence boundary. A {@link Drawing} (rich behavior)
 * serializes to/from this; the renderer never sees a class instance.
 */
interface SerializedDrawing {
    id: string;
    type: DrawingTypeKey;
    paneId: string;
    /** time+price anchors — the single source of geometry truth. */
    anchors: DrawingPoint[];
    style: DrawingStyle;
    text?: DrawingText;
    locked: boolean;
    visible: boolean;
    /** Draw-order key. On a renderer with `drawingDepth` it shares ONE space with the pane's
     *  series — the candles and each indicator carry z keys of their own — so a drawing can sit
     *  anywhere in the stack, under the candles or between two indicators included. */
    zIndex: number;
    createdAt: number;
    /** Per-type extras (e.g. box `extend`) — keeps the base closed. */
    props?: Record<string, unknown>;
    /** The timeframe bands the drawing shows on (see `TIMEFRAME_BANDS`); absent = every one. */
    showOn?: string[];
}
/**
 * The parent of every user drawing. Owns the shared state + settings/serialization
 * (the "everything inherits from a parent object" intent), and declares the
 * geometry behaviors as PURE functions of `(anchors, Projector)` so the whole
 * hierarchy stays renderer-neutral and serializable.
 */
declare abstract class Drawing {
    readonly id: string;
    abstract readonly type: DrawingTypeKey;
    paneId: string;
    /** DATA-space anchors (time+price). The only geometry the model stores. */
    anchors: DrawingPoint[];
    style: DrawingStyle;
    text?: DrawingText;
    locked: boolean;
    visible: boolean;
    zIndex: number;
    /** The timeframe bands the drawing shows on; `undefined` = every timeframe. */
    showOn?: string[];
    readonly createdAt: number;
    constructor(init: Partial<SerializedDrawing> & {
        paneId: string;
    });
    /** Fallback id counter — used only when no id is supplied (store assigns real ids). */
    private static seq;
    abstract anchorSchema(): {
        min: number;
        max: number;
        slots: AnchorSlot[];
    };
    /** True once enough anchors exist to be a real shape. */
    isComplete(): boolean;
    /**
     * How the tool is placed: `'click'` (click each anchor; a variable-count tool —
     * `max > min` — keeps adding until a finish gesture), `'drag'` (press at the first
     * corner, drag, release at the second — the press-drag-release idiom for boxes/ranges/positions),
     * or `'freehand'` (press, drag to capture a path, release). Drives the state machine.
     */
    placementMode(): 'click' | 'drag' | 'freehand';
    /**
     * Hook run once after interactive placement finishes, before the `create` intent —
     * lets a type finalize its anchors against the live projector (e.g. a position deriving
     * its stop/target/width in pixel space so a bare click drops a default-sized box).
     * Default: no-op.
     */
    onPlaced(_proj: Projector): void;
    /**
     * Move handle `index` to `pt`. By default handle `i` IS anchor `i`, moved along the axes its slot
     * frees; a type with more handles than anchors (a box's edge midpoints) maps each extra handle
     * onto the anchor coordinates it edits.
     */
    dragHandle(index: number, pt: DrawingPoint): void;
    /**
     * After a single handle (anchor `index`) is dragged, re-impose any cross-anchor invariant —
     * e.g. a position keeps its stop and target on opposite sides of the entry, flipping the
     * non-dragged side across the entry when a drag would put them on the same side. Default: no-op.
     */
    constrainHandleDrag(_index: number): void;
    /**
     * Apply a whole-body drag — translate the original anchors by (dt, dp) in data space.
     * Default moves every anchor together; a type can pin some (e.g. a callout keeps its
     * pointer tip fixed and moves only the box).
     */
    translateBody(dt: number, dp: number, orig: DrawingPoint[]): DrawingPoint[];
    /** Is the pixel (px,py) on this drawing's body, within `tol` px? */
    abstract hitTest(px: number, py: number, proj: Projector, tol: number): boolean;
    /** Index of the grabbed handle, or -1 for the body. */
    abstract hitHandle(px: number, py: number, proj: Projector, tol: number): number;
    /** Pixel positions of the draggable handles (for painting + hit-test). */
    abstract handlePoints(proj: Projector): Array<[number, number]>;
    /** Tight pixel bounds (selection box), or null when unresolvable. */
    abstract bounds(proj: Projector): {
        x: number;
        y: number;
        w: number;
        h: number;
    } | null;
    /** Visible price span on its pane. Reserved for a future per-drawing autoscale opt-in. */
    abstract priceRange(): {
        min: number;
        max: number;
    } | null;
    /**
     * Time span (epoch ms) the drawing occupies, for visible-range culling. Default
     * is the anchor extent; a full-width drawing (e.g. a horizontal line) overrides
     * to `null` meaning "all time" so it never culls.
     */
    timeExtent(): {
        min: number;
        max: number;
    } | null;
    abstract schema(): SettingsSchema;
    /** The text a fresh drawing of this type starts with ("Note", "Callout"), as a message,
     *  or null for a type that seeds none. A new drawing stores its English source; the chart
     *  that places one interactively writes it in its own language instead. */
    placeholderText(): MessageLike | null;
    /**
     * Editable per-level config for a rich "gear" settings panel (Fibonacci levels):
     * each entry's `color` / `enabled` / `label` is mutated via a `levels.<i>.<field>`
     * settings path. Simple drawings return null (no gear).
     */
    editableLevels(): Array<{
        ratio: number;
        color: string;
        enabled: boolean;
        label?: string;
    }> | null;
    /** Apply a `{ 'dot.path': value }` patch (the popup emits these). */
    applySettings(patch: Record<string, unknown>): void;
    /** Re-read per-type extras (props) onto this instance — used by the store on an edit. */
    applyProps(props: Record<string, unknown>): void;
    serialize(): SerializedDrawing;
    /** Per-type extras to serialize into `props` (override in subclasses). */
    protected writeProps(): Record<string, unknown> | undefined;
    /** Read per-type extras from a `props` bag (override in subclasses). */
    protected readProps(_props: Record<string, unknown>): void;
}

/**
 * Inert, renderer-neutral toolbar data. The core builds it from the type registry;
 * the renderer paints a vertical bar where each {@link ToolGroup} is one button with
 * a flyout listing its {@link ToolDefinition}s. One tool is armed
 * at a time across all groups.
 */
interface ToolDefinition {
    type: DrawingTypeKey;
    /** The tool's name, in the language the definition was built for. */
    label: string;
    /** Inline SVG markup (no DOM). */
    icon: string;
}
/** A labelled subsection inside a toolbar group's flyout (e.g. "Fibonacci" within Fibonacci & Gann). */
interface ToolSection {
    label: string;
    tools: ToolDefinition[];
}
interface ToolGroup {
    id: string;
    label: string;
    tools: ToolDefinition[];
    /** When set, the flyout renders non-clickable headers between sections. */
    sections?: ToolSection[];
}
interface ToolbarDefinition {
    groups: ToolGroup[];
}
/** A developer-supplied explicit group (just type keys; the registry fills the rest). */
interface ToolbarGroupConfig {
    id: string;
    /** The group's name; a message (`msg()`) reads in the chart's language. */
    label: MessageLike;
    tools: DrawingTypeKey[];
}
/** Public `options.drawings` shape. `true` = default toolbar; object = customize. */
type DrawingsOption = boolean | {
    toolbar?: boolean;
    tools?: DrawingTypeKey[];
    groups?: ToolbarGroupConfig[];
    /**
     * The drawings belong to the chart's SYMBOL: switching to another symbol removes
     * them all (a timeframe or session change keeps them). Default false: drawings
     * stay on the chart across symbols. They are removed as the switch starts, with
     * the undo history, and `drawing:replaced` stands in for a `drawing:removed` per
     * drawing, so a host that keeps a document per symbol saves on the drawing events
     * and loads the new symbol's document on `market:changed`. Also set at runtime
     * with `chart.drawings.setClearOnSymbolChange()`.
     */
    clearOnSymbolChange?: boolean;
};
/** The default toolbar — every registered type, grouped into the canonical seven-button
 *  layout, labelled in `i18n`'s language (English without one). */
declare function defaultToolbar(i18n?: Translator | null): ToolbarDefinition;
/**
 * Resolve `options.drawings` into a concrete toolbar definition + initial visibility.
 * Default (undefined) ⇒ toolbar VISIBLE; `false` ⇒ subsystem available but toolbar hidden
 * (headless use still works via `chart.drawings.add(...)`); object ⇒ `toolbar ?? true`.
 */
declare function buildToolbar(option: DrawingsOption | undefined, i18n?: Translator | null): {
    definition: ToolbarDefinition;
    visible: boolean;
};

/**
 * A tool's remembered settings — what the next drawing of that type starts from. Captured
 * from the last drawing of the type the user styled: its style, its text styling (never the
 * words themselves) and its per-type settings (`props`: fib levels, position sizing, profile
 * rows…). Geometry, lock, visibility and depth are per-drawing and never carried over.
 */
interface DrawingToolDefaults {
    style?: Partial<DrawingStyle>;
    text?: Partial<Omit<DrawingText, 'value'>>;
    props?: Record<string, unknown>;
}
/** A named, saved look for one tool (a "style"): applied, it sets the same settings a
 *  remembered default does — style, text styling and per-type settings. */
interface DrawingToolTemplate {
    /** The style's name: its identity among the tool's styles. */
    name: string;
    /** What a built-in style's name reads as in the chart's language. Absent ⇒ {@link name}. */
    label?: MessageLike;
    settings: DrawingToolDefaults;
}

/**
 * The renderer-local drawing MODES beyond an armed tool: the transient measure ruler,
 * the eraser, or none. Mutually exclusive with each other and with any armed tool —
 * the renderer owns that exclusion; the core mirrors the outcome (see the `mode`
 * intent) so external UIs (a shared workspace toolbar) can reflect and drive it.
 */
type DrawingMode = 'measure' | 'eraser' | null;
/**
 * Renderer→core INTENT. The renderer proposes a change from a user gesture; the
 * core {@link DrawingController} decides, mutates the store (the source of truth),
 * re-syncs, and emits a `drawing:*` event. A single discriminated union (vs one
 * callback per kind) because every arm routes to the same destination.
 */
type DrawingIntent = {
    kind: 'arm';
    type: DrawingTypeKey | null;
}
/** Placement in progress: the ghost's current shape after every anchor click and
 *  cursor move; `null` when placement ends (finalized OR cancelled). No store
 *  mutation — the core only re-emits it (`drawing:draft`) so a multi-chart host
 *  can mirror the ghost live. Optional — a renderer that never emits it simply
 *  syncs at completion. */
 | {
    kind: 'draft';
    doc: SerializedDrawing | null;
} | {
    kind: 'create';
    doc: SerializedDrawing;
} | {
    kind: 'edit';
    doc: SerializedDrawing;
} | {
    kind: 'edit-many';
    docs: SerializedDrawing[];
} | {
    kind: 'select';
    ids: string[];
    additive?: boolean;
} | {
    kind: 'delete';
    ids: string[];
} | {
    kind: 'reorder';
    id: string;
    to: 'front' | 'back';
} | {
    kind: 'settings';
    id: string;
} | {
    kind: 'tool-finished';
    type: DrawingTypeKey;
} | {
    kind: 'favorite';
    type: DrawingTypeKey;
    on: boolean;
}
/** The settings panel saved the drawing's look as a named style for its tool. */
 | {
    kind: 'template-save';
    type: DrawingTypeKey;
    name: string;
    settings: DrawingToolDefaults;
}
/** The settings panel deleted one of a tool's saved styles. */
 | {
    kind: 'template-remove';
    type: DrawingTypeKey;
    name: string;
} | {
    kind: 'snap-mode';
    mode: SnapMode;
}
/** Stay-in-drawing-mode toggled in-chart — when on, finishing a drawing leaves the
 *  tool armed instead of reverting to the pointer. */
 | {
    kind: 'stay-mode';
    on: boolean;
} | {
    kind: 'mode';
    mode: DrawingMode;
} | {
    kind: 'undo';
} | {
    kind: 'redo';
} | {
    kind: 'duplicate';
    ids: string[];
}
/** Commit COPIES carrying the geometry given (the end of a drag-to-duplicate: the
 *  sources never moved, the docs are their serialized twins already translated).
 *  Ids are reassigned; the copies keep their sources' depth and become the selection.
 *  One undo step. */
 | {
    kind: 'clone';
    docs: SerializedDrawing[];
} | {
    kind: 'copy';
    ids: string[];
} | {
    kind: 'paste';
};
/**
 * The interactive user-drawings surface a renderer optionally implements. Present
 * iff `capabilities.userDrawings`. Commands flow down; one intent channel flows up.
 * Only plain {@link SerializedDrawing}/{@link ToolbarDefinition} data crosses — no
 * backend types, mirroring the rest of {@link IChartRenderer}.
 */
interface IDrawingsRendererPort {
    /** Hand the renderer the inert toolbar definition to RENDER (groups/tools/icons). */
    setToolbar(def: ToolbarDefinition): void;
    /** Show or hide the on-chart drawing toolbar. */
    showToolbar(visible: boolean): void;
    /** Push the authoritative snapshot down; the renderer re-projects + repaints. */
    syncDrawings(docs: readonly SerializedDrawing[]): void;
    /** Arm/disarm a tool (`null` = selection/idle, pan resumes). `lastStyle` is the
     *  tool's last-used style (if any) so the placement preview matches what will be
     *  committed, rather than falling back to the type default; `defaults` carries the
     *  tool's whole remembered settings (style, text styling, per-type settings) for a
     *  renderer that previews more than the style. */
    setActiveTool(type: DrawingTypeKey | null, lastStyle?: SerializedDrawing['style'], defaults?: DrawingToolDefaults): void;
    /** Reflect which drawings are selected (drives handle painting); `[]` = none. */
    setSelection(ids: readonly string[]): void;
    /** Push the FAVORITE tool set (flyout stars + any favorites-driven UI). Optional —
     *  favorites still work headless without a renderer reflection. */
    setFavorites?(types: readonly DrawingTypeKey[]): void;
    /** Push every tool's saved looks (the settings panel's style menu). Optional — the
     *  styles still round-trip through the core without a renderer reflection. */
    setToolTemplates?(map: Readonly<Partial<Record<DrawingTypeKey, DrawingToolTemplate[]>>>): void;
    /** Push per-tool shortcut hints — PRE-FORMATTED display strings (e.g. `'Alt+T'`)
     *  shown beside the tools in the toolbar flyouts. The host owns the keymap and the
     *  platform formatting; the renderer only displays. Optional. */
    setToolShortcuts?(map: Readonly<Partial<Record<DrawingTypeKey, string>>>): void;
    /** Set the sticky magnet snap mode (off/weak/strong). Optional — a renderer without
     *  a magnet omits it; the in-chart toolbar reflects the pushed value. */
    setSnapMode?(mode: SnapMode): void;
    /** Set stay-in-drawing-mode (tools remain armed after each placement). Optional —
     *  the in-chart toolbar reflects the pushed value. */
    setStayMode?(on: boolean): void;
    /** Enter/exit a renderer-local mode (measure ruler / eraser; `null` exits). The
     *  renderer keeps owning the mutual exclusion (with armed tools too) and reports
     *  every actual change back through the `mode` intent. Optional. */
    setMode?(mode: DrawingMode): void;
    /** Hand the renderer the core's series gateway so data-driven drawings can read bars
     *  of a finer timeframe (exposed to them as `Projector.seriesInRange`). Optional — a
     *  renderer without it simply never resolves lower-timeframe series. */
    setSeriesGateway?(gateway: DrawingSeriesGateway): void;
    /** Open a drawing's settings popup (selecting it too) — the programmatic twin of a click on it. */
    openSettings(id: string): void;
    /** Display another chart's in-progress placement as a GHOST at reduced opacity
     *  (`null` clears it) — the drawings-sync twin of `setExternalCrosshair`. Never a
     *  store drawing: no selection, no hit-testing, no persistence. Optional — a
     *  renderer without it simply never previews remote placements. */
    setExternalGhost?(doc: SerializedDrawing | null): void;
    /**
     * The pane's SERIES stack in z terms, for renderers whose drawings share one draw-order
     * space with the series (`drawingDepth`): the extremes ("bring to front" beats `front`,
     * "send to back" undercuts `back`) and the candles' own key (`price`, absent on a study
     * pane) — a new drawing starts just under it. Optional — without it drawings order only
     * among themselves, on a layer of their own.
     */
    stackRange?(paneId: string): {
        front: number;
        back: number;
        price?: number;
    };
    /** The one channel up — create/edit/select/delete/settings/tool-finished. */
    onDrawingIntent(cb: (intent: DrawingIntent) => void): Unsubscribe;
}

/** The built-in glyph outlines. */
type MarkShape = 'circle' | 'square' | 'diamond' | 'pin';
/**
 * How a mark looks on the lane: a colored token carrying either a short letter or a
 * registered icon (`registerIcon` from `vela/ui` — an id, never inline markup, so a mark
 * payload can come from data without ever carrying SVG). `icon` wins over `letter`
 * when both are given; the symbol's ink is auto-contrasted against `color`.
 */
interface MarkGlyph {
    /** Token outline (default `'circle'`). */
    shape?: MarkShape;
    /** Token fill — any CSS color. */
    color: string;
    /** One or two characters drawn inside the token (`'D'`, `'E'`, `'!'`). */
    letter?: string;
    /** Icon id from the icon registry, drawn inside the token. */
    icon?: string;
}
/** One row of a structured panel — the callout vocabulary plus a label/value field. */
type MarkPanelItem = {
    type: 'text';
    text: string;
} | {
    type: 'field';
    label: string;
    value: string;
} | {
    type: 'button';
    label: string;
    /** Emphasized (selection-colored) button — the panel's main action. */
    primary?: boolean;
    /** Close the popup after `run` (default true). */
    close?: boolean;
    run(): void;
};
/**
 * What the popup shows for one mark: plain text (escaped), HTML (sanitized through an
 * allowlist — scripts, styles, frames, event handlers and `javascript:` URLs never
 * reach the page), or a structured panel of rows and buttons.
 */
type MarkContent = {
    text: string;
} | {
    html: string;
} | {
    panel: {
        items: MarkPanelItem[];
    };
};
/** A content value, or a thunk resolved when the popup needs it (details fetched on click). */
type MarkContentSource = MarkContent | (() => MarkContent | Promise<MarkContent>);
/** One timeline mark. */
interface TimelineMark {
    /** Stable id — re-adding an id replaces the mark. */
    id: string;
    /**
     * The moment the mark belongs to, epoch-ms. The glyph never sits at this exact pixel:
     * it centers on the bar whose span contains the time (a time falling in a gap — a
     * weekend, a closed session — goes to the first bar that follows; one past the newest
     * bar projects onto the extrapolated grid in the right whitespace).
     */
    time: Millis;
    /** Popup heading — shown above the content whatever its form. */
    title?: string;
    glyph: MarkGlyph;
    /** Hover text on the glyph. */
    tooltip?: string;
    /**
     * The visibility group the mark belongs to (`'dividends'`, `'splits'`). Marks of one
     * group that land on the same bar — or whose glyphs would overlap at the current zoom —
     * cluster into one glyph (the tooltip carries the count, the popup lists them all); groups get a checkbox each
     * in the chart settings (the Events tab). Define the display label with
     * `chart.marks.defineGroup`; an undefined group shows its capitalized id.
     */
    group?: string;
    /** Popup content. Without it a click only emits `mark:click` — the host owns the UI. */
    content?: MarkContentSource;
}
/** A visibility group's presentation (see {@link TimelineMark.group}). */
interface MarkGroup {
    id: string;
    /** The settings checkbox label (`'Dividends'`). */
    label: string;
    /** Default visibility before the user toggles it (default true). A persisted choice wins. */
    visible?: boolean;
    /**
     * The id of the group this one nests under. A child's marks paint only while BOTH it
     * and its parent are visible; on the Events tab it lists indented beneath the parent
     * and dims while the parent is off, keeping its own choice for when the parent comes
     * back. Lets a host offer `News → Latest / All` or `Economic → High / Medium / Low`
     * as one master switch with sub-choices. A parent may hold marks of its own.
     */
    parent?: string;
}
/** The `mark:click` payload — every mark under the clicked glyph (a cluster lists them all). */
interface MarkClickEvent {
    /** The cluster's first mark (earliest time, then insertion order). */
    id: string;
    /** Every mark in the clicked cluster, in cluster order. */
    ids: string[];
    /** The first mark's time, epoch-ms. */
    time: Millis;
    /** The cluster's group, when its marks belong to one. */
    group?: string;
}

/** The language and direction attributes of a renderer's root element (`null` = unset). */
interface RendererRootAttributes {
    lang: string | null;
    dir: TextDirection | null;
}
/** What a rendering backend supports — drives graceful degradation + warnings. */
interface RendererCapabilities {
    panes: boolean;
    /**
     * Full pane management: moving/merging an indicator between panes (with its own
     * scale column), reordering panes, and pane collapse/maximize. A renderer without
     * it keeps one-pane-per-indicator behavior; `chart.panes` mutations warn + no-op.
     */
    paneManagement: boolean;
    fills: 'native' | 'primitive' | 'unsupported';
    bgcolor: 'native' | 'primitive' | 'unsupported';
    hline: 'native' | 'primitive' | 'unsupported';
    markers: boolean;
    barcolor: 'native' | 'approximated' | 'unsupported';
    perPointColor: boolean;
    /** Pine drawing objects (line/box/label/polyline/linefill) via custom primitives. */
    drawings: boolean;
    /** Interactive USER drawing tools (toolbar + hit-test + handles). Distinct from `drawings`. */
    userDrawings: boolean;
    /** Whether user drawings share ONE draw-order space with the pane's series — a drawing's
     *  `zIndex` then places it anywhere in the stack: over everything, under the candles, or
     *  between two indicators. Absent/false: every drawing paints in front, `zIndex` orders
     *  only the drawings among themselves, and a host UI should not offer depth slots. */
    drawingDepth?: boolean;
    /** Pine `table.new` dashboards via a DOM overlay. */
    tables: boolean;
    /** Strategy trade markers (`IndicatorModel.trades`): order-fill arrows + labels + price
     *  ticks on the price pane, plus the `tradeMarkers` display feature. Absent/false ⇒ the
     *  channel is carried through mounts/patches but never painted. */
    trades?: boolean;
    /** Timeline marks (`chart.marks`): host events pinned to a bar, painted as glyphs on a lane
     *  above the time axis with a detail popup on click. Absent/false ⇒ the model still fills
     *  (`chart.marks.all()`) but nothing paints. */
    timelineMarks?: boolean;
    /** Whether the renderer provides the in-chart inputs/settings UI. */
    inputsUI: boolean;
}
/** Opaque handle to a mounted indicator, returned by `mountIndicator()`. */
interface IndicatorRenderHandle {
    readonly id: string;
}
/** An indicator's live status, shown in its legend row. */
type IndicatorStatus = 'idle' | 'loading' | 'live';
/**
 * One host-contributed legend-row action, as the renderer consumes it: pure data plus a
 * thunk. The shell resolves the plugin descriptor (its `when` gate, the context, the
 * indicator info) BEFORE it reaches the renderer, so the renderer stays ignorant of the
 * plugin layer — it just paints an icon button and calls `run` on click.
 */
interface LegendActionView {
    id: string;
    /** Icon id in the core icon registry (`registerIcon`). */
    icon: string;
    tooltip: string;
    run(): void;
}
/**
 * One HOST-CONTRIBUTED action of a drawing, resolved by the shell for one drawing: an icon
 * button on the drawing's selection toolbar and a labelled button in its settings dialog.
 * Plain data plus a bound `run` thunk, like {@link LegendActionView}.
 */
interface DrawingActionView {
    id: string;
    /** Icon id in the core icon registry (`registerIcon`). */
    icon: string;
    /** The toolbar button's tooltip and accessible name, and the settings dialog button's text. */
    label: string;
    /** Show it on the selection toolbar. */
    toolbar: boolean;
    /** Show it in the settings dialog. */
    settings: boolean;
    run(): void;
}
/** One block of a legend callout's deployed panel — plain text, or an action button. */
type LegendCalloutPanelItem = {
    type: 'text';
    text: string;
} | {
    type: 'button';
    label: string;
    /** Emphasized (selection-colored) button — the panel's main action. */
    primary?: boolean;
    /** Close the panel after `run` (default true). */
    close?: boolean;
    run(): void;
};
/** The panel a clickable legend callout deploys: an optional heading over ordered blocks. */
interface LegendCalloutPanel {
    title?: string;
    items: LegendCalloutPanelItem[];
}
/**
 * One host-contributed legend CALLOUT, as the renderer consumes it: a small tinted
 * bubble with a centered icon, visible beside the indicator's legend title while
 * the row is idle (hidden while its hover/selection controls are out). When
 * `content` is present the bubble is clickable and deploys that panel — below the
 * bubble, flipping above when the bottom screen edge is too close. Pure data plus
 * thunks, same rule as {@link LegendActionView}: the shell resolves the plugin
 * descriptor before it reaches the renderer.
 */
interface LegendCalloutView {
    id: string;
    /** Icon id in the core icon registry (`registerIcon`). */
    icon: string;
    /** Bubble fill — any CSS color. */
    background: string;
    /** Icon ink (default: the legend row's text color). */
    color?: string;
    tooltip: string;
    /** Deployed panel — presence makes the bubble clickable. */
    content?: LegendCalloutPanel;
}
/** OHLCV of the price bar under the crosshair (the "data window" source). */
interface CrosshairOHLC {
    time: Millis;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}
interface CrosshairEvent {
    time: Millis | null;
    /** Value at the cursor on ITS pane's scale — a price on the price pane, an
     *  indicator value on a study pane (which one: see {@link paneKind}). */
    price: number | null;
    /** The kind of pane the cursor (and thus `price`) is on — how a consumer tells a
     *  real price from a study-pane value (e.g. crosshair sync only mirrors the
     *  horizontal level from the price pane). Optional and additive: a renderer that
     *  doesn't track panes omits it. */
    paneKind?: 'price' | 'study' | null;
    /** The id of the pane under the cursor — the same id `chart.panes.list()` reports;
     *  null off the plot. Optional and additive, like {@link paneKind}. */
    paneId?: string | null;
    /** Value at the crosshair per series, keyed by stable series id. */
    values: ReadonlyMap<string, number>;
    /** The hovered price bar's OHLCV (null when the cursor is off any bar). */
    ohlc: CrosshairOHLC | null;
}
interface ClickEvent {
    time: Millis | null;
    /** Value at the click on its pane's scale, as {@link CrosshairEvent.price}. */
    price: number | null;
    /** The kind of pane clicked; null off the plot. Optional — a renderer that doesn't track panes omits it. */
    paneKind?: 'price' | 'study' | null;
    /** The id of the pane clicked (as `chart.panes.list()` reports it); null off the plot. Optional. */
    paneId?: string | null;
}
/** A touch long-press on an axis strip — the mobile substitute for a right-click menu. */
interface AxisLongPressEvent {
    axis: 'price' | 'time';
    /** Plot-local pixel of the press (y maps a multi-pane price scale to its pane). */
    x: number;
    y: number;
}
/** One indicator plot's readout line in the data window. */
interface DataWindowRow {
    label: string;
    value: string;
    color: string;
}
/** The OHLCV block of a data-window readout, formatted on the price pane's scale. */
interface DataWindowOHLC {
    o: string;
    h: string;
    l: string;
    c: string;
    vol?: string;
    /** Close ≥ open → tint the values with the up color, else the down color. */
    up: boolean;
}
/** One indicator's readout: its title plus a row per plot. */
interface DataWindowGroup {
    name: string;
    rows: DataWindowRow[];
}
/**
 * A data-window snapshot — the bar's timestamp split into date + time, its OHLCV, and one
 * group per indicator. Every value arrives pre-formatted on the scale of the pane it belongs
 * to, so a host panel lays the readout out without doing any numeric formatting itself.
 */
interface DataWindowReadout {
    /** Bar date, pre-formatted (e.g. `2026-07-03`); empty when there is no bar. */
    date: string;
    /** Bar time of day, pre-formatted `HH:MM`; empty when there is no bar. */
    time: string;
    ohlc: DataWindowOHLC | null;
    groups: DataWindowGroup[];
}
/** Raised by the renderer when the user edits an input in the settings dialog. */
interface InputChangeEvent {
    indicatorId: string;
    key: string;
    value: InputValue;
    /** What was edited: a script input (default) or a declaration prop (the "Properties" tab). */
    kind?: 'input' | 'prop';
}
interface VisibleRange {
    from: Millis;
    to: Millis;
}
/** How {@link IChartRenderer.setVisibleRange} frames a range. */
interface VisibleRangeOptions {
    /** Keep the configured right margin (whitespace past `range.to`) inside the frame. */
    rightMargin?: boolean;
}
/** A user-initiated pane action reported by the renderer (hover buttons / double-clicks). */
type PaneAction = {
    type: 'move';
    paneId: string;
    dir: 'up' | 'down';
} | {
    type: 'remove';
    paneId: string;
} | {
    type: 'collapse';
    paneId: string;
    collapsed: boolean;
} | {
    type: 'maximize';
    paneId: string;
    maximized: boolean;
}
/** The user finished resizing panes (a separator drag or reset); read the new weights back through `paneHeightWeight`. */
 | {
    type: 'resize';
    paneIds: string[];
};
/**
 * The rendering backend abstraction. No backend (e.g. lightweight-charts) types
 * cross this boundary — that is what makes the renderer swappable. The only MVP
 * implementation is `src/renderers/lightweight-charts/LwcRenderer.ts`.
 */
interface IChartRenderer {
    readonly capabilities: RendererCapabilities;
    /** Stable identity of this renderer (e.g. `'native'`, `'lwc'`) — the warn label and `chart.renderer.name`. */
    readonly name: string;
    /** Feature keys this renderer can get/set at runtime via `chart.renderer.set` / `.get`. */
    readonly features: readonly string[];
    /** Apply a supported feature live (the caller has already checked `features`); repaints as needed. */
    applyFeature(key: string, value: unknown): void;
    /** Read a feature's current value (`undefined` if unsupported). */
    readFeature(key: string): unknown;
    mount(container: HTMLElement, theme: VelaTheme): void;
    setTheme(theme: VelaTheme): void;
    /**
     * Adopt the chart's localization: render text through `i18n` and numbers and dates
     * through `i18n.format`, then repaint. Called once after `mount` and again after every
     * `chart.setLocale`. `lang` and `dir` are what the renderer's root element should carry
     * (`null` = leave the attribute alone, the host page decides). Optional: a renderer
     * without it keeps English text and formatting.
     */
    setLocalization?(i18n: Translator, root: RendererRootAttributes): void;
    resize(): void;
    destroy(): void;
    /**
     * Replace all price bars. By default re-frames the view (a fresh series). Pass
     * `{ preserveView: true }` to keep the current viewport — used when extending the
     * same series in place (e.g. swapping a quick preview for the full history) so
     * candles don't jump.
     */
    setBars(bars: OHLCV[], opts?: {
        preserveView?: boolean;
    }): void;
    /** Append a new bar or replace the forming (last) bar, decided by time. */
    updateBar(bar: OHLCV): void;
    /**
     * Set the active symbol's tick size (e.g. `0.01`) so the price axis renders the
     * instrument's true precision. Passed as soon as symbol metadata resolves; `undefined`
     * (or absent) ⇒ the renderer falls back to its zoom-derived decimals. Optional.
     */
    setPricePrecision?(mintick: number | undefined): void;
    /**
     * Set the facts about the active symbol that decide which price styles can draw it
     * (`SymbolFacts`, derived from `SymbolInfo`): passed when they land and again on every
     * symbol change, `null` while unknown. A renderer draws a style the facts rule out
     * (candles for `ohlc: false`) with a close-based fallback instead, keeping the chosen
     * style as its `priceStyle`, and greys such styles in its own pickers. Optional — a
     * renderer without it draws whatever style is set.
     */
    setSymbolFacts?(facts: SymbolFacts | null): void;
    /**
     * Push a bespoke NATIVE-LAYER render payload, keyed by layer `type`. Visuals that aren't
     * ordinary series/fills draw through a dedicated renderer layer instead of the model; this is
     * the channel. Producers are native indicators (`'volume'`, `'vpvr'` — layer config) and core
     * data engines behind a price style (a plugin chart type pushing per-bar secondary data
     * through its own channel). Optional: a renderer without the
     * layers omits it.
     */
    setNativeData?(type: string, data: unknown): void;
    /**
     * Replace the timeline marks + their group definitions (the `chart.marks` model). The
     * renderer snaps each mark onto its bar, folds same-bar/same-group marks into clusters, and
     * paints the lane above the time axis; group visibility is its own display state (the
     * `marks` feature). Present iff `capabilities.timelineMarks`.
     */
    setTimelineMarks?(marks: readonly TimelineMark[], groups: readonly MarkGroup[]): void;
    /** A timeline-mark glyph was clicked — every mark of its cluster is listed. Present iff `capabilities.timelineMarks`. */
    onMarkClick?(cb: (e: MarkClickEvent) => void): Unsubscribe;
    /**
     * Reflect an indicator's live status in its legend row: `'loading'` (a fetch is in flight —
     * spinner), `'live'` (live-updating — a distinct pulse), or `'idle'` (nothing). Optional.
     */
    setIndicatorStatus?(handle: IndicatorRenderHandle, status: IndicatorStatus): void;
    /**
     * A market load is in flight with NO bars painted yet — the first load, or a
     * symbol/timeframe switch (the host clears the old series first). Renderers may show a
     * subtle loading affordance, and must hide any content that does NOT ride the bar series
     * (corner-anchored tables); bar-mapped content vanishes with the cleared series on its
     * own. The host turns the flag off with the first series it hands over (or when a load
     * fails or parks) — the core also mirrors this state to plugins as `load:start`/`load:end`.
     * Optional.
     */
    setLoading?(loading: boolean): void;
    ensurePane(pane: Pane): void;
    removePane(id: string): void;
    /**
     * Move a mounted indicator to another pane (merge/unmerge). `ownScale` gives the
     * indicator its own scale column within the target pane, rescaled so its visible
     * extent lines up with the pane's; omitted/false shares the pane scale. Present iff
     * `capabilities.paneManagement`.
     */
    setIndicatorPane?(handle: IndicatorRenderHandle, paneId: string, opts?: {
        ownScale?: boolean;
    }): void;
    /** Set the top-to-bottom pane display order (an array of pane ids). */
    orderPanes?(orderedIds: string[]): void;
    /** Collapse a pane to a thin strip (legend + expand button) or restore it. */
    setPaneCollapsed?(paneId: string, collapsed: boolean): void;
    /** Maximize one pane to fill the plot, or restore the previous split (`null`). */
    setPaneMaximized?(paneId: string | null): void;
    /**
     * Set a pane's height weight: panes share the plot height in proportion to their weights
     * (collapsed panes aside). The weight must survive later `ensurePane` calls that carry
     * none — only an explicit `heightWeight` replaces it.
     */
    setPaneHeightWeight?(paneId: string, weight: number): void;
    /** A pane's current height weight, or null when the renderer has no such pane. */
    paneHeightWeight?(paneId: string): number | null;
    /**
     * The renderer reports a user-initiated pane action (from a pane hover button or a
     * double-click). The host/core reflects it: `'remove'` tears down the pane's
     * indicators; the rest are already applied by the renderer and just keep core's
     * `chart.panes` view in sync. Present iff `capabilities.paneManagement`.
     */
    onPaneAction?(cb: (action: PaneAction) => void): Unsubscribe;
    /**
     * The renderer reports a user request to move/merge an indicator to another pane, made
     * from its own in-chart UI (the legend "Move to" menu or a legend-row drag). Core routes
     * it through `moveIndicator`. Present iff `capabilities.paneManagement`.
     */
    onMoveIndicator?(cb: (id: string, target: MoveTarget) => void): Unsubscribe;
    /** Mount an indicator's series + its in-chart legend/settings UI. */
    mountIndicator(model: IndicatorModel): IndicatorRenderHandle;
    updateIndicator(handle: IndicatorRenderHandle, patch: ScenePatch): void;
    removeIndicator(handle: IndicatorRenderHandle): void;
    /** Reflect a programmatic input change in the renderer's settings UI. `props`
     *  (when given) refreshes the declaration-prop values the same way. */
    setIndicatorInputs(handle: IndicatorRenderHandle, values: Record<string, InputValue>, props?: Record<string, InputValue>): void;
    /**
     * Supply a symbol picker so the settings dialog's `input.symbol` control opens the host's own
     * ticker-selection UI (the host wires this). Optional — without it, `input.symbol` is a plain
     * text field. Pass `null` to detach.
     */
    setSymbolPicker?(picker: SymbolPickerFn | null): void;
    /**
     * Supply the HOST-CONTRIBUTED actions of each legend row (the shells wire the plugin
     * registry through this — see `registerLegendAction`). The provider is called per row,
     * lazily, so `when()` gates and late registrations resolve at render time; calling this
     * again replaces the provider AND re-projects the rows already on screen. Optional — a
     * renderer without it simply never shows contributed legend actions.
     */
    setLegendActions?(provider: ((indicatorId: string) => LegendActionView[]) | null): void;
    /**
     * Supply the HOST-CONTRIBUTED actions of each drawing (the shells wire the plugin
     * registry through this — see `registerDrawingAction`). The provider is called with the
     * drawing's id each time its selection toolbar or settings dialog opens, so `when()`
     * gates and late registrations resolve then; an open toolbar keeps the buttons it
     * opened with. Optional — a renderer without it never shows contributed drawing actions.
     */
    setDrawingActions?(provider: ((drawingId: string) => DrawingActionView[]) | null): void;
    /**
     * Supply the HOST-CONTRIBUTED callout bubbles of each legend row (the shells wire
     * the plugin registry through this — see `registerLegendCallout`). Same contract as
     * {@link setLegendActions}: the provider is called per row, lazily; calling this
     * again replaces the provider AND re-projects the rows already on screen. Optional —
     * a renderer without it simply never shows contributed callouts.
     */
    setLegendCallouts?(provider: ((indicatorId: string) => LegendCalloutView[]) | null): void;
    /**
     * Replace the indicator legend's fold toggle with a HOST action (or restore it with
     * null): the chip stays — a list glyph plus the indicator count — but pressing it
     * runs the action instead of unfolding the rows, which stay hidden while the
     * override is in force. Multi-chart shells route it to their indicator overview
     * (e.g. an object-tree panel), where per-indicator controls live instead. Optional —
     * a renderer without a foldable legend omits it.
     */
    setLegendOverviewAction?(action: (() => void) | null): void;
    /**
     * Open the settings dialog of one mounted indicator — the programmatic twin of the
     * legend row's gear button, for host chrome that reaches indicators outside the
     * legend (an object tree's action menu). Silent no-op for an unknown id. Optional —
     * a renderer without per-indicator settings UI omits it.
     */
    openIndicatorSettings?(indicatorId: string): void;
    /**
     * Hide (`false`) or show (`true`) a mounted indicator's visuals while keeping its legend row
     * (marked hidden). Optional — a renderer that can't suppress an indicator omits it (and the
     * core's hide still works for resource suspension; only the in-chart legend eye is unavailable).
     * On show the core re-mounts the indicator, so this need only drop the visuals + flag the row.
     */
    setIndicatorVisible?(handle: IndicatorRenderHandle, visible: boolean): void;
    /**
     * The renderer tells core when the base price style it DRAWS changes — from ANY source
     * (the `priceStyle` feature, the in-chart settings dialog, an applied config template,
     * symbol facts that rule the chosen style out: see {@link setSymbolFacts}).
     * Display state stays renderer-owned; the core listens because some styles carry a
     * DATA requirement (a plugin style may need its data engine running). Optional —
     * a renderer without runtime style switching omits it.
     */
    onPriceStyleChange?(cb: (style: PriceStyle) => void): Unsubscribe;
    /**
     * The renderer tells core that the base price style is ABOUT to change, `from` → `to`
     * — the same sources as {@link onPriceStyleChange} (one runtime write path), called
     * synchronously before the renderer touches its scene, so the chart still paints
     * `from` while the callback runs. Never called for the constructed style or for a
     * write of the style already shown. Callbacks must not change the style themselves.
     * Optional — a renderer without runtime style switching omits it.
     */
    onPriceStyleWillChange?(cb: (from: PriceStyle, to: PriceStyle) => void): Unsubscribe;
    /** The renderer tells core when the user edits an input in-chart. */
    onInputChange(cb: (e: InputChangeEvent) => void): Unsubscribe;
    /** The renderer tells core when the user removes an indicator in-chart (the legend ✕). */
    onRemoveIndicator(cb: (id: string) => void): Unsubscribe;
    /** The renderer tells core when the user toggles an indicator's visibility in-chart (the legend eye). */
    onToggleIndicatorVisible?(cb: (id: string, visible: boolean) => void): Unsubscribe;
    onCrosshairMove(cb: (e: CrosshairEvent) => void): Unsubscribe;
    onClick(cb: (e: ClickEvent) => void): Unsubscribe;
    /** Touch long-press on a price or time axis strip. Optional — a renderer without
     *  touch axis gestures omits it; host chrome (timezone / price-scale sheets) keys off it. */
    onAxisLongPress?(cb: (e: AxisLongPressEvent) => void): Unsubscribe;
    /**
     * Display an EXTERNAL crosshair at a data-space position — a ghost marker driven by
     * another chart (multi-chart crosshair sync), not by this chart's own pointer.
     * `time` is epoch-ms (`null` clears); `price` optionally adds the horizontal line
     * when the caller knows the scales are comparable (same-symbol groups). The ghost
     * must NEVER re-emit `onCrosshairMove` — that one-way rule is what makes the sync
     * loop-free. OPTIONAL — detect by presence (`RendererControl.supportsExternalCrosshair`);
     * a renderer without the seam simply never shows foreign crosshairs.
     */
    setExternalCrosshair?(time: Millis | null, price?: number | null): void;
    /**
     * A pre-formatted readout of the bar under the crosshair — or of the latest bar when the
     * cursor is off the plot, so the snapshot is always useful. Pull it on crosshair movement
     * to drive a host data-window panel. Optional: a renderer that tracks no hovered bar omits
     * it (`RendererControl.dataWindowReadout()` then returns null).
     */
    getDataWindowReadout?(): DataWindowReadout;
    getVisibleRange(): VisibleRange | null;
    /**
     * Frame `range` across the plot width. With `opts.rightMargin`, the renderer also
     * leaves its configured right margin (whitespace past `range.to`, in bars) inside the
     * frame — how a named preset frames the newest bars, so a preset (and "Reset chart
     * view") never drops that margin. A renderer without a right margin ignores the option.
     */
    setVisibleRange(range: VisibleRange, opts?: VisibleRangeOptions): void;
    /**
     * Pan by a fraction of the visible width at constant zoom (positive ⇒ toward the
     * latest bars), behaving exactly like a pointer drag: same pan limits (including the
     * bounded whitespace past the newest bar), eased if the renderer animates pans.
     * OPTIONAL — without it the core falls back to an instant `setVisibleRange` shift.
     */
    panBy?(fraction: number): void;
    onViewportChange(cb: (range: VisibleRange) => void): Unsubscribe;
    /**
     * Export the current chart as a PNG data URL (optional — a renderer that can't
     * rasterize its surface omits it). DOM overlays may not be included.
     */
    screenshot?(): string | null;
    /**
     * Raster of the current chart onto a canvas (optional). Same pixels as
     * {@link screenshot}, for hosts that composite several charts into one image.
     */
    screenshotCanvas?(): HTMLCanvasElement | null;
    /**
     * Snapshot the renderer's full cosmetic configuration as a serializable,
     * versioned document — for persistence (templates, saved user settings).
     * Optional: a renderer without a rich config omits it. The returned value is
     * plain JSON; its concrete shape is renderer-defined.
     */
    getConfig?(): unknown;
    /**
     * Apply a (possibly partial) config document produced by `getConfig()`.
     * Implementations validate untrusted input and ignore unknown/malformed fields,
     * repainting with no indicator re-run.
     */
    applyConfig?(config: unknown): void;
    /**
     * The renderer's cosmetic config changed via {@link applyConfig} — the in-chart
     * settings dialog commits through it, so this is how host chrome mirroring a config
     * value (a bottom-bar timezone, a persisted template) learns about in-chart edits.
     * Re-pull {@link getConfig} / `readFeature` for the new values. Optional — paired
     * with `applyConfig`.
     */
    onConfigChanged?(cb: () => void): Unsubscribe;
    /**
     * The renderer reports a user request to switch the APP THEME, made from its own
     * in-chart UI (the settings dialog's Canvas → Theme row): a built-in theme's name or
     * a registered theme's id. The core owns the canonical theme: it resolves the id,
     * calls {@link setTheme}, and emits `theme:changed` so host chrome follows.
     * Optional — a renderer without an in-chart theme control omits it.
     */
    onThemeSelect?(cb: (theme: ThemeId) => void): Unsubscribe;
    /**
     * Move keyboard focus onto the chart's interactive surface (the element its keyboard
     * shortcuts key off). Optional — a host UI calls it after its own controls steal focus
     * (e.g. a shared workspace toolbar click) so chart/drawing keys keep working.
     */
    focus?(): void;
    /**
     * Close any in-chart dialogs the renderer owns (the indicator settings dialog, the
     * chart-settings gear dialog). Optional — used by a host to keep its own dialogs mutually
     * exclusive with the renderer's. A no-op when nothing is open.
     */
    closeDialogs?(): void;
    /**
     * Open (or toggle) the renderer's own settings dialog, when it has one. `section` names
     * the tab to land on (matched against the dialog's section titles, unknown ones ignored);
     * with a section an already-open dialog switches tab rather than closing.
     */
    openSettingsDialog?(section?: string): void;
    /** A chart type's SDK settings changed (dialog edit / applyConfig) — the core forwards
     *  them to the type's data engine. */
    onChartTypeSettingsChange?(cb: (typeId: string, values: Record<string, unknown>) => void): Unsubscribe;
    /** Host-app settings tabs (callback rows) shown by the renderer's settings dialog.
     *  `id` names a section for the visibility policy (defaults to the title's slug). */
    setSettingsSections?(sections: ReadonlyArray<{
        title: MessageLike;
        rows: readonly unknown[];
        id?: string;
    }>): void;
    /** Settings-dialog visibility policy: `hidden` lists setting ids to hide (a tab, a
     *  group, or a row — subtree semantics). Presentation-only: hidden values keep
     *  being stored and applied. Optional — a renderer without a settings dialog omits it. */
    setSettingsVisibility?(policy: {
        hidden?: readonly string[];
    }): void;
    /** Every addressable setting id of this chart (built-ins, chart-type sections,
     *  host sections) — the discovery surface for the visibility policy. */
    listSettingsIds?(): string[];
    /**
     * The host shell's chrome size class. `'mobile'` asks the renderer's own chrome
     * (dialogs, toolbars, buttons) for its touch-first presentation — fullscreen
     * dialogs, no hover-gated affordances; `'desktop'` (the default) keeps the
     * pointer-first one. Optional — a renderer without adaptive chrome omits it.
     */
    setLayoutMode?(mode: 'mobile' | 'desktop'): void;
    /**
     * Drive the renderer's time-of-day displays (the countdown-to-bar-close chip) from the
     * HOST's second pulse instead of the renderer's own, so they read the same second as
     * the host's clock chrome. `null` restores the renderer's own pulse. Optional — a
     * renderer without time-of-day chrome omits it.
     */
    setWallClock?(clock: WallClock | null): void;
    /**
     * Interactive user-drawings surface. Present iff `capabilities.userDrawings`.
     * The core `DrawingController` drives it (commands down) and listens for
     * intents (up); a renderer without drawing tools simply omits it.
     */
    readonly userDrawingsPort?: IDrawingsRendererPort;
}

/** A named visible-range shortcut, resolved against the loaded bars. */
type VisibleRangePreset = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'YTD' | 'ALL';

/** A registered data-provider name (any string; matched case-insensitively). */
type ProviderName = string;
/**
 * Which trading session the chart shows, on markets that have one: `regular` = RTH
 * (09:30–16:00 for US equities), `extended` = ETH (pre/post-market included). The
 * provider owns the actual filtering — the flag rides every data request. Meaningless
 * (and ignored end-to-end) on continuous markets like crypto.
 */
type MarketSession = 'regular' | 'extended';
/** How the chart obtains its candles. */
interface MarketConfig {
    /** The market's symbol. A bare ticker (`'BTCUSDT'`) resolves against the registered
     *  providers in DECLARATION order (first one whose index lists it); an
     *  `EXCHANGE:` prefix (`'coinbase:BTC-USD'`, case-insensitive) pins the venue. */
    symbol?: string;
    timeframe?: string;
    bars?: number;
    /** Trading session to show ({@link MarketSession}). Absent = the provider's default
     *  (`regular` on session markets); continuous markets ignore it entirely. */
    session?: MarketSession;
    /**
     * The window to frame on the FIRST paint — a preset name (`'1D'`, `'YTD'`, …) or an
     * explicit `{from, to}`. Set it when the initial view is known up front (a range
     * chip, a shared link): the chart then loads the depth in ONE pass and paints the
     * requested window straight away, instead of flashing its fast recent-bars preview
     * and re-framing a moment later.
     */
    visibleRange?: VisibleRangePreset | VisibleRange;
    /** Offline bars instead of a provider; when set, no network fetch happens. */
    data?: OHLCV[];
}
/**
 * One in-place market switch — the argument of `chart.setMarket(next)`. Only the fields
 * given change; the rest of the market keeps its current value. `data` switches to
 * offline bars (and giving `symbol`/`provider` WITHOUT `data` drops a previous offline
 * dataset — back to the provider path). `visibleRange` frames the FIRST paint of the
 * new market (a range chip switching timeframe + depth + window in one call).
 */
interface MarketSwitch {
    /** Bare ticker (provider resolved by declaration order) or `EXCHANGE:`-prefixed. */
    symbol?: string;
    timeframe?: string;
    bars?: number;
    /** Switch the shown trading session (reloads like a timeframe change). */
    session?: MarketSession;
    data?: OHLCV[];
    visibleRange?: VisibleRangePreset | VisibleRange;
}
/**
 * The chart's current market identity — `chart.market`, the read counterpart of
 * `setMarket`. A SNAPSHOT of the requested market (mutating it changes nothing): it
 * reflects a switch as soon as `setMarket` is called, not when the load lands — the
 * "what is this chart showing/loading right now" answer. `offline` is true when the
 * chart runs on an inline `data` array instead of a provider.
 */
interface MarketSnapshot {
    symbol?: string;
    /** The venue the symbol PINS (its `EXCHANGE:` prefix, lower-cased) — undefined for a
     *  bare symbol. The venue that actually served it: `chart.data.resolve(symbol)`. */
    provider?: ProviderName;
    timeframe?: string;
    bars?: number;
    /** The shown trading session — undefined = the provider's default (regular). */
    session?: MarketSession;
    offline: boolean;
}
interface VelaTheme {
    background: string;
    textColor: string;
    gridColor: string;
    borderColor: string;
    upColor: string;
    downColor: string;
    fontFamily: string;
    /** The UI's settings beyond these colors: brand color, radius scale, font, any token,
     *  component settings. The chrome builds its tokens from the colors and these. */
    ui?: ThemeSettings;
}
type ThemeName = 'dark' | 'light';
/** A built-in theme's name, or the id of one added with `registerTheme`. */
type ThemeId = ThemeName | (string & {});
/** A renderer **class** — Vela instantiates it with the resolved display options.
 *  Built-in default: `NativeRenderer`.
 *  from `'vela/renderers/lwc'` and pass it as `options.renderer`. */
type RendererConstructor = new (opts?: RendererDisplayOptions) => IChartRenderer;
/** The chart's options. Its {@link LocalizationOptions} (`locale`, `direction`, `messages`,
 *  `numberingSystem`, `hourCycle`, `weekStart`, `formatters`) change at runtime through
 *  `chart.setLocale`. */
interface VelaOptions extends MarketConfig, LocalizationOptions {
    /** false = static history; true = history + live forming candle. */
    live?: boolean;
    /** A built-in or registered theme by id, the chart's seven colors and font (with `ui`
     *  settings), or a whole theme from `createTheme`. */
    theme?: ThemeId | VelaTheme | UiTheme;
    height?: number | string;
    /** Rendering backend as a renderer **class** that Vela instantiates (with the
     *  resolved display options). Omit for the built-in native renderer (default); for
     **/
    renderer?: RendererConstructor;
    /** Scripting language used when `addIndicator` doesn't specify one. Default `'pine'`
     *  (or the first injected engine's language). */
    defaultLanguage?: string;
    /** Show the dashed line + axis label at the latest price (default true). */
    currentPriceLine?: boolean;
    /** Use a logarithmic price scale on the price pane (default false). */
    logScale?: boolean;
    /** Native geometry backend: `'auto'` (WebGL2 if available, else canvas2d),
     *  or force `'canvas2d'` / `'webgl2'`. Native renderer only. */
    nativeBackend?: NativeBackend;
    /** Native-renderer animations. `true`/`false` toggles all; an object configures
     *  each motion independently — on/off, or its ease duration in ms. Default: eased
     *  **zoom on**, inertial **pan on but snappy** (short glide), gliding **autoscale
     *  on**, first-paint **reveal on**, live-bar glide **off**. Set `{ pan: false }` for an
     *  instant pan with no momentum, `{ zoom: 150 }` for a slower zoom glide,
     *  `{ liveBar: true }` (or a duration in ms) to make the forming candle slide toward
     *  each live tick instead of snapping, `{ intro: false }` to skip the reveal. */
    animations?: boolean | AnimationConfig;
    /** Neon glow/bloom intensity for line series (0 = off, ~0.6 = strong). WebGL2 only
     *  — the canvas2d backend ignores it. Default 0. */
    glow?: number;
    /** Bullish candle body/wick color (native renderer). Defaults to the theme's up color (the
     *  palette's bullish green in the built-in themes), which a theme switch then follows. */
    upColor?: string;
    /** Bearish candle body/wick color (native renderer). Defaults to the theme's down color
     *  (the palette's bearish red in the built-in themes), which a theme switch then follows. */
    downColor?: string;
    /** How the base price series is drawn (native renderer): candlestick / OHLC bars /
     *  line / area / baseline. Default `'candles'`. */
    priceStyle?: PriceStyle;
    /** Interactive user drawings (native renderer). Default: toolbar VISIBLE with the
     *  default tool set. `false` hides the toolbar (the `chart.drawings` API still works
     *  headlessly); an object picks tools (`{ tools: [...] }`) or defines groups
     *  (`{ groups: [...] }`) and toggles the toolbar (`{ toolbar: false }`). */
    drawings?: DrawingsOption;
    /** The built-in volume indicator: per-bar volume columns anchored to the bottom of the
     *  price pane, on their own scale (they never affect the price autoscale). Added
     *  automatically on chart creation (native renderer) — pass `false` to opt out. */
    volume?: boolean;
    /** Settings-dialog visibility policy. Default: everything visible. `hidden` lists
     *  setting ids to hide — a tab (`'canvas'`), a group (`'canvas.grid'`), or a single
     *  row (`'canvas.grid.vertical'`); an id hides its whole subtree, and a tab with
     *  nothing left disappears from the rail. Hiding is presentation-only: hidden
     *  values keep being stored and applied. Enumerate the addressable ids of a live
     *  chart with `chart.renderer.listSettingsIds()`; the catalog is documented in
     *  docs/user/options.md. */
    settings?: SettingsVisibilityPolicy;
    /** Price-axis customization (native renderer): `ticks` replaces the built-in tick
     *  ladder of every pane's price axis — labels and horizontal gridlines together. */
    priceAxis?: PriceAxisOptions;
    /** Free panning (native renderer): unlock manual scaling on drag so one gesture pans
     *  time and price together (`true` / `'drag'`, `'alt'`, `'shift'`, `'mod'`, or a custom
     *  predicate; `false` by default). Seeds the runtime `freePan` feature and `priceScale.freePan`. */
    freePan?: FreePanTrigger;
}
/** Pointer press state handed to a custom {@link FreePanTrigger} predicate. */
interface FreePanEvent {
    readonly button: number;
    readonly altKey: boolean;
    readonly shiftKey: boolean;
    readonly ctrlKey: boolean;
    readonly metaKey: boolean;
    readonly pointerType: string;
}
/** Which pointer gesture unlocks manual scaling to pan time and price together on an
 *  auto-scaled pane: `true` / `'drag'` = plain primary drag, `'alt'` / `'shift'` /
 *  `'mod'` = modifier + primary drag, or a predicate `(e: FreePanEvent) => boolean`
 *  for any custom button or modifier chord. `false` = off. */
type FreePanTrigger = boolean | 'drag' | 'alt' | 'shift' | 'mod' | ((e: FreePanEvent) => boolean);
/** Price-axis customization (see `VelaOptions.priceAxis`). */
interface PriceAxisOptions {
    /** Supplies the ticks of each pane's price axis — the labels and the horizontal
     *  gridlines both follow them. Called per pane when the pane's range, size or mode
     *  changes. Returning `null`/`undefined` keeps the built-in ticks. Seeds the native
     *  renderer's runtime `priceAxisTicks` feature; `null` (the default) = built-in ticks. */
    ticks?: PriceAxisTicksFn | null;
}
/** One price-axis tick: a gridline at `price` and its axis label. */
interface PriceAxisTick {
    /** Where the tick sits, in prices (also in percent/indexed mode). */
    price: number;
    /** The axis label, drawn as given. */
    label: string;
    /** true = emphasized (semibold), false = de-emphasized (muted), omitted = the regular label. */
    major?: boolean;
}
/** What a {@link PriceAxisTicksFn} receives for one pane. */
interface PriceAxisTickContext {
    /** The pane whose axis is being built. */
    pane: {
        id: string;
        kind: 'price' | 'study';
    };
    /** The pane's visible value range, in prices (also in percent/indexed mode). */
    min: number;
    /** Upper end of the visible range, in prices. */
    max: number;
    /** Whether the pane's scale is logarithmic. */
    log: boolean;
    /** Pane height in CSS px. */
    height: number;
    /** The mode the axis labels render in this frame. */
    mode: 'price' | 'percent' | 'indexed';
    /** The percent/indexed baseline price (undefined in price mode). */
    baseline?: number;
    /** The symbol's tick size, when known. */
    mintick?: number;
    /** The axis font size in px. */
    fontSize: number;
    /** A price's pane-relative y in CSS px (honours log and inverted scales). */
    priceToY(price: number): number;
    /** Vela's own ticks for this frame — return them, or a filtered/extended copy, to build on the default. */
    defaults: readonly PriceAxisTick[];
}
/**
 * Builds a pane's price-axis ticks. Return the ticks to draw (an empty array draws none),
 * or `null`/`undefined` to keep the built-in ones. Entries with a non-finite `price` or a
 * non-string `label` are dropped; a function that throws falls back to the built-in ticks.
 */
type PriceAxisTicksFn = (ctx: PriceAxisTickContext) => readonly PriceAxisTick[] | null | undefined;
/** Settings-dialog visibility policy (see `VelaOptions.settings`). */
interface SettingsVisibilityPolicy {
    /** Setting ids to hide — a tab, a group, or a row; an id hides its subtree. */
    hidden?: readonly string[];
}
/**
 * Per-feature native-renderer animation settings. Every eased motion takes
 * `boolean | number`: `false`/`0` = off (the motion is instant), `true` = the built-in
 * duration, a number = its ease time-constant in ms — the motion covers ~63% of the
 * remaining distance per time-constant and is visually settled after about three of
 * them (clamped to {@link ANIMATION_EASE_MAX_MS}).
 */
interface AnimationConfig {
    /** Eased cursor-anchored wheel-zoom: the bar spacing glides toward each wheel notch's
     *  target instead of jumping. Default `true` ({@link ZOOM_EASE_DEFAULT_MS}). */
    zoom?: boolean | number;
    /** Inertial/kinetic pan on touch — the velocity a finger flick releases with decays
     *  over this time-constant (a short, snappy glide by default; `false` stops dead). A
     *  mouse release always stops dead. Default `true` ({@link PAN_INERTIA_DEFAULT_MS}). */
    pan?: boolean | number;
    /** The programmatic scroll glide — the scroll-to-latest button, `chart.panBy`, the
     *  keyboard pan keys — easing the view toward its target at constant zoom. Default:
     *  follows `pan` on/off, at {@link SCROLL_EASE_DEFAULT_MS} when on. */
    scroll?: boolean | number;
    /** Autoscale glide: while a zoom or fling is in flight the price scale eases toward
     *  its new window instead of snapping every frame. Default `true`
     *  ({@link AUTOSCALE_EASE_DEFAULT_MS}). */
    autoscale?: boolean | number;
    /** Glide of the forming bar: on a live tick the displayed high/low/close ease toward
     *  the new values instead of snapping (the price line and axis label follow). `true`
     *  uses the default duration ({@link LIVE_BAR_EASE_DEFAULT_MS}); a number is the ease
     *  time-constant in ms (visually settled after ~3×; clamped to
     *  {@link LIVE_BAR_EASE_MAX_MS}); `false`/`0` snaps. A new bar always snaps. Default
     *  `false` — the painted candle is then never behind the real data. */
    liveBar?: boolean | number;
    /** The first-paint reveal: candles draw themselves in, left to right, when they first
     *  appear. `true` = the default `'settle'` style (an overshoot that eases back);
     *  `'grow'` = a plain ease-out; `false` = no reveal; an object picks the style and/or
     *  the `duration` of the whole sweep in ms (default {@link INTRO_DURATION_DEFAULT_MS};
     *  clamped to {@link INTRO_DURATION_MAX_MS}). Default `true`. */
    intro?: boolean | IntroStyle | IntroConfig;
}
/** The first-paint reveal styles: `settle` overshoots and eases back, `grow` eases out. */
type IntroStyle = 'settle' | 'grow';
/** Object form of `animations.intro` — style and/or sweep duration (ms). */
interface IntroConfig {
    style?: IntroStyle;
    duration?: number;
}
/** A resolved `animations.intro`: `style: false` = no reveal. */
interface IntroAnimation {
    style: IntroStyle | false;
    duration: number;
}
/** Native geometry-layer backend selection. */
type NativeBackend = 'auto' | 'canvas2d' | 'webgl2';
/** How the base price series is drawn on the price pane (native renderer).
 *  A plugin chart type (registered via `vela/plugin`) adds its own id to this union
 *  volume-at-price (plus a right-edge visible-range profile); it needs the
 *  provider+symbol to expose trade data — without it, plain candles render.
 *  `'linemarkers'` is the close line with a dot on each bar (when bars are spaced
 *  enough to tell the dots apart), `'stepline'` holds each close flat until the next
 *  bar, and `'columns'` draws a column per bar from the bottom of the pane up to its
 *  close, up-colored when the close is at or above the previous close — the styles
 *  that read best on series with one value per bar.
 *  `'heikinashi'` draws Heikin Ashi candles: a 1:1 display transform of the raw
 *  bars applied at the core's bar seam, so indicators compute on the same
 *  smoothed values the chart shows (raw data stays untouched underneath). */
/** Built-in styles plus any id registered through the chart-type SDK (`registerChartType`). */
type PriceStyle = 'candles' | 'bars' | 'line' | 'linemarkers' | 'stepline' | 'area' | 'baseline' | 'columns' | 'heikinashi' | (string & {});
/** Display options passed to a renderer at construction. */
interface RendererDisplayOptions {
    currentPriceLine: boolean;
    logScale: boolean;
    nativeBackend: NativeBackend;
    animZoom: number;
    animPan: number;
    animScroll: number;
    animAutoscale: number;
    animLiveBar: number;
    animIntro: IntroAnimation;
    glow: number;
    upColor: string;
    downColor: string;
    priceStyle: PriceStyle;
    /** Host price-axis ticks (`VelaOptions.priceAxis.ticks`); absent/null = built-in ticks. */
    priceAxisTicks?: PriceAxisTicksFn | null;
    /** Free panning (`VelaOptions.freePan`); absent = off. */
    freePan?: FreePanTrigger;
}
/**
 * Where to move an indicator (via `handle.moveTo(...)`):
 * - `'price'` — merge into the main price pane (on its own scale unless it's a
 *   price-unit overlay).
 * - `{ pane: id }` — merge into an existing pane (identified by `Pane.id`).
 * - `{ newPane: {...} }` — create a fresh pane, optionally placed relative to an
 *   existing one (`before`/`after` its pane id); default is a new pane at the bottom.
 */
type MoveTarget = 'price' | {
    pane: string;
} | {
    newPane: {
        before?: string;
        after?: string;
    } | true;
};
/** A pane and the indicators it holds — a `chart.panes.list()` entry. */
interface PaneInfo {
    id: string;
    kind: 'price' | 'study';
    /** Display order, top-to-bottom (0 = topmost, the price pane). */
    order: number;
    collapsed: boolean;
    maximized: boolean;
    /** The pane's share of the plot height relative to the other panes (the price pane
     *  defaults to 3, study panes to 1 on the native renderer). Absent on a renderer that
     *  doesn't report pane sizes. */
    heightWeight?: number;
    indicators: Array<{
        id: string;
        title: string;
        shorttitle?: string;
        ownScale: boolean;
    }>;
}
/** Options for `chart.addIndicator(source, options?)`. */
interface AddIndicatorOptions {
    /**
     * The indicator's id — an opaque, non-empty string the host owns (a document key, an
     * editor tab, a UUID). It is what `handle.id`, `chart.indicators()`, the `indicator:*`
     * events, `script:run`, and the legend/pane surfaces carry, so a host that supplies
     * it can address the indicator without keeping a side map. Omit it and the chart
     * mints one (stable for the chart's lifetime, not across reloads). An id already live
     * on this chart is rejected: `addIndicator` throws, `runIndicator`/`runScript`
     * resolve `{ ok: false }` — never renamed silently.
     */
    id?: string;
    /** Which registered engine runs this script (by language id). Default: the chart's `defaultLanguage`. */
    language?: string;
    /** Input overrides, keyed by input title or varId. */
    inputs?: Record<string, InputValue>;
    /** Declaration-property overrides (a strategy's `initial_capital`, an indicator's
     *  `precision`, …), keyed like the engine's props schema. Ignored by engines
     *  without props support. */
    props?: Record<string, InputValue>;
    /** Force overlay-vs-pane placement (default: read from `indicator(overlay=…)`). */
    overlay?: boolean;
    /** Explicit pane placement. */
    pane?: 'price' | 'new';
    /** Display title override. */
    title?: string;
}

/**
 * Facts about one symbol, stated by its data source (`DataProvider.getSymbolInfo`): the
 * chart reads the typed keys below, and engines receive the whole record (e.g. Pine
 * `syminfo.*`). Free-form beyond them — engines read the keys they understand and
 * synthesize a fallback for the rest. Every typed key but `ticker` is optional, and an
 * absent one means the usual behavior.
 */
interface SymbolInfo {
    ticker: string;
    /**
     * The market's IANA time zone (`'America/New_York'`, `'Etc/UTC'`): the zone `session`
     * and `session_extended` are written in, and the zone the "exchange" display time zone
     * follows. Absent or empty ⇒ `'Etc/UTC'`.
     */
    timezone?: string;
    /**
     * The regular trading hours, `HHMM-HHMM` in {@link timezone} (`'0930-1600'`; `2400` is
     * the end of the day). A non-empty session value marks a market with calendar-driven
     * trading hours. Session shading requires a parseable range.
     * `'24x7'`, empty or absent ⇒ a continuous market.
     */
    session?: string;
    /**
     * The whole extended tape, `HHMM-HHMM` in {@link timezone}, containing the `session`
     * window (`'0400-2000'`). A span that wraps midnight (`'1700-1600'`) marks a market whose
     * trading day runs from evening to evening. Absent ⇒ the whole civil day.
     */
    session_extended?: string;
    /**
     * `false` when the source serves no extended-hours bars for this symbol. The workspace
     * hides its session controls while {@link session} and {@link timezone} still describe
     * the market's regular hours. Absent or `true` ⇒ the `session` value governs the controls.
     */
    has_extended_hours?: boolean;
    /**
     * The timeframes the source serves for this symbol. Timeframe strings use the uppercase
     * canonical form: `'1D'` (or `'D'`), `'W'`, `'1M'` (or `'M'`), `'3M'`, `'12M'`, or bare
     * minutes such as `'60'`. Keep these strings canonical. When absent, the workspace
     * offers its usual timeframe choices. `info().supportedTimeframes` is informational.
     */
    timeframes?: {
        /** The finest timeframe served. Every coarser one is served too, unless `list` is present. */
        finest: string;
        /** The source's own frequency: the natural timeframe to show the symbol in. */
        default?: string;
        /** When present, the EXHAUSTIVE list of timeframes served. */
        list?: readonly string[];
    };
    /**
     * `false` when the source has no volume data for this symbol: the chart then does not
     * add its volume indicator on its own (one the user added or saved stays). Absent or
     * `true` ⇒ volume as usual.
     */
    volume?: boolean;
    /**
     * `false` when the source has ONE value per bar for this symbol, at every timeframe:
     * open = high = low = close, so open, high and low carry no information (a
     * macro-economic series). The chart then draws it with a style that reads the close
     * (a line) whatever style is chosen, and its style pickers grey out the styles that
     * need open, high and low (candles, bars, Heikin Ashi). Absent or `true` ⇒ normal OHLC
     * bars. State it here: the chart never guesses it from the symbol's type or its bars.
     */
    ohlc?: boolean;
    [key: string]: unknown;
}
/**
 * The subset of {@link SymbolInfo} that controls chart display once the symbol's info
 * lands (`chart.symbolFacts()`) and that chart types can read in their `supports` predicate.
 */
interface SymbolFacts {
    /** Smallest price increment, when the source provides it. */
    mintick?: number;
    /** `false`: one value per bar — open, high and low carry no information. */
    ohlc?: boolean;
    /** `false`: the source has no volume for this symbol. */
    volume?: boolean;
}
/**
 * The market-data abstraction. Vela OWNS the candles: it loads history and
 * streams live ticks through this port, holds the one canonical bar array, and
 * hands it to whichever engine executes. Decoupled from scripting so every
 * registered engine shares the same dataset (no per-engine re-fetch).
 *
 * Swappable: the default is `MultiProviderFeed` (a registry of `DataProvider`s); tests
 * inject a fake; a host app can supply its own backend.
 */
/** A bounded fetch window (epoch ms). `from`/`to` inclusive-ish; `limit` caps the count. */
interface BarRange {
    /** Oldest bar open-time to fetch from (inclusive). */
    from?: number;
    /** Newest bar open-time to fetch to (defaults to "now" when omitted). */
    to?: number;
    /** Max bars. */
    limit?: number;
    /**
     * Trading session to serve (`'regular'` | `'extended'`) — rides every request on
     * markets that have sessions; absent = the provider's default. A provider without
     * a session concept ignores it.
     */
    session?: string;
}
interface MarketDataFeed {
    /**
     * Load the initial history (from a provider or the offline `data` array).
     *
     * Every bar method — `load`, `loadProgressive`, `loadRange` — rejects with a
     * `DataUnavailableError` when the source refuses the series for good. On the chart's
     * own market the chart then ends the load, stops live updates and fires
     * `data:unavailable`; on a secondary series the rejection reaches the engine through
     * `fetchSeries`. Feeds should keep transient failures out of this channel.
     */
    load(cfg: MarketConfig): Promise<OHLCV[]>;
    /**
     * Progressive load: emit growing snapshots while the source heals a cold symbol,
     * resolve with the final answer — `DataProvider.getBarsProgressive` semantics
     * (cumulative, confirmed-from-the-newest-bar snapshots; each extends the last).
     * Resolves NULL when the resolved source lacks the capability — the caller then
     * runs its non-progressive paths (single load, deep head + backfill) untouched.
     */
    loadProgressive?(cfg: MarketConfig, onBatch: (bars: OHLCV[]) => void, opts?: {
        signal?: AbortSignal;
    }): Promise<OHLCV[] | null>;
    /** Subscribe to live forming-candle ticks. Returns an unsubscribe fn. */
    subscribe(cfg: MarketConfig, onBar: (bar: OHLCV) => void): Unsubscribe;
    /** Optional symbol metadata for engines that need it; absent/undefined ≡ engine synthesizes. */
    symbolInfo?(cfg: MarketConfig): SymbolInfo | undefined;
    /**
     * Fetch a bounded range. Used by the cache to pull ONLY the uncached tail
     * (newly-closed + forming bars) instead of re-downloading the whole window.
     * Absent ≡ no ranged support; the cache falls back to a full `load`.
     */
    loadRange?(cfg: MarketConfig, range: BarRange): Promise<OHLCV[]>;
    /**
     * Report that a symbol cannot be served by anything registered — the load is PARKED
     * (it resumes if a capable provider registers later). Hosts surface this instead of
     * leaving a silently blank chart. Absent ≡ the feed never parks.
     */
    onUnresolved?(cb: (info: {
        symbol: string;
        providers: string[];
    }) => void): Unsubscribe;
    /** Release feed-owned resources (parked waits, timers). Absent ≡ nothing to release. */
    destroy?(): void;
}

/**
 * A descriptor for one symbol a provider serves. Powers the eager index built at
 * registration (for bare-symbol resolution) and symbol autocomplete.
 */
interface SymbolDescriptor {
    /** The ticker exactly as the provider expects it (e.g. `BTCUSDT`, `BTCUSDT.P`). */
    ticker: string;
    /** Human-readable label (e.g. `Bitcoin / TetherUS`). */
    description?: string;
    /** Instrument class, free-form (e.g. `crypto`, `futures`, `stock`). */
    type?: string;
    /**
     * The GROUP this row belongs to (futures: the product root — `ES1!` and `ES2!`
     * carry `group: "ES"`). The group's own row repeats the value in `ticker` with a
     * distinguishing `type` and is NOT directly loadable — pickers fold members under
     * it and load the member marked {@link default} when the group itself is picked.
     */
    group?: string;
    /**
     * The member a picker loads when its whole GROUP is picked. At most one per group;
     * the agreed fallback for zero-or-many is the group's FIRST listed member, so
     * providers emit members in deliberate order.
     */
    default?: boolean;
    /**
     * The provider-side market (product class) serving this symbol, on providers whose
     * markets differ in session shape (futures: index, grains, energy… hours differ on
     * one source). Consumers resolving per-market vocabulary (session template,
     * calendar windows) key on it; absent where the market is unambiguous.
     */
    market?: string;
    /**
     * The instrument's LISTING-venue prefix (`NASDAQ`, `NYSE`, `AMEX`) — a property of the
     * SYMBOL, not of the provider: AAPL is Nasdaq-listed and IBM NYSE-listed even when one
     * provider supplies both tapes. When declared, it is what pickers/legends display, what
     * `PREFIX:TICKER` strings resolve against (TradingView parity: `NYSE:AAPL` is NOT
     * found), and what the canonical committed/persisted form carries. Absent on venues
     * where the provider IS the identity (crypto, fx) — the provider name prefixes those.
     */
    prefix?: string;
    /** Owning provider name — annotated by the registry aggregation (badges in pickers). */
    provider?: string;
}
/** What a provider can do — lets the registry/UI reason without provider-specific checks. */
interface ProviderCapabilities {
    /** Implements `listSymbols()` (enumeration → eager index + autocomplete). */
    enumerate: boolean;
    /** Implements `subscribe()` (true streaming; otherwise the feed polls `getBars`). */
    stream: boolean;
    /** Implements `getSymbolInfo()` (per-symbol metadata for engine `syminfo.*`). */
    symbolInfo: boolean;
}
/** Provider metadata, surfaced via `chart.data.providers()`. */
interface ProviderInfo {
    /** Stable id (the registration name, lower-cased). */
    name: string;
    /** Display label (e.g. `Binance`). */
    displayName?: string;
    /** Whether the provider needs `configure()` before use. */
    requiresApiKey?: boolean;
    /**
     * Timeframes the provider serves, in the uppercase canonical form of
     * `SymbolInfo.timeframes` (`'1D'`/`'D'`, `'W'`, `'1M'`/`'M'`, bare minutes such as
     * `'60'`; never lowercase). Informational; a symbol's own `timeframes` overrides it.
     */
    supportedTimeframes?: readonly string[];
    capabilities: ProviderCapabilities;
}
/**
 * A market-data source for ONE venue, neutral to Vela (no scripting-engine types). Register
 * one with `chart.data.registerProvider(name, provider)`; the registry routes any
 * `name:SYMBOL` (or bare `SYMBOL` it indexes) to it.
 *
 * Only `getBars` is required. Everything else is a progressive capability the
 * registry uses when present and degrades around when absent — the same
 * philosophy as the {@link MarketDataFeed} port.
 */
interface DataProvider {
    /**
     * Fetch bars for `ticker`/`timeframe`. `ticker` is exactly what the user typed
     * minus any `provider:` prefix; any `.ext` suffix is KEPT (the provider owns its
     * meaning — e.g. Binance `.P` = perpetual). The newest bar is treated as the
     * forming candle. Bars: `{ time (open, epoch ms), open, high, low, close, volume? }`,
     * sorted + de-duplicated by open-time.
     *
     * A thrown error is logged and read as an empty answer. To say the series is never
     * served — a timeframe finer than the series' own — throw a `DataUnavailableError`
     * instead (`{ reason: 'timeframe', finest, default }`): the chart stops asking for it.
     */
    getBars(ticker: string, timeframe: string, range: BarRange): Promise<OHLCV[]>;
    /**
     * Progressive variant of {@link getBars}, for sources that HEAL a cold symbol while
     * answering: instead of holding the load until the whole depth converged, the
     * provider emits growing snapshots as history lands and the chart paints each one.
     * Every `onBatch` list (and the resolved final list) is the WHOLE answer so far —
     * ascending, and CONFIRMED from its newest bar backward: a snapshot is cut at the
     * newest stretch the SOURCE still owes (its own accounting of unanswered work,
     * oldest-last), NEVER inferred from bar-time gaps — markets hold real empty
     * stretches (holidays, quiet sessions) that must flow through immediately. Bars
     * never move or vanish between snapshots; each extends the previous one. The
     * resolved value is the final answer. `opts.signal` aborts the stream — the chart
     * switched away: stop polling PROMPTLY and resolve with whatever is confirmed
     * (an abandoned load left polling starves the browser's per-host connection pool
     * and the next symbol with it). Absent ≡ single-answer `getBars` semantics.
     */
    getBarsProgressive?(ticker: string, timeframe: string, range: BarRange, onBatch: (bars: OHLCV[]) => void, opts?: {
        signal?: AbortSignal;
    }): Promise<OHLCV[]>;
    /** Provider metadata. Absent ⇒ the registry synthesizes a record from the methods present. */
    info?(): ProviderInfo;
    /**
     * Enumerate the symbols this provider serves — drives the eager index built when
     * the provider registers. Absent ⇒ no index: the provider can only be reached by
     * an explicit `name:SYMBOL` prefix, never by resolving a bare symbol.
     */
    listSymbols?(): Promise<SymbolDescriptor[]>;
    /**
     * Per-symbol facts ({@link SymbolInfo}): the chart reads the typed ones (time zone,
     * sessions, timeframes, volume), engines receive the whole record as `syminfo.*`.
     * Absent ⇒ the engine synthesizes a fallback and the chart assumes the usual behavior.
     */
    getSymbolInfo?(ticker: string): Promise<SymbolInfo | undefined>;
    /**
     * The icon URL for one of THIS provider's symbols — the provider owns the knowledge
     * of where its asset class's icons live (a crypto CDN, a self-hosted store), the
     * shells own the rendering (round badge, colored-initials fallback). Called lazily,
     * per RENDERED row — never per index build — so it must be cheap and synchronous.
     * `undefined` ⇒ no icon (the initials badge shows). Absent ⇒ same. The URL must be
     * CORS-clean (`Access-Control-Allow-Origin`) or drawing it taints the canvas and
     * breaks the PNG export — a load error falls back to initials either way.
     */
    resolveSymbolIcon?(symbol: SymbolDescriptor): string | undefined;
    /**
     * Open a true live stream for `ticker`/`timeframe`. Each call to `onBar` delivers
     * the forming candle (or a freshly-closed one). Returns an unsubscribe fn. Absent
     * ⇒ the feed polls `getBars` for ticks instead. `opts.session` names the trading
     * session the chart is showing (see {@link BarRange.session}) — a provider whose
     * live source cannot filter by session may fall back to polling internally.
     */
    subscribe?(ticker: string, timeframe: string, onBar: (bar: OHLCV) => void, opts?: {
        session?: string;
    }): Unsubscribe;
    /**
     * Resolved market-calendar windows over `[range.from, range.to)`: ascending epoch-ms
     * `[start, end)` pairs of OPEN market time, holidays and DST already applied by the
     * source — the single market-time truth for session-anchored consumers (market-status
     * badges, session profiles), which must never recompute a holiday themselves.
     * `range.session` selects the window set (`'regular'` default; `'extended'` = the
     * full tape). Absent ⇒ the venue offers no calendar (continuous markets) and
     * consumers fall back to their own anchoring (e.g. UTC days).
     */
    getCalendar?(ticker: string, range: {
        from: number;
        to: number;
        session?: string;
    }): Promise<ReadonlyArray<readonly [number, number]>>;
    /** Apply runtime config (e.g. API keys). Absent ⇒ no configuration needed. */
    configure?(config: unknown): void;
    /**
     * Capabilities for ONE ticker, when they vary by instrument class within the venue.
     * Absent ⇒ {@link ProviderInfo.capabilities} applies uniformly to every symbol.
     */
    capabilitiesFor?(ticker: string): ProviderCapabilities;
}

export { type MarketSnapshot as $, type AxisLongPressEvent as A, type BarRange as B, type CrosshairEvent as C, type DataProvider as D, type MarkGroup as E, type MarkClickEvent as F, type VisibleRangeOptions as G, type DataWindowReadout as H, type InputValue as I, type IDrawingsRendererPort as J, type Millis as K, type LineStyle as L, type MarketDataFeed as M, type NativeBackend as N, type OHLCV as O, type ProviderInfo as P, type SnapMode as Q, type RendererCapabilities as R, type SymbolInfo as S, type ThemeId as T, type Unsubscribe as U, type VisibleRangePreset as V, type WallClock as W, type DrawingTypeKey as X, type ToolbarDefinition as Y, type ProviderCapabilities as Z, type MarketConfig as _, type SymbolDescriptor as a, type PaneKind as a$, type AddIndicatorOptions as a0, type AnimationConfig as a1, type Background as a2, type BoxFontFamily as a3, type BoxHAlign as a4, type BoxTextSize as a5, type BoxVAlign as a6, type CandleBarColor as a7, type CandleSeries as a8, type CandleStyle as a9, type IndicatorMeta as aA, type InputCondition as aB, type InputDisplay as aC, type InputGroupHelp as aD, type InputMultiple as aE, type InputSchema as aF, type InputType as aG, type InputWhen as aH, type IntroAnimation as aI, type IntroConfig as aJ, type IntroStyle as aK, type LabelStyle as aL, type LabelYLoc as aM, type LineLikeKind as aN, type LineLikeSeries as aO, type LineLikeStyle as aP, type MarkContent as aQ, type MarkContentSource as aR, type MarkGlyph as aS, type MarkPanelItem as aT, type MarkShape as aU, type MarkerPoint as aV, type MarkerSeries as aW, type MarketSwitch as aX, type PaneAxis as aY, type PaneAxisBand as aZ, type PaneHint as a_, ClockCorrection as aa, type DataWindowGroup as ab, type DataWindowOHLC as ac, type DataWindowRow as ad, type DirtyRange as ae, type DrawingBox as af, type DrawingExtend as ag, type DrawingIntent as ah, type DrawingLabel as ai, type DrawingLine as aj, type DrawingLinefill as ak, type DrawingMode as al, type DrawingPoint as am, type DrawingPolyline as an, type DrawingSeriesBar as ao, type DrawingSeriesGateway as ap, type DrawingSeriesState as aq, type DrawingStyle as ar, type DrawingTable as as, type DrawingText as at, type DrawingXLoc as au, type DrawingsOption as av, type Fill as aw, type FillGradientStop as ax, type FreePanEvent as ay, type FreePanTrigger as az, type VisibleRange as b, type PolylinePoint as b0, type PriceAxisOptions as b1, type PriceAxisTick as b2, type PriceAxisTickContext as b3, type PriceAxisTicksFn as b4, type PriceLine as b5, type Projector as b6, type ProviderName as b7, type RendererConstructor as b8, type Scene as b9, type DrawingToolDefaults as bA, type DrawingToolTemplate as bB, type SchemaPatch as ba, SecondClock as bb, type SeriesDisplay as bc, type SeriesKind as bd, type SeriesPoint as be, type SeriesSpec as bf, type SeriesSurface as bg, type SeriesValueDelta as bh, type SettingsField as bi, type SettingsSchema as bj, type SettingsVisibilityPolicy as bk, type TableCell as bl, type TableMerge as bm, type TablePosition as bn, type ThemeName as bo, type ToolbarGroupConfig as bp, type TradeExecution as bq, type ValuePatch as br, buildToolbar as bs, clockCorrection as bt, defaultToolbar as bu, inputDeltas as bv, inputVisible as bw, seriesInScale as bx, seriesShownOn as by, type PaneInfo as bz, type VelaOptions as c, type VelaTheme as d, type MarketSession as e, Drawing as f, type SerializedDrawing as g, type PriceStyle as h, type IChartRenderer as i, type RendererDisplayOptions as j, type IndicatorRenderHandle as k, type IndicatorStatus as l, type SymbolFacts as m, type RendererRootAttributes as n, type Pane as o, type PaneAction as p, type MoveTarget as q, type IndicatorModel as r, type ScenePatch as s, type SymbolPickerFn as t, type LegendActionView as u, type DrawingActionView as v, type LegendCalloutView as w, type InputChangeEvent as x, type ClickEvent as y, type TimelineMark as z };
