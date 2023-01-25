import { Scene, Engine, SceneInstrumentation } from "@babylonjs/core";

interface IMDPerfCheckerConfig {
  size: number;
}

type IMDPerfCheckerConfigOptional = Partial<IMDPerfCheckerConfig>;

const defaultConfig: IMDPerfCheckerConfig = {
  size: 1024,
};

export function mdPerfChecker(
  scene,
  engine,
  config: IMDPerfCheckerConfigOptional
) {
  const _config = {
    ...defaultConfig,
    ...config,
  };

  const { size } = _config;

  // Draw calls limit to check
  const drawCallsLimit: number = 200;

  const allBigTex: any = [];

  engine.exitPointerlock();
  console.log("PerfChecker was called.");

  //remove old DOM element if any (in case of multiple keypresses from user)
  let oldDiv: any = document.querySelector("#perfChecker");
  if (oldDiv != null) {
    oldDiv.remove();
  }

  // Main div
  const div: HTMLElement = document.createElement("div");
  div.id = "perfChecker";
  div.style.width = "50vw";
  div.style.height = "100vh";
  div.style.background = "ivory";
  div.style.color = "black";
  div.style.position = "absolute";
  div.style.top = "0px";
  div.style.right = "0px";
  div.style.padding = "20px";
  div.style.paddingTop = "40px";
  div.style.opacity = "0.8";
  div.style.zIndex = "777";
  div.style.overflow = "scroll";
  document.body.appendChild(div);

  // Header - Dojo Number
  const h1: HTMLElement = document.createElement("h1");
  h1.style.margin = "0";
  h1.style.color = "#000";
  // h1.style.fontSize = "140%";
  div.appendChild(h1);

  // Draw calls
  const sceneInstrumentation = new SceneInstrumentation(scene);
  const drawCalls: HTMLElement = document.createElement("div");
  drawCalls.innerHTML = String("Draw calls: ");
  div.appendChild(drawCalls);

  setTimeout(() => {
    drawCalls.innerHTML += sceneInstrumentation.drawCallsCounter.current;
    if (sceneInstrumentation.drawCallsCounter.current > drawCallsLimit) {
      drawCalls.innerHTML += ` More than 200, attention needed!`;
    } else {
      drawCalls.innerHTML += `<span style='color:green'> OK</span>`;
    }
  }, 1000);

  // Total meshes
  const meshTotal: HTMLElement = document.createElement("div");
  meshTotal.innerText = String("Meshes: " + scene.meshes.length);
  div.appendChild(meshTotal);

  // Active meshes
  const meshActive: HTMLElement = document.createElement("div");
  meshActive.innerText = String(
    "Active Meshes: " + scene.getActiveMeshes().length
  );
  div.appendChild(meshActive);

  // Total materials
  const matTotal = document.createElement("div");
  matTotal.innerText = String("Materials: " + scene.materials.length);
  div.appendChild(matTotal);

  // Total textures
  const texTotal: HTMLElement = document.createElement("div");
  texTotal.innerText = String("Textures: " + scene.textures.length);
  div.appendChild(texTotal);

  // Checking texture width, except UI texture
  function checkTexSize(size: any) {
    allBigTex.length = 0;
    if (scene.isReady(true)) {
      scene.textures.forEach((t) => {
        if (t.name !== "UI") {
          if (t.getSize().width > size) {
            allBigTex.push(t);
          }
        }
      });
      // Sorting by width
      allBigTex.sort(
        (a: any, b: any) =>
          parseFloat(b.getSize().width) - parseFloat(a.getSize().width)
      );
    }

    // Texture check line
    const texBiggest: HTMLElement = document.createElement("div");
    texBiggest.id = `texBiggest`;
    texBiggest.style.fontSize = `120%`;
    texBiggest.innerHTML = String(
      "<span style='margin-right:20px'>Texture Check - Size: " +
        size +
        `</span>`
    );
    texBiggest.innerHTML += `<input id='texSizeInput' type='text' value='' style='border:1px solid grey'>`;
    div.appendChild(texBiggest);

    document
      .getElementById(`texSizeInput`)
      ?.addEventListener(`change`, takeInput);

    const texList = document.createElement("div");
    texList.id = `texList`;

    texList.style.padding = "20px";
    div.appendChild(texList);

    // Checking if texture size is within limits
    const stats = document.createElement("div");

    if (allBigTex.length == 0) {
      stats.style.color = "green";
      stats.innerHTML = `Nice! No textures with size more than ` + size;
    } else {
      stats.style.color = "red";
      stats.innerHTML =
        allBigTex.length + ` textures have size more than ` + size;
    }

    texList.appendChild(stats);

    // Display data
    allBigTex.forEach((t: any) => {
      const bigTexDiv = document.createElement("div");
      bigTexDiv.className = `bigTexDiv`;
      bigTexDiv.style.color = "black";
      bigTexDiv.innerHTML =
        t.name + `: ` + t.getSize().width + ` * ` + t.getSize().height;
      texList.appendChild(bigTexDiv);
    });
  }

  // Finally, check texture size and append to the div above
  checkTexSize(size);

  const closeButton = document.createElement("button");
  closeButton.innerText = "Close";

  div.appendChild(closeButton);

  closeButton.addEventListener("click", closeAll);

  function takeInput(e: any) {
    document.getElementById(`texBiggest`)?.remove();
    document.getElementById(`texList`)?.remove();

    checkTexSize(e.target.value);
  }
}

function closeAll() {
  document.getElementById("perfChecker").remove();
}
