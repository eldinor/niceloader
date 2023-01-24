import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";

export type MainType = `streets` | `none` | `walls`;

export async function loadMain(scene: Scene, type?: MainType) {
  let scalingFactor;

  if (type) {
    const importResult = await SceneLoader.ImportMeshAsync(
      "",
      "/",
      checkType(type)[0],
      scene
    );

    importResult.meshes[0].scaling.scaleInPlace(checkType(type)[1]);
    importResult.meshes.forEach((m) => {
      m.checkCollisions = true;
    });
  }
}

function checkType(type, scalingFactor?: any) {
  let url: string = "";
  switch (type) {
    case "walls":
      url = "walls.glb";
      scalingFactor = 0.4;
      break;
    case "streets":
      url = "streets.glb";
      scalingFactor = 1;
      break;
    default:
      break;
  }
  return [url, scalingFactor];
}
