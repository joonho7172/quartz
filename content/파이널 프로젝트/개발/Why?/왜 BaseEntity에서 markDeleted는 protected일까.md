```java 
private LocalDateTime deletedAt;

protected void markDeleted(LocalDateTime deletedAt) {
    this deletedAt = deletedAt;
}
```

private으로 다른 클래스에서의 deletedAt의 변경은 막으면서, 다른 외부의 revokedAt, withdrawnAt 등의 자식들이 deletedAt을 자유롭게 쓰도록 열어 둔 것이다.


후편은 [[왜 BaseEntity와 SoftDeletableEntity는 추상클래스 일까]] 로 이어집니다...