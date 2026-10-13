# Hợp đồng UI/Core đề xuất v0.3

Hành vi đã thống nhất với người dùng trong phiên đóng vai thành viên 3;
cần thành viên 3 thật xác nhận. API sau là mục tiêu triển khai; MeshClient vẫn là bộ khung.
UI gọi facade thay vì trực tiếp đụng RTCPeerConnection.

## Công nghệ và trách nhiệm

Frontend dùng React + Vite. Cấu trúc mục tiêu: src/core/ cho media/WebRTC/signaling,
src/components/, src/pages/ cho UI, src/hooks/ cho phần tích hợp.
Thành viên 2 sở hữu core; thành viên 3 sở hữu UI, video grid, chat/presence và recording.
Thành viên 1 quản lý phòng, relay và trạng thái/quyền phía server.
Frontend tạo một bộ socket, adapter, media, screen và MeshClient mỗi tab.
Đổi API/sự kiện phải cập nhật hợp đồng và báo nhau; một người thực hiện chuyển thư mục/import.
Hiện chưa chuyển src/ sang src/core/, chưa cài React/Vite.

## API mục tiêu

| Method | Ý nghĩa |
| --- | --- |
| prepareMedia() | API mới đề xuất: chuẩn bị preview với thiết bị khả dụng; signature cần chốt |
| create({ displayName }) | Dùng lựa chọn media đã chuẩn bị, tạo phòng và tham gia, nhận roomId |
| join({ roomId, displayName }) | Dùng lựa chọn media đã chuẩn bị, join ACK, kết nối các peer |
| setMicEnabled(boolean) | Bật/tắt audio track local |
| setCameraEnabled(boolean) | Bật/tắt camera track local |
| startScreenShare() | Từ click, điều phối quyền share và capture; gửi screen riêng cùng audio tab nếu có |
| stopScreenShare() | Dừng nguồn share, giải phóng quyền; giữ camera/mic |
| setVideoBitrate(bitsPerSecond) | Cần mở rộng API để phân biệt sender camera và screen |
| leave() | Báo server, đóng peer, stop thiết bị, gỡ listener |
| on(event, listener) | Đăng ký sự kiện; trả hàm unsubscribe |

Theo quyết định của người dùng: tạo phòng tách khỏi nhập mã để join, tối đa 7 người/phòng,
quyền ngang nhau, tên được trùng và giữ khoảng trắng giữa các từ. Tên được trim đầu/cuối,
không được rỗng sau trim và tối đa 50 ký tự; UI kiểm tra sớm, server kiểm tra khi create/join.
Mỗi tab ở một phòng;
có thể mở nhiều tab vào các phòng khác nhau. Mất signaling hoặc reload yêu cầu tham gia lại.
create và prepareMedia chưa có trong MeshClient.
Chờ socket connected rồi mới gửi yêu cầu và đếm ACK 5 giây.
Khi ACK bị từ chối hoặc timeout phải dọn media; timeout còn ngắt socket theo SIGNALING.md.

## Luồng giao diện

- Trang bắt đầu có tên, nút Tạo phòng, mã phòng và nút Tham gia. Sau thao tác của người dùng,
  mở bước chuẩn bị xin quyền, preview và chỉnh mic/camera; không xin quyền ngay khi mở trang.
- Mặc định bật mic/camera nếu khả dụng, cho phép tắt một hoặc cả hai trước khi tham gia.
  Giữ đúng lựa chọn khi vào phòng; dùng lại capture đã chuẩn bị thay vì xin lại.
- Nếu thiếu thiết bị/bị từ chối, cho phép dùng nguồn còn lại hoặc chỉ nghe/xem,
  thông báo rõ thiết bị không khả dụng. Quy tắc này thay yêu cầu bắt buộc có cả hai trước đây.
- Chuẩn bị chưa tạo membership. Người dùng xác nhận Tạo phòng hoặc Tham gia trực tiếp,
  không có bước duyệt. UI hiển thị tiến trình, khóa thao tác lặp; vào phòng sau ACK thành công.
- Thất bại giữ tên/mã để thử lại. Hủy chuẩn bị, leave hoặc mất signaling đều dọn capture.
  Leave về trang bắt đầu; mất signaling thêm thông báo lý do. Không tự tham gia lại.
- Trong phòng hiển thị mã kèm sao chép, số người n/7, tên và nhãn Bạn cho local.
  Lưới tối đa 7 người, khóa theo peerId thay vì tên. Camera tắt dùng avatar chữ cái đầu;
  mic tắt có biểu tượng mic chéo đỏ gần tên.

| Event dự kiến của MeshClient | Payload | UI xử lý |
| --- | --- | --- |
| local-stream | MediaStream hoặc null | Preview muted |
| remote-stream | Cần bổ sung phân loại camera/screen và nguồn audio; payload cuối chưa chốt | Tạo/cập nhật ô và phát audio một lần |
| screen-stream | Stream share local riêng hoặc null | Preview share |
| peer-state | { peerId, connectionState } | Trạng thái kết nối |
| peer-left | { peerId } | Gỡ ô video |
| media-state | Trạng thái mic/camera/share và khả dụng thiết bị; payload mở rộng cần chốt | Đồng bộ nút |
| error | { code, message, peerId? } | Thông báo |

Mesh cần forward sự kiện media/screen lên facade; hiện chưa làm.
Cần dữ liệu danh sách thành viên (tên/trạng thái), người đang share và trạng thái phiên
để UI hiển thị tiến trình/mất kết nối. Tên event/payload cuối cần đồng bộ SIGNALING.md.
Người mới nhận snapshot hiện tại và các stream, kể cả camera/screen của người đang share.

Với React, tạo client một lần bằng useRef và subscribe trong useEffect.
Cleanup effect gọi unsubscribe; khi thực sự rời phòng gọi leave.
Không khởi tạo socket hay PeerConnection ở mỗi render.
UI xử lý Promise rejection và khóa nút cho thao tác async để tránh double-click.
Không tự động xin share screen khi mount.

## Chia sẻ và âm thanh

- Mỗi phòng chỉ một người share; backend cấp quyền độc quyền khi có cạnh tranh.
  Người khác thấy ai đang share và nút bị khóa. Dừng/rời/disconnect phải giải phóng quyền.
- Người dùng chọn tab/cửa sổ/màn hình bằng hộp thoại trình duyệt từ click.
  Gửi camera và screen video riêng; giữ camera người share ở ô nhỏ, screen ở ô lớn.
  Thiết kế này thay cách replaceTrack camera bằng màn hình trước đây.
- Gửi audio tab cùng micro nếu capture hỗ trợ. Không lấy được audio tab thì vẫn gửi hình/micro
  và thông báo. Mute mic chỉ tác động micro; camera off không tắt share.
- Stop trên UI hoặc trình duyệt dừng nguồn share, giữ trạng thái camera/mic và trở về lưới camera.
  Hủy chọn nguồn/lỗi phải trả quyền đã giữ. Đổi tab qua điều khiển trình duyệt nếu có,
  nếu không dừng rồi chọn lại. Chưa làm bộ chọn tab riêng trong ứng dụng.
- Phải chốt ánh xạ stream/track và cách truyền/mix audio để tránh phát trùng audio.
  Cần điều phối quyền share bất đồng bộ mà vẫn gọi getDisplayMedia từ user activation;
  xử lý timeout/quyền đang giữ khi hộp chọn nguồn còn mở.

## Bitrate, chat và recording

- Chưa đưa thanh bitrate vào UI người dùng. Thử camera 800 kbps/1,5 Mbps,
  screen 1,5–2 Mbps ở phòng 2, 5 và 7 người; chọn cấu hình theo số đo thực tế.
  Trần áp riêng từng sender, tính tổng camera và screen. Ví dụ camera 800 kbps + screen 2 Mbps
  gửi tới 6 peers tương ứng tổng trần video 16,8 Mbps tại người share, chưa tính audio/overhead.
- Chat văn bản trong phòng, tên/thời gian; chưa file/lịch sử server. Người mới nhận tin từ lúc join.
  Thành viên 3 phối hợp thành viên 1 chốt protocol chat.
- Recording làm sau khi gọi/share/chat ổn định. Ghi local hay toàn phòng còn cần chốt;
  ghi toàn phòng cần các remote streams, ghép video và trộn audio riêng.

Không truyền stream từ server: stream được tạo/nhận bằng API browser phía client.
Thông tin người tham gia, trạng thái mute từ xa cần protocol presence riêng,
không suy ra chỉ từ track.enabled phía nhận.
