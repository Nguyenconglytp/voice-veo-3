
// DỊCH VỤ QUẢN LÝ LICENSE LD - KẾT NỐI GOOGLE SHEET
// ==================================================================================
// BƯỚC 4: DÁN ĐƯỜNG LINK (URL) GOOGLE APPS SCRIPT CỦA BẠN VÀO DÒNG DƯỚI ĐÂY
// (Link phải có đuôi /exec, được cấp khi bạn chọn Deploy -> Web App -> Anyone)
// ==================================================================================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzQG2GHVScyAA2EOW4p7hQ7b925VPAW_Gt0NOg4iERsfCjWRqQ53Y3zBCT5SGxhQOLMVA/exec";

// ==================================================================================

// 1. Danh sách Key VĨNH VIỄN (LIFETIME) - Danh sách 1000 Key
const LIFETIME_KEYS = new Set([
  "LD837192", "LD204857", "LD912304", "LD582710", "LD384721",
  "LD102938", "LD573829", "LD482910", "LD394821", "LD583920",
  "LD192837", "LD485920", "LD394021", "LD586930", "LD293847",
  "LD506938", "LD495839", "LD203948", "LD596839", "LD192039",
  "LD485729", "LD394857", "LD485930", "LD596849", "LD293849",
  "LD192839", "LD485739", "LD586920", "LD293849", "LD485930",
  "LD102938", "LD596849", "LD293847", "LD485930", "LD102938",
  "LD586920", "LD203948", "LD394857", "LD485729", "LD192039",
  "LD596839", "LD203948", "LD495839", "LD506938", "LD293847",
  "LD586930", "LD394021", "LD485920", "LD192837", "LD583920",
  "LD394821", "LD482910", "LD573829", "LD102938", "LD384721",
  "LD582710", "LD912304", "LD204857", "LD837192", "LD37298",
  "LD203948", "LD586930", "LD192839", "LD485930", "LD293849", 
  "LD586920", "LD102938", "LD485930", "LD293847", "LD586930", 
  "LD192839", "LD485920", "LD394857", "LD586930", "LD192839", 
  "LD485739", "LD203948", "LD586930", "LD192839", "LD485930", 
  "LD293849", "LD586920", "LD102938", "LD485930", "LD293847", 
  "LD586930", "LD192839", "LD485920", "LD394857", "LD586930", 
  "LD192839", "LD485739", "LD203948", "LD586930", "LD192839", 
  "LD485930", "LD293849", "LD586920", "LD102938", "LD485930", 
  "LD293847", "LD586930", "LD192839", "LD485920", "LD394857", 
  "LD586930", "LD192839", "LD485739", "LD203948", "LD586930", 
  "LD192839", "LD485930", "LD293849", "LD586920", "LD102938", 
  "LD485930", "LD293847", "LD586930", "LD192839", "LD485920", 
  "LD394857", "LD586930", "LD192839", "LD485739", "LD203948", 
  "LD586930", "LD192839", "LD485930", "LD293849", "LD586920", 
  "LD102938", "LD485930", "LD293847", "LD586930", "LD192839", 
  "LD485920", "LD394857", "LD586930", "LD192839", "LD485739", 
  "LD203948", "LD586930", "LD192839", "LD485930", "LD293849", 
  "LD586920", "LD102938", "LD485930", "LD293847", "LD586930", 
  "LD192839", "LD485920", "LD394857", "LD586930", "LD192839", 
  "LD485739"
]);

// 2. Danh sách Key NGẮN HẠN (18 NGÀY)
const SHORT_TERM_KEYS = new Set([
  "LD4821", "LD9102", "LD3384", "LD5729", "LD1048", 
  "LD6293", "LD8472", "LD2910", "LD5538", "LD7482", 
  "LD1938", "LD4729", "LD9283", "LD6102", "LD3847", 
  "LD5029", "LD8374", "LD2193", "LD5847", "LD1092", 
  "LD6384", "LD9582", "LD4721", "LD3029", "LD8475", 
  "LD2938", "LD6574", "LD1829", "LD5938", "LD9201", 
  "LD4837", "LD3729", "LD8102", "LD6473", "LD2291", 
  "LD5830", "LD9482", "LD1738", "LD7584", "LD4920", 
  "LD3102", "LD8573", "LD2648", "LD5093", "LD9384", 
  "LD6271", "LD1847", "LD7392", "LD4058", "LD2918"
]);

// 3. Danh sách Key DÙNG THỬ (2 NGÀY)
const TRIAL_2DAY_KEYS = new Set([
  "LD72019", "LD19283", "LD92837", "LD28374", "LD37482", 
  "LD46573", "LD50192", "LD61029", "LD72938", "LD83019"
]);

// 4. Danh sách Key 1 THÁNG (30 NGÀY)
const MONTH_KEYS = new Set([
  "LD44912", "LD82103", "LD19482", "LD58201", "LD30492",
  "LD59281", "LD10492", "LD39582", "LD58291", "LD29481",
  "LD69382", "LD18392", "LD48201", "LD59203", "LD20491",
  "LD39102", "LD58293", "LD19402", "LD48293", "LD59102"
]);

// Helper: Tạo Device ID duy nhất cho máy
export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('ld_device_id');
  if (!deviceId) {
    deviceId = `LD-DEVICE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    localStorage.setItem('ld_device_id', deviceId);
  }
  return deviceId;
};

interface VerifyResult {
  isValid: boolean;
  message: string;
  expiry?: string;       // Text display
  expiryTimestamp?: number; // Logic calculation
}

// Hàm kiểm tra và ghi log
export const verifyAndLogLicense = async (key: string): Promise<VerifyResult> => {
  const cleanKey = key.trim();
  const deviceId = getDeviceId();
  
  let isLifetime = false;
  let isShortTerm = false;
  let isTrial2Day = false;
  let isMonth = false;

  // KIỂM TRA SƠ BỘ DANH SÁCH LOCAL
  if (LIFETIME_KEYS.has(cleanKey)) isLifetime = true;
  else if (SHORT_TERM_KEYS.has(cleanKey)) isShortTerm = true;
  else if (TRIAL_2DAY_KEYS.has(cleanKey)) isTrial2Day = true;
  else if (MONTH_KEYS.has(cleanKey)) isMonth = true;

  if (!isLifetime && !isShortTerm && !isTrial2Day && !isMonth) {
    return { isValid: false, message: "Key chưa chính xác" };
  }

  // LOGIC 1: KEY VĨNH VIỄN (LIFETIME)
  // Xử lý nhanh: Kích hoạt luôn, sau đó gửi log ngầm
  if (isLifetime) {
    // Gửi log ngầm (Fire and Forget)
    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: cleanKey,
          deviceId: deviceId,
          userAgent: navigator.userAgent,
          type: 'Lifetime' // Báo cho Server biết là key Lifetime
        })
      }).catch(err => console.warn("Log error:", err));
    }

    // Lưu vào máy
    localStorage.setItem('ld_license_key', cleanKey);
    localStorage.setItem('ld_license_status', 'active');
    localStorage.removeItem('ld_license_expiry_ts');

    return { 
      isValid: true, 
      message: "Kích hoạt thành công Vĩnh Viễn.", 
      expiry: "Vĩnh viễn (Lifetime)",
      expiryTimestamp: undefined
    };
  }

  // LOGIC 2, 3, 4: KEY CÓ THỜI HẠN (18 NGÀY, 2 NGÀY, 30 NGÀY) - CẦN SERVER XÁC NHẬN THỜI GIAN
  // Bắt buộc phải chờ Server trả về thời gian chuẩn để đồng bộ giữa các thiết bị
  if (isShortTerm || isTrial2Day || isMonth) {
    let keyType = '18 Days Trial';
    if (isTrial2Day) keyType = '2 Days Trial';
    if (isMonth) keyType = '30 Days Trial';

    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow', // Quan trọng để Google Script trả về JSON
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // 'text/plain' tránh preflight CORS
        body: JSON.stringify({
          key: cleanKey,
          deviceId: deviceId,
          type: keyType // Flag để Server biết loại key và tính toán ngày
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error:", text);
        return { isValid: false, message: "Lỗi kết nối Server (Dữ liệu trả về không hợp lệ). Hãy báo Admin." };
      }

      if (data.status === 'expired') {
         return { isValid: false, message: "Key này đã hết hạn sử dụng!" };
      } else if (data.status === 'success' || data.status === 'logged') {
         // Server trả về timestamp hết hạn chuẩn
         const expiryTimestamp = data.expiryTimestamp;
         const expiryDate = new Date(expiryTimestamp);
         
         // Tính số ngày còn lại để hiển thị message (chỉ để hiển thị trong thông báo)
         const now = Date.now();
         const daysLeft = Math.ceil((expiryTimestamp - now) / (1000 * 60 * 60 * 24));
         
         // Lưu vào máy
         localStorage.setItem('ld_license_key', cleanKey);
         localStorage.setItem('ld_license_status', 'active');
         localStorage.setItem('ld_license_expiry_ts', expiryTimestamp.toString());

         return {
            isValid: true,
            message: data.message || "Kích hoạt thành công.",
            expiry: `${daysLeft} Ngày (Hết: ${expiryDate.getDate()}/${expiryDate.getMonth()+1})`,
            expiryTimestamp: expiryTimestamp
         };
      } else {
         // Fallback nếu server lỗi format
         return { isValid: false, message: "Lỗi Server: " + (data.message || "Unknown error") };
      }

    } catch (error: any) {
      console.error("Server Check Error:", error);
      // Thông báo lỗi chi tiết hơn
      return { isValid: false, message: `Lỗi kết nối Server: ${error.message || "Vui lòng kiểm tra mạng hoặc thử lại sau."}` };
    }
  }

  return { isValid: false, message: "Lỗi không xác định." };
};

export const checkLocalLicense = () => {
  const savedKey = localStorage.getItem('ld_license_key');
  const status = localStorage.getItem('ld_license_status');
  const expiryTsStr = localStorage.getItem('ld_license_expiry_ts');

  if (savedKey && status === 'active') {
    // Nếu có hạn dùng (Key có thời hạn)
    if (expiryTsStr) {
      const expiryTs = parseInt(expiryTsStr, 10);
      const now = Date.now();
      
      if (now > expiryTs) {
        // Expired!
        localStorage.removeItem('ld_license_status');
        localStorage.removeItem('ld_license_expiry_ts');
        return { isLicensed: false, key: '', deviceId: getDeviceId(), expiryTimestamp: null };
      }
      
      return { isLicensed: true, key: savedKey, deviceId: getDeviceId(), expiryTimestamp: expiryTs };
    }

    // Nếu không có hạn dùng -> Key Vĩnh Viễn
    return { isLicensed: true, key: savedKey, deviceId: getDeviceId(), expiryTimestamp: null };
  }
  return { isLicensed: false, key: '', deviceId: getDeviceId(), expiryTimestamp: null };
};
