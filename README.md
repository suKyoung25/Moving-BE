[**한국어**](/README.md) | [English](/docs/en/README.md) | [简体字](/docs/zh/README.md)

<img width="3212" height="1793" alt="리드미표지" src="https://github.com/user-attachments/assets/7515348e-4e38-42c9-a7c3-96c45524a490" />

## 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
- [상세 기능](#상세-기능)
- [성능 최적화](#성능-최적화)
- [팀원 구성 및 담당 작업](#팀원-구성-및-담당-작업)
- [트러블 슈팅](#트러블-슈팅)
- [백엔드 폴더 구조](#백엔드-폴더-구조)

## 개요

> Moving은 사용자가 손쉽게 여러 기사님의 견적을 비교하고, 자신에게 가장 적합한 전문가를 선택할 수 있도록 돕는 스마트 이사 비교 플랫폼입니다. 기존의 복잡하고 불투명했던 이사 견적 과정을 간소화하여, 사용자가 원하는 조건(이사 유형, 지역, 일정 등)에 맞는 전문가를 빠르게 찾을 수 있습니다. 또한 기사님 입장에서도 효율적인 고객 매칭이 가능해, 투명한 거래 환경과 편리한 서비스 경험을 제공합니다.
>
> 프로젝트 기간: 2025.07.01 ~ 2025.08.18 <br />


- [프론트엔드 레포지토리](https://github.com/az0319h/6th-Moving-4Team-FE)
- [FE 배포 사이트](https://moving-web.site/ko)
- [BE 배포 사이트](https://api.moving-web.site/)
- [Swagger API](https://api.moving-web.site/docs/)


## 주요 기능

<table>
  <thead>
    <tr>
      <th align="center">랜딩 및 문의하기</th>
      <th align="center">기사님 찾기</th>
      <th align="center">프로필 등록</th>
      <th align="center">견적 요청</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/a7dc306f-fd4a-49a5-a78c-88b7523cf19b" alt="랜딩 및 문의하기" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/77e85b0f-6da1-4ffb-8e18-e5e86ca4c0b1" alt="기사님 찾기" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/6ff5b0ac-916e-4657-b865-1cf31c72daaf" alt="프로필 등록" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/6ae0fa3a-43b6-4fd5-b5f0-4363d3be046b" alt="견적 요청" width="200">
      </td>
    </tr>
  </tbody>
</table>
<table>
  <thead>
    <tr>
      <th align="center">리뷰 작성</th>
      <th align="center">견적 계산기</th>
      <th align="center">실시간 채팅</th>
      <th align="center">커뮤니티</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/07c810ea-87c8-4b07-a80a-e16b3fcfd602" alt="리뷰 작성" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/97374679-cf21-487b-ac21-29191689936a" alt="견적 계산기" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/c3a96807-55bf-4328-9b05-549f6e6f2f39" alt="실시간 채팅" width="200">
      </td>
      <td align="center">
        <img src="https://github.com/user-attachments/assets/8ff7abca-d4e5-4fca-8a39-5431a0587e2a" alt="커뮤니티" width="200">
      </td>
    </tr>
  </tbody>
</table>

## 시스템 아키텍처
<img width="3212" height="2023" alt="fa68b90569ee2253" src="https://github.com/user-attachments/assets/b271e73e-7096-412c-8cfa-a7b8318607f2" />

## 기술 스택

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black)
![RDS](https://img.shields.io/badge/AWS_RDS-527FFF?style=flat-square&logo=amazon-rds&logoColor=white)
![S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=amazon-s3&logoColor=white)

### Libraries
![date-fns](https://img.shields.io/badge/date--fns-770C56?style=flat-square&logo=date-fns&logoColor=white)
![react-icons](https://img.shields.io/badge/react--icons-E91E63?style=flat-square&logo=react&logoColor=white)
![react-hook-form](https://img.shields.io/badge/react--hook--form-EC5990?style=flat-square&logo=reacthookform&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white)
![Cookie-Parser](https://img.shields.io/badge/Cookie--Parser-8A2BE2?style=flat-square&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-00BFFF?style=flat-square&logo=lock&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Passport.js](https://img.shields.io/badge/Passport.js-34E27A?style=flat-square&logo=passport&logoColor=white)

### Hosting & Deployment
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white)
![EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat-square&logo=amazon-ec2&logoColor=white)
![Route 53](https://img.shields.io/badge/Route_53-8C4FFF?style=flat-square&logo=amazon-route-53&logoColor=white)

### CI/CD
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

### Etc
![Sentry](https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white)
![DeepL](https://img.shields.io/badge/DeepL-0F2B46?style=flat-square&logo=deepl&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)

## 상세 기능
- **기사님 찾기**: 위치, 서비스 유형, 평점 기반 필터링 및 정렬
- **소셜 로그인**: Google, Kakao, Naver 소셜 로그인 지원
- **프로필**: 개인 정보, 이사 유형, 지역 정보 관리
- **견적 요청**: 채팅 형태의 견적 요청 시스템
- **견적 관리**: 받은 견적 확인, 승인/거절, 진행 상황 추적
- **찜하기**: 선호하는 기사님 저장 및 관리
- **리뷰**: 이사 완료 후 리뷰 작성 및 평점 조회
- **다국어 지원**: 한국어(기본), 영어, 중국어 완전 지원
- **실시간 알림**: SSE 기반 실시간 알림 시스템
- **커뮤니티**: 사용자 간 소통 및 정보 공유 공간
- **고객 지원**: 문의사항 접수 및 파일 업로드 지원
- **실시간 채팅**: Firebase 기반 고객과 기사의 실시간 채팅 기능
- **견적 계산기**: 기본 견적 및 OpenAI GPT-4 기반 견적 계산 시스템

## 성능 최적화

- **Next.js App Router** 기반 서버 컴포넌트
- **React Suspense** 및 **lazy loading**
- **TanStack Query** 캐싱 전략
- **이미지 최적화** (Next.js Image 컴포넌트)
- **코드 스플리팅** 및 **번들 최적화**

## 팀원 구성 및 담당 작업

<table align="center">
  <tbody>
    <tr>
      <th>팀장</th>
      <th>팀원</th>
      <th>팀원</th>
      <th>팀원</th>
      <th>팀원</th>
      <th>팀원</th>
      <th>팀원</th>
    </tr>
    <tr>
      <td align="center">
        <a href="https://github.com/az0319h">
          <img src="https://github.com/az0319h.png?size=100" width="100px" alt="홍성훈"/>
          <br />
          <b>홍성훈</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/fiivxyxxng">
          <img src="https://github.com/fiivxyxxng.png?size=100" width="100px" alt="오하영"/>
          <br />
          <b>오하영</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/writing-sky">
          <img src="https://github.com/writing-sky.png?size=100" width="100px" alt="양성경"/>
          <br />
          <b>양성경</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/suKyoung25">
          <img src="https://github.com/suKyoung25.png?size=100" width="100px" alt="김수경"/>
          <br />
          <b>김수경</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/jbinyim">
          <img src="https://github.com/jbinyim.png?size=100" width="100px" alt="임정빈"/>
          <br />
          <b>임정빈</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Shinmilli">
          <img src="https://github.com/Shinmilli.png?size=100" width="100px" alt="신수민"/>
          <br />
          <b>신수민</b>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/shimyubin">
          <img src="https://github.com/shimyubin.png?size=100" width="100px" alt="심유빈"/>
          <br />
          <b>심유빈</b>
        </a>
      </td>
    </tr>
    <tr>
      <td align="center">
        <a href="https://pointed-afternoon-24b.notion.site/2173fde0e19480728178dce120cbdabb" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://immediate-conga-b1b.notion.site/217fb120f2ad80ea85b2e44377f62a58" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/3-21788b3cb86180698299f89f0ee4ff53" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/21783b8d694c801db314d01f63cd68c4" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/217e8b00d07a8036a583ddb33c62345d" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/2177a895c9ac8039a81fc7aad5fdbaed" target="_blank">개인 리포트</a>
      </td>
      <td align="center">
        <a href="https://www.notion.so/1c4c0886ab1380968ff8febb837182c7" target="_blank">개인 리포트</a>
      </td>
    </tr>
  </tbody>
</table>

- **홍성훈**  
  - 반려 요청 및 보낸 견적 목록 API
  - 견적 요청 및 반려 API
  - 받은 요청 조회 API
  - 받은 요청 및 반려 요청 상세 API
  - 견적 요청 및 반려 취소 API

- **오하영**  
  - 견적 요청 API
  - 받은 요청 조회 API
  - 알림 API
  - AWS RDS, S3 설정 및 EC2 배포
  - S3 이미지 업로드 구현

- **양성경**  
  - 일반 유저 로그인/회원가입 API
  - 일반 유저 프로필 등록/수정 API
  - 소셜 로그인 API
  - express-rate-limit 미들웨어

- **김수경**  
  - 기사님 로그인/회원가입 페이지 및 api
  - 일반유저/기사님 회원 탈퇴 컴포넌트 및 api 
  - 기사님 소셜 로그인 api 
  - 일반유저/기사님 프로필 페이지 공통 컴포넌트 
  - 기사님 프로필 등록/수정 페이지 및 api
  - 일반유저/기사님 프로필 이미지 수정 컴포넌트
  - 기사님 기본정보 수정 페이지 및 api

- **임정빈**  
  - 대기 중인 견적 조회 API
  - 받은 견적 조회 API 
  - 견적 상세 조회 API
  - 견적 확정 API
  - 커뮤니티 게시글 및 댓글 생성, 조회, 삭제 API 

- **신수민**  
  - 회원/비회원 인증 미들웨어
  - 기사님 목록 조회 API
  - 기사님 상세 조회 API
  - 기사님 프로필 조회 API
  - 기사님 찜하기 토글 API 

- **심유빈**  
  - 작성 가능한 리뷰 목록 API
  - 리뷰 CRUD
  - 찜한 기사님 목록 API
  - DeepL API

## 트러블 슈팅

## 1. 소셜 인증 사용자의 경우 비밀번호 필수 관련 문제

- **문제 상황**
  - 기본정보 수정 페이지에는 **비밀번호 관련 input**이 존재
  - 비밀번호 수정 시 **현재 비밀번호** 입력을 통해 본인 인증이 필요  
  - 그러나 **소셜 로그인 사용자는 비밀번호 자체가 없음**  
  - 기존 스키마(`MoverBasicInfoSchema`)에서는 `existedPassword`를 필수로 요구했기 때문에, 소셜 로그인 사용자가 기본정보를 수정하려 할 경우 **무조건 에러 발생**

- **원인 분석**
  - 스키마 설계 문제
    - `existedPassword`이 **필수**로 설정되어있음 → 로컬 로그인 사용자에겐 정상 동작하지만, 소셜 로그인 사용자에게는 **불필요한 제약** 발생  
  - UI/UX 문제
    - 소셜 로그인 사용자는 화면에서 비밀번호 입력 필드 자체를 볼 수 없음
    - 따라서 UI 상 optional이어야 하지만, 스키마는 필수값을 요구 → 불일치로 인한 **버튼 비활성화** 발생  
  - **분기 처리 부족**  
    - 사용자의 `provider`(local, google, naver 등)에 따른 조건 분기 로직이 없음  

- **해결 방법**
  - 스키마에 조건부 분기 도입  
     - `existedPassword` 필드를 기본적으로 optional 처리. 단, `isLocal === true`일 경우에만 필수 검증 수행  

  - 컨텍스트 기반 refine 로직 추가
    - `ctx.context.isLocal` 값을 전달받아, 로컬 로그인 사용자일 때만 기존 비밀번호를 검증하도록 수정
      
    ``` tsx
    if (isLocal && (!data.existedPassword || data.existedPassword.length < 8)) {
       ctx.addIssue({
          path: ["existedPassword"],
          message: "기존 비밀번호를 입력해주세요.",
          code: z.ZodIssueCode.custom,
       });
    }
    ```

## 2. useActionState 기반 실시간 유효성 검사 관련 문제

- **문제 상황**
  - `useActionState` 훅과 `moverProfileSchema`를 활용해 프로필 작성 폼을 구현
    - 서버로 전송 시에 유효성 검사를 하기 때문에 클라이언트 단에서 **실시간 유효성 검사**를 하려면 매 입력마다 `zod`의 전체 스키마를 돌려야함  
    - 서버/클라이언트에서 유효성 검증 로직이 중복되거나 모호해지는 문제가 있었음
  - 서버 요청 후 유효성에 걸리는 것까진 정상 동작을 하는데 그 이후, 사용자가 input 값을 변경해도 에러메세지가 그대로 남아있음
    - `handleChange`에서 `setError("")`로 초기화 시도했으나, `useEffect`가 다시 `serverError`를 세팅해버려 동작 꼬임
      useEffect 조건을 바꿨더니 이번에는 에러 메시지가 아예 표시되지 않음. **(useEffect 남용으로 인해 코드가 꼬임)**

- **원인 분석**  
  - 필드별 유효성 검사(zod.partial())를 상위에서 수행 → **로직 복잡**
  - `serverError`와 로컬 `error` 상태 충돌
    - 서버에서 내려온 에러를 useEffect로 setError(serverError)에 반영.
    - 하지만 handleChange로 에러를 지워도, useEffect가 다시 실행되면서 이전 serverError를 재세팅 → 지워지지 않음.
  - 버튼 활성화 조건 계산이 여러 필드와 오류를 동시에 체크 → **유지보수 어려움** 
```tsx
const isDisabled = isPending || Object.values(errors).some(err) || !requiredFieldsFilled;
```

- **해결 방법**  
  - 근본적인 해결을 위해 폼 제출 및 유효성 검사는 `react-hook-form`으로 리팩터링
    - 클라이언트에서 입력 즉시 필드 단위 유효성 검사가 가능
    - 서버에서는 최종 폼 유효성을 단일 스키마로 검증 → 코드 중복 최소화
    - useActionState의 경우 서버 액션과는 다르게 결과값을 리턴하는데 이 때문에 에러를 띄워줄 때 불필요한 **형식맞춤**이 필요했음 (객체 형식) 그러나 `react-hook-form`을 사용함으로써 그런 것들이 사라짐

## 3. 소셜 로그인에 따른 기본정보(이름/폰) 누락 처리 및 UI 분기

- **문제 상황 및 원인 분석**
  - 각 OAuth 제공자별 (provider별) 제공하는 사용자 정보가 다름. 때문에 ERD에서 name, phone을 nullable로 변경. 이로 인해 화면/서버 흐름에서 여전히 해당 값을 필수로 가정하면 런타임 에러 또는 UX 붕괴 발생.
  - 소셜 사용자는 비밀번호가 없는데 기존 UI/검증이 현재 비밀번호를 전제하면 진입 장벽 발생.
  - 흐름상 프로필 생성 전 기본정보가 없으면 기본정보 수정 페이지로 리다이렉트 로직을 추가하는게 맞다고 판단.
  - 소셜 인증자는 "현재 비밀번호"가 없음 → 이름/폰이 없을 때는 현재 비밀번호 input을 숨기고, 기존의 “수정” 표기는 “등록”으로 바꿔야 함.

- **해결 방법**
  - 기본정보 페이지에서 `context`를 통해 불러온 `user` 데이터에 따라 UI 분기처리 (수정 → 등록)
  - 현재 비밀번호 input을 숨김(사회 로그인 사용자이므로 비밀번호 요구 x)
  - 비밀번호 변경 시 현재 비밀번호 입력 요구(로컬 계정일 때만)

## 4. 한글 입력 시 채팅 중복 전송 문제 (Mac / Safari / macOS 환경)

- **문제 상황**

  - Windows 환경에서는 채팅이 Enter 키 한 번으로 정상 전송됨
  - Mac / Safari / macOS 환경에서는 한글 조합 입력 후 Enter 키를 누르면 동일 메시지가 2번 전송됨
  - 주로 조합형 입력(IME, Input Method Editor) 사용 시 발생

- **원인 분석**

  - macOS에서 한글 입력 시 이벤트 흐름이 다음과 같음:  
    `keydown → compositionstart → compositionupdate → compositionend → keydown`
  - compositionend 이후 keydown 이벤트가 다시 발생해 Enter 이벤트가 이중으로 호출됨
  - 현 메시지 전송 로직은 Enter 키 이벤트만 감지하여 실행하므로, 조합 완료 직후 Enter가 두 번 호출되어 중복 전송 발생

- **해결 방법**

  - 한글 입력 조합 중(`compositionstart` ~ `compositionend`)에는 Enter 이벤트 무시
  - `onKeyDown` 이벤트 핸들러에서 `isComposing` 상태를 확인해 메시지 전송 여부 결정
  - Windows / Mac / 모바일 환경 모두 동일 동작 테스트 완료

```typescript
const [isComposing, setIsComposing] = useState(false);

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
if (e.key === "Enter" && !e.shiftKey && !isComposing) {
e.preventDefault();
sendMessage();
}
};

 <textarea onCompositionStart={() => setIsComposing(true)} onCompositionEnd={() => setIsComposing(false)} onKeyDown={handleKeyDown} />
```

## 5. 견적 요청 폼 draft 저장 및 동기화 문제

- **문제 상황**

  - 견적 요청 시 서버에 자동으로 폼의 중간 상태를 저장하도록 구현하여, 초기에 서버에 저장된 draft를 불러오고 폼 상태 업데이트 시 `saveDraft` 로직을 통해 서버에 갱신하도록 설계함
  - 하지만 `savedDraft`에는 최신 상태가 반영되어 있음에도 불구하고, draft를 다시 조회할 때는 이전 상태가 반환되어 새로고침이나 페이지 이동 시 최신 저장 상태가 반영되지 않는 문제 발생

- **원인 분석**

  - 기존에 `debouncedSave`를 사용하면서 저장 타이밍이 맞지 않아 최신 상태가 서버에 완전히 반영되지 않는 경우 발생
  - React Query 적용으로 새 요청 시 이전 draft 캐시가 유지되면서 최신 데이터가 반영되지 않는 문제 발생
  - `currentStep` 값이 컨텍스트에서 초기화되지 않고 이전 상태로 다시 세팅되면서, 서버 draft와 로컬 상태 간 불일치 발생

- **해결방안**

  - debouncedSave 제거: 저장 타이밍 문제를 없애고 즉시 저장되도록 변경
  - 이중 저장 구조 적용: 폼 상태 업데이트 시 `localStorage`와 서버 draft를 동시에 갱신 → 새로고침/페이지 이동 시에도 동일한 상태 유지
  - 초기 로딩 우선순위: `localStorage` 값이 존재하면 이를 우선 반영, 없을 경우 서버 draft를 불러와 초기 상태로 사용
  - currentStep 동기화 개선: 서버 draft의 `currentStep`을 기준으로 초기화하고, 이후에는 클라이언트 업데이트 시 항상 로컬/서버 양쪽에 반영되도록 수정

## 백엔드 폴더 구조

```
6th-Moving-4Team-BE
├─ .prettierrc              # 코드 포맷팅 설정
├─ README.md                
├─ jest.config.ts           # Jest 테스트 설정
├─ package-lock.json        
├─ package.json             # 프로젝트 의존성/스크립트
├─ prisma
│  ├─ migrations            # DB 마이그레이션 기록
│  ├─ schema.prisma         # Prisma ORM 스키마
├─ src
│  ├─ app.ts                # Express 앱 초기화
│  ├─ configs               # 환경/라이브러리 설정
│  ├─ constants             # 상수 모음
│  ├─ controllers           # 요청 처리 컨트롤러
│  ├─ dtos                  # 요청/응답 DTO 정의
│  ├─ instrument.ts         # 모니터링 설정
│  ├─ integration-test      # 통합 테스트
│  ├─ middlewares           # Express 미들웨어
│  ├─ mocks                 # 테스트용 Mock 데이터
│  ├─ repositories          # DB 접근 계층
│  ├─ routers               # 라우터 정의
│  ├─ schedule              # 스케줄러 작업
│  ├─ server.ts             # 서버 실행 진입점
│  ├─ services              # 비즈니스 로직
│  ├─ swagger.ts            # Swagger UI 설정
│  ├─ swagger.yaml          # API 명세서
│  ├─ types                 # 공용 타입 정의
│  └─ utils                 # 유틸 함수
└─ tsconfig.json            # TypeScript 설정
               
```
