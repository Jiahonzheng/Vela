// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { msg } from '../src/core/i18n/message';
import { registerLocale } from '../src/core/i18n/registry';
import { LocaleState } from '../src/core/i18n/translator';
import type { SymbolDescriptor } from '../src/core/ports/DataProvider';
import { SYMBOL_PICKER_DEFAULT_CATEGORIES, SymbolPicker, type SymbolPickerCategory, type SymbolPickerOptions } from '../src/widget';

Element.prototype.scrollIntoView ??= function () {};

const symbols: SymbolDescriptor[] = [
    { ticker: 'BTCUSDT', type: 'crypto', provider: 'BinanceSpot' },
    { ticker: 'BTCUSDT.P', type: 'futures', provider: 'bInAnCeUsDm', prefix: 'BINANCE' },
    { ticker: 'BTCUSD.P', type: 'FUTURES', provider: 'BINANCECM' },
    { ticker: 'BTC-USD-EXPIRY', type: 'futures', provider: 'OKXFutures', prefix: 'OKX' },
    { ticker: 'BTC-USDT-SWAP', type: 'futures', provider: 'okxswap' },
    { ticker: 'IF', type: 'root', provider: 'THS', prefix: 'CFFEX', group: 'IF' },
    { ticker: 'IF2409', type: 'futures', provider: 'THS', prefix: 'CFFEX', group: 'IF' },
    { ticker: 'CU2409', type: 'futures', provider: 'THS', prefix: 'BinanceUSDM' },
    { ticker: 'GOLD', type: 'commodity' },
];

const cryptoFuturesProviders = new Set(['binanceusdm', 'binancecm', 'okxfutures', 'okxswap']);
const moneyCategories = () =>
    SYMBOL_PICKER_DEFAULT_CATEGORIES.filter(({ id }) => id !== 'commodities').map((category) =>
        category.id === 'crypto'
            ? {
                  ...category,
                  matches: ({ type, provider }) =>
                      type?.toLowerCase() === 'crypto' ||
                      (type?.toLowerCase() === 'futures' && cryptoFuturesProviders.has(provider?.toLowerCase() ?? '')),
              } satisfies SymbolPickerCategory
            : category,
    );

const tabs = () => [...document.querySelectorAll<HTMLButtonElement>('.vela-sp-tabs [role="tab"]')];
const tabLabels = () => tabs().map((tab) => tab.textContent);
const tab = (id: string) => tabs().find((item) => item.dataset.value === id)!;
const tickers = () => [...document.querySelectorAll<HTMLElement>('.vela-sp-row')].map((row) => row.dataset.ticker);
const row = (ticker: string) => document.querySelector<HTMLElement>(`.vela-sp-row[data-ticker="${ticker}"]`)!;
const expand = (ticker: string) => row(ticker).querySelector<HTMLButtonElement>('.vela-sp-expander')!.click();
const enter = () => document.querySelector<HTMLInputElement>('.vela-sp-input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

describe('symbol picker market tabs', () => {
    let picker: SymbolPicker | undefined;

    async function open(options: Partial<SymbolPickerOptions> = {}, source = symbols, query = '') {
        const instance = new SymbolPicker({ onSelect: () => {}, ...options });
        picker = instance;
        instance.setSource(() => source);
        instance.open(query);
        await vi.waitFor(() => expect(instance.isOpen).toBe(true));
        return instance;
    }

    async function selectTab(id: string) {
        tab(id).click();
        await vi.waitFor(() => expect(tab(id).getAttribute('aria-selected')).toBe('true'));
    }

    afterEach(() => {
        picker?.destroy();
        picker = undefined;
    });

    it('uses the six built-in categories and starts on the unfiltered All tab', async () => {
        await open();
        expect(SYMBOL_PICKER_DEFAULT_CATEGORIES.map(({ id }) => id)).toEqual(['stocks', 'etfs', 'crypto', 'futures', 'forex', 'commodities']);
        expect(tabLabels()).toEqual(['All', 'Stocks', 'ETFs', 'Crypto', 'Futures', 'Forex', 'Commodities']);
        expect(tab('all').getAttribute('aria-selected')).toBe('true');
        expect(tickers()).toEqual(['BTCUSDT', 'BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP', 'IF', 'CU2409', 'GOLD']);
        await selectTab('commodities');
        expect(tickers()).toEqual(['GOLD']);
        await selectTab('crypto');
        expect(tickers()).toEqual(['BTCUSDT', 'BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP', 'IF2409', 'CU2409']);
    });

    it('shows only All when the category list is empty', async () => {
        await open({ categories: [] });
        expect(tabLabels()).toEqual(['All']);
        expect(tickers()).toContain('GOLD');
    });

    it('reserves All and ignores blank and duplicate category IDs', async () => {
        await open({
            categories: [
                { id: 'all', label: 'Replacement', matches: () => false },
                { id: '', label: 'Empty', matches: () => true },
                { id: '  ', label: 'Blank', matches: () => true },
                { id: 'metals', label: 'Metals', matches: (symbol) => symbol.ticker === 'GOLD' },
                { id: 'metals', label: 'Replacement', matches: () => false },
            ],
        });
        expect(tabLabels()).toEqual(['All', 'Metals']);
        expect(tickers()).toContain('BTCUSDT');
        await selectTab('metals');
        expect(tickers()).toEqual(['GOLD']);
    });

    it('lets a host recreate its market tabs by keeping, removing, and replacing built-ins', async () => {
        await open({ categories: moneyCategories() });
        expect(tabLabels()).toEqual(['All', 'Stocks', 'ETFs', 'Crypto', 'Futures', 'Forex']);
        expect(tickers()).toContain('GOLD');
        await selectTab('crypto');
        expect(tickers()).toEqual(['BTCUSDT', 'BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP']);
        await selectTab('futures');
        expect(tickers()).toEqual(['BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP', 'IF', 'CU2409']);
        expand('IF');
        expect(tickers()).toContain('IF2409');
    });

    it.each(['click', 'Enter'])('keeps the rendered row and %s selection aligned when category membership changes before paging', async (activation) => {
        const watchSymbols = Array.from({ length: 120 }, (_, index) => ({ ticker: `WATCH${index}` }));
        const watched = new Set(watchSymbols.map((symbol) => symbol.ticker));
        const onSelect = vi.fn();
        await open({
            categories: [{ id: 'watchlist', label: 'Watchlist', matches: (symbol) => watched.has(symbol.ticker) }],
            onSelect,
        }, watchSymbols);
        await selectTab('watchlist');
        expect(tickers()).toHaveLength(100);

        watched.delete('WATCH0');
        document.querySelector('.vela-sp-list')!.dispatchEvent(new Event('scroll'));
        const first = document.querySelector<HTMLElement>('.vela-sp-row')!;
        const displayed = first.dataset.ticker;
        if (activation === 'click') first.click();
        else enter();
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(displayed);
        expect(displayed).toBe('WATCH1');
    });

    it('uses custom IDs, order, and labels, and relabels the active category in place', async () => {
        const i18n = new LocaleState();
        const label = msg('test.symbolPicker.metals', 'Metals');
        const unregister = registerLocale({ locale: 'fr', messages: { [label.id]: 'Métaux' } });
        try {
            const instance = await open({
                i18n,
                categories: [
                    { id: 'metal-listings', label, matches: (symbol) => symbol.type === 'commodity' },
                    { id: 'copper-only', label: 'Copper', matches: (symbol) => symbol.ticker === 'CU2409' },
                ],
            });
            expect(tabs().map((item) => item.dataset.value)).toEqual(['all', 'metal-listings', 'copper-only']);
            expect(tabLabels()).toEqual(['All', 'Metals', 'Copper']);
            await selectTab('metal-listings');
            expect(tickers()).toEqual(['GOLD']);
            i18n.update('fr');
            instance.relabel();
            expect(tabLabels()).toEqual(['All', 'Métaux', 'Copper']);
            expect(tab('metal-listings').getAttribute('aria-selected')).toBe('true');
            expect(tickers()).toEqual(['GOLD']);
        } finally {
            unregister();
        }
    });

    const groupedSymbols: SymbolDescriptor[] = [
        { ticker: 'IF', group: 'IF', type: 'root', prefix: 'CFFEX' },
        { ticker: 'IF2409', group: 'IF', type: 'futures', prefix: 'CFFEX', default: true },
        { ticker: 'IF2410', group: 'IF', type: 'futures', prefix: 'CFFEX', market: 'eligible' },
        { ticker: 'IF2412', group: 'IF', type: 'futures', prefix: 'CFFEX', market: 'eligible' },
        { ticker: 'IC', group: 'IC', type: 'root', prefix: 'CFFEX', description: 'Small-cap index' },
        { ticker: 'IC2410', group: 'IC', type: 'futures', prefix: 'CFFEX', market: 'eligible' },
        { ticker: 'IC2412', group: 'IC', type: 'futures', prefix: 'CFFEX', market: 'eligible', default: true },
        { ticker: 'IH', group: 'IH', type: 'root', prefix: 'CFFEX' },
        { ticker: 'IH2410', group: 'IH', type: 'futures', prefix: 'CFFEX' },
        { ticker: 'IM', group: 'IM', prefix: 'CFFEX' },
        { ticker: 'IM2410', group: 'IM', type: 'futures', prefix: 'CFFEX', market: 'eligible' },
    ];
    const groupedCategories: SymbolPickerCategory[] = [
        { id: 'eligible', label: 'Eligible', matches: (symbol) => symbol.type === 'root' || symbol.market === 'eligible' },
    ];

    it('filters group roots and their expanded members, and clicks the first eligible contract when the default is excluded', async () => {
        const onSelect = vi.fn();
        await open({ categories: groupedCategories, onSelect }, groupedSymbols);
        await selectTab('eligible');
        expect(tickers()).toEqual(['IF', 'IC', 'IM2410']);
        expand('IF');
        expect(tickers()).toEqual(['IF', 'IF2410', 'IF2412', 'IC', 'IM2410']);
        row('IF').click();
        expect(onSelect).toHaveBeenCalledExactlyOnceWith('CFFEX:IF2410');
    });

    it('uses the eligible default contract for Enter even when only the group root matches the query', async () => {
        const onSelect = vi.fn();
        await open({ categories: groupedCategories, onSelect }, groupedSymbols, 'Small-cap');
        await selectTab('eligible');
        expect(tickers()).toEqual(['IC']);
        enter();
        expect(onSelect).toHaveBeenCalledExactlyOnceWith('CFFEX:IC2412');
    });

    it('cannot select a matching group root without an eligible contract', async () => {
        const onSelect = vi.fn();
        const instance = await open({ categories: groupedCategories, onSelect }, groupedSymbols, 'IH');
        await selectTab('eligible');
        expect(tickers()).toEqual([]);
        enter();
        expect(onSelect).not.toHaveBeenCalled();
        expect(instance.isOpen).toBe(true);
    });
});
