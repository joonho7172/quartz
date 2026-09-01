
## Users
1. user_id (pk)
	1. 왜 auto_increment인가?
		1. 알아보기가 쉬움.
		2. 주요 서비스인 물건 등록, 요청에 관해서는 각각의 물품과 요청마다 회원 정보로 관리하기 때문에, 겹칠 일이 없어 무분별한 API의 요청 방어에 UUID의 장점이 없음.

2. created_at, updated_at
	1. 왜 만들었나
		1. 생성 시점을 알아야 신규 회원의 통계를 낼 수 있으며,
		2. 데이터 변경 이력을 추적할 수 있으며
		3. 탈퇴 or 휴면 정책이 추가될 수 있다.

3. profile_image_url
	1. 왜 만들었나
		1. 카카오 로그인 api에서 사용자의 id만 알면 프로필 사진은 가져올 수 있음. (동의 한다는 가정하에)
		2. 그치만 따로 profile_image_url을 만들어 놓으면 DB에서 가져와서 바로바로 이미지 출력이 가능함.

4. kakao_user_id (UNIQUE)
	1. 왜 만들었나
		1. 중복 로그인을 허용하지 않게 하기 위해서라도 고유 id를 저장해야한다.
		2. 사용자의 카카오 계정을 식별 할 수 있는 유일한 정보

5. nickname
	1. 왜 만들었냐
		1. 서비스 이용에 있어서 기본이 되는 사용자 이름.
		2. 사용자 프로필 처럼 굳이 api 호출해서 가져오는 것보다 db에 별도로 저장해서 필요할 때마다 쓰기 위함.


## Items
1. item_id(pk)
	1. ""

2. user_id(fk)
	1. 왜 만들었냐
		1. 누가 올렸는지 알아야 하기 때문,,

3. created_at

4. updated_at

5. quantity (min = 1, max = 99)
	1. 왜 만들었냐
		1. 수량을 세는 컬럼.
		2. INTEGER로 정의해서 1이상의 정수만 가능하도록.

6. title
	1. 

7. content

8. item_state  (default = available, completed)
	1. 왜 enum으로 두었냐
		1. 거래 상태는 값이 완벽하게 정해져있고, 
		2. 현재 정책상 거래 완료, 거래 가능 2개 밖에 없기 때문에 ENUM으로도 충분하다고 판단
9. like count
10. view count


## Items_Image
1. item_image_id (pk)
2. item_id (fk)
3. user_id (fk)
4. image_url
	1. 왜 만들었냐
		1. image_url을 저장해서 필요할 때 간편하게 꺼내기 위함.

5. created_at
	1. 왜 만들었냐
		1. 오래된 이미지나 고아 파일 정리, 
		2. 이미지 관련 오류 추적.


## Chat_rooms
1. chat_room_id (pk)

2. exchange_request_id (fk)

3. user_id (fk)

4. chat_room_status(default = active, closed)
	1. 채팅방의 상태를 나타내기 위함.
	2. 기존에 서로 대화가 가능한 상태를 active,
	3. 판매자가 교환을 거절하면 비활성화 되므로 그때는 closed 로 관리

## Chat_members
1. chat_room_id(pk, fk)
2. user_id(pk, fk)
3. member_role (default = buyer, seller)
	1. 왜 만들었는가
		1. 채팅방에서 역할마다 기능이 다르기에, 사용자의 역할을 나누기 위해서 만들었다.

4. last_read_at
	1. 왜 만들었는가
		1. 사용자가 어떤 채팅방을 언제 읽었는지 표시하고 해당 채팅방의 메시지의 send_at을 비교해 읽지 않은 메시지를 표시한다던지 하기 위해서 만들었다.

5. left_at
	1. 왜 만들었는가
		1. 채팅방 나가기 기능이 있으므로 만들었다. left_at 값이 채팅방을 나가지 않은 null 값이라면 아직 채팅에 참여 중이라는 상태고, 값이 생기면 채팅방을 나갔다는 뜻으로 해석 할 수 있기 때문에 넣었다.
	 2. 그럼 왜 Boolean으로 안두었냐?
		 1. boolean으로 두어 관리하면 시간을 알 수 없고 향후 관리자 로그에서 언제 나갔는지 알 수 있게 하기 위함. (참여 시간은 채팅방의 created_at 과 같음)


## Chat_messages

1. message_id(pk)
2. chat_room_id(pk, fk)
3. user_id(pk, fk)
4. content
5. send_at
	1. 왜 만들었냐
		1. 보낸 시간 기록, 표기하기 위함, 사용자가 마지막으로 읽은 시간과 비교하기 위함

6. message_type (default = text)
	1. 왜 만들었냐
		1. 사용자가 보낸 text인지, 시스템 메시지 (system)인지, 교환 요청 카드인지(exchange) 구분하기 위함.


## Exchange_request_items
1. exchange_request_id(pk, fk)
2. item_id (pk, fk)
	1. 왜 이 둘을 기본키 pk로 두었느냐.
		1. 중복을 막기 위해서, 결국 요청 아이템이라는것은, 요청 대상이 있고 등록된 item이기 때문에 식별 관계 복합키로 두었다.
			1. unique로 둬도 되지 않나?
				1. 맞는 말이긴한데 기본키로 설정하는게 더 간단함. unique로 두면 확인해야하잔음

3. quantity
	1. 왜 만들었냐.
		1. 수량 등록하려고


## Exchange_request
1. exchange_request_id(pk)
2. user id (교환 요청을 하는 구매자의 id)
	1. 왜 만들었냐
		1. 누가 요청하는지 알아야 채팅 참여 인원의 역할을 알 수 있기 때문.

3. item_id (교환 요청을 받은 물품의 id)
	1. 왜 만들었냐
		1. item_id를 알아야 item의 주인도 알고 채팅방 생성 가능.

4. requested_quantity (교환 요청 받을 대상의 수량을 정함)

5. created_at
6. updated_at (교환이 수정되던, 취소되던, 완료되던, 거절되던 시간을 기록)
7. requested_status (default = pending)
	1. 왜 만들었냐
		1. 상태 관리를 하기 위해서..


## Refresh _Tokens
1. refresh token id (pk)
	1. 리프레시 토큰 식별자
2. user_id (fk)
	1. 누구의 refresh_token인지 알기 위해서 user 테이블에서 참조한 외래키
3. token_hash
	1. 토큰 원문이 아닌 해시값, 탈취 위험이 있어 해시로 암호화 후 저장
4. expires_at
	1. 토큰 만료 시간 저장
5. created_at
	1. 시간을 비교하기 위한 토큰 생성 시간
6. revoked_at
	1. 로그아웃 등 토큰이 폐기된 시간.


## Group
1. group_id(pk)
	1. 그룹을 식별하기 위한 식별자
2. group_name
	1. 그룹의 이름
3. group_content
	1. 그룹의 설명을 보관
4. region_code
	1. 그룹의 도로명 주소(우편번호)를 저장
5. group_longtitude
	1. 그룹의 경도를 저장, 사용자의 위치와 비교하기 위한 값
	2. 그룹의 위도를 저장, 사용자의 위치와 비교하기 위한 값
6. created_at
	1. 그룹 생성 시간. 나중에 문제가 생겼을때 로그 확인하기 위함.


## Group_items
1. group_id (pk, fk)
	1. 어디 그룹인지 알기 위해 Group 테이블에서 참조한 복합키
2. item_id (pk, fk)
	1. 그룹에 속한 물품의 id, 하나의 물품이 여러 그룹에 있을 수 있으므로 복합키.
3. created_at
	1. 그룹에 물품이 등록된 시간. 나중에 물품이 등록된 시간과 정합성을 맞춰 볼 수도 있음.

## Group members
1. group_id (pk, fk)
	1. 어디 그룹인지 알기 위해 Group 테이블에서 참조한 복합키
2. user_id (pk, fk)
	1. 한 사람이 최대 5개의 그룹에 가입 할 수 있기 때문에 만든 복합키.
3. location_verified_at
	1. 사용자가 인증을 완료 한 시간.
	2. 훗날 며칠/몇달 마다 인증을 갱신해야 한다 라는 정책을 위한 확장성 고려
4. left_at (default = null)
	1. 사용자 그룹 탈퇴 시간
	2. 훗날 문제가 생기거나 로그가 필요할 때 활용 하기 위함.
5. user_status
	1. 사용자 상태를 저장하기 위함
	2. 사용자가 그룹에 참여하고 있는지, 탈퇴한 회원인지에 대한 표시가 다르기 때문에 나타내야함
6. created_at
	1. 사용자 가입 시간, 로그 확인 용


## item_likes
1. user_id(pk, fk)
2. ltem_id(pk, fk)
	1. 사용자가 여러 물품에 대해서 좋아요를 누를 수 있고, 취소 할 수 있기 때문에 관리
3. created_at 
	1. 좋아요를 누른 시간을 남겨 로그 관리하기 위함

왜 isLiked (boolean)을 두지 않았나 -> 삭제 할 이력과 기록을 남길 이유도 없을 뿐 더러,
행 삭제 시 좋아요 x , 행 추가 시 좋아요 o 형태의 post, delete로 판단하기 위함.

## Items_views
1. user_id(pk, fk)
2. item_id(pk, fk)
	1. likes와 마찬가지로 하나의 사람이 여러개의 물품을 조회하고 여러 사람이 여러개의 물품을 조회해도 데이터의 고유성과 무결성을 지키기 위함.
3. last_counted_at
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
5. created_at
	1. 로그 확인 용 created_at

