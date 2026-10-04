중요한 점은 현재 키가 `images/{userId}/{uuid}` 형태라서 `images/` 전체에 Lifecycle 삭제 규칙을 걸면 정상 등록된 이미지까지 삭제될 수 있다는 것입니다. `images/pending/`와 `images/permanent/`처럼 prefix를 분리하거나 `pending` 태그를 사용해야 합니다. S3 Lifecycle은 prefix·tag 기준으로 객체를 필터링할 수 있습니다. ([AWS Lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html))



![[Pasted image 20260923125930.png]]

## 기본안에서 백엔드가 맡을 일

- `POST /images/presigned-url`에서 S3 업로드 URL과 `objectKey`를 발급하고, 업로드 객체에 `pending=true` 태그를 붙이도록 서명합니다. 프런트는 업로드 후 `objectKey`를 보관합니다.
- 프런트의 분석 요청을 받으면 백엔드가 `objectKey`의 소유권과 S3 존재 여부를 확인하고, **조회용 presigned URL만** AI 서버에 `{"imageUrl":"..."}` 형태로 전달합니다. AI에는 `objectKey`를 보내지 않습니다. AI 응답은 그대로 프런트에 돌려주며, 분석 결과가 실패를 나타내는 정상 응답도 백엔드가 해석하지 않습니다.
- AI 서버 통신에 실패하면 오류를 반환하고 S3 객체는 유지합니다. 프런트는 같은 `objectKey`로 재시도할 수 있습니다.
- 사용자가 등록을 누르면 `POST /items`가 `imageIds` 대신 `objectKeys`를 받습니다. 모든 키의 소유권과 S3 객체 존재를 확인한 뒤 `Image`와 `Item`을 함께 저장하고, 등록된 객체는 `pending` Lifecycle 대상에서 제외합니다. 하나라도 검증에 실패하면 전체 등록을 거부합니다.
- 취소 요청이 오면 S3에서 즉시 삭제를 시도합니다. 앱이 종료되어 취소 요청이 없을 때를 대비해, 버킷에는 `pending=true` 객체를 1일 후 만료하는 Lifecycle 규칙이 필요합니다. 현재 저장소에는 이 버킷 설정을 적용할 IaC가 없습니다.
- 물품 수정 API는 기존 `imageIds` 흐름을 유지합니다. AI endpoint 전체 URL은 `AI_IMAGE_ANALYSIS_URL` 환경 설정으로 둡니다.

![[Pasted image 20260923151556.png]]


presignded