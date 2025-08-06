## 통합 테스트 환경 세팅 가이드

### 1. Docker 설치

각자 로컬에 Docker 설치하기

[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### 2. 테스트용 PostgreSQL 컨테이너 실행

터미널 루트 디렉토리에서 아래 명렁어 붙여넣고 실행

```
docker run --name test-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  -d postgres:13
```

### 3. 연결 확인

컨테이너 실행 상태 확인

```
docker ps
```

PostgreSQL 연결 테스트

```
docker exec -it test-postgres psql -U postgres -d testdb -c "SELECT version();"
```

### 4. Prisma migration

VScode 터미널에서 아래 명령어 실행

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/testdb npx prisma migrate deploy
```

### 5. 테스트 실행 및 확인

유닛테스트만 실행

```
npm run test:unit
```

통합테스트만 실행

```
npm run test:integration
```

모든 테스트 실행

```
npm run test
```
