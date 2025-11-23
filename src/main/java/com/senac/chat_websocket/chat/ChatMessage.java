package com.senac.chat_websocket.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    private MessageType type;
    private String conteudo;
    private String remetente;

}
