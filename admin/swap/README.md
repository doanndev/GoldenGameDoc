# Swaps Module - API Documentation

```
url https://8w7n4n91-8008.asse.devtunnels.ms/api/v1
```

## 3. Lấy danh sách Swap cảu tất cả user để quản lý cho admin

### `GET /admin/swaps

Lấy danh sách các giao dịch swap theo trạng thái và loại coin.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | enum | No | Trạng thái: pending, executed, failed |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng item per page (mặc định: 10) |
| `user_username` | number | No | Lọc những gia dịch swap của một user xác định theo username |
| `user_email` | number | No | Lọc những gia dịch swap của một user xác định theo email |
| `coin_send` | number | No | Lọc những gia dịch swap với coin_send(SOL/USDT) |
| `coin_received` | number | No | Lọc những gia dịch swap với coin_received(MPB) |
| `wallet_address` | number | No | Lọc theo địa chỉ ví đã swap |
| `status` | number | No | Lọc theo trạng thái swap status(failed/executed) |

#### Example Request
```
GET /admin/swaps?status=executed&page=1&limit=10
```
<img width="1899" height="700" alt="image" src="https://github.com/user-attachments/assets/89d781c8-0a5e-49ec-bd2f-90092fd23342" />

#### Response Success (200)
```json
{
    "data": [
        {
            "id": 418,
            "amount_send": "700",
            "amount_received": "686",
            "coin_send": {
                "id": 2,
                "symbol": "USDT",
                "mint": "Gr5D54dHC8neoFBQQuy8ni6S19E5ygg7Ewr3i1x6RRP5",
                "name": "Tether USD"
            },
            "coin_received": {
                "id": 3,
                "symbol": "MPB",
                "mint": "9wcpBxUDTi2K7cXoHsmP7K4S7ZSZpjedQrR3gh1evVNQ",
                "name": "MPB"
            },
            "rate": "1.0204081632653061",
            "rate_usd_send": "1",
            "rate_usd_received": "0.98",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "4fLbZcaRyi7TxEJMQufHTEm5ss3Z6K9GwLEUBvUTb8qWwtGbLTc1mMYBnC5rk4mvrGkX7mLG7CPDproU9L59ebb4",
            "user": {
                "id": 142910,
                "email": "hleees88@gmail.com",
                "username": "valued",
                "fullname": "valued",
                "wallet_address": "74erB61Jq1QvhrgEk59qN9Vystfa76eruV4t1P3kLnmU"
            },
            "created_at": "2025-10-14T07:18:04.125Z"
        },
        {
            "id": 414,
            "amount_send": "1000",
            "amount_received": "980",
            "coin_send": {
                "id": 2,
                "symbol": "USDT",
                "mint": "Gr5D54dHC8neoFBQQuy8ni6S19E5ygg7Ewr3i1x6RRP5",
                "name": "Tether USD"
            },
            "coin_received": {
                "id": 3,
                "symbol": "MPB",
                "mint": "9wcpBxUDTi2K7cXoHsmP7K4S7ZSZpjedQrR3gh1evVNQ",
                "name": "MPB"
            },
            "rate": "1.0204081632653061",
            "rate_usd_send": "1",
            "rate_usd_received": "0.98",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "4yhZtDimXHogeV42qG1UzVQi4nGBhFSK6h4crTecb7uHms46U3dXDan7GitEnXp4KnkkmZZ9HsgxC7tmPNQGV1Ed",
            "user": {
                "id": 142862,
                "email": "nth149949@gmail.com",
                "username": "Dautay",
                "fullname": "Dautay",
                "wallet_address": "74erB61Jq1QvhrgEk59qN9Vystfa76eruV4t1P3kLnmU"
            },
            "created_at": "2025-10-07T09:28:16.191Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 2,
        "total": 19,
        "totalPages": 10,
        "hasNext": true,
        "hasPrev": false
    },
    "statistics": {
        "total_swaps": 413,
        "total_executed_swaps": 135,
        "total_amount_received": 468387.6911068802
    }
}
```
