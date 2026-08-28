// ===================================================
// USER ROLE
// ===================================================

POS.USER_ROLE = "STAFF";


// OWNER UID
// UID นี้ต้องเป็น UID ของเจ้าของที่ Login
POS.OWNER_UID =
  "e51d8adf-8a80-4df4-9e6a-6e6719a7a504";


// ===================================================
// ตรวจสิทธิ์จาก Session
// ===================================================

POS.loadUserRole = async function(){

  try{

    const session =
      await POS.auth.session();


    if(!session){

      POS.USER_ROLE =
        "STAFF";

      return;

    }


    const uid =
      session.user?.id;


    if(
      uid &&
      uid === POS.OWNER_UID
    ){

      POS.USER_ROLE =
        "OWNER";

    }else{

      POS.USER_ROLE =
        "STAFF";

    }


  }catch(error){

    console.error(
      "LOAD USER ROLE ERROR:",
      error
    );

    POS.USER_ROLE =
      "STAFF";

  }

};


POS.renderSidebar = function(){

  const isOwner =
    POS.USER_ROLE === "OWNER";


  return `
    <aside class="sidebar">

      <div class="brand">
        🍹 ล้างไป ชิลล์ไป
      </div>

      <nav class="nav">

        <a
          class="nav-item"
          href="#dashboard"
        >
          📊 Dashboard
        </a>

        <a
          class="nav-item"
          href="#pos"
        >
          🧾 POS
        </a>

        <a
          class="nav-item"
          href="#orders"
        >
          🍽️ โต๊ะ / Orders
        </a>

        <a
          class="nav-item"
          href="#sales"
        >
          💰 รายรับ
        </a>

        <a
          class="nav-item"
          href="#expenses"
        >
          💸 รายจ่าย
        </a>

        ${
          isOwner
          ? `

            <a
              class="nav-item"
              href="#inventory"
            >
              📦 สต็อก
            </a>

            <a
              class="nav-item"
              href="#reports"
            >
              📈 รายงาน
            </a>

            <a
              class="nav-item"
              href="#settings"
            >
              ⚙️ ตั้งค่า
            </a>

          `
          : ""
        }

      </nav>

    </aside>
  `;
};