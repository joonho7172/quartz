Instant 는 UTC 기준의 절대 시간이다.
PostgreSQL에서 쓰는 TIMESTAMPTZ와 자연스럽게 매핑되며, 이는 곧
TIMESTAMP와 TIMESTAMPTZ를 쓰는 것의 차이로 명확해진다.

**장점** 
1. 타임존 문제 해결.
```java
LocalDateTime createdAt = LocalDateTime.now(); //어느 나라의 시간인지?
Instant createdAt = Instant.now(); //UTC 기준의 명확한 시간
```

2. 글로벌 서비스 대응.
	1. 여러 나라에 있어도 시간이 일관된다.

3. DB 독립성
	1. MySQL의 TIMESTAMP 와도 자연스럽게 매핑이 됨.

4. 비교 연산 안전성
	1. 타임존 변환 없이 직접 비교가 가능하다.


그럼 사용자에게는?
- 사용자에게는 보여줄 때만 해당 지역의 LocalDateTime으로 변환하면 된다.