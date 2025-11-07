import { useEffect, useState } from "react";
import type { AnimationAction, AnimationMixer, Group, Object3D } from "three";
import type { AnimationName } from "@/stores/localPlayerStore";
import {
  INITIAL_ANIMATION,
  initializeCharacter,
} from "@/utils/characterLoader";

type CharacterModelState = {
  mixer: AnimationMixer | null;
  actions: Map<AnimationName, AnimationAction>;
  modelScene: Object3D | null;
  isLoaded: boolean;
};

const initialState: CharacterModelState = {
  mixer: null,
  actions: new Map(),
  modelScene: null,
  isLoaded: false,
};

/**
 * キャラクターモデルとアニメーションを管理するカスタムフック
 * Reactのライフサイクルに沿ってモデルの読み込み・破棄を行う
 */
export const useCharacterModel = (groupRef: React.RefObject<Group | null>) => {
  const [state, setState] = useState<CharacterModelState>(initialState);

  useEffect(() => {
    let mounted = true;
    let currentMixer: AnimationMixer | null = null;
    let currentModelScene: Object3D | null = null;

    const setup = async () => {
      const group = groupRef.current;
      if (!group) return;

      try {
        const { modelScene, mixer, actions } = await initializeCharacter();

        if (!mounted) return;

        currentMixer = mixer;
        currentModelScene = modelScene;

        group.add(modelScene);
        actions.get(INITIAL_ANIMATION)?.play();

        setState({
          mixer,
          actions,
          modelScene,
          isLoaded: true,
        });
      } catch (error) {
        console.error("Failed to setup character model:", error);
      }
    };

    setup();

    return () => {
      mounted = false;
      currentMixer?.stopAllAction();
      if (currentModelScene) {
        groupRef.current?.remove(currentModelScene);
      }
    };
  }, [groupRef]);

  return state;
};
