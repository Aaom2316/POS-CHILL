// ===================================================
// USER ROLE
// ===================================================

POS.USER_ROLE = "STAFF";


// ===================================================
// โหลดสิทธิ์จาก public.users
// ===================================================

POS.loadUserRole = async function(){

  try{

    const session =
      await POS.auth.session();


    // -----------------------------------------------
    // ไม่มี Session
    // -----------------------------------------------

    if(!session){

      POS.USER_ROLE = "STAFF";

      return;

    }


    const uid =
      session.user?.id;


    if(!uid){

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // อ่าน Role จาก public.users
    // -----------------------------------------------

    const result =
      await POS.supabase

        .from("users")

        .select("role, active")

        .eq("id", uid)

        .maybeSingle();


    console.log(
      "USER ROLE RESULT:",
      result
    );


    // -----------------------------------------------
    // Database Error
    // -----------------------------------------------

    if(result.error){

      console.error(
        "USER ROLE DATABASE ERROR:",
        result.error
      );

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // ไม่พบ User
    // -----------------------------------------------

    if(!result.data){

      console.warn(
        "USER NOT FOUND IN public.users"
      );

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // User ถูกปิดใช้งาน
    // -----------------------------------------------

    if(result.data.active !== true){

      POS.USER_ROLE = "STAFF";

      return;

    }


    // -----------------------------------------------
    // กำหนด Role
    // -----------------------------------------------

    if(result.data.role === "OWNER"){

      POS.USER_ROLE = "OWNER";

    }else{

      POS.USER_ROLE = "STAFF";

    }


    console.log(
      "POS USER ROLE:",
      POS.USER_ROLE
    );


  }catch(error){

    console.error(
      "LOAD USER ROLE ERROR:",
      error
    );

    POS.USER_ROLE = "STAFF";

  }

};


// ===================================================
// SIDEBAR
// ===================================================

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