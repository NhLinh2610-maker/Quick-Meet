# Hiểu đề tài và phần việc thành viên 2

## Nội dung đã xác nhận từ PDF

Đồ án là ứng dụng họp trên web cho 3-5 người, kết hợp WebSocket/Socket.IO
để báo hiệu và WebRTC Full-Mesh để truyền âm thanh/hình ảnh.
Cốt lõi: tạo/tham gia/rời phòng, gọi audio/video, chia sẻ màn hình, chat.
Ghi hình client bằng MediaRecorder là tính năng điểm cộng.

Thành viên 1: server Node.js/Express/Socket.IO, quản lý phòng và người tham gia,
chuyển tiếp SDP/ICE, phát hiện ngắt kết nối.
Thành viên 2: vòng đời RTCPeerConnection, getUserMedia, Offer/Answer/ICE,
getDisplayMedia, replaceTrack và kiểm soát băng thông.
Thành viên 3: UI, video grid, thanh điều khiển, chat/presence và recording.

PDF có 5 trang. Phần mở đầu nói tới bộ câu hỏi phản biện, nhưng bản đính kèm
kết thúc ở bảng phân công và không chứa bộ câu hỏi đó.

## Quyết định cập nhật với người dùng

Phạm vi gốc trong tài liệu là 3-5 người; người dùng chọn mục tiêu tối đa 7 người/phòng.
Với 7 người mỗi máy có 6 kết nối, toàn phòng có 21 cặp; cần kiểm thử tải thực tế.
Đã thống nhất đề xuất signaling v0.3: tạo/join riêng, mã 6 ký tự, tên được trùng,
quyền ngang nhau, mỗi tab một phòng, phòng trống bị xóa và tham gia lại thủ công khi mất kết nối.
Phát triển bằng localhost, sau mốc gọi hai người triển khai bản thử HTTPS trên cloud miễn phí.
Chi tiết ở SIGNALING.md; đây là thiết kế đã thống nhất với người dùng,
còn cần thành viên 1 thật xác nhận, chưa có backend để tích hợp.
UI dùng React + Vite, cấu trúc mục tiêu src/core/, components/, pages/, hooks/.
Có bước preview/chỉnh mic/camera trước tham gia trực tiếp, cho phép thiếu thiết bị hoặc chỉ nghe/xem.
Mỗi phòng một người share do server quản lý; gửi camera và screen riêng, có tiếng tab cùng micro
nếu capture hỗ trợ. Chat văn bản không lịch sử server; recording làm sau khi gọi/share/chat ổn định.
Chi tiết ở UI-CONTRACT.md; cần thành viên 3 thật xác nhận, chưa triển khai UI mới.

## Những quyết định còn cần chốt

- Thành viên 1/3 xác nhận hợp đồng v0.3, chốt event/payload presence, share và chat.
- Timeout ACK leave và phản hồi signaling lỗi.
- Nhà cung cấp hosting miễn phí và cách đóng gói frontend/backend.
- STUN/TURN triển khai ở đâu và ai quản trị Coturn.
- Ánh xạ camera/screen/audio tab, truyền hoặc mix audio và điều phối quyền share/capture.
- Recording ghi local hay toàn bộ cuộc họp: thành viên 3 cần xác định.

Bộ khung chọn JS ES Modules để dễ ghép; protocol trong SIGNALING là đề xuất.
Socket.IO là thư viện vận chuyển signaling, không phải SDK hội nghị có sẵn.

## Các lớp kỹ thuật cần hiểu

1. **Capture:** MediaStream chứa các MediaStreamTrack audio/video.
   Camera và micro được cấp quyền trên trình duyệt. Track có trạng thái
   enabled để mute; stop kết thúc nguồn capture.
2. **Signaling:** client trao đổi SDP Offer/Answer và ICE candidates qua server.
   SDP mô tả khả năng media và phiên; không phải dữ liệu video.
3. **ICE/NAT:** ICE thử các đường kết nối; STUN giúp tìm địa chỉ phản xạ,
   TURN chuyển tiếp khi đường trực tiếp không thiết lập được.
4. **Transport:** browser bảo vệ media bằng SRTP với khóa được thương lượng
   qua DTLS. UDP là đường thường dùng; TURN có thể sử dụng TCP/TLS khi cần.
5. **Mesh:** mỗi máy giữ Map peerId → PeerConnection. Với N người,
   mỗi máy có N-1 kết nối; cả phòng có N(N-1)/2 cặp.

| Số người | Kết nối ở mỗi máy | Cặp kết nối cả phòng |
| --- | --- | --- |
| 2 | 1 | 1 |
| 3 | 2 | 3 |
| 4 | 3 | 6 |
| 5 | 4 | 10 |
| 7 | 6 | 21 |

Signaling server không nằm trên đường media thông thường.
Nếu ICE chọn relay, media đi qua TURN; khi đó không còn đường truyền trực tiếp.
STUN đơn thuần không bảo đảm mọi NAT/firewall đều kết nối được.
Mesh phù hợp phạm vi nhỏ của đề tài; tăng người sẽ tăng upload và công việc encode.

## Luồng phiên dự kiến

Người dùng mở bước chuẩn bị → xin các thiết bị khả dụng, chỉnh mic/camera → xác nhận tạo/join
→ server xác nhận phòng và danh sách peer/trạng thái hiện tại
→ tạo một PeerConnection mỗi người → addTrack → trao đổi SDP/ICE
→ nhận ontrack → UI gắn stream vào video element.
Khi rời, đóng peer, stop capture và gỡ listener.

## Điểm cần xử lý khi viết core

- Hai bên có thể cùng tạo Offer. Dùng perfect negotiation với polite/impolite
  để giải quyết collision thay vì luôn gọi createOffer khi nhận thông báo.
- ICE tới trước SDP phải được đệm và chỉ nạp khi remote description phù hợp.
  Candidates của Offer bị bỏ qua cũng cần xử lý nhất quán.
- Không đồng nhất signalingState, iceConnectionState và connectionState.
  disconnected có thể tạm thời; failed mới cần chính sách recovery.
- Screen sharing gửi screen riêng và giữ camera, có âm thanh tab cùng micro nếu hỗ trợ.
  Core phải ánh xạ đúng nguồn và thương lượng khi cần, không dùng replaceTrack để thay camera bằng screen.
- Stop sharing của browser dừng nguồn share và trả quyền server, giữ trạng thái camera/mic.
  Người mới nhận camera, screen và trạng thái share hiện tại.
- maxBitrate là trần theo sender, đơn vị bit/giây; không phải cam kết chất lượng.
  Ví dụ 800 kbps × 4 peer ≈ 3,2 Mbps video upload mục tiêu, chưa tính audio/overhead.
  Dùng getStats đo chênh lệch bytesSent theo thời gian để kiểm chứng.
- Localhost dùng cho development; truy cập từ máy khác cần HTTPS
  cho các API capture. getDisplayMedia cần thao tác người dùng.

## Nguồn để học và tra cứu

Đề cương: bản PDF 5 trang người dùng cung cấp.
Đã đối chiếu nguồn chính thức ngày 12/10/2026:

- WebRTC W3C: https://www.w3.org/TR/webrtc/
- Media Capture and Streams: https://www.w3.org/TR/mediacapture-streams/
- Screen Capture: https://www.w3.org/TR/screen-capture/
- Hướng dẫn peer connection của WebRTC: https://webrtc.org/getting-started/peer-connections-advanced
- Mẫu perfect negotiation: https://webrtc.github.io/samples/src/content/peerconnection/perfect-negotiation/

Tài liệu này giải thích kiến trúc và các điểm triển khai; không chứng nhận code
đã hoạt động với camera, NAT, TURN hoặc cuộc gọi nhiều người.
