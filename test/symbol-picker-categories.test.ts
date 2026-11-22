// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SymbolDescriptor } from '../src/core/ports/DataProvider';
import { SymbolPicker } from '../src/widget/symbol-picker';

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

describe('symbol picker market tabs', () => {
    let picker: SymbolPicker;
    const tabs = () => [...document.querySelectorAll<HTMLButtonElement>('.vela-sp-tabs [role="tab"]')];
    const tickers = () => [...document.querySelectorAll<HTMLElement>('.vela-sp-row')].map((row) => row.dataset.ticker);

    beforeEach(async () => {
        picker = new SymbolPicker({ onSelect: () => {} });
        picker.setSource(() => symbols);
        picker.open();
        await vi.waitFor(() => expect(picker.isOpen).toBe(true));
    });

    afterEach(() => {
        picker.destroy();
    });

    it('keeps commodities in All and omits the Commodities tab', () => {
        expect(tabs().map((tab) => tab.textContent)).toEqual(['All', 'Stocks', 'ETFs', 'Crypto', 'Futures', 'Forex']);
        expect(tickers()).toContain('GOLD');
    });

    it('lists all futures, including THS roots and their folded contracts', async () => {
        tabs().find((tab) => tab.textContent === 'Futures')!.click();
        await vi.waitFor(() => expect(tickers()).toEqual(['BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP', 'IF', 'CU2409']));
        document.querySelector<HTMLButtonElement>('[data-ticker="IF"] .vela-sp-expander')!.click();
        expect(tickers()).toContain('IF2409');
    });

    it('lists crypto and futures from the four crypto futures providers', async () => {
        tabs().find((tab) => tab.textContent === 'Crypto')!.click();
        await vi.waitFor(() => expect(tickers()).toEqual(['BTCUSDT', 'BTCUSDT.P', 'BTCUSD.P', 'BTC-USD-EXPIRY', 'BTC-USDT-SWAP']));
    });
});
