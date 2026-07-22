const chat = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const resetButton = document.getElementById("resetButton");

let estado = "menu";
let atendimento = {};
let processando = false;
let opcoesDisponiveis = [];

function obterHorario() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function rolarParaFinal() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

function bloquearCampo(bloqueado) {
  userInput.disabled = bloqueado;
  sendButton.disabled = bloqueado;
}

function mostrarSeparador() {
  const separator = document.createElement("div");
  separator.className = "date-separator";
  separator.textContent = "Hoje";
  chat.appendChild(separator);
}

function mostrarMensagem(texto, tipo = "bot") {
  const row = document.createElement("div");
  row.className = `message-row ${tipo}-row`;

  if (tipo === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "R5";
    row.appendChild(avatar);
  }

  const content = document.createElement("div");
  content.className = "message-content";

  const message = document.createElement("div");
  message.className = "message";
  message.textContent = texto;

  const time = document.createElement("span");
  time.className = "message-time";
  time.textContent = obterHorario();

  content.appendChild(message);
  content.appendChild(time);
  row.appendChild(content);
  chat.appendChild(row);

  rolarParaFinal();
}

function mostrarDigitando() {
  removerDigitando();

  const row = document.createElement("div");
  row.className = "message-row bot-row";
  row.id = "typingIndicator";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "R5";

  const content = document.createElement("div");
  content.className = "message-content";

  const typing = document.createElement("div");
  typing.className = "message typing-message";

  for (let i = 0; i < 3; i++) {
    typing.appendChild(document.createElement("span"));
  }

  content.appendChild(typing);
  row.appendChild(avatar);
  row.appendChild(content);
  chat.appendChild(row);

  rolarParaFinal();
}

function removerDigitando() {
  const typingIndicator = document.getElementById("typingIndicator");

  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function aguardar(tempo) {
  return new Promise(resolve => setTimeout(resolve, tempo));
}

async function falar(texto, tempo = 650) {
  mostrarDigitando();
  await aguardar(tempo);
  removerDigitando();
  mostrarMensagem(texto);
}

function removerOpcoes() {
  document.querySelectorAll(".quick-replies").forEach(elemento => {
    elemento.remove();
  });

  opcoesDisponiveis = [];
}

function mostrarOpcoes(opcoes) {
  removerOpcoes();
  opcoesDisponiveis = opcoes;

  const container = document.createElement("div");
  container.className = "quick-replies";

  opcoes.forEach(opcao => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-reply-button";
    button.textContent = opcao.texto;

    button.addEventListener("click", async () => {
      if (processando) {
        return;
      }

      removerOpcoes();

      if (opcao.acao === "reiniciar") {
        await iniciarConversa();
        return;
      }

      await enviarMensagemUsuario(opcao.valor, opcao.texto);
    });

    container.appendChild(button);
  });

  chat.appendChild(container);
  rolarParaFinal();
}

function resolverOpcaoDigitada(texto) {
  const textoNormalizado = normalizarTexto(texto);
  const numero = Number(textoNormalizado);

  if (
    Number.isInteger(numero) &&
    numero >= 1 &&
    numero <= opcoesDisponiveis.length
  ) {
    return opcoesDisponiveis[numero - 1].valor;
  }

  const opcaoEncontrada = opcoesDisponiveis.find(opcao => {
    const textoOpcao = normalizarTexto(opcao.texto);
    const valorOpcao = normalizarTexto(opcao.valor || "");

    return (
      textoOpcao === textoNormalizado ||
      valorOpcao === textoNormalizado ||
      textoOpcao.includes(textoNormalizado) ||
      valorOpcao.includes(textoNormalizado)
    );
  });

  return opcaoEncontrada ? opcaoEncontrada.valor : texto;
}

function opcoesMenuPrincipal() {
  return [
    {
      texto: "💼 Conhecer serviços",
      valor: "servicos"
    },
    {
      texto: "📝 Solicitar orçamento",
      valor: "orcamento"
    },
    {
      texto: "🛠️ Suporte técnico",
      valor: "suporte"
    },
    {
      texto: "👩‍💻 Falar com especialista",
      valor: "especialista"
    }
  ];
}

function opcoesSolucoes() {
  return [
    {
      texto: "🌐 Sites e landing pages",
      valor: "sites"
    },
    {
      texto: "💻 Sistemas web",
      valor: "sistemas"
    },
    {
      texto: "⚙️ Automação de processos",
      valor: "automacao"
    },
    {
      texto: "🔗 APIs e integrações",
      valor: "integracoes"
    },
    {
      texto: "📊 Consultoria em tecnologia",
      valor: "consultoria"
    }
  ];
}

function opcoesCanal() {
  return [
    {
      texto: "📱 WhatsApp",
      valor: "whatsapp"
    },
    {
      texto: "✉️ E-mail",
      valor: "email"
    }
  ];
}

function exibirMenuPrincipal() {
  estado = "menu";
  userInput.placeholder = "Escolha uma opção ou digite sua dúvida...";
  mostrarOpcoes(opcoesMenuPrincipal());
}

async function voltarAoMenu() {
  await falar("Tudo certo! Vamos retornar ao menu principal.");
  await falar("Como posso ajudar você agora?");
  exibirMenuPrincipal();
}

async function iniciarOrcamento() {
  atendimento = {
    tipo: "Solicitação de orçamento"
  };

  estado = "orcamento_nome";
  userInput.placeholder = "Digite seu nome...";

  await falar("Ótimo! Vou reunir algumas informações para o seu orçamento.");
  await falar("Para começar, qual é o seu nome?");
}

async function iniciarSuporte() {
  atendimento = {
    tipo: "Suporte técnico"
  };

  estado = "suporte_nome";
  userInput.placeholder = "Digite seu nome...";

  await falar("Certo! Vou ajudar a registrar sua solicitação de suporte.");
  await falar("Primeiro, qual é o seu nome?");
}

async function iniciarEspecialista() {
  atendimento = {
    tipo: "Contato com especialista"
  };

  estado = "especialista_nome";
  userInput.placeholder = "Digite seu nome...";

  await falar("Perfeito! Vou organizar as informações para o atendimento.");
  await falar("Qual é o seu nome?");
}

async function apresentarServicos() {
  estado = "apos_servicos";

  await falar("A LTHS Tecnologia desenvolve soluções digitais para empresas e projetos.");

  await falar(
    "🌐 Sites e landing pages\n" +
    "💻 Sistemas web personalizados\n" +
    "⚙️ Automação de processos\n" +
    "🔗 APIs e integrações\n" +
    "📊 Consultoria e suporte tecnológico"
  );

  await falar("Qual será o próximo passo?");

  mostrarOpcoes([
    {
      texto: "📝 Solicitar orçamento",
      valor: "orcamento"
    },
    {
      texto: "👩‍💻 Falar com especialista",
      valor: "especialista"
    },
    {
      texto: "↩️ Voltar ao menu",
      valor: "menu"
    }
  ]);
}

async function perguntarCanal() {
  estado = "canal";
  userInput.placeholder = "Escolha WhatsApp ou e-mail...";

  await falar("Por qual canal você prefere receber um retorno?");

  mostrarOpcoes(opcoesCanal());
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarWhatsApp(numero) {
  const apenasNumeros = numero.replace(/\D/g, "");
  return apenasNumeros.length >= 10 && apenasNumeros.length <= 13;
}

function gerarProtocolo() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  const numero = Math.floor(100 + Math.random() * 900);

  return `LTHS-${ano}${mes}${dia}-${numero}`;
}

function obterResumoAtendimento() {
  if (atendimento.tipo === "Solicitação de orçamento") {
    return (
      `Tipo: ${atendimento.tipo}\n` +
      `Nome: ${atendimento.nome}\n` +
      `Empresa: ${atendimento.empresa}\n` +
      `Solução: ${atendimento.solucao}\n` +
      `Canal de retorno: ${atendimento.canal}`
    );
  }

  if (atendimento.tipo === "Suporte técnico") {
    return (
      `Tipo: ${atendimento.tipo}\n` +
      `Nome: ${atendimento.nome}\n` +
      `Cliente atual: ${atendimento.clienteAtual}\n` +
      `Categoria: ${atendimento.categoria}\n` +
      `Canal de retorno: ${atendimento.canal}`
    );
  }

  return (
    `Tipo: ${atendimento.tipo}\n` +
    `Nome: ${atendimento.nome}\n` +
    `Assunto: ${atendimento.assunto}\n` +
    `Canal de retorno: ${atendimento.canal}`
  );
}

async function finalizarAtendimento() {
  atendimento.protocolo = gerarProtocolo();

  await falar(
    `Perfeito, ${atendimento.nome}! Reuni as informações do atendimento.`
  );

  await falar(obterResumoAtendimento());

  await falar(
    `Protocolo de demonstração: ${atendimento.protocolo}`
  );

  await falar(
    "Atendimento simulado concluído com sucesso. ✅\n\n" +
    "Este projeto ainda não envia os dados para uma equipe. " +
    "Em uma versão integrada, a solicitação poderia ser encaminhada " +
    "automaticamente por WhatsApp, e-mail ou sistema de atendimento."
  );

  estado = "finalizado";
  userInput.placeholder = "Demonstração concluída";
  bloquearCampo(true);

  mostrarOpcoes([
    {
      texto: "🔄 Iniciar nova conversa",
      valor: "reiniciar",
      acao: "reiniciar"
    }
  ]);
}

async function opcaoInvalida(opcoes) {
  await falar(
    "Não consegui identificar essa opção. Você pode selecionar um dos botões abaixo."
  );

  mostrarOpcoes(opcoes);
}

async function processarResposta(resposta) {
  switch (estado) {
    case "menu":
      if (resposta === "servicos") {
        await apresentarServicos();
        return;
      }

      if (resposta === "orcamento") {
        await iniciarOrcamento();
        return;
      }

      if (resposta === "suporte") {
        await iniciarSuporte();
        return;
      }

      if (resposta === "especialista") {
        await iniciarEspecialista();
        return;
      }

      await opcaoInvalida(opcoesMenuPrincipal());
      break;

    case "apos_servicos":
      if (resposta === "orcamento") {
        await iniciarOrcamento();
        return;
      }

      if (resposta === "especialista") {
        await iniciarEspecialista();
        return;
      }

      if (resposta === "menu") {
        await voltarAoMenu();
        return;
      }

      await opcaoInvalida([
        {
          texto: "📝 Solicitar orçamento",
          valor: "orcamento"
        },
        {
          texto: "👩‍💻 Falar com especialista",
          valor: "especialista"
        },
        {
          texto: "↩️ Voltar ao menu",
          valor: "menu"
        }
      ]);
      break;

    case "orcamento_nome":
      if (resposta.length < 2) {
        await falar("Digite um nome válido para continuarmos.");
        return;
      }

      atendimento.nome = resposta;
      estado = "orcamento_empresa";
      userInput.placeholder = "Digite o nome da empresa...";

      await falar(`Prazer, ${atendimento.nome}!`);
      await falar(
        "Qual é o nome da sua empresa? Se não possuir, digite “Particular”."
      );
      break;

    case "orcamento_empresa":
      atendimento.empresa = resposta;
      estado = "orcamento_solucao";
      userInput.placeholder = "Escolha uma solução...";

      await falar("Qual solução você procura?");

      mostrarOpcoes(opcoesSolucoes());
      break;

    case "orcamento_solucao": {
      const solucoes = {
        sites: "Sites e landing pages",
        sistemas: "Sistemas web",
        automacao: "Automação de processos",
        integracoes: "APIs e integrações",
        consultoria: "Consultoria em tecnologia"
      };

      if (!solucoes[resposta]) {
        await opcaoInvalida(opcoesSolucoes());
        return;
      }

      atendimento.solucao = solucoes[resposta];
      estado = "orcamento_detalhes";
      userInput.placeholder = "Conte brevemente o que você precisa...";

      await falar(`${atendimento.solucao} é uma excelente escolha.`);
      await falar(
        "Conte brevemente o que você gostaria de desenvolver ou melhorar."
      );
      break;
    }

    case "orcamento_detalhes":
      if (resposta.length < 5) {
        await falar(
          "Você poderia fornecer um pouco mais de detalhes sobre o projeto?"
        );
        return;
      }

      atendimento.detalhes = resposta;
      await perguntarCanal();
      break;

    case "suporte_nome":
      if (resposta.length < 2) {
        await falar("Digite um nome válido para continuarmos.");
        return;
      }

      atendimento.nome = resposta;
      estado = "suporte_cliente";
      userInput.placeholder = "Selecione uma opção...";

      await falar(`Obrigado, ${atendimento.nome}.`);
      await falar("Você já é cliente da LTHS Tecnologia?");

      mostrarOpcoes([
        {
          texto: "✅ Sim, já sou cliente",
          valor: "sim"
        },
        {
          texto: "👋 Ainda não sou cliente",
          valor: "nao"
        }
      ]);
      break;

    case "suporte_cliente":
      if (resposta !== "sim" && resposta !== "nao") {
        await opcaoInvalida([
          {
            texto: "✅ Sim, já sou cliente",
            valor: "sim"
          },
          {
            texto: "👋 Ainda não sou cliente",
            valor: "nao"
          }
        ]);
        return;
      }

      atendimento.clienteAtual =
        resposta === "sim" ? "Sim" : "Não";

      estado = "suporte_categoria";
      userInput.placeholder = "Escolha o tipo de problema...";

      await falar("Qual opção descreve melhor o problema?");

      mostrarOpcoes([
        {
          texto: "🌐 Site indisponível",
          valor: "site"
        },
        {
          texto: "⚠️ Erro em um sistema",
          valor: "sistema"
        },
        {
          texto: "🔐 Problema de acesso",
          valor: "acesso"
        },
        {
          texto: "📋 Outro problema",
          valor: "outro"
        }
      ]);
      break;

    case "suporte_categoria": {
      const categorias = {
        site: "Site indisponível",
        sistema: "Erro em um sistema",
        acesso: "Problema de acesso",
        outro: "Outro problema"
      };

      if (!categorias[resposta]) {
        await opcaoInvalida([
          {
            texto: "🌐 Site indisponível",
            valor: "site"
          },
          {
            texto: "⚠️ Erro em um sistema",
            valor: "sistema"
          },
          {
            texto: "🔐 Problema de acesso",
            valor: "acesso"
          },
          {
            texto: "📋 Outro problema",
            valor: "outro"
          }
        ]);
        return;
      }

      atendimento.categoria = categorias[resposta];
      estado = "suporte_detalhes";
      userInput.placeholder = "Descreva o problema encontrado...";

      await falar(
        "Descreva o problema e, se possível, informe quando ele começou."
      );
      break;
    }

    case "suporte_detalhes":
      if (resposta.length < 5) {
        await falar(
          "Forneça um pouco mais de detalhes para registrarmos o problema."
        );
        return;
      }

      atendimento.detalhes = resposta;
      await perguntarCanal();
      break;

    case "especialista_nome":
      if (resposta.length < 2) {
        await falar("Digite um nome válido para continuarmos.");
        return;
      }

      atendimento.nome = resposta;
      estado = "especialista_assunto";
      userInput.placeholder = "Conte sobre o assunto...";

      await falar(`Prazer, ${atendimento.nome}!`);
      await falar(
        "Sobre qual projeto, necessidade ou solução você gostaria de conversar?"
      );
      break;

    case "especialista_assunto":
      if (resposta.length < 5) {
        await falar(
          "Você poderia contar um pouco mais sobre o assunto?"
        );
        return;
      }

      atendimento.assunto = resposta;
      await perguntarCanal();
      break;

    case "canal":
      if (resposta !== "whatsapp" && resposta !== "email") {
        await opcaoInvalida(opcoesCanal());
        return;
      }

      atendimento.canal =
        resposta === "whatsapp" ? "WhatsApp" : "E-mail";

      estado = "contato";

      if (resposta === "whatsapp") {
        userInput.placeholder = "Digite um WhatsApp fictício...";
        await falar(
          "Informe um número de WhatsApp para a simulação, incluindo o DDD."
        );
      } else {
        userInput.placeholder = "Digite um e-mail fictício...";
        await falar("Informe um endereço de e-mail para a simulação.");
      }
      break;

    case "contato":
      if (
        atendimento.canal === "E-mail" &&
        !validarEmail(resposta)
      ) {
        await falar(
          "Esse endereço de e-mail não parece válido. Tente novamente."
        );
        return;
      }

      if (
        atendimento.canal === "WhatsApp" &&
        !validarWhatsApp(resposta)
      ) {
        await falar(
          "Esse número não parece válido. Informe o DDD e o número."
        );
        return;
      }

      atendimento.contato = resposta;
      await finalizarAtendimento();
      break;

    default:
      await voltarAoMenu();
  }
}

async function enviarMensagemUsuario(valor, textoVisivel = valor) {
  if (processando) {
    return;
  }

  mostrarMensagem(textoVisivel, "user");
  userInput.value = "";

  processando = true;
  bloquearCampo(true);
  resetButton.disabled = true;

  await processarResposta(valor);

  processando = false;
  resetButton.disabled = false;

  if (estado !== "finalizado") {
    bloquearCampo(false);
    userInput.focus();
  }
}

async function enviarResposta(event) {
  event.preventDefault();

  if (processando || userInput.disabled) {
    return;
  }

  const textoDigitado = userInput.value.trim();

  if (textoDigitado === "") {
    userInput.focus();
    return;
  }

  const respostaProcessada =
    resolverOpcaoDigitada(textoDigitado);

  removerOpcoes();

  await enviarMensagemUsuario(
    respostaProcessada,
    textoDigitado
  );
}

async function iniciarConversa() {
  estado = "menu";
  atendimento = {};
  processando = true;

  removerOpcoes();
  removerDigitando();

  chat.innerHTML = "";
  userInput.value = "";
  userInput.placeholder = "Aguarde o assistente...";

  bloquearCampo(true);
  resetButton.disabled = true;

  mostrarSeparador();

  await falar("Olá! Seja bem-vindo à LTHS Tecnologia. 👋");
  await falar(
    "Eu sou o R5, assistente virtual da nossa equipe."
  );
  await falar(
    "Posso apresentar nossas soluções, iniciar um orçamento ou ajudar com suporte técnico."
  );
  await falar("Como posso ajudar você hoje?");

  exibirMenuPrincipal();

  processando = false;
  bloquearCampo(false);
  resetButton.disabled = false;
  userInput.focus();
}

chatForm.addEventListener("submit", enviarResposta);

resetButton.addEventListener("click", () => {
  if (!processando) {
    iniciarConversa();
  }
});

iniciarConversa();