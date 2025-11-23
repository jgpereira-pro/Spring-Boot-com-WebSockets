'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var mensagemForm = document.querySelector('#mensagemForm');
var mensagemInput = document.querySelector('#mensagem');
var mensagemArea = document.querySelector('#mensagemArea');
var connectingElement = document.querySelector('.connecting');

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

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({remetente: username, type: 'ENTRAR'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textConteudo = 'Voce não conseguiu entrar no servidor WebSocket. Por favor recarregue a pagina e tente denovo!';
    connectingElement.style.color = 'red';
}


function enviarMensagem(event) {
    var messagecConteudo = messageInput.value.trim();
    if(messagecConteudo && stompClient) {
        var chatMessage = {
            remetente : username,
            conteudo: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.enviarMensagem", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
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
        mensagem.conteudo = mensagem.remetente + ' esquerda!';
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
    var mensagemText = document.createTextNode(mensagem.conteudo);
    textElement.appendChild(mensagemText);

    mensagemElement.appendChild(textElement);

    mensagemArea.appendChild(mensagemElement);
    mensagemArea.scrollTop = mensagemArea.scrollHeight;
}


function getAvatarColor(mensagemRemetente) {
    var hash = 0;
    for (var i = 0; i < mensagemRemetente.length; i++) {
        hash = 31 * hash + mensagemRemetente.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)
mensagemForm.addEventListener('submit', enviarMensagem, true)