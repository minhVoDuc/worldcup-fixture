# ⚽ WC 2026 Tracker

Theo dõi lịch thi đấu, kết quả và bảng xếp hạng FIFA World Cup 2026™

## Cấu trúc dự án

```
wc2026/
├── index.html                  ← Entry point duy nhất
├── README.md
├── data/
│   └── config.json             ← Cấu hình (data source, timezone, API key)
├── assets/
│   ├── css/
│   │   ├── tokens.css          ← Design tokens (màu, font, spacing)
│   │   ├── base.css            ← Reset, animations, utilities
│   │   ├── layout.css          ← Header, nav, grid, responsive
│   │   └── components.css      ← Match card, countdown, standings, bracket
│   ├── js/
│   │   ├── app.js              ← Entry point JS (init, theme, toast)
│   │   ├── state.js            ← Reactive store (không cần framework)
│   │   ├── router.js           ← Hash router (#home, #schedule, ...)
│   │   ├── data-source.js      ← Phase detection + data orchestrator
│   │   ├── adapters/
│   │   │   ├── openfootball.js ← Adapter mặc định (worldcup.json)
│   │   │   └── api-football.js ← Adapter dự phòng (api-sports.io)
│   │   └── views/
│   │       ├── home.js         ← Countdown / Live overview
│   │       ├── schedule.js     ← Lịch thi đấu + filter
│   │       ├── results.js      ← Kết quả đã hoàn thành
│   │       ├── standings.js    ← Bảng xếp hạng vòng bảng
│   │       ├── bracket.js      ← Nhánh playoff
│   │       └── ending.js       ← Trang kết thúc giải
│   └── images/                 ← Tài nguyên hình ảnh (nếu cần)
└── pages/                      ← Dành cho trang tĩnh bổ sung (nếu cần)
```

## Cách chạy trên Windows

### Cách 1 — VS Code Live Server (khuyên dùng)
1. Mở thư mục `wc2026/` bằng VS Code
2. Cài extension **Live Server** (ritwickdey.liveserver)
3. Chuột phải `index.html` → **Open with Live Server**
4. Trình duyệt tự mở tại `http://127.0.0.1:5500`

### Cách 2 — Python (có sẵn trên Windows)
```bash
cd wc2026
python -m http.server 8080
# Mở trình duyệt: http://localhost:8080
```

### Cách 3 — Node http-server (nếu có Node)
```bash
npx http-server wc2026 -p 8080
```

> ⚠️ **Không mở file:// trực tiếp** — ES Modules (`type="module"`) cần HTTP server
> để fetch() và import hoạt động đúng.

## Đổi data source

Mở `data/config.json`:
- `"dataSource": "openfootball"` — dùng worldcup.json (mặc định, miễn phí)
- `"dataSource": "api-football"` — dùng api-sports.io (cần API key)
  - Điền `apiKey` vào `config.apiFootball.apiKey`

## User flow

| Phase | Điều kiện | Trang hiển thị |
|-------|-----------|----------------|
| **Trước giải** | Trước 11/6/2026 | Countdown hero + lịch sắp tới |
| **Trong giải** | 11/6 → 19/7/2026 | Live scores, lịch, kết quả, BXH, playoff |
| **Sau giải** | Sau 19/7/2026 | Trang kết thúc + champion |

## Tech stack

- **Thuần HTML / CSS / JS** — không Next.js, không Node, không build step
- **ES Modules** (`type="module"`) — import/export gốc của trình duyệt
- **Fonts**: Baloo 2 (display) + Nunito (body) qua Google Fonts CDN
- **Data**: GitHub raw JSON (openfootball) hoặc api-sports.io
- **Theme**: Light/Dark tự động theo hệ thống, có toggle tay
