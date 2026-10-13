# Checklist kiểm thử

**Hiện trạng:** kiểm tra cú pháp/import và phục vụ HTTP có thể chạy trong môi trường
tạo bộ khung. Người dùng đã xác nhận cấp quyền camera/micro được trên demo local
sau khi sửa đường dẫn CSS/JS. Chưa có biên bản kiểm thử phần cứng đầy đủ,
cuộc gọi, NAT hoặc TURN. Checklist dưới đây là kế hoạch; chưa được đánh dấu PASS toàn bộ.

| Bước | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| Media local | Mở camera & micro, cấp quyền | Video local, audio track tồn tại |
| Quyền | Từ chối camera/mic | Thông báo lỗi, nút thử lại dùng được |
| Chuẩn bị | Tắt mic/camera trước join | Giữ đúng lựa chọn, chưa có membership trước xác nhận |
| Thiếu thiết bị | Từ chối một hoặc cả hai thiết bị | Vẫn vào với nguồn khả dụng hoặc chỉ nghe/xem, nhận được remote media |
| Mute | Tắt/bật mic trong cuộc gọi thật | Peer không/nghe tiếng, kết nối giữ nguyên |
| Camera | Tắt/bật camera | Track enabled đổi, không tái tạo peer |
| Screen local | Chọn màn hình rồi Stop sharing của browser | Preview dừng, track screen được stop |
| Cancel share | Hủy hộp chọn màn hình | Không thay camera, có phản hồi |
| Cleanup | Giải phóng/rời | Track ended, camera indicator tắt, peers đóng |
| 2 người | Join cùng phòng | Mỗi bên có 1 pc và audio/video hai chiều |
| Offer collision | Join gần đồng thời | Perfect negotiation giải quyết, không kẹt signaling |
| ICE race | Cố tình xử lý candidate trước SDP trong harness | Đệm ICE, flush đúng, không InvalidStateError |
| 3 người | Join lần lượt rồi gần đồng thời | Mỗi máy có 2 pc |
| 5 người | Join đủ 5 | Mỗi máy có 4 pc, 10 cặp toàn phòng |
| 7 người | Join đủ 7 | Mỗi máy có 6 pc, 21 cặp toàn phòng; ghi nhận tải và chất lượng thực tế |
| Capacity | Người thứ 8 join | Server trả ROOM_FULL, client cleanup |
| Tạo phòng | Capture rồi room:create | Mã 6 ký tự, người tạo đã ở phòng, peers rỗng |
| Tên hiển thị | Nhập "  Ngô Nhật Linh  ", tên trùng, toàn khoảng trắng hoặc dài hơn 50 ký tự | Trim đầu/cuối, giữ khoảng trắng giữa từ, cho phép trùng; từ chối tên rỗng/quá dài bằng INVALID_INPUT |
| Mã phòng | Nhập mã khác hoa/thường hoặc mã không tồn tại | Chuẩn hóa đúng hoặc ROOM_NOT_FOUND |
| Phòng trống | Người cuối rời rồi join lại mã cũ | ROOM_NOT_FOUND |
| Join lặp | Cùng socket join lại phòng hiện tại | Không thêm membership hay phát peer:joined lần nữa |
| Đổi phòng | Cùng socket join phòng khác khi chưa leave | ALREADY_IN_OTHER_ROOM |
| Nhiều tab | Hai tab vào hai phòng khác nhau | Mỗi tab có peerId riêng, signaling không lẫn phòng |
| ACK timeout | Server đã thêm thành viên nhưng ACK không đến | Client dọn media, ngắt socket; server dọn membership khi disconnect |
| Hosting khởi động | Socket chưa connected | Chưa gửi create/join, chưa đếm timeout ACK 5 giây |
| Share trong Mesh | A share, B/C xem | Camera và screen A riêng, mic A hoạt động; screen lớn và camera nhỏ |
| Audio tab | Share tab phát tiếng | Nghe tiếng tab cùng micro, không phát trùng; mute mic không mute tab |
| Thiếu audio tab | Capture không trả audio tab | Vẫn share hình/micro, có thông báo |
| Share cạnh tranh | A/B bắt đầu gần đồng thời | Server chỉ cấp quyền một người; UI đồng bộ người đang share |
| Hủy share | Hủy hộp chọn nguồn/lỗi capture | Không còn nguồn share/quyền bị giữ, người khác có thể share |
| Đổi tab | Dùng điều khiển đổi tab của browser nếu có | Nguồn hiển thị đổi đúng; nếu không có, stop rồi chọn lại |
| Late join | D join khi A đang share | D nhận camera/screen và snapshot mic/camera/người share |
| Restore | A stop share khi camera muted | Screen/audio tab dừng, camera vẫn muted, quyền server được trả |
| Partial failure | Gửi nguồn share tới một peer thất bại | Dọn nguồn/quyền hoặc báo trạng thái từng peer nhất quán |
| Presence | Tắt mic/camera ở A | Máy khác hiện avatar/mic chéo đỏ đúng, không suy từ remote track.enabled |
| Chat | Gửi văn bản rồi D join | Tên/thời gian đúng, chỉ cùng phòng nhận, D không nhận lịch sử trước join |
| Leave/rejoin | Rời rồi vào lại nhiều lần | Không tăng listener/peer rác |
| Đóng tab | Một người đóng tab | Server báo peer:left, người còn lại cleanup |
| Signaling loss | Ngắt kết nối server | UI báo mất kết nối, yêu cầu join lại |
| NAT | Hai máy ở hai mạng khác nhau | ICE chọn được candidate pair hoặc báo failed |
| TURN | Cấu hình TURN, thử iceTransportPolicy relay | Candidate pair relay và gọi thành công |
| Bitrate | Camera 800 kbps/1,5 Mbps, screen 1,5–2 Mbps ở 2/5/7 người | Stats riêng từng nguồn, đo tổng upload, chất lượng và tải để chọn cấu hình |
| HTTPS | Truy cập từ máy khác | API capture có mặt và xin quyền hoạt động |

Tránh đánh giá audio bằng hai tab dùng cùng loa/mic: dễ vọng.
Dùng hai thiết bị và tai nghe khi kiểm thử thật.

Biên bản mỗi lần: ngày, browser/version, máy/mạng, cấu hình ICE,
số peer, kịch bản, kỳ vọng, kết quả, lỗi và log đã loại thông tin nhạy cảm.
Không ghi SDP hoặc candidate chứa địa chỉ nội bộ vào tài liệu công khai.
