Json web encryption의 약자로 
[[claim]]자체를 암호화 한다. 때문에 복호화 방법을 아는 사용자만 페이로드를 읽을 수 있다.

JWS, JWE 둘 다 구성은 같습니다. 헤더, 페이로드, 서명 세 가지 주요 요소로 구성되고 각 구성은 `.` 마침표를 구분자로 사용해요. 아래는 JWS의 예시입니다. 편의를 위해 여러 줄에 나누었지만, 실제 JWS는 줄바꿈이 없는 문자열입니다.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. // 헤더
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ. // 페이로드
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c // 서명
```

- **헤더(Header)**: 일반적으로 헤더에는 토큰의 유형(JWS, JWE)과 서명 알고리즘을 명시해요. JSON으로 표현된 헤더를 Base64로 인코딩한 것이 JWT 헤더입니다.
- **페이로드(Payload)**: 보통 JSON 형식으로 표현된 사용자의 정보나 클레임이 키-값(key-value)로 포함된 부분입니다. [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)에 정의된 `iss`(issuer), `exp`(expiration time), `sub`(subject), `aud`(audience) 등 키를 사용할 수 있지만, 필요에 따라 새로운 클레임을 추가할 수도 있어요. JWS 방식에서는 페이로드도 Base64로 인코딩합니다. 누구나 디코딩할 수 있기 때문에 JWS 페이로드에는 민감한 정보를 넣으면 안 돼요. JWE 방식에서는 페이로드를 안전한 알고리즘과 비밀 키로 암호화하기 때문에 민감한 정보를 포함할 수 있어요.
- **서명(Signature)**: 헤더와 페이로드를 결합한 후 지정된 알고리즘과 비밀 키 또는 공개 키로 서명한 값입니다. 이 서명은 JWT의 무결성을 보장하며, 데이터가 변경되지 않았음을 확인할 수 있습니다. 서명은 아래와 같은 형태입니다. 인코딩한 헤더, 페이로드를 헤더에 정의한 알고리즘에 의해 `secret`(키)으로 암호화합니다. 서명은 키로만 복호화할 수 있기 때문에 토큰의 전송자와 내용의 무결성을 보장합니다.
    
    ```
    HMACSHA256(
      base64UrlEncode(header) + "." +
      base64UrlEncode(payload),
      secret)
    ```

#jwt #jwe #SpringSecurity 