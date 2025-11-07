import {
  getSimpleCharacterModelAnimationOptions,
  loadCharacterModel,
  loadCharacterModelAnimation,
} from "@pmndrs/viverse";
import type { AnimationAction } from "three";
import { AnimationMixer } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import type { AnimationName } from "@/stores/localPlayerStore";

export const ANIMATION_NAMES: AnimationName[] = [
  "idle",
  "walk",
  "run",
  "jumpUp",
  "jumpLoop",
  "jumpDown",
  "jumpForward",
];

export const INITIAL_ANIMATION: AnimationName = "idle";

type CharacterModel = NonNullable<
  Awaited<ReturnType<typeof loadCharacterModel>>
>;

/**
 * 単一のアニメーションを読み込む
 */
export const loadSingleAnimation = async (
  model: CharacterModel,
  mixer: AnimationMixer,
  name: AnimationName,
): Promise<AnimationAction | null> => {
  try {
    const animOptions = await getSimpleCharacterModelAnimationOptions(name);
    const clip = await loadCharacterModelAnimation(model, animOptions);
    return clip ? mixer.clipAction(clip) : null;
  } catch (error) {
    console.warn(`Failed to load animation: ${name}`, error);
    return null;
  }
};

/**
 * 全アニメーションを並列読み込み
 */
export const loadAllAnimations = async (
  model: CharacterModel,
  mixer: AnimationMixer,
): Promise<Map<AnimationName, AnimationAction>> => {
  const results = await Promise.allSettled(
    ANIMATION_NAMES.map((name) => loadSingleAnimation(model, mixer, name)),
  );

  const actionsMap = new Map<AnimationName, AnimationAction>();

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value) {
      actionsMap.set(ANIMATION_NAMES[index], result.value);
    }
  });

  return actionsMap;
};

/**
 * キャラクターモデルと全アニメーションを初期化
 */
export const initializeCharacter = async () => {
  const baseModel = await loadCharacterModel();
  if (!baseModel) {
    throw new Error("Failed to load character model");
  }

  const modelScene = SkeletonUtils.clone(baseModel.scene);

  const mixer = new AnimationMixer(modelScene);
  const actions = await loadAllAnimations(baseModel, mixer);

  return {
    modelScene,
    mixer,
    actions,
  };
};
