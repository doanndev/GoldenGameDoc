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
| `search` | number | No | Lọc, tìm kiếm theo tên đồng gửi, nhận, user swap: username, địa chỉ ví |

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
            "id": 399,
            "amount_send": "0.001",
            "amount_received": "0.1979208",
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
            "rate": "0.005052526060929422",
            "rate_usd_send": "1",
            "rate_usd_received": "197.9208",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "287ybK1p1mASjvo9PGXiFBJfSBp3Zjo5JJHxYNprGLgwRuVLbhS6QjLH7QaUs675Bk33ED8yQwLREg8WbE53iWaj",
            "user": {
                "id": 142862,
                "email": "nth149949@gmail.com",
                "username": "Dautay",
                "fullname": "Dautay",
                "wallet_address": "74erB61Jq1QvhrgEk59qN9Vystfa76eruV4t1P3kLnmU"
            },
            "created_at": "2025-09-28T07:54:32.604Z"
        },
        {
            "id": 398,
            "amount_send": "0.001",
            "amount_received": "0.1979208",
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
            "rate": "0.005052526060929422",
            "rate_usd_send": "1",
            "rate_usd_received": "197.9208",
            "status": "executed",
            "message": "Swap order created successfully",
            "hash": "26d9vViGEMNBccfgiQteH71DdtqZx9RNaVt84URbvDpdnzAkKiDUCdgvNzdYr1ybKhavGa5hit6QejuTVoajdaTT",
            "user": {
                "id": 142862,
                "email": "nth149949@gmail.com",
                "username": "Dautay",
                "fullname": "Dautay",
                "wallet_address": "74erB61Jq1QvhrgEk59qN9Vystfa76eruV4t1P3kLnmU"
            },
            "created_at": "2025-09-28T07:53:41.488Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 2,
        "total": 250,
        "totalPages": 125,
        "hasNext": true,
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
<img width="1899" height="700" alt="image" src="https://github.com/user-attachments/assets/89d781c8-0a5e-49ec-bd2f-90092fd23342" />

#### Response Success (200)
```json
{
    "total_swaps": 400,
    "total_executed_swaps": 127,
    "total_amount_received": 437987.6824921366
}
```
