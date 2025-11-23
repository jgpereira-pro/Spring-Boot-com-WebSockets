'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var mensagemForm = document.querySelector('#mensagemForm');
var mensagemInput = document.querySelector('#mensagem');
var mensagemArea = document.querySelector('#mensagemArea');
var connectingElement = document.querySelector('.conectando');

var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}

function onConnected() {
    // Inscrever no topico publico
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Envia o nome de usuario para o servidor
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({remetente: username, type: 'ENTRAR'})
    );

    connectingElement.classList.add('hidden');
}

function onError(error) {
    connectingElement.textContent = 'Não foi possível conectar ao servidor WebSocket. Por favor recarregue a página!';
    connectingElement.style.color = 'red';
}

function enviarMensagem(event) {
    var mensagemConteudo = mensagemInput.value.trim();
    if(mensagemConteudo && stompClient) {
        var chatMessage = {
            remetente: username,
            conteudo: mensagemInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.enviarMensagem", {}, JSON.stringify(chatMessage));
        mensagemInput.value = '';
    }
    event.preventDefault();
}

function onMessageReceived(payload) {
    var mensagem = JSON.parse(payload.body);

    var mensagemElement = document.createElement('li');

    if(mensagem.type === 'ENTRAR') {
        mensagemElement.classList.add('evento-mensagem');
        mensagem.conteudo = mensagem.remetente + ' entrou!';
    } else if (mensagem.type === 'SAIR') {
        mensagemElement.classList.add('evento-mensagem');
        mensagem.conteudo = mensagem.remetente + ' saiu!';
    } else {
        mensagemElement.classList.add('chat-mensagem');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(mensagem.remetente[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(mensagem.remetente);

        mensagemElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(mensagem.remetente);
        usernameElement.appendChild(usernameText);
        mensagemElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var textoFinal = (mensagem.type === 'ENTRAR' || mensagem.type === 'SAIR')
                     ? mensagem.conteudo
                     : mensagem.conteudo;

    var messageText = document.createTextNode(textoFinal);
    textElement.appendChild(messageText);

    mensagemElement.appendChild(textElement);

    mensagemArea.appendChild(mensagemElement);
    mensagemArea.scrollTop = mensagemArea.scrollHeight;
}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true);
mensagemForm.addEventListener('submit', enviarMensagem, true);