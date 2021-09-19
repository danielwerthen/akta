// Based on https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/314d0c3cf25e1762525a3790b4609eb19fddadf9/types/react/index.d.ts

import * as CSS from "csstype";
import { Observable, Subject } from 'rxjs';
import { AktaElement, AktaNode } from "./dist/types";

export type HTMLAttributes<_T> = {
  [key: string]: unknown;
};

export type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = E & {
  key?: string | null;
};

type PropertyWrapper<ATTR extends Akta.DOMAttributes<T>, T> = {
  [key in keyof ATTR]-?: ATTR[key] extends Subject<any> | undefined
    ? (factory?: () => NonNullable<ATTR[key]>) => NonNullable<ATTR[key]>
    : ATTR[key] extends Akta.AktaValue<infer X>
    ? (initialValue?: X) => Subject<X>
    : never;
};

type SVGPropertyWrapper<T> = PropertyWrapper<Akta.SVGAttributes<T>, T>;

declare module "./dist/types" {
  interface ElementProperties {
    // HTML
    a: PropertyWrapper<
      Akta.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >;
    abbr: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    address: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    area: PropertyWrapper<
      Akta.AreaHTMLAttributes<HTMLAreaElement>,
      HTMLAreaElement
    >;
    article: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    audio: PropertyWrapper<
      Akta.AudioHTMLAttributes<HTMLAudioElement>,
      HTMLAudioElement
    >;
    b: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    base: PropertyWrapper<
      Akta.BaseHTMLAttributes<HTMLBaseElement>,
      HTMLBaseElement
    >;
    bdi: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    bdo: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    big: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    blockquote: PropertyWrapper<
      Akta.BlockquoteHTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    body: PropertyWrapper<Akta.HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
    br: PropertyWrapper<Akta.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    button: PropertyWrapper<
      Akta.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >;
    canvas: PropertyWrapper<
      Akta.CanvasHTMLAttributes<HTMLCanvasElement>,
      HTMLCanvasElement
    >;
    caption: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    cite: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    code: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    col: PropertyWrapper<
      Akta.ColHTMLAttributes<HTMLTableColElement>,
      HTMLTableColElement
    >;
    colgroup: PropertyWrapper<
      Akta.ColgroupHTMLAttributes<HTMLTableColElement>,
      HTMLTableColElement
    >;
    data: PropertyWrapper<
      Akta.DataHTMLAttributes<HTMLDataElement>,
      HTMLDataElement
    >;
    datalist: PropertyWrapper<
      Akta.HTMLAttributes<HTMLDataListElement>,
      HTMLDataListElement
    >;
    dd: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    del: PropertyWrapper<Akta.DelHTMLAttributes<HTMLElement>, HTMLElement>;
    details: PropertyWrapper<
      Akta.DetailsHTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    dfn: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    dialog: PropertyWrapper<
      Akta.DialogHTMLAttributes<HTMLDialogElement>,
      HTMLDialogElement
    >;
    div: PropertyWrapper<Akta.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    dl: PropertyWrapper<Akta.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
    dt: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    em: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    embed: PropertyWrapper<
      Akta.EmbedHTMLAttributes<HTMLEmbedElement>,
      HTMLEmbedElement
    >;
    fieldset: PropertyWrapper<
      Akta.FieldsetHTMLAttributes<HTMLFieldSetElement>,
      HTMLFieldSetElement
    >;
    figcaption: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    figure: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    form: PropertyWrapper<
      Akta.FormHTMLAttributes<HTMLFormElement>,
      HTMLFormElement
    >;
    h1: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    h2: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    h3: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    h4: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    h5: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    h6: PropertyWrapper<
      Akta.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >;
    head: PropertyWrapper<Akta.HTMLAttributes<HTMLHeadElement>, HTMLHeadElement>;
    header: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    hgroup: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    hr: PropertyWrapper<Akta.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
    html: PropertyWrapper<
      Akta.HtmlHTMLAttributes<HTMLHtmlElement>,
      HTMLHtmlElement
    >;
    i: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    iframe: PropertyWrapper<
      Akta.IframeHTMLAttributes<HTMLIFrameElement>,
      HTMLIFrameElement
    >;
    img: PropertyWrapper<
      Akta.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >;
    input: PropertyWrapper<
      Akta.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >;
    ins: PropertyWrapper<Akta.InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
    kbd: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    keygen: PropertyWrapper<Akta.KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
    label: PropertyWrapper<
      Akta.LabelHTMLAttributes<HTMLLabelElement>,
      HTMLLabelElement
    >;
    legend: PropertyWrapper<
      Akta.HTMLAttributes<HTMLLegendElement>,
      HTMLLegendElement
    >;
    li: PropertyWrapper<Akta.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    link: PropertyWrapper<
      Akta.LinkHTMLAttributes<HTMLLinkElement>,
      HTMLLinkElement
    >;
    main: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    map: PropertyWrapper<Akta.MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
    mark: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    menu: PropertyWrapper<Akta.MenuHTMLAttributes<HTMLElement>, HTMLElement>;
    menuitem: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    meta: PropertyWrapper<
      Akta.MetaHTMLAttributes<HTMLMetaElement>,
      HTMLMetaElement
    >;
    meter: PropertyWrapper<Akta.MeterHTMLAttributes<HTMLElement>, HTMLElement>;
    nav: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    noindex: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    noscript: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    object: PropertyWrapper<
      Akta.ObjectHTMLAttributes<HTMLObjectElement>,
      HTMLObjectElement
    >;
    ol: PropertyWrapper<
      Akta.OlHTMLAttributes<HTMLOListElement>,
      HTMLOListElement
    >;
    optgroup: PropertyWrapper<
      Akta.OptgroupHTMLAttributes<HTMLOptGroupElement>,
      HTMLOptGroupElement
    >;
    option: PropertyWrapper<
      Akta.OptionHTMLAttributes<HTMLOptionElement>,
      HTMLOptionElement
    >;
    output: PropertyWrapper<Akta.OutputHTMLAttributes<HTMLElement>, HTMLElement>;
    p: PropertyWrapper<
      Akta.HTMLAttributes<HTMLParagraphElement>,
      HTMLParagraphElement
    >;
    param: PropertyWrapper<
      Akta.ParamHTMLAttributes<HTMLParamElement>,
      HTMLParamElement
    >;
    picture: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    pre: PropertyWrapper<Akta.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    progress: PropertyWrapper<
      Akta.ProgressHTMLAttributes<HTMLProgressElement>,
      HTMLProgressElement
    >;
    q: PropertyWrapper<
      Akta.QuoteHTMLAttributes<HTMLQuoteElement>,
      HTMLQuoteElement
    >;
    rp: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    rt: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    ruby: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    s: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    samp: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    slot: PropertyWrapper<
      Akta.SlotHTMLAttributes<HTMLSlotElement>,
      HTMLSlotElement
    >;
    script: PropertyWrapper<
      Akta.ScriptHTMLAttributes<HTMLScriptElement>,
      HTMLScriptElement
    >;
    section: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    select: PropertyWrapper<
      Akta.SelectHTMLAttributes<HTMLSelectElement>,
      HTMLSelectElement
    >;
    small: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    source: PropertyWrapper<
      Akta.SourceHTMLAttributes<HTMLSourceElement>,
      HTMLSourceElement
    >;
    span: PropertyWrapper<Akta.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    strong: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    style: PropertyWrapper<
      Akta.StyleHTMLAttributes<HTMLStyleElement>,
      HTMLStyleElement
    >;
    sub: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    summary: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    sup: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    table: PropertyWrapper<
      Akta.TableHTMLAttributes<HTMLTableElement>,
      HTMLTableElement
    >;
    template: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTemplateElement>,
      HTMLTemplateElement
    >;
    tbody: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    >;
    td: PropertyWrapper<
      Akta.TdHTMLAttributes<HTMLTableDataCellElement>,
      HTMLTableDataCellElement
    >;
    textarea: PropertyWrapper<
      Akta.TextareaHTMLAttributes<HTMLTextAreaElement>,
      HTMLTextAreaElement
    >;
    tfoot: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    >;
    th: PropertyWrapper<
      Akta.ThHTMLAttributes<HTMLTableHeaderCellElement>,
      HTMLTableHeaderCellElement
    >;
    thead: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTableSectionElement>,
      HTMLTableSectionElement
    >;
    time: PropertyWrapper<Akta.TimeHTMLAttributes<HTMLElement>, HTMLElement>;
    title: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTitleElement>,
      HTMLTitleElement
    >;
    tr: PropertyWrapper<
      Akta.HTMLAttributes<HTMLTableRowElement>,
      HTMLTableRowElement
    >;
    track: PropertyWrapper<
      Akta.TrackHTMLAttributes<HTMLTrackElement>,
      HTMLTrackElement
    >;
    u: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    ul: PropertyWrapper<Akta.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    var: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    video: PropertyWrapper<
      Akta.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >;
    wbr: PropertyWrapper<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
    /*
  webview: EventCreation<
    Akta.WebViewHTMLAttributes<HTMLWebViewElement>,
    HTMLWebViewElement
  >;*/

    // SVG
    svg: SVGPropertyWrapper<SVGSVGElement>;

    animate: SVGPropertyWrapper<SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
    animateMotion: SVGPropertyWrapper<SVGElement>;
    animateTransform: SVGPropertyWrapper<SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
    circle: SVGPropertyWrapper<SVGCircleElement>;
    clipPath: SVGPropertyWrapper<SVGClipPathElement>;
    defs: SVGPropertyWrapper<SVGDefsElement>;
    desc: SVGPropertyWrapper<SVGDescElement>;
    ellipse: SVGPropertyWrapper<SVGEllipseElement>;
    feBlend: SVGPropertyWrapper<SVGFEBlendElement>;
    feColorMatrix: SVGPropertyWrapper<SVGFEColorMatrixElement>;
    feComponentTransfer: SVGPropertyWrapper<SVGFEComponentTransferElement>;
    feComposite: SVGPropertyWrapper<SVGFECompositeElement>;
    feConvolveMatrix: SVGPropertyWrapper<SVGFEConvolveMatrixElement>;
    feDiffuseLighting: SVGPropertyWrapper<SVGFEDiffuseLightingElement>;
    feDisplacementMap: SVGPropertyWrapper<SVGFEDisplacementMapElement>;
    feDistantLight: SVGPropertyWrapper<SVGFEDistantLightElement>;
    feDropShadow: SVGPropertyWrapper<SVGFEDropShadowElement>;
    feFlood: SVGPropertyWrapper<SVGFEFloodElement>;
    feFuncA: SVGPropertyWrapper<SVGFEFuncAElement>;
    feFuncB: SVGPropertyWrapper<SVGFEFuncBElement>;
    feFuncG: SVGPropertyWrapper<SVGFEFuncGElement>;
    feFuncR: SVGPropertyWrapper<SVGFEFuncRElement>;
    feGaussianBlur: SVGPropertyWrapper<SVGFEGaussianBlurElement>;
    feImage: SVGPropertyWrapper<SVGFEImageElement>;
    feMerge: SVGPropertyWrapper<SVGFEMergeElement>;
    feMergeNode: SVGPropertyWrapper<SVGFEMergeNodeElement>;
    feMorphology: SVGPropertyWrapper<SVGFEMorphologyElement>;
    feOffset: SVGPropertyWrapper<SVGFEOffsetElement>;
    fePointLight: SVGPropertyWrapper<SVGFEPointLightElement>;
    feSpecularLighting: SVGPropertyWrapper<SVGFESpecularLightingElement>;
    feSpotLight: SVGPropertyWrapper<SVGFESpotLightElement>;
    feTile: SVGPropertyWrapper<SVGFETileElement>;
    feTurbulence: SVGPropertyWrapper<SVGFETurbulenceElement>;
    filter: SVGPropertyWrapper<SVGFilterElement>;
    foreignObject: SVGPropertyWrapper<SVGForeignObjectElement>;
    g: SVGPropertyWrapper<SVGGElement>;
    image: SVGPropertyWrapper<SVGImageElement>;
    line: SVGPropertyWrapper<SVGLineElement>;
    linearGradient: SVGPropertyWrapper<SVGLinearGradientElement>;
    marker: SVGPropertyWrapper<SVGMarkerElement>;
    mask: SVGPropertyWrapper<SVGMaskElement>;
    metadata: SVGPropertyWrapper<SVGMetadataElement>;
    mpath: SVGPropertyWrapper<SVGElement>;
    path: SVGPropertyWrapper<SVGPathElement>;
    pattern: SVGPropertyWrapper<SVGPatternElement>;
    polygon: SVGPropertyWrapper<SVGPolygonElement>;
    polyline: SVGPropertyWrapper<SVGPolylineElement>;
    radialGradient: SVGPropertyWrapper<SVGRadialGradientElement>;
    rect: SVGPropertyWrapper<SVGRectElement>;
    stop: SVGPropertyWrapper<SVGStopElement>;
    switch: SVGPropertyWrapper<SVGSwitchElement>;
    symbol: SVGPropertyWrapper<SVGSymbolElement>;
    text: SVGPropertyWrapper<SVGTextElement>;
    textPath: SVGPropertyWrapper<SVGTextPathElement>;
    tspan: SVGPropertyWrapper<SVGTSpanElement>;
    use: SVGPropertyWrapper<SVGUseElement>;
    view: SVGPropertyWrapper<SVGViewElement>;
  }
}
type NativeAnimationEvent = AnimationEvent;
type NativeClipboardEvent = ClipboardEvent;
type NativeCompositionEvent = CompositionEvent;
type NativeDragEvent = DragEvent;
type NativeFocusEvent = FocusEvent;
type NativeKeyboardEvent = KeyboardEvent;
type NativeMouseEvent = MouseEvent;
type NativeTouchEvent = TouchEvent;
type NativePointerEvent = PointerEvent;
type NativeTransitionEvent = TransitionEvent;
type NativeUIEvent = UIEvent;
type NativeWheelEvent = WheelEvent;
type Booleanish = boolean | "true" | "false";

declare namespace Akta {
  interface Attributes {
    key?: Key | null;
  }
  interface ClassAttributes<T> extends Attributes {}

  interface BaseSubjectableEvent<E = object, C = any, T = any> {
    nativeEvent: E;
    currentTarget: C;
    target: T;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    timeStamp: number;
    type: string;
  }

  interface SubjectableEvent<T = Element, E = Event>
    extends BaseSubjectableEvent<E, EventTarget & T, EventTarget> {}

  interface ClipboardEvent<T = Element>
    extends SubjectableEvent<T, NativeClipboardEvent> {
    clipboardData: DataTransfer;
  }

  interface CompositionEvent<T = Element>
    extends SubjectableEvent<T, NativeCompositionEvent> {
    data: string;
  }

  interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
    dataTransfer: DataTransfer;
  }

  interface PointerEvent<T = Element>
    extends MouseEvent<T, NativePointerEvent> {
    pointerId: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    width: number;
    height: number;
    pointerType: "mouse" | "pen" | "touch";
    isPrimary: boolean;
  }

  interface FocusEvent<T = Element>
    extends SubjectableEvent<T, NativeFocusEvent> {
    relatedTarget: EventTarget | null;
    target: EventTarget & T;
  }

  interface FormEvent<T = Element> extends SubjectableEvent<T> {
    target: EventTarget & T;
  }

  interface InvalidEvent<T = Element> extends SubjectableEvent<T> {
    target: EventTarget & T;
  }

  interface ChangeEvent<T = Element> extends SubjectableEvent<T> {
    target: EventTarget & T;
  }

  interface KeyboardEvent<T = Element>
    extends SubjectableEvent<T, NativeKeyboardEvent> {
    altKey: boolean;
    /** @deprecated */
    charCode: number;
    ctrlKey: boolean;
    code: string;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    /**
     * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
     */
    key: string;
    /** @deprecated */
    keyCode: number;
    locale: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    /** @deprecated */
    which: number;
  }

  interface MouseEvent<T = Element, E = NativeMouseEvent>
    extends UIEvent<T, E> {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
  }

  interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
    altKey: boolean;
    changedTouches: TouchList;
    ctrlKey: boolean;
    /**
     * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
     */
    getModifierState(key: string): boolean;
    metaKey: boolean;
    shiftKey: boolean;
    targetTouches: TouchList;
    touches: TouchList;
  }

  interface UIEvent<T = Element, E = NativeUIEvent>
    extends SubjectableEvent<T, E> {
    detail: number;
    view: AbstractView;
  }

  interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
    deltaMode: number;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
  }

  interface AnimationEvent<T = Element>
    extends SubjectableEvent<T, NativeAnimationEvent> {
    animationName: string;
    elapsedTime: number;
    pseudoElement: string;
  }

  interface TransitionEvent<T = Element>
    extends SubjectableEvent<T, NativeTransitionEvent> {
    elapsedTime: number;
    propertyName: string;
    pseudoElement: string;
  }

  //
  // Event Handler Types
  // ----------------------------------------------------------------------

  type EventHandler<E extends SubjectableEvent<any>> = Subject<E> | ((e: E) => void);

  type AktaEventHandler<T = Element> = EventHandler<SubjectableEvent<T>>;

  type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
  type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
  type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
  type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
  type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
  type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
  type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
  type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
  type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
  type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
  type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
  type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
  type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
  type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;

  interface HTMLProps<T> extends AllHTMLAttributes<T> {}

  type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> &
    E;

  interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {}

  type PrefixedCSSProperties = {
    [K in keyof CSS.Properties as `$${K}`]: AktaValue<CSS.Properties[K]>;
  } & { [key: string]: AktaValue<unknown> };

  type PrefixedSvgCSSProperties = {
    [K in keyof CSS.SvgProperties as `$${K}`]: AktaValue<CSS.SvgProperties[K]>;
  } & { [key: string]: AktaValue<unknown> };

  type StylePropertyValue = string;

  type AktaText = string | number;
  type AktaChild = AktaElement | AktaText;

  interface AktaNodeArray extends Array<AktaNode> {}
  type AktaFragment = {} | AktaNodeArray;
  export type AktaNode = AktaChild | AktaFragment | boolean | null | undefined;

  interface DOMAttributes<T> {
    children?: AktaNode;

    // Akta Events
    onMount?: AktaEventHandler<T>;
    onUnmount?: AktaEventHandler<T>;

    // Clipboard Events
    onCopy?: ClipboardEventHandler<T>;
    onCopyCapture?: ClipboardEventHandler<T>;
    onCut?: ClipboardEventHandler<T>;
    onCutCapture?: ClipboardEventHandler<T>;
    onPaste?: ClipboardEventHandler<T>;
    onPasteCapture?: ClipboardEventHandler<T>;

    // Composition Events
    onCompositionEnd?: CompositionEventHandler<T>;
    onCompositionEndCapture?: CompositionEventHandler<T>;
    onCompositionStart?: CompositionEventHandler<T>;
    onCompositionStartCapture?: CompositionEventHandler<T>;
    onCompositionUpdate?: CompositionEventHandler<T>;
    onCompositionUpdateCapture?: CompositionEventHandler<T>;

    // Focus Events
    onFocus?: FocusEventHandler<T>;
    onFocusCapture?: FocusEventHandler<T>;
    onBlur?: FocusEventHandler<T>;
    onBlurCapture?: FocusEventHandler<T>;

    // Form Events
    onChange?: FormEventHandler<T>;
    onChangeCapture?: FormEventHandler<T>;
    onBeforeInput?: FormEventHandler<T>;
    onBeforeInputCapture?: FormEventHandler<T>;
    onInput?: FormEventHandler<T>;
    onInputCapture?: FormEventHandler<T>;
    onReset?: FormEventHandler<T>;
    onResetCapture?: FormEventHandler<T>;
    onSubmit?: FormEventHandler<T>;
    onSubmitCapture?: FormEventHandler<T>;
    onInvalid?: FormEventHandler<T>;
    onInvalidCapture?: FormEventHandler<T>;

    // Image Events
    onLoad?: AktaEventHandler<T>;
    onLoadCapture?: AktaEventHandler<T>;
    onError?: AktaEventHandler<T>; // also a Media Event
    onErrorCapture?: AktaEventHandler<T>; // also a Media Event

    // Keyboard Events
    onKeyDown?: KeyboardEventHandler<T>;
    onKeyDownCapture?: KeyboardEventHandler<T>;
    onKeyPress?: KeyboardEventHandler<T>;
    onKeyPressCapture?: KeyboardEventHandler<T>;
    onKeyUp?: KeyboardEventHandler<T>;
    onKeyUpCapture?: KeyboardEventHandler<T>;

    // Media Events
    onAbort?: AktaEventHandler<T>;
    onAbortCapture?: AktaEventHandler<T>;
    onCanPlay?: AktaEventHandler<T>;
    onCanPlayCapture?: AktaEventHandler<T>;
    onCanPlayThrough?: AktaEventHandler<T>;
    onCanPlayThroughCapture?: AktaEventHandler<T>;
    onDurationChange?: AktaEventHandler<T>;
    onDurationChangeCapture?: AktaEventHandler<T>;
    onEmptied?: AktaEventHandler<T>;
    onEmptiedCapture?: AktaEventHandler<T>;
    onEncrypted?: AktaEventHandler<T>;
    onEncryptedCapture?: AktaEventHandler<T>;
    onEnded?: AktaEventHandler<T>;
    onEndedCapture?: AktaEventHandler<T>;
    onLoadedData?: AktaEventHandler<T>;
    onLoadedDataCapture?: AktaEventHandler<T>;
    onLoadedMetadata?: AktaEventHandler<T>;
    onLoadedMetadataCapture?: AktaEventHandler<T>;
    onLoadStart?: AktaEventHandler<T>;
    onLoadStartCapture?: AktaEventHandler<T>;
    onPause?: AktaEventHandler<T>;
    onPauseCapture?: AktaEventHandler<T>;
    onPlay?: AktaEventHandler<T>;
    onPlayCapture?: AktaEventHandler<T>;
    onPlaying?: AktaEventHandler<T>;
    onPlayingCapture?: AktaEventHandler<T>;
    onProgress?: AktaEventHandler<T>;
    onProgressCapture?: AktaEventHandler<T>;
    onRateChange?: AktaEventHandler<T>;
    onRateChangeCapture?: AktaEventHandler<T>;
    onSeeked?: AktaEventHandler<T>;
    onSeekedCapture?: AktaEventHandler<T>;
    onSeeking?: AktaEventHandler<T>;
    onSeekingCapture?: AktaEventHandler<T>;
    onStalled?: AktaEventHandler<T>;
    onStalledCapture?: AktaEventHandler<T>;
    onSuspend?: AktaEventHandler<T>;
    onSuspendCapture?: AktaEventHandler<T>;
    onTimeUpdate?: AktaEventHandler<T>;
    onTimeUpdateCapture?: AktaEventHandler<T>;
    onVolumeChange?: AktaEventHandler<T>;
    onVolumeChangeCapture?: AktaEventHandler<T>;
    onWaiting?: AktaEventHandler<T>;
    onWaitingCapture?: AktaEventHandler<T>;

    // MouseEvents
    onAuxClick?: MouseEventHandler<T>;
    onAuxClickCapture?: MouseEventHandler<T>;
    onClick?: MouseEventHandler<T>;
    onClickCapture?: MouseEventHandler<T>;
    onContextMenu?: MouseEventHandler<T>;
    onContextMenuCapture?: MouseEventHandler<T>;
    onDoubleClick?: MouseEventHandler<T>;
    onDoubleClickCapture?: MouseEventHandler<T>;
    onDrag?: DragEventHandler<T>;
    onDragCapture?: DragEventHandler<T>;
    onDragEnd?: DragEventHandler<T>;
    onDragEndCapture?: DragEventHandler<T>;
    onDragEnter?: DragEventHandler<T>;
    onDragEnterCapture?: DragEventHandler<T>;
    onDragExit?: DragEventHandler<T>;
    onDragExitCapture?: DragEventHandler<T>;
    onDragLeave?: DragEventHandler<T>;
    onDragLeaveCapture?: DragEventHandler<T>;
    onDragOver?: DragEventHandler<T>;
    onDragOverCapture?: DragEventHandler<T>;
    onDragStart?: DragEventHandler<T>;
    onDragStartCapture?: DragEventHandler<T>;
    onDrop?: DragEventHandler<T>;
    onDropCapture?: DragEventHandler<T>;
    onMouseDown?: MouseEventHandler<T>;
    onMouseDownCapture?: MouseEventHandler<T>;
    onMouseEnter?: MouseEventHandler<T>;
    onMouseLeave?: MouseEventHandler<T>;
    onMouseMove?: MouseEventHandler<T>;
    onMouseMoveCapture?: MouseEventHandler<T>;
    onMouseOut?: MouseEventHandler<T>;
    onMouseOutCapture?: MouseEventHandler<T>;
    onMouseOver?: MouseEventHandler<T>;
    onMouseOverCapture?: MouseEventHandler<T>;
    onMouseUp?: MouseEventHandler<T>;
    onMouseUpCapture?: MouseEventHandler<T>;

    // Selection Events
    onSelect?: AktaEventHandler<T>;
    onSelectCapture?: AktaEventHandler<T>;

    // Touch Events
    onTouchCancel?: TouchEventHandler<T>;
    onTouchCancelCapture?: TouchEventHandler<T>;
    onTouchEnd?: TouchEventHandler<T>;
    onTouchEndCapture?: TouchEventHandler<T>;
    onTouchMove?: TouchEventHandler<T>;
    onTouchMoveCapture?: TouchEventHandler<T>;
    onTouchStart?: TouchEventHandler<T>;
    onTouchStartCapture?: TouchEventHandler<T>;

    // Pointer Events
    onPointerDown?: PointerEventHandler<T>;
    onPointerDownCapture?: PointerEventHandler<T>;
    onPointerMove?: PointerEventHandler<T>;
    onPointerMoveCapture?: PointerEventHandler<T>;
    onPointerUp?: PointerEventHandler<T>;
    onPointerUpCapture?: PointerEventHandler<T>;
    onPointerCancel?: PointerEventHandler<T>;
    onPointerCancelCapture?: PointerEventHandler<T>;
    onPointerEnter?: PointerEventHandler<T>;
    onPointerEnterCapture?: PointerEventHandler<T>;
    onPointerLeave?: PointerEventHandler<T>;
    onPointerLeaveCapture?: PointerEventHandler<T>;
    onPointerOver?: PointerEventHandler<T>;
    onPointerOverCapture?: PointerEventHandler<T>;
    onPointerOut?: PointerEventHandler<T>;
    onPointerOutCapture?: PointerEventHandler<T>;
    onGotPointerCapture?: PointerEventHandler<T>;
    onGotPointerCaptureCapture?: PointerEventHandler<T>;
    onLostPointerCapture?: PointerEventHandler<T>;
    onLostPointerCaptureCapture?: PointerEventHandler<T>;

    // UI Events
    onScroll?: UIEventHandler<T>;
    onScrollCapture?: UIEventHandler<T>;

    // Wheel Events
    onWheel?: WheelEventHandler<T>;
    onWheelCapture?: WheelEventHandler<T>;

    // Animation Events
    onAnimationStart?: AnimationEventHandler<T>;
    onAnimationStartCapture?: AnimationEventHandler<T>;
    onAnimationEnd?: AnimationEventHandler<T>;
    onAnimationEndCapture?: AnimationEventHandler<T>;
    onAnimationIteration?: AnimationEventHandler<T>;
    onAnimationIterationCapture?: AnimationEventHandler<T>;

    // Transition Events
    onTransitionEnd?: TransitionEventHandler<T>;
    onTransitionEndCapture?: TransitionEventHandler<T>;
  }

  type AktaValue<T> = T | Observable<T | undefined>;

  // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
  interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    "aria-activedescendant"?: AktaValue<string>;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    "aria-atomic"?: AktaValue<boolean | "false" | "true">;
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    "aria-autocomplete"?: AktaValue<"none" | "inline" | "list" | "both">;
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    "aria-busy"?: AktaValue<boolean | "false" | "true">;
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    "aria-checked"?: AktaValue<boolean | "false" | "mixed" | "true">;
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    "aria-colcount"?: AktaValue<number>;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    "aria-colindex"?: AktaValue<number>;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    "aria-colspan"?: AktaValue<number>;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    "aria-controls"?: AktaValue<string>;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    "aria-current"?: AktaValue<
      | boolean
      | "false"
      | "true"
      | "page"
      | "step"
      | "location"
      | "date"
      | "time"
    >;
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    "aria-describedby"?: AktaValue<string>;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    "aria-details"?: AktaValue<string>;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    "aria-disabled"?: AktaValue<boolean | "false" | "true">;
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    "aria-dropeffect"?: AktaValue<
      "none" | "copy" | "execute" | "link" | "move" | "popup"
    >;
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    "aria-errormessage"?: AktaValue<string>;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    "aria-expanded"?: AktaValue<boolean | "false" | "true">;
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    "aria-flowto"?: AktaValue<string>;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    "aria-grabbed"?: AktaValue<boolean | "false" | "true">;
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    "aria-haspopup"?: AktaValue<
      | boolean
      | "false"
      | "true"
      | "menu"
      | "listbox"
      | "tree"
      | "grid"
      | "dialog"
    >;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    "aria-hidden"?: AktaValue<boolean | "false" | "true">;
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    "aria-invalid"?: AktaValue<
      boolean | "false" | "true" | "grammar" | "spelling"
    >;
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    "aria-keyshortcuts"?: AktaValue<string>;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    "aria-label"?: AktaValue<string>;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    "aria-labelledby"?: AktaValue<string>;
    /** Defines the hierarchical level of an element within a structure. */
    "aria-level"?: AktaValue<number>;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    "aria-live"?: AktaValue<"off" | "assertive" | "polite">;
    /** Indicates whether an element is modal when displayed. */
    "aria-modal"?: AktaValue<boolean | "false" | "true">;
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    "aria-multiline"?: AktaValue<boolean | "false" | "true">;
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    "aria-multiselectable"?: AktaValue<boolean | "false" | "true">;
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    "aria-orientation"?: AktaValue<"horizontal" | "vertical">;
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    "aria-owns"?: AktaValue<string>;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    "aria-placeholder"?: AktaValue<string>;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    "aria-posinset"?: AktaValue<number>;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    "aria-pressed"?: AktaValue<boolean | "false" | "mixed" | "true">;
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    "aria-readonly"?: AktaValue<boolean | "false" | "true">;
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    "aria-relevant"?: AktaValue<
      | "additions"
      | "additions removals"
      | "additions text"
      | "all"
      | "removals"
      | "removals additions"
      | "removals text"
      | "text"
      | "text additions"
      | "text removals"
    >;
    /** Indicates that user input is required on the element before a form may be submitted. */
    "aria-required"?: AktaValue<boolean | "false" | "true">;
    /** Defines a human-readable, author-localized description for the role of an element. */
    "aria-roledescription"?: AktaValue<string>;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    "aria-rowcount"?: AktaValue<number>;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    "aria-rowindex"?: AktaValue<number>;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    "aria-rowspan"?: AktaValue<number>;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    "aria-selected"?: AktaValue<boolean | "false" | "true">;
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    "aria-setsize"?: AktaValue<number>;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    "aria-sort"?: AktaValue<"none" | "ascending" | "descending" | "other">;
    /** Defines the maximum allowed value for a range widget. */
    "aria-valuemax"?: AktaValue<number>;
    /** Defines the minimum allowed value for a range widget. */
    "aria-valuemin"?: AktaValue<number>;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    "aria-valuenow"?: AktaValue<number>;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    "aria-valuetext"?: AktaValue<string>;
  }

  // All the WAI-ARIA 1.1 role attribute values from https://www.w3.org/TR/wai-aria-1.1/#role_definitions
  type AriaRole =
    | "alert"
    | "alertdialog"
    | "application"
    | "article"
    | "banner"
    | "button"
    | "cell"
    | "checkbox"
    | "columnheader"
    | "combobox"
    | "complementary"
    | "contentinfo"
    | "definition"
    | "dialog"
    | "directory"
    | "document"
    | "feed"
    | "figure"
    | "form"
    | "grid"
    | "gridcell"
    | "group"
    | "heading"
    | "img"
    | "link"
    | "list"
    | "listbox"
    | "listitem"
    | "log"
    | "main"
    | "marquee"
    | "math"
    | "menu"
    | "menubar"
    | "menuitem"
    | "menuitemcheckbox"
    | "menuitemradio"
    | "navigation"
    | "none"
    | "note"
    | "option"
    | "presentation"
    | "progressbar"
    | "radio"
    | "radiogroup"
    | "region"
    | "row"
    | "rowgroup"
    | "rowheader"
    | "scrollbar"
    | "search"
    | "searchbox"
    | "separator"
    | "slider"
    | "spinbutton"
    | "status"
    | "switch"
    | "tab"
    | "table"
    | "tablist"
    | "tabpanel"
    | "term"
    | "textbox"
    | "timer"
    | "toolbar"
    | "tooltip"
    | "tree"
    | "treegrid"
    | "treeitem"
    | (string & {});

  interface HTMLAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      PrefixedCSSProperties {
    // React-specific Attributes
    defaultChecked?: AktaValue<boolean>;
    defaultValue?: AktaValue<string | number | ReadonlyArray<string>>;
    suppressContentEditableWarning?: AktaValue<boolean>;
    suppressHydrationWarning?: AktaValue<boolean>;

    // Standard HTML Attributes
    accessKey?: AktaValue<string>;
    className?: AktaValue<string>;
    contentEditable?: AktaValue<Booleanish | "inherit">;
    contextMenu?: AktaValue<string>;
    dir?: AktaValue<string>;
    draggable?: AktaValue<Booleanish>;
    hidden?: AktaValue<boolean>;
    id?: AktaValue<string>;
    lang?: AktaValue<string>;
    placeholder?: AktaValue<string>;
    slot?: AktaValue<string>;
    spellCheck?: AktaValue<Booleanish>;
    style?: AktaValue<StylePropertyValue>;
    tabIndex?: AktaValue<number>;
    title?: AktaValue<string>;
    translate?: AktaValue<"yes" | "no">;

    // Unknown
    radioGroup?: AktaValue<string>; // <command>, <menuitem>;

    // WAI-ARIA
    role?: AktaValue<AriaRole>;

    // RDFa Attributes
    about?: AktaValue<string>;
    datatype?: AktaValue<string>;
    inlist?: AktaValue<any>;
    prefix?: AktaValue<string>;
    property?: AktaValue<string>;
    resource?: AktaValue<string>;
    typeof?: AktaValue<string>;
    vocab?: AktaValue<string>;

    // Non-standard Attributes
    autoCapitalize?: AktaValue<string>;
    autoCorrect?: AktaValue<string>;
    autoSave?: AktaValue<string>;
    color?: AktaValue<string>;
    itemProp?: AktaValue<string>;
    itemScope?: AktaValue<boolean>;
    itemType?: AktaValue<string>;
    itemID?: AktaValue<string>;
    itemRef?: AktaValue<string>;
    results?: AktaValue<number>;
    security?: AktaValue<string>;
    unselectable?: AktaValue<"on" | "off">;

    // Living Standard
    /**
     * Hints at the type of data that might be entered by the user while editing the element or its contents
     * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
     */
    inputMode?: AktaValue<
      | "none"
      | "text"
      | "tel"
      | "url"
      | "email"
      | "numeric"
      | "decimal"
      | "search"
    >;
    /**
     * Specify that a standard HTML element should behave like a defined custom built-in element
     * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
     */
    is?: AktaValue<string>;
  }

  interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
    // Standard HTML Attributes
    accept?: AktaValue<string>;
    acceptCharset?: AktaValue<string>;
    action?: AktaValue<string>;
    allowFullScreen?: AktaValue<boolean>;
    allowTransparency?: AktaValue<boolean>;
    alt?: AktaValue<string>;
    as?: AktaValue<string>;
    async?: AktaValue<boolean>;
    autoComplete?: AktaValue<string>;
    autoFocus?: AktaValue<boolean>;
    autoPlay?: AktaValue<boolean>;
    capture?: AktaValue<boolean | string>;
    cellPadding?: AktaValue<number | string>;
    cellSpacing?: AktaValue<number | string>;
    charSet?: AktaValue<string>;
    challenge?: AktaValue<string>;
    checked?: AktaValue<boolean>;
    cite?: AktaValue<string>;
    classID?: AktaValue<string>;
    cols?: AktaValue<number>;
    colSpan?: AktaValue<number>;
    content?: AktaValue<string>;
    controls?: AktaValue<boolean>;
    coords?: AktaValue<string>;
    crossOrigin?: AktaValue<string>;
    data?: AktaValue<string>;
    dateTime?: AktaValue<string>;
    default?: AktaValue<boolean>;
    defer?: AktaValue<boolean>;
    disabled?: AktaValue<boolean>;
    download?: AktaValue<any>;
    encType?: AktaValue<string>;
    form?: AktaValue<string>;
    formAction?: AktaValue<string>;
    formEncType?: AktaValue<string>;
    formMethod?: AktaValue<string>;
    formNoValidate?: AktaValue<boolean>;
    formTarget?: AktaValue<string>;
    frameBorder?: AktaValue<number | string>;
    headers?: AktaValue<string>;
    height?: AktaValue<number | string>;
    high?: AktaValue<number>;
    href?: AktaValue<string>;
    hrefLang?: AktaValue<string>;
    htmlFor?: AktaValue<string>;
    httpEquiv?: AktaValue<string>;
    integrity?: AktaValue<string>;
    keyParams?: AktaValue<string>;
    keyType?: AktaValue<string>;
    kind?: AktaValue<string>;
    label?: AktaValue<string>;
    list?: AktaValue<string>;
    loop?: AktaValue<boolean>;
    low?: AktaValue<number>;
    manifest?: AktaValue<string>;
    marginHeight?: AktaValue<number>;
    marginWidth?: AktaValue<number>;
    max?: AktaValue<number | string>;
    maxLength?: AktaValue<number>;
    media?: AktaValue<string>;
    mediaGroup?: AktaValue<string>;
    method?: AktaValue<string>;
    min?: AktaValue<number | string>;
    minLength?: AktaValue<number>;
    multiple?: AktaValue<boolean>;
    muted?: AktaValue<boolean>;
    name?: AktaValue<string>;
    nonce?: AktaValue<string>;
    noValidate?: AktaValue<boolean>;
    open?: AktaValue<boolean>;
    optimum?: AktaValue<number>;
    pattern?: AktaValue<string>;
    placeholder?: AktaValue<string>;
    playsInline?: AktaValue<boolean>;
    poster?: AktaValue<string>;
    preload?: AktaValue<string>;
    readOnly?: AktaValue<boolean>;
    rel?: AktaValue<string>;
    required?: AktaValue<boolean>;
    reversed?: AktaValue<boolean>;
    rows?: AktaValue<number>;
    rowSpan?: AktaValue<number>;
    sandbox?: AktaValue<string>;
    scope?: AktaValue<string>;
    scoped?: AktaValue<boolean>;
    scrolling?: AktaValue<string>;
    seamless?: AktaValue<boolean>;
    selected?: AktaValue<boolean>;
    shape?: AktaValue<string>;
    size?: AktaValue<number>;
    sizes?: AktaValue<string>;
    span?: AktaValue<number>;
    src?: AktaValue<string>;
    srcDoc?: AktaValue<string>;
    srcLang?: AktaValue<string>;
    srcSet?: AktaValue<string>;
    start?: AktaValue<number>;
    step?: AktaValue<number | string>;
    summary?: AktaValue<string>;
    target?: AktaValue<string>;
    type?: AktaValue<string>;
    useMap?: AktaValue<string>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
    width?: AktaValue<number | string>;
    wmode?: AktaValue<string>;
    wrap?: AktaValue<string>;
  }

  type HTMLAttributeReferrerPolicy =
    | ""
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "origin"
    | "origin-when-cross-origin"
    | "same-origin"
    | "strict-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";

  type HTMLAttributeAnchorTarget =
    | "_self"
    | "_blank"
    | "_parent"
    | "_top"
    | (string & {});

  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    download?: AktaValue<any>;
    href?: AktaValue<string>;
    hrefLang?: AktaValue<string>;
    media?: AktaValue<string>;
    ping?: AktaValue<string>;
    rel?: AktaValue<string>;
    target?: AktaValue<HTMLAttributeAnchorTarget>;
    type?: AktaValue<string>;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
  }

  interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

  interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: AktaValue<string>;
    coords?: AktaValue<string>;
    download?: AktaValue<any>;
    href?: AktaValue<string>;
    hrefLang?: AktaValue<string>;
    media?: AktaValue<string>;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
    rel?: AktaValue<string>;
    shape?: AktaValue<string>;
    target?: AktaValue<string>;
  }

  interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: AktaValue<string>;
    target?: AktaValue<string>;
  }

  interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: AktaValue<string>;
  }

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: AktaValue<boolean>;
    disabled?: AktaValue<boolean>;
    form?: AktaValue<string>;
    formAction?: AktaValue<string>;
    formEncType?: AktaValue<string>;
    formMethod?: AktaValue<string>;
    formNoValidate?: AktaValue<boolean>;
    formTarget?: AktaValue<string>;
    name?: AktaValue<string>;
    type?: AktaValue<"submit" | "reset" | "button">;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: AktaValue<number | string>;
    width?: AktaValue<number | string>;
  }

  interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: AktaValue<number>;
    width?: AktaValue<number | string>;
  }

  interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    span?: AktaValue<number>;
  }

  interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: AktaValue<boolean>;
    onToggle?: AktaEventHandler<T>;
  }

  interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: AktaValue<string>;
    dateTime?: AktaValue<string>;
  }

  interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
    open?: AktaValue<boolean>;
  }

  interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
    height?: AktaValue<number | string>;
    src?: AktaValue<string>;
    type?: AktaValue<string>;
    width?: AktaValue<number | string>;
  }

  interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: AktaValue<boolean>;
    form?: AktaValue<string>;
    name?: AktaValue<string>;
  }

  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    acceptCharset?: AktaValue<string>;
    action?: AktaValue<string>;
    autoComplete?: AktaValue<string>;
    encType?: AktaValue<string>;
    method?: AktaValue<string>;
    name?: AktaValue<string>;
    noValidate?: AktaValue<boolean>;
    target?: AktaValue<string>;
  }

  interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
    manifest?: AktaValue<string>;
  }

  interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
    allow?: AktaValue<string>;
    allowFullScreen?: AktaValue<boolean>;
    allowTransparency?: AktaValue<boolean>;
    /** @deprecated */
    frameBorder?: AktaValue<number | string>;
    height?: AktaValue<number | string>;
    loading?: AktaValue<"eager" | "lazy">;
    /** @deprecated */
    marginHeight?: AktaValue<number>;
    /** @deprecated */
    marginWidth?: AktaValue<number>;
    name?: AktaValue<string>;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
    sandbox?: AktaValue<string>;
    /** @deprecated */
    scrolling?: AktaValue<string>;
    seamless?: AktaValue<boolean>;
    src?: AktaValue<string>;
    srcDoc?: AktaValue<string>;
    width?: AktaValue<number | string>;
  }

  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: AktaValue<string>;
    crossOrigin?: AktaValue<"anonymous" | "use-credentials" | "">;
    decoding?: AktaValue<"async" | "auto" | "sync">;
    height?: AktaValue<number | string>;
    loading?: AktaValue<"eager" | "lazy">;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
    sizes?: AktaValue<string>;
    src?: AktaValue<string>;
    srcSet?: AktaValue<string>;
    useMap?: AktaValue<string>;
    width?: AktaValue<number | string>;
  }

  interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: AktaValue<string>;
    dateTime?: AktaValue<string>;
  }

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    accept?: AktaValue<string>;
    alt?: AktaValue<string>;
    autoComplete?: AktaValue<string>;
    autoFocus?: AktaValue<boolean>;
    capture?: AktaValue<boolean | string>; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute;
    checked?: AktaValue<boolean>;
    crossOrigin?: AktaValue<string>;
    disabled?: AktaValue<boolean>;
    enterKeyHint?: AktaValue<
      "enter" | "done" | "go" | "next" | "previous" | "search" | "send"
    >;
    form?: AktaValue<string>;
    formAction?: AktaValue<string>;
    formEncType?: AktaValue<string>;
    formMethod?: AktaValue<string>;
    formNoValidate?: AktaValue<boolean>;
    formTarget?: AktaValue<string>;
    height?: AktaValue<number | string>;
    list?: AktaValue<string>;
    max?: AktaValue<number | string>;
    maxLength?: AktaValue<number>;
    min?: AktaValue<number | string>;
    minLength?: AktaValue<number>;
    multiple?: AktaValue<boolean>;
    name?: AktaValue<string>;
    pattern?: AktaValue<string>;
    placeholder?: AktaValue<string>;
    readOnly?: AktaValue<boolean>;
    required?: AktaValue<boolean>;
    size?: AktaValue<number>;
    src?: AktaValue<string>;
    step?: AktaValue<number | string>;
    type?: AktaValue<string>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
    width?: AktaValue<number | string>;

    onChange?: ChangeEventHandler<T>;
  }

  interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: AktaValue<boolean>;
    challenge?: AktaValue<string>;
    disabled?: AktaValue<boolean>;
    form?: AktaValue<string>;
    keyType?: AktaValue<string>;
    keyParams?: AktaValue<string>;
    name?: AktaValue<string>;
  }

  interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: AktaValue<string>;
    htmlFor?: AktaValue<string>;
  }

  interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    as?: AktaValue<string>;
    crossOrigin?: AktaValue<string>;
    href?: AktaValue<string>;
    hrefLang?: AktaValue<string>;
    integrity?: AktaValue<string>;
    media?: AktaValue<string>;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
    rel?: AktaValue<string>;
    sizes?: AktaValue<string>;
    type?: AktaValue<string>;
    charSet?: AktaValue<string>;
  }

  interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: AktaValue<string>;
  }

  interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: AktaValue<string>;
  }

  interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoPlay?: AktaValue<boolean>;
    controls?: AktaValue<boolean>;
    controlsList?: AktaValue<string>;
    crossOrigin?: AktaValue<string>;
    loop?: AktaValue<boolean>;
    mediaGroup?: AktaValue<string>;
    muted?: AktaValue<boolean>;
    playsInline?: AktaValue<boolean>;
    preload?: AktaValue<string>;
    src?: AktaValue<string>;
  }

  interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
    charSet?: AktaValue<string>;
    content?: AktaValue<string>;
    httpEquiv?: AktaValue<string>;
    name?: AktaValue<string>;
  }

  interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: AktaValue<string>;
    high?: AktaValue<number>;
    low?: AktaValue<number>;
    max?: AktaValue<number | string>;
    min?: AktaValue<number | string>;
    optimum?: AktaValue<number>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
    cite?: AktaValue<string>;
  }

  interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
    classID?: AktaValue<string>;
    data?: AktaValue<string>;
    form?: AktaValue<string>;
    height?: AktaValue<number | string>;
    name?: AktaValue<string>;
    type?: AktaValue<string>;
    useMap?: AktaValue<string>;
    width?: AktaValue<number | string>;
    wmode?: AktaValue<string>;
  }

  interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    reversed?: AktaValue<boolean>;
    start?: AktaValue<number>;
    type?: AktaValue<"1" | "a" | "A" | "i" | "I">;
  }

  interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: AktaValue<boolean>;
    label?: AktaValue<string>;
  }

  interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
    disabled?: AktaValue<boolean>;
    label?: AktaValue<string>;
    selected?: AktaValue<boolean>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
    form?: AktaValue<string>;
    htmlFor?: AktaValue<string>;
    name?: AktaValue<string>;
  }

  interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: AktaValue<string>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
    max?: AktaValue<number | string>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
  }

  interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
    name?: AktaValue<string>;
  }

  interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
    async?: AktaValue<boolean>;
    /** @deprecated */
    charSet?: AktaValue<string>;
    crossOrigin?: AktaValue<string>;
    defer?: AktaValue<boolean>;
    integrity?: AktaValue<string>;
    noModule?: AktaValue<boolean>;
    nonce?: AktaValue<string>;
    referrerPolicy?: AktaValue<HTMLAttributeReferrerPolicy>;
    src?: AktaValue<string>;
    type?: AktaValue<string>;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: AktaValue<string>;
    autoFocus?: AktaValue<boolean>;
    disabled?: AktaValue<boolean>;
    form?: AktaValue<string>;
    multiple?: AktaValue<boolean>;
    name?: AktaValue<string>;
    required?: AktaValue<boolean>;
    size?: AktaValue<number>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
    onChange?: ChangeEventHandler<T>;
  }

  interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: AktaValue<string>;
    sizes?: AktaValue<string>;
    src?: AktaValue<string>;
    srcSet?: AktaValue<string>;
    type?: AktaValue<string>;
  }

  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    media?: AktaValue<string>;
    nonce?: AktaValue<string>;
    scoped?: AktaValue<boolean>;
    type?: AktaValue<string>;
  }

  interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
    cellPadding?: AktaValue<number | string>;
    cellSpacing?: AktaValue<number | string>;
    summary?: AktaValue<string>;
    width?: AktaValue<number | string>;
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    autoComplete?: AktaValue<string>;
    autoFocus?: AktaValue<boolean>;
    cols?: AktaValue<number>;
    dirName?: AktaValue<string>;
    disabled?: AktaValue<boolean>;
    form?: AktaValue<string>;
    maxLength?: AktaValue<number>;
    minLength?: AktaValue<number>;
    name?: AktaValue<string>;
    placeholder?: AktaValue<string>;
    readOnly?: AktaValue<boolean>;
    required?: AktaValue<boolean>;
    rows?: AktaValue<number>;
    value?: AktaValue<string | ReadonlyArray<string> | number>;
    wrap?: AktaValue<string>;

    onChange?: ChangeEventHandler<T>;
  }

  interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: AktaValue<"left" | "center" | "right" | "justify" | "char">;
    colSpan?: AktaValue<number>;
    headers?: AktaValue<string>;
    rowSpan?: AktaValue<number>;
    scope?: AktaValue<string>;
    abbr?: AktaValue<string>;
    height?: AktaValue<number | string>;
    width?: AktaValue<number | string>;
    valign?: AktaValue<"top" | "middle" | "bottom" | "baseline">;
  }

  interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    align?: AktaValue<"left" | "center" | "right" | "justify" | "char">;
    colSpan?: AktaValue<number>;
    headers?: AktaValue<string>;
    rowSpan?: AktaValue<number>;
    scope?: AktaValue<string>;
    abbr?: AktaValue<string>;
  }

  interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
    dateTime?: AktaValue<string>;
  }

  interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
    default?: AktaValue<boolean>;
    kind?: AktaValue<string>;
    label?: AktaValue<string>;
    src?: AktaValue<string>;
    srcLang?: AktaValue<string>;
  }

  interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
    height?: AktaValue<number | string>;
    playsInline?: AktaValue<boolean>;
    poster?: AktaValue<string>;
    width?: AktaValue<number | string>;
    disablePictureInPicture?: AktaValue<boolean>;
    disableRemotePlayback?: AktaValue<boolean>;
  }

  // this list is "complete" in that it contains every SVG attribute
  // that React supports, but the types can be improved.
  // Full list here: https://facebook.github.io/react/docs/dom-elements.html
  //
  // The three broad type categories are (in order of restrictiveness):
  //   - "number | string"
  //   - "string"
  //   - union of string literals
  interface SVGAttributes<T>
    extends AriaAttributes,
      DOMAttributes<T>,
      PrefixedSvgCSSProperties {
    // Attributes which also defined in HTMLAttributes
    // See comment in SVGDOMPropertyConfig.js
    className?: AktaValue<string>;
    color?: AktaValue<string>;
    height?: AktaValue<number | string>;
    id?: AktaValue<string>;
    lang?: AktaValue<string>;
    max?: AktaValue<number | string>;
    media?: AktaValue<string>;
    method?: AktaValue<string>;
    min?: AktaValue<number | string>;
    name?: AktaValue<string>;
    style?: AktaValue<StylePropertyValue>;
    target?: AktaValue<string>;
    type?: AktaValue<string>;
    width?: AktaValue<number | string>;

    // Other HTML properties supported by SVG elements in browsers
    role?: AktaValue<AriaRole>;
    tabIndex?: AktaValue<number>;
    crossOrigin?: AktaValue<"anonymous" | "use-credentials" | "">;

    // SVG Specific attributes
    accentHeight?: AktaValue<number | string>;
    accumulate?: AktaValue<"none" | "sum">;
    additive?: AktaValue<"replace" | "sum">;
    alignmentBaseline?: AktaValue<
      | "auto"
      | "baseline"
      | "before-edge"
      | "text-before-edge"
      | "middle"
      | "central"
      | "after-edge"
      | "text-after-edge"
      | "ideographic"
      | "alphabetic"
      | "hanging"
      | "mathematical"
      | "inherit"
    >;
    allowReorder?: AktaValue<"no" | "yes">;
    alphabetic?: AktaValue<number | string>;
    amplitude?: AktaValue<number | string>;
    arabicForm?: AktaValue<"initial" | "medial" | "terminal" | "isolated">;
    ascent?: AktaValue<number | string>;
    attributeName?: AktaValue<string>;
    attributeType?: AktaValue<string>;
    autoReverse?: AktaValue<Booleanish>;
    azimuth?: AktaValue<number | string>;
    baseFrequency?: AktaValue<number | string>;
    baselineShift?: AktaValue<number | string>;
    baseProfile?: AktaValue<number | string>;
    bbox?: AktaValue<number | string>;
    begin?: AktaValue<number | string>;
    bias?: AktaValue<number | string>;
    by?: AktaValue<number | string>;
    calcMode?: AktaValue<number | string>;
    capHeight?: AktaValue<number | string>;
    clip?: AktaValue<number | string>;
    clipPath?: AktaValue<string>;
    clipPathUnits?: AktaValue<number | string>;
    clipRule?: AktaValue<number | string>;
    colorInterpolation?: AktaValue<number | string>;
    colorInterpolationFilters?: AktaValue<
      "auto" | "sRGB" | "linearRGB" | "inherit"
    >;
    colorProfile?: AktaValue<number | string>;
    colorRendering?: AktaValue<number | string>;
    contentScriptType?: AktaValue<number | string>;
    contentStyleType?: AktaValue<number | string>;
    cursor?: AktaValue<number | string>;
    cx?: AktaValue<number | string>;
    cy?: AktaValue<number | string>;
    d?: AktaValue<string>;
    decelerate?: AktaValue<number | string>;
    descent?: AktaValue<number | string>;
    diffuseConstant?: AktaValue<number | string>;
    direction?: AktaValue<number | string>;
    display?: AktaValue<number | string>;
    divisor?: AktaValue<number | string>;
    dominantBaseline?: AktaValue<number | string>;
    dur?: AktaValue<number | string>;
    dx?: AktaValue<number | string>;
    dy?: AktaValue<number | string>;
    edgeMode?: AktaValue<number | string>;
    elevation?: AktaValue<number | string>;
    enableBackground?: AktaValue<number | string>;
    end?: AktaValue<number | string>;
    exponent?: AktaValue<number | string>;
    externalResourcesRequired?: AktaValue<Booleanish>;
    fill?: AktaValue<string>;
    fillOpacity?: AktaValue<number | string>;
    fillRule?: AktaValue<"nonzero" | "evenodd" | "inherit">;
    filter?: AktaValue<string>;
    filterRes?: AktaValue<number | string>;
    filterUnits?: AktaValue<number | string>;
    floodColor?: AktaValue<number | string>;
    floodOpacity?: AktaValue<number | string>;
    focusable?: AktaValue<Booleanish | "auto">;
    fontFamily?: AktaValue<string>;
    fontSize?: AktaValue<number | string>;
    fontSizeAdjust?: AktaValue<number | string>;
    fontStretch?: AktaValue<number | string>;
    fontStyle?: AktaValue<number | string>;
    fontVariant?: AktaValue<number | string>;
    fontWeight?: AktaValue<number | string>;
    format?: AktaValue<number | string>;
    from?: AktaValue<number | string>;
    fx?: AktaValue<number | string>;
    fy?: AktaValue<number | string>;
    g1?: AktaValue<number | string>;
    g2?: AktaValue<number | string>;
    glyphName?: AktaValue<number | string>;
    glyphOrientationHorizontal?: AktaValue<number | string>;
    glyphOrientationVertical?: AktaValue<number | string>;
    glyphRef?: AktaValue<number | string>;
    gradientTransform?: AktaValue<string>;
    gradientUnits?: AktaValue<string>;
    hanging?: AktaValue<number | string>;
    horizAdvX?: AktaValue<number | string>;
    horizOriginX?: AktaValue<number | string>;
    href?: AktaValue<string>;
    ideographic?: AktaValue<number | string>;
    imageRendering?: AktaValue<number | string>;
    in2?: AktaValue<number | string>;
    in?: AktaValue<string>;
    intercept?: AktaValue<number | string>;
    k1?: AktaValue<number | string>;
    k2?: AktaValue<number | string>;
    k3?: AktaValue<number | string>;
    k4?: AktaValue<number | string>;
    k?: AktaValue<number | string>;
    kernelMatrix?: AktaValue<number | string>;
    kernelUnitLength?: AktaValue<number | string>;
    kerning?: AktaValue<number | string>;
    keyPoints?: AktaValue<number | string>;
    keySplines?: AktaValue<number | string>;
    keyTimes?: AktaValue<number | string>;
    lengthAdjust?: AktaValue<number | string>;
    letterSpacing?: AktaValue<number | string>;
    lightingColor?: AktaValue<number | string>;
    limitingConeAngle?: AktaValue<number | string>;
    local?: AktaValue<number | string>;
    markerEnd?: AktaValue<string>;
    markerHeight?: AktaValue<number | string>;
    markerMid?: AktaValue<string>;
    markerStart?: AktaValue<string>;
    markerUnits?: AktaValue<number | string>;
    markerWidth?: AktaValue<number | string>;
    mask?: AktaValue<string>;
    maskContentUnits?: AktaValue<number | string>;
    maskUnits?: AktaValue<number | string>;
    mathematical?: AktaValue<number | string>;
    mode?: AktaValue<number | string>;
    numOctaves?: AktaValue<number | string>;
    offset?: AktaValue<number | string>;
    opacity?: AktaValue<number | string>;
    operator?: AktaValue<number | string>;
    order?: AktaValue<number | string>;
    orient?: AktaValue<number | string>;
    orientation?: AktaValue<number | string>;
    origin?: AktaValue<number | string>;
    overflow?: AktaValue<number | string>;
    overlinePosition?: AktaValue<number | string>;
    overlineThickness?: AktaValue<number | string>;
    paintOrder?: AktaValue<number | string>;
    panose1?: AktaValue<number | string>;
    path?: AktaValue<string>;
    pathLength?: AktaValue<number | string>;
    patternContentUnits?: AktaValue<string>;
    patternTransform?: AktaValue<number | string>;
    patternUnits?: AktaValue<string>;
    pointerEvents?: AktaValue<number | string>;
    points?: AktaValue<string>;
    pointsAtX?: AktaValue<number | string>;
    pointsAtY?: AktaValue<number | string>;
    pointsAtZ?: AktaValue<number | string>;
    preserveAlpha?: AktaValue<Booleanish>;
    preserveAspectRatio?: AktaValue<string>;
    primitiveUnits?: AktaValue<number | string>;
    r?: AktaValue<number | string>;
    radius?: AktaValue<number | string>;
    refX?: AktaValue<number | string>;
    refY?: AktaValue<number | string>;
    renderingIntent?: AktaValue<number | string>;
    repeatCount?: AktaValue<number | string>;
    repeatDur?: AktaValue<number | string>;
    requiredExtensions?: AktaValue<number | string>;
    requiredFeatures?: AktaValue<number | string>;
    restart?: AktaValue<number | string>;
    result?: AktaValue<string>;
    rotate?: AktaValue<number | string>;
    rx?: AktaValue<number | string>;
    ry?: AktaValue<number | string>;
    scale?: AktaValue<number | string>;
    seed?: AktaValue<number | string>;
    shapeRendering?: AktaValue<number | string>;
    slope?: AktaValue<number | string>;
    spacing?: AktaValue<number | string>;
    specularConstant?: AktaValue<number | string>;
    specularExponent?: AktaValue<number | string>;
    speed?: AktaValue<number | string>;
    spreadMethod?: AktaValue<string>;
    startOffset?: AktaValue<number | string>;
    stdDeviation?: AktaValue<number | string>;
    stemh?: AktaValue<number | string>;
    stemv?: AktaValue<number | string>;
    stitchTiles?: AktaValue<number | string>;
    stopColor?: AktaValue<string>;
    stopOpacity?: AktaValue<number | string>;
    strikethroughPosition?: AktaValue<number | string>;
    strikethroughThickness?: AktaValue<number | string>;
    string?: AktaValue<number | string>;
    stroke?: AktaValue<string>;
    strokeDasharray?: AktaValue<string | number>;
    strokeDashoffset?: AktaValue<string | number>;
    strokeLinecap?: AktaValue<"butt" | "round" | "square" | "inherit">;
    strokeLinejoin?: AktaValue<"miter" | "round" | "bevel" | "inherit">;
    strokeMiterlimit?: AktaValue<number | string>;
    strokeOpacity?: AktaValue<number | string>;
    strokeWidth?: AktaValue<number | string>;
    surfaceScale?: AktaValue<number | string>;
    systemLanguage?: AktaValue<number | string>;
    tableValues?: AktaValue<number | string>;
    targetX?: AktaValue<number | string>;
    targetY?: AktaValue<number | string>;
    textAnchor?: AktaValue<string>;
    textDecoration?: AktaValue<number | string>;
    textLength?: AktaValue<number | string>;
    textRendering?: AktaValue<number | string>;
    to?: AktaValue<number | string>;
    transform?: AktaValue<string>;
    u1?: AktaValue<number | string>;
    u2?: AktaValue<number | string>;
    underlinePosition?: AktaValue<number | string>;
    underlineThickness?: AktaValue<number | string>;
    unicode?: AktaValue<number | string>;
    unicodeBidi?: AktaValue<number | string>;
    unicodeRange?: AktaValue<number | string>;
    unitsPerEm?: AktaValue<number | string>;
    vAlphabetic?: AktaValue<number | string>;
    values?: AktaValue<string>;
    vectorEffect?: AktaValue<number | string>;
    version?: AktaValue<string>;
    vertAdvY?: AktaValue<number | string>;
    vertOriginX?: AktaValue<number | string>;
    vertOriginY?: AktaValue<number | string>;
    vHanging?: AktaValue<number | string>;
    vIdeographic?: AktaValue<number | string>;
    viewBox?: AktaValue<string>;
    viewTarget?: AktaValue<number | string>;
    visibility?: AktaValue<number | string>;
    vMathematical?: AktaValue<number | string>;
    widths?: AktaValue<number | string>;
    wordSpacing?: AktaValue<number | string>;
    writingMode?: AktaValue<number | string>;
    x1?: AktaValue<number | string>;
    x2?: AktaValue<number | string>;
    x?: AktaValue<number | string>;
    xChannelSelector?: AktaValue<string>;
    xHeight?: AktaValue<number | string>;
    xlinkActuate?: AktaValue<string>;
    xlinkArcrole?: AktaValue<string>;
    xlinkHref?: AktaValue<string>;
    xlinkRole?: AktaValue<string>;
    xlinkShow?: AktaValue<string>;
    xlinkTitle?: AktaValue<string>;
    xlinkType?: AktaValue<string>;
    xmlBase?: AktaValue<string>;
    xmlLang?: AktaValue<string>;
    xmlns?: AktaValue<string>;
    xmlnsXlink?: AktaValue<string>;
    xmlSpace?: AktaValue<string>;
    y1?: AktaValue<number | string>;
    y2?: AktaValue<number | string>;
    y?: AktaValue<number | string>;
    yChannelSelector?: AktaValue<string>;
    z?: AktaValue<number | string>;
    zoomAndPan?: AktaValue<string>;
  }

  interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
    allowFullScreen?: AktaValue<boolean>;
    allowpopups?: AktaValue<boolean>;
    autoFocus?: AktaValue<boolean>;
    autosize?: AktaValue<boolean>;
    blinkfeatures?: AktaValue<string>;
    disableblinkfeatures?: AktaValue<string>;
    disableguestresize?: AktaValue<boolean>;
    disablewebsecurity?: AktaValue<boolean>;
    guestinstance?: AktaValue<string>;
    httpreferrer?: AktaValue<string>;
    nodeintegration?: AktaValue<boolean>;
    partition?: AktaValue<string>;
    plugins?: AktaValue<boolean>;
    preload?: AktaValue<string>;
    src?: AktaValue<string>;
    useragent?: AktaValue<string>;
    webpreferences?: AktaValue<string>;
  }

  //
  // Browser Interfaces
  // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
  // ----------------------------------------------------------------------

  interface AbstractView {
    styleMedia: StyleMedia;
    document: Document;
  }

  interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }

  interface TouchList {
    [index: number]: Touch;
    length: number;
    item(index: number): Touch;
    identifiedTouch(identifier: number): Touch;
  }

  //
  // Error Interfaces
  // ----------------------------------------------------------------------
  interface ErrorInfo {
    /**
     * Captures which component contained the exception, and its ancestors.
     */
    componentStack: string;
  }
}

type Key = string;

declare global {
  namespace JSX {
    type Element = AktaNode;
    interface ElementClass {
      render(): AktaElement;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }

    interface IntrinsicAttributes extends Akta.Attributes {}
    interface IntrinsicClassAttributes<T> extends Akta.ClassAttributes<T> {}

    interface IntrinsicElements {
      // HTML
      a: Akta.DetailedHTMLProps<
        Akta.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
      >;
      abbr: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      address: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      area: Akta.DetailedHTMLProps<
        Akta.AreaHTMLAttributes<HTMLAreaElement>,
        HTMLAreaElement
      >;
      article: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      aside: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      audio: Akta.DetailedHTMLProps<
        Akta.AudioHTMLAttributes<HTMLAudioElement>,
        HTMLAudioElement
      >;
      b: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      base: Akta.DetailedHTMLProps<
        Akta.BaseHTMLAttributes<HTMLBaseElement>,
        HTMLBaseElement
      >;
      bdi: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      bdo: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      big: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      blockquote: Akta.DetailedHTMLProps<
        Akta.BlockquoteHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      body: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLBodyElement>,
        HTMLBodyElement
      >;
      br: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLBRElement>,
        HTMLBRElement
      >;
      button: Akta.DetailedHTMLProps<
        Akta.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >;
      canvas: Akta.DetailedHTMLProps<
        Akta.CanvasHTMLAttributes<HTMLCanvasElement>,
        HTMLCanvasElement
      >;
      caption: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      cite: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      code: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      col: Akta.DetailedHTMLProps<
        Akta.ColHTMLAttributes<HTMLTableColElement>,
        HTMLTableColElement
      >;
      colgroup: Akta.DetailedHTMLProps<
        Akta.ColgroupHTMLAttributes<HTMLTableColElement>,
        HTMLTableColElement
      >;
      data: Akta.DetailedHTMLProps<
        Akta.DataHTMLAttributes<HTMLDataElement>,
        HTMLDataElement
      >;
      datalist: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLDataListElement>,
        HTMLDataListElement
      >;
      dd: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      del: Akta.DetailedHTMLProps<
        Akta.DelHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      details: Akta.DetailedHTMLProps<
        Akta.DetailsHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      dfn: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      dialog: Akta.DetailedHTMLProps<
        Akta.DialogHTMLAttributes<HTMLDialogElement>,
        HTMLDialogElement
      >;
      div: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
      >;
      dl: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLDListElement>,
        HTMLDListElement
      >;
      dt: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      em: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      embed: Akta.DetailedHTMLProps<
        Akta.EmbedHTMLAttributes<HTMLEmbedElement>,
        HTMLEmbedElement
      >;
      fieldset: Akta.DetailedHTMLProps<
        Akta.FieldsetHTMLAttributes<HTMLFieldSetElement>,
        HTMLFieldSetElement
      >;
      figcaption: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      figure: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      footer: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      form: Akta.DetailedHTMLProps<
        Akta.FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
      >;
      h1: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      h2: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      h3: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      h4: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      h5: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      h6: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadingElement>,
        HTMLHeadingElement
      >;
      head: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHeadElement>,
        HTMLHeadElement
      >;
      header: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      hgroup: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      hr: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLHRElement>,
        HTMLHRElement
      >;
      html: Akta.DetailedHTMLProps<
        Akta.HtmlHTMLAttributes<HTMLHtmlElement>,
        HTMLHtmlElement
      >;
      i: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      iframe: Akta.DetailedHTMLProps<
        Akta.IframeHTMLAttributes<HTMLIFrameElement>,
        HTMLIFrameElement
      >;
      img: Akta.DetailedHTMLProps<
        Akta.ImgHTMLAttributes<HTMLImageElement>,
        HTMLImageElement
      >;
      input: Akta.DetailedHTMLProps<
        Akta.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >;
      ins: Akta.DetailedHTMLProps<
        Akta.InsHTMLAttributes<HTMLModElement>,
        HTMLModElement
      >;
      kbd: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      keygen: Akta.DetailedHTMLProps<
        Akta.KeygenHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      label: Akta.DetailedHTMLProps<
        Akta.LabelHTMLAttributes<HTMLLabelElement>,
        HTMLLabelElement
      >;
      legend: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLLegendElement>,
        HTMLLegendElement
      >;
      li: Akta.DetailedHTMLProps<
        Akta.LiHTMLAttributes<HTMLLIElement>,
        HTMLLIElement
      >;
      link: Akta.DetailedHTMLProps<
        Akta.LinkHTMLAttributes<HTMLLinkElement>,
        HTMLLinkElement
      >;
      main: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      map: Akta.DetailedHTMLProps<
        Akta.MapHTMLAttributes<HTMLMapElement>,
        HTMLMapElement
      >;
      mark: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      menu: Akta.DetailedHTMLProps<
        Akta.MenuHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      menuitem: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      meta: Akta.DetailedHTMLProps<
        Akta.MetaHTMLAttributes<HTMLMetaElement>,
        HTMLMetaElement
      >;
      meter: Akta.DetailedHTMLProps<
        Akta.MeterHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      nav: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      noindex: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      noscript: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      object: Akta.DetailedHTMLProps<
        Akta.ObjectHTMLAttributes<HTMLObjectElement>,
        HTMLObjectElement
      >;
      ol: Akta.DetailedHTMLProps<
        Akta.OlHTMLAttributes<HTMLOListElement>,
        HTMLOListElement
      >;
      optgroup: Akta.DetailedHTMLProps<
        Akta.OptgroupHTMLAttributes<HTMLOptGroupElement>,
        HTMLOptGroupElement
      >;
      option: Akta.DetailedHTMLProps<
        Akta.OptionHTMLAttributes<HTMLOptionElement>,
        HTMLOptionElement
      >;
      output: Akta.DetailedHTMLProps<
        Akta.OutputHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      p: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLParagraphElement>,
        HTMLParagraphElement
      >;
      param: Akta.DetailedHTMLProps<
        Akta.ParamHTMLAttributes<HTMLParamElement>,
        HTMLParamElement
      >;
      picture: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      pre: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLPreElement>,
        HTMLPreElement
      >;
      progress: Akta.DetailedHTMLProps<
        Akta.ProgressHTMLAttributes<HTMLProgressElement>,
        HTMLProgressElement
      >;
      q: Akta.DetailedHTMLProps<
        Akta.QuoteHTMLAttributes<HTMLQuoteElement>,
        HTMLQuoteElement
      >;
      rp: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      rt: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      ruby: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      s: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      samp: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      slot: Akta.DetailedHTMLProps<
        Akta.SlotHTMLAttributes<HTMLSlotElement>,
        HTMLSlotElement
      >;
      script: Akta.DetailedHTMLProps<
        Akta.ScriptHTMLAttributes<HTMLScriptElement>,
        HTMLScriptElement
      >;
      section: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      select: Akta.DetailedHTMLProps<
        Akta.SelectHTMLAttributes<HTMLSelectElement>,
        HTMLSelectElement
      >;
      small: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      source: Akta.DetailedHTMLProps<
        Akta.SourceHTMLAttributes<HTMLSourceElement>,
        HTMLSourceElement
      >;
      span: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLSpanElement>,
        HTMLSpanElement
      >;
      strong: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      style: Akta.DetailedHTMLProps<
        Akta.StyleHTMLAttributes<HTMLStyleElement>,
        HTMLStyleElement
      >;
      sub: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      summary: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      sup: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      table: Akta.DetailedHTMLProps<
        Akta.TableHTMLAttributes<HTMLTableElement>,
        HTMLTableElement
      >;
      template: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTemplateElement>,
        HTMLTemplateElement
      >;
      tbody: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTableSectionElement>,
        HTMLTableSectionElement
      >;
      td: Akta.DetailedHTMLProps<
        Akta.TdHTMLAttributes<HTMLTableDataCellElement>,
        HTMLTableDataCellElement
      >;
      textarea: Akta.DetailedHTMLProps<
        Akta.TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
      >;
      tfoot: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTableSectionElement>,
        HTMLTableSectionElement
      >;
      th: Akta.DetailedHTMLProps<
        Akta.ThHTMLAttributes<HTMLTableHeaderCellElement>,
        HTMLTableHeaderCellElement
      >;
      thead: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTableSectionElement>,
        HTMLTableSectionElement
      >;
      time: Akta.DetailedHTMLProps<
        Akta.TimeHTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      title: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTitleElement>,
        HTMLTitleElement
      >;
      tr: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLTableRowElement>,
        HTMLTableRowElement
      >;
      track: Akta.DetailedHTMLProps<
        Akta.TrackHTMLAttributes<HTMLTrackElement>,
        HTMLTrackElement
      >;
      u: Akta.DetailedHTMLProps<Akta.HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLUListElement>,
        HTMLUListElement
      >;
      var: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      video: Akta.DetailedHTMLProps<
        Akta.VideoHTMLAttributes<HTMLVideoElement>,
        HTMLVideoElement
      >;
      wbr: Akta.DetailedHTMLProps<
        Akta.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      /*
      webview: Akta.DetailedHTMLProps<
        Akta.WebViewHTMLAttributes<HTMLWebViewElement>,
        HTMLWebViewElement
      >;*/

      // SVG
      svg: Akta.SVGProps<SVGSVGElement>;

      animate: Akta.SVGProps<SVGElement>; // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
      animateMotion: Akta.SVGProps<SVGElement>;
      animateTransform: Akta.SVGProps<SVGElement>; // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
      circle: Akta.SVGProps<SVGCircleElement>;
      clipPath: Akta.SVGProps<SVGClipPathElement>;
      defs: Akta.SVGProps<SVGDefsElement>;
      desc: Akta.SVGProps<SVGDescElement>;
      ellipse: Akta.SVGProps<SVGEllipseElement>;
      feBlend: Akta.SVGProps<SVGFEBlendElement>;
      feColorMatrix: Akta.SVGProps<SVGFEColorMatrixElement>;
      feComponentTransfer: Akta.SVGProps<SVGFEComponentTransferElement>;
      feComposite: Akta.SVGProps<SVGFECompositeElement>;
      feConvolveMatrix: Akta.SVGProps<SVGFEConvolveMatrixElement>;
      feDiffuseLighting: Akta.SVGProps<SVGFEDiffuseLightingElement>;
      feDisplacementMap: Akta.SVGProps<SVGFEDisplacementMapElement>;
      feDistantLight: Akta.SVGProps<SVGFEDistantLightElement>;
      feDropShadow: Akta.SVGProps<SVGFEDropShadowElement>;
      feFlood: Akta.SVGProps<SVGFEFloodElement>;
      feFuncA: Akta.SVGProps<SVGFEFuncAElement>;
      feFuncB: Akta.SVGProps<SVGFEFuncBElement>;
      feFuncG: Akta.SVGProps<SVGFEFuncGElement>;
      feFuncR: Akta.SVGProps<SVGFEFuncRElement>;
      feGaussianBlur: Akta.SVGProps<SVGFEGaussianBlurElement>;
      feImage: Akta.SVGProps<SVGFEImageElement>;
      feMerge: Akta.SVGProps<SVGFEMergeElement>;
      feMergeNode: Akta.SVGProps<SVGFEMergeNodeElement>;
      feMorphology: Akta.SVGProps<SVGFEMorphologyElement>;
      feOffset: Akta.SVGProps<SVGFEOffsetElement>;
      fePointLight: Akta.SVGProps<SVGFEPointLightElement>;
      feSpecularLighting: Akta.SVGProps<SVGFESpecularLightingElement>;
      feSpotLight: Akta.SVGProps<SVGFESpotLightElement>;
      feTile: Akta.SVGProps<SVGFETileElement>;
      feTurbulence: Akta.SVGProps<SVGFETurbulenceElement>;
      filter: Akta.SVGProps<SVGFilterElement>;
      foreignObject: Akta.SVGProps<SVGForeignObjectElement>;
      g: Akta.SVGProps<SVGGElement>;
      image: Akta.SVGProps<SVGImageElement>;
      line: Akta.SVGProps<SVGLineElement>;
      linearGradient: Akta.SVGProps<SVGLinearGradientElement>;
      marker: Akta.SVGProps<SVGMarkerElement>;
      mask: Akta.SVGProps<SVGMaskElement>;
      metadata: Akta.SVGProps<SVGMetadataElement>;
      mpath: Akta.SVGProps<SVGElement>;
      path: Akta.SVGProps<SVGPathElement>;
      pattern: Akta.SVGProps<SVGPatternElement>;
      polygon: Akta.SVGProps<SVGPolygonElement>;
      polyline: Akta.SVGProps<SVGPolylineElement>;
      radialGradient: Akta.SVGProps<SVGRadialGradientElement>;
      rect: Akta.SVGProps<SVGRectElement>;
      stop: Akta.SVGProps<SVGStopElement>;
      switch: Akta.SVGProps<SVGSwitchElement>;
      symbol: Akta.SVGProps<SVGSymbolElement>;
      text: Akta.SVGProps<SVGTextElement>;
      textPath: Akta.SVGProps<SVGTextPathElement>;
      tspan: Akta.SVGProps<SVGTSpanElement>;
      use: Akta.SVGProps<SVGUseElement>;
      view: Akta.SVGProps<SVGViewElement>;
    }
  }
}
export { Akta };
