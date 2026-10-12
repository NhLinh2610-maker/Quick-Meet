# Signaling protocol đề xuất v0.1

**Cần thống nhất với thành viên 1 trước khi triển khai Mesh.**
Server Socket.IO phải tương thích adapter; WebSocket thuần không dùng chung wire protocol.
Adapter mẫu yêu cầu socket client hỗ trợ timeout().emitWithAck().

## Danh tính và phòng

roomId là định danh phòng, peerId dùng socket.id cho phiên hiện tại.
ACK join trả selfId từ server; client không tự khai from.
Server kiểm tra thành viên cùng phòng, target hợp lệ và giới hạn tối đa 5 người.
Các quy tắc validation/authorization là trách nhiệm server.

## Bản tin

| Hướng | Event | Nội dung |
| --- | --- | --- |
| C → S | room:join | { roomId, displayName } |
| S → C ACK | ACK của room:join | { ok: true, roomId, selfId, peers: [{ peerId, displayName }] } |
| S → C ACK lỗi | ACK của room:join | { ok: false, error: { code, message } } |
| S → các người cũ | peer:joined | { roomId, peerId, displayName } |
| C → S | webrtc:signal | { roomId, to, payload } |
| S → C đích | webrtc:signal | { roomId, from, payload } |
| C → S | room:leave | { roomId } |
| S → người còn lại | peer:left | { roomId, peerId } |

peers trong ACK không gồm self. join timeout hoặc ok:false phải báo UI
và giải phóng capture nếu không tiếp tục tham gia.
room:leave và disconnect cần cùng xử lý xóa thành viên và thông báo đúng một lần.

payload là đúng một trong hai dạng:

```js
{ description: { type: "offer", sdp: "..." } } // hoặc type: "answer"
{ candidate: { candidate: "...", sdpMid: "0", sdpMLineIndex: 0, usernameFragment: "..." } }
```

V0.1 gửi các candidate không null; không gửi null candidate đánh dấu kết thúc.
Client phải dùng candidate.toJSON() và pc.localDescription.toJSON().
Không gửi RTCPeerConnection/MediaStream qua Socket.IO.

## Trình tự và xử lý race

Đăng ký listener trước khi gửi join. Trong lúc đợi ACK, đệm sự kiện cùng phòng;
sau ACK mới tạo peers và xử lý lần lượt. Mỗi peer cần chuỗi tác vụ SDP/ICE tuần tự.
Hai bên có thể nhận onnegotiationneeded khi addTrack: dùng perfect negotiation.
Đề xuất polite = selfId > peerId theo phép so sánh chuỗi JS, để hai bên
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
Nếu server đã có protocol, sửa adapter và tài liệu cho khớp server thật.
