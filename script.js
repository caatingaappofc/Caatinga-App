// Texto gigante se move devagar com o scroll (paralaxe leve)
const giant = document.querySelector(".giant");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (giant && !reduce) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      giant.style.transform = `translateX(${window.scrollY * -0.12}px)`;
      ticking = false;
    });
  }, { passive: true });
}

// Formulário de contato: valida o e-mail e confirma o envio
const form = document.getElementById("form");
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  msg.className = valido ? "ok" : "erro";
  msg.textContent = valido
    ? "Enviado! Em breve você recebe nossas novidades."
    : "Digite um e-mail válido, como nome@email.com.";

  if (valido) form.reset();
});
