"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Euler, Quaternion, Vector3 } from "three";
import { PERFORMANCE } from "@/constants";

/**
 * サーバーから届く量子化されたスナップショット値を、
 * クライアント側で連続的に補完するための軽量バッファ。
 * 位置は lerp、回転は quaternion の slerp で補間します。
 */

export function usePositionBuffer(
  target: Vector3,
  factor: number = PERFORMANCE.POSITION_LERP_FACTOR,
) {
  const current = useRef(new Vector3(target.x, target.y, target.z));
  const targetRef = useRef(target);
  targetRef.current = target;

  const initialized = useRef(false);

  useFrame(() => {
    if (!initialized.current) {
      current.current.copy(targetRef.current);
      initialized.current = true;
      return;
    }
    current.current.lerp(targetRef.current, factor);
  });

  return current.current;
}

export function useRotationBuffer(
  targetEuler: Euler,
  factor: number = PERFORMANCE.ROTATION_LERP_FACTOR,
  yOffset: number = Math.PI,
) {
  const tmpEuler = useMemo(() => new Euler(), []);
  const tmpQuatTo = useMemo(() => new Quaternion(), []);

  const currentQuat = useRef(new Quaternion());
  const targetRef = useRef(targetEuler);
  targetRef.current = targetEuler;

  const initialized = useRef(false);

  useFrame(() => {
    tmpEuler.set(
      targetRef.current.x,
      targetRef.current.y + yOffset,
      targetRef.current.z,
    );
    tmpQuatTo.setFromEuler(tmpEuler);

    if (!initialized.current) {
      currentQuat.current.copy(tmpQuatTo);
      initialized.current = true;
      return;
    }

    currentQuat.current.slerp(tmpQuatTo, factor);
  });

  return currentQuat.current;
}
