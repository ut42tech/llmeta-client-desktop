import { useEffect, useRef } from "react";
import type { AnimationAction, AnimationMixer } from "three";
import type { AnimationName } from "@/stores/localPlayerStore";

type UseAnimationControllerParams = {
  animation: AnimationName;
  mixer: AnimationMixer | null;
  actions: Map<AnimationName, AnimationAction>;
  isModelLoaded: boolean;
};

const FADE_DURATION = 0.2;

export const useAnimationController = ({
  animation,
  mixer,
  actions,
  isModelLoaded,
}: UseAnimationControllerParams) => {
  const currentActionRef = useRef<AnimationAction | null>(null);

  useEffect(() => {
    if (!mixer || !actions.size || !isModelLoaded) return;

    const nextAction = actions.get(animation);
    if (!nextAction || nextAction === currentActionRef.current) return;

    currentActionRef.current?.fadeOut(FADE_DURATION);
    nextAction.reset().fadeIn(FADE_DURATION).play();
    currentActionRef.current = nextAction;
  }, [animation, mixer, actions, isModelLoaded]);

  return currentActionRef;
};
