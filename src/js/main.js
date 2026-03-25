$(document).ready(function () {
  // #prepare 링크 클릭 시 "준비중입니다." alert 표시
  $('a[href="#prepare"]').on("click", function (e) {
    e.preventDefault();
    alert("준비중입니다.");
  });

  // Visual Swiper 초기화
  const visualSwiper = new Swiper("#visualSwiper", {
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    autoplay: {
      delay: 4300, // 4.3초
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    loop: true,
    speed: 1000,
    allowTouchMove: false,
  });

  // 재생/정지 토글 버튼
  const $toggleBtn = $("#visualToggle");
  $toggleBtn.on("click", function () {
    const $btn = $(this);
    if ($btn.hasClass("playing")) {
      visualSwiper.autoplay.stop();
      $btn.removeClass("playing").addClass("paused");
    } else {
      // autoplay 재시작
      visualSwiper.autoplay.stop();
      visualSwiper.params.autoplay.delay = 4300;
      visualSwiper.autoplay.start();
      $btn.removeClass("paused").addClass("playing");
    }
  });

  // 이전 슬라이드 버튼
  $("#visualPrev").on("click", function () {
    visualSwiper.slidePrev();
  });

  // 다음 슬라이드 버튼
  $("#visualNext").on("click", function () {
    visualSwiper.slideNext();
  });

  // Swiper 슬라이드 변경 시 autoplay 상태에 따라 버튼 상태 업데이트
  visualSwiper.on("autoplayStop", function () {
    $toggleBtn.removeClass("playing").addClass("paused");
  });

  visualSwiper.on("autoplayStart", function () {
    $toggleBtn.removeClass("paused").addClass("playing");
  });

  // 활성 슬라이드의 data-item과 recommend-menu__inner의 data-item을 비교하여 active 클래스 관리
  function updateRecommendMenuActive(swiperInstance) {
    // Swiper 인스턴스에서 활성 슬라이드 가져오기
    const activeSlide = swiperInstance.slides[swiperInstance.activeIndex];
    const $activeSlide = $(activeSlide);
    const activeItem = $activeSlide.attr("data-item");

    // 모든 recommend-menu__inner에서 active 클래스 제거
    $(".recommend-menu__inner").removeClass("active");

    if (activeItem) {
      // 일치하는 data-item을 가진 요소에 active 클래스 추가
      $(".recommend-menu__inner")
        .filter(function () {
          return $(this).attr("data-item") === activeItem;
        })
        .addClass("active");
    }
  }

  // Recommend Swiper 초기화
  const recommendSwiper = new Swiper("#recommendSwiper", {
    slidesPerView: "auto",
    spaceBetween: 0, // 슬라이드 간 간격
    centeredSlides: false, // 중앙 정렬 비활성화
    on: {
      init: function () {
        updateRecommendMenuActive(this);
      },
      slideChange: function () {
        updateRecommendMenuActive(this);
      },
    },
  });

  // 이전 슬라이드 버튼 (한 슬라이드씩 이동)
  $("#recommendPrev").on("click", function () {
    recommendSwiper.slidePrev();
  });

  // 다음 슬라이드 버튼 (한 슬라이드씩 이동)
  $("#recommendNext").on("click", function () {
    recommendSwiper.slideNext();
  });

  const newsSwiper = new Swiper("#newsSwiper", {
    slidesPerView: "auto",
    spaceBetween: 0,
    slidesPerGroup: 1,
    loop: false,
    navigation: {
      nextEl: "#newsNext",
      prevEl: "#newsPrev",
    },
  });

  function updatePeoplePosition() {
    const $title = $(".section-hero__title");
    const $people = $(".section-hero__people");

    if ($title.length && $people.length) {
      const windowWidth = $(window).width();

      if (windowWidth >= 1585) {
        const titleOffsetRight =
          $title[0].offsetLeft + $title[0].offsetWidth - 210;
        $people.css("left", titleOffsetRight + "px");
      } else {
        $people.css("left", "");
      }
    }
  }

  // 초기 실행 및 리사이즈 시 업데이트
  updatePeoplePosition();
  $(window).on("resize", function () {
    updatePeoplePosition();
  });

  // 숫자 카운팅 애니메이션 함수
  function animateCounter($element, targetValue, duration = 2000) {
    // 콤마 제거하고 숫자만 추출
    const numericValue = parseInt(targetValue.replace(/,/g, ""));
    const hasComma = targetValue.includes(",");
    const startValue = 0;
    const increment = numericValue / (duration / 16); // 60fps 기준
    let currentValue = startValue;

    const timer = setInterval(function () {
      currentValue += increment;
      if (currentValue >= numericValue) {
        currentValue = numericValue;
        clearInterval(timer);
      }

      // 콤마가 있으면 포맷팅
      let displayValue = Math.floor(currentValue);
      if (hasComma) {
        displayValue = displayValue.toLocaleString();
      }
      $element.text(displayValue);
    }, 16);
  }

  // Intersection Observer로 요소가 뷰포트에 들어올 때 애니메이션 시작
  const observerOptions = {
    threshold: 0.5, // 요소가 50% 보일 때
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const $numElement = $(entry.target);
        const targetValue = $numElement.data("target") || $numElement.text();

        // 이미 애니메이션이 실행되었는지 확인
        if (!$numElement.data("animated")) {
          $numElement.data("animated", true);
          $numElement.data("target", targetValue);
          animateCounter($numElement, targetValue);
        }
      }
    });
  }, observerOptions);

  // 모든 .stat-list__num 요소에 Observer 적용
  $(".stat-list__num").each(function () {
    const $num = $(this);
    const targetValue = $num.text().trim();
    $num.data("target", targetValue);
    $num.text("0"); // 초기값을 0으로 설정
    observer.observe(this);
  });

  // Food List 모달 기능
  // .food-list__link 클릭 시 모달 열기
  $(".food-list__link").on("click", function (e) {
    e.preventDefault();
    const $link = $(this);
    const targetItem = $link.attr("href"); // 예: #item-1
    const $modal = $(".page-modal");
    const $modalInner = $(".page-modal__inner");
    const windowWidth = $(window).width();

    // 모달 활성화
    $modal.addClass("page-modal--active");

    // 모바일 환경(768px 이하)에서만 위치 조정 기능 작동
    if (windowWidth <= 768) {
      // 클릭한 요소의 문서 기준 top 위치 계산 (jQuery offset 사용)
      const linkOffset = $link.offset();
      const linkTop = linkOffset ? linkOffset.top : 0;

      // page-modal__inner의 top을 클릭한 요소의 문서 기준 top 위치로 설정
      $modalInner.css("top", linkTop + "px");
    } else {
      // 데스크톱 환경에서는 top 스타일 제거 (기본 CSS 스타일 사용)
      $modalInner.css("top", "");
    }

    // 모든 modal body의 active 클래스 제거
    $(".page-modal__body").removeClass("page-modal__body--active");

    // data-item이 일치하는 modal body에 active 클래스 추가
    $(".page-modal__body")
      .filter(function () {
        return $(this).attr("data-item") === targetItem;
      })
      .addClass("page-modal__body--active");

    // 모달이 화면에 표시된 후, page-modal__inner를 수직 정중앙으로 스크롤 (모든 환경에서 작동)
    setTimeout(function () {
      const modalInnerOffset = $modalInner.offset();
      if (modalInnerOffset) {
        const modalInnerTop = modalInnerOffset.top;
        const modalInnerHeight = $modalInner.outerHeight();
        const windowHeight = $(window).height();

        // 모달이 화면 중앙에 오도록 계산
        // 중앙 위치 = 모달 top + (모달 높이 / 2) - (화면 높이 / 2)
        const targetScrollTop =
          modalInnerTop + modalInnerHeight / 2 - windowHeight / 2;

        // 부드럽게 스크롤
        $("html, body").animate(
          {
            scrollTop: targetScrollTop,
          },
          300
        );
      }
    }, 50);
  });

  // 모달 닫기 기능
  // .page-modal 바깥쪽 클릭 시 (inner 제외)
  $(".page-modal").on("click", function (e) {
    if ($(e.target).hasClass("page-modal")) {
      $(this).removeClass("page-modal--active");
    }
  });

  // .btn-close 클릭 시
  $(".btn-close").on("click", function (e) {
    e.preventDefault();
    $(".page-modal").removeClass("page-modal--active");
  });

  // Sitemap 기능
  // .btn-sitemap 클릭 시 sitemap 열기
  $(".btn-sitemap").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // document 클릭 이벤트로 전파 방지
    $(".sitemap").addClass("sitemap--active");
  });

  // .sitemap 내 .btn-close 클릭 시 닫기
  $(".sitemap .btn-close").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation(); // 부모 요소로 이벤트 전파 방지
    $(".sitemap").removeClass("sitemap--active");
  });

  // .sitemap 바깥쪽 클릭 시 닫기 (document 레벨에서 처리)
  $(document).on("click", function (e) {
    const $sitemap = $(".sitemap");
    // sitemap이 active 상태일 때만 체크
    if ($sitemap.hasClass("sitemap--active")) {
      // 클릭된 요소가 sitemap 내부가 아닐 때만 닫기
      if (!$sitemap.is(e.target) && $sitemap.has(e.target).length === 0) {
        $sitemap.removeClass("sitemap--active");
      }
    }
  });

  // ESC 키를 눌렀을 때 sitemap 닫기
  $(document).on("keydown", function (e) {
    // ESC 키 코드: 27
    if (e.keyCode === 27 || e.key === "Escape") {
      const $sitemap = $(".sitemap");
      if ($sitemap.hasClass("sitemap--active")) {
        $sitemap.removeClass("sitemap--active");
      }
    }
  });

  // Tab 스크롤 기능 - 활성 탭의 오른쪽으로 스크롤 이동
  function scrollActiveTabIntoView() {
    const $tabContainer = $(".site-body__tab");
    const $activeLink = $(".tab-list__link--active");

    if ($tabContainer.length && $activeLink.length) {
      const container = $tabContainer[0];
      const activeLink = $activeLink[0];

      // 스크롤 가능한지 확인
      if (container.scrollWidth > container.clientWidth) {
        // 활성 링크의 오른쪽 위치 계산
        const linkRight = activeLink.offsetLeft + activeLink.offsetWidth;
        const containerWidth = container.clientWidth;

        // 활성 링크의 오른쪽이 컨테이너 오른쪽에 맞도록 스크롤
        container.scrollLeft = linkRight - containerWidth;
      }
    }
  }

  // 페이지 로드 시 실행
  $(window).on("load", function () {
    scrollActiveTabIntoView();
  });
});
