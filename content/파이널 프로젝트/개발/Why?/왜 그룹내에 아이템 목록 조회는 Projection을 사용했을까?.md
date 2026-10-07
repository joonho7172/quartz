그룹 내에서 아이템 목록 조회를 가져올 때는 

기존에 있던 fetch join으로 물품의 목록을 가져올 수 있었지만,
```java

@Query
	Select reqeust.id as exchangeRequestId and request.updateAt as updateAt
	From reqeustExchangeId as reqeust
	Where reqeust.status :requestStatus.ids
```