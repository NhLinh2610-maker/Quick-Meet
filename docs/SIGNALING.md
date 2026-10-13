# Signaling protocol đề xuất v0.3

**Đã thống nhất với người dùng trong phiên thiết kế đóng vai thành viên 1.
Cần thành viên 1 thật xác nhận trước khi tích hợp. Backend chưa được triển khai.**
Server dự kiến dùng Node.js + Express + Socket.IO. Frontend khởi tạo socket
và truyền vào SocketIoSignaling; core WebRTC không tự khởi tạo socket.
Server Socket.IO phải tương thích adapter; WebSocket thuần không dùng chung wire protocol.
Adapter mẫu yêu cầu socket client hỗ trợ timeout().emitWithAck().

## Danh tính và phòng

roomId là định danh phòng, peerId dùng socket.id cho phiên hiện tại.
ACK join trả selfId từ server; client không tự khai from.
Server kiểm tra thành viên cùng phòng, target hợp lệ và giới hạn tối đa 7 người,
tính cả người tạo. Mọi người có quyền ngang nhau, không có quyền chủ phòng đặc biệt.
Các quy tắc validation/authorization là trách nhiệm server.

- Tạo phòng và tham gia phòng là hai thao tác riêng. Tạo thành công đồng thời tham gia.
- Server sinh mã phòng 6 ký tự chữ/số, loại O/0 và I/1, kiểm tra trùng phòng đang tồn tại.
  Khi nhập không phân biệt hoa/thường; server trả roomId chuẩn để dùng trong các bản tin sau.
- Không yêu cầu tài khoản. Tên hiển thị được trùng và giữ khoảng trắng giữa các từ,
  ví dụ "Ngô Nhật Linh". Bỏ khoảng trắng thừa đầu/cuối bằng trim(); sau trim tên
  không được rỗng và tối đa 50 ký tự. Server chuẩn hóa và kiểm tra khi create/join;
  UI kiểm tra cùng quy tắc để phản hồi sớm. Tên không hợp lệ trả INVALID_INPUT.
- Mỗi tab có socket riêng và chỉ ở một phòng. Một người có thể mở nhiều tab vào nhiều phòng.
- Join lặp cùng phòng trả ACK hiện tại, không thêm thành viên hay phát peer:joined lần nữa.
  Muốn đổi phòng trên cùng socket phải leave trước.
- Xóa phòng khi người cuối cùng rời; join mã phòng đã xóa trả ROOM_NOT_FOUND.

## Bản tin

| Hướng | Event | Nội dung |
| --- | --- | --- |
| C → S | room:create | { displayName } |
| C → S | room:join | { roomId, displayName } |
| S → C ACK | ACK của room:create hoặc room:join | { ok: true, roomId, selfId, peers: [{ peerId, displayName }] } |
| S → C ACK lỗi | ACK của room:create hoặc room:join | { ok: false, error: { code, message } } |
| S → các người cũ | peer:joined | { roomId, peerId, displayName } |
| C → S | webrtc:signal | { roomId, to, payload } |
| S → C đích | webrtc:signal | { roomId, from, payload } |
| C → S | room:leave | { roomId } |
| S → C ACK | ACK của room:leave | { ok: true } |
| S → người còn lại | peer:left | { roomId, peerId } |

peers trong ACK không gồm self; ACK tạo phòng có peers: [].
Client chuẩn bị mic/camera trước tạo/join, giữ lựa chọn bật/tắt khi vào phòng.
Theo quyết định UI mới, cho phép audio-only, camera-only hoặc chỉ nghe/xem khi thiết bị
thiếu/bị từ chối; thay quy tắc bắt buộc capture cả hai của v0.2. Tham gia trực tiếp, không duyệt.
Chỉ gửi yêu cầu khi socket đã connected; timeout ACK tạo/join là 5 giây tính từ khi gửi.
ACK ok:false phải báo UI và giải phóng capture. Khi timeout, client giải phóng media,
ngắt socket của tab để server dọn membership có thể đã tạo; lần thử lại dùng kết nối mới.
UI không tự join lại khi socket reconnect.

Client leave đóng peer và stop media ngay, không chờ ACK. Server xử lý leave lặp an toàn,
xóa membership và phát peer:left đúng một lần, kể cả khi disconnect đến sau leave.
Chi tiết timeout ACK leave và phản hồi leave với roomId không khớp còn cần chốt.

Mã lỗi chung: INVALID_INPUT, ROOM_NOT_FOUND, ROOM_FULL,
ALREADY_IN_OTHER_ROOM, INTERNAL_ERROR. UI xử lý theo code và hiển thị message.
Cách phản hồi signaling không hợp lệ còn cần thành viên 1 thống nhất; server không được relay.

payload là đúng một trong hai dạng:

```js
{ description: { type: "offer", sdp: "..." } } // hoặc type: "answer"
{ candidate: { candidate: "...", sdpMid: "0", sdpMLineIndex: 0, usernameFragment: "..." } }
```

V0.3 giữ quy tắc gửi các candidate không null; không gửi null candidate đánh dấu kết thúc.
Client phải dùng candidate.toJSON() và pc.localDescription.toJSON().
Không gửi RTCPeerConnection/MediaStream qua Socket.IO.

## Trình tự và xử lý race

Server cập nhật membership trước, trả ACK cho người mới và phát peer:joined cho người cũ.
Đăng ký listener trước khi gửi create/join. Trong lúc đợi ACK, đệm sự kiện của phiên tham gia;
sau khi biết roomId chuẩn, chỉ xử lý sự kiện đúng phòng. Với join có thể lọc phòng ngay từ đầu;
sau ACK mới tạo peers và xử lý lần lượt. Mỗi peer cần chuỗi tác vụ SDP/ICE tuần tự.
Hai bên có thể nhận onnegotiationneeded khi addTrack: dùng perfect negotiation.
Quy tắc polite = selfId > peerId theo phép so sánh chuỗi JS, để hai bên
luôn có vai trò đối nghịch.

Đệm ICE khi chưa có remoteDescription, flush sau setRemoteDescription thành công.
Không tạo peer cho sender không có trong membership. Bỏ qua tín hiệu peer đã rời.
Close peer khi peer:left; teardown listener khi rời để lần join sau không bị nhân đôi.
Disconnect signaling: đóng các peer và media, báo UI yêu cầu join lại ở bản đầu.
Reconnect lấy socket.id mới: không tái dùng peer hoặc bản tin từ phiên cũ.
Chính sách tự khôi phục phiên và generation IDs dành cho bước nâng cấp.

## Các điểm cần thành viên 1 xác nhận

Tên event, định dạng ACK, khóa peerId, danh sách peers, room capacity,
ai phát peer:joined, chuyển tiếp SDP/ICE, thứ tự xử lý join,
chính sách leave/disconnect và lỗi join.
Adapter hiện tại mới có joinRoom, sendSignal và leaveRoom không ACK;
chưa có createRoom hay xử lý timeout/disconnect theo v0.3. Đây là hợp đồng mục tiêu,
không phải xác nhận code đã hỗ trợ các hành vi trên.

## Bổ sung từ thỏa thuận UI (chưa chốt event/payload)

- Presence: mic/camera/khả dụng thiết bị; server gắn peerId, kiểm tra membership, broadcast
  đúng phòng. Join cần snapshot tên/trạng thái và người đang share hiện tại nhất quán với sự kiện.
- Share: server cấp quyền nguyên tử cho duy nhất một người/phòng; giải phóng khi hủy capture,
  lỗi, dừng, leave hoặc disconnect. Cần chốt token/phiên và timeout quyền đang chờ capture
  để tránh stop cũ xóa quyền mới hoặc quyền bị giữ mãi khi hộp chọn còn mở.
- Camera và screen gửi riêng cùng micro và audio tab nếu hỗ trợ. Core cần ánh xạ track/stream;
  server chỉ relay metadata/SDP/ICE, không nhận media.
- Chat văn bản trong phòng, tên/thời gian, không file/lịch sử server. Người mới nhận tin từ lúc join.
  Cần chốt event/payload, validation/giới hạn và nguồn timestamp với thành viên 1/3 thật.

Các hành vi trên đã được người dùng đồng ý khi đóng vai thành viên 3.
Bảng bản tin phần trước vẫn mô tả phòng/SDP/ICE; chưa đủ để tích hợp presence/share/chat.

## Môi trường phát triển và triển khai

- Ban đầu frontend/demo tại http://localhost:5173, backend tại http://localhost:3000.
  Backend cấu hình CORS cho origin frontend. Địa chỉ signaling được cấu hình bên ngoài core.
- Thử hai tab trên một máy trước để kiểm tra signaling; dùng hai thiết bị và tai nghe
  để xác nhận audio/video thực tế. localhost chỉ trỏ về chính thiết bị đang sử dụng.
- Sau mốc gọi hai người hoạt động trên máy, triển khai bản thử HTTPS lên cloud có gói miễn phí
  để kiểm tra nhiều thiết bị/khác mạng. Chưa chốt nhà cung cấp.
- Có thể phục vụ frontend và Socket.IO cùng origin trên cloud; nếu tách origin phải cấu hình CORS.
- Nếu hosting ngủ khi không hoạt động, đợi socket connected rồi mới gửi create/join
  và bắt đầu timeout ACK. Không tính thời gian khởi động hosting vào timeout ACK 5 giây.
- STUN/TURN và hosting web/signaling là các phần riêng. Cần nhóm chốt dịch vụ,
  người quản lý và cấu hình; không coi hosting miễn phí là bảo đảm TURN miễn phí.
