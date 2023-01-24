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
import { Mesh, Color3, Plane, AssetsManager, Vector2 } from "@babylonjs/core";
import { MirrorTexture } from "@babylonjs/core/Materials";
import { GridMaterial, WaterMaterial } from "@babylonjs/materials";

export type GroundType = `grid` | `mirror` | `none` | `water`;

export async function createGround(scene: Scene, type?: GroundType) {
  // Our built-in 'ground' shape.
  const ground = CreateGround("ground", { width: 60, height: 60 }, scene);
  ground.position.y = -0.01;

  ground.checkCollisions = true;
  ground.receiveShadows = true;
  //

  switch (type) {
    case `grid`:
      await gridGround(ground, scene);
      break;
    case `mirror`:
      await mirrorGround(ground, scene);
      break;
    case `none`:
      ground.material = new StandardMaterial("groundStdMat", scene);
      break;
    case `water`:
      await waterGround(ground, scene);
      break;
    default:
      break;
  }

  // Load a texture to be used as the ground material
  //  const groundMaterial = new StandardMaterial("ground material", scene);
  // groundMaterial.albedoTexture = new Texture(grassTextureUrl, scene);
  // ground.material = groundMaterial;
  // console.log((ground.material as StandardMaterial).reflectionTexture);

  //mirrorGround(ground, scene);
  //gridGround(ground, scene);
  //

  //
  return ground;
}

async function mirrorGround(ground: Mesh, scene: Scene) {
  if (ground.material) {
    ground.material.dispose(true, true);
  }
  ground.material = new StandardMaterial("mirrorGround", scene);
  const groundMat = ground.material as StandardMaterial;

  groundMat.reflectionTexture = new MirrorTexture(
    "mirrorGround",
    1024,
    scene,
    true
  );
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

async function gridGround(ground: Mesh, scene: Scene) {
  if (ground.material) {
    ground.material.dispose(true, true);
  }
  const gridMaterial = new GridMaterial("gridMaterial", scene);
  // gridMaterial.majorUnitFrequency = 2;
  ground.material = gridMaterial;
}

async function waterGround(ground: Mesh, scene: Scene) {
  const am: AssetsManager = new AssetsManager(scene);

  const sandTexImportTask = am.addTextureTask(
    "sandTexImportTask",
    `https://playground.babylonjs.com/textures/sand.jpg`
  );

  const waterBumpTexImportTask = am.addTextureTask(
    "waterBumpTexImportTask",
    `https://playground.babylonjs.com/textures/waterbump.png`
  );

  const waterMatRatio = 1;

  sandTexImportTask.onSuccess = async ({ texture: sandTex }) => {
    sandTex.vScale = sandTex.uScale = 20.0 * waterMatRatio;

    const sandMat = new StandardMaterial("sandMat", scene);

    (sandMat as StandardMaterial).diffuseTexture = sandTex;
    ground.material = sandMat;
    ground.position.y -= 0.2;
  };

  waterBumpTexImportTask.onSuccess = async ({ texture: waterBump }) => {
    const waterMesh = CreateGround(
      "waterMesh",
      {
        width: 500,
        height: 500,
        subdivisions: 100,
        updatable: false,
      },
      scene
    );
    const water = new WaterMaterial(
      "groundMat",
      scene,
      new Vector2(1024, 1024)
    );
    water.backFaceCulling = true;
    water.bumpTexture = waterBump;
    water.windForce = -7;
    water.waveHeight = 0.01 / waterMatRatio;
    water.bumpHeight = 0.5 / waterMatRatio;
    water.waveLength = 0.05 / waterMatRatio;
    water.waterColor = new Color3(1, 1, 1);
    water.colorBlendFactor = 0.25;

    waterMesh.material = water;

    water.addToRenderList(ground);
    water.addToRenderList(scene.getMeshByName("hdrSkyBox"));

    water.addToRenderList(scene.getMeshByName("sphere"));

    scene.onBeforeRenderObservable.addOnce(() => {
      console.log("FOUND", scene.getMeshByName("Avatar"));
      scene
        .getMeshByName("Avatar")
        .getChildMeshes()
        .forEach((m) => {
          water.addToRenderList(m);
        });
    });
  };

  am.load();
}

export async function initGroundRenderList(scene: Scene) {
  const groundMat = scene.getMaterialByName(`groundMat`);

  if (groundMat) {
    const ground = scene.getMeshByName(`ground`);

    const skybox = scene.getMeshByName(`hdrSkyBox`);
    const dojoNode = scene.getNodeByName(`mainNode`);
    const bodyNode = scene.getNodeByName(`Avatar`);
    // TODO: accessory add tags like tree

    const isWaterMat = WaterMaterial.prototype.isPrototypeOf(groundMat);

    console.log("isWaterMat", isWaterMat);

    if (isWaterMat) {
      const water: WaterMaterial = groundMat as any;
      if (ground) {
        water.addToRenderList(ground);
      }

      if (skybox) {
        water.addToRenderList(skybox);
      }

      if (dojoNode) {
        dojoNode.getChildMeshes().map((m) => {
          if (m.isVisible) {
            water.addToRenderList(m);
          }
        });
      }

      if (bodyNode) {
        bodyNode.getChildMeshes().map((m) => {
          if (m.isVisible) {
            water.addToRenderList(m);
          }
        });
      }
    } else {
      // Mirror
      const _groundMat = groundMat as StandardMaterial;
      const reflectionTexture = _groundMat.reflectionTexture as MirrorTexture;

      if (reflectionTexture && reflectionTexture.renderList) {
        reflectionTexture.renderList = scene.meshes.filter(
          (m) => m.name !== ground!.name
        );
      }
    }
  }
}
