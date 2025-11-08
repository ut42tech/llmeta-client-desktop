import { useEffect, useRef, useState } from "react";
import type { AnimationAction, AnimationMixer, Group, Object3D } from "three";
import {
  type AnimationName,
  DEFAULT_ANIMATION,
} from "@/stores/localPlayerStore";
import { createRemotePlayerInstance } from "@/utils/remoteCharacterLoader";

type CharacterModelState = {
  mixer: AnimationMixer | null;
  actions: Map<AnimationName, AnimationAction>;
  isLoaded: boolean;
};

export const useRemoteCharacter = (groupRef: React.RefObject<Group | null>) => {
  const [state, setState] = useState<CharacterModelState>({
    mixer: null,
    actions: new Map(),
    isLoaded: false,
  });

  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    let mounted = true;
    let modelScene: Object3D | null = null;

    const setup = async () => {
      const group = groupRef.current;
      if (!group) return;

      try {
        const {
          modelScene: newModelScene,
          mixer,
          actions,
        } = await createRemotePlayerInstance();
        modelScene = newModelScene;

        if (!mounted) return;

        group.add(modelScene);
        actions.get(DEFAULT_ANIMATION)?.play();

        mixerRef.current = mixer;
        setState({ mixer, actions, isLoaded: true });
      } catch (error) {
        console.error("Failed to setup remote character:", error);
      }
    };

    setup();

    return () => {
      mounted = false;
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      if (modelScene) {
        groupRef.current?.remove(modelScene);
      }
    };
  }, [groupRef]);

  return state;
};
