dto를 구성하던 중
```java
public record UserPreferenceResponse(Long userPreferenceId, List<Answer> answers, LocalDateTime createdAt){
	public static UserPreferenceResponse from (UserPreference preference){ //이 부분
	
		return... 
	}

}
```
으로 되던 곳이 있다. response dto에서 왜 entity값을 그대로 from해서 가져오나 .. 싶었는데
이유는 꽤나 단순 했다.

1. 어떤 객체에서 dto를 만드는지 명확화 하기 위함 
	1. 위와 같은 경우는 UserPreference 라는 ENtity에서 dto를 생성 할 것이라는 뜻.
2. 여러 필드 매핑 로직을 한곳에 모을 수 있음.
	1. 별도로 불필요하게 필드를 선언하고 가져올 필요가 없다.
3. 서비스가 내부의 세부 변경 사항을 몰라도 됨
	1. Entity 수정이 곧 dto 수정이 되기에 객체지향과도 어울린다. 


이런 장점이 있으니 단점도 있다.
1. 코드 흐름이 숨겨진다
	1. 원래의 new User....가 UserProfile.from(user)... 식으로 숨겨진다.

2. dTO가 Entity에 강하게 결합된다.
	1. 이것은 장점 1번과의 trade off 기도 하다.


즉, 단순한 변환에는 불필요한 [[보일러 플레이트]] 일 수 있다.