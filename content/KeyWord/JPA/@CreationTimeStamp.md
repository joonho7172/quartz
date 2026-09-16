행이 만들어질때 현재의 시간을 기준으로 값이 넣어지는 [[Hibernate]] 기능이다.

사용 예시
```java
@CreationTimestamp // INSERT 시 자동으로 값을 채워줌
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
```

#Hibernate #annotation
