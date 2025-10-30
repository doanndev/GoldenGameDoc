## Admin BG Affiliate API

Tài liệu API cho module `admin/bg-ref`. Tất cả các endpoint đều yêu cầu xác thực admin và quyền phù hợp (guards: `AdminJwtAuthGuard`, `PermissionGuard`).

Lưu ý: Không bao gồm route thử nghiệm `POST /admin/bg-ref/test-create-node`.

### Base Path

`/admin/bg-ref`

---

### 1) Tạo BG Affiliate Tree (root)

- Method: `POST`
- Path: `/admin/bg-ref`
- Auth: Yêu cầu
- Body

```json
{
  "user_id": 123,
  "total_commission_percent": 50,
  "alias": "team-alpha"
}
```

- Ràng buộc
  - `user_id` phải tồn tại.
  - User chưa thuộc bất kỳ BG affiliate system nào (chưa có node).
  - `total_commission_percent` trong [0, 100].
  - `alias` không rỗng.

- Response 201

```json
{
  "success": true,
  "message": "BG affiliate created successfully",
  "data": {
    "tree_id": 1,
    "total_commission_percent": 50,
    "alias": "team-alpha"
  }
}
```

---

### 2) Cập nhật phần trăm hoa hồng của BG Affiliate (và alias)

- Method: `PUT`
- Path: `/admin/bg-ref/bg-affiliate/commission`
- Auth: Yêu cầu
- Body (cung cấp `tree_id` hoặc `root_user_id`)

```json
{
  "tree_id": 1,
  "new_percent": 45,
  "alias": "team-alpha-v2"
}
```

- Ràng buộc
  - Phải cung cấp một trong hai: `tree_id` hoặc `root_user_id`.
  - `new_percent` trong [0, 100].

- Response 200

```json
{
  "success": true,
  "message": "BG affiliate commission updated successfully",
  "old_percent": 50,
  "new_percent": 45,
  "tree_info": {
    "id": 1,
    "root_user_id": 123,
    "total_commission_percent": 45,
    "alias": "team-alpha-v2"
  }
}
```

---

### 3) Lấy danh sách tất cả BG Affiliate Trees (tối ưu, kèm thống kê cơ bản)

- Method: `GET`
- Path: `/admin/bg-ref/bg-affiliate/trees`
- Auth: Yêu cầu
- Query params (tuỳ chọn)
  - `alias`: Lọc theo alias chính xác.

- Response 200 (mảng)

```json
[
  {
    "tree_id": 1,
    "root_user": {
      "id": 123,
      "username": "root123",
      "email": "root@example.com",
      "fullname": "Root Admin",
      "main_wallet_address": "0xabc..."
    },
    "total_commission_percent": 45,
    "alias": "team-alpha-v2",
    "created_at": "2025-10-30T00:00:00.000Z",
    "node_count": 10,
    "total_members": 9
  }
]
```

Ghi chú: `node_count` bao gồm root; `total_members` không tính root (chỉ các node có `parent_user_id != null`).

---

### 4) Lấy thống kê tổng quan BG Affiliate

- Method: `GET`
- Path: `/admin/bg-ref/bg-affiliate/stats`
- Auth: Yêu cầu

- Response 200

```json
{
  "total_trees": 5,
  "total_nodes": 120,
  "active_trees": 4,
  "total_members": 115,
  "total_commission_distributed": 12345.67,
  "total_commission_withdrawn": 8900.5,
  "total_commission_pending": 3445.17
}
```

Định nghĩa:
- `active_trees`: số lượng tree có ít nhất 1 member (node con).
- Các giá trị commission được tổng hợp từ bảng `BgAffiliateCommissionReward`.

---

### 5) Lấy cấu trúc BG Affiliate Tree theo `userId`

- Method: `GET`
- Path: `/admin/bg-ref/bg-affiliate/trees/user/:userId`
- Auth: Yêu cầu

- Response 200

```json
{
  "tree_id": 1,
  "root_user_id": 123,
  "total_commission_percent": 45,
  "alias": "team-alpha-v2",
  "created_at": "2025-10-30T00:00:00.000Z",
  "node_count": 10,
  "total_members": 9,
  "current_user_id": 456,
  "nodes": [
    {
      "user_id": 123,
      "parent_user_id": null,
      "commission_percent": 45,
      "alias": "team-alpha-v2",
      "effective_from": "2025-10-30T00:00:00.000Z",
      "user_info": {
        "id": 123,
        "username": "root123",
        "email": "root@example.com",
        "fullname": "Root Admin",
        "main_wallet_address": "0xabc..."
      },
      "children": [
        {
          "user_id": 456,
          "parent_user_id": 123,
          "commission_percent": 30,
          "alias": "node-456",
          "effective_from": "2025-10-30T00:00:00.000Z",
          "user_info": {
            "id": 456,
            "username": "child456",
            "email": "child@example.com",
            "fullname": "Child User",
            "main_wallet_address": "0xdef..."
          },
          "children": []
        }
      ]
    }
  ]
}
```

Ràng buộc & lỗi phổ biến:
- Nếu `userId` không thuộc bất kỳ BG affiliate system nào: 404.
- Nếu không tìm thấy tree tương ứng: 404.

---

### Lỗi phổ biến (HTTP Status Codes)

- 400 Bad Request
  - Phạm vi phần trăm hoa hồng không hợp lệ (ngoài [0, 100]).
  - User đã thuộc BG affiliate system khác khi tạo tree hoặc node.
- 401/403 Unauthorized/Forbidden
  - Thiếu/không hợp lệ token admin hoặc thiếu permission.
- 404 Not Found
  - User/Tree không tồn tại.

---

### Ghi chú triển khai

- Root node của tree có `parent_user_id = null` và `user_id = root_user_id`.
- Khi cập nhật commission, service cập nhật cả `tree.total_commission_percent` và root node `commission_percent`. Có thể cập nhật hoặc giữ nguyên `alias`.
- Các truy vấn danh sách dùng batch query để tối ưu số lượng query (users, wallets theo danh sách `user_id`).


