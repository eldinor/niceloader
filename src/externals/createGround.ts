import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { PBRMaterial } from "@babylonjs/core/Materials";
import { CubeTexture } from "@babylonjs/core/Materials";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Tools } from "@babylonjs/core/Misc/tools";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh, Color3, Plane } from "@babylonjs/core";
import { MirrorTexture } from "@babylonjs/core/Materials";

export type GroundType = `mirror` | `water` | `none` | `grid`;

export function createGround(scene: Scene, type?: string) {
  // Our built-in 'ground' shape.
  const ground = CreateGround("ground", { width: 60, height: 60 }, scene);
  ground.checkCollisions = true;

  // Load a texture to be used as the ground material
  //  const groundMaterial = new StandardMaterial("ground material", scene);

  const groundMaterial = new StandardMaterial("ground material", scene);
  // groundMaterial.albedoTexture = new Texture(grassTextureUrl, scene);

  ground.material = groundMaterial;
  //  ground.receiveShadows = true;

  mirrorGround(ground, scene);
  console.log((ground.material as StandardMaterial).reflectionTexture);

  //
  return ground;
}

async function mirrorGround(ground: Mesh, scene: Scene) {
  ground.material = new StandardMaterial("groundMat", scene);
  const groundMat = ground.material as StandardMaterial;

  groundMat.reflectionTexture = new MirrorTexture("mirror", 1024, scene, true);
  (groundMat.reflectionTexture as MirrorTexture).mirrorPlane = new Plane(
    0,
    -1,
    0,
    0
  );

  groundMat.diffuseColor = Color3.FromHexString(`#0A2727`);

  groundMat.reflectionTexture.level = 0.5;
  groundMat.roughness = 0;
}
