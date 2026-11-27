export { iconMarkup, registerIcon } from './chunk-HJVWESDK.js';
export { BarStore, CachingDataFeed, ClockCorrection, DARK_THEME, DataControl, DrawingStore, DrawingToolbar, DrawingsControl, LIGHT_THEME, MarksControl, MultiProviderFeed, NativeRenderer, RendererControl, ReplayControl, SecondClock, TypedEventBus, Vela, buildToolbar, clockCorrection, defaultToolbar, registerTheme, registeredThemes, resolveTheme, sharedBarStore } from './chunk-JH6BYKFA.js';
export { ACCENT, ACCENT_BRIGHT, BEARISH, BULLISH, CATEGORICAL, CHIP_PLATE, CONTEXT_MENU_BUILTIN_ORDER, CROSSHAIR, DEFAULT_PANEL_MAX_WIDTH, DEFAULT_PANEL_MIN_WIDTH, DEFAULT_PANEL_WIDTH, Drawing, HIGHLIGHT, INFO, INVALID, MARKER, NEUTRAL, OVERRIDABLE_TOPBAR_IDS, SERIES_LINE, SESSION_OFF, SESSION_POST, SESSION_PRE, SIDEBAR_DEFAULT_BOTTOM, SIDEBAR_DEFAULT_TOP, SLATE, SLATE_DEEP, TRADE_EXIT, TRADE_LONG, TRADE_SHORT, VALID, WARNING, categoricalColor, chartType, chartTypes, clampPanelWidth, composeSidebar, createDrawing, deserializeDrawing, drawingActions, drawingTypes, getDrawingType, getNativeIndicator, inputDeltas, inputVisible, isNewerBar, isSameBar, legendActions, legendCallouts, nativeIndicatorDescriptors, nativeIndicatorTypes, normalizeSettingsRow, priceStyleApplies, registerChartType, registerDefaultEngine, registerDrawingAction, registerDrawingType, registerLegendAction, registerLegendCallout, registerNativeIndicator, registerRendererDefaults, registerRendererLayer, registerSeriesAdapter, registerShellDefaults, registerSidePanel, registerStatePersistence, registerSymbolRanking, registerWidgetAction, registerWidgetAttachment, rendererDefaults, rendererLayers, resolveEngines, seriesAdapters, seriesInScale, seriesShownOn, settingsRowValueKeys, shellDefaults, shownPriceStyle, sidePanels, stableSeriesId, statePersistenceHandlers, symbolRanking, tickerModifierIds, topbarActionOverride, unregisterChartType, unregisterDefaultEngine, unregisterDrawingAction, unregisterLegendAction, unregisterLegendCallout, unregisterNativeIndicator, unregisterRendererDefaults, unregisterRendererLayer, unregisterSeriesAdapter, unregisterShellDefaults, unregisterSidePanel, unregisterStatePersistence, unregisterWidgetAction, unregisterWidgetAttachment, widgetActions, widgetAttachments } from './chunk-E6BPBCTQ.js';
export { createTranslator, msg, registerLocale, registeredLocales, withValues } from './chunk-TU3IUIQG.js';
export { DataUnavailableError, isDataUnavailableError, isTickTimeframe, isVariableDurationTimeframe, parseTickTimeframe, timeframeToMs } from './chunk-MZKXDQ4O.js';
export { checkTheme, createTheme } from '@luxalgo/vela-ui/theme';

// src/core/replayTicks.ts
function lowerTimeframeTicks(chart, timeframe) {
  return async (bar, { end, signal }) => {
    const { symbol, session } = chart.market;
    const resolved = symbol ? chart.data.resolve(symbol) : null;
    const provider = resolved ? chart.data.providerInstance(resolved.provider) : void 0;
    if (!resolved || !provider) return [];
    const bars = await provider.getBars(resolved.ticker, timeframe, { from: bar.time, to: end - 1, ...session ? { session } : {} });
    if (signal.aborted) return [];
    return barsToTicks(bars.filter((b) => b.time >= bar.time && b.time < end));
  };
}
function barsToTicks(bars) {
  return bars.map((b) => ({
    price: b.close,
    open: b.open,
    high: b.high,
    low: b.low,
    ...b.volume === void 0 ? {} : { volume: b.volume }
  }));
}

export { barsToTicks, lowerTimeframeTicks };
