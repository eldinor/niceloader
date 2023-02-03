/**
 * This file demonstrates how to create a simple scene with GLSL shaders
 * loaded from separate files.
 *
 * There are other ways to load shaders, see https://doc.babylonjs.com/advanced_topics/shaders/shaderCodeInBjs
 */

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

import fresnelVertexShader from "../glsl/fresnel/vertex.glsl";
import fresnelFragmentShader from "../glsl/fresnel/fragment.glsl";
import { CubeTexture, PBRMaterial, SceneLoader, Tools } from "@babylonjs/core";
import { PBRBaseMaterial } from "@babylonjs/core/Materials/PBR/pbrBaseMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";

export class FresnelShaderScene implements CreateSceneClass {
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
    scene.createDefaultSkybox(scene.environmentTexture, true, 10000, 0.2);

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      20,
      new Vector3(0, 0, 0),
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

    //

    // convert file to a base64 url
    const readURL = function (file: any) {
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = (e) => res(e.target.result);
        reader.onerror = (e) => rej(e);
        reader.readAsDataURL(file);
      });
    };
    //

    let wrapper = document.getElementById("nl-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.setAttribute("id", "nl-wrapper");
      wrapper.style.position = "absolute";
      wrapper.style.top = "15px";
      wrapper.style.width = "400px";
      wrapper.style.left = "15px";
      wrapper.style.border = "1px solid teal";
      wrapper.style.padding = "4px";
      document.body.appendChild(wrapper);
    }

    let container = document.getElementById("nl-container");
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("id", "nl-container");
      container.style.padding = "4px";
      wrapper.appendChild(container);
    }

    let fileInput = document.getElementById("loadFile");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.setAttribute("id", "loadFile");
      fileInput.setAttribute("type", "file");
      fileInput.style.color = "transparent";
      container.appendChild(fileInput);
    }

    const img = document.createElement("img");
    img.style.maxWidth = "320px";
    //  document.getElementById("knopka")!.appendChild(fileInput);
    document.getElementById("nl-wrapper")!.appendChild(img);

    let res = await SceneLoader.ImportMeshAsync("", "./Phone.glb");
    res.meshes[0].scaling.scaleInPlace(0.05);

    camera.alpha = Tools.ToRadians(-90);
    camera.beta = 1.4;

    //   console.log(scene.getMeshByName("Default-Mat"));

    const pMat = scene.getMeshByName("Default-Mat").material as PBRMaterial;

    /*
    (
      scene.getMeshByName("Default-Liquid - Olive Oil")!.material as PBRMaterial
    ).transparencyMode = 0;
*/
    const preview = async (event) => {
      const file = event.target.files[0];
      const url = await readURL(file);
      img.src = url as string;
      //    console.log(url);
      //   let tt = (ground.material as StandardMaterial).diffuseTexture;
      let newT = new Texture(url as any, scene, undefined, false);

      newT.wAng = Tools.ToRadians(180);
      pMat.albedoTexture.dispose();
      pMat.albedoColor = Color3.Black();
      pMat.emissiveColor = Color3.White();
      (pMat as PBRMaterial).albedoTexture = newT;
      (pMat as PBRMaterial).emissiveTexture = newT;

      // (ground.material as StandardMaterial).diffuseTexture = newT;
    };

    fileInput.addEventListener("change", preview);

    //
    return scene;
  };
}

export default new FresnelShaderScene();
