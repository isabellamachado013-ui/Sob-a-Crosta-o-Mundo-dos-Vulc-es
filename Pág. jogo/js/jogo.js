const fases = [
    { tempo: 20, pessoas: 4, velocidade: 1.25 },
    { tempo: 15, pessoas: 5, velocidade: 1.0 },
    { tempo: 12, pessoas: 6, velocidade: 0.78 }
];

let faseAtual = 0;
let tempo = 0;
let salvas = 0;
let jogoAtivo = false;
let intervalo = null;
let andando = 0;

const jogo = document.getElementById("jogo");
const pessoasContainer = document.getElementById("pessoas");
const tempoEl = document.getElementById("tempo");
const salvasEl = document.getElementById("salvas");
const totalEl = document.getElementById("total");
const nivelEl = document.getElementById("nivel");
const faseEl = document.getElementById("fase");
const lavaEl = document.getElementById("lava");
const progressoEl = document.getElementById("progresso");
const mensagemEl = document.getElementById("mensagem");
const alertaEl = document.getElementById("alerta");
const inicioEl = document.getElementById("inicio");
const fimEl = document.getElementById("fim");
const tituloFim = document.getElementById("tituloFim");
const textoFim = document.getElementById("textoFim");
const iconeFim = document.getElementById("iconeFim");
const proximoBtn = document.getElementById("proximo");

document.getElementById("comecar").addEventListener("click", () => {
    inicioEl.classList.add("escondido");
    iniciarFase(0);
});

document.getElementById("jogarNovamente").addEventListener("click", () => {
    fimEl.classList.add("escondido");
    iniciarFase(0);
});

proximoBtn.addEventListener("click", () => {
    fimEl.classList.add("escondido");
    iniciarFase(faseAtual + 1);
});

function iniciarFase(numero) {
    clearInterval(intervalo);

    faseAtual = numero;
    const config = fases[faseAtual];

    tempo = config.tempo;
    salvas = 0;
    andando = 0;
    jogoAtivo = true;

    faseEl.textContent = faseAtual + 1;
    totalEl.textContent = config.pessoas;
    tempoEl.textContent = tempo;
    salvasEl.textContent = salvas;
    nivelEl.textContent = "0";
    lavaEl.style.height = "0%";
    progressoEl.style.width = "0%";
    alertaEl.classList.remove("visivel");

    criarPessoas(config.pessoas);

    mensagemEl.textContent =
        `Fase ${faseAtual + 1}: clique nas pessoas para levá-las à área segura.`;

    intervalo = setInterval(atualizarTempo, 1000);
}

function criarPessoas(total) {
    pessoasContainer.innerHTML = "";

    const posicoes = [
        { left: 9, bottom: 70 },
        { left: 24, bottom: 125 },
        { left: 39, bottom: 58 },
        { right: 27, bottom: 85 },
        { right: 12, bottom: 135 },
        { left: 54, bottom: 45 }
    ];

    for (let i = 0; i < total; i++) {
        const pessoa = document.createElement("button");
        pessoa.className = "pessoa";
        pessoa.textContent = "🧍";
        pessoa.setAttribute("aria-label", `Pessoa ${i + 1}`);

        const pos = posicoes[i];

        if (pos.left !== undefined) pessoa.style.left = `${pos.left}%`;
        if (pos.right !== undefined) pessoa.style.right = `${pos.right}%`;

        pessoa.style.bottom = `${pos.bottom}px`;
        pessoa.dataset.salva = "false";

        pessoa.addEventListener("click", () => evacuarPessoa(pessoa));

        pessoasContainer.appendChild(pessoa);
    }
}

function atualizarTempo() {
    if (!jogoAtivo) return;

    tempo--;
    tempoEl.textContent = tempo;

    const config = fases[faseAtual];
    const porcentagem = ((config.tempo - tempo) / config.tempo) * 100;

    lavaEl.style.height = `${Math.min(porcentagem * 0.85, 85)}%`;
    nivelEl.textContent = Math.round(porcentagem);
    progressoEl.style.width = `${Math.min(porcentagem, 100)}%`;

    if (tempo === Math.ceil(config.tempo * 0.6)) {
        alertaEl.classList.add("visivel");
        mensagemEl.textContent = "⚠️ O vulcão está ficando mais ativo!";
    }

    if (tempo === 7) {
        mensagemEl.textContent = "🚨 Rápido! Evacue quem ainda está na área de risco!";
    }

    if (tempo <= 0) {
        finalizarFase(false);
    }
}

function evacuarPessoa(pessoa) {
    if (!jogoAtivo || pessoa.dataset.salva === "true") return;

    pessoa.dataset.salva = "true";
    pessoa.classList.add("andando");
    andando++;

    const zona = document.getElementById("zonaSegura");
    const jogoRect = jogo.getBoundingClientRect();
    const zonaRect = zona.getBoundingClientRect();
    const pessoaRect = pessoa.getBoundingClientRect();

    const destinoX =
        zonaRect.left - jogoRect.left +
        zonaRect.width / 2 -
        pessoaRect.width / 2;

    const destinoY =
        zonaRect.top - jogoRect.top +
        zonaRect.height / 2 -
        pessoaRect.height / 2;

    pessoa.style.left = `${destinoX}px`;
    pessoa.style.top = `${destinoY}px`;
    pessoa.style.right = "auto";
    pessoa.style.bottom = "auto";
    pessoa.style.transitionDuration = `${fases[faseAtual].velocidade}s`;

    setTimeout(() => {
        pessoa.classList.remove("andando");
        pessoa.classList.add("salva");
        salvas++;
        andando--;

        salvasEl.textContent = salvas;
        mensagemEl.textContent =
            `✅ Pessoa evacuada! ${salvas} de ${fases[faseAtual].pessoas} estão seguras.`;

        if (salvas === fases[faseAtual].pessoas) {
            finalizarFase(true);
        }
    }, fases[faseAtual].velocidade * 1000 + 100);
}

function finalizarFase(vitoria) {
    if (!jogoAtivo) return;

    jogoAtivo = false;
    clearInterval(intervalo);
    intervalo = null;
    alertaEl.classList.remove("visivel");

    if (vitoria) {
        tituloFim.textContent = faseAtual === fases.length - 1
            ? "🎉 Você completou o jogo!"
            : "🎉 Fase concluída!";

        iconeFim.textContent = "🏆";

        textoFim.textContent = faseAtual === fases.length - 1
            ? "Você evacuou toda a população nas três fases."
            : `Você salvou todas as ${salvas} pessoas antes da erupção.`;

        proximoBtn.style.display =
            faseAtual === fases.length - 1 ? "none" : "inline-block";

        lavaEl.style.height = "25%";
    } else {
        tituloFim.textContent = "🌋 A erupção começou!";
        iconeFim.textContent = "🌋";
        textoFim.textContent =
            `Você conseguiu evacuar ${salvas} de ${fases[faseAtual].pessoas} pessoas.`;

        proximoBtn.style.display = "none";
        lavaEl.style.height = "100%";
    }

    fimEl.classList.remove("escondido");
}
