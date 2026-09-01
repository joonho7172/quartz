
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
		2. 
