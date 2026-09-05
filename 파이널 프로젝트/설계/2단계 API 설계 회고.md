일단 [[RestAPI]]란 ..
웹의 장점을 활용하는 통신 규칙, HTTP 주소로 자원을 지정하고 HTTP 요청 방식(GET, PUT, POST, DELETE)으로 상태를 만들음. 라고 정의 한다.

바로 본론으로 들어가서 API 설계를 어떻게 하는가.

나는 처음에 API 설계에 URI이 들어가기에 내가 지금까지 보던 uri과 api 설계에 들어가는 uri을 맞춰야 하는 줄 알았다.
API 명세서에 들어가는 예시 들을 보면 동작들이 너무 디테일 해서 UI에서 누르는 버튼 하나하나를 다 API 명세에 넣어야 하는 줄 알았으나
###### DB에 접근하고 데이터를 주고 받는 과정이 있어야 API 설계에 들어간다는 걸 알았다.

그리고 추가적으로 알아본 결과 
1. API의 URI에 들어가는건 리소스 (명사 중심) 예를 들어서, verify-> verification 으로 명사 중심으로 쓰는 것이 좋다. 해석 하는 사람 입장에서도 특정 인증건 조회. 처럼 명사로 나오는게 api 보기에도 깔끔하기 때문.

2. 계층 구조 (/groups/{groups}/...) 등으로 소속관계를 암시해야한다. 결국 도메인 자체의 관계를 URI 경로 자체로 드러내기 때문에, 특정 그룹에 속한 물품이라면, /items가 아닌, /groups/{groups}/items 처럼 소속 관계를 명시해야한다.

3. 복수형 단수형 명확하게.
   그냥 일반적으로 /item 이 아닌, 아이템의 목록을 보여주는것이라면 /items로, 특정 아이템의 상세 보기면 /items/{itemId}로 확정을 지어주는 것이 좋다. 


그리고 지금 같은 시나리오에서는 item에 대해서 교환 요청을 보내는 exchange-request 를 보낼 때,
item이 group에 속해 있기 때문에 /api/groups/{groupId}/items/{itemId}/... 으로 uri을 작성하려 했는데 
과연 item에 종속하는 exchang-request가 group까지 적는게 맞는가 생각해 보았다.
###### 1. DB관계와 URI구조는 전혀 다른 문제
item이 DB상 group_id를 가진다고 해서 URI도 반드신 groupId/item 으로 갈 필요가 없다.

###### 2. 어차피 item Id 자체가 PK로 구분이 가능하지 않나?
itemId만 알아도 어디 그룹에 속하는지 알 수 있고, 리소스는 부모에 집중 (exchange-request -> itemId)하지, groupId 처럼 주소를 특정하는데에는 불필요한 중복이라는 의견이다.

즉, 평탄화 작업으로 /items/{itemId}/exchange-requests 구조로 가는 것이 맞다는 결론으로 진행 하였다.


그리고 PUT/PATCH/DELETE와 같은 작업에서 기존 리소스 값을 재사용 한다는 URI 방식을 알게 되었다.
처음에는 POST를 위해서 /items/{itemId}/exchange-request 를 사용한다고 할 때 exchange-request id가 만들어지지 않아서 urI형태가 Collection이지만, Member 설계 방식으로 가면, 개별 리로스 식별로
/exchange-requests/{id}로 간단하게 정리 할 수 있다.

그럼 Collection resource 보다 Singula resource 방식이 좋은 점은.
1. URI이 안정적이 된다. 위의 예시로는 Exchange-Reqeust-Id만 알면 언제든 접근이 가능하고, 클라이언트가 이 값만 캐싱/ 북마크 해두면 됩니다. 만약 나중에 "아이템이 다른 그룹으로 이관되는 기능" 기능이 생겨도 exchange-request의 URI은 그대로 이기 때문.
2. 불필요한 검증 방지, requestId만 검증하면 되는데 교환 요청의 id까지 검증하게 되는 불필요한 로직이 생기기 때문에 이중 체크가 된다.
3. 일관성. 리소스 하나에 대한 진입점이 하나로 통일된다.

###### 실제 GITHUB API 예시 공식 문서
```
POST /repos/{owner}/{repo}/issues/{issue_number}/comments   ← 생성 (issue 컨텍스트 필요)

GET    /repos/{owner}/{repo}/issues/comments/{comment_id}   ← 조회 (issue_number 없음)
PATCH  /repos/{owner}/{repo}/issues/comments/{comment_id}   ← 수정 (issue_number 없음)
DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}   ← 삭제 (issue_number 없음)
```

신기한 것을 하나 알았다.
우선 본인의 물품을 삭제 하기 위해서는 본인의 물품인지를 확인해야했고 그것이 곧 권한 문제로 넘어갔다.
즉, 403 실패를 염두에 두어야 했던 것인데

좋아요 취소와 같은 delete 행도 403이 필요한가? 에 대해서 생각해보니 좋아요 취소에 권한 검사는 맞는 말이지만 뭔가 느낌이 이상해서 찾아봤다.

결론은 좋아요 취소는 403 에러로 두지 않는 것. 이전의 물품 같은 경우는 itemId로 물품이 완전 특정이 되고 누구의 물품을 지울 수 있는지 URL에 나와있는 반면에 좋아요 취소는 /api/items/{item}/likes를 지우는 것인데 누구의 좋아요를 지우는지 URL 자체에서 알 수 없다는 것. 따라서 권한 403 발생 자체가 안생기는 것이다. 어떻게 해도 요청을 보낸 사람 = 본인 좋아요 이기 때문에.



참고
https://kanado2000.tistory.com/132
https://learn.microsoft.com/ko-kr/azure/architecture/best-practices/api-design
