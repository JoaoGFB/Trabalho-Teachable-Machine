const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("pdf-render");
const ctx = canvas.getContext("2d");

let pdfDoc = null;
let pageNum = 1;

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: 1.6 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderCtx);
  });
}

function nextSlide() {
  if (pdfDoc && pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
}

function prevSlide() {
  if (pdfDoc && pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
}

// 🔹 deixa acessível globalmente
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;

// navegação por teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") {
    nextSlide();
  } else if (e.key === "ArrowLeft") {
    prevSlide();
  }
});

// upload do PDF
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) {
    const fileURL = window.URL.createObjectURL(file);

    pdfjsLib.getDocument(fileURL).promise.then(pdfDoc_ => {
      pdfDoc = pdfDoc_;
      pageNum = 1;
      fileInput.style.display = "none";
      canvas.style.display = "block";
      renderPage(pageNum);
    });
  }
});