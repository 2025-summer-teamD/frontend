# 1단계: 빌드
FROM golang:1.23-alpine AS builder

WORKDIR /app

# 모듈 캐시 활용을 위한 go.mod, go.sum 복사
COPY go.mod go.sum ./
RUN go mod download

# 소스코드 복사
COPY . .

# 바이너리 빌드 (예: main.go가 진입점)
RUN go build -o main .

# 2단계: 실행용 경량 이미지
FROM alpine:latest

WORKDIR /app

# CA 인증서 설치 (HTTPS 통신 시 필요)
RUN apk --no-cache add ca-certificates

# 빌드 단계에서 생성한 실행파일 복사
COPY --from=builder /app/main .

# 컨테이너 외부에 노출할 포트 (예시: 8080)
EXPOSE 8080

# 컨테이너 실행 시 기본 명령
CMD ["./main"]
