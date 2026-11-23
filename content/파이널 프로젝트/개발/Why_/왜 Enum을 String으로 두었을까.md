사용자 User의 state나 role 같은 경우에도
EnumType을 String 으로 두었는데,
ORDINAL이 아닌, STRING 으로 사용하는 이유는

ORDINAL 같은 경우는 데이터들을 숫자로 관리하기 때문에 순서가 바뀌거나 하면 데이터 정합성이 깨진다.

**EX)** 

```java
public enum Userstatus{
   ACTIVE, //0
   INACTIVE, //1
   WITHDRAWN, //2
   DELETED //3
}

public enum Userstatus{ //값이 추가되면 ENUM이 하나 씩 밀려 데이터가 깨짐
   PENDING, //0
   ACTIVE, //1
   INACTIVE, //2
   WITHDRAWN, //3
   DELETED //4
}
```
ORDINAL을 두면, DB 데이터만 봐도 무슨 상태인지 알 수 없다 (숫자 0, 1, 2가 무엇을 의미하는지)

STRING으로 두면, enum 순서가 바뀌어도 안전하다, DB에 STRING 값으로 저장되어 가독성이 높다.

**단점으로는 약간의 저장 공간을 더 사용한다는 것.**
