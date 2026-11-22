// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SymbolDescriptor } from '../src/core/ports/DataProvider';
import { SYMBOL_PICKER_DEFAULT_CATEGORIES, VelaWorkspace } from '../src/workspace';
import { installCanvasStandIn } from './support/canvas-stand-in';

(globalThis as { CSS?: unknown }).CSS ??= { escape: (value: string) => value };
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
};
Element.prototype.scrollIntoView ??= function () {};

const symbols: SymbolDescriptor[] = [
    { ticker: 'FOO', type: 'stock' },
    { ticker: 'COPPER', type: 'commodity' },
];

let workspace: VelaWorkspace | undefined;
let restoreCanvas: () => void;
beforeEach(() => {
    restoreCanvas = installCanvasStandIn();
});
afterEach(() => {
    workspace?.destroy();
    workspace = undefined;
    restoreCanvas();
    document.body.replaceChildren();
});

it.each([
    { layoutMode: 'desktop', trigger: '.vela-widget-symbol' },
    { layoutMode: 'mobile', trigger: '.vela-mb-symbol' },
] as const)('uses the configured picker from the $layoutMode symbol button', async ({ layoutMode, trigger }) => {
    const host = document.createElement('div');
    document.body.append(host);
    const ws = new VelaWorkspace(host, {
        layout: '1',
        layoutMode,
        symbol: 'test-feed:FOO',
        symbolPicker: {
            categories: [
                ...SYMBOL_PICKER_DEFAULT_CATEGORIES.filter(({ id }) => id === 'stocks'),
                { id: 'metals', label: 'Metals', matches: (symbol) => symbol.type === 'commodity' },
            ],
        },
        providers: {
            'test-feed': () => ({
                getBars: async () => [],
                listSymbols: async () => symbols,
            }),
        },
    });
    workspace = ws;
    await vi.waitFor(() => expect(ws.context().chart.data.symbols()).toHaveLength(2));
    host.querySelector<HTMLButtonElement>(trigger)!.click();
    const tabs = () => [...host.querySelectorAll<HTMLButtonElement>('.vela-sp-tabs [role="tab"]')];
    await vi.waitFor(() => expect(tabs().map((tab) => tab.textContent)).toEqual(['All', 'Stocks', 'Metals']));
    tabs().find((tab) => tab.dataset.value === 'metals')!.click();
    const rows = () => [...host.querySelectorAll<HTMLElement>('.vela-sp-row')];
    await vi.waitFor(() => expect(rows().map((row) => row.dataset.ticker)).toEqual(['COPPER']));
    rows()[0]!.click();
    expect(ws.context().symbol).toBe('test-feed:COPPER');
});
