맨처음에는 기본으로 제공되는 커넥션 풀 사이즈인 10으로 두었다.

10일 때의 우선 처리량
![[Pasted image 20261015193001.png]]http_reqs 가 2061/s 인 것을 볼 수 있음. 

![[Pasted image 20261015193034.png]]pending 상태의 최대가 186이며 active한 connection 연결이 거의 항상 10개 인것을 확인 할 수 있다. 

![[Pasted image 20261015193047.png]]usage 지표를 보면 알겠지만, usage는 커넥션을 빌린 뒤 풀에 돌려줄 때까지의 시간이다. 

hikaricp_connections_usage_seconds_count가 
가장 피크일 때 3000c/s, 초당 3000번의 커넥션 사용 기록을 완료했다는 것으로

hikaricp_connections_usage_seconds_sum
초당 누적된 커넥션 사용 시간이 약 8초 라는 뜻이다. 

즉, 평균 connection사용 시간은 8/3000 = 2.7ms 정도 이다.

![[Pasted image 20261015193101.png]]

hikaricp_connections_acquire_seconds_sum이 180 정도로,
피크 시간 대에 약 180초가 누적되었으므로, count 값으로 나눠주면, 보통 하나의 connection 대기시간이 약 60ms 정도로 acquire 평균지표와 비슷하다. 

usage에서 평균 커넥션 사용이 3ms 였으니, 대부분이 요청을 오래 처리한게 아닌, 요청이 몰릴 때 커넥션을 빌릴 차례를 기다렸다는 것을 알 수 있다. 
(커넥션 풀을 늘릴 근거)

CPU 표본은 Spring 평균 약 **570%**(5.7코어), MySQL 평균 약 **169%**(1.7코어)였습니다. Prometheus의 전체 CPU는 평균 **74.1%**, 최대 **81.2%**였습니다. Hikari는 active가 10까지 찼고 pending은 최대 188, 평균 커넥션 획득 대기는 **89ms**였습니다.



# 20
![[Pasted image 20261014173356.png]]처리량이 2143으로 이전 pool_size = 10 일 때 보다 낮아 진 것을 알 수 있다.

![[Pasted image 20261014173635.png]]

pending 상태인 connection이 줄어들어 더 좋은 성능을 낼 줄 알았는데 의외였다. 

![[Pasted image 20261014173718.png]]

usage를 보았을 때, usage_seconds_count 자체는 pool_size가 10일 때와 차이가 크게 없지만, usage_seconds_sum을 보면, 평균 17.5초 정도로 pool_size가 10일때 8초였던 것과 비교하면 약 2배 가까이 늘었습니다. 

평균 연결 시간은 17.5 / 2900 = 6ms로 pool_size가 10일 때에 비해서도 2배 가까이 늘었습니다. 

![[Pasted image 20261014174415.png]]

hikaricp_connections_acquire_seconds_sum 에 대해서는 피크 때 164정도로 기존에 비교했던 pool_size = 10 (180) 과 비교하면 큰 개선이 없는 수치이다, 

acquire_sum 값과 함께, count 피크를 계산해보면, 평균 획득 시간은 pool_size 가 10일 때, 60ms이고 20일 때 57ms 가 나오기 때문에 큰 변화는 없다.

평균 적인 cpu 부하는 Spring boot 기준, 550 - 680%, MySQL docker stats 기준, 190 - 230%으로 11코어 컨테이너의 부하는 평균 86% 이다.


다음은 pool_size가 15일 때이다.

![[Pasted image 20261014202234.png]]

pool size 를 15로 두고 진행 했을 때의 http reqs는 1955


![[Pasted image 20261014204440.png]]pending 값도 179로 10보다는 줄어든 상황

![[Pasted image 20261014204538.png]]

usage 값을 비교 했을 때, second_count 값은 2.02K c/s

![[Pasted image 20261014204859.png]]

hikaricp_connections_acquire_seconds_count 가 



- 전체 CPU: 평균 **75%**, 최대 **78.8%** (11코어 기준 약 8.3~8.7코어 사용)
- Spring 프로세스: 평균 약 **552%**, 최대 약 **591%** (약 5.5~5.9코어 사용)

앞서 했던 별도의 15 풀 실행은 전체 CPU 평균 **77.2%**, 최대 **88.2%**였습니다. 이번 수치는 해당 실행 구간의 Prometheus 값으로 계산한 추정치입니다.



# 13
![[Pasted image 20261015192539.png]]

![[Pasted image 20261015192552.png]]

![[Pasted image 20261015192601.png]]
그렇다

13 풀 실행 중 CPU는 Docker 표본 기준 Spring 평균 약 **627%**(약 6.3코어), MySQL 평균 약 **158%**(약 1.6코어)였습니다. Prometheus 전체 CPU는 부하 구간에 평균 약 **80%**, 최대 약 **85%**였습니다. Hikari는 active가 13까지 차 있었고 pending은 최대 184, 평균 획득 대기는 약 83ms였습니다. 풀이 꽉 찬 상태에서 대기열이 길게 생겼지만, 20으로 올렸을 때보다 처리량이 늘지는 않았습니다.

..



목표 측정치를 잡는 기준 같은 거를 찾아봐라
멀티 에이전트 사용해서 나오는 지표를 측정 한다거나..

요구 사항에 대한 예외 처리와 정상 처리..를 중요하게 여김.

mock 행위 기반에서 전체적인 결과를 보장해주지 않는다..
외부 인터페이스나 api 등이 없으면 mock 이 괜찮겟지만.. 

stub 을 좀 