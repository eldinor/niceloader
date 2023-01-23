import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { LensRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline";
import { NodeMaterial } from "@babylonjs/core/Materials/Node";
import { Constants } from "@babylonjs/core/";

export function mainPipeline(scene: Scene, camera: any) {
  const defaultPipeline = new DefaultRenderingPipeline(
    "Pipeline",
    true, // is HDR?
    scene,
    scene.cameras
  );

  defaultPipeline.samples = 4;
  defaultPipeline.glowLayerEnabled = true;
  defaultPipeline.glowLayer!.intensity = 0.5;

  createPipelineUI(scene, camera);

  // defaultPipeline.fxaaEnabled = true;
  /*
      // Glowlayer
      const gl = new GlowLayer(`mdGlowLayer`, scene, {
        mainTextureFixedSize: 1024,
        blurKernelSize: 32,
      });
      gl.intensity = 0.4;
  */
}

function createPipelineUI(scene, camera) {
  let wrapper = document.getElementById("pp-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.setAttribute("id", "pp-wrapper");
    wrapper.style.position = "absolute";
    wrapper.style.bottom = "15px";
    wrapper.style.width = "400px";
    wrapper.style.left = "15px";
    wrapper.style.border = "1px solid teal";
    wrapper.style.padding = "4px";
    document.body.appendChild(wrapper);
  }

  const data = {
    "Lens Blur": false,
    "Shader 1": false,
  };

  const radioButtonsWrapElem = wrapper;

  for (let key in data) {
    let label = document.createElement("label");
    label.innerText = key;
    let input = document.createElement("input");
    input.type = "radio";
    input.name = "pp";
    input.checked = data[key] ? data[key] : false;

    input.addEventListener("change", () => {
      Object.keys(data).forEach((key) => {
        data[key] = false;
        console.log(scene.postProcessRenderPipelineManager);
        if (scene.postProcessRenderPipelineManager[key])
          console.log("sdf", scene.postProcessRenderPipelineManager[key]);
      });
      data[key] = true;
      console.log(data);
      console.log(key);

      if (data["Lens Blur"]) {
        console.log("Lens Blur");
        lensBlur(scene, camera);
        console.log(scene.postProcesses);
        scene.postProcesses[0].dispose();
      }

      if (data["Shader 1"]) {
        console.log("Shader 1");
        console.log(
          scene.postProcessRenderPipelineManager._renderPipelines["Lens Blur"]
        );
        if (
          scene.postProcessRenderPipelineManager._renderPipelines["Lens Blur"]
        ) {
          scene.postProcessRenderPipelineManager._renderPipelines[
            "Lens Blur"
          ].dispose();
        }
        NodeMaterial.ParseFromSnippetAsync("#YDGZCJ", scene).then(
          (nodeMaterial) => {
            const postProcess = nodeMaterial.createPostProcess(
              camera,
              1.0,
              Constants.TEXTURE_LINEAR_LINEAR
            );

            postProcess.samples = 4;
            postProcess.name = "Shader 1";
          }
        );
      }
    });

    label.appendChild(input);
    radioButtonsWrapElem.appendChild(label);
  }
}

function lensBlur(scene, camera) {
  const lensEffect = new LensRenderingPipeline(
    "Lens Blur",
    {
      edge_blur: 1.0,
      chromatic_aberration: 1.0,
      distortion: 1.0,
      dof_focus_distance: 50,
      dof_aperture: 6.0, // set this very high for tilt-shift effect
      grain_amount: 1.0,
      dof_pentagon: true,
      dof_gain: 1.0,
      dof_threshold: 1.0,
      dof_darken: 0.1,
    },
    scene,
    1.0,
    camera as any
  );

  lensEffect.setHighlightsGain(4);
}
