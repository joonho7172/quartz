https://velog.io/@elive7/soft-delete%EC%97%90%EC%84%9C-unique-%EC%A1%B0%EA%B1%B4-%EB%98%91%EB%98%91%ED%95%98%EA%B2%8C-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0


문제 상황 


안녕하세요 케빈! 학습 방향에 관련한 질문입니다!
이번 주말에 softDelete 관련해서 unique 칼럼 적용에 대해서 문제가 있었는데,
기존에는 PostgreSQL로 기술 선정을 했어서, delatedAt과 name(uk) 를 partial index 적용을 해 해결을 하려고 설계에서 잡았었는데, 기술 선정이 Mysql로 바뀌면서 부분 인덱스 적용을 못하게 되었습니다.(null값이 중복 되기 때문)

해결법을 찾아보고 AI 도움을 받아서 
1. functional unique index 사용하기
2. generated column + unique index
3. nullable 보조 칼럼을 unique 매핑하기
로 좁혀졋는데, 이런 것들을 적용하기 위해서는 migration 도구인 flyway 등등을 같이 사용하면 좋다라고 하더라구요. 

결론은 이 부분 시간 써서 공부하고 따로 만드는 팀 블로그에다가 정리 하려고 하는데, 괜찮은 주제일까요? 매력적이지 않은 주제이거나, 약간 시간낭비 라고 생각되시면 간단하게 몇 줄 적고 끝내고 이어서 개발하려고 합니다!


1. 좋기는 한데 1번이랑 2번의 차이가 뭐가 있는지 보시고 펑셔널 인덱스가 내부적으로 어떻게 구현되어 있는지 보시면 더 의미가 있을것 같네요. SHOW CREATE TABLE이나 EXPLAIN으로 직접 확인해보세요. 그리고 JPA 붙였을때 어떻게 되는지도 보셔야합니다. 그리고 DB 레벨 유니크자체가 왜 필요한지도 보세요. 그냥 어플리케이션 레벨에서 exists로 체크할 수 있는데 쓰는 이유. 동시에 요청 들어왔을때를 그려보세요.
    
2. 그리고 3가지 방법 말고 다른 방법도 없는지 검토