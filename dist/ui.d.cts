export { FIELD_FOCUS_CSS, FIELD_FOCUS_RING, injectStyles, overlayScrollbarCss, withAlpha } from '@luxalgo/vela-ui/styles';
export { Token, css, t } from '@luxalgo/vela-ui';
export { ComponentSettings, CreateThemeOptions, ThemeInput, ThemeSettings, TokenName, UiTheme, applyPlotOverlayTokens, applyTheme, applyThemeTokens, checkTheme, createTheme, ensureUIHost } from '@luxalgo/vela-ui/theme';
export { iconEl, iconMarkup, registerIcon, svg16, svg24 } from '@luxalgo/vela-ui/icons';
export { MachineHandle, nextUid, normalizeProps, runMachine, spreadProps } from '@luxalgo/vela-ui/zag';
export { disposeWithin, ownTeardown } from '@luxalgo/vela-ui/dispose';
export { SURFACE_CLOSE_EVENT, SURFACE_OPEN_EVENT, SurfaceEventDetail, SurfaceKind } from '@luxalgo/vela-ui/surface-events';
export { K as KeyBindingDescriptor, a as KeymapManager, b as KeymapOptions, R as ResolvedBinding } from './keymap-Nk4cb7Tm.cjs';
import { PartProps } from '@luxalgo/vela-ui/headless';
export { PartProps, applyProps } from '@luxalgo/vela-ui/headless';
export { Tooltip, TooltipApi, TooltipController, TooltipControllerOptions, TooltipOptions, TooltipProps, TooltipService, createTooltip, tooltipController } from '@luxalgo/vela-ui/tooltip';
import { DropdownMenu, DropdownMenuApi, DropdownMenuController, DropdownMenuControllerOptions, DropdownMenuOptions, DropdownMenuProps, DropdownMenuService, createDropdownMenu, dropdownMenuController } from '@luxalgo/vela-ui/dropdown-menu';
export { DropdownMenu, DropdownMenuApi, DropdownMenuController, DropdownMenuControllerOptions, DropdownMenuOptions, DropdownMenuProps, DropdownMenuService, MenuItemDescriptor, createDropdownMenu, dropdownMenuController } from '@luxalgo/vela-ui/dropdown-menu';
export { ContextMenu, ContextMenuItems, ContextMenuProps, createContextMenu } from '@luxalgo/vela-ui/context-menu';
import { ButtonProps, ButtonVariant, ButtonSize } from '@luxalgo/vela-ui/button';
export { BUTTON_CSS, BUTTON_STYLE_ID, ButtonHandle, ButtonProps, ButtonSize, ButtonVariant, createButton } from '@luxalgo/vela-ui/button';
import { BadgeVariant } from '@luxalgo/vela-ui/badge';
export { BADGE_CSS, BADGE_STYLE_ID, BadgeHandle, BadgeProps, BadgeVariant, createBadge } from '@luxalgo/vela-ui/badge';
import { TabItem, TabsVariant } from '@luxalgo/vela-ui/tabs';
export { TABS_CSS, TABS_STYLE_ID, TabItem, TabsHandle, TabsProps, TabsVariant, createTabs } from '@luxalgo/vela-ui/tabs';
import { ToggleGroupItem } from '@luxalgo/vela-ui/toggle-group';
export { TOGGLE_GROUP_CSS, TOGGLE_GROUP_STYLE_ID, ToggleGroupHandle, ToggleGroupItem, ToggleGroupMultipleProps, ToggleGroupProps, ToggleGroupSingleProps, createToggleGroup } from '@luxalgo/vela-ui/toggle-group';
import { Checkbox, CheckboxController, CheckboxControllerOptions, CheckboxOptions, CheckboxProps, CheckboxSize, CheckboxTone, createCheckbox, checkboxController } from '@luxalgo/vela-ui/checkbox';
export { Checkbox, CheckboxController, CheckboxControllerOptions, CheckboxOptions, CheckboxProps, CheckboxSize, CheckboxTone, checkboxController, createCheckbox } from '@luxalgo/vela-ui/checkbox';
import { Input, InputController, InputControllerOptions, InputOptions, InputProps, InputSize, createInput, inputController } from '@luxalgo/vela-ui/input';
export { Input, InputController, InputControllerOptions, InputOptions, InputProps, InputSize, createInput, inputController } from '@luxalgo/vela-ui/input';
export { Dialog, DialogApi, DialogController, DialogControllerOptions, DialogOptions, DialogProps, DialogService, DialogVariant, createDialog, dialogController } from '@luxalgo/vela-ui/dialog';
export { Drawer, DrawerApi, DrawerController, DrawerControllerOptions, DrawerOptions, DrawerProps, DrawerService, createDrawer, drawerController } from '@luxalgo/vela-ui/drawer';
export { PlaceArgs, PlaceResult, Popover, PopoverAlign, PopoverBoundary, PopoverController, PopoverControllerOptions, PopoverOptions, PopoverPosition, PopoverProps, Rect, closeOpenPopovers, createPopover, eventDismissedPopover, insetRect, intersectRects, isPopoverOpen, openPopoverTrigger, placePopover, popoverController, viewportRect } from '@luxalgo/vela-ui/popover';
export { EmptyHandle, EmptyProps, createEmpty } from '@luxalgo/vela-ui/empty';
export { Select, SelectController, SelectControllerOptions, SelectListPopoverOpts, SelectOption, SelectOptions, SelectProps, SelectSize, createSelect, decorateSelectScroll, fillSelectList, openSelectList, selectController, toggleSelectList } from '@luxalgo/vela-ui/select';
export { NumberCommit, NumberInput, NumberInputController, NumberInputControllerOptions, NumberInputOptions, NumberInputProps, NumberSize, clampNumber, createNumberInput, numberInputController, snapToStep } from '@luxalgo/vela-ui/number-input';
export { ColorCommit, ColorField, ColorFieldOpts, ColorFieldProps, ColorFieldShape, ColorPickerController, ColorPickerControllerOptions, ColorPickerOptions, blendOver, buildColorPicker, buildPalette, closeColorPopover, colorField, colorPickerController, combineColor, createColorField, hslHex, splitColor, transparencyChecker } from '@luxalgo/vela-ui/color-picker';
export { FIELD_GAP_PX, FieldControlDesc, FieldControlHandle, FieldGridOptions, FieldGridVariant, FieldInlineItem, FieldLabelSize, FieldRowOptions, FieldSectionOptions, FieldToggleOpts, buildFieldControl, fieldGrid, fieldGridColumns, fieldRow, fieldSection, fieldSeparator } from '@luxalgo/vela-ui/field';
export { TextArea, TextAreaController, TextAreaControllerOptions, TextAreaOptions, TextAreaProps, TextAreaSize, createTextArea, textAreaController } from '@luxalgo/vela-ui/text-area';
export { GlyphOption, GlyphSelect, GlyphSelectController, GlyphSelectControllerOptions, GlyphSelectOptions, GlyphSelectProps, WIDTH_FIELD_OPTIONS, closeWidthPopover, createGlyphSelect, glyphSelectController, lineWidthGlyph, widthField, widthFieldOptions } from '@luxalgo/vela-ui/glyph-select';
export { CALLOUT_CSS, CALLOUT_STYLE_ID, CalloutBubble, CalloutBubbleOptions, CalloutBubbleProps, CalloutBubbleSpec, CalloutPanel, CalloutPanelItem, CalloutPanelRow, calloutPanelRows, closesPanel, createCalloutBubble } from '@luxalgo/vela-ui/callout-bubble';
export { DatePicker, DatePickerCell, DatePickerController, DatePickerControllerOptions, DatePickerOptions, DatePickerPanel, DatePickerProps, createDatePicker, datePickerController, isoDate, normalizeDateInput } from '@luxalgo/vela-ui/date-picker';
import './types-CsUd831-.cjs';

/** @deprecated Use `Checkbox`. */
declare const Switch: typeof Checkbox;
/** @deprecated Use `Checkbox`. */
type Switch = Checkbox;
/** @deprecated Use `createCheckbox`. */
declare const createSwitch: typeof createCheckbox;
/** @deprecated Use `checkboxController`. */
declare const switchController: typeof checkboxController;
/** @deprecated Use `CheckboxOptions`. */
type SwitchOptions = CheckboxOptions;
/** @deprecated Use `CheckboxProps`. */
type SwitchProps = CheckboxProps;
/** @deprecated Use `CheckboxController`. */
type SwitchController = CheckboxController;
/** @deprecated Use `CheckboxControllerOptions`. */
type SwitchControllerOptions = CheckboxControllerOptions;
/** @deprecated Use `CheckboxSize`. */
type SwitchSize = CheckboxSize;
/** @deprecated Use `CheckboxTone`. */
type SwitchTone = CheckboxTone;
/** @deprecated Use `Input`. */
declare const TextField: typeof Input;
/** @deprecated Use `Input`. */
type TextField = Input;
/** @deprecated Use `createInput`. */
declare const createTextField: typeof createInput;
/** @deprecated Use `inputController`. */
declare const textFieldController: typeof inputController;
/** @deprecated Use `InputOptions`. */
type TextFieldOptions = InputOptions;
/** @deprecated Use `InputProps`. */
type TextFieldProps = InputProps;
/** @deprecated Use `InputController`. */
type TextFieldController = InputController;
/** @deprecated Use `InputControllerOptions`. */
type TextFieldControllerOptions = InputControllerOptions;
/** @deprecated Use `InputSize`. */
type TextFieldSize = InputSize;
/** @deprecated Use `DropdownMenu`. */
declare const Menu: typeof DropdownMenu;
/** @deprecated Use `DropdownMenu`. */
type Menu = DropdownMenu;
/** @deprecated Use `createDropdownMenu`. */
declare const createMenu: typeof createDropdownMenu;
/** @deprecated Use `dropdownMenuController`. */
declare const menuController: typeof dropdownMenuController;
/** @deprecated Use `DropdownMenuOptions`. */
type MenuOptions = DropdownMenuOptions;
/** @deprecated Use `DropdownMenuProps`. */
type MenuProps = DropdownMenuProps;
/** @deprecated Use `DropdownMenuController`. */
type MenuController = DropdownMenuController;
/** @deprecated Use `DropdownMenuControllerOptions`. */
type MenuControllerOptions = DropdownMenuControllerOptions;
/** @deprecated Use `DropdownMenuService`. */
type MenuService = DropdownMenuService;
/** @deprecated Use `DropdownMenuApi`. */
type MenuApi = DropdownMenuApi;
/** @deprecated Use `ButtonProps`. */
interface ButtonControllerOptions {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Accessible name; required for the `icon*` sizes. */
    label?: string;
    /** A toggle button's state (`aria-pressed`). Omitted: not a toggle. */
    pressed?: boolean;
    disabled?: boolean;
}
/** @deprecated Use `createButton`, whose handle holds the state. */
interface ButtonController {
    readonly variant: ButtonVariant;
    readonly size: ButtonSize;
    readonly iconOnly: boolean;
    readonly pressed: boolean | undefined;
    readonly disabled: boolean;
    setPressed(pressed: boolean): void;
    setDisabled(disabled: boolean): void;
    setLabel(label: string): void;
    rootProps(): PartProps;
}
/** @deprecated Use `createButton`. */
declare function buttonController(opts?: ButtonControllerOptions): ButtonController;
/** @deprecated Use `ButtonProps`. */
type ButtonOptions = ButtonProps;
/** @deprecated Use `createButton`. */
declare class Button {
    readonly el: HTMLButtonElement;
    private readonly handle;
    constructor(opts?: ButtonOptions);
    get pressed(): boolean | undefined;
    setPressed(pressed: boolean): void;
    setDisabled(disabled: boolean): void;
    /** New text (or, for an `icon*` size, a new accessible name). */
    setText(text: string): void;
}
/** @deprecated Use `BadgeProps`. */
interface BadgeControllerOptions {
    variant?: BadgeVariant;
    /** A round count pill (`3`, `9+`) rather than a label. */
    count?: boolean;
}
/** @deprecated Use `createBadge`, whose handle holds the state. */
interface BadgeController {
    readonly variant: BadgeVariant;
    setVariant(variant: BadgeVariant): void;
    rootProps(): PartProps;
}
/** @deprecated Use `createBadge`. */
declare function badgeController(opts?: BadgeControllerOptions): BadgeController;
/** @deprecated Use `BadgeProps`. */
interface BadgeOptions extends BadgeControllerOptions {
    text: string;
    className?: string;
}
/** @deprecated Use `createBadge`. */
declare class Badge {
    readonly el: HTMLSpanElement;
    private readonly handle;
    constructor(opts: BadgeOptions);
    setText(text: string): void;
    setVariant(variant: BadgeVariant): void;
}
/** An item as the deprecated `Tabs` and `ToggleGroup` take it: keyed by `id` (the kit's
 *  items carry `value`), or already in the kit's shape. */
type Keyed<T extends {
    value: string;
}> = T | (Omit<T, 'value'> & {
    id: string;
});
/** A tab a user can reach: neither disabled nor hidden. */
declare const tabAvailable: (item: {
    disabled?: boolean;
    hidden?: boolean;
}) => boolean;
/** @deprecated Use `TabsProps`. */
interface TabsControllerOptions {
    items: readonly Keyed<TabItem>[];
    /** The selected tab (default: the first available one). */
    value?: string;
    orientation?: 'horizontal' | 'vertical';
    activationMode?: 'automatic' | 'manual';
    /** Accepted for compatibility: a tab links to its panel once `attachPanel` gives it one. */
    panels?: boolean;
    dir?: 'ltr' | 'rtl';
    onChange?: (id: string) => void;
}
/** @deprecated Use `TabsProps`. */
interface TabsOptions extends TabsControllerOptions {
    variant?: TabsVariant;
    className?: string;
    tabClassName?: string;
}
/** @deprecated Use `createTabs`: items carry `value` instead of `id`, `onChange` is
 *  `onValueChange`, `tab()` is `trigger()` and `attachPanel()` is `panel()`. */
declare class Tabs {
    readonly el: HTMLElement;
    private readonly handle;
    constructor(opts: TabsOptions);
    get value(): string | null;
    /** Show a tab as selected without notifying. */
    setValue(id: string | null): void;
    setItems(items: readonly Keyed<TabItem>[]): void;
    /** Hide or show a tab. Hiding the selected tab selects the first available one (notified). */
    setHidden(id: string, hidden: boolean): void;
    /** The button of a tab (null: unknown id). */
    tab(id: string): HTMLButtonElement | null;
    /** Make `el` the panel of tab `id`. */
    attachPanel(id: string, el: HTMLElement): void;
    destroy(): void;
}
interface ToggleGroupCommonOptions {
    items: readonly Keyed<ToggleGroupItem>[];
    /** Accessible name of the group. */
    label?: string;
    iconOnly?: boolean;
    dir?: 'ltr' | 'rtl';
}
/** @deprecated Use `ToggleGroupSingleProps`. */
interface ToggleGroupSingleOptions extends ToggleGroupCommonOptions {
    type?: 'single';
    value?: string;
    onChange?: (value: string) => void;
}
/** @deprecated Use `ToggleGroupMultipleProps`. */
interface ToggleGroupMultipleOptions extends ToggleGroupCommonOptions {
    type: 'multiple';
    value?: readonly string[];
    onChange?: (value: string[]) => void;
}
/** @deprecated Use `ToggleGroupProps`. */
type ToggleGroupControllerOptions = ToggleGroupSingleOptions | ToggleGroupMultipleOptions;
/** @deprecated Use `ToggleGroupProps`. */
type ToggleGroupOptions = ToggleGroupControllerOptions & {
    size?: 'default' | 'sm';
    fill?: boolean;
    className?: string;
};
/** @deprecated Use `createToggleGroup`: items carry `value` instead of `id`, `value` is
 *  `defaultValue` and `onChange` is `onValueChange`. */
declare class ToggleGroup {
    readonly el: HTMLElement;
    private readonly handle;
    constructor(opts: ToggleGroupOptions);
    /** The options turned on. */
    get values(): readonly string[];
    /** Show options as on without notifying. */
    setValue(value: string | readonly string[] | null): void;
    setItems(items: readonly Keyed<ToggleGroupItem>[]): void;
    destroy(): void;
}

export { Badge, type BadgeController, type BadgeControllerOptions, type BadgeOptions, Button, type ButtonController, type ButtonControllerOptions, type ButtonOptions, Menu, type MenuApi, type MenuController, type MenuControllerOptions, type MenuOptions, type MenuProps, type MenuService, Switch, type SwitchController, type SwitchControllerOptions, type SwitchOptions, type SwitchProps, type SwitchSize, type SwitchTone, Tabs, type TabsControllerOptions, type TabsOptions, TextField, type TextFieldController, type TextFieldControllerOptions, type TextFieldOptions, type TextFieldProps, type TextFieldSize, ToggleGroup, type ToggleGroupControllerOptions, type ToggleGroupMultipleOptions, type ToggleGroupOptions, type ToggleGroupSingleOptions, badgeController, buttonController, createMenu, createSwitch, createTextField, menuController, switchController, tabAvailable, textFieldController };
