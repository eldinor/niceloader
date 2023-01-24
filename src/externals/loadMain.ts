import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scene } from "@babylonjs/core/scene";

export type MainType = `hangar` | `none` | `walls`;

export async function loadMain(scene: Scene, type?: MainType) {
  if (checkType(type) !== "") {
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
  }
}

function checkType(type) {
  let url: string = "";
  switch (type) {
    case "walls":
      url = "walls.glb";
      break;
    default:
      break;
  }
  return url;
}
