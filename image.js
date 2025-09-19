const MODEL_PATH = "https://teachablemachine.withgoogle.com/models/1TgOh45FD/";
let model, webcam, labelContainer, maxPredictions;
let ativo = false;
let isRunning = false;

console.log("Image.js carregado. Verificando bibliotecas...");

// Função para verificar bibliotecas
function checkLibraries() {
    console.log("Verificando TensorFlow:", typeof tf !== 'undefined' ? 'OK' : 'FALHA');
    console.log("Verificando Teachable Machine Image:", typeof tmImage !== 'undefined' ? 'OK' : 'FALHA');
    
    return typeof tmImage !== 'undefined' && typeof tf !== 'undefined';
}

async function initImageModel() {
    try {
        if (!checkLibraries()) {
            throw new Error("Bibliotecas não carregadas");
        }

        const modelURL = MODEL_PATH + "model.json";
        const metadataURL = MODEL_PATH + "metadata.json";

        console.log("Carregando modelo de imagem de:", modelURL);

        // Carrega o modelo de imagem
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        console.log("Modelo de imagem carregado com sucesso!");

        labelContainer = document.getElementById("label-container");
        if (labelContainer) {
            labelContainer.innerHTML = "Modelo carregado! Clique para iniciar webcam";
        }

        return true;
    } catch (error) {
        console.error("Erro ao carregar modelo:", error);
        
        if (labelContainer) {
            labelContainer.innerHTML = "Erro: " + error.message;
        }
        
        return false;
    }
}

async function startWebcam() {
    if (isRunning || !model) return;
    
    try {
        console.log("Iniciando webcam...");
        
        // Configura a webcam
        const flip = true; // espelha a webcam
        webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
        await webcam.setup(); // solicita acesso à webcam
        await webcam.play();
        
        // Adiciona a webcam ao DOM
        const webcamContainer = document.getElementById("webcam-container");
        webcamContainer.innerHTML = ''; // limpa container
        webcamContainer.appendChild(webcam.canvas);
        
        isRunning = true;
        console.log("Webcam ativa. Iniciando reconhecimento...");
        
        if (labelContainer) {
            labelContainer.innerHTML = "Webcam ativa - Reconhecendo...";
        }
        
        // Inicia o loop de reconhecimento
        loop();
        
    } catch (error) {
        console.error("Erro ao iniciar webcam:", error);
        if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
            alert("Permissão de câmera negada. Por favor, permita o acesso à câmera.");
            if (labelContainer) {
                labelContainer.innerHTML = "Permissão negada. Clique novamente.";
            }
        }
    }
}

function stopWebcam() {
    if (webcam && isRunning) {
        webcam.stop();
        isRunning = false;
        console.log("Webcam parada");
        
        if (labelContainer) {
            labelContainer.innerHTML = "Webcam pausada. Clique para reativar.";
        }
    }
}

async function loop() {
    if (!isRunning) return;
    
    webcam.update(); // atualiza o frame da webcam
    await predict();
    window.requestAnimationFrame(loop);
}

// Função de reconhecimento
async function predict() {
    if (!model || !webcam || !isRunning) return;
    
    try {
        // Faz a predição usando o canvas da webcam
        const predictions = await model.predict(webcam.canvas);
        
        // Encontra a predição com maior probabilidade
        let maior = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i].probability > maior.probability) {
                maior = predictions[i];
            }
        }
        
        const comando = maior.className;
        const probabilidade = Number(maior.probability.toFixed(2));
        
        // Atualiza a interface
        if (labelContainer) {
            labelContainer.innerHTML = `Detectado: ${comando} (${probabilidade * 100}%)`;
        }
        
        // Processa os comandos
        processarComando(comando, probabilidade);
        
    } catch (error) {
        console.error("Erro na predição:", error);
    }
}

let ultimaAcao = 0;
function processarComando(comando, probabilidade) {
    // Só processa se a probabilidade for maior que 70%
    if (probabilidade < 0.7) return;
    
    comando = comando.trim().toLowerCase();
    console.log(`Comando: ${comando}, Probabilidade: ${probabilidade}`);
    const agora = Date.now();
    if (agora - ultimaAcao < 1000) { 
        // menos de 1 segundo desde a última ação
        return; 
    }
    ultimaAcao = agora;

    // CORREÇÃO AQUI: Mapeando os novos comandos
    switch (comando) {
        case 'subir':
            window.scrollBy(0, -200);
            break;
        case 'descer':
            window.scrollBy(0, 200);
            break;
        case 'direita':  // versão em minúsculo
            window.nextSlide?.();
            console.log("Avançando slide...");
            break;
        case 'esquerda': // versão em minúsculo
            window.prevSlide?.();
            console.log("Voltando slide...");
            break;
        case 'botão':
            document.getElementById("meuBotao")?.click();
            break;
        default:
            console.log("Comando não reconhecido:", comando);
    }
}

// Função para fullscreen
async function requestFullscreen() {
    try {
        if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
            console.log("Modo tela cheia ativado");
        }
    } catch (fullscreenError) {
        console.log("Fullscreen não suportado:", fullscreenError);
    }
}

// Inicialização controlada por gesto do usuário
window.initImageControl = async function() {
    try {
        console.log("Iniciando controle por imagem...");
        
        if (!checkLibraries()) {
            alert("Bibliotecas não carregadas. Recarregue a página.");
            return;
        }

        const success = await initImageModel();
        if (success) {
            await startWebcam();
            
            // Opcional: pedir fullscreen
            const wantFullscreen = confirm("Deseja entrar em modo tela cheia?");
            if (wantFullscreen) {
                await requestFullscreen();
            }
        }
    } catch (error) {
        console.error("Erro no initImageControl:", error);
        alert("Erro: " + error.message);
    }
};

// Função separada para fullscreen
window.activateFullscreen = function() {
    requestFullscreen();
};

// Função para parar webcam
window.stopImageControl = function() {
    stopWebcam();
};