// STOCK PAGE 07 : SALES MENU
// ใช้ POS.api.menus() และอ่าน result.menus ตาม MENU Edge Function ล่าสุด
// Backend MENU รองรับ GET / POST(ADD) / PUT(UPDATE) / OPTIONS

window.POS = window.POS || {};
POS.pages = POS.pages || {};

POS.pages.inventorySalesMenu = async function(){
  const html = `
    <div class="inventory-subpage">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:22px;flex-wrap:wrap;">
        <div>
          <h1 class="page-title" style="margin:0 0 5px;font-size:30px;font-weight:800;color:#1f2937;">🍹 Salesmenu</h1>
          <p class="page-subtitle" style="margin:0;color:#64748b;font-size:15px;">จัดการรายการเมนูที่เปิดขาย</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <button type="button" class="btn-secondary" onclick="POS.inventoryBackToMain()" style="min-height:42px;padding:0 16px;border-radius:10px;font-weight:700;">← กลับหน้าสต็อก</button>
          <button type="button" class="btn-primary" onclick="POS.inventorySalesMenuOpenAdd()" style="min-height:42px;padding:0 18px;border-radius:10px;font-weight:700;background:#e8f6ec;color:#267a3d;border:1px solid #b9dec3;">➕ เพิ่มเมนู</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px;">
        <div class="card" style="margin:0;min-height:108px;box-sizing:border-box;"><div style="color:#94a3b8;font-size:13px;font-weight:700;">เมนูทั้งหมด</div><div id="posInventorySalesMenuTotal" style="margin-top:7px;font-size:25px;font-weight:800;color:#1f2937;">0</div><div style="margin-top:3px;color:#94a3b8;font-size:12px;">รายการ</div></div>
        <div class="card" style="margin:0;min-height:108px;box-sizing:border-box;"><div style="color:#94a3b8;font-size:13px;font-weight:700;">เปิดขาย</div><div id="posInventorySalesMenuActive" style="margin-top:7px;font-size:25px;font-weight:800;color:#267a3d;">0</div><div style="margin-top:3px;color:#94a3b8;font-size:12px;">รายการ</div></div>
        <div class="card" style="margin:0;min-height:108px;box-sizing:border-box;"><div style="color:#94a3b8;font-size:13px;font-weight:700;">ปิดขาย</div><div id="posInventorySalesMenuInactive" style="margin-top:7px;font-size:25px;font-weight:800;color:#dc2626;">0</div><div style="margin-top:3px;color:#94a3b8;font-size:12px;">รายการ</div></div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:end;">
          <div><label style="display:block;margin-bottom:7px;color:#475569;font-size:13px;font-weight:700;">🔎 ค้นหาเมนู</label>
            <input id="posInventorySalesMenuSearch" type="text" placeholder="ค้นหาชื่อเมนู / SKU / หมวดหมู่" oninput="POS.inventorySalesMenuRender()" style="width:100%;height:43px;box-sizing:border-box;padding:0 13px;border:1px solid #d7dee8;border-radius:9px;outline:none;font-size:14px;">
          </div>
          <button id="posInventorySalesMenuRefreshBtn" class="btn-secondary" type="button" onclick="POS.inventorySalesMenuLoad()" style="min-height:43px;padding:0 15px;border-radius:9px;font-weight:700;">🔄 รีเฟรช</button>
        </div>
      </div>

      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:18px 18px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div><div style="font-size:18px;font-weight:800;color:#1f2937;">📋 รายการเมนูขาย</div><div style="margin-top:4px;color:#94a3b8;font-size:12px;">รายการเมนูที่ตั้งค่าไว้สำหรับจำหน่าย</div></div>
          <div id="posInventorySalesMenuListCount" style="padding:7px 11px;border-radius:999px;background:#f8fafc;color:#64748b;font-size:12px;font-weight:700;white-space:nowrap;">0 รายการ</div>
        </div>
        <div style="overflow-x:auto;border-top:1px solid #eef1f4;">
          <table style="width:100%;min-width:800px;border-collapse:collapse;">
            <thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <th style="padding:12px;text-align:left;color:#475569;font-size:12px;">SKU</th>
              <th style="padding:12px;text-align:left;color:#475569;font-size:12px;">ชื่อเมนู</th>
              <th style="padding:12px;text-align:left;color:#475569;font-size:12px;">หมวดหมู่</th>
              <th style="padding:12px;text-align:right;color:#475569;font-size:12px;">ราคาขาย</th>
              <th style="padding:12px;text-align:center;color:#475569;font-size:12px;">สถานะ</th>
              <th style="padding:12px;text-align:center;color:#475569;font-size:12px;">จัดการ</th>
            </tr></thead>
            <tbody id="posInventorySalesMenuTableBody"><tr><td colspan="6" style="padding:55px 20px;text-align:center;color:#94a3b8;">กำลังเตรียมโหลดรายการเมนู...</td></tr></tbody>
          </table>
        </div>
      </div>
    </div>`;

  // โหลดข้อมูลอัตโนมัติหลัง Router นำ HTML ไปแสดงในหน้าแล้ว
  // ไม่ต้องให้ผู้ใช้กดปุ่มรีเฟรชทุกครั้งที่เปิดหน้า Sales Menu
  setTimeout(function(){
    if(document.getElementById("posInventorySalesMenuTableBody")){
      POS.inventorySalesMenuLoad();
    }
  }, 0);

  return html;
};

POS.inventorySalesMenuData = [];
POS.inventorySalesMenuNextSku = "";

POS.inventorySalesMenuEscape = function(value){
  return String(value ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
};

// =========================================================
// LOAD MENU
// =========================================================
POS.inventorySalesMenuLoad = async function(){
  const body = document.getElementById("posInventorySalesMenuTableBody");
  if(!body) return;

  body.innerHTML = `<tr><td colspan="6" style="padding:50px;text-align:center;color:#94a3b8;">⏳ กำลังโหลดเมนู...</td></tr>`;
  const refreshBtn = document.getElementById("posInventorySalesMenuRefreshBtn");
  if(refreshBtn) refreshBtn.disabled = true;

  try{
    const result = await POS.api.menus();

    if(!result || result.success !== true){
      throw new Error(result?.error || result?.message || "โหลดเมนูไม่สำเร็จ");
    }

    POS.inventorySalesMenuData = Array.isArray(result.menus) ? result.menus : [];
    if (typeof result.nextSku === "string" && /^P\d+$/i.test(result.nextSku)) {
      POS.inventorySalesMenuNextSku = result.nextSku;
    }
    POS.inventorySalesMenuRender();

  }catch(error){
    console.error("inventorySalesMenuLoad error:", error);
    body.innerHTML = `<tr><td colspan="6" style="padding:50px;text-align:center;color:#dc2626;">⚠️ โหลดเมนูไม่สำเร็จ: ${POS.inventorySalesMenuEscape(error?.message || "กรุณาลองใหม่")}</td></tr>`;

    ["posInventorySalesMenuTotal","posInventorySalesMenuActive","posInventorySalesMenuInactive"].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.textContent = "0";
    });
    const count = document.getElementById("posInventorySalesMenuListCount");
    if(count) count.textContent = "0 รายการ";
  }finally{
    if(refreshBtn) refreshBtn.disabled = false;
  }
};

// =========================================================
// RENDER MENU
// =========================================================
POS.inventorySalesMenuRender = function(){
  const body = document.getElementById("posInventorySalesMenuTableBody");
  if(!body) return;

  const data = Array.isArray(POS.inventorySalesMenuData) ? POS.inventorySalesMenuData : [];
  const keyword = String(document.getElementById("posInventorySalesMenuSearch")?.value || "").trim().toLowerCase();

  const isActive = x =>
    x.active === true ||
    x.active === 1 ||
    String(x.active).toLowerCase() === "true" ||
    String(x.status || "").toLowerCase() === "active";

  const rows = data.filter(x =>
    [x.sku,x.name,x.menu_name,x.category,x.category_name]
      .join(" ")
      .toLowerCase()
      .includes(keyword)
  ).sort((a,b)=>{
    const skuA = String(a.sku || "").trim();
    const skuB = String(b.sku || "").trim();

    const matchA = skuA.match(/^(.*?)(\d+)$/);
    const matchB = skuB.match(/^(.*?)(\d+)$/);

    if(matchA && matchB){
      const prefixCompare = matchA[1].localeCompare(matchB[1], undefined, {numeric:true,sensitivity:"base"});
      if(prefixCompare !== 0) return prefixCompare;

      const numberCompare = Number(matchA[2]) - Number(matchB[2]);
      if(numberCompare !== 0) return numberCompare;
    }

    return skuA.localeCompare(skuB, undefined, {numeric:true,sensitivity:"base"});
  });

  const setText = (id,value)=>{
    const el = document.getElementById(id);
    if(el) el.textContent = String(value);
  };

  setText("posInventorySalesMenuTotal",data.length);
  setText("posInventorySalesMenuActive",data.filter(isActive).length);
  setText("posInventorySalesMenuInactive",data.filter(x=>!isActive(x)).length);
  setText("posInventorySalesMenuListCount",rows.length+" รายการ");

  if(!rows.length){
    body.innerHTML = `<tr><td colspan="6" style="padding:55px 20px;text-align:center;color:#94a3b8;">${keyword ? "ไม่พบเมนูที่ค้นหา" : "ยังไม่มีข้อมูลเมนู"}</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(x=>`
    <tr style="border-bottom:1px solid #eef1f4;">
      <td style="padding:13px 12px;font-size:13px;color:#64748b;font-weight:700;">${POS.inventorySalesMenuEscape(x.sku || "-")}</td>
      <td style="padding:13px 12px;font-size:14px;color:#1f2937;font-weight:800;">${POS.inventorySalesMenuEscape(x.name || x.menu_name || "-")}</td>
      <td style="padding:13px 12px;font-size:13px;color:#64748b;">${POS.inventorySalesMenuEscape(x.category || x.category_name || "-")}</td>
      <td style="padding:13px 12px;text-align:right;font-weight:800;color:#1f2937;">฿${Number(x.price || 0).toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td style="padding:13px 12px;text-align:center;"><span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${isActive(x)?"#e8f6ec":"#fff1f2"};color:${isActive(x)?"#267a3d":"#be123c"};font-size:12px;font-weight:800;">${isActive(x)?"เปิดขาย":"ปิดขาย"}</span></td>
      <td style="padding:13px 12px;text-align:center;"><button type="button" onclick="POS.inventorySalesMenuOpenEdit('${POS.inventorySalesMenuEscape(x.id || x.sku || "")}')" style="min-height:34px;padding:0 11px;border:1px solid #d7dee8;border-radius:8px;background:#fff;font-weight:700;cursor:pointer;">✏️ แก้ไข</button></td>
    </tr>
  `).join("");
};

// =========================================================
// MENU FORM : ADD / EDIT
// =========================================================
POS.inventorySalesMenuCategories = [
  "เบียร์ชิลล์ๆ",
  "เหล้าปั่นชิลล์",
  "ขนมชิลล์/รายการเสริม",
  "ชาสายชิลล์",
  "สมูทตี้ชิลล์",
  "น้ำอัดลมวุ้นชิลล์",
  "อิตาเลี่ยนโซดาชิลล์",
  "กาแฟชิลล์",
  "อื่นๆ"
];

POS.inventorySalesMenuCloseForm = function(){
  document.getElementById("posInventorySalesMenuModal")?.remove();
};

POS.inventorySalesMenuOpenAdd = async function(){
  // ป้องกันการเปิดฟอร์มก่อนโหลด SKU ล่าสุดจาก Backend
  if(!POS.inventorySalesMenuNextSku){
    await POS.inventorySalesMenuLoad();
  }

  if(!POS.inventorySalesMenuNextSku){
    alert("ยังโหลดรหัสเมนูถัดไปไม่สำเร็จ กรุณากดรีเฟรชแล้วลองอีกครั้ง");
    return;
  }

  POS.inventorySalesMenuShowForm(null);
};

POS.inventorySalesMenuOpenEdit = function(id){
  const data = Array.isArray(POS.inventorySalesMenuData) ? POS.inventorySalesMenuData : [];
  const menu = data.find(x =>
    String(x.id || "") === String(id) ||
    String(x.sku || "") === String(id)
  );

  if(!menu){
    alert("ไม่พบข้อมูลเมนูนี้ กรุณารีเฟรชรายการแล้วลองอีกครั้ง");
    return;
  }

  POS.inventorySalesMenuShowForm(menu);
};

POS.inventorySalesMenuShowForm = function(menu){
  POS.inventorySalesMenuCloseForm();

  const isEdit = !!menu;
  const currentCategory = String(menu?.category || "").trim();
  const categories = [...POS.inventorySalesMenuCategories];

  if(currentCategory && !categories.includes(currentCategory)){
    categories.unshift(currentCategory);
  }

  const categoryOptions = categories.map(category => `
    <option value="${POS.inventorySalesMenuEscape(category)}" ${category === currentCategory ? "selected" : ""}>
      ${POS.inventorySalesMenuEscape(category)}
    </option>
  `).join("");

  const checked = menu
    ? (menu.active === true || menu.active === 1 || String(menu.active).toLowerCase() === "true")
    : true;

  const modal = document.createElement("div");
  modal.id = "posInventorySalesMenuModal";
  modal.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;";

  modal.innerHTML = `
    <div style="width:100%;max-width:560px;max-height:90vh;overflow:auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.25);">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 22px;border-bottom:1px solid #e5e7eb;">
        <div style="font-size:20px;font-weight:800;color:#1f2937;">${isEdit ? "✏️ แก้ไขเมนู" : "➕ เพิ่มเมนูใหม่"}</div>
        <button type="button" onclick="POS.inventorySalesMenuCloseForm()" style="border:0;background:#f1f5f9;border-radius:8px;width:36px;height:36px;font-size:20px;cursor:pointer;">×</button>
      </div>
      <div style="padding:22px;display:grid;gap:15px;">
        <div>
          <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#475569;">SKU / รหัสเมนู ${isEdit ? "*" : "(สร้างอัตโนมัติ)"}</label>
          <input id="posInventorySalesMenuFormSku" value="${POS.inventorySalesMenuEscape(menu?.sku || POS.inventorySalesMenuNextSku || "")}" maxlength="50" ${isEdit ? "" : "readonly"} placeholder="ระบบสร้างรหัสให้อัตโนมัติ" style="width:100%;height:44px;box-sizing:border-box;padding:0 12px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;${isEdit ? "" : "background:#f8fafc;color:#475569;font-weight:700;"}">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#475569;">ชื่อเมนู *</label>
          <input id="posInventorySalesMenuFormName" value="${POS.inventorySalesMenuEscape(menu?.name || menu?.menu_name || "")}" maxlength="150" placeholder="ระบุชื่อเมนู" style="width:100%;height:44px;box-sizing:border-box;padding:0 12px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;">
        </div>
        <div>
          <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#475569;">หมวดหมู่ *</label>
          <select id="posInventorySalesMenuFormCategory" style="width:100%;height:44px;box-sizing:border-box;padding:0 12px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;font-size:15px;">
            <option value="">เลือกหมวดหมู่</option>${categoryOptions}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 110px;gap:12px;">
          <div>
            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#475569;">ราคาขาย (บาท) *</label>
            <input id="posInventorySalesMenuFormPrice" type="number" min="0" step="0.01" value="${menu?.price ?? ""}" placeholder="0.00" style="width:100%;height:44px;box-sizing:border-box;padding:0 12px;border:1px solid #cbd5e1;border-radius:9px;font-size:15px;">
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:700;color:#475569;">Emoji (เลือกได้)</label>
            <input id="posInventorySalesMenuFormEmoji" value="${POS.inventorySalesMenuEscape(menu?.emoji || "🍹")}" maxlength="12" style="width:100%;height:44px;box-sizing:border-box;padding:0 10px;border:1px solid #cbd5e1;border-radius:9px;font-size:18px;text-align:center;">
          </div>
        </div>

        <div>
          <div style="font-size:12px;font-weight:700;color:#64748b;margin-bottom:7px;">เลือก Emoji ที่ต้องการ</div>
          <div id="posInventorySalesMenuEmojiPicker" style="display:flex;flex-wrap:wrap;gap:7px;">
            ${["🍹","🍺","🥤","☕","🧋","🍵","🧃","🍓","🍇","🍑","🍋","🍍","🍉","🥭","🍏","🥥","🧊","🥜","🍟","🍿","🍪","🍰","🍜","🍕"].map(emoji => `
              <button type="button" data-pos-emoji="${emoji}" aria-label="เลือก ${emoji}" style="width:40px;height:40px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;font-size:22px;cursor:pointer;">${emoji}</button>
            `).join("")}
          </div>
        </div>

        <label style="display:flex;align-items:center;gap:10px;padding:12px;background:#f8fafc;border-radius:9px;font-size:14px;font-weight:700;color:#334155;">
          <input id="posInventorySalesMenuFormActive" type="checkbox" ${checked ? "checked" : ""} style="width:18px;height:18px;">
          เปิดขายเมนูนี้
        </label>
        <div id="posInventorySalesMenuFormError" style="display:none;padding:10px 12px;background:#fff1f2;color:#be123c;border-radius:8px;font-size:13px;"></div>
        <div style="display:flex;justify-content:flex-end;gap:10px;padding-top:5px;">
          <button type="button" onclick="POS.inventorySalesMenuCloseForm()" style="min-height:42px;padding:0 18px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;font-weight:700;cursor:pointer;">ยกเลิก</button>
          <button id="posInventorySalesMenuFormSaveBtn" type="button" onclick="POS.inventorySalesMenuSaveForm('${isEdit ? "UPDATE" : "ADD"}','${POS.inventorySalesMenuEscape(menu?.id || "")}')" style="min-height:42px;padding:0 22px;border:0;border-radius:9px;background:#2563eb;color:#fff;font-weight:800;cursor:pointer;">💾 ${isEdit ? "บันทึกการแก้ไข" : "บันทึกเมนู"}</button>
        </div>
      </div>
    </div>`;

  modal.addEventListener("click",function(event){
    if(event.target === modal) POS.inventorySalesMenuCloseForm();
  });

  document.body.appendChild(modal);

  // เลือก Emoji จากชุดปุ่ม แล้วใส่ลงในช่อง Emoji
  const emojiInput = modal.querySelector("#posInventorySalesMenuFormEmoji");
  const emojiButtons = modal.querySelectorAll("[data-pos-emoji]");

  emojiButtons.forEach(button => {
    button.addEventListener("click", function(){
      const selectedEmoji = this.getAttribute("data-pos-emoji");
      if(emojiInput) emojiInput.value = selectedEmoji;

      emojiButtons.forEach(item => {
        item.style.background = "#fff";
        item.style.borderColor = "#cbd5e1";
      });

      this.style.background = "#ede9fe";
      this.style.borderColor = "#7c3aed";
    });
  });
};

// Toast แจ้งผลสำเร็จแบบสวยงาม แทน alert() เดิม
POS.inventorySalesMenuShowSuccess = function(title, detail){
  const oldToast = document.getElementById("posInventorySalesMenuSuccessToast");
  if(oldToast) oldToast.remove();

  const toast = document.createElement("div");
  toast.id = "posInventorySalesMenuSuccessToast";
  toast.setAttribute("role", "status");
  toast.style.cssText = [
    "position:fixed",
    "top:22px",
    "right:22px",
    "z-index:999999",
    "width:min(390px,calc(100vw - 32px))",
    "box-sizing:border-box",
    "display:flex",
    "align-items:flex-start",
    "gap:13px",
    "padding:17px 18px",
    "background:#ffffff",
    "border:1px solid #bbf7d0",
    "border-left:5px solid #16a34a",
    "border-radius:16px",
    "box-shadow:0 18px 50px rgba(15,23,42,.20)",
    "font-family:inherit",
    "animation:posMenuToastIn .24s ease-out"
  ].join(";");

  const safeTitle = POS.inventorySalesMenuEscape(title || "บันทึกสำเร็จ");
  const safeDetail = POS.inventorySalesMenuEscape(detail || "");

  toast.innerHTML = `
    <div style="flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:#dcfce7;color:#15803d;display:flex;align-items:center;justify-content:center;font-size:21px;font-weight:800;">✓</div>
    <div style="flex:1;min-width:0;padding-top:1px;">
      <div style="font-size:15px;font-weight:800;color:#166534;line-height:1.45;">${safeTitle}</div>
      ${safeDetail ? `<div style="margin-top:4px;font-size:13px;color:#64748b;line-height:1.5;overflow-wrap:anywhere;">${safeDetail}</div>` : ""}
    </div>
    <button type="button" aria-label="ปิดข้อความ" style="border:0;background:transparent;color:#94a3b8;font-size:20px;line-height:1;cursor:pointer;padding:0 0 4px 4px;">×</button>
  `;

  if(!document.getElementById("posInventorySalesMenuToastStyle")){
    const style = document.createElement("style");
    style.id = "posInventorySalesMenuToastStyle";
    style.textContent = `
      @keyframes posMenuToastIn {
        from { opacity:0; transform:translateY(-8px) scale(.98); }
        to { opacity:1; transform:translateY(0) scale(1); }
      }
      @media(max-width:520px){
        #posInventorySalesMenuSuccessToast{
          top:12px!important;right:12px!important;width:calc(100vw - 24px)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  toast.querySelector("button")?.addEventListener("click", () => toast.remove());
  document.body.appendChild(toast);
  setTimeout(() => {
    if(toast.isConnected) toast.remove();
  }, 3800);
};

POS.inventorySalesMenuSaveForm = async function(action,id){
  const sku = String(document.getElementById("posInventorySalesMenuFormSku")?.value || "").trim();
  const name = String(document.getElementById("posInventorySalesMenuFormName")?.value || "").trim();
  const category = String(document.getElementById("posInventorySalesMenuFormCategory")?.value || "").trim();
  const priceRaw = document.getElementById("posInventorySalesMenuFormPrice")?.value;
  const emoji = String(document.getElementById("posInventorySalesMenuFormEmoji")?.value || "🍹").trim() || "🍹";
  const active = !!document.getElementById("posInventorySalesMenuFormActive")?.checked;
  const price = Number(priceRaw);

  const errorEl = document.getElementById("posInventorySalesMenuFormError");
  const saveBtn = document.getElementById("posInventorySalesMenuFormSaveBtn");

  const showError = message => {
    if(!errorEl) return;
    errorEl.textContent = message;
    errorEl.style.display = "block";
  };

  if((action === "UPDATE" && !sku) || !name || !category || priceRaw === "" || !Number.isFinite(price) || price < 0){
    showError("กรุณากรอกชื่อเมนู หมวดหมู่ และราคาขายให้ถูกต้อง");
    return;
  }

  // ADD ส่ง SKU ว่าง เพื่อให้ Backend สร้างรหัสล่าสุดจากฐานข้อมูลจริง
  const payload = { sku: action === "ADD" ? "" : sku,name,category,price,emoji,active };

  if(action === "UPDATE"){
    if(!id){
      showError("ไม่พบ ID เมนูสำหรับแก้ไข");
      return;
    }
    payload.id = id;
  }

  if(saveBtn){
    saveBtn.disabled = true;
    saveBtn.textContent = "⏳ กำลังบันทึก...";
    saveBtn.style.opacity = ".65";
  }

  try{
    const result = action === "ADD"
      ? await POS.api.menuAdd(payload)
      : await POS.api.menuUpdate(payload);

    if(!result || result.success !== true){
      throw new Error(result?.error || result?.message || "บันทึกเมนูไม่สำเร็จ");
    }

    POS.inventorySalesMenuCloseForm();
    await POS.inventorySalesMenuLoad();

    const savedMenu = result.menu || {};
    const successTitle = action === "ADD" ? "เพิ่มเมนูสำเร็จ" : "แก้ไขเมนูสำเร็จ";
    const successDetail = [
      savedMenu.name || name,
      `SKU: ${savedMenu.sku || (action === "ADD" ? "สร้างอัตโนมัติ" : sku)}`
    ].join(" • ");

    POS.inventorySalesMenuShowSuccess(successTitle, successDetail);

  }catch(error){
    console.error("inventorySalesMenuSaveForm error:",error);
    showError(error?.message || "เกิดข้อผิดพลาดในการบันทึกเมนู");
  }finally{
    const btn = document.getElementById("posInventorySalesMenuFormSaveBtn");
    if(btn){
      btn.disabled = false;
      btn.textContent = action === "ADD" ? "💾 บันทึกเมนู" : "💾 บันทึกการแก้ไข";
      btn.style.opacity = "1";
    }
  }
};

// =========================================================
// INIT
// =========================================================
POS.inventorySalesMenuInit = function(){
  if(!document.getElementById("posInventorySalesMenuTableBody")) return;
  POS.inventorySalesMenuLoad();
};
