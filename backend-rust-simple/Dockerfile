FROM rust:1.79

WORKDIR /app

COPY Cargo.toml ./
COPY src ./src

RUN cargo build --release

EXPOSE 8180

CMD ["./target/release/estudos-backend"]