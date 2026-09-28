현재의 조회수 증가 매커니즘은 이러하다.
일단 lastCountAt행을 추가 해서 마지막으로 조회수를 증가한 시간을 기록 하는 것.
그리고 lastCountAt행을 기준으로 24시간이 지나야지만 조회수가 + 1 count되고, 그 전에 다시 get 요청으로 조회수가 늘어나진 않는다. 

```java
@Lock(LockModeType.PESSIMISTIC_READ)
@Query("select stats from ItemStats stats where stats.id = :itemdId")
Optional<ItemState> findByIdForUpdate(@Param("itemId") Long itemId);
```

그렇다면 여기서 비관적 읽기 락인 pessmistic_read 을 걸게 되면 어떻게 될까
물품의 item_state 에 대해서 락이 걸리는 것이다. 


비관적 읽기 잠금을 하면 생기는 일은?
1. 데이터 수정이 잠금 된다.
	1. 비관적 읽기 잠금이 적용되면 읽기 작업 중에, 해당 트랜잭션이 끝나서 read lock을 반납 하기 전까지는 다른 트랜잭션에서의 수정이 제한 된다.

2. *다만 성능 저하 가능성*
	1. **읽기 작업 동안에 쓰기 작업을 못하고 트랜잭션 대기 시간이 밀리게 되므로 과도한 요청에 있어서는 병목의 원인이 될 수 있다.**


이 원인을 해결하는 것은 추후에 기술하도록 할 예정. 지금은 조회수의 유실과 정합성을 맞추기 위해서 성능을 포기한 상황이다.

일단 적어놓는 병목의 원인 : 조회수를 직접 증가하지 않는 24시간 이내의 조회도 비관적 읽기 락을 획득한다, @Transactional 의 범위가 item_stats이므로, item의 like와 view 등도 함께 행이 직렬화 될 수 있다.



