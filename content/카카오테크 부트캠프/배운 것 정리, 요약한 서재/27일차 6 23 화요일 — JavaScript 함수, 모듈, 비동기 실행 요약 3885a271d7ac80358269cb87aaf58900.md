# 27일차 6/23 화요일 — JavaScript 함수, 모듈, 비동기 실행 요약

---

## 1. 콜백 함수

**콜백 함수**는 다른 함수의 인자로 전달되어, 나중에 특정 시점에 호출되는 함수이다.

```jsx
setTimeout(function () {
  console.log("3초 뒤 실행");
}, 3000);
```

여기서 `function () { ... }` 이 콜백 함수이다.

중요한 점은 **단순히 함수가 인자로 넘어갔다고 끝이 아니라, 넘겨받은 쪽이 나중에 다시 호출한다는 개념**이 핵심이다.

콜백은 이벤트 처리, 비동기 처리, 배열 메서드에서 자주 사용된다.

```jsx
[1, 2, 3].forEach(function (num) {
  console.log(num);
});
```

---

## 2. 익명 함수

**익명 함수**는 이름이 없는 함수이다.

```jsx
function () {
  console.log("익명 함수");
}
```

보통 단독으로 쓰기보다는 콜백이나 함수 표현식으로 사용된다.

```jsx
const hello = function () {
  console.log("hello");
};
```

또는 화살표 함수도 익명 함수처럼 많이 사용된다.

```jsx
const hello = () => {
  console.log("hello");
};
```

익명 함수를 사용하는 이유는 보통 **한 번만 쓰는 임시 함수에 굳이 이름을 붙이지 않아도 되기 때문**이다.

예를 들어 버튼 클릭 이벤트, `setTimeout`, 배열 순회 같은 곳에서 자주 사용된다.

```jsx
button.addEventListener("click", function () {
  console.log("클릭됨");
});
```

다만 익명 함수에는 단점도 있다. 대표적으로 이벤트 리스너를 제거할 때 문제가 생긴다.

```jsx
button.addEventListener("click", function () {
  console.log("클릭");
});

button.removeEventListener("click", function () {
  console.log("클릭");
});
```

위 코드는 제거되지 않는다. 내용은 같아 보여도 **서로 다른 함수 객체**이기 때문이다.

제거하려면 같은 함수 참조를 넘겨야 한다.

```jsx
function handleClick() {
  console.log("클릭");
}

button.addEventListener("click", handleClick);
button.removeEventListener("click", handleClick);
```

즉, 익명 함수는 편하지만 **나중에 다시 참조해야 하는 함수라면 이름을 붙이거나 변수에 담아야 한다.**

---

## 3. 즉시 실행 함수, IIFE

**즉시 실행 함수, IIFE**는 정의되자마자 바로 실행되는 함수이다.

```jsx
(function () {
  const config = "내부 설정값";
  console.log(config);
})();
```

마지막의 `()`가 함수를 즉시 실행한다는 의미이다.

IIFE의 핵심 목적은 **스코프를 만들어 전역 오염을 막는 것**이다.

```jsx
(function () {
  const name = "junho";
})();

console.log(name); // 에러
```

IIFE 내부에서 선언한 변수는 외부에서 접근할 수 없다. 예전에는 `var`가 함수 스코프만 가졌기 때문에, 전역 변수 오염을 막기 위해 IIFE를 많이 사용했다.

요즘은 `let`, `const`, 블록 스코프, ESM 모듈 시스템이 있기 때문에 예전만큼 자주 쓰지는 않는다.

```jsx
{
  const name = "junho";
}
```

그래도 한 번만 실행되는 초기화 코드, 클로저를 이용한 은닉 처리, 라이브러리 코드에서는 여전히 볼 수 있다.

정리하면 IIFE는 **한 번 실행되고 끝나는 함수 표현식이며, 가장 중요한 가치는 독립된 스코프를 만드는 것**이다.

---

## 4. 모듈 시스템

**모듈**은 코드를 파일 단위로 나누어 관리하는 방식이다.

예를 들어 `user.js`, `cart.js`, `math.js` 같은 파일 하나하나가 모듈이 될 수 있다.

모듈을 사용하는 이유는 다음과 같다.

- 코드를 역할별로 분리할 수 있다.
- 전역 스코프 오염을 막을 수 있다.
- 유지보수와 테스트가 쉬워진다.
- 필요한 코드만 가져와 재사용할 수 있다.
- 번들러가 사용하지 않는 코드를 제거하기 쉬워진다.

JavaScript의 대표적인 모듈 방식은 **CJS**와 **ESM**이다.

---

## 5. CJS, CommonJS

CJS는 Node.js에서 오래 사용된 모듈 방식이다.

내보낼 때는 `module.exports`, 가져올 때는 `require()`를 사용한다.

```jsx
// math.js
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
```

```jsx
// app.js
const math = require("./math.js");

console.log(math.add(10, 5));
```

CJS의 특징은 **동기적이고 동적**이라는 것이다.

동기적이라는 것은 `require()`를 만나는 순간 해당 파일을 읽고 실행한 뒤 결과를 가져올 때까지 기다린다는 뜻이다.

동적이라는 것은 `require()`가 함수 호출이기 때문에 조건문 안에서도 사용할 수 있다는 뜻이다.

```jsx
if (isAdmin) {
  const admin = require("./admin.js");
}
```

이런 유연성은 장점이지만, 번들러 입장에서는 실행 전까지 어떤 모듈이 필요한지 파악하기 어렵다. 그래서 트리 셰이킹에는 불리하다.

단, “CJS는 무조건 값 복사”라고 외우면 부정확하다. CJS는 `exports` 객체를 넘기고 캐싱한다. 다만 ESM처럼 언어 차원의 라이브 바인딩 구조는 아니다.

---

## 6. ESM, ES Module

ESM은 JavaScript 표준 모듈 시스템이다. 프론트엔드에서는 React, Vue 같은 프로젝트에서 기본적으로 사용한다.

내보낼 때는 `export`, 가져올 때는 `import`를 사용한다.

```jsx
// counter.js
export let count = 0;

export function increment() {
  count++;
}
```

```jsx
// app.js
import { count, increment } from "./counter.js";

increment();
console.log(count); // 1
```

ESM의 중요한 특징은 **정적 구조**와 **라이브 바인딩**이다.

정적 구조란 코드를 실행하지 않아도 어떤 모듈에서 무엇을 가져오는지 파악할 수 있다는 뜻이다.

```jsx
import { add } from "./math.js";
```

이런 `import` 문은 보통 파일 최상단에 작성하며, 조건문 안에 넣을 수 없다.

```jsx
if (true) {
  import { add } from "./math.js"; // 일반 static import는 이렇게 못 씀
}
```

단, 동적으로 가져오고 싶을 때는 `import()`를 사용할 수 있다.

```jsx
const math = await import("./math.js");
```

라이브 바인딩은 가져온 값이 원본 모듈의 값과 연결되어 있다는 뜻이다. 그래서 원본 모듈에서 값이 바뀌면 import한 쪽에서도 변경된 값을 볼 수 있다.

다만 import한 값을 가져온 쪽에서 직접 재할당할 수는 없다.

```jsx
import { count } from "./counter.js";

count = 10; // 에러
```

---

## 7. Named Export와 Default Export

**Named Export**는 여러 값을 각각 이름을 붙여 내보내는 방식이다.

```jsx
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}
```

```jsx
import { add, subtract } from "./math.js";
```

Named Export는 가져올 때 이름이 맞아야 한다.

반면 **Default Export**는 모듈에서 기본값 하나를 내보내는 방식이다.

```jsx
export default {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};
```

```jsx
import math from "./math.js";

console.log(math.add(10, 5));
```

Default Export는 가져오는 쪽에서 이름을 자유롭게 정할 수 있다.

---

## 8. Tree Shaking

**Tree Shaking**은 사용하지 않는 코드를 최종 번들에서 제거하는 최적화 작업이다.

ESM은 import/export 구조가 정적이기 때문에 번들러가 어떤 코드가 사용되는지 분석하기 쉽다.

```jsx
import { add } from "./math.js";
```

위 코드에서 `add`만 사용하고 `subtract`를 사용하지 않는다면, 번들러가 `subtract`를 제거할 수 있다.

CJS는 `require()`가 동적으로 실행될 수 있기 때문에 분석이 어렵다.

```jsx
const math = require(condition ? "./a.js" : "./b.js");
```

그래서 트리 셰이킹은 CJS보다 ESM에서 훨씬 효과적으로 동작한다.

정확히는 “트리 셰이킹은 ESM에서만 가능하다”보다는, **ESM에서 가장 안정적이고 효과적으로 가능하다**고 이해하는 것이 좋다.

---

## 9. 블로킹 / 논블로킹

블로킹과 논블로킹의 핵심은 **제어권을 돌려주느냐**이다.

**블로킹**은 작업이 끝날 때까지 호출한 쪽이 멈춰 있는 방식이다.

```jsx
const result = heavyWork();
// heavyWork가 끝날 때까지 다음 코드 실행 불가
```

즉, 작업이 끝나기 전까지 제어권이 돌아오지 않는다.

반대로 **논블로킹**은 작업이 끝나지 않아도 일단 제어권을 돌려주는 방식이다.

```jsx
setTimeout(() => {
  console.log("나중에 실행");
}, 1000);

console.log("먼저 실행");
```

`setTimeout`은 타이머가 끝날 때까지 콜스택을 붙잡지 않는다. 그래서 다음 코드가 먼저 실행된다.

정리하면 블로킹/논블로킹은 **상대 작업 때문에 현재 실행 흐름이 멈추는가**를 보는 개념이다.

---

## 10. 동기 / 비동기

동기와 비동기의 핵심은 **결과를 언제 받느냐**이다.

**동기**는 작업을 요청한 뒤 결과가 나올 때까지 순서대로 기다리는 방식이다.

```jsx
const result = add(1, 2);
console.log(result);
```

`add`의 결과를 받은 뒤 다음 코드가 실행된다.

**비동기**는 작업을 요청해두고, 결과는 나중에 콜백, Promise, 이벤트 등을 통해 받는 방식이다.

```jsx
fetch("/users")
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  });

console.log("요청 후 바로 실행");
```

즉, 비동기는 작업 완료를 그 자리에서 기다리지 않고, 완료되면 나중에 결과를 처리한다.

---

## 11. 블로킹과 동기는 다르다

블로킹/논블로킹은 **제어권 관점**이다.

동기/비동기는 **결과 처리 관점**이다.

헷갈리기 쉬운 이유는 둘 다 “기다린다”는 느낌이 있기 때문이다.

하지만 차이가 있다.

**블로킹**은 호출한 쪽이 멈춰버리는 것이다.

**동기**는 결과를 순서대로 받는 것이다.

일반적으로 많이 쓰이는 조합은 다음 두 가지이다.

```
동기 + 블로킹
비동기 + 논블로킹
```

하지만 “동기 + 논블로킹”이 완전히 말이 안 되는 것은 아니다. 예를 들어 작업은 안 막히게 요청해두고, 결과가 나왔는지 계속 확인하는 polling 방식은 동기 논블로킹에 가깝다.

다만 실무에서 JavaScript를 배울 때는 보통 **동기/블로킹**, **비동기/논블로킹** 조합을 중심으로 이해하면 된다.

---

## 12. JavaScript는 싱글 스레드인데 비동기가 가능한 이유

JavaScript 엔진은 기본적으로 한 번에 하나의 콜스택만 처리한다. 즉, JavaScript 코드 실행 자체는 싱글 스레드이다.

하지만 브라우저나 Node.js 환경은 JavaScript 엔진 외부에 여러 기능을 제공한다.

브라우저에서는 대표적으로 다음 기능들이 있다.

- Timer API
- DOM Event
- Fetch / AJAX
- Web API

예를 들어 `setTimeout`을 실행하면 타이머 작업은 콜스택에서 계속 기다리는 것이 아니라 브라우저의 Web API 영역으로 넘어간다.

```jsx
console.log("1");

setTimeout(() => {
  console.log("2");
}, 1000);

console.log("3");
```

실행 결과는 다음과 같다.

```
1
3
2
```

이유는 `setTimeout`의 콜백이 바로 실행되는 것이 아니라, 타이머가 끝난 뒤 큐에 들어가고, 콜스택이 비었을 때 이벤트 루프가 꺼내 실행하기 때문이다.

---

## 13. 콜스택, Web API, 태스크 큐, 이벤트 루프

**콜스택**은 현재 실행 중인 함수들이 쌓이는 공간이다.

```jsx
function a() {
  b();
}

function b() {
  console.log("b");
}

a();
```

`a()`가 콜스택에 올라가고, 그 안에서 `b()`가 다시 올라간다. 실행이 끝나면 하나씩 빠진다.

**Web API**는 브라우저가 제공하는 비동기 기능이다. `setTimeout`, DOM 이벤트, fetch 같은 작업이 여기에 맡겨진다.

**태스크 큐**는 Web API에서 완료된 콜백이 대기하는 줄이다.

**이벤트 루프**는 콜스택과 큐를 계속 확인하다가, 콜스택이 비면 큐에서 콜백을 꺼내 콜스택으로 올린다.

중요한 점은 **콜백은 콜스택이 비어야 실행된다**는 것이다.

---

## 14. 마이크로태스크 큐와 매크로태스크 큐

JavaScript의 비동기 큐는 크게 두 종류로 볼 수 있다.

**매크로태스크 큐**에는 보통 다음 작업들이 들어간다.

```
setTimeout
setInterval
DOM event
```

**마이크로태스크 큐**에는 보통 다음 작업들이 들어간다.

```
Promise.then
queueMicrotask
MutationObserver
```

마이크로태스크 큐는 매크로태스크 큐보다 우선순위가 높다.

```jsx
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

console.log("4");
```

실행 결과는 다음과 같다.

```
1
4
3
2
```

이유는 동기 코드가 먼저 실행되고, 그다음 마이크로태스크인 `Promise.then`이 실행되고, 마지막으로 매크로태스크인 `setTimeout`이 실행되기 때문이다.

정확히 말하면 이벤트 루프는 현재 실행 중인 작업이 끝나고 콜스택이 비면, 다음 매크로태스크로 넘어가기 전에 마이크로태스크 큐를 먼저 비운다.

---

## 최종 핵심 정리

콜백은 다른 함수에 인자로 전달되어 나중에 호출되는 함수이다. 익명 함수는 이름이 없는 함수이며, 일회성 콜백이나 이벤트 핸들러에서 자주 사용된다. 하지만 나중에 다시 제거하거나 재사용해야 하는 함수라면 같은 참조가 필요하므로 이름을 붙이거나 변수에 담아야 한다.

즉시 실행 함수, IIFE는 정의되자마자 한 번 실행되는 함수 표현식이다. 핵심 목적은 독립된 함수 스코프를 만들어 전역 변수 오염을 막는 것이다. 요즘은 `let`, `const`, 블록 스코프, ESM 모듈 덕분에 사용 빈도는 줄었지만 개념적으로는 여전히 중요하다.

모듈은 코드를 파일 단위로 분리해 재사용성, 유지보수성, 테스트 용이성을 높이는 구조이다. CJS는 `require`와 `module.exports`를 사용하며 동기적이고 동적인 특징이 있다. ESM은 `import`와 `export`를 사용하며 정적 구조와 라이브 바인딩을 가진다. 트리 셰이킹은 정적 분석이 쉬운 ESM에서 특히 효과적이다.

블로킹/논블로킹은 제어권을 돌려주는지의 관점이고, 동기/비동기는 결과를 언제 어떤 방식으로 받는지의 관점이다. 블로킹은 작업이 끝날 때까지 흐름이 멈추는 것이고, 논블로킹은 작업이 끝나지 않아도 제어권이 돌아오는 것이다. 동기는 결과를 순서대로 기다리는 방식이고, 비동기는 결과를 나중에 콜백, Promise, 이벤트 등으로 처리하는 방식이다.

JavaScript는 한 번에 하나의 콜스택만 처리하는 싱글 스레드 언어지만, 브라우저나 Node.js 환경이 제공하는 비동기 API 덕분에 비동기 처리가 가능하다. Web API가 오래 걸리는 작업을 맡고, 완료된 콜백은 큐에 들어간다. 이벤트 루프는 콜스택이 비었을 때 큐에서 작업을 꺼내 실행한다. 이때 마이크로태스크 큐는 매크로태스크 큐보다 먼저 처리된다.