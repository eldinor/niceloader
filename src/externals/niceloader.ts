import {
  AssetsManager,
  FilesInput,
  MeshAssetTask,
  Scene,
} from "@babylonjs/core";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

export class NiceLoader {
  scene: Scene;
  arr: Array<MeshAssetTask>;

  constructor(scene: Scene, arr: Array<MeshAssetTask>) {
    this.scene = scene;
    this.arr = arr;

    this.createUploadButton();
    this.uploadModel(scene, arr);
  }
  createUploadButton() {
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

    let deleteButton = document.getElementById("deleteButton");
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.setAttribute("id", "deleteButton");
      deleteButton.style.float = "right";
      deleteButton.innerText = "Delete Imported";
      deleteButton.style.display = "none";
      wrapper.appendChild(deleteButton);
    }
    let exportButton = document.getElementById("exportButton");
    if (!exportButton) {
      exportButton = document.createElement("button");
      exportButton.setAttribute("id", "exportButton");
      exportButton.style.float = "left";

      exportButton.innerText = "EXPORT";
      exportButton.style.display = "none";
      wrapper.appendChild(exportButton);
    }
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "saveAll";
    checkbox.value = "value";
    checkbox.id = "saveAll";
    checkbox.style.display = "none";

    let label = document.createElement("label");
    label.htmlFor = "saveAll";
    label.style.color = "teal";
    label.style.display = "none";
    label.id = "saveAllLabel";
    label.appendChild(document.createTextNode("Save All"));

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);
  }
  uploadModel(scene: Scene, arr: Array<MeshAssetTask>) {
    let assetsManager = new AssetsManager(scene);
    let root: any;
    let modelsArray = arr;

    const tempNodes = scene.getNodes();

    console.log("tempNodes", tempNodes);

    assetsManager.onTaskSuccessObservable.add(function (task: any) {
      root = task.loadedMeshes[0]; //will hold the mesh that has been loaded recently\
      root.name = task.name;
      console.log("task successful", task);
      task.loadedMeshes.forEach((element: any) => {
        element.checkCollisions = true;
      });
      modelsArray.push(task);
      if (!scene.debugLayer) {
        window.alert("No Inspector found!");
      }
      scene.debugLayer.show({
        overlay: true,
        embedMode: true,
        enablePopup: false,
      });
      scene.debugLayer.select(root);

      document.getElementById("deleteButton")!.style.display = "initial";
      document.getElementById("exportButton")!.style.display = "initial";

      document.getElementById("saveAll")!.style.display = "initial";
      document.getElementById("saveAllLabel")!.style.display = "initial";
    });

    assetsManager.onTaskErrorObservable.add(function (task) {
      console.log(
        "task failed: " + task.name,
        task.errorObject.message,
        task.errorObject.exception
      );
    });

    const loadButton = document.getElementById("loadFile");

    loadButton!.onchange = function (evt) {
      let files: any = (evt.target as HTMLInputElement)!.files;
      let filename = files[0].name;
      let blob = new Blob([files[0]]);

      console.log(files[0].size);

      let sizeInMB = (files[0].size / (1024 * 1024)).toFixed(2);

      console.log(sizeInMB + " MB");

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

      assetsManager.addMeshTask(filename, "", "file:", filename);
      assetsManager.load();
    };

    // DELETE ALL
    document.getElementById("deleteButton")!.onclick = function (_e) {
      modelsArray.forEach((element: MeshAssetTask) => {
        element.loadedMeshes[0].dispose(false, true);

        element.loadedAnimationGroups.forEach((a) => {
          a.dispose();
        });

        element.loadedSkeletons.forEach((a) => {
          a.dispose();
        });
      });

      modelsArray = [];

      (document.getElementById("loadFile") as HTMLInputElement).value = "";
      loadButton!.innerHTML = "";

      document.getElementById("deleteButton")!.style.display = "none";
      document.getElementById("exportButton")!.style.display = "none";

      document.getElementById("saveAll")!.style.display = "none";
      document.getElementById("saveAllLabel")!.style.display = "none";
      // To clear the deleted node
      scene.debugLayer.hide();
      scene.debugLayer.show({ embedMode: true });
    };

    // EXPORT
    document.getElementById("exportButton")!.onclick = function (_e) {
      console.log(
        (document.getElementById("saveAll") as HTMLInputElement).checked
      );

      let saveAll = (document.getElementById("saveAll") as HTMLInputElement)
        .checked;

      let options = {
        shouldExportNode: function (node: any) {
          if (!saveAll) {
            if (!(tempNodes as any).includes(node)) {
              return node;
            }
          } else {
            return node;
          }
        },
      };

      console.log(modelsArray);

      let exportFileName = "";

      modelsArray.forEach((m) => {
        exportFileName += m.name.slice(0, 6) + "-";
      });

      exportFileName = "NL-" + exportFileName.slice(0, -1);

      console.log("EXPORT " + exportFileName);

      GLTF2Export.GLBAsync(scene, exportFileName, options).then((glb) => {
        glb.downloadFiles();
      });
    };
  }
}
