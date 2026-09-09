import { useEffect, type PropsWithChildren } from 'react';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Only the visible onboarding illustration animates; reduced-motion users see a still frame.
export function FloatingArtwork({ active, children }: PropsWithChildren<{ active: boolean }>) {
  const reduced = useReducedMotion();
  const offset = useSharedValue(0);
  useEffect(() => {
    if (active && !reduced) {
      offset.value = withRepeat(withTiming(-7, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
    } else {
      cancelAnimation(offset);
      offset.value = 0;
    }
    return () => cancelAnimation(offset);
  }, [active, reduced, offset]);
  const motion = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return <Animated.View style={motion}>{children}</Animated.View>;
}
