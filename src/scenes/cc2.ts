import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CubeTexture } from "@babylonjs/core/Materials";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Tools } from "@babylonjs/core/Misc/tools";
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import {
  HingeJoint,
  Mesh,
  PBRMaterial,
  RayHelper,
  ReflectionProbe,
  TransformNode,
  Animation,
  ActionManager,
  ExecuteCodeAction,
} from "@babylonjs/core/";
import { mainPipeline } from "../externals/Pipeline";

import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";

import { NiceLoader } from "../externals/niceloader";

import { CharacterController } from "../externals/CharacterController";

import { PhysicsImpostor } from "@babylonjs/core/Physics/physicsImpostor";
import { ammoModule, ammoReadyPromise } from "../externals/ammo";
import { AmmoJSPlugin } from "@babylonjs/core/Physics/Plugins/ammoJSPlugin";
import "@babylonjs/core/Physics/physicsEngineComponent";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import * as BABYLON_GUI from "@babylonjs/gui";

class PhysicsSceneWithAmmo implements CreateSceneClass {
  preTasks = [ammoReadyPromise];
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

    scene.enablePhysics(null, new AmmoJSPlugin(true, ammoModule));

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

    const sphere = MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1, segments: 32 },
      scene
    );
    sphere.material = new PBRMaterial("spMat", scene);
    (sphere.material as PBRMaterial).roughness = 0.2;

    sphere.checkCollisions = true;

    for (let i = 0; i < 5; i++) {
      const spClone = sphere.clone("spClone");

      spClone.physicsImpostor = new PhysicsImpostor(
        spClone,
        PhysicsImpostor.SphereImpostor,
        { mass: 0.1, restitution: 0.6 },
        scene
      );

      // Move the sphere upward 1/2 its height
      spClone.position.y = 19;
      spClone.position.z = -5;

      spClone.checkCollisions = true;
    }

    for (let i = 0; i < 20; i++) {
      const box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
      box.material = sphere.material;

      box.checkCollisions = true;

      box.position.y = 90;
      box.position.x = -8;

      box.physicsImpostor = new PhysicsImpostor(
        box,
        PhysicsImpostor.BoxImpostor,
        { mass: 2, restitution: 0.2 },
        scene
      );
    }
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

    //  new NiceLoader(scene, modelsArray);

    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "/",
      "walls.glb",
      scene
    );

    importResult.meshes[0].position.y = -40;
    //
    importResult.meshes[0].scaling.scaleInPlace(0.4);
    importResult.meshes.forEach((m) => {
      m.checkCollisions = true;
      m.isPickable = false;
    });

    console.log(importResult);

    // Our built-in 'ground' shape.
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 60, height: 60 },
      scene
    );
    ground.position.y = -40.1;
    // ground.position.y = 0.1;

    ground.physicsImpostor = new PhysicsImpostor(
      ground,
      PhysicsImpostor.BoxImpostor,
      { mass: 0, restitution: 0.9 }
    );

    ground.material = sphere.material;

    const planeLeft = MeshBuilder.CreatePlane("planeLeft", {
      width: 100,
      height: 100,
    });
    planeLeft.position.z = 30;
    planeLeft.isVisible = false;

    const planeRight = MeshBuilder.CreatePlane("planeRight", {
      width: 100,
      height: 100,
    });
    planeRight.position.z = -30;
    planeRight.rotation.y = Tools.ToRadians(180);
    planeRight.isVisible = false;

    const planeBack = MeshBuilder.CreatePlane("planeBack", {
      width: 100,
      height: 100,
    });
    planeBack.position.x = -23;
    planeBack.rotation.y = Tools.ToRadians(-90);
    planeBack.isVisible = false;

    const planeFor = MeshBuilder.CreatePlane("planeFor", {
      width: 100,
      height: 100,
    });
    planeFor.position.x = 25;
    planeFor.rotation.y = Tools.ToRadians(90);
    planeFor.isVisible = false;

    planeLeft.physicsImpostor = new PhysicsImpostor(
      planeLeft,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0, restitution: 0.9 }
    );

    planeRight.physicsImpostor = new PhysicsImpostor(
      planeRight,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0, restitution: 0.9 }
    );

    planeBack.physicsImpostor = new PhysicsImpostor(
      planeBack,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0, restitution: 0.9 }
    );

    planeFor.physicsImpostor = new PhysicsImpostor(
      planeFor,
      PhysicsImpostor.PlaneImpostor,
      { mass: 0, restitution: 0.9 }
    );
    /*
    importResult.meshes.forEach((m) => {
      if (!m.name.includes("collider")) {
        m.physicsImpostor = new PhysicsImpostor(
          m,
          PhysicsImpostor.BoxImpostor,
          {
            mass: 0,
            restitution: 0.9,
          }
        );
      }
    });
*/
    //  console.log(scene.getMeshByName("Fill"));
    /*
    let ff = scene.getMeshByName("Fill");

    console.log(ff);

    let fc = (ff as Mesh).clone("fc");
    fc.parent = null;

    fc.position = new Vector3(-10, 10, 10);

    fc.physicsImpostor = new PhysicsImpostor(fc, PhysicsImpostor.BoxImpostor, {
      mass: 0.01,
      restitution: 0,
    });

    //  ff.position.x -= 20;
*/

    SceneLoader.ImportMesh(
      "",
      "",
      "all-anim.glb",
      scene,
      (meshes, particleSystems, skeletons, aniGroups) => {
        var player = meshes[0];
        player.name = "Avatar";

        player.position.z = -10;
        //
        /*
        var probe = new ReflectionProbe(
          "satelliteProbe" + player.name,
          256,
          scene
        );
        for (var index = 0; index < scene.meshes.length; index++) {
          probe.renderList.push(scene.meshes[index]);
        }

        (sphere.material as PBRMaterial).reflectionTexture = probe.cubeTexture;
*/
        /*
        const caps = MeshBuilder.CreateCapsule("caps", { radius: 1 }, scene);
        caps.position.y = 2;

        caps.physicsImpostor = new PhysicsImpostor(
          caps,
          PhysicsImpostor.SphereImpostor,
          { mass: 0.2, restitution: 0.8 },
          scene
        );

        player.parent = caps;

        */
        //
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
*/ //

    scene.onBeforeRenderObservable.add(function () {
      checkRayCast(scene);
    });
    //
    //

    const advancedTexture =
      BABYLON_GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    const pointerImage = new BABYLON_GUI.Image("pointer", "/Dot.png");
    pointerImage.width = `10px`;
    pointerImage.height = "10px";
    pointerImage.isVisible = true;
    advancedTexture.addControl(pointerImage);
    //  scene.onReadyObservable.addOnce(() => new NiceLoader(scene, modelsArray));
    //
    // mainPipeline(scene, camera);
    //
    //create an array of different starting positions for the marbles
    var marbleStartPosArray = [
      new Vector3(0.2, 3.5, 0),
      new Vector3(0, 3.5, 0.2),
      new Vector3(-0.2, 3.5, 0),
      new Vector3(0, 3.5, -0.2),
    ];

    //create a box used to trigger the destrucion of marbles
    var killBox = MeshBuilder.CreateBox(
      "killBox",
      { width: 100, depth: 100, height: 0.5 },
      scene
    );
    killBox.position = new Vector3(0, -50, 0);
    killBox.visibility = 0;

    var marbleMaterialArray = [];
    //
    Promise.all([
      SceneLoader.AppendAsync(
        "https://models.babylonjs.com/Marble/marble/marble.gltf"
      ),
      SceneLoader.AppendAsync(
        "https://models.babylonjs.com/Marble/marbleTower/marbleTower.gltf"
      ),
    ]).then(function () {
      var marble = scene.getMeshByName("marble");
      marble.setParent(null);
      marble.visibility = 0;

      marbleMaterialArray.push(
        scene.getMaterialByName("blueMat"),
        scene.getMaterialByName("greenMat"),
        scene.getMaterialByName("redMat"),
        scene.getMaterialByName("purpleMat"),
        scene.getMaterialByName("yellowMat")
      );

      //get each mesh that's been loaded
      var tower = scene.getMeshByName("tower");
      var rockerBottom = scene.getMeshByName("rockerBottom");
      var rockerTop = scene.getMeshByName("rockerTop");
      var spinner = scene.getMeshByName("spinner");
      var supports = scene.getMeshByName("supports");
      var track = scene.getMeshByName("track");
      var wheel = scene.getMeshByName("wheel");

      //set the parents of each mesh to null
      tower.setParent(null);
      rockerBottom.setParent(null);
      rockerTop.setParent(null);
      spinner.setParent(null);
      supports.setParent(null);
      track.setParent(null);
      wheel.setParent(null);

      //add physics imposters to anything marbles will collide with
      tower.physicsImpostor = new PhysicsImpostor(
        tower,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 1 },
        scene
      );
      supports.physicsImpostor = new PhysicsImpostor(
        supports,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 1 },
        scene
      );
      track.physicsImpostor = new PhysicsImpostor(
        track,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 1 },
        scene
      );
      wheel.physicsImpostor = new PhysicsImpostor(
        wheel,
        PhysicsImpostor.MeshImpostor,
        { mass: 0, friction: 1 },
        scene
      );

      //setup the rocker

      // Create rocker pin as the phsyics root and parent loaded assets to it
      var rockerRoot = new Mesh("rockerRoot", scene);
      rockerBottom.setParent(rockerRoot);
      rockerTop.setParent(rockerRoot);
      rockerRoot.position = new Vector3(4.1, -6.4, 0);
      rockerRoot.rotation.x -= Tools.ToRadians(25);

      rockerTop.physicsImpostor = new PhysicsImpostor(
        rockerTop,
        PhysicsImpostor.ConvexHullImpostor,
        { mass: 0 },
        scene
      );
      rockerBottom.physicsImpostor = new PhysicsImpostor(
        rockerBottom,
        PhysicsImpostor.ConvexHullImpostor,
        { mass: 0 },
        scene
      );
      rockerRoot.physicsImpostor = new PhysicsImpostor(
        rockerRoot,
        PhysicsImpostor.NoImpostor,
        { mass: 2 },
        scene
      );

      var rockerPin = MeshBuilder.CreateCylinder(
        "Rocker",
        { diameter: 0.1, height: 1 },
        scene
      );
      rockerPin.rotation.z += Tools.ToRadians(90);
      rockerPin.position = new Vector3(4.1, -6.4, 0);
      rockerPin.physicsImpostor = new PhysicsImpostor(
        rockerPin,
        PhysicsImpostor.MeshImpostor,
        { mass: 0 },
        scene
      );
      rockerPin.visibility = 0;

      var joint1 = new HingeJoint({
        mainPivot: new Vector3(0, 0, 0),
        connectedPivot: new Vector3(0, 0, 0),
        mainAxis: new Vector3(-1, 0, 0),
        connectedAxis: new Vector3(0, 1, 0),
        nativeParams: {},
      });
      rockerRoot.physicsImpostor.addJoint(rockerPin.physicsImpostor, joint1);

      //handle logic for the brass wind-up spinner
      var currentWindUpAngle;
      var marbleSpawnRate = 8;
      var nextMarbleSpawnAngle = 360 / marbleSpawnRate;
      var spinnerRotateSpeed = 120;
      var marblePosition = 0;

      var spinnerPivotParent = new TransformNode("spinnerPivotParent");
      spinner.setParent(spinnerPivotParent);

      Animation.CreateAndStartAnimation(
        "spinnerRotation",
        spinnerPivotParent,
        "rotation.y",
        30,
        spinnerRotateSpeed,
        Tools.ToRadians(0),
        Tools.ToRadians(360),
        1
      );

      //handle logic for the large wheel
      var wheelPivotParent = new TransformNode("wheelPivotParent");
      wheelPivotParent.position.y -= 28.8;
      wheel.setParent(wheelPivotParent);
      Animation.CreateAndStartAnimation(
        "marbleTowerWheelRot",
        wheelPivotParent,
        "rotation.x",
        30,
        600,
        Tools.ToRadians(0),
        Tools.ToRadians(-360),
        1
      );

      //logic to change the starting marble position based on the rotation of the brass wind-up spinner
      scene.actionManager = new ActionManager(scene);
      scene.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnEveryFrameTrigger,
          },
          function () {
            currentWindUpAngle = Tools.ToDegrees(spinnerPivotParent.rotation.y);
            if (
              nextMarbleSpawnAngle == 360 &&
              currentWindUpAngle < 360 / marbleSpawnRate
            ) {
              nextMarbleSpawnAngle = 360 / marbleSpawnRate;
            } else if (currentWindUpAngle >= nextMarbleSpawnAngle) {
              nextMarbleSpawnAngle += 360 / marbleSpawnRate;
              createMarble(marblePosition);
              marblePosition += 1;
              if (marblePosition == 4) {
                marblePosition = 0;
              }
            }
          }
        )
      );

      //   engine.hideLoadingUI();
    });
    ///

    function createMarble(spawnAngle) {
      //create a marble (sphere) using meshbuilder
      var marble = scene.getMeshByName("marble").clone("marbleClone", null);
      marble.visibility = 1;
      marble.material = marbleMaterialArray[Math.floor(Math.random() * 5)];

      //position the marble based on the incoming angle of the windup part of the marbleTower
      marble.position = marbleStartPosArray[spawnAngle];

      //add physics to the marble
      marble.physicsImpostor = new PhysicsImpostor(
        marble,
        PhysicsImpostor.SphereImpostor,
        { mass: 2, friction: 0.5, restitution: 0 },
        scene
      );

      //add an actionManager to the marble
      marble.actionManager = new ActionManager(scene);

      //register a new action with the marble's actionManager..this will execute code whenever the marble intersects the "killBox"
      marble.actionManager.registerAction(
        new ExecuteCodeAction(
          {
            trigger: ActionManager.OnIntersectionEnterTrigger,
            parameter: killBox,
          },
          function () {
            fadeAndDestroyMarble(marble);
          }
        )
      );
    }

    function fadeAndDestroyMarble(marble) {
      var forceDirection = new Vector3(0, 1, 0);
      var forceMagnitude = 25;
      var contactLocalRefPoint = Vector3.Zero();

      //the one line of code version
      Animation.CreateAndStartAnimation(
        "marbleVisAnim",
        marble,
        "visibility",
        30,
        30,
        1,
        0,
        0,
        null,
        () => {
          marble.dispose();
        }
      );
    }
    //
    //
    //
    return scene;
  };
}

export default new PhysicsSceneWithAmmo();

function checkRayCast(scene: Scene) {
  const camera = scene.activeCamera;

  const ray = camera!.getForwardRay(15);

  // const rayHelper = new RayHelper(ray);
  // rayHelper.show(scene);
  // console.log(ray);

  const pickingInfo = scene.pickWithRay(ray, (m) => {
    return m.isVisible && m.isPickable && m.visibility > 0;
  });

  if (!pickingInfo) {
    return;
  } else {
    const { pickedMesh, distance } = pickingInfo;

    let offsetDistance = distance - 3; // for Free camera, the value could be tuned

    if (camera!.getClassName() == `ArcRotateCamera`) {
      offsetDistance = distance - (camera as ArcRotateCamera).radius;
    }
    if (pickedMesh) {
      if (pickedMesh.name!.includes("ox") || pickedMesh.name!.includes("one")) {
        //   console.log("BOX", ray);
        pickedMesh.applyImpulse(ray.direction, Vector3.Zero());
        // (pickedMesh.material as PBRMaterial).albedoColor = Color3.Green()
      }
    }

    return {
      pickedMesh,
      distance: offsetDistance,
      pickingInfo,
    };
  }
}
