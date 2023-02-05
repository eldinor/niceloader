import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CubeTexture } from "@babylonjs/core/Materials";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";

import { CreateSceneClass } from "../createScene";

import * as GT from "@gltf-transform/core";
import { dedup, draco, prune, quantize, weld } from "@gltf-transform/functions";
import { KHRONOS_EXTENSIONS } from "@gltf-transform/extensions";

import { MeshoptEncoder } from "meshoptimizer";
import { reorder } from "@gltf-transform/functions";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { NiceLoader } from "../externals/niceloader";

export class DefaultSceneWithTexture implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    if (!scene.environmentTexture) {
      const hdrTexture = new CubeTexture(
        "https://playground.babylonjs.com/textures/environment.env",
        scene
      );
      hdrTexture.gammaSpace = false;
      scene.environmentTexture = hdrTexture;
    }

    const modelsArray: any = [];

    void Promise.all([
      import("@babylonjs/core/Debug/debugLayer"),
      import("@babylonjs/inspector"),
    ]).then((_values) => {
      console.log(_values);
      scene.debugLayer.show({
        handleResize: true,
        overlay: true,
        embedMode: true,
        globalRoot: document.getElementById("#root") || undefined,
      });
    });

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      10,
      new Vector3(0, 1, 0),
      scene
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    // const light = new HemisphericLight(
    //     "light",
    //     new Vector3(0, 1, 0),
    //     scene
    // );

    // // Default intensity is 1. Let's dim the light a small amount
    // light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    /*
        const sphere = CreateSphere(
            "sphere",
            { diameter: 2, segments: 32 },
            scene
        );

        // Move the sphere upward 1/2 its height
        sphere.position.y = 1;

        // Our built-in 'ground' shape.
        const ground = CreateGround("ground", { width: 6, height: 6 }, scene);

        // Load a texture to be used as the ground material
        const groundMaterial = new StandardMaterial("ground material", scene);
        groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);

        ground.material = groundMaterial;
        ground.receiveShadows = true;

        const light = new DirectionalLight(
            "light",
            new Vector3(0, -1, 1),
            scene
        );
        light.intensity = 0.5;
        light.position.y = 10;

        const shadowGenerator = new ShadowGenerator(512, light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurScale = 2;
        shadowGenerator.setDarkness(0.2);

        shadowGenerator.getShadowMap()!.renderList!.push(sphere);

*/
    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "/",
      "walls.glb",
      scene
    );
    importResult.meshes[0].scaling.scaleInPlace(0.05);
    importResult.meshes.forEach((m) => {
      m.checkCollisions = true;
    });
    //
    console.log(importResult);

    async function ggg() {
      const io = new GT.WebIO().registerExtensions(KHRONOS_EXTENSIONS);
      console.log(io);

      const doc = await io.read("walls.glb");
      console.log(doc);

      const firstuint = await io.writeBinary(doc);
      console.log(firstuint);

      await MeshoptEncoder.ready;

      const tt = await doc.transform(
        prune(),
        weld(),
        quantize(),
        dedup(),
        reorder({ encoder: MeshoptEncoder })
      );

      console.log(reorder({ encoder: MeshoptEncoder, target: "size" }));
      console.log(tt);

      let uint = await io.writeBinary(tt);
      console.log(uint);

      console.log(uint.buffer);

      const assetBlob = new Blob([uint.buffer]);
      const assetUrl = URL.createObjectURL(assetBlob);

      await SceneLoader.AppendAsync(
        assetUrl,
        undefined,
        scene,
        undefined,
        ".glb"
      );
    }

    await ggg();
    //
    new NiceLoader(scene, modelsArray);

    return scene;
  };
}

export default new DefaultSceneWithTexture();
