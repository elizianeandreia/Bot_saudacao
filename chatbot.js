
const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");

let etapa = 3;
let respostas = {};

const mensagens = [
  "Olá, pessoa!",
  "Estou animado para falar com você!",
  "Vamos começar a nossa conversa!",
  "Qual é o seu nome?"
];

function mostrarMensagem(texto, classe = "bot") {
  const msg = document.createElement("div");
  msg.className = `message ${classe}`;
  msg.textContent = texto;
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function enviarResposta() {
  const input = userInput.value.trim();
  if (input === "") return;

  mostrarMensagem(input, "user");
  userInput.value = "";

  processarResposta(input);
}

function processarResposta(resposta) {
  switch (etapa) {
    case 0:
      respostas.nome = resposta;
      mostrarMensagem(`Olá, ${respostas.nome}!`);
      mostrarMensagem(`Meu nome é Mr.Robô! Mas você pode me chamar de R5🤖!`);
      mostrarMensagem("Quantos anos você tem?");
      etapa++;
      break;

    case 3:
      respostas.nome = resposta;
      mostrarMensagem(`Olá, ${respostas.nome}!`);
      mostrarMensagem(`Meu nome é Mr.Robô! Mas você pode me chamar de R5🤖!` );
      mostrarMensagem("Quantos anos você tem?");
      etapa++;
      break;
    case 4:
     case 4:
  respostas.idade = resposta;
  const idade = parseInt(resposta);
  if (!isNaN(idade)) {
    if (idade > 110) {
      mostrarMensagem(`Você tem ${idade} anos? Isso é humanamente impossível! 😲`);
    } else if (idade <= 30) {
      mostrarMensagem(`Você tem ${idade} anos! Está jovem ainda!`);
    } else if (idade <= 50) {
      mostrarMensagem(`Você tem ${idade} anos! É agora que a vida começa!`);
    } else {
      mostrarMensagem(`Você tem ${idade} anos! Você é uma pessoa muito sábia!`);
    }
  } else {
    mostrarMensagem("Hmmm, isso não parece uma idade válida. Pode digitar só o número?");
    return; 
  }
  mostrarMensagem("Agora, me diga, qual é a sua cor favorita?");
  etapa++;
  break;

    case 5:
      respostas.cor = resposta;
      mostrarMensagem(`A sua cor favorita é ${respostas.cor}! Que cor linda🤩!`);
      mostrarMensagem("Agora, me diga, qual é o seu animal favorito?");
      etapa++;
      break;
    case 6:
      respostas.animal = resposta;
      mostrarMensagem(`O seu animal favorito é ${respostas.animal}! Também gosto de ${respostas.animal}!`);
      mostrarMensagem("Qual é o seu filme favorito?");
      etapa++;
      break;
    case 7:
      respostas.filme = resposta;
      mostrarMensagem(`O seu filme favorito é ${respostas.filme}! Ótimo filme!`);
      mostrarMensagem("Obrigado por conversar comigo😌!");
      mostrarMensagem("Espero que tenhamos mais conversas no futuro!");
      etapa++;
      break;
    default:
      mostrarMensagem("Encerramos por agora, mas estou por aqui se precisar😊!");
  }
}


(function iniciarConversa() {
  mostrarMensagem(mensagens[0]);
  setTimeout(() => mostrarMensagem(mensagens[1]), 800);
  setTimeout(() => mostrarMensagem(mensagens[2]), 1600);
  setTimeout(() => mostrarMensagem(mensagens[3]), 2400);
})();
