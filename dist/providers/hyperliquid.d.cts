import { D as DataProvider, P as ProviderInfo, B as BarRange, O as OHLCV, S as SymbolInfo, a as SymbolDescriptor, U as Unsubscribe } from '../DataProvider-MSQ3fzSV.cjs';
import '../types-CsUd831-.cjs';
import '@luxalgo/vela-ui/theme';

/**
 * Hyperliquid market-data provider, built from scratch on the public info API — no
 * third-party SDK, no API key. Serves USD-margined perpetuals (bare coins like `BTC`),
 * spot pairs (`PURR/USDC`) and the perpetuals of every builder-deployed (HIP-3) perp dex
 * (`xyz:TSLA` — the dex name, a colon, the coin: the API's own coin name, so
 * `hyperliquid:xyz:TSLA` is the qualified form), and aggregates timeframes Hyperliquid
 * doesn't serve natively (e.g. `45`, `180`, `360`). Live ticks use a real WebSocket
 * candle stream (`subscribe`).
 *
 * History note: Hyperliquid only serves the most recent ~5000 candles per interval
 * (≈ 3.5d of 1m, ~7mo of 1h, daily back to listing) — there is no deeper backfill, so
 * it's a live/recent-history venue rather than a deep-history source.
 *
 *   import { HyperliquidProvider } from 'vela/providers/hyperliquid';
 *   chart.data.registerProvider('hyperliquid', new HyperliquidProvider());
 */
declare class HyperliquidProvider implements DataProvider {
    /** Cached perp `meta` (universe is large; fetch once). */
    private metaPromise;
    /** Cached `spotMeta`. */
    private spotMetaPromise;
    /** Cached `perpDexs` (the HIP-3 dexes; the main dex is left out). */
    private perpDexsPromise;
    /** Cached `meta` per HIP-3 dex name. */
    private readonly dexMetaPromises;
    /** Upper-cased HIP-3 coin → its listed spelling, filled as dex metas arrive. */
    private readonly hip3Coins;
    /** Cached symbol enumeration. */
    private symbolsPromise;
    info(): ProviderInfo;
    getBars(ticker: string, timeframe: string, range: BarRange): Promise<OHLCV[]>;
    getSymbolInfo(ticker: string): Promise<SymbolInfo | undefined>;
    listSymbols(): Promise<SymbolDescriptor[]>;
    /** Predefined icon source for a crypto venue: the Ledger crypto-icon CDN, keyed by
     *  the BASE asset (the description's first segment, else the de-suffixed ticker; a
     *  HIP-3 ticker without its dex). */
    resolveSymbolIcon(symbol: SymbolDescriptor): string | undefined;
    subscribe(ticker: string, timeframe: string, onBar: (bar: OHLCV) => void): Unsubscribe;
    /** The API coin for a ticker: {@link parseCoin}, with a known HIP-3 market's listed spelling. */
    private coinOf;
    /** {@link coinOf}, after loading a HIP-3 market's dex when its spelling isn't known yet. */
    private resolveCoin;
    private listPerps;
    private listSpot;
    /**
     * Every HIP-3 dex's listed perps. A dex whose meta fails, or whose markets are all
     * delisted (a halted dex), simply contributes nothing.
     */
    private listHip3;
    /** The quote currency of a dex's perps, from its collateral token: USDC reads `USD` like the main dex. */
    private collateralName;
    private findDex;
    /**
     * Fetch candles for a time window. Hyperliquid's `candleSnapshot` has no count
     * parameter — it returns candles in `[startTime, endTime]` (capped to the most
     * recent ~5000). We translate a bar `limit` into a start offset; a `from` range
     * (the cache's tail refresh) is used directly. The newest candle is the forming one.
     */
    private fetchCandles;
    private candleSnapshot;
    /**
     * Open a WebSocket candle stream; reconnects on unexpected close until unsubscribed.
     * A stall watchdog falls the subscription back to polling if the socket opens but
     * never delivers a candle (a blocked/silent stream) — so live updates never go
     * silently dead. Mirrors the Binance provider's streaming resilience.
     */
    private streamCandles;
    /** Poll the forming candle (for aggregated timeframes / environments without WebSocket). */
    private pollBars;
    private fetchMeta;
    private fetchSpotMeta;
    /** The HIP-3 dexes: `perpDexs` lists the main dex first, as `null`, which is dropped. */
    private fetchPerpDexs;
    private fetchDexMeta;
    private post;
}

export { DataProvider, HyperliquidProvider, ProviderInfo, SymbolDescriptor };
