UPDATE 쿼리가 발생 할 때, 현재 시간을 값으로 채워주는 [[Hibernate]]의 기능이다.

사용예시
```java
@Column(name = "updated_at")
    @UpdateTimestamp // UPDATE 시 자동으로 값을 채워줌
    private LocalDateTime updatedAt = LocalDateTime.now();
```