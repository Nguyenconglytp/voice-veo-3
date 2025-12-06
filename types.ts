
export interface QueueItem {
  id: string;
  text: string;
  voiceName: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  audioData?: AudioBuffer; // Store decoded audio buffer for playback
  rawAudio?: Uint8Array;   // Store raw PCM data for download
  selected?: boolean;      // For bulk actions
  speed?: number;          // Playback speed
}

export enum LDVoice {
  // --- GIỌNG HOT TREND (THEO YÊU CẦU) ---
  HOT_REVIEW_BDS = 'Review Bất Động Sản (Sang Trọng/Triệu Đô)',
  HOT_TIN_GIAO_THONG = 'Tin Tức Giao Thông (Cảnh Báo/Gay Cấn)',

  // --- REVIEW SẢN PHẨM (HOT TREND) - NAM ---
  REVIEW_SP_NAM_1 = 'Review SP Nam 1 - Công Nghệ (Hiện đại/Nhanh)',
  REVIEW_SP_NAM_2 = 'Review SP Nam 2 - Xe Hơi/Xe Sang (Trầm/Ngầu)',
  REVIEW_SP_NAM_3 = 'Review SP Nam 3 - Unboxing (Hào hứng)',
  REVIEW_SP_NAM_4 = 'Review SP Nam 4 - Ẩm Thực/Food (Gần gũi)',
  REVIEW_SP_NAM_5 = 'Review SP Nam 5 - Bất Động Sản (Uy tín)',
  REVIEW_SP_NAM_6 = 'Review SP Nam 6 - Livestream Sale (Thúc giục)',
  REVIEW_SP_NAM_7 = 'Review SP Nam 7 - TikTok Trend (Năng động)',
  REVIEW_SP_NAM_8 = 'Review SP Nam 8 - Đồng Hồ/Trang Sức (Lịch lãm)',
  REVIEW_SP_NAM_9 = 'Review SP Nam 9 - Du Lịch/Trải Nghiệm (Vui vẻ)',
  REVIEW_SP_NAM_10 = 'Review SP Nam 10 - Sách/Khóa Học (Chuyên gia)',

  // --- REVIEW SẢN PHẨM (HOT TREND) - NỮ ---
  REVIEW_SP_NU_1 = 'Review SP Nữ 1 - Mỹ Phẩm/Beauty (Sang chảnh)',
  REVIEW_SP_NU_2 = 'Review SP Nữ 2 - Thời Trang/Haul (Phấn khích)',
  REVIEW_SP_NU_3 = 'Review SP Nữ 3 - Mẹ & Bé (Tin cậy/Ấm áp)',
  REVIEW_SP_NU_4 = 'Review SP Nữ 4 - Đồ Gia Dụng (Nhẹ nhàng)',
  REVIEW_SP_NU_5 = 'Review SP Nữ 5 - Food Reviewer (Dễ thương)',
  REVIEW_SP_NU_6 = 'Review SP Nữ 6 - Chốt Đơn/Sale (Nhanh/Gắt)',
  REVIEW_SP_NU_7 = 'Review SP Nữ 7 - Spa/Thẩm Mỹ (Thư giãn)',
  REVIEW_SP_NU_8 = 'Review SP Nữ 8 - Khách Sạn/Resort (Cao cấp)',
  REVIEW_SP_NU_9 = 'Review SP Nữ 9 - Đồ Ăn Vặt (Teen/Nhí nhảnh)',
  REVIEW_SP_NU_10 = 'Review SP Nữ 10 - Voice Doanh Nghiệp (Chuyên nghiệp)',

  // --- CUSTOM REQUESTED ---
  MAI_TUAN_TAI_1 = 'Mai Tuấn Tài 1 (LD Pro)',
  MAI_TUAN_TAI_2 = 'Mai Tuấn Tài 2 (LD Pro)',

  // --- MIỀN BẮC (NORTH) - NAM (MALE) ---
  NAM_BAC_1 = 'Nam Bắc 1 - Tin Tức VTV (Chuyên nghiệp)',
  NAM_BAC_2 = 'Nam Bắc 2 - Phóng Sự (Trầm ấm)',
  NAM_BAC_3 = 'Nam Bắc 3 - Đọc Truyện (Truyền cảm)',
  NAM_BAC_4 = 'Nam Bắc 4 - Review Phim (Sôi động)',
  NAM_BAC_5 = 'Nam Bắc 5 - Tài Liệu (Nghiêm túc)',
  NAM_BAC_6 = 'Nam Bắc 6 - MC Sự Kiện (Vang)',
  NAM_BAC_7 = 'Nam Bắc 7 - Quảng Cáo (Hào hứng)',
  NAM_BAC_8 = 'Nam Bắc 8 - Đọc Thơ (Nhẹ nhàng)',
  NAM_BAC_9 = 'Nam Bắc 9 - Kể Chuyện Đêm (Sâu lắng)',
  NAM_BAC_10 = 'Nam Bắc 10 - Thuyết Minh (Rõ ràng)',

  // --- MIỀN BẮC (NORTH) - NỮ (FEMALE) ---
  NU_BAC_1 = 'Nữ Bắc 1 - Cô Giáo (Dịu dàng)',
  NU_BAC_2 = 'Nữ Bắc 2 - Tin Tức (Sắc sảo)',
  NU_BAC_3 = 'Nữ Bắc 3 - Trợ Lý Ảo (Thân thiện)',
  NU_BAC_4 = 'Nữ Bắc 4 - Kể Chuyện Bé (Ngọt ngào)',
  NU_BAC_5 = 'Nữ Bắc 5 - Review Mỹ Phẩm (Tự nhiên)',
  NU_BAC_6 = 'Nữ Bắc 6 - Thông Báo (Chuẩn mực)',
  NU_BAC_7 = 'Nữ Bắc 7 - Podcast (Thư giãn)',
  NU_BAC_8 = 'Nữ Bắc 8 - Sách Nói (Cảm xúc)',
  NU_BAC_9 = 'Nữ Bắc 9 - Hướng Dẫn Viên (Vui vẻ)',
  NU_BAC_10 = 'Nữ Bắc 10 - Tổng Đài (Chuyên nghiệp)',

  // --- MIỀN NAM (SOUTH) - NAM (MALE) ---
  NAM_NAM_1 = 'Nam Nam 1 - MC Giải Trí (Vui tính)',
  NAM_NAM_2 = 'Nam Nam 2 - Vlog Đời Sống (Gần gũi)',
  NAM_NAM_3 = 'Nam Nam 3 - Đọc Báo (Rõ ràng)',
  NAM_NAM_4 = 'Nam Nam 4 - Review Công Nghệ (Hiện đại)',
  NAM_NAM_5 = 'Nam Nam 5 - Kể Chuyện Ma (Rùng rợn)',
  NAM_NAM_6 = 'Nam Nam 6 - Bình Luận Game (Nhanh)',
  NAM_NAM_7 = 'Nam Nam 7 - Radio Cảm Xúc (Ấm áp)',
  NAM_NAM_8 = 'Nam Nam 8 - Sale Bán Hàng (Thuyết phục)',
  NAM_NAM_9 = 'Nam Nam 9 - Phim Lồng Tiếng (Hài)',
  NAM_NAM_10 = 'Nam Nam 10 - Thầy Giáo (Điềm đạm)',

  // --- MIỀN NAM (SOUTH) - NỮ (FEMALE) ---
  NU_NAM_1 = 'Nữ Nam 1 - Chị Google (Quen thuộc)',
  NU_NAM_2 = 'Nữ Nam 2 - Tâm Sự (Ngọt ngào)',
  NU_NAM_3 = 'Nữ Nam 3 - Review Ăn Uống (Dễ thương)',
  NU_NAM_4 = 'Nữ Nam 4 - Tin Tức Giải Trí (Năng động)',
  NU_NAM_5 = 'Nữ Nam 5 - Đọc Truyện Ngôn Tình (Lãng mạn)',
  NU_NAM_6 = 'Nữ Nam 6 - Tổng Đài Viên (Nhẹ nhàng)',
  NU_NAM_7 = 'Nữ Nam 7 - Quảng Cáo Spa (Sang trọng)',
  NU_NAM_8 = 'Nữ Nam 8 - Hướng Dẫn Nấu Ăn (Ấm cúng)',
  NU_NAM_9 = 'Nữ Nam 9 - Kể Chuyện Cổ Tích (Cao vút)',
  NU_NAM_10 = 'Nữ Nam 10 - MC Truyền Hình (Thanh lịch)',

  // --- GIỌNG ĐẶC BIỆT & REVIEW PRO ---
  REVIEW_PHIM_PRO_1 = 'Review Phim Pro 1 (Action/Hành Động)',
  REVIEW_PHIM_PRO_2 = 'Review Phim Pro 2 (Drama/Kịch Tính)',
  REVIEW_PHIM_PRO_3 = 'Review Phim Pro 3 (Recap Nhanh)',
  REVIEW_PHIM_PRO_4 = 'Review Phim Pro 4 (Kinh Dị/Rùng Rợn)',
  REVIEW_PHIM_PRO_5 = 'Review Phim Pro 5 (Anime/Hoạt Hình)',
  SPECIAL_1 = 'Giọng AI - Robot (Futuristic)',
  SPECIAL_2 = 'Giọng Cổ Điển - Kể Sử (Hùng hồn)',
  SPECIAL_3 = 'Giọng Thì Thầm - ASMR (Thư giãn)',
  SPECIAL_4 = 'Giọng Hét - Cổ Vũ (Sôi động)',
  SPECIAL_5 = 'Giọng Lão Thành - Ông Già (Trầm khàn)',

  // --- ORIGINAL GEMINI ---
  KORE = 'Kore (Original)',
  PUCK = 'Puck (Original)',
  CHARON = 'Charon (Original)',
  FENRIR = 'Fenrir (Original)',
  ZEPHYR = 'Zephyr (Original)',
}

export interface AppConfig {
  licenseKey: string;
  isLicensed: boolean;
  selectedVoice: LDVoice;
  mastering: {
    delay: number;
    stability: number;
    similarity: number;
    speed: number;
  };
  expiryTimestamp?: number | null; // Timestamp for expiration (null = lifetime)
}

export type TabType = 'edit' | 'file' | 'subtitle';