// ./js/main.js

// ヘッダーを動的に読み込む関数
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) {
    console.warn('header-container が見つかりません');
    return;
  }

  fetch('./header.html')
    .then(response => response.text())
    .then(html => {
      headerContainer.innerHTML = html;

      // ヘッダー読み込み後にハンバーガーメニューのイベントを設定
      initHamburgerMenu();

      // アクティブタブの設定
      setActiveTab();
    })
    .catch(error => {
      console.error('ヘッダーの読み込みに失敗しました:', error);
    });
}

// アクティブタブを設定する関数
function setActiveTab() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const tabItems = document.querySelectorAll('.header-tabs__item');

  tabItems.forEach(tab => {
    const tabTarget = tab.getAttribute('data-tab-target');
    if (tabTarget === currentPage ||
        (currentPage === '' && tabTarget === 'index.html') ||
        (currentPage === 'index.html' && tabTarget === 'index.html')) {
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');
    } else {
      tab.classList.remove('is-active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    }
  });
}

// フッターを動的に読み込む関数
function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) {
    console.warn('footer-container が見つかりません');
    return;
  }

  // フッターが既に読み込まれている場合はスキップ
  if (footerContainer.querySelector('.site-footer')) {
    return;
  }

  // 現在のページが確認ページ（contact-mail.php）または完了画面（contact-thanks.html）かどうかを判定
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || '';
  const isConfirmPage = currentPage === 'contact-mail.php' || currentPath.includes('contact-mail.php');
  const isThanksPage = currentPage === 'contact-thanks.html' || currentPath.includes('contact-thanks.html');
  const isConfirmOrThanksPage = isConfirmPage || isThanksPage;

  // 確認ページ・完了画面の場合は専用のフッターを読み込む（追従ボタンがないため）
  const footerFile = isConfirmOrThanksPage ? './footer-confirm.html' : './footer.html';

  fetch(footerFile)
    .then(response => response.text())
    .then(html => {
      footerContainer.innerHTML = html;
      // フッターが正しい位置に表示されるようにする
      footerContainer.style.display = 'block';
      footerContainer.style.position = 'relative';
    })
    .catch(error => {
      console.error('フッターの読み込みに失敗しました:', error);
    });
}

// FAQアコーディオンの初期化
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq__content-item');
  faqItems.forEach(item => {
    const button = item.querySelector('.faq__content-item-title-icon');
    if (!button) return;
    button.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__content-item--open');
      if (isOpen) {
        item.classList.remove('faq__content-item--open');
        button.setAttribute('aria-label', '開く');
      } else {
        item.classList.add('faq__content-item--open');
        button.setAttribute('aria-label', '閉じる');
      }
    });
  });
}

// プライバシーポリシーモーダルの初期化
function initPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  const modalBody = document.getElementById('privacy-modal-body');
  const modalFooter = document.getElementById('privacy-modal-footer');
  const privacyLink = document.getElementById('privacy-link');
  const privacyCheckbox = document.getElementById('privacy-checkbox');
  const modalCheckbox = document.getElementById('privacy-modal-checkbox');
  const closeBtn = modal?.querySelector('.privacy-modal__close');
  const overlay = modal?.querySelector('.privacy-modal__overlay');

  if (!modal || !privacyLink || !privacyCheckbox || !modalCheckbox) return;

  // モーダルを開く
  const openModal = () => {
    modal.classList.add('is-active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    // スクロール位置をリセット
    modalBody.scrollTop = 0;
    // チェック状態をリセット
    privacyCheckbox.checked = false;
    privacyCheckbox.disabled = true;
    modalCheckbox.checked = false;
    modalCheckbox.disabled = true;
    checkScrollPosition();
  };

  // モーダルを閉じる
  const closeModal = () => {
    modal.classList.remove('is-active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };

  // スクロール位置をチェック
  const checkScrollPosition = () => {
    const scrollTop = modalBody.scrollTop;
    const scrollHeight = modalBody.scrollHeight;
    const clientHeight = modalBody.clientHeight;
    const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10pxの余裕を持たせる

    if (isScrolledToBottom) {
      privacyCheckbox.disabled = false;
      modalCheckbox.disabled = false;
      modalFooter.classList.add('is-read');
    } else {
      privacyCheckbox.disabled = true;
      modalCheckbox.disabled = true;
      modalFooter.classList.remove('is-read');
    }
  };

  // イベントリスナー
  privacyLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // スクロール監視
  modalBody.addEventListener('scroll', checkScrollPosition);

  // モーダル内のチェックボックスとフォームのチェックボックスを同期
  modalCheckbox.addEventListener('change', (e) => {
    privacyCheckbox.checked = e.target.checked;
    if (e.target.checked) {
      setTimeout(() => {
        closeModal();
      }, 300);
    }
  });

  // フォームのチェックボックスがチェックされたらモーダル内のチェックボックスも同期
  privacyCheckbox.addEventListener('change', (e) => {
    modalCheckbox.checked = e.target.checked;
    if (e.target.checked && modal.classList.contains('is-active')) {
      setTimeout(() => {
        closeModal();
      }, 300);
    }
  });
}

// 動画の最初のフレームを表示する関数
function initVideo() {
  const video = document.getElementById('main-video');
  if (!video) return;

  // メタデータが読み込まれたら最初のフレームを表示
  video.addEventListener('loadedmetadata', function() {
    // 最初のフレームを表示するためにcurrentTimeを0に設定
    video.currentTime = 0;
  });

  // 動画データが読み込まれたら最初のフレームを表示
  video.addEventListener('loadeddata', function() {
    // 最初のフレームを表示
    video.currentTime = 0;
  });

  // 読み込みを開始
  video.load();
}

// フローの「もっと見る」ボタンの初期化
function initFlowMore() {
  const flowMoreBtn = document.getElementById('flow-more-btn');
  const flowCloseBtn = document.getElementById('flow-close-btn');
  const flowCloseBtnWrap = document.getElementById('flow-close-btn-wrap');
  const hiddenSteps = document.querySelectorAll('.flow__step--hidden');

  if (!flowMoreBtn || !flowCloseBtn || !flowCloseBtnWrap || hiddenSteps.length === 0) return;

  let isOpen = false;

  // 「もっと見る」ボタンのクリック
  flowMoreBtn.addEventListener('click', () => {
    // STEP5以降を表示
    hiddenSteps.forEach(step => {
      step.classList.add('is-visible');
    });

    // 「もっと見る」ボタンを非表示
    flowMoreBtn.closest('.flow__more-btn-wrap').style.display = 'none';
    
    // 「閉じる」ボタンを表示
    flowCloseBtnWrap.style.display = 'flex';
    
    isOpen = true;
  });

  // 「閉じる」ボタンのクリック
  flowCloseBtn.addEventListener('click', () => {
    // STEP11からSTEP5まで順番に閉じる（下から上へ）
    const stepsArray = Array.from(hiddenSteps).reverse(); // STEP11からSTEP5の順序にする
    
    stepsArray.forEach((step, index) => {
      setTimeout(() => {
        step.classList.remove('is-visible');
        
        // 最後のステップが閉じたら、ボタンの切り替えを行う
        if (index === stepsArray.length - 1) {
          setTimeout(() => {
            // 「閉じる」ボタンを非表示
            flowCloseBtnWrap.style.display = 'none';
            // 「もっと見る」ボタンを表示
            flowMoreBtn.closest('.flow__more-btn-wrap').style.display = 'flex';
            isOpen = false;
          }, 800); // アニメーション完了を待つ（transition: 0.8s）
        }
      }, index * 50); // 各ステップに50msの遅延を設定（よりスムーズに）
    });
  });
}

// // MVセクションのアニメーションを初期化
// function initMVSplash() {
//   const mvSection = document.querySelector('.mv');
//   if (!mvSection) return;
//   // ページ読み込み時にアニメーションを開始
//   window.addEventListener('load', () => {
//     // copy-middleのアニメーションを開始
//     const copyMiddle = document.querySelector('.mv__copy-middle');
//     if (copyMiddle) {
//       setTimeout(() => {
//         copyMiddle.classList.add('is-active');
//       }, 100);
//     }
//     // copy-bottomのアニメーションを開始
//     const copyBottom = document.querySelector('.mv__copy-bottom');
//     if (copyBottom) {
//       setTimeout(() => {
//         copyBottom.classList.add('is-active');
//       }, 1200);
//     }
//   });
// }

// Aboutセクションのコメントアニメーションを初期化
function initAboutComments() {
  const aboutComments = document.querySelectorAll('.about__comment');
  if (aboutComments.length === 0) return;
  
  // Intersection Observerを使用して、セクションが表示されたらアニメーション開始
  const aboutSection = document.querySelector('.about');
  if (!aboutSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // モバイルサイズ（768px以下）の場合は上から順番に表示
        const isMobile = window.innerWidth <= 768;
        const delay = isMobile ? 100 : 300; // モバイルの場合は100ms間隔
        
        // 各コメントを順番に表示
        aboutComments.forEach((comment, index) => {
          setTimeout(() => {
            comment.classList.add('is-active');
          }, index * delay);
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5 // セクションの20%が表示されたら開始
  });
  
  observer.observe(aboutSection);
}

// Riskセクションのタイトルアニメーションを初期化
// function initRiskTitle() {
//   const riskTitle = document.querySelector('.risk__title');
//   if (!riskTitle) return;
  
//   // Intersection Observerを使用して、セクションが表示されたらアニメーション開始
//   const riskSection = document.querySelector('.risk');
//   if (!riskSection) return;
  
//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       if (entry.isIntersecting) {
//         // タイトルの擬似要素を表示
//         setTimeout(() => {
//           riskTitle.classList.add('is-active');
//         }, 600);
//         observer.unobserve(entry.target);
//       }
//     });
//   }, {
//     threshold: 0.8 // セクションの50%が表示されたら開始
//   });
  
//   observer.observe(riskSection);
// }

// Riskセクションのカードアニメーションを初期化
function initRiskCards() {
  const riskCards = document.querySelectorAll('.risk__card');
  if (riskCards.length === 0) return;
  
  // Intersection Observerを使用して、セクションが表示されたらアニメーション開始
  const riskSection = document.querySelector('.risk');
  if (!riskSection) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 各カードを順番に回転表示
        riskCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('is-active');
          }, index * 200); // 200ms間隔で順番に表示
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2 // セクションの20%が表示されたら開始
  });
  
  observer.observe(riskSection);
}

// Reasonセクションのカード画像アニメーションを初期化
// function initReasonCards() {
//   const reasonCardImgs = document.querySelectorAll('.reason__card-img');
//   if (reasonCardImgs.length === 0) return;
  
//   // 各画像に対して個別にIntersection Observerを設定
//   reasonCardImgs.forEach((img) => {
//     const observer = new IntersectionObserver((entries) => {
//       entries.forEach(entry => {
//         if (entry.isIntersecting) {
//           // 画面に入ってから少し遅延してアニメーション開始
//           setTimeout(() => {
//             entry.target.classList.add('is-active');
//           }, 300);
//           observer.unobserve(entry.target);
//         }
//       });
//     }, {
//       threshold: 0.1, // 要素の10%が表示されたら開始
//       rootMargin: '0px 0px -50px 0px' // 下から50px手前で発火
//     });
    
//     observer.observe(img);
//   });
// }

// Priceセクションの画像回転アニメーションを初期化
function initPriceCardImages() {
  const priceCardImages = document.querySelectorAll('.price__card-image-after');
  if (priceCardImages.length === 0) return;
  
  // 各画像に対して個別にIntersection Observerを設定
  priceCardImages.forEach((img) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 画面に入ってから少し遅延してアニメーション開始
          setTimeout(() => {
            entry.target.classList.add('is-active');
          }, 300);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(img);
  });
}

// 背景画像の遅延読み込みを初期化
function initLazyBackgroundImages() {
  // 遅延読み込みする背景画像のマッピング
  const backgroundImages = [
    { selector: '.area', image: './img/area/area-bg.jpg' },
    { selector: '.risk', image: './img/risk/risk-bg.png' },
    { selector: '.price', image: './img/price/price-bg.svg' },
    { selector: '.voice', image: './img/voice/voice-bg.png' },
    { selector: '.contact', image: './img/contact/contact-bg.png' }
  ];

  // Intersection Observerのオプション
  const observerOptions = {
    root: null,
    rootMargin: '50px', // 50px手前で読み込み開始
    threshold: 0.01
  };

  // 背景画像をプリロードする関数
  function preloadBackgroundImage(url) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  }

  // Intersection Observerのコールバック
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const bgImage = backgroundImages.find(bg => target.matches(bg.selector));
        
        if (bgImage && !target.dataset.bgLoaded) {
          // 背景画像をプリロード
          preloadBackgroundImage(bgImage.image);
          // 読み込み済みフラグを設定
          target.dataset.bgLoaded = 'true';
          // オブザーバーから削除
          observer.unobserve(target);
        }
      }
    });
  }, observerOptions);

  // 各セクションを監視
  backgroundImages.forEach(bg => {
    const elements = document.querySelectorAll(bg.selector);
    elements.forEach(el => {
      observer.observe(el);
    });
  });
}

// ページ読み込み時にヘッダーとフッターを読み込む
document.addEventListener('DOMContentLoaded', function() {
  loadHeader();
  loadFooter();
  initFAQ();
  initPrivacyModal();
  initVideo();
  initFlowMore();
  // initMVSplash(); // MVアニメーション削除
  initAboutComments();
  // initRiskTitle();
  // initRiskCards();
  // initReasonCards(); // コメントアウト済み
  initPriceCardImages();
  initLazyBackgroundImages();
});
