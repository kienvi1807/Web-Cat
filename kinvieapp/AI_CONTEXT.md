# AI CONTEXT: KINVIE CATTERY & BEAM PETSHOP

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
Dự án là một hệ thống web tích hợp nhiều tính năng dành cho người yêu thú cưng:
- **KinVie Cattery**: Trang quản lý trại nhân giống mèo (hiện tại đang là mèo mainecoon) (Path: `/cattery`). Chức năng chính: Trưng bày profile mèo, xem phả hệ, thả tim (like), dịch mã màu EMS... Nói chung mục đích cuối là để bán mèo, hoặc làm sàn cho các trại mèo khác và ăn hoa hồng.
- **Beam Petshop**: Cửa hàng thương mại điện tử bán thức ăn (Pate, hạt, cát, pate tươi...) và phụ kiện cho thú cưng (Chủ yếu hiện tại là dành cho mèo) (Path: `/petshop`). Chức năng chính: Xem sản phẩm, lọc danh mục, giỏ hàng (Quick Add Modal), biến thể sản phẩm (Variant).
- **Cộng đồng KinVie (Feed)**: Không gian mạng xã hội thu nhỏ (Path: `/feed`) để các Sen giao lưu, chia sẻ khoảnh khắc và kinh nghiệm chăm sóc Boss. Như một phiên bản clone của Facebook.
- **Dây leo ký ức**: Khu vực lưu giữ những kỷ niệm, hành trình trưởng thành hoặc những câu chuyện đáng nhớ về các bé mèo (Memorial/History), tạo giá trị cảm xúc cốt lõi cho thương hiệu. Chức năng chính là sẽ có phần up ảnh lên cho khách, phần xem lại toàn bộ ảnh đã được liệt kê, sắp xếp theo thời gian được chụp (get từ trong dữ liệu properties của ảnh khi khách up ảnh lên), sẽ có phần hiện ra kiểu dây leo ký ức tự chạy và theo nhịp nhajcsk "Hóa ra..." của Grey D.

## 2. TECH STACK (CÔNG NGHỆ)
- **Framework:** Next.js (App Router), React, TypeScript (`.tsx`).
- **Styling:** Tailwind CSS.
- **Backend & Database:** Supabase (PostgreSQL, Authentication).
- **Supabase Storage (Quản lý ảnh):** Hệ thống sử dụng các bucket lưu trữ riêng biệt. Up ảnh avatar vào bucket `avatars`, ảnh mèo của Cattery vào `pet-images`, và ảnh cho tính năng Dây leo ký ức vào bucket `memorial-images`.
- **State Management:** Zustand. Phân định rõ chức năng các store:
  + `useCartStore`: Quản lý logic thêm/sửa/xóa giỏ hàng Petshop.
  + `useCatStore`: Lưu cache danh sách và bộ lọc mèo bên Cattery.
  + `useLoadingStore`: Quản lý hiệu ứng chuyển trang xé giấy.
  + `useDropdownStore` & `useLayoutStore`: Quản lý UI layout chung.
- **AI & Automation (Multi-Agent):** Gemini API (sử dụng Context Caching để tối ưu token).

## 3. UI/UX & DESIGN SYSTEM (PHONG CÁCH GIAO DIỆN)
- **Vibe:** Soft-Premium, hiện đại, dễ thương nhưng vẫn ngầu và chuyên nghiệp.
- **Đặc điểm:** Bo góc cực đại (`rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-full`), hiệu ứng kính mờ (glassmorphism / `backdrop-blur`).
- **Màu chủ đạo:** Pink (Hồng) pastel kiểu vết sơn loang, kết hợp với nền Stone (trắng sữa/xám nhạt).
- **Animation:** Mượt mà. KHÔNG dùng thẻ `alert()` mặc định của trình duyệt gây gián đoạn UX.

## 4. CẤU TRÚC DATABASE (SUPABASE)
⚠️ **CHÚ Ý ĐẶC BIỆT KHI LẤY DỮ LIỆU THÚ CƯNG:**
- Khi code tính năng cho **KinVie Cattery** (Trại nhân giống Maine Coon, xem phả hệ, thả tim), BẮT BUỘC query từ bảng `cats`.
- Bảng `pets` là bảng dữ liệu thú cưng chung của khách hàng hoặc dữ liệu cũ, TUYỆT ĐỐI KHÔNG query bảng này khi làm việc với phân khu Cattery để tránh nhầm lẫn logic.
**Các bảng quan trọng và các cột dữ liệu (cần chú ý kiểu dữ liệu để tránh lỗi Type):**
- `affiliate_clicks`: `id` (bigint), `product_id` (integer - trỏ về products.id), `user_id` (integer - trỏ về users.userid, có thể NULL nếu khách chưa đăng nhập), `created_at` (timestamp with time zone)
- `blogs`: `created_at` (timestamp with time zone), `title` (text), `category` (text), `cover_image` (text), `status` (text), `id` (uuid), `content` (jsonb)
- `cart_items`: `id` (integer), `created_at` (timestamp with time zone), `quantity` (integer), `variant` (text), `product_id` (integer), `user_id` (integer)
- `cat_likes`: `id` (bigint), `created_at` (timestamp with time zone), `cat_id` (bigint), `user_id` (integer - Trỏ về userid của bảng users)
- `categories`: `categoryid` (integer), `categoryname` (character varying)
- `cat_inquiries`: `id` (bigint), `cat_id` (integer - trỏ về cats.id), `customer_id` (integer - trỏ về users.userid, NULL nếu khách chưa đăng nhập), `customer_name` (text), `customer_phone` (text), `customer_zalo` (text), `message` (text), `status` (text: 'Mới'|'Đã liên hệ'|'Đã chốt'|'Hủy'), `created_at` (timestamp with time zone). Sinh ra khi khách bấm "Gửi Yêu Cầu Đón Bé" ở trang `/cattery/[id]`, kèm gửi notification CHỈ cho tài khoản Boss (type_id === 1) — KHÔNG gửi cho staff (type_id 2) hay trại đối tác (type_id 3) vì họ không có quyền xem trang chi tiết. Notification `link` trỏ về `/dashboard/cats/inquiries/{id}`. Trang này (`app/dashboard/cats/inquiries/[id]/page.tsx`) có gác cổng RIÊNG kiểm tra `type_id === 1` ngay trong component, KHÔNG dựa vào check chung của `app/dashboard/layout.tsx` (layout chung hiện chỉ check đăng nhập, chưa check type_id). ⚠️ **LỖ HỔNG ĐÃ BIẾT:** `app/dashboard/layout.tsx` hiện chỉ kiểm tra đăng nhập, CHƯA kiểm tra `type_id`, nghĩa là mọi tài khoản đã đăng nhập (kể cả khách thường) đều gõ được URL `/dashboard/...` và vào xem. Các trang nhạy cảm (như `cat_inquiries`) phải tự gác cổng riêng bằng cách check `type_id` ngay trong component cho tới khi layout chung được vá.
- `cats`: `color` (character varying), `status` (character varying), `approval_status` (character varying), `gender` (boolean), `has_pedigree` (boolean), `father_id` (integer), `mother_id` (integer), `likes` (integer), `breeder_id` (integer), `created_at` (timestamp with time zone), `posted_date` (date), `breed` (character varying), `id` (integer), `dob` (date), `notes` (text), `medical_history` (jsonb), `name` (character varying), `price` (numeric), `images` (ARRAY), `buyer_id` (integer - trỏ về users.userid, khách đã mua bé mèo này; CHỈ được gán khi status chuyển sang 'Đã về nhà mới', chọn qua ô tìm kiếm khách ở trang edit mèo, KHÔNG join chung `select('*, users(*)')` với breeder_id vì gây lỗi ambiguous relationship — phải fetch buyer bằng query riêng)
- `ems_base_colors`: `code` (character varying), `name` (character varying), `hex` (character varying)
- `ems_patterns`: `code` (character varying), `name` (character varying)
- `expenses`: `title` (text), `id` (uuid), `amount` (numeric), `expense_date` (timestamp with time zone), `category` (text)
- `families`: `updatedat` (timestamp with time zone), `familyname` (character varying), `familyid` (integer), `createdat` (timestamp with time zone)
- `feedbacks`: `status` (text), `content` (text), `admin_reply` (text), `type` (text), `created_at` (timestamp with time zone), `userid` (integer), `id` (uuid)
- `health_records`: `note` (text), `record_date` (date), `petid` (integer), `created_at` (timestamp with time zone), `record_type` (character varying), `id` (integer)
- `login_logs`: `loginid` (bigint, identity PK), `userid` (bigint, FK -> users.userid, on delete cascade), `loginat` (timestamptz, default now()), `source` (text: 'password'|'google'|'facebook'). Ghi log mỗi lượt đăng nhập thành công của khách. Có RLS bật, cho phép `insert`/`select` với cả `authenticated` và `anon` (dự án đang thao tác trực tiếp từ client giống cách làm với bảng `users`).
- `medicalrecords`: `dosenumber` (integer), `recordid` (integer), `nextduedate` (date), `petid` (integer), `administereddate` (date), `createdat` (timestamp with time zone), `notes` (text), `medicinename` (character varying), `recordtype` (character varying)
- `memorial_photos`: `id` (bigint), `user_id` (integer - trỏ về users.userid), `image_url` (text), `caption` (text), `taken_date` (date), `status` (text: 'pending'|'approved'|'rejected'), `admin_note` (text), `file_size` (integer), `created_at` (timestamptz)
- `memorial_photo_cats`: `photo_id` (bigint, FK memorial_photos.id), `cat_id` (integer, FK cats.id) — bảng nối N-N, 1 ảnh gắn được nhiều mèo
- `notifications`: `content` (text), `created_at` (timestamp with time zone), `is_read` (boolean), `user_id` (integer), `id` (integer), `title` (character varying), `type` (text: 'order_success'|'order_approved'|'cat_inquiry'|'post_like'|'post_comment'|'comment_reply'|'cat_approved'|'cat_rejected'|'system'), `link` (text - đường dẫn điều hướng khi bấm), `related_id` (text - id liên quan, dùng để dedupe/xoá khi unlike), `actor_id` (integer - userid người gây ra thông báo)
- `orderdetails`: `productid` (integer), `orderdetailid` (integer), `quantity` (integer), `orderid` (integer), `unitprice` (numeric), `petid` (integer), `variant` (text)
- `orders`: `totalamount` (numeric), `delivery_date` (date), `orderdate` (timestamp with time zone), `orderid` (integer), `customer_phone` (text), `userid` (integer), `address` (text), `customer_name` (text), `paymentmethod` (character varying), `orderstatus` (character varying)
- `page_banners`: `image_url` (text), `created_at` (timestamp with time zone), `group_id` (bigint), `id` (bigint)
- `pate_types`: `name` (text), `description` (text), `image_url` (text), `icons` (text), `created_at` (timestamp with time zone), `default_price` (numeric), `id` (uuid)
- `pets`: `description` (text), `videourl` (text), `status` (character varying), `ems_base_code` (character varying), `ems_pattern_code` (character varying), `simple_color` (character varying), `mother_id` (integer), `father_id` (integer), `has_pedigree` (boolean), `petid` (integer), `ems_silver` (boolean), `last_deworming_date` (date), `last_vaccine_date` (date), `neutered` (boolean), `familyid` (integer), `ownerid` (integer), `price` (numeric), `birthdate` (date), `gender` (boolean), `petname` (character varying), `breed` (character varying), `imageurl` (text)
- `post_comments`: `user_id` (integer), `id` (bigint), `content` (text), `post_id` (bigint), `created_at` (timestamp with time zone), `parent_id` (integer)
- `post_likes`: `id` (bigint), `post_id` (bigint), `created_at` (timestamp with time zone), `user_id` (integer)
- `post_pets`: `pet_id` (bigint), `post_id` (bigint)
- `posts`: `content` (text), `id` (bigint), `user_id` (integer), `created_at` (timestamp with time zone), `image_url` (text)
- `products`: `origin` (text), `reviews_count` (integer), `rating` (numeric), `discount_percent` (integer), `sales_count` (integer), `created_at` (timestamp with time zone), `expiry_date` (date), `stock` (integer), `price` (numeric), `categoryid` (integer), `id` (integer), `imageurl` (text), `description` (text), `category` (text), `status` (text), `images` (ARRAY), `name` (text), `brand` (text), `is_affiliate` (boolean), `affiliate_url` (text), `affiliate_clicks` (integer)
- `system_settings`: `zalo` (text), `hotline` (text), `theme_mode` (text), `id` (integer), `email` (text), `facebook_url` (text), `tiktok_url` (text), `instagram_url` (text), `updated_at` (timestamp with time zone)
- `product_reviews`: `id` (bigint), `product_id` (integer), `order_id` (integer), `user_id` (integer), `rating` (integer 1-5), `comment` (text), `created_at` (timestamp with time zone). Có UNIQUE(product_id, order_id, user_id) — 1 đơn chỉ đánh giá 1 lần cho 1 sản phẩm. Có trigger `trg_update_product_rating` tự động tính lại `products.rating` và `products.reviews_count` mỗi khi insert/update/delete — KHÔNG tự tay update 2 cột đó trong code nữa.
- `type_users`: `description`, `rank_name`, `role`, `point_required`, `id`, `max_memorial_photos` (integer - quota ảnh kỷ niệm theo hạng), `is_memorial_eligible` (boolean - Staff/Breeder = false, Boss/Customer = true)
- `users`: `providerid` (character varying), `provider` (character varying), `address` (text), `avatarurl` (text), `fullname` (character varying), `email` (character varying), `passwordhash` (character varying), `phone` (character varying), `isphoneverified` (boolean), `userid` (integer), `hasliked` (boolean), `points` (integer), `birthdate` (date), `type_id` (integer), `age` (integer), `familyid` (integer), `updatedat` (timestamp with time zone), `createdat` (timestamp with time zone), `cattery_name` (text), `status` (text)


## 5. QUY TẮC VIẾT CODE BẮT BUỘC (STRICT CODING RULES)
Yêu cầu AI LUÔN TUÂN THỦ các quy tắc sau để tránh lặp lại các bug đã được fix:

### A. Quy tắc kết nối Supabase Database:
1. **Lỗi Trống Dữ Liệu:** Khi truy vấn một dòng cụ thể (VD: kiểm tra xem sản phẩm đã có trong giỏ chưa), **LUÔN DÙNG `.maybeSingle()`**, TUYỆT ĐỐI KHÔNG DÙNG `.single()`. Lệnh `.single()` sẽ gây crash app nếu kết quả trả về rỗng.
2. **Khớp ID Người dùng:** Khóa chính của User trong hệ thống này là cột `userid` (kiểu số int4) nằm ở bảng `users`. KHÔNG được lấy trực tiếp UUID từ `session.user.id` của Auth Supabase để insert vào các bảng như `cart_items` hay `cat_likes`. Phải select qua bảng `users` trước để lấy `userid`.
3. **Phân loại Giỏ hàng:** Khi insert/update `cart_items`, phải check trùng lặp bằng CẢ `product_id` VÀ `variant`. (Khách mua cùng 1 sản phẩm nhưng khác Vị thì phải tách thành 2 dòng riêng biệt).
4. **Viết lệnh:** Khi có yêu cầu về sửa hoặc thêm mới database, thì cho câu lệnh SQL để sửa chứ đừng chỉ nói chung chung là sửa hay thêm mới cái gì.
5. **Luồng Thanh toán (Checkout):** Bảng `orders` và `orderdetails` dùng chung khóa `orderid` (integer). Khi tạo đơn hàng thành công, trạng thái mặc định BẮT BUỘC là "Chờ xác nhận" (vì thanh toán qua mã QR Momo/Bank thủ công). Sau khi tạo đơn, BẮT BUỘC phải có lệnh trừ `stock` trong bảng `products` và xóa `cart_items` của user đó.
6. **Update sau khi cập nhật database:** Sau mỗi lần update/insert/delete database thì đều phải chỉnh sửa file AI_CONTEXT.md này.
7. **Đơn hàng & Doanh số:** `sales_count` của `products` CHỈ được cộng khi admin đổi `orders.orderstatus` sang "Đã giao hàng" (xem hàm `incrementSalesCount` ở `app/dashboard/operations/orders/page.tsx`), KHÔNG cộng lúc tạo đơn. Tương tự, khách chỉ được để lại `product_reviews` khi có đơn ở trạng thái "Đã giao hàng" chứa đúng sản phẩm đó và chưa đánh giá đơn đó lần nào.
8. **Hệ thống thông báo (notifications):** Mọi thông báo insert vào bảng `notifications` PHẢI có `type` và `link` rõ ràng để chuông thông báo (Header.tsx) hiển thị đúng icon và điều hướng đúng chỗ. Khi thông báo gắn với hành động có thể "undo" (VD: thích bài viết), phải set `related_id` dạng `${post_id}_${actor_userid}` để khi undo (bỏ thích) thì xoá được đúng thông báo đã gửi, tránh rác. Chuông dùng Supabase Realtime (`postgres_changes`) lắng nghe theo `user_id`, không polling.
9. **Yêu cầu đón bé (cat_inquiries):** Khi khách gửi form "Gửi Yêu Cầu Đón Bé" ở `/cattery/[id]`, BẮT BUỘC lưu vào bảng `cat_inquiries` (không chỉ gửi notification suông) để còn quản lý lead sau này. Thông báo phải gửi cho TOÀN BỘ user có `type_id` 1 hoặc 2 (staff/boss), CỘNG THÊM trại đối tác nếu `cats.breeder_id` thuộc `type_id` 3 — tránh gửi trùng nếu breeder cũng đang là staff (type_id 1/2).
10. **Cây ký ức (memorial):** Thú cưng hiện trong dropdown chọn ảnh kỷ niệm lấy từ bảng `pets` với điều kiện `pets.ownerid === userid` của khách đó — tức LÀ TẤT CẢ thú cưng khách tự thêm ở "Thú cưng của tôi" (`/profile/add-pet`), KHÔNG bắt buộc phải là mèo mua tại KinVie nữa. Bảng nối là `memorial_photo_pets` (`photo_id` FK `memorial_photos.id`, `pet_id` FK `pets.petid`), TUYỆT ĐỐI KHÔNG dùng bảng `memorial_photo_cats` (đã bị xoá) hay join tới `cats` cho tính năng này nữa. Cột `cats.buyer_id` và toàn bộ tính năng "gán khách mua mèo" ở trang `/dashboard/cats/breeders/[id]` (search buyer, `selectedBuyer`, lưu `buyer_id`) đã bị GỠ BỎ HOÀN TOÀN — không được thêm lại hay tham chiếu cột này. Quota ảnh lấy từ `type_users.max_memorial_photos` theo `type_id` của khách, đếm số `memorial_photos` có `status != 'rejected'`. Ảnh nén qua canvas về tối đa 1600px cạnh dài, xuất `image/webp` chất lượng 0.8 trước khi upload vào bucket Storage `memorial-images` (bucket PUBLIC, giới hạn 5MB, chỉ nhận jpeg/png/webp). Trang duyệt `/dashboard/system/memorial` gác cổng `type_id` 1 hoặc 2 (Boss/Staff) — khác với `cat_inquiries` chỉ cho riêng Boss, đây cho phép cả Staff. Ảnh đã `approved` thì khách không tự xoá được nữa (chỉ Boss gỡ qua dashboard).

### B. Quy tắc Frontend (React/Next.js):
1. **Bọc thép Component:** Các Component nhận Props (như `ProductCard`) phải luôn có điều kiện fallback (`if (!product) return null;`) và sử dụng Optional Chaining (`product?.name`, `product?.price`) để tránh lỗi `Cannot read properties of undefined` khi sập mạng hoặc truyền thiếu data.
2. **Lỗi Includes:** Cột `category` có thể bị rỗng (`null`) hoặc khác chuẩn, trước khi dùng `.includes()` hoặc `.filter()`, luôn ép kiểu về string: `String(product.category)`.
3. **Hiển thị Ảnh:** Supabase đang có 2 cột ảnh là `imageurl` và mảng `images`. Luôn ưu tiên hiển thị theo logic: Lấy `imageurl`, nếu trống thì lấy `images[0]`, nếu vẫn trống thì dùng ảnh placehold. Luôn có thuộc tính `onError` cho thẻ `<img>`.
4. **Giao tiếp liên Component:** Sử dụng Custom Event `window.dispatchEvent(new Event('update_cart'));` để kích hoạt Header đếm lại số lượng giỏ hàng khi có hành động thêm/xóa từ các Component con. Không cần dùng Context API phức tạp cho việc này.
5. `"use client";`: Phải luôn khai báo ở dòng đầu tiên của các file có sử dụng Hook (useState, useEffect, onClick).

## 6. TIÊU CHUẨN TƯ DUY VÀ HÀNH VI (PROGRAMMING MINDSET)
Các quy tắc này ưu tiên sự **CẨN TRỌNG** và **CHÍNH XÁC** hơn là tốc độ. AI cần tuân thủ để giảm thiểu sai sót:

### A. Suy nghĩ trước khi gõ phím:
1. **Không giả định:** Nêu rõ các giả định trước khi thực hiện. Nếu có điều gì chưa rõ (về logic hoặc yêu cầu), BẮT BUỘC phải hỏi lại sếp trước khi viết code.
2. **Đưa ra lựa chọn:** Nếu một vấn đề có nhiều cách giải quyết, hãy trình bày các phương án và sự đánh đổi (trade-offs) thay vì tự ý chọn một cách.
3. **Ưu tiên sự đơn giản:** Nếu có cách tiếp cận đơn giản hơn, hãy đề xuất. Nếu đoạn code có thể viết trong 50 dòng thay vì 200 dòng, hãy viết lại.
4. **Không tự phân tích:** Nếu src hoặc file nhận được quá dài, không được đoán mò mà phải báo lại là bị cắt ở phần nào, có quá dài không đọc được hết file hay không.

### B. Thay đổi có chọn lọc (Surgical Changes):
1. **Đúng mục tiêu:** Chỉ chỉnh sửa những dòng code thực sự cần thiết để giải quyết yêu cầu.
2. **Không sửa "tiện tay":** Tuyệt đối KHÔNG tự ý cải thiện code xung quanh, thay đổi comment hoặc format lại những đoạn code không liên quan đến yêu cầu hiện tại.
3. **Tôn trọng Style cũ:** Luôn viết code theo phong cách hiện có của dự án, ngay cả khi AI có cách viết khác "xịn" hơn.
4. **Dọn rác của mình:** Nếu thay đổi của AI làm một biến, hàm hoặc import cũ trở nên dư thừa, hãy xóa chúng. Nhưng KHÔNG được xóa code thừa cũ của dự án trừ khi sếp yêu cầu.

### C. Thực thi theo kế hoạch:
1. **Lập lộ trình:** Với các tác vụ phức tạp (nhiều bước), hãy liệt kê kế hoạch thực hiện theo dạng: 
   - Bước 1 -> Tiêu chí kiểm tra kết quả.
   - Bước 2 -> Tiêu chí kiểm tra kết quả.
2. **Xác định thành công:** Thay vì chỉ nói "Làm cho nó chạy", hãy xác định tiêu chí cụ thể (VD: "Thêm validation" -> "Viết input sai phải báo lỗi, input đúng phải lưu được DB").