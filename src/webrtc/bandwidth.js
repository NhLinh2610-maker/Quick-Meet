// Gọi khi sender có encodings, sau khi thương lượng.
// maxBitrate là trần mong muốn; bitrate thực tế còn tùy mạng và trình duyệt.
export async function setVideoBitrate(sender, bitsPerSecond) {
  if (sender.track?.kind !== "video") throw new Error("Cần một video sender.");
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) {
    throw new Error("Bitrate phải là số dương, tính bằng bit/giây.");
  }
  const parameters = sender.getParameters();
  if (!parameters.encodings?.length) {
    throw new Error("Sender chưa có encodings; hãy đợi thương lượng hoàn thành.");
  }
  for (const encoding of parameters.encodings) encoding.maxBitrate = bitsPerSecond;
  await sender.setParameters(parameters);
}
