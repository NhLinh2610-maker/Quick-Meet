# Checklist kiểm thử

**Hiện trạng:** kiểm tra cú pháp/import và phục vụ HTTP có thể chạy trong môi trường
tạo bộ khung. Chưa kiểm thử camera/mic, browser UI, gọi thật, NAT hoặc TURN.
Checklist dưới đây là kế hoạch; chưa được đánh dấu PASS.

| Bước | Thao tác | Kết quả mong đợi |
| --- | --- | --- |
| Media local | Mở camera & micro, cấp quyền | Video local, audio track tồn tại |
| Quyền | Từ chối camera/mic | Thông báo lỗi, nút thử lại dùng được |
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
| Capacity | Người thứ 6 join | Server từ chối có lý do, client cleanup |
| Share trong Mesh | A share, B/C xem | Mọi peer nhận screen, mic A vẫn hoạt động |
| Late join | D join khi A đang share | D nhận screen hiện tại |
| Restore | A stop share khi camera muted | Trở lại camera còn muted |
| Partial failure | Một replaceTrack thất bại | Rollback hoặc báo trạng thái từng peer đúng |
| Leave/rejoin | Rời rồi vào lại nhiều lần | Không tăng listener/peer rác |
| Đóng tab | Một người đóng tab | Server báo peer:left, người còn lại cleanup |
| Signaling loss | Ngắt kết nối server | UI báo mất kết nối, yêu cầu join lại |
| NAT | Hai máy ở hai mạng khác nhau | ICE chọn được candidate pair hoặc báo failed |
| TURN | Cấu hình TURN, thử iceTransportPolicy relay | Candidate pair relay và gọi thành công |
| Bitrate | Áp trần 300/800 kbps mỗi peer | setParameters thành công, stats phản ánh trần theo mạng |
| HTTPS | Truy cập từ máy khác | API capture có mặt và xin quyền hoạt động |

Tránh đánh giá audio bằng hai tab dùng cùng loa/mic: dễ vọng.
Dùng hai thiết bị và tai nghe khi kiểm thử thật.

Biên bản mỗi lần: ngày, browser/version, máy/mạng, cấu hình ICE,
số peer, kịch bản, kỳ vọng, kết quả, lỗi và log đã loại thông tin nhạy cảm.
Không ghi SDP hoặc candidate chứa địa chỉ nội bộ vào tài liệu công khai.
