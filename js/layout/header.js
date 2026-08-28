POS.renderHeader = function(shopName=""){
  return `
    <header class="topbar">
      <strong id="headerShopName">${shopName || "POS CHILL"}</strong>
      <div>
        <span id="headerUser"></span>
        <button class="btn btn-light" onclick="POS.logout()">ออกจากระบบ</button>
      </div>
    </header>`;
};
