# WebRTC Core & Media - Thành viên 2

Bộ khung cho đồ án WebRTC Video Conference & Collaboration, nhóm 3.
Đây là bước tạo cấu trúc ban đầu, chưa phải ứng dụng họp hoàn chỉnh.

## Chạy ngay trong VS Code

1. Giải nén, mở thư mục `webrtc-member2` bằng VS Code.
2. Cài Node.js phiên bản đáp ứng `package.json` (>=20).
3. Mở Terminal tại thư mục chứa `package.json`.
4. Chạy `npm run check`, sau đó `npm run dev`.
5. Mở `http://localhost:5173`, bấm **Mở camera & micro** và cấp quyền.
6. Kiểm tra bật/tắt mic, camera, chia sẻ màn hình và giải phóng thiết bị.

Không cần `npm install` cho bản này: chưa có dependency bên ngoài.
Không mở HTML bằng `file://`. Server demo chỉ lắng nghe loopback và không phải signaling server.
Demo tắt âm thanh preview để tránh vọng; cần cuộc gọi thật để xác nhận tiếng micro.

## Bản này có gì?

| Thành phần | Trạng thái |
| --- | --- |
| Thu camera/micro, bật/tắt track, stop thiết bị | Có code, cần kiểm tra thiết bị trên máy bạn |
| Thu màn hình local, xử lý nút Stop sharing | Có code, chưa truyền tới người khác |
| Hàm giới hạn bitrate một video sender | Có code, chưa tích hợp cuộc gọi |
| Socket.IO adapter | Có code theo protocol đề xuất, chưa có server để tích hợp |
| SDP/ICE, perfect negotiation, peer lifecycle | Bộ khung TODO, gọi phương thức chưa làm sẽ báo lỗi |
| Mesh nhiều người, replaceTrack toàn bộ peers | Bộ khung TODO |
| Chat, recording, giao diện phòng hoàn chỉnh | Thuộc thành viên 3 |
| Server phòng họp, relay signaling, heartbeat | Thuộc thành viên 1 |

## Cấu trúc và nơi bạn viết code

| Đường dẫn | Vai trò |
| --- | --- |
| `src/index.js` | Điểm export module để UI/React sử dụng |
| `src/config/media.config.js` | Độ phân giải, FPS, audio constraints |
| `src/config/rtc.config.js` | ICE servers, transport policy, bitrate mặc định |
| `src/media/MediaManager.js` | Camera/micro, trạng thái track, giải phóng thiết bị |
| `src/media/ScreenShareManager.js` | Capture màn hình và sự kiện kết thúc |
| `src/webrtc/PeerConnection.js` | Một kết nối tới một peer; SDP, ICE, replaceTrack |
| `src/webrtc/MeshClient.js` | Map peer, vòng đời phòng, API cho UI |
| `src/webrtc/bandwidth.js` | setParameters cho video sender |
| `src/signaling/SocketIoSignaling.js` | Tách chi tiết Socket.IO khỏi logic WebRTC |
| `src/utils/Emitter.js` | Phát sự kiện nội bộ tới UI |
| `demo/` | Trang kiểm tra media local, không phải UI sản phẩm |
| `scripts/` | Server static và kiểm tra cú pháp/import |
| `docs/PROJECT.md` | Phạm vi đồ án và cơ sở kỹ thuật |
| `docs/SIGNALING.md` | Protocol đề xuất cần chốt với thành viên 1 |
| `docs/UI-CONTRACT.md` | API/sự kiện dự kiến bàn giao thành viên 3 |
| `docs/ROADMAP.md` | Thứ tự hoàn thiện và tiêu chí bàn giao |
| `docs/TESTING.md` | Checklist kiểm thử thực tế |

## Đọc và làm theo thứ tự

Đọc PROJECT → SIGNALING → UI-CONTRACT → ROADMAP → TESTING.
Sau demo media local, triển khai `PeerConnection` cho 2 người trước,
rồi `MeshClient` cho 3-5 người; cuối cùng ghép screen sharing và bitrate.

Chưa có repository, server, hay protocol hiện tại của nhóm trong tài liệu đính kèm.
Tên file, class và event ở đây là thiết kế đề xuất, không phải quy ước đã được nhóm duyệt.
Nếu nhóm dùng React, đặt `src/` này vào một thư mục core của frontend và giữ UI ở ngoài.
Không tạo thêm server thật trong phần của bạn nếu thành viên 1 đã phụ trách.
