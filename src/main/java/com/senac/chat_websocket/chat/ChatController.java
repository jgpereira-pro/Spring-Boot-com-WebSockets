package com.senac.chat_websocket.chat;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.enviarMesagem")
    @SendTo("/topic/public")
    public ChatMessage enviarMensagem(
            @Payload ChatMessage chatMessage
    ) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // Adicionar username na sessão web socket
        headerAccessor.getSessionAttributes().put("username", chatMessage.getRemetente());
        return chatMessage;
    }
}
