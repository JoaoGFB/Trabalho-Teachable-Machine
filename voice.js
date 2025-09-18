const MODEL_PATH = "my_model2/"; // pasta com model.json, metadata.json e weights.bin 
//Trabalho-Teachable-Machine/
const tmAudio = window.tmAudio || window.tm;
let model, labelContainer, maxPredictions;
let ativo = false;

async function init() {
const modelURL = MODEL_PATH + "model.json";
const metadataURL = MODEL_PATH + "metadata.json";

  console.log("Carregando modelo de:", modelURL);

  model = await tmAudio.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  console.log(" Modelo carregado!", model);

  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }

  model.listen(resultados, {
    includeSpectrogram: true,
    probabilityThreshold: 0.75,
    overlapFactor: 0.5
  });

  console.log("Escutando áudio...");
}

function resultados(predictions) {
  let maior = predictions.reduce((a, b) =>
    a.probability > b.probability ? a : b
  );
  let comando = maior.className;

  labelContainer.innerHTML = "Detectado: " + comando;

  if (comando === "ligar") {
    ativo = true;
    console.log("Sistema ATIVADO");
    return;
  }
  if (comando === "desligar") {
    ativo = false;
    console.log("Sistema DESLIGADO");
    return;
  }

  if (!ativo) return;

  switch (comando) {
    case "subir":
      window.scrollBy(0, -200);
      break;
    case "descer":
      window.scrollBy(0, 200);
      break;
    case "proximo":
      nextSlide?.(); // chama função do pdf.js
      break;
    case "anterior":
      prevSlide?.(); // chama função do pdf.js
      break;
    case "Botão":
      document.getElementById("meuBotao")?.click();
      break;
  }
}
init();