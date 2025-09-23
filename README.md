# Golden Game Backend

Backend API cho ứng dụng game Golden Game được xây dựng với NestJS và TypeScript.

## Mô tả

Hệ thống backend cung cấp các API cho:
- Xác thực người dùng (Email, Telegram, Google OAuth)
- Quản lý ví HD và ví import
- Tích hợp Telegram Bot
- Hệ thống mã xác thực và bảo mật

## Backend Test URLs

- **Nhật:** https://dp7vlq3z-8000.asse.devtunnels.ms/api/v1
- **Quý:** https://k6z4r6s6-8080.asse.devtunnels.ms/api/v1
- **Triệu:** https://8w7n4n91-8008.asse.devtunnels.ms/api/v1

## Cài đặt dự án

```bash
$ yarn install
```

## Chạy dự án

```bash
# development
$ yarn run start:dev

# production
$ yarn run start:prod
```

## Cấu trúc dự án

```
src/
├── modules/
│   ├── auth/           # Xác thực người dùng
│   ├── users/          # Quản lý người dùng
│   ├── wallets/        # Quản lý ví
│   └── telegram-bot/   # Bot Telegram
├── shared/             # Shared modules
└── config/             # Cấu hình
```

## Công nghệ sử dụng

- **NestJS** - Framework Node.js
- **TypeScript** - Ngôn ngữ lập trình
- **TypeORM** - ORM cho database
- **PostgreSQL** - Database
- **JWT** - Xác thực
- **Telegram Bot API** - Tích hợp bot
- **Solana** - Blockchain integration

## License

MIT
