# Swaps Module - API Documentation

```
url https://8w7n4n91-8008.asse.devtunnels.ms/api/v1
```

## 1. Lấy danh sách Swap cảu tất cả user để quản lý cho admin

### `GET /admin/swaps

Lấy danh sách các giao dịch swap theo trạng thái và loại coin.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | enum | No | Trạng thái: pending, executed, failed |
| `page` | number | No | Số trang (mặc định: 1) |
| `limit` | number | No | Số lượng item per page (mặc định: 10) |
| `search` | number | No | Lọc, tìm kiếm theo tên đồng gửi, nhận, user swap: username, địa chỉ ví, không tìm kiếm theo status |
| `date` | number | No | Lọc ngày swap |
| `status` | number | No | Lọc theo status(executed, failed) |

#### Example Request
```
GET /admin/swaps?search=SOL&page=1&limit=10
```

#### Response Success (200)
```json
{
    "data": [
        {
            "id": 412,
            "amount_send": "0.0005",
            "amount_received": "0.09172310000000002",
            "coin_send": {
                "id": 1,
                "symbol": "SOL",
                "mint": "None",
                "name": "Solana"
            },
            "coin_received": {
                "id": 3,
                "symbol": "MPB",
                "mint": "9wcpBxUDTi2K7cXoHsmP7K4S7ZSZpjedQrR3gh1evVNQ",
                "name": "MPB"
            },
            "rate": "0.005451189504061681",
            "rate_usd_send": "1",
            "rate_usd_received": "183.44620000000003",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "SXUdZ4KQENULBRF9xwnZeLbs3BP1nTNnqwDCXSJLCCNdeuVUAkASS7p472oL9nACavChWz13aRnLwdgvzSCWt6Y",
            "wallet_address": "B3p3RCV2XCrpNf6Hucxg6JvCWScAe6i96uYbAZhXYhSh",
            "user": {
                "id": 142881,
                "email": "vannn.quy@gmail.com",
                "username": "lvq",
                "fullname": "Lê Văn Quý"
            },
            "created_at": "2025-10-23T07:10:12.676Z"
        },
        {
            "id": 411,
            "amount_send": "20",
            "amount_received": "19.599999999999998",
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
            "rate_usd_received": "0.9799999999999999",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "5rXLW2u3nQYfGmb67Cq7FELdF3TMyGsFoUeXtzdp3rGwC9qiJUmpTKdDApjTQGnowgzPf5Jp1hRp2pFVejtUXXoW",
            "wallet_address": "B3p3RCV2XCrpNf6Hucxg6JvCWScAe6i96uYbAZhXYhSh",
            "user": {
                "id": 142881,
                "email": "vannn.quy@gmail.com",
                "username": "lvq",
                "fullname": "Lê Văn Quý"
            },
            "created_at": "2025-10-23T07:09:50.956Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPages": 1,
        "hasNext": false,
        "hasPrev": false
    }
}
```

## 2. Thống kê số lượng swap, tổng swap thành công, tổng mpb nhận được

### `GET /admin/swaps/counts

Lấy danh sách các giao dịch swap theo trạng thái và loại coin.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|

#### Example Request
```
GET /admin/swaps/counts
```

#### Response Success (200)
```json
{
    "total_swaps": 400,
    "total_executed_swaps": 127,
    "total_amount_received": 437987.6824921366
}
```
