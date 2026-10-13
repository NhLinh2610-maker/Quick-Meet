# Lộ trình hoàn thiện

## 1. Xác nhận và chạy media local

Chạy demo, cấp quyền, thử deny quyền, kiểm tra indicator camera/micro tắt
sau khi giải phóng thiết bị. Đọc MediaManager và ScreenShareManager trước.
Code capture đã có; không coi syntax check là kiểm chứng phần cứng.

## 2. Chốt protocol với thành viên 1

Gửi SIGNALING.md v0.3 cho thành viên 1 xác nhận, gồm presence/quyền share bổ sung từ UI;
backend hiện chưa được triển khai. Chốt event/payload mới trước khi tích hợp.
Cập nhật SocketIoSignaling cho create, join, leave ACK và chính sách timeout;
tạo trang thử gọi 2 người sử dụng server đó. Chưa thêm chat/recording.

## 3. Hoàn thiện PeerConnection (P1, P2)

- Tạo pc từ rtcConfiguration, addTrack cho audio/video.
- Wire icecandidate, track, connectionstatechange và negotiationneeded.
- Perfect negotiation: makingOffer, ignoreOffer, polite,
  isSettingRemoteAnswerPending; serialize các xử lý signal cho mỗi peer.
- Send localDescription, xử lý remote SDP, tạo Answer; đệm và flush ICE.
- ontrack dùng event.streams[0] hoặc tự gom track khi streams rỗng.
- Close giải phóng pc, listeners và hàng đợi.
- Hỗ trợ nhận media khi không có local track; thêm nguồn sau join cần thương lượng phù hợp.

Đạt khi 2 máy gọi được hai chiều, log không có lỗi ICE/SDP,
và không duplicate video hay peer.

## 4. Hoàn thiện MeshClient (M1)

Map peerId → PeerConnection, join ACK, peers ban đầu, peer-joined,
peer-left, xử lý signaling disconnect, gỡ listener khi leave.
Giới hạn phòng do server enforce. Forward các event tới UI.

Đạt khi tăng dần từ 3, 5 đến 7 người kết nối đủ; join/rời/đóng tab không còn peer rác;
rời rồi join lại không sinh listeners trùng.

## 5. Ghép chia sẻ màn hình (P3, M2)

Thiết kế mới giữ camera và gửi screen video riêng, có audio tab cùng micro nếu hỗ trợ.
Chốt ánh xạ stream/track, cách truyền/mix audio và quyền share duy nhất do server cấp.
Điều phối capture từ click với quyền share bất đồng bộ, serialize start/stop,
xử lý leave/hủy/lỗi trong khi hỏi quyền; giải phóng quyền server và nguồn đã capture.
Người mới nhận camera, screen và snapshot trạng thái; stop share giữ camera/mic.
Kiểm tra lỗi trên một peer và phục hồi/báo trạng thái nhất quán. Không thay camera bằng screen.

## 6. Băng thông và stats (M3)

Ghép setVideoBitrate, lưu trần cho peer mới và áp lại sau renegotiation.
Phân biệt sender camera/screen; thử camera 800 kbps/1,5 Mbps, screen 1,5–2 Mbps
ở phòng 2, 5 và 7 người. Tính tổng upload cả hai nguồn khi share; chưa thêm thanh bitrate UI.
Đo getStats, tốc độ gửi = 8 × delta(bytesSent) / delta(thời gian giây).
Kiểm tra trên mạng thật với bitrate thấp/cao; ghi bối cảnh và số peer.
Không sửa SDP bằng cách nối chuỗi để đặt bitrate ở bản đầu.

## 7. Tích hợp và bàn giao

Ghép API với UI của thành viên 3. Cấu hình STUN/TURN và HTTPS cùng nhóm.
Chuyển frontend sang React + Vite và cấu trúc mục tiêu trong UI-CONTRACT.md theo một lần phối hợp.
Thêm bước chuẩn bị preview/bật tắt thiết bị, fallback chỉ nghe/xem, presence và chat văn bản.
Recording để sau khi gọi/share/chat ổn định; chưa chốt phạm vi ghi.
Chạy TESTING.md; điền kết quả thực tế. Bàn giao src/, hợp đồng API,
protocol cuối cùng, hướng dẫn cấu hình và bằng chứng cuộc gọi đến 7 người.
Ban đầu thử bằng localhost (frontend 5173, backend 3000); sau mốc gọi hai người local,
triển khai bản thử HTTPS trên cloud miễn phí để kiểm tra khác thiết bị/mạng.
Nhà cung cấp hosting và STUN/TURN còn cần chốt; địa chỉ signaling không cố định trong core.

Fallback audio-only/camera-only/chỉ nghe xem thuộc bản đầu theo quyết định mới.
Phần cần thống nhất thêm sau bản đầu: đổi thiết bị giữa cuộc gọi, ICE restart, tự động reconnect, xử lý capture
bị thiết bị khác chiếm dụng, và chiến lược chất lượng khi nhiều peer.
