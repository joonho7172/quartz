
```java
@Configuration
public class S3Config{
	@Bean(destroyedMethod = "close")
	S3Presigner S3presigner (
		@Value {S3 region = ...}){
		...}
		
	@Bean(destroyedMethod = "close")
	S3Client S3client(
		@Value {S3....
		}){
		}
}

```
로 시작하는 Spring 에서 제공하는 S3presigner 와 S3 client 가 있다.
위의 상위 모듈인 S3config가 Configuration 어노테이션을 사용하면서 나타나는 프록시 bean들을 선언하는 역할.
[[왜 S3Config는 proxyBeanMethods = false 를 사용할까]]
