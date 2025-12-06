import Reanimated, { useEvent, useHandler } from 'react-native-reanimated';
import { State as GestureState } from 'react-native-gesture-handler';

type GestureHandlerFn = (
  event: any,
  context: Record<string, unknown>
) => void;

type GestureHandlers = {
  onStart?: GestureHandlerFn;
  onActive?: GestureHandlerFn;
  onEnd?: GestureHandlerFn;
  onFail?: GestureHandlerFn;
  onCancel?: GestureHandlerFn;
  onFinish?: GestureHandlerFn;
};

type GestureEvent = {
  eventName?: string;
  oldState?: GestureState;
  state: GestureState;
} & Record<string, any>;

const eventSubscriptions = [
  'onGestureHandlerStateChange',
  'onGestureHandlerEvent',
] as const;

function callOptionalHandler(
  handlers: GestureHandlers,
  name: keyof GestureHandlers,
  event: GestureEvent,
  context: Record<string, unknown>,
  extra?: unknown
) {
  'worklet';
  const handler = handlers[name];
  if (typeof handler === 'function') {
    if (extra === undefined) {
      handler(event, context);
    } else {
      // @ts-expect-error legacy handler signature may accept third param
      handler(event, context, extra);
    }
  }
}

function handleGestureEvent(
  handlers: GestureHandlers,
  event: GestureEvent,
  context: Record<string, unknown>
) {
  'worklet';
  const eventName = event.eventName || '';

  const isStateChange = eventName.endsWith('onGestureHandlerStateChange');
  const isGestureEvent = eventName.endsWith('onGestureHandlerEvent');

  if (isGestureEvent) {
    callOptionalHandler(handlers, 'onActive', event, context);
    return;
  }

  if (!isStateChange) {
    return;
  }

  switch (event.state) {
    case GestureState.BEGAN:
      callOptionalHandler(handlers, 'onStart', event, context);
      break;
    case GestureState.ACTIVE:
      callOptionalHandler(handlers, 'onActive', event, context);
      break;
    case GestureState.END:
      callOptionalHandler(handlers, 'onEnd', event, context);
      callOptionalHandler(handlers, 'onFinish', event, context, true);
      break;
    case GestureState.CANCELLED:
      callOptionalHandler(handlers, 'onCancel', event, context);
      callOptionalHandler(handlers, 'onFinish', event, context, false);
      break;
    case GestureState.FAILED:
      callOptionalHandler(handlers, 'onFail', event, context);
      callOptionalHandler(handlers, 'onFinish', event, context, false);
      break;
    default:
      break;
  }
}

declare module 'react-native-reanimated' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Animated {
    useAnimatedGestureHandler?: typeof patchedUseAnimatedGestureHandler;
  }
}

function patchedUseAnimatedGestureHandler(
  handlers: GestureHandlers,
  dependencies?: readonly unknown[]
) {
  const { context, doDependenciesDiffer, useWeb } = useHandler(
    handlers,
    dependencies
  );

  if (useWeb) {
    return (event: any) => {
      handleGestureEvent(handlers, event.nativeEvent ?? event, context);
    };
  }

  return useEvent(
    (event: GestureEvent) => {
      'worklet';
      handleGestureEvent(handlers, event, context);
    },
    eventSubscriptions as unknown as string[],
    doDependenciesDiffer
  );
}

if (
  typeof (Reanimated as unknown as { useAnimatedGestureHandler?: unknown })
    .useAnimatedGestureHandler !== 'function'
) {
  (Reanimated as unknown as {
    useAnimatedGestureHandler?: typeof patchedUseAnimatedGestureHandler;
  }).useAnimatedGestureHandler = patchedUseAnimatedGestureHandler;
}
