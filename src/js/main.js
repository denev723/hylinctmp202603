$(document).ready(function () {
  // AOS: responsive data-aos per breakpoint (mobile/tablet/desktop)
  (function initAosController() {
    // Breakpoints aligned with `src/scss/pages/_common.scss`
    // Note: there is also a 942px breakpoint in SCSS, but AOS tiers intentionally ignore it.
    const AOS_BP_MOBILE_MAX = 780;
    const AOS_BP_TABLET_MAX = 1114;

    const getTier = () => {
      const w = window.innerWidth || 0;
      if (w < AOS_BP_MOBILE_MAX) return "mobile";
      if (w < AOS_BP_TABLET_MAX) return "tablet";
      return "desktop";
    };

    const applyResponsiveAosAttributes = () => {
      const tier = getTier();
      const $nodes = $("[data-aos]");
      if ($nodes.length === 0) return;

      $nodes.each(function () {
        const $el = $(this);
        const base = $el.attr("data-aos-base") || $el.attr("data-aos") || "";
        if (!$el.is("[data-aos-base]")) $el.attr("data-aos-base", base);

        const override = $el.attr(`data-aos-${tier}`) || "";
        const next = (override || base).trim();
        if (next) $el.attr("data-aos", next);

        // Desktop-only delay: apply on desktop, remove on other tiers
        const desktopDelay = $el.attr("data-aos-delay-desktop");
        const currentDelay = $el.attr("data-aos-delay");
        if (tier === "desktop") {
          if (desktopDelay != null && String(desktopDelay).trim() !== "") {
            $el.attr("data-aos-delay", String(desktopDelay).trim());
          }
          // else: keep existing data-aos-delay as-is
        } else {
          // If the author used desktop-only delay, ensure it doesn't apply on smaller breakpoints.
          if (desktopDelay != null || currentDelay != null) $el.removeAttr("data-aos-delay");
        }
      });
    };

    const hasAos = () =>
      typeof window.AOS !== "undefined" && window.AOS && typeof window.AOS.init === "function";

    const applyAndRefresh = () => {
      applyResponsiveAosAttributes();
      if (!hasAos()) return;
      if (typeof window.AOS.refresh === "function") window.AOS.refresh();
    };

    const initIfNeeded = () => {
      applyResponsiveAosAttributes();
      if (!hasAos()) return;
      window.AOS.init({
        duration: 600,
        easing: "ease-out",
      });
      if (typeof window.AOS.refreshHard === "function") window.AOS.refreshHard();
    };

    let resizeTimer = 0;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = 0;
        applyAndRefresh();
      }, 150);
    };

    initIfNeeded();
    $(window).on("resize.aosResponsive", onResize);
  })();

  gsap.registerPlugin(ScrollTrigger);

  let lastScroll = 0;
  let wheelDirection = null;
  const SITE_HEADER_TOP_SHOW_Y = 3;
  const SITE_HEADER_DELTA = 8;

  $(window).on("wheel", function (e) {
    const deltaY = e.originalEvent.deltaY;
    wheelDirection = deltaY > 0 ? "down" : "up";
    handleScrollBehavior(wheelDirection);
  });

  $(window).on("scroll", function () {
    const currentScroll = $(this).scrollTop();
    const diff = currentScroll - lastScroll;
    if (Math.abs(diff) < SITE_HEADER_DELTA) return;
    wheelDirection = diff > 0 ? "down" : "up";
    lastScroll = currentScroll;
    handleScrollBehavior(wheelDirection);
  });

  function handleScrollBehavior(direction) {
    const scrollTop = $(window).scrollTop();
    if (scrollTop <= SITE_HEADER_TOP_SHOW_Y) {
      $("body").removeClass("is-site-header-hide").addClass("is-site-header-show");
      return;
    }
    if (direction === "down") {
      $("body").removeClass("is-site-header-show");
      $("body").addClass("is-site-header-hide");
    } else {
      $("body").removeClass("is-site-header-hide");
      $("body").addClass("is-site-header-show");
    }
  }

  const $body = $("body");
  const $pageTabWrap = $(".page-tab-wrap");
  const fixedPageTabClass = "page-tab-fixed";
  const showHeaderClass = "is-site-header-show";
  let headerHeight = 0;

  updateHeaderHeight();
  handleTabBehavior();

  $(window).on("scroll", handleTabBehavior);
  $(window).on("resize ", function () {
    updateHeaderHeight();
    handleTabBehavior();
  });

  function handleTabBehavior() {
    if ($pageTabWrap.length === 0 || $pageTabWrap.children(".page-tab").length === 0) return;

    const scrollTop = $(window).scrollTop();
    const baseline = $pageTabWrap.offset().top;

    if ($body.hasClass(showHeaderClass)) {
      $body.toggleClass(fixedPageTabClass, scrollTop >= baseline - headerHeight);
    } else {
      $body.toggleClass(fixedPageTabClass, scrollTop >= baseline);
    }
  }

  function updateHeaderHeight() {
    headerHeight = window.innerWidth < 781 ? 81 : 101;
  }

  // Center active tab item in horizontal scroll container (.page-tab__inner)
  const centerActivePageTab = () => {
    const $inner = $(".page-tab__inner");
    const $activeItem = $(".page-tab__list > .page-tab__item.is-active").first();
    if ($inner.length === 0 || $activeItem.length === 0) return;

    const innerEl = $inner.get(0);
    const itemEl = $activeItem.get(0);
    if (!innerEl || !itemEl) return;

    // No-op when horizontal overflow does not exist.
    if (innerEl.scrollWidth <= innerEl.clientWidth) return;

    const target = itemEl.offsetLeft + itemEl.offsetWidth / 2 - innerEl.clientWidth / 2;

    const maxScrollLeft = innerEl.scrollWidth - innerEl.clientWidth;
    const clamped = Math.max(0, Math.min(target, maxScrollLeft));

    $inner.scrollLeft(clamped);
  };

  centerActivePageTab();
  $(document).on(
    "click.pageTabCenter",
    ".page-tab__list > .page-tab__item > .page-tab__link",
    function () {
      setTimeout(centerActivePageTab, 0);
    }
  );

  const updateSitemapScrollFade = () => {
    const $body = $(".sitemap__body");
    const $inner = $(".sitemap__inner");
    if ($body.length === 0 || $inner.length === 0) return;

    const el = $body.get(0);
    // MDN recommends allowing a small threshold because scrollTop can be fractional.
    const atBottom = Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) <= 1;
    const atTop = Math.abs(el.scrollTop) <= 1;
    $inner.toggleClass("is-scroll-end", atBottom);
    // Show top fade once user starts scrolling down.
    $inner.toggleClass("is-scroll-start", !atTop);
  };

  const bindSitemapScrollFade = () => {
    const $body = $(".sitemap__body");
    if ($body.length === 0) return;
    // Direct binding (scroll doesn't reliably work with delegated handlers).
    $body.off("scroll.sitemapFade").on("scroll.sitemapFade", function () {
      updateSitemapScrollFade();
    });
  };

  // 사이트맵 열기/닫기 (마크업: href="javascript:sitemapOpen()" 등)
  window.sitemapOpen = function () {
    $(".sitemap").addClass("is-active");
    bindSitemapScrollFade();
    // Ensure fade state is correct on open.
    requestAnimationFrame(updateSitemapScrollFade);
  };
  window.sitemapClose = function () {
    $(".sitemap").removeClass("is-active");
  };

  // 사이트맵 오버레이(패널 바깥) 클릭 시 닫기
  $(document).on("click", ".sitemap.is-active", function (e) {
    if ($(e.target).closest(".sitemap__inner").length === 0) {
      window.sitemapClose();
    }
  });

  // Sitemap scroll fade (hide bottom gradient when scrolled to end)
  bindSitemapScrollFade();

  // 사이트맵 메뉴 토글 (마크업: href="javascript:sitemapMenuToggle()")
  window.sitemapMenuToggle = function () {
    // 인라인 호출용 훅 (실제 토글은 클릭 이벤트에서 처리)
  };
  $(document).on("click", 'a[href="javascript:sitemapMenuToggle()"]', function (e) {
    e.preventDefault();
    $(this).closest(".sitemap-list__item").toggleClass("is-deactive");
  });

  // #prepare 링크 클릭 시 "준비중입니다." alert 표시
  $('a[href="#prepare"]').on("click", function (e) {
    e.preventDefault();
    alert("준비중입니다.");
  });

  // Family site dropdown toggle + outside click close
  $(document).on("click", ".family-site__toggle", function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).closest(".family-site").toggleClass("is-active");
  });
  $(document).on("click", function (e) {
    if ($(e.target).closest(".family-site").length === 0) {
      $(".family-site").removeClass("is-active");
    }
  });

  // LNB logic should only run when LNB is actually visible/usable.
  (function initLnbController() {
    const $body = $("body");
    const openClass = "is-lnb-open";
    const activeItemClass = "is-active";
    const keepSelectors = [".lnb", ".lnb-cover", ".lnb .lnb-list--depth-2"].join(", ");
    const readyClass = "lnb-ready";

    let enabled = false;
    let ro = null;
    let mo = null;
    let $measure = null;
    let hoverKeepCount = 0;
    let closeTimer = 0;
    let overflowRaf = 0;
    let lastPointerX = -1;
    let lastPointerY = -1;

    const $coverTitle = $(".lnb-cover__title");
    const coverTitleDefault = $coverTitle.length ? $coverTitle.text() : "";

    const closeAll = () => {
      $body.removeClass(openClass);
      $(".lnb .lnb-list--depth-1 > .lnb-list__item").removeClass(activeItemClass);
      if ($coverTitle.length) $coverTitle.text(coverTitleDefault);
    };

    const markReady = () => {
      $body.addClass(readyClass);
    };

    const isLnbUsable = () => {
      const $lnb = $(".lnb");
      if ($lnb.length === 0) return false;
      if (!$lnb.is(":visible")) return false;
      return ($lnb.innerWidth() || 0) > 0;
    };

    const isPointOverKeepArea = (clientX, clientY) => {
      if (typeof document.elementFromPoint !== "function") return false;
      if (clientX < 0 || clientY < 0) return false;
      const el = document.elementFromPoint(clientX, clientY);
      if (!el) return false;
      return $(el).closest(keepSelectors).length > 0;
    };

    const scheduleCloseIfNeeded = () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        closeTimer = 0;
        if (hoverKeepCount !== 0) return;
        // Counters can briefly hit 0 while the pointer is still over the menu (browser / hit-test gaps).
        if (isPointOverKeepArea(lastPointerX, lastPointerY)) return;
        closeAll();
      }, 150);
    };

    const setActiveItem = ($item) => {
      $(".lnb .lnb-list--depth-1 > .lnb-list__item").removeClass(activeItemClass);
      $item.addClass(activeItemClass);
      $body.addClass(openClass);

      if ($coverTitle.length) {
        const text = ($item.find("> a").text() || "").trim();
        if (text) $coverTitle.text(text);
      }
    };

    const ensureMeasure = () => {
      const $lnb = $(".lnb");
      if ($lnb.length === 0) return false;
      if ($measure && $measure.length) return true;
      $measure = $("<div />")
        .addClass("lnb-list lnb-list--depth-1 lnb-list--measure")
        .css({
          position: "absolute",
          left: "-99999px",
          top: "0",
          visibility: "hidden",
          pointerEvents: "none",
          height: "auto",
          width: "auto",
          display: "flex",
          flexWrap: "nowrap",
        })
        .appendTo($lnb);
      return true;
    };

    const syncMeasure = () => {
      if (!$measure || $measure.length === 0) return;
      const $lists = $(".lnb .lnb-list--depth-1");
      if ($lists.length === 0) {
        $measure.empty();
        return;
      }
      const $source = $lists.first();
      $measure.html($source.html());
    };

    const updateOverflow = () => {
      const $lnb = $(".lnb");
      if ($lnb.length === 0) return;
      if (!ensureMeasure()) return;
      syncMeasure();

      const requiredWidth = $measure.get(0).scrollWidth || 0;
      const availableWidth = $lnb.innerWidth() || 0;
      const epsilon = 1;
      $lnb.toggleClass("is-hidden", requiredWidth > availableWidth + epsilon);
    };

    const scheduleOverflow = () => {
      if (overflowRaf) cancelAnimationFrame(overflowRaf);
      overflowRaf = requestAnimationFrame(() => {
        overflowRaf = 0;
        updateOverflow();
      });
    };

    const enable = () => {
      if (enabled) return;
      if (!isLnbUsable()) return;
      enabled = true;

      // Hover/focus bindings
      $(document)
        .on("mousemove.lnbHover", function (e) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
        })
        .on("mouseenter.lnbHover", ".lnb .lnb-list--depth-1 > .lnb-list__item", function () {
          setActiveItem($(this));
        })
        .on("focusin.lnbHover", ".lnb .lnb-list--depth-1 > .lnb-list__item > a", function () {
          setActiveItem($(this).closest(".lnb-list__item"));
        })
        .on("mouseenter.lnbHover", keepSelectors, function (e) {
          lastPointerX = e.clientX;
          lastPointerY = e.clientY;
          hoverKeepCount += 1;
          if (closeTimer) {
            clearTimeout(closeTimer);
            closeTimer = 0;
          }
        })
        .on("mouseleave.lnbHover", keepSelectors, function () {
          hoverKeepCount = Math.max(0, hoverKeepCount - 1);
          scheduleCloseIfNeeded();
        })
        .on("click.lnbHover", function (e) {
          if ($(e.target).closest(keepSelectors).length === 0) closeAll();
        })
        .on("keydown.lnbHover", function (e) {
          if (e.key === "Escape") closeAll();
        });

      // Overflow bindings
      const $lnb = $(".lnb");
      const lnbEl = $lnb.get(0);
      if (typeof ResizeObserver !== "undefined" && lnbEl) {
        ro = new ResizeObserver(() => scheduleOverflow());
        ro.observe(lnbEl);
      }
      $(window).on("resize.lnbOverflow", scheduleOverflow);
      if (typeof MutationObserver !== "undefined" && lnbEl) {
        mo = new MutationObserver(() => scheduleOverflow());
        mo.observe(lnbEl, { childList: true, subtree: true });
      }

      scheduleOverflow();
      // Mark ready after overflow state has had a chance to apply (avoid first-paint flicker).
      requestAnimationFrame(() => requestAnimationFrame(markReady));
    };

    const disable = () => {
      if (!enabled) return;
      enabled = false;

      // Unbind hover/focus handlers
      $(document).off(".lnbHover");
      hoverKeepCount = 0;
      lastPointerX = -1;
      lastPointerY = -1;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = 0;
      }
      closeAll();

      // Unbind overflow handlers
      $(window).off("resize.lnbOverflow");
      if (overflowRaf) {
        cancelAnimationFrame(overflowRaf);
        overflowRaf = 0;
      }
      if (ro) {
        ro.disconnect();
        ro = null;
      }
      if (mo) {
        mo.disconnect();
        mo = null;
      }
      if ($measure && $measure.length) {
        $measure.remove();
        $measure = null;
      }

      $(".lnb").removeClass("is-hidden");
      // Even when disabled, we don't want to keep LNB hidden forever.
      markReady();
    };

    const reconcile = () => {
      if (isLnbUsable()) enable();
      else disable();
      // If LNB doesn't exist/usable on this layout, still mark ready.
      if (!isLnbUsable()) markReady();
    };

    // React to layout changes
    $(window).on("resize.lnbController", reconcile);
    if (typeof MutationObserver !== "undefined") {
      const headerEl = document.querySelector(".site-header");
      if (headerEl) {
        const headerMo = new MutationObserver(() => reconcile());
        headerMo.observe(headerEl, { childList: true, subtree: true, attributes: true });
      }
    }

    reconcile();
  })();
});
