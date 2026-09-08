
##### JPA Sequence = auto_increment
 왜 auto_increment인가?
		1. 알아보기가 쉽고 JPA 사용에 편리함.
		2. 주요 서비스에 관해서는 인증과 인가 security로 처리하고, 겹칠 일이 없어 무분별한 API의 요청 방어에 UUID의 장점이 없음.

## 공통 ENTITY
1. created_at
	1. 생명 주기 관리

## 선택 ENTITY
1. updated_at(선택)
	1. 수정 될 일이 없는 테이블은 updated_at을 두지 않음.
2. deleted_at(선택)
	1. like 테이블이나 image 테이블은 하드삭제, 그 외에는 soft delete 하기 위함.

## Users
1. user_id (pk)

2. profile_image_url
	1. 왜 만들었나
		1. 카카오 로그인 api에서 사용자의 id만 알면 프로필 사진은 가져올 수 있음. (동의 한다는 가정하에)
		2. 그치만 따로 profile_image_url을 만들어 놓으면 DB에서 가져와서 바로바로 이미지 출력이 가능함.

3. nickname
	1. 왜 만들었냐
		1. 서비스 이용에 있어서 기본이 되는 사용자 이름.
		2. 사용자 프로필 처럼 굳이 api 호출해서 가져오는 것보다 db에 별도로 저장해서 필요할 때마다 쓰기 위함.
4. user_role (VARCHAR + CHECK) ('USER', 'ADMIN')
	1. 사용자의 역할을 나누기 위함, 일단은 admin과 user 두개로 관리할 예정.

5. user_status (VARCHAR + CHECK) ('ACTIVE', 'SUSPENDED', 'WITHDRAWN')
	1. 사용자의 상태를 나타내기 위함


## social_accounts
UNIQUE (provider_user_id, provider)
	동일 계정이 여러 사용자에게 연결되는 것을 막기 위함.

1. social _account_id  (pk)
	
2. user_id (FK)
	1. 서비스 내 사용자 id와 매칭 시키기 위해서 USER 테이블에서 참조하는 외래키.

3. provider (VARCHAR + CHECK) (KAKAO)
	1. 제공하는 소셜을 check 값에다가 추가 할 예정

4. provider_user_id (UNIQUE)
	1. 제공하는 소셜에서 사용하는 사용자 고유의 id
	2. 한 사용자가 같은 social로 여러 번 회원가입 하지 못하게 하기 위함.

5. linked_at(created_at)
	1. 사용자가 처음으로 소셜 회원가입 한 시간

6. last_login_at
	1. 사용자가 마지막으로 로그인 한 시간.


## user_survey_answer
UNIQUE (user_id, question_code)
1. user_survey_answer_id(pk)

2. user_id(fk)
	1. 설문 응답에 대해서 누구의 설문 결과인지를 알기 위해.
3. question_code(VARCHAR + CHECK) (NEGOTIATION STYLE 등.....)

4. answer_code(VARCHAR + CHECK) (AGGRESSIVE, FLEXIBLE 등.. )
	1. 따로 question table이나 answer table을 만들어서 별도로 분리하려 했는데, 7개밖에 되지 않고 사용자 회원가입 시에만 처음 설정하는 것이어서, 사용성도 적어 별도의 테이블을 만들어서 분리하지 않았다.

## Items
1. item_id(pk)

2. user_id(fk)
	1.  누가 올렸는지 알아야 하기 때문

4. quantity (min = 1, max = 99)
	1. 수량을 세는 컬럼.
	2. INTEGER로 정의해서 1이상의 정수만 가능하도록.

6. title
	1. 물품 제목

7. content
	1. 물품 설명

8. item_state (VARCHAR + CHECK) (AVAILABLE, COMPLETED)
	1. 거래 상태는 값이 정해져있고, 
	2. 현재 정책상 거래 완료, 거래 가능 2개 밖에 없음

9. min_unit_price
10. max_unit_price
	1. ai가 이미지를 추출해서 자동으로 산정한 score 개념으로, 단위는 (원).

11. exchange_urgency_score (DEFAULT = 0.50)
	1. ai가 입력받는, 사용자가 물품을 입력할때 쓰는 "교환 희망 속도". 0~1 사이의 소수점 2자리까지 제공받기 때문에 NUMERIC(3,2) 으로 지정. 
12. value_gap_tolerance_score
	1. ai가 입력받는, 사용자가 허용할 물건의 가치 차이.


## item_stats
1. item_id (PK, FK)
	1. 복합키가 아닌, 단일 식별키 이므로 JPA에서도 문제없음.

2. view_count
	1. 초기에 item 테이블에 넣었다가 view와 like가 바뀔때마다, item 내부의 다른 컬럼들도 영향을 받기 때문에 분리했다.
3. like_count
	

## Exchange_requests
1. exchange_request_id(pk)
2. user id (교환 요청을 하는 구매자의 user_id) (FK)
	1.  누가 요청하는지 알아야 채팅 참여 인원의 역할을 알 수 있기 때문.

3. item_id (교환 요청을 받은 물품의 id) (FK)
	1. item_id를 알아야 item의 주인도 알고 채팅방 생성 가능.

4. requested_quantity (교환 요청 받을 대상의 수량을 정함)

5. requested_status (VARCHAR + CHECK) (PENDING, COMPLETED, REFUSED, CANCELED)
	1. 상태 관리를 하기 위해서..


## Exchange_request_items
1. exchange_request_items_id(pk)
2. exchange_request_id(fk)
	1. 어떤 요청에서 나온 물품인지 파악
3. item_id ( fk)
	1. 왜 이 둘을 fk로 두었느냐.
			1. 일단 JPA는 단일키를 기준으로 만들어진 라이브러리 이기 때문에 복합키 설정이 어려움.
			2. 복합키는 참조 할 때마다 그 둘을 항상 묶어주는 객체도 만들어줘야 하고,
			3. embedded나 idclass 같은거를 항상 만들어줘야 하기 때문에..
			4. 그리고 영속성 컨텍스트의 영향을 받을 수도 있음.

4. quantity
	1. 교환 요청에 제시하는 구매자의 물품 수량


## Images
1. image_id (pk)
2. item_id (fk) (NULL)
	1. null로 두어 report와 item을 구분하기 위함
	2. 둘 다 null이 될 수 없게 코드에서 관리 필요.
3. report_id (fk) (NULL)
	1. null로 두어 report와 item을 구분하기 위함
	2. 둘 다 null이 될 수 없게 코드에서 관리 필요.
4. image_url
	1. image_url을 저장해서 필요할 때 간편하게 꺼내기 위함.
	2. 실제 파일이 아니라 스토리지 URL 또는 파일 키를 저장함.


## Chat_rooms
UNIQUE(exchage_request_id)
1. chat_room_id (pk)

2. exchange_request_id (fk)
	1. 하나의 교환에는 하나의 채팅이 원칙이므로 UNIQUE 설정해줬다.

3. chat_room_status(VARCHAR + CHECK) (ACTIVE, CLOSED)
	1. 채팅방의 상태를 나타내기 위함.
	2. 기존에 서로 대화가 가능한 상태를 active,
	3. 판매자가 교환을 거절하면 비활성화 되므로 그때는 closed 로 관리

4. last_message_at
	1. 마지막으로 메시지가 오고 간 시간을 기록.


## Chat_members
UNIQUE(chat_room_i, user_id)
만약 퇴장 후 재입장을 허용한다면 soft deleted 때문에, 참여가 안될 수 있지만, 퇴장 후 재입장을 허용하지 않기 때문에 일반 UNIQUE로 두었다.

1. chat_members_id(PK)

2. chat_room_id(fk)
3. user_id(fk)

4. member_role (VARCHAR + CHECK) (REQUESTER, ITEM_OWNER)
	1. 채팅방에서 역할마다 기능이 다르기에, 사용자의 역할을 나누기 위해서 만들었다.

5. left_at
	1. 왜 만들었는가
		1. 채팅방 나가기 기능이 있으므로 만들었다. left_at 값이 채팅방을 나가지 않은 null 값이라면 아직 채팅에 참여 중이라는 상태고, 값이 생기면 채팅방을 나갔다는 뜻으로 해석 할 수 있기 때문에 넣었다.
	 2. 그럼 왜 Boolean으로 안두었냐?
		 1. boolean으로 두어 관리하면 시간을 알 수 없고 향후 관리자 로그에서 언제 나갔는지 알 수 있게 하기 위함. (참여 시간은 채팅방의 created_at 과 같음)


## Chat_messages

1. message_id(pk)
2. chat_room_id (fk)
3. user_id(fk) 
4. content
	1. 텍스트 내용
5. message_type (VARCHAR + CHECK) (TEXT, SYSTEM, EXCHANGE_CARD)
	1. 사용자가 보낸 text인지, 시스템 메시지 (system)인지, 교환 요청 카드인지(exchange) 구분하기 위함.

## Chat_member_read_states
UNIQUE(chat_member_id)
1. chat_member_read_states_id (pk)
2. chat_member_id (fk)
	1. chat_member에 참여한 채팅방의 정보와 참여자를 알 수 있기 때문에 chat_members의 테이블을 참조하는 fk가 있어야 한다.

3. message_id(fk)
	1. 마지막으로 읽은 메세지를 알기 위해서 fk로 마지막으로 읽은 message id를 참조한다.

4. last_read_at 
	1. 마지막으로 읽은 시간을 수정하는 칼럼, 마지막으로 읽은 메시지를 알고 안읽은 메시지등을 알려주기 위해서 만들었다.

chat_member에서 분리한 이유 : chat member의 나머지 값들은 cold column으로 잘 바뀌지 않는데, hot column인 last_read_at이 쓰기 락이나 postgre의 row version을 자주 업데이트 시켜 vacuum 부담이 증가 할 수 있기 때문에 분리 했다.
나중가서 redis pub/sub 이용해서 백그라운드 이동이나 채팅방 이탈 시 last_read_at을 수정하는 쿼리를 flush 하거나, 예외 사항을 대비한 일정 배치를 둬서 처리 할 수 있겠다. (추후 단계에서 기술은 살펴보며 이해 할 예정)

## Refresh_Tokens
UNIQUE(token_hash) : 겹칠일이 거의 없겠지만 혹시 모르니 DB단계에서 UNIQUE 걸기.

1. refresh token id (pk)
	1. 리프레시 토큰 식별자
2. user_id (fk)
	1. 누구의 refresh_token인지 알기 위해서 user 테이블에서 참조한 외래키
3. token_hash
	1. 토큰 원문이 아닌 해시값, 탈취 위험이 있어 해시로 암호화 후 저장
4. expires_at
	1. 토큰 만료 시간 저장


## Groups
UNIQUE (group_name)
1. group_id(pk)
	1. 그룹을 식별하기 위한 식별자
2. group_name
	1. 그룹의 이름
3. group_content
	1. 그룹의 설명을 보관
4. road_address
	1. 그룹의 도로명 주소를 저장
5. group_longtitude (NUMERIC (9, 6))
	1. 그룹의 경도를 저장, 사용자의 위치와 비교하기 위한 값
6. group_latitude (NUMERIC (9, 6))
	1. 그룹의 위도를 저장, 사용자의 위치와 비교하기 위한 값


## Group_items
UNIQUE(group_id, item_id)

1. group_item_id(pk)

2. group_id ( fk)
	1. 어디 그룹인지 알기 위해 Group 테이블에서 참조한 외래키
3. item_id ( fk)
	1. 그룹에 속한 물품의 id, 하나의 물품이 여러 그룹에 있을 수 있으므로 외래키.

## Group_members
1. group_members_id(PK)

2. group_id ( fk)
	1. 어디 그룹인지 알기 위해 Group 테이블에서 참조한 외래키
3. user_id ( fk)
	1. 한 사람이 최대 5개의 그룹에 가입 할 수 있기 때문에 만든 외래키.
4. location_verified_at
	1. 사용자가 인증을 완료 한 시간.
	2. 훗날 며칠/몇달 마다 인증을 갱신해야 한다 라는 정책을 위한 확장성 고려
5. left_at 
	1. 사용자 그룹 탈퇴 시간
	2. 훗날 문제가 생기거나 로그가 필요할 때 활용 하기 위함
	3. 그룹 탈퇴와 계정 탈퇴 분리
6. user_status
	1. 사용자 상태를 저장하기 위함
	2. 사용자가 그룹에 참여하고 있는지, 탈퇴한 회원인지에 대한 표시가 다르기 때문에 나타내야함

## item_likes
UNIQUE (user_id, Item_id)
1. item_like_id(pk)

2. user_id(fk)
3. ltem_id(fk)
	1. 사용자가 여러 물품에 대해서 좋아요를 누를 수 있고, 취소 할 수 있기 때문에 관리

왜 isLiked (boolean)을 두지 않았나 -> 삭제 할 이력과 기록을 남길 이유도 없을 뿐 더러,
행 삭제 시 좋아요 x , 행 추가 시 좋아요 o 형태의 post, delete로 판단하기 위함.
Hard deleted.

## Items_views
UNIQUE (user_id, item_id)
1. items_view_id(pk)
2. user_id(fk)
3. item_id(fk)
	1. likes와 마찬가지로 하나의 사람이 여러개의 물품을 조회하고 여러 사람이 여러개의 물품을 조회해도 데이터의 고유성과 무결성을 지키기 위함.
4. last_counted_at
	1. 마지막으로 본 시간과 현재 서버의 시간을 비교하여 24시간이 지났으면 view count를 하나 추가하고 값을 현재 시간으로 초기화 한다.


## Search_histories
1. search_history_id(pk)
	1. 검색 기록 식별자로 구분하기 위함
2. user_id(fk)
	1. 누가 검색을 했는지 참고 하기 위해서 users 테이블에서 외래키로 가져왔다.
3. keyword
	1. 검색한 기록어
4. last_searched_at
	1. 마지막으로 검색한 시간을 기록한다.
	2. 검색 기록의 정렬을 위해서 저장한다.


## Reports
1. report_id (pk)
	1. 신고 식별자 입니다.
2. reporter_user_id (fk)
	1. 신고를 한 사용자를 참조하는 외래키 입니다.
3. reported_user_id(fk)
	1. 신고 대상자를 가르키는 외래키 입니다.
	2. reported_item_id나, reported_chat_room_Id 에서 찾아서 낼 수도 있는데, 불필요한 join을 없애고, DB 저장 단계에서 신고자와 신고대상자를 명확하게 하기 위해서 추가 했습니다.
4. reported_item_id(fk) (NULL)
	1. 신고를 당한 물품을 참조
5. reported_chat_room_id (fk) (NULL)
	1. 신고를 당한 채팅방을 참조 
	2. image와 비슷하게 둘을 분리하기 위해 null을 허용했지만, 둘 다 null이 되어서는 안된다는 정책이나 비즈니스 검증 로직이 필요함.
6. content
	1. 신고 내용 

7. report_status (VARCHAR + CHECK) ('RECEIVED', 'RESOLVED')
	1. 신고 상태 관리





## Report_action
UNIQUE(report_id)
1. report_action_id(pk)
2. user_id (fk)
	1. 신고를 한 user_id가 아닌 신고를 처리한 관리자의 id
3. report_id(fk)
	1. 대상이 되는 신고의 id
4. action_type (VARCHAR + CHECK), (WARNING, SUSPENSION, DEACTIVATION, DISMISSED)
	1. 신고 조치 유형, varchar로 영구 정지, 며칠 제한, 경고, 반려를 표기
5. action_reason
	1. 신고 조치에 대한 이유 입니다.
6. action_started_at
	1. 조치 시작 기간
7. action_ended_at
	1. 조치가 끝나는 시간
8. warning_count_at_action
	1. 조치를 내릴 당시의 경고 스냅샷. 몇번의 경고 후에 이 조치가 취해졌는지 알 수 있다.


## inquiries
1. inquiry_id(pk)
	1. 문의 식별자
2. inquirer_user_id(fk)
	1. 문의를 한 user_id입니다.
3. admin_user_id(fk)
	1. 문의 처리를 한 admin의 user id로 
4. title
	1. 문의 제목
5. content
	1. 문의 내용
6. inquiry_status (VARCHAR + CHECK), (PENDING, COMPLETED)
	1. 문의 상태
7. answer
	1. 문의 답변 내용