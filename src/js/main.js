$(document).ready(function () {
  // #prepare 링크 클릭 시 "준비중입니다." alert 표시
  $('a[href="#prepare"]').on("click", function (e) {
    e.preventDefault();
    alert("준비중입니다.");
  });

  // Hide lnb list when it overflows its container (.lnb).
  (function initLnbOverflowGuard() {
    const $lnb = $(".lnb");
    const $list = $(".lnb .lnb-list--depth-1");
    if ($lnb.length === 0 || $list.length === 0) return;

    const lnb = $lnb.get(0);
    const list = $list.get(0);

    // Create a measurement clone so overflow detection remains stable
    // even when the real list is hidden (display: none).
    const measure = list.cloneNode(true);
    measure.setAttribute("aria-hidden", "true");
    measure.classList.add("lnb-list--measure");
    Object.assign(measure.style, {
      position: "absolute",
      left: "-99999px",
      top: "0",
      visibility: "hidden",
      pointerEvents: "none",
      height: "auto",
      width: "auto",
      display: "flex",
      flexWrap: "nowrap",
    });
    lnb.appendChild(measure);

    const syncMeasure = () => {
      measure.innerHTML = list.innerHTML;
    };

    const update = () => {
      const requiredWidth = measure.scrollWidth;
      const availableWidth = lnb.clientWidth;
      const epsilon = 1; // avoid boundary jitter from rounding
      const isOverflowing = requiredWidth > availableWidth + epsilon;
      $list.toggleClass("is-hidden", isOverflowing);
    };

    // React to container size changes (responsive resize/layout changes).
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => requestAnimationFrame(update));
      ro.observe(lnb);
    } else {
      // Fallback for older browsers.
      $(window).on("resize", update);
    }

    // React to menu item add/remove (dynamic navigation changes).
    if (typeof MutationObserver !== "undefined") {
      const mo = new MutationObserver(() => {
        syncMeasure();
        update();
      });
      mo.observe(list, { childList: true, subtree: true, characterData: true });
    }

    syncMeasure();
    update();
  })();
});
