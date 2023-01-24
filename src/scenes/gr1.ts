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

import { mainPipeline } from "../externals/Pipeline";

import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";

import "@babylonjs/core/Materials/";

import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

import { NiceLoader } from "../externals/niceloader";

import { CharacterController } from "../externals/CharacterController";

import { createGround } from "../externals/createGround";

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
    scene.createDefaultSkybox(scene.environmentTexture, true, 10000, 0.2);

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

    // Our built-in 'sphere' shape.

    const sphere = CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.x = 10;
    sphere.position.y = 1;

    const light = new DirectionalLight("light", new Vector3(0, -1, 1), scene);
    light.intensity = 0.5;
    light.position.y = 10;

    const shadowGenerator = new ShadowGenerator(512, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurScale = 2;
    shadowGenerator.setDarkness(0.2);

    shadowGenerator.getShadowMap()!.renderList!.push(sphere);

    //

    const ground = createGround(scene);
    //@ts-ignore
    (ground.material as StandardMaterial).reflectionTexture.renderList.push(
      sphere
    );

    //
    /*
    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "/",
      "walls.glb",
      scene
    );
    importResult.meshes[0].scaling.scaleInPlace(0.4);
    importResult.meshes.forEach((m) => {
      m.checkCollisions = true;
    });
*/
    SceneLoader.ImportMesh(
      "",
      "",
      "all-anim.glb",
      scene,
      (meshes, particleSystems, skeletons, aniGroups) => {
        var player = meshes[0];
        player.name = "Avatar";
        shadowGenerator.addShadowCaster(player);

        player.getChildMeshes().forEach((m) => {
          (
            (ground.material as StandardMaterial).reflectionTexture as any
          ).renderList.push(m);
        });

        console.log(aniGroups);
        aniGroups.forEach((a) => a.stop());

        //   player.position = new Vector3(14, 2, -3);
        player.checkCollisions = true;

        player.ellipsoid = new Vector3(0.5, 1, 0.5);
        player.ellipsoidOffset = new Vector3(0, 1, 0);

        // character controller  needs rotation in euler.
        // if your mesh has rotation in quaternion then convert that to euler.
        // NOTE: The GLTF/GLB files have rotation in quaternion
        player.rotation = player.rotationQuaternion!.toEulerAngles();
        player.rotationQuaternion = null;

        player.rotation.y = Math.PI;
        var alpha = (3 * Math.PI) / 2 - player.rotation.y;
        var beta = Math.PI / 2.5;
        var target = new Vector3(
          player.position.x,
          player.position.y + 1.5,
          player.position.z
        );

        camera.alpha = alpha;
        camera.beta = beta;
        camera.setTarget(target);
        // make sure the keyboard keys controlling camera are different from those controlling player
        // here we will not use any keyboard keys to control camera
        camera.keysLeft = [];
        camera.keysRight = [];
        camera.keysUp = [];
        camera.keysDown = [];

        // below are all standard camera settings.
        // nothing specific to charcter controller
        camera.wheelPrecision = 15;
        camera.checkCollisions = false;
        // how close can the camera come to player
        camera.lowerRadiusLimit = 2;
        // how far can the camera go from the player
        camera.upperRadiusLimit = 9;
        camera.attachControl(canvas, false);

        var agMap = createAGmap(aniGroups);

        let cc = new CharacterController(
          player as any,
          camera,
          scene,
          agMap,
          true
        );
        cc.setMode(0);

        cc.setNoFirstPerson(true);
        //below makes the controller point the camera at the player head which is approx
        //1.5m above the player origin
        cc.setCameraTarget(new Vector3(0, 2, 0));

        //if the camera comes close to the player then we want cc to enter first person mode.
        cc.setNoFirstPerson(false);
        //the height of steps which the player can climb
        cc.setStepOffset(0.4);
        //the minimum and maximum slope the player can go up
        //between the two the player will start sliding down if it stops
        cc.setSlopeLimit(30, 60);

        resetAnimations(aniGroups, cc);

        //set how smmothly should we transition from one animation to another
        cc.enableBlending(0.05);

        //if somehting comes between camera and avatar move camera in front of the obstruction?
        cc.setCameraElasticity(true);
        //if something comes between camera and avatar make the obstruction invisible?
        cc.makeObstructionInvisible(false);

        cc.start();
        //
        console.log(cc);
      }
    );

    // ##############################################################################
    function createAGmap(allAGs: any) {
      //lets map ag groups to the character controller actions.
      let agMap = {
        idle: allAGs[4],
        //  strafeLeft: allAGs[3],
        //   strafeRight: allAGs[4],
        //   turnRight: allAGs[5],
        walk: allAGs[7],
        //  fall: allAGs[8],
        //   slideBack: allAGs[9],
        runJump: allAGs[5],
        // turnLeft: allAGs[11],
        walkBack: allAGs[8],
        run: allAGs[6],
        idleJump: allAGs[5],
      };

      return agMap;
    }

    function resetAnimations(aniGs: any, cc: CharacterController) {
      const ags = aniGs as AnimationGroup[];

      const idleAG: AnimationGroup | null = ags.find(
        (ag) => ag.name?.toLowerCase() === `idle`
      ) as AnimationGroup;
      const jumpAG = ags.find((ag) =>
        [`jump`, `jump_idle`].includes(ag.name?.toLowerCase())
      ) as AnimationGroup;
      const walkAG = ags.find(
        (ag) => ag.name?.toLowerCase() === `walk`
      ) as AnimationGroup;
      const runAG = ags.find(
        (ag) => ag.name?.toLowerCase() === `run`
      ) as AnimationGroup;

      const backAG = ags.find(
        (ag) => ag.name?.toLowerCase() === `walk_backward`
      ) as AnimationGroup;

      const danceAGs = ags.filter((ag) =>
        ag.name.toLowerCase().startsWith(`dance_`)
      );

      const greetingAG = ags.find(
        (ag) => ag.name.toLowerCase() === `greeting`
      ) as AnimationGroup;

      console.log(greetingAG);

      cc.setIdleAnim(idleAG, 1, true);
      cc.setWalkAnim(walkAG, 1, true);
      cc.setRunAnim(runAG, 1, true);
      cc.setIdleJumpAnim(jumpAG, 0.5, false);
      cc.setRunJumpAnim(jumpAG, 0.5, false);
      cc.setWalkBackAnim(backAG, 1, true);
      // cc.setDanceAnims(danceAGs, 1, true);
      //  cc.setGreetingAnim(greetingAG, 1, true);
    }
    //
    /*
    scene.onPointerDown = (evt) => {
      scene.getEngine().enterPointerlock();
    };
*/
    //

    scene.onReadyObservable.addOnce(() => new NiceLoader(scene, modelsArray));
    //
    // mainPipeline(scene, camera);
    //
    return scene;
  };
}

export default new DefaultSceneWithTexture();
