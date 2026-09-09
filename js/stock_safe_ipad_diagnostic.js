/* ============================================================
   POS CHILL STOCK — SAFE iPad Diagnostic (DEV ONLY)
   วัดเวลา API / PAGE โดยไม่ดัก DOM และไม่สร้าง UI loop
   ============================================================ */
(function () {
  if (window.__stockSafeDiag) {
    console.log("POS CHILL SAFE DIAGNOSTIC: already installed");
    return;
  }

  const D = window.__stockSafeDiag = {
    started: performance.now(),
    api: [],
    pos: [],
    invoke: [],
    errors: []
  };

  const original = {
    pos: {},
    api: {},
    invoke: null
  };

  function ms(t) {
    return Math.round((performance.now() - t) * 10) / 10;
  }

  function record(list, name, elapsed, extra) {
    const row = {
      name: name,
      ms: elapsed,
      time: new Date().toLocaleTimeString(),
      ...(extra || {})
    };
    list.push(row);
    return row;
  }

  function wrap(obj, key, list, label) {
    if (!obj || typeof obj[key] !== "function") return;

    const fn = obj[key];
    if (fn.__safeStockDiag) return;

    original[label === "API" ? "api" : "pos"][key] = fn;

    const wrapped = function () {
      const t = performance.now();
      let result;

      try {
        result = fn.apply(this, arguments);
      } catch (e) {
        record(list, key, ms(t), { ok: false, error: String(e) });
        throw e;
      }

      if (result && typeof result.then === "function") {
        return result.then(function (value) {
          record(list, key, ms(t), { ok: true });
          return value;
        }).catch(function (e) {
          record(list, key, ms(t), {
            ok: false,
            error: String(e && e.message ? e.message : e)
          });
          throw e;
        });
      }

      record(list, key, ms(t), { ok: true });
      return result;
    };

    wrapped.__safeStockDiag = true;
    obj[key] = wrapped;
  }

  function install() {
    if (!window.POS) return;

    [
      "openInventorySubPage",
      "inventoryBackToMain",
      "inventoryItemsLoad",
      "inventoryItemsRender",
      "inventoryItemsInit",
      "inventoryRecipesLoad",
      "inventoryRecipesRender",
      "inventoryRecipesInit",
      "inventoryCountLoad",
      "inventoryCountRender",
      "inventoryCountInit"
    ].forEach(function (name) {
      wrap(POS, name, D.pos, "POS");
    });

    if (POS.api) {
      [
        "ingredientsList",
        "purchaseUnitsList",
        "recipesList",
        "inventoryCountList",
        "stockCountList",
        "countList",
        "menusList"
      ].forEach(function (name) {
        wrap(POS.api, name, D.api, "API");
      });
    }

    /* ดัก Supabase จริง แต่ไม่แตะ DOM */
    if (
      POS.supabase &&
      POS.supabase.functions &&
      typeof POS.supabase.functions.invoke === "function" &&
      !POS.supabase.functions.invoke.__safeStockDiag
    ) {
      const fn = POS.supabase.functions.invoke;
      original.invoke = fn;

      const wrappedInvoke = function () {
        const t = performance.now();
        const args = arguments;
        const functionName =
          args[0] && typeof args[0] === "string"
            ? args[0]
            : "(unknown)";

        let result;

        try {
          result = fn.apply(this, args);
        } catch (e) {
          record(D.invoke, functionName, ms(t), {
            ok: false,
            error: String(e)
          });
          throw e;
        }

        if (result && typeof result.then === "function") {
          return result.then(function (value) {
            record(D.invoke, functionName, ms(t), { ok: true });
            return value;
          }).catch(function (e) {
            record(D.invoke, functionName, ms(t), {
              ok: false,
              error: String(e && e.message ? e.message : e)
            });
            throw e;
          });
        }

        record(D.invoke, functionName, ms(t), { ok: true });
        return result;
      };

      wrappedInvoke.__safeStockDiag = true;
      POS.supabase.functions.invoke = wrappedInvoke;
    }
  }

  install();

  /* เผื่อ POS/API ถูกสร้างหลัง Diagnostic */
  const timer = setInterval(function () {
    install();
  }, 500);

  setTimeout(function () {
    clearInterval(timer);
  }, 10000);

  /* ---------- ปุ่มลอยขนาดเล็ก ---------- */
  const panel = document.createElement("div");
  panel.id = "__stockSafeDiagPanel";
  panel.style.cssText =
    "position:fixed;left:8px;right:8px;bottom:8px;z-index:999999;" +
    "background:#111;color:#fff;padding:10px;border-radius:10px;" +
    "font:13px -apple-system,BlinkMacSystemFont,Arial,sans-serif;" +
    "box-shadow:0 3px 15px rgba(0,0,0,.3)";

  panel.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<b>📊 STOCK SAFE DIAGNOSTIC</b>' +
      '<button id="__stockSafeReset">RESET</button>' +
    '</div>' +
    '<div id="__stockSafeText" style="margin-top:6px">พร้อมวัด...</div>';

  function updatePanel() {
    const text = document.getElementById("__stockSafeText");
    if (!text) return;

    const lastApi = D.api.slice(-5).reverse();
    const lastInvoke = D.invoke.slice(-5).reverse();
    const lastPos = D.pos.slice(-8).reverse();

    let html =
      "API wrapper: " + D.api.length +
      " | Supabase: " + D.invoke.length +
      " | PAGE: " + D.pos.length;

    if (lastPos.length) {
      html += '<hr><b>PAGE / FUNCTION</b>';
      lastPos.forEach(function (r) {
        html += "<br>" + r.ms + " ms — " + r.name;
      });
    }

    if (lastApi.length) {
      html += '<hr><b>API</b>';
      lastApi.forEach(function (r) {
        html += "<br>" + r.ms + " ms — " + r.name +
          (r.ok === false ? " ❌" : " ✅");
      });
    }

    if (lastInvoke.length) {
      html += '<hr><b>SUPABASE FUNCTIONS</b>';
      lastInvoke.forEach(function (r) {
        html += "<br>" + r.ms + " ms — " + r.name +
          (r.ok === false ? " ❌" : " ✅");
      });
    }

    text.innerHTML = html;
  }

  document.body.appendChild(panel);

  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "__stockSafeReset") {
      D.started = performance.now();
      D.api.length = 0;
      D.pos.length = 0;
      D.invoke.length = 0;
      D.errors.length = 0;
      updatePanel();
    }
  });

  /* อัปเดตเป็นระยะ ไม่ใช้ MutationObserver */
  const uiTimer = setInterval(updatePanel, 500);
  setTimeout(function () {
    clearInterval(uiTimer);
  }, 30 * 60 * 1000);

  window.stockSafeReport = function () {
    console.log("========== POS CHILL SAFE STOCK DIAGNOSTIC ==========");
    console.log("PAGE / FUNCTION");
    console.table(D.pos);
    console.log("API");
    console.table(D.api);
    console.log("SUPABASE FUNCTIONS");
    console.table(D.invoke);
    return D;
  };

  window.stockSafeReset = function () {
    D.started = performance.now();
    D.api.length = 0;
    D.pos.length = 0;
    D.invoke.length = 0;
    D.errors.length = 0;
    updatePanel();
  };

  updatePanel();

  console.log("POS CHILL SAFE STOCK DIAGNOSTIC installed.");
  console.log("ใช้ stockSafeReport() เพื่อดูผลทั้งหมด");
  console.log("ใช้ stockSafeReset() เพื่อเริ่มวัดใหม่");
})();
