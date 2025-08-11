FROM rust:latest

WORKDIR /app

COPY src ./src

RUN rustc -O src/main.rs -o estudos-backend

EXPOSE 8180

CMD ["./estudos-backend"]