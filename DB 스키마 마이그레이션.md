
```JAVA
package com.example.KTB_Agile_backend.chat.entity;  
  
import com.example.KTB_Agile_backend.common.entity.BaseEntity;  
import com.example.KTB_Agile_backend.user.entity.User;  
import jakarta.persistence.Column;  
import jakarta.persistence.Entity;  
import jakarta.persistence.EnumType;  
import jakarta.persistence.Enumerated;  
import jakarta.persistence.FetchType;  
import jakarta.persistence.GeneratedValue;  
import jakarta.persistence.GenerationType;  
import jakarta.persistence.Id;  
import jakarta.persistence.JoinColumn;  
import jakarta.persistence.ManyToOne;  
import jakarta.persistence.Table;  
import lombok.AccessLevel;  
import lombok.Getter;  
import lombok.NoArgsConstructor;  
  
import java.util.Objects;  
  
@Entity  
@Table(name = "chat_messages")  
@Getter  
@NoArgsConstructor(access = AccessLevel.PROTECTED)  
public class ChatMessage extends BaseEntity {  
  
    @Id  
    @GeneratedValue(strategy = GenerationType.IDENTITY)  
    @Column(name = "message_id", nullable = false)  
    private Long id;  
  
    @ManyToOne(fetch = FetchType.LAZY, optional = false)  
    @JoinColumn(name = "chat_room_id", nullable = false)  
    private ChatRoom chatRoom;  
  
    @ManyToOne(fetch = FetchType.LAZY)  
    @JoinColumn(name = "user_id")  
    private User user;  
  
    @Column(nullable = false, columnDefinition = "TEXT")  
    private String content;  
  
    @Enumerated(EnumType.STRING)  
    @Column(name = "message_type", nullable = false, length = 20)  
    private ChatMessageType messageType = ChatMessageType.TEXT;  
  
    @Enumerated(EnumType.STRING)  
    @Column(name = "system_event_type", length = 40)  
    private ChatSystemEventType systemEventType;  
  
    public ChatMessage(ChatRoom chatRoom, User user, String content) {  
       this.chatRoom = chatRoom;  
       this.user = Objects.requireNonNull(user, "user must not be null");  
       this.content = content;  
    }  
  
    public static ChatMessage system(ChatRoom chatRoom, ChatSystemEventType eventType) {  
       ChatMessage message = new ChatMessage();  
       message.chatRoom = chatRoom;  
       message.content = eventType.content();  
       message.messageType = ChatMessageType.SYSTEM;  
       message.systemEventType = eventType;  
       return message;  
    }  
}

```

채팅 메시지 엔티티 분리, 
mysql에서 mongo DB로 채팅 message 테이블만 분리 예정

추후 mysql 에서 drop 되는 테이블은 flyway 통해서 관리할 예정


# mongoDb 컬렉션 추가

`Chat_messages`

```SQL
{
  _id: ObjectId("..."),
  chatRoomId: NumberLong(101),
  messageId: NumberLong(37),       // 해당 방 안에서 증가하는 순번
  userId: NumberLong(42),           // 시스템 메시지는 null
  content: "메시지 내용",
  messageType: "TEXT",              // TEXT | SYSTEM enum 관리 예정
  systemEventType: null,            // 시스템 메시지 유형 또는 null
  createdAt: ISODate("2026-10-20T01:00:00Z")
}
```


`Chat messages counter`

```sql
{
  _id: NumberLong(101), // chatRoomId
  seq: NumberLong(37)
}
```

필수 index

```SQL
db.chat_messages.createIndex(
  { chatRoomId: 1, messageId: -1 },
  { unique: true }
);
```

