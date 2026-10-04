const lista = document.getElementById("fotos");
const botoes = document.querySelectorAll(".chip");
const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Ordenar fotos ---------- */
// Inverte a ordem das divs (a última vira a primeira)
let ordem = "antigas"; // ordem do HTML: da mais antiga para a mais recente

botoes.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.ordem === ordem) return;
    ordem = btn.dataset.ordem;

    botoes.forEach((b) => {
      const ativo = b === btn;
      b.classList.toggle("on", ativo);
      b.setAttribute("aria-pressed", ativo);
    });

    [...lista.children].reverse().forEach((foto) => lista.appendChild(foto));
  });
});

/* ---------- Foto ampliada ---------- */
const box = document.getElementById("lightbox");
const big = document.getElementById("lb-img");
const fechar = document.getElementById("lb-close");
const DUR = reduce ? 0 : 450;

let origem = null;   // miniatura aberta
let aberto = false;
let ocupado = false;

// Torna cada foto acessível pelo teclado
lista.querySelectorAll(".foto").forEach((f, i) => {
  const img = f.querySelector("img");
  if (!img || !img.getAttribute("src")) return;
  f.tabIndex = 0;
  f.setAttribute("role", "button");
  f.setAttribute("aria-label", "Ampliar foto " + (i + 1));
});

// Posição da miniatura em relação à foto grande (para o efeito de "crescer")
function transformDe(miniatura) {
  const t = miniatura.getBoundingClientRect();
  const f = big.getBoundingClientRect();
  return `translate(${t.left - f.left}px, ${t.top - f.top}px) scale(${t.width / f.width}, ${t.height / f.height})`;
}

async function abrir(foto) {
  const img = foto.querySelector("img");
  if (aberto || ocupado || !img || !img.getAttribute("src")) return;
  ocupado = true;
  origem = foto;

  big.src = img.currentSrc || img.src;
  big.alt = img.alt;
  try { await big.decode(); } catch (e) {}

  // trava a rolagem sem deixar a página "pular" quando a barra some
  const barra = window.innerWidth - root.clientWidth;
  if (barra > 0) root.style.paddingRight = barra + "px";
  root.classList.add("lock");

  box.hidden = false;
  big.style.transition = "none";
  big.style.transform = reduce ? "" : transformDe(img);
  box.offsetWidth; // força o navegador a aplicar o estado inicial

  box.classList.add("open");
  big.style.transition = `transform ${DUR}ms cubic-bezier(.2,.7,.2,1)`;
  big.style.transform = "";

  aberto = true;
  ocupado = false;
  fechar.focus({ preventScroll: true });
}

function fecharFoto() {
  if (!aberto || ocupado) return;
  ocupado = true;

  box.classList.remove("open");
  big.style.transform = reduce ? "" : transformDe(origem.querySelector("img"));

  setTimeout(() => {
    box.hidden = true;
    root.classList.remove("lock");
    root.style.paddingRight = "";
    big.removeAttribute("src");
    origem.focus({ preventScroll: true });
    aberto = false;
    ocupado = false;
  }, DUR);
}

lista.addEventListener("click", (e) => {
  const foto = e.target.closest(".foto");
  if (foto) abrir(foto);
});
lista.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const foto = e.target.closest(".foto");
  if (foto) { e.preventDefault(); abrir(foto); }
});

fechar.addEventListener("click", fecharFoto);
box.addEventListener("click", (e) => { if (e.target === box) fecharFoto(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharFoto();
  if (e.key === "Tab" && aberto) { e.preventDefault(); fechar.focus(); }
});
