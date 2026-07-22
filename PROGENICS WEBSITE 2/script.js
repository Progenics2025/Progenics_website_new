// Dynamic base tag for blog subfolder to resolve relative paths correctly
if (window.location.pathname.includes('/blog/')) {
  const blogIndex = window.location.pathname.indexOf('/blog/');
  const physicalFolder = window.location.pathname.substring(0, blogIndex);
  const baseHref = window.location.origin + physicalFolder + '/';
  
  if (!document.querySelector('base')) {
    const base = document.createElement('base');
    base.href = baseHref;
    document.head.prepend(base);
  }
}

const PREVENTIVE_FILES = [];
const CLINICAL_FILES = [];
const DISCOVERY_FILES = ["Microbial Innovation and Discovery.html"];

const isInSubfolder = /preventive-genomics|clinical-genomics|discovery/i.test(window.location.pathname);
const pathPrefix = isInSubfolder ? '../' : '';

// Local Dev router to rewrite pretty URLs back to static filenames for local testing
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a');
    if (a) {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
        const cleanHref = href.replace(/^\.\.\//, "").split('?')[0].split('#')[0].replace(/^\//, "").replace(/\/$/, "");
        
        const localMappings = {
          '': 'index.html',
          'about-us': 'about.html',
          'genetic-test-kits': 'shopnow.html',
          'services': 'services.html',
          'gut-microbiome-test-hyderabad': 'GutGenics.html',
          'medigenics-health-test-hyderabad': 'MediGenics.html',
          'wellgenics-dna-test-hyderabad': 'WellGenics.html',
          'fitness-dna-test-hyderabad': 'FitGenics.html',
          'next-generation-sequencing-ngs-test-hyderabad': 'Next Generation Sequencing (NGS).html',
          'chromosomal-microarray-test-hyderabad': 'Chromosomal Microarray Analysis (CMA).html',
          'non-invasive-prenatal-testing-hyderabad': 'Noninvasive Prenatal Screening (NIPS).html',
          'sanger-sequencing-services-hyderabad': 'Sanger Sequencing.html',
          'blog': 'blog.html',
          'careers': 'careers.html',
          'contact-us': 'contact-us.html',
          'product-combo': 'product-combo.html',
          'product-gutgenics': 'product-gutgenics.html',
          'product-wellgenics': 'product-wellgenics.html',
          'product-fitgenics': 'product-fitgenics.html',
          'product-medigenics': 'product-medigenics.html',
          'product-page': 'product-page.html'
        };

        const resultFile = localMappings[cleanHref];
        if (resultFile) {
          e.preventDefault();
          const queryHash = href.substring(href.indexOf('?') !== -1 ? href.indexOf('?') : (href.indexOf('#') !== -1 ? href.indexOf('#') : href.length));
          window.location.href = pathPrefix + resultFile + queryHash;
        }
      }
    }
  });
}

function resolveNavbarUrl(href) {
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return href;
  }
  
  const cleanHref = decodeURIComponent(href.split('?')[0].split('#')[0]);
  
  let targetSubfolder = '';
  if (PREVENTIVE_FILES.includes(cleanHref)) {
    targetSubfolder = 'preventive-genomics/';
  } else if (CLINICAL_FILES.includes(cleanHref)) {
    targetSubfolder = 'clinical-genomics/';
  } else if (DISCOVERY_FILES.includes(cleanHref)) {
    targetSubfolder = 'discovery/';
  }
  
  if (isInSubfolder) {
    const currentSubfolder = window.location.pathname.includes('preventive-genomics') ? 'preventive-genomics/' :
                             window.location.pathname.includes('clinical-genomics') ? 'clinical-genomics/' : 'discovery/';
    
    if (targetSubfolder === '') {
      return '../' + href;
    } else if (targetSubfolder === currentSubfolder) {
      return href;
    } else {
      return '../' + targetSubfolder + href;
    }
  } else {
    if (targetSubfolder === '') {
      return href;
    } else {
      return targetSubfolder + href;
    }
  }
}

function resolveAssetUrl(src) {
  if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) {
    return src;
  }
  if (isInSubfolder) {
    return '../' + src;
  }
  return src;
}

async function loadComponents() {
  try {
    const ts = '1.0.0'; // Fixed version for caching instead of dynamic timestamp
    const navPlaceholder = document.getElementById('header-placeholder');
    if (navPlaceholder) {
      // Load header.txt to prevent live-server from injecting live reload script inside SVG/HTML tags
      const resp = await fetch(`${pathPrefix}components/header.txt?v=${ts}`);
      if (resp.ok) {
        let html = await resp.text();
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        doc.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href');
          if (href) {
            a.setAttribute('href', resolveNavbarUrl(href));
          }
        });
        
        doc.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src');
          if (src) {
            img.setAttribute('src', resolveAssetUrl(src));
          }
        });
        
        const contentNode = doc.body.firstElementChild;
        if (contentNode) {
          navPlaceholder.replaceWith(contentNode);
        }
      }
    }
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      // Load footer.txt to prevent live-server from injecting live reload script inside SVG/HTML tags
      const resp = await fetch(`${pathPrefix}components/footer.txt?v=${ts}`);
      if (resp.ok) {
        let html = await resp.text();
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        doc.querySelectorAll('a').forEach(a => {
          const href = a.getAttribute('href');
          if (href) {
            a.setAttribute('href', resolveNavbarUrl(href));
          }
        });
        
        doc.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src');
          if (src) {
            img.setAttribute('src', resolveAssetUrl(src));
          }
        });
        
        const contentNode = doc.body.firstElementChild;
        if (contentNode) {
          footerPlaceholder.replaceWith(contentNode);
        }
      }
    }
  } catch (e) {
    console.error('Failed to load components', e);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadComponents();

  // Initialize Lenis Smooth Scrolling
  let lenis;
  if (typeof Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1.1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Removed window.lenis exposure to prevent third-party script interference

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }

  // Parallax Scrolling Effect for Background and Elements
  const scrollHandler = (scrollY) => {
    // Background Parallax
    const bgContainer = document.querySelector(".bg-animation-container");
    if (bgContainer) {
      bgContainer.style.transform = `translateY(${scrollY * 0.3}px)`;
    }

    // Hero Parallax (Works for both standard, slider, and banner heroes)
    const heroContent = document.querySelector(".hero-content");
    const heroSlider = document.querySelector(".hero-slider");
    const bannerContent = document.querySelector(".banner-content");

    if (heroContent) {
      heroContent.style.transform = `translateY(${scrollY * 0.4}px)`;
      heroContent.style.opacity = 1 - scrollY / 800;
    }

    if (heroSlider) {
      heroSlider.style.transform = `translateY(${scrollY * 0.3}px)`;
    }

    if (bannerContent) {
      bannerContent.style.transform = `translateY(${scrollY * 0.4}px)`;
      bannerContent.style.opacity = 1 - scrollY / 1000;
    }

    // Reading Progress Bar
    const progressBar = document.querySelector(".reading-progress-bar");
    if (progressBar) {
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollY / height) * 100;
      progressBar.style.width = scrolled + "%";
    }
  };

  // Navbar Auto-Hide Scroll and 3-Second Timeout Logic (Mobile Only)
  let headerTimeout = null;

  function startHeaderTimeout() {
    if (headerTimeout) clearTimeout(headerTimeout);
    if (window.innerWidth > 768) return; // Only run on mobile
    
    headerTimeout = setTimeout(() => {
      const navbarEl = document.querySelector('.navbar');
      const mobileToggle = document.getElementById("mobile-toggle");
      const isMobileMenuActive = mobileToggle && mobileToggle.classList.contains('active');
      if (navbarEl && !isMobileMenuActive && window.scrollY < 50) {
        navbarEl.classList.add('navbar--hidden');
      }
    }, 3000);
  }

  // Start the initial 3-second auto-hide timer
  startHeaderTimeout();

  const handleNavbarScroll = (scrollY) => {
    const navbarEl = document.querySelector('.navbar');
    if (!navbarEl) return;

    // Desktop check: always show navbar and cancel timeout
    if (window.innerWidth > 768) {
      navbarEl.classList.remove('navbar--hidden');
      if (headerTimeout) {
        clearTimeout(headerTimeout);
        headerTimeout = null;
      }
      return;
    }

    const mobileToggle = document.getElementById("mobile-toggle");
    const isMobileMenuActive = mobileToggle && mobileToggle.classList.contains('active');
    
    if (isMobileMenuActive) {
      navbarEl.classList.remove('navbar--hidden');
      if (headerTimeout) clearTimeout(headerTimeout);
      return;
    }

    if (scrollY < 50) {
      // Near the top: ensure navbar is visible and restart the 3s auto-hide timer
      navbarEl.classList.remove('navbar--hidden');
      startHeaderTimeout();
    } else {
      // Scrolled down: clear the timer and ensure navbar is always visible
      if (headerTimeout) {
        clearTimeout(headerTimeout);
        headerTimeout = null;
      }
      navbarEl.classList.remove('navbar--hidden');
    }
  };

  // Add resize listener to dynamically adapt navbar state
  window.addEventListener('resize', () => {
    const navbarEl = document.querySelector('.navbar');
    if (window.innerWidth > 768) {
      if (navbarEl) {
        navbarEl.classList.remove('navbar--hidden');
      }
      if (headerTimeout) {
        clearTimeout(headerTimeout);
        headerTimeout = null;
      }
    } else {
      if (window.scrollY < 50) {
        startHeaderTimeout();
      }
    }
  });

  if (lenis) {
    lenis.on("scroll", (e) => {
      scrollHandler(e.animatedScroll);
      handleNavbarScroll(e.animatedScroll);
    });
  } else {
    window.addEventListener("scroll", () => {
      scrollHandler(window.scrollY);
      handleNavbarScroll(window.scrollY);
    });
  }

  // Hero Background Slider Logic
  const slides = document.querySelectorAll(".hero-slider .slide");
  if (slides.length > 1) {
    let currentSlide = 0;

    setInterval(() => {
      slides[currentSlide].classList.remove("active");
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add("active");
    }, 5000);
  }

  // Theme Toggle Logic (icons removed from header; keeping data-theme for CSS compatibility)
  const themeToggle = document.getElementById("theme-toggle");
  const moonIcon = document.getElementById("moon-icon");
  const sunIcon = document.getElementById("sun-icon");
  const htmlElement = document.documentElement;

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    htmlElement.setAttribute("data-theme", savedTheme);
    updateIcons(savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = htmlElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      htmlElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateIcons(newTheme);
    });
  }

  function updateIcons(theme) {
    if (moonIcon && sunIcon) {
      if (theme === "dark") {
        moonIcon.style.display = "none";
        sunIcon.style.display = "block";
      } else {
        moonIcon.style.display = "block";
        sunIcon.style.display = "none";
      }
    }
  }

  // Scroll Animation Observer (Universal Cinematic Reveal)
  const observerOptions = {
    threshold: 0.05,
    rootMargin: "0px 0px -50px 0px",
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll(".hidden-reveal");
  revealElements.forEach((el) => revealObserver.observe(el));

  // Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navCenter = document.querySelector(".nav-center");
  const dropdowns = document.querySelectorAll(".dropdown");

  // Create overlay inside navbar instead of body to fix z-index
  let menuOverlay = document.querySelector('.mobile-menu-overlay');
  const navbar = document.querySelector('.navbar');
  if (!menuOverlay) {
    menuOverlay = document.createElement('div');
    menuOverlay.className = 'mobile-menu-overlay';
    if (navbar) {
      navbar.appendChild(menuOverlay);
    } else {
      document.body.appendChild(menuOverlay);
    }
  }

  if (navCenter && !document.querySelector('.mobile-nav-header')) {
    const mobileHeader = document.createElement("div");
    mobileHeader.className = "mobile-nav-header";
    const logoSrc = resolveAssetUrl("Images/Progenics Blue TM.png");
    mobileHeader.innerHTML = `
      <div class="mobile-nav-logo">
        <img src="${logoSrc}" alt="Progenics Logo" title="Progenics Logo">
      </div>
      <button class="mobile-close-btn" aria-label="Close menu">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    const oldLogo = navCenter.querySelector('.mobile-nav-logo');
    if (oldLogo) oldLogo.remove();

    navCenter.insertBefore(mobileHeader, navCenter.firstChild);

    const closeBtn = mobileHeader.querySelector('.mobile-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener("click", closeMobileMenu);
    }
  }

  function toggleMobileMenu() {
    navCenter.classList.toggle("active");
    mobileToggle.classList.toggle("active");
    menuOverlay.classList.toggle("active");
    if (navCenter.classList.contains("active")) {
      document.body.style.overflow = "hidden";
      if (window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();
    }
  }

  function closeMobileMenu() {
    navCenter.classList.remove("active");
    mobileToggle.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
    if (window.lenis) window.lenis.start();
    dropdowns.forEach((d) => d.classList.remove("active"));
    document.querySelectorAll(".nested-dropdown").forEach(n => n.classList.remove("active"));
    startHeaderTimeout();
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", toggleMobileMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMobileMenu);
  }

  // Mobile Dropdown Toggle
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector(".link");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          dropdown.classList.toggle("active");
        }
      });
    }
  });

  // Nested Dropdown Toggle for Mobile
  const nestedDropdowns = document.querySelectorAll(".nested-dropdown");
  nestedDropdowns.forEach((nested) => {
    const trigger = nested.querySelector(".nested-dropdown-trigger");
    if (trigger) {
      trigger.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          e.stopPropagation();
          nested.classList.toggle("active");
        }
      });
    }
  });

  // Close menu when clicking regular links
  const navLinks = document.querySelectorAll(
    ".nav-center a:not(.dropdown > .link)",
  );
  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  // Mark active link
  const allLinks = document.querySelectorAll(".link");
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const currentSlug = pathParts.pop() || "index.html";
  const cleanCurrentFilename = decodeURIComponent(currentSlug.split('?')[0].split('#')[0]);

  // Helper to normalize pathnames/filenames to canonical keys for safe matching
  function getCanonicalKey(name) {
    if (!name) return "";
    const base = name.replace(/\.html$/, "").toLowerCase().trim();
    const mappings = {
      'index': 'home',
      '': 'home',
      'about': 'about-us',
      'about-us': 'about-us',
      'shopnow': 'genetic-test-kits',
      'genetic-test-kits': 'genetic-test-kits',
      'services': 'services',
      'gutgenics': 'gut-microbiome-test-hyderabad',
      'gut-microbiome-test-hyderabad': 'gut-microbiome-test-hyderabad',
      'medigenics': 'medigenics-health-test-hyderabad',
      'medigenics-health-test-hyderabad': 'medigenics-health-test-hyderabad',
      'wellgenics': 'wellgenics-dna-test-hyderabad',
      'wellgenics-dna-test-hyderabad': 'wellgenics-dna-test-hyderabad',
      'fitgenics': 'fitness-dna-test-hyderabad',
      'fitness-dna-test-hyderabad': 'fitness-dna-test-hyderabad',
      'next generation sequencing (ngs)': 'next-generation-sequencing-ngs-test-hyderabad',
      'next-generation-sequencing-ngs-test-hyderabad': 'next-generation-sequencing-ngs-test-hyderabad',
      'chromosomal microarray analysis (cma)': 'chromosomal-microarray-test-hyderabad',
      'chromosomal-microarray-test-hyderabad': 'chromosomal-microarray-test-hyderabad',
      'noninvasive prenatal screening (nips)': 'non-invasive-prenatal-testing-hyderabad',
      'non-invasive-prenatal-testing-hyderabad': 'non-invasive-prenatal-testing-hyderabad',
      'sanger sequencing': 'sanger-sequencing-services-hyderabad',
      'sanger-sequencing-services-hyderabad': 'sanger-sequencing-services-hyderabad',
      'blog': 'blog',
      'careers': 'careers',
      'contact-us': 'contact-us'
    };
    return mappings[base] || base;
  }

  const currentKey = getCanonicalKey(cleanCurrentFilename);

  // List of service sub-pages to associate with the Services tile
  const serviceKeys = [
    "next-generation-sequencing-ngs-test-hyderabad",
    "chromosomal-microarray-test-hyderabad",
    "microbial-innovation-and-discovery",
    "non-invasive-prenatal-testing-hyderabad",
    "sanger-sequencing-services-hyderabad",
    "gut-microbiome-test-hyderabad",
    "medigenics-health-test-hyderabad",
    "wellgenics-dna-test-hyderabad",
    "fitness-dna-test-hyderabad"
  ];

  // List of product sub-pages to associate with the Shop Now tile
  const productKeys = [
    "product-gutgenics",
    "product-wellgenics",
    "product-medigenics",
    "product-fitgenics",
    "product-combo",
    "product-page"
  ];

  // List of blog post sub-pages to associate with the Blog tile
  const blogPostKeys = [
    "arthritis-early-detection",
    "brca-testing-womens-health",
    "consanguineous-marriage",
    "genetic-counselor-superhero",
    "genetic-testing-pregnancy",
    "gut-feelings-mental-health",
    "microproteins-cancer",
    "wes-vs-cma"
  ];

  allLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (!linkPath) return;

    // Clean query, hashes, and any relative path prefix
    const linkParts = linkPath.split('?')[0].split('#')[0].split('/').filter(Boolean);
    const cleanLinkFilename = decodeURIComponent(linkParts.pop() || "");
    const linkKey = getCanonicalKey(cleanLinkFilename);

    // Match exact key
    if (linkKey && linkKey === currentKey) {
      link.classList.add("active");
    }

    // Associate sub-pages with main Services link
    if (serviceKeys.includes(currentKey) && linkKey === "services") {
      link.classList.add("active");
    }

    // Associate product pages with main Shop Now link
    if (productKeys.includes(currentKey) && linkKey === "genetic-test-kits") {
      link.classList.add("active");
    }

    // Associate blog post pages with main Blog link
    if (
      (blogPostKeys.includes(currentKey) ||
       currentKey === "blog-post" ||
       window.location.pathname.includes("/blog/")) &&
      linkKey === "blog"
    ) {
      link.classList.add("active");
    }
  });

  // Handle Contact Us pill active state
  if (currentKey === "contact-us") {
    const contactPill = document.querySelector(".nav-pill");
    if (contactPill) {
      contactPill.classList.add("active");
    }
  }

  // Handle active sub-item inside dropdown menus
  const dropdownLinks = document.querySelectorAll(".dropdown-content a, .nested-dropdown-content a");
  dropdownLinks.forEach((subLink) => {
    const subHref = subLink.getAttribute("href");
    if (!subHref) return;
    const cleanSubFilename = decodeURIComponent(subHref.split('?')[0].split('#')[0].split('/').pop());
    const subKey = getCanonicalKey(cleanSubFilename);
    if (subKey === currentKey) {
      subLink.classList.add("active");
    }
  });

  // For static blog pages, update the address bar to show `/blog/filename.html`
  if (blogPostPages.includes(cleanCurrentFilename) && !window.location.pathname.includes('/blog/')) {
    const newUrl = window.location.pathname.replace(cleanCurrentFilename, '') + `blog/${cleanCurrentFilename}`;
    window.history.replaceState(null, '', newUrl);

    // Add base tag since the base path has changed to /blog/
    if (!document.querySelector('base')) {
      const blogIndex = newUrl.indexOf('/blog/');
      const physicalFolder = newUrl.substring(0, blogIndex);
      const baseHref = window.location.origin + physicalFolder + '/';
      const base = document.createElement('base');
      base.href = baseHref;
      document.head.prepend(base);
    }
  }
});

// ==========================================================================
// Shopify Integration & Product Modal Functions
// ==========================================================================

let shopifyProducts = [];

async function fetchShopifyProducts() {
  try {
    const res = await fetch(`https://c5452d-aa.myshopify.com/api/2023-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': '816c8a8824925c2c2bc46059fd0025e2',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `{
          products(first: 50) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }`
      })
    });
    const data = await res.json();
    if (data && data.data && data.data.products) {
      shopifyProducts = data.data.products.edges.map(e => e.node);
    }
  } catch (err) {
    console.error("Shopify product fetch failed:", err);
  }
}

// Start fetching Shopify catalog immediately
fetchShopifyProducts();

const SHOPIFY_PRODUCT_IDS = {
  "gutgenics": "9446834995507",
  "wellgenics": "9446805078323",
  "fitgenics": "9446811828531",
  "medigenics": "9446799737139",
  "combo": "9499539013939"
};

function getShopifyOptions() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const titleColor = isDark ? "#f5f5f7" : "#4c4c4c";
  const priceColor = isDark ? "#ff6b6b" : "#ea5b5b";
  const compareAtColor = isDark ? "#ff8e8e" : "#ea5b5b";
  const productPriceColor = isDark ? "#ff6b6b" : "#f54a4a";

  return {
    "product": {
      "styles": {
        "product": {
          "@media (min-width: 601px)": {
            "max-width": "100%",
            "margin-left": "0",
            "margin-bottom": "50px"
          },
          "text-align": "left"
        },
        "title": {
          "font-family": "Roboto, sans-serif",
          "font-weight": "normal",
          "font-size": "26px",
          "color": isDark ? "#f5f5f7" : "#121212"
        },
        "button": {
          "font-family": "Roboto, sans-serif",
          ":hover": {
            "background-color": "#6ea451"
          },
          "background-color": "#7ab65a",
          ":focus": {
            "background-color": "#6ea451"
          },
          "border-radius": "21px"
        },
        "price": {
          "font-family": "Roboto, sans-serif",
          "font-size": "18px",
          "color": productPriceColor
        },
        "compareAt": {
          "font-family": "Roboto, sans-serif",
          "font-size": "15.299999999999999px",
          "color": productPriceColor
        },
        "unitPrice": {
          "font-family": "Roboto, sans-serif",
          "font-size": "15.299999999999999px",
          "color": productPriceColor
        }
      },
      "layout": "horizontal",
      "buttonDestination": "modal",
      "contents": {
        "img": false,
        "imgWithCarousel": true,
        "description": true
      },
      "width": "100%",
      "text": {
        "button": "Add to cart"
      },
      "googleFonts": [
        "Roboto"
      ]
    },
    "productSet": {
      "styles": {
        "products": {
          "@media (min-width: 601px)": {
            "margin-left": "-20px"
          }
        }
      }
    },
    "modalProduct": {
      "contents": {
        "img": false,
        "imgWithCarousel": true,
        "button": false,
        "buttonWithQuantity": true
      },
      "styles": {
        "product": {
          "@media (min-width: 601px)": {
            "max-width": "100%",
            "margin-left": "0px",
            "margin-bottom": "0px"
          }
        },
        "button": {
          "font-family": "Roboto, sans-serif",
          ":hover": {
            "background-color": "#6ea451"
          },
          "background-color": "#7ab65a",
          ":focus": {
            "background-color": "#6ea451"
          },
          "border-radius": "21px"
        },
        "title": {
          "font-family": "Roboto, sans-serif",
          "font-weight": "normal",
          "font-size": "26px",
          "color": titleColor
        },
        "price": {
          "font-family": "Helvetica Neue, sans-serif",
          "font-weight": "normal",
          "font-size": "18px",
          "color": priceColor
        },
        "compareAt": {
          "font-family": "Helvetica Neue, sans-serif",
          "font-weight": "normal",
          "font-size": "15.299999999999999px",
          "color": compareAtColor
        },
        "unitPrice": {
          "font-family": "Helvetica Neue, sans-serif",
          "font-weight": "normal",
          "font-size": "15.299999999999999px",
          "color": compareAtColor
        }
      },
      "googleFonts": [
        "Roboto"
      ],
      "text": {
        "button": "Add to cart"
      }
    },
    "option": {
      "styles": {
        "label": {
          "font-family": "Roboto, sans-serif",
          "color": isDark ? "#f5f5f7" : "#121212"
        },
        "select": {
          "font-family": "Roboto, sans-serif"
        }
      },
      "googleFonts": [
        "Roboto"
      ]
    },
    "cart": {
      "styles": {
        "button": {
          "font-family": "Roboto, sans-serif",
          ":hover": {
            "background-color": "#6ea451"
          },
          "background-color": "#7ab65a",
          ":focus": {
            "background-color": "#6ea451"
          },
          "border-radius": "21px"
        }
      },
      "text": {
        "total": "Subtotal",
        "button": "Checkout"
      },
      "googleFonts": [
        "Roboto"
      ]
    },
    "toggle": {
      "styles": {
        "toggle": {
          "font-family": "Roboto, sans-serif",
          "background-color": "#7ab65a",
          ":hover": {
            "background-color": "#6ea451"
          },
          ":focus": {
            "background-color": "#6ea451"
          }
        }
      },
      "googleFonts": [
        "Roboto"
      ]
    }
  };
}

function loadShopifyWidgetForModal(modalId) {
  const mapping = {
    "productModal": "gutgenics",
    "wellGenicsModal": "wellgenics",
    "fitGenicsModal": "fitgenics",
    "medigenicsModal": "medigenics",
    "comboModal": "combo"
  };
  
  const keyword = mapping[modalId] || "wellgenics";
  
  // Try static mapping first (extremely robust and instant)
  let productId = SHOPIFY_PRODUCT_IDS[keyword];
  
  // Fallback to dynamic check if not in static mapping
  if (!productId) {
    const match = shopifyProducts.find(p => p.title.toLowerCase().includes(keyword) || p.handle.toLowerCase().includes(keyword));
    productId = match ? match.id.split("/").pop() : "9446834995507"; // default fallback ID
  }
  
  const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
  if (window.ShopifyBuy && window.ShopifyBuy.UI) {
    renderShopify(productId);
  } else {
    let script = document.querySelector(`script[src="${scriptURL}"]`);
    if (!script) {
      script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      script.onload = () => renderShopify(productId);
    } else {
      // Script is already in the DOM, let's wait for UI to be ready
      const checkInterval = setInterval(() => {
        if (window.ShopifyBuy && window.ShopifyBuy.UI) {
          clearInterval(checkInterval);
          renderShopify(productId);
        }
      }, 50);
    }
  }
  
  function renderShopify(id) {
    const client = ShopifyBuy.buildClient({
      domain: 'c5452d-aa.myshopify.com',
      storefrontAccessToken: '816c8a8824925c2c2bc46059fd0025e2',
    });
    ShopifyBuy.UI.onReady(client).then(function (ui) {
      ui.createComponent('product', {
        id: id,
        node: document.getElementById('product-component-1782301115742'),
        moneyFormat: 'Rs.%20%7B%7Bamount%7D%7D',
        options: getShopifyOptions()
      });
    });
  }
}

function openShopModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Clean up any existing Shopify containers first
  const existingWidget = document.getElementById("product-component-1782301115742");
  if (existingWidget) {
    existingWidget.remove();
  }

  // Set up the Shopify container inside modal body
  const modalBody = modal.querySelector(".product-modal-body");
  if (modalBody) {
    const originalContainer = modalBody.querySelector(".product-purchase-container");
    if (originalContainer) {
      originalContainer.style.display = "none";
    }

    const shopifyContainer = document.createElement("div");
    shopifyContainer.id = "product-component-1782301115742";
    shopifyContainer.style.width = "100%";
    shopifyContainer.style.maxWidth = "600px";
    shopifyContainer.style.margin = "0 auto";
    modalBody.appendChild(shopifyContainer);
  }

  modal.classList.add("active");
  if (window.lenis) {
    window.lenis.stop();
  } else {
    document.body.style.overflow = "hidden";
  }

  // Load and render Shopify widget for this modal
  loadShopifyWidgetForModal(modalId);
}

function closeShopModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("active");

  // Clean up Shopify Buy Button
  const shopifyContainer = modal.querySelector("#product-component-1782301115742");
  if (shopifyContainer) {
    shopifyContainer.remove();
  }
  const originalContainer = modal.querySelector(".product-purchase-container");
  if (originalContainer) {
    originalContainer.style.display = "";
  }

  if (window.lenis) {
    window.lenis.start();
  } else {
    document.body.style.overflow = "";
  }
}

function closeActiveModals() {
  const activeModals = document.querySelectorAll(".product-modal-overlay.active");
  activeModals.forEach(modal => {
    modal.classList.remove("active");

    // Clean up Shopify Buy Button
    const shopifyContainer = modal.querySelector("#product-component-1782301115742");
    if (shopifyContainer) {
      shopifyContainer.remove();
    }
    const originalContainer = modal.querySelector(".product-purchase-container");
    if (originalContainer) {
      originalContainer.style.display = "";
    }
  });

  if (window.lenis) {
    window.lenis.start();
  } else {
    document.body.style.overflow = "";
  }
}

// Backward compatibility
function openProductModal(name, price, oldPrice) {
  openShopModal("productModal");
}

function closeProductModal() {
  closeActiveModals();
}

// Close modal when clicking outside
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("product-modal-overlay")) {
    closeActiveModals();
  }
});

// FAQ Accordion Functionality
document.addEventListener('click', (e) => {
  const question = e.target.closest('.faq-question');
  if (!question) return;

  const item = question.closest('.faq-item');
  if (!item) return;

  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    const q = i.querySelector('.faq-question');
    if (q) q.setAttribute('aria-expanded', 'false');
  });

  // Open clicked
  if (!isOpen) {
    item.classList.add('open');
    question.setAttribute('aria-expanded', 'true');
  }
});

// Keydown listener for accessibility (Enter and Space keys)
document.addEventListener('keydown', (e) => {
  const question = e.target.closest('.faq-question');
  if (!question) return;

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    question.click();
  }
});


// Custom Cursor Logic
document.addEventListener('DOMContentLoaded', () => {
  const cursorDot = document.querySelector('[data-cursor-dot]');
  const cursorOutline = document.querySelector('[data-cursor-outline]');

  // Only run on non-touch devices
  if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;

      // Fast trailing outline
      cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 150, fill: "forwards" });
    });

    // Add hover effects to clickable elements using delegation for dynamically added elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, .card, .faq-question, .progenics-bento-card, .know-more, .nav-pill')) {
        cursorDot.classList.add('hover');
        cursorOutline.classList.add('hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('a, button, input, .card, .faq-question, .progenics-bento-card, .know-more, .nav-pill')) {
        cursorDot.classList.remove('hover');
        cursorOutline.classList.remove('hover');
      }
    });
  }
});

// Statistics Counter Animation (handles multiple sections per page)
document.addEventListener("DOMContentLoaded", () => {
  const statsSections = document.querySelectorAll('.stats-section');

  statsSections.forEach(section => {
    const statNumbers = section.querySelectorAll('.stat-number');
    if (statNumbers.length === 0) return;

    let animated = false;

    const animateStats = () => {
      if (animated) return;
      animated = true;

      statNumbers.forEach(stat => {
        const text = stat.textContent.trim();
        const numberMatch = text.match(/[\d,.]+/);
        if (!numberMatch) return;

        const rawNumberStr = numberMatch[0];
        const suffix = text.replace(rawNumberStr, '');
        const hasComma = rawNumberStr.includes(',');
        const isFloat = rawNumberStr.includes('.') && !hasComma;
        const targetVal = parseFloat(rawNumberStr.replace(/,/g, ''));
        
        let startVal = 0;
        const duration = 2000;
        const startTime = performance.now();

        const updateNumber = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progress = Math.min(elapsedTime / duration, 1);
          
          const easeProgress = progress * (2 - progress);
          const currentVal = startVal + (targetVal - startVal) * easeProgress;

          let formattedVal;
          if (isFloat) {
            formattedVal = currentVal.toFixed(1);
          } else {
            formattedVal = Math.floor(currentVal);
            if (hasComma) {
              formattedVal = formattedVal.toLocaleString('en-US');
            }
          }

          stat.textContent = formattedVal + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateNumber);
          } else {
            stat.textContent = text;
          }
        };

        requestAnimationFrame(updateNumber);
      });
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    statsObserver.observe(section);
  });
});

// Testimonials Carousel Animation (Homepage)
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.getElementById('home-testi-carousel');
  const prev = document.getElementById('home-testi-prev');
  const next = document.getElementById('home-testi-next');
  if (!carousel) return;

  let timer;

  function scroll(dir) {
    const card = carousel.querySelector('.testimonial-card');
    if (!card) return;
    const w = card.offsetWidth + 24;
    carousel.scrollBy({ left: dir * w, behavior: 'smooth' });
  }

  function loopScroll() {
    const max = carousel.scrollWidth - carousel.clientWidth;
    if (carousel.scrollLeft >= max - 10) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scroll(1);
    }
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(loopScroll, 4500);
  }

  function stop() {
    clearInterval(timer);
  }

  if (prev) prev.addEventListener('click', () => { scroll(-1); stop(); start(); });
  if (next) next.addEventListener('click', () => { scroll(1); stop(); start(); });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('touchstart', stop, { passive: true });
  carousel.addEventListener('touchend', start);

  start();
});

// Preventive Genomics Hero Stats Counter Animation
document.addEventListener("DOMContentLoaded", () => {
  const ggHeroStats = document.querySelector('.gg-hero-stats');
  if (!ggHeroStats) return;

  const statNums = ggHeroStats.querySelectorAll('.gg-stat-num');
  if (statNums.length === 0) return;

  // Track state and targets for each stat item
  const statsData = [];

  statNums.forEach(stat => {
    const firstChild = stat.firstChild;
    if (!firstChild || firstChild.nodeType !== Node.TEXT_NODE) return;

    const originalText = firstChild.textContent.trim();
    const spanEl = stat.querySelector('span');

    let targetVal = 0;
    let isDecimal = false;
    let decimalPlaces = 0;
    let textNodeSuffix = "";
    let spanSuffix = "";
    let isHyphenated = false;
    let hyphenSuffix = "";

    // 1. Check if there is a span
    if (spanEl) {
      const spanText = spanEl.textContent.trim();
      const decimalMatch = spanText.match(/^\.(\d+)(.*)/);
      
      if (decimalMatch) {
        // e.g. .8%
        targetVal = parseFloat(originalText + "." + decimalMatch[1]);
        isDecimal = true;
        decimalPlaces = decimalMatch[1].length;
        spanSuffix = decimalMatch[2]; // e.g. %
      } else {
        // e.g. span is "K+" or "+"
        targetVal = parseFloat(originalText);
        spanSuffix = spanText;
      }
    } else {
      // No span, e.g. "10" or "10-12"
      if (originalText.includes('-')) {
        const parts = originalText.split('-');
        targetVal = parseFloat(parts[0].trim());
        isHyphenated = true;
        hyphenSuffix = '-' + parts[1].trim();
      } else {
        targetVal = parseFloat(originalText);
      }
    }

    if (isNaN(targetVal)) return;

    // Save info
    statsData.push({
      stat,
      firstChild,
      spanEl,
      originalText,
      originalSpanText: spanEl ? spanEl.textContent : null,
      targetVal,
      isDecimal,
      decimalPlaces,
      textNodeSuffix,
      spanSuffix,
      isHyphenated,
      hyphenSuffix
    });

    // Initialize display values to 0 / start state
    if (isDecimal) {
      firstChild.textContent = "0";
      spanEl.textContent = ".0" + spanSuffix;
    } else if (isHyphenated) {
      firstChild.textContent = "0" + hyphenSuffix;
    } else {
      firstChild.textContent = "0";
      if (spanEl) {
        spanEl.textContent = spanSuffix;
      }
    }
  });

  let animated = false;

  const animateGGStats = () => {
    if (animated) return;
    animated = true;

    const duration = 2000;
    const startTime = performance.now();

    const updateNumber = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Quadratic out easing
      const easeProgress = progress * (2 - progress);

      statsData.forEach(item => {
        const currentVal = item.targetVal * easeProgress;

        if (item.isDecimal) {
          const formattedVal = currentVal.toFixed(item.decimalPlaces);
          const parts = formattedVal.split('.');
          item.firstChild.textContent = parts[0];
          item.spanEl.textContent = "." + parts[1] + item.spanSuffix;
        } else if (item.isHyphenated) {
          item.firstChild.textContent = Math.floor(currentVal) + item.hyphenSuffix;
        } else {
          item.firstChild.textContent = Math.floor(currentVal);
          if (item.spanEl) {
            item.spanEl.textContent = item.spanSuffix;
          }
        }
      });

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        // Animation complete, restore original values exactly
        statsData.forEach(item => {
          item.firstChild.textContent = item.originalText;
          if (item.spanEl) {
            item.spanEl.textContent = item.originalSpanText;
          }
        });
      }
    };

    requestAnimationFrame(updateNumber);
  };

  const ggStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateGGStats();
        ggStatsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  ggStatsObserver.observe(ggHeroStats);
});

// Reels mute/unmute control logic
document.addEventListener("DOMContentLoaded", () => {
  const muteButtons = document.querySelectorAll(".reel-mute-btn");
  muteButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent card-level interactions
      const card = btn.closest(".reel-card");
      if (!card) return;
      const video = card.querySelector("video");
      if (!video) return;

      const isMuted = video.muted;
      if (isMuted) {
        // Mute all other videos first to prevent overlapping audio
        document.querySelectorAll(".reel-card video").forEach(v => {
          v.muted = true;
          const otherBtn = v.closest(".reel-card").querySelector(".reel-mute-btn");
          if (otherBtn) {
            otherBtn.classList.remove("unmuted");
          }
        });

        // Unmute the clicked video
        video.muted = false;
        btn.classList.add("unmuted");
      } else {
        // Mute the clicked video
        video.muted = true;
        btn.classList.remove("unmuted");
      }
    });
  });
});

// ==========================================================================
// Dynamic Shopping Cart System
// ==========================================================================

function parsePriceText(priceText) {
  if (typeof priceText === "number") return priceText;
  if (!priceText) return 13000;
  const cleanText = priceText.replace(/\.\d{2}\s*$/, "");
  const num = parseInt(cleanText.replace(/[^\d]/g, "")) || 0;
  return num;
}

let cart = [];

function addToCart(name, price, qty, variant) {
  const item = {
    name: name,
    price: price,
    qty: parseInt(qty) || 1,
    variant: variant || "Standard"
  };
  cart = [item]; // Keep only the latest added item for this checkout flow
  closeActiveModals();
  showCartModal();
}

function showCartModal() {
  let cartModal = document.getElementById("cartModal");
  if (!cartModal) {
    cartModal = document.createElement("div");
    cartModal.id = "cartModal";
    cartModal.className = "product-modal-overlay";
    cartModal.setAttribute("data-lenis-prevent", "");
    document.body.appendChild(cartModal);
  }
  
  const item = cart[0] || { name: "GutGenics", price: 13000, qty: 1, variant: "Standard" };
  const formattedPrice = typeof item.price === "number" ? `Rs. ${item.price.toLocaleString()}.00` : item.price;
  const numPrice = parsePriceText(item.price) || 13000;
  const subtotal = numPrice * item.qty;
  const formattedSubtotal = `Rs. ${subtotal.toLocaleString()}.00`;
  
  const isNested = window.location.pathname.includes("preventive-genomics") || window.location.pathname.includes("clinical-genomics");
  const imgPrefix = isNested ? "../" : "";
  
  cartModal.innerHTML = `
    <div class="product-modal-content" data-lenis-prevent style="
              max-width: 600px;
              width: 95%;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              background: var(--bg-secondary);
              border: 1px solid rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(20px);
              padding: 2.5rem;
              border-radius: 40px;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            ">
      <button class="close-modal-btn" onclick="closeCartModal()"></button>
      <div class="cart-modal-header" style="text-align: center; margin-bottom: 2rem;">
        <h2 class="serif-italic" style="color: var(--text-primary); font-size: 2.2rem; margin-bottom: 0.5rem;">Your Cart</h2>
        <div style="width: 60px; height: 3px; background: var(--accent-blue); margin: 0 auto; border-radius: 2px;"></div>
      </div>
      <div class="product-modal-body" data-lenis-prevent style="overflow-y: auto; flex: 1; min-height: 0; padding-right: 5px;">
        <div class="cart-item-row" style="
                  display: flex;
                  align-items: center;
                  gap: 1.5rem;
                  padding: 1.5rem;
                  background: rgba(0, 0, 0, 0.03);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  border-radius: 20px;
                  margin-bottom: 2rem;
                ">
          <img src="${imgPrefix}Images/${item.name.toLowerCase()} Kit.png" onerror="this.src='${imgPrefix}Images/Gutgenics Kit.png'" style="width: 80px; height: 80px; object-fit: contain; background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 5px;" alt="${item.name}">
          <div style="flex-grow: 1;">
            <h3 style="color: var(--text-primary); font-size: 1.2rem; margin-bottom: 0.2rem; font-weight: 700;">${item.name}</h3>
            <p style="color: var(--accent-blue); font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600;">Variant: ${item.variant}</p>
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="color: var(--text-primary); font-weight: 700; font-size: 1.1rem;">${formattedPrice}</span>
              <span style="color: var(--text-secondary); font-size: 0.9rem;">x ${item.qty}</span>
            </div>
          </div>
        </div>
        
        <div class="cart-summary-block" style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 1.5rem; margin-bottom: 2rem;">
          <div class="cart-summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
            <span style="color: var(--text-secondary); font-size: 1rem;">Subtotal</span>
            <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${formattedSubtotal}</span>
          </div>
          <div class="cart-summary-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <span style="color: var(--text-secondary); font-size: 1rem;">Shipping</span>
            <span style="color: var(--accent-blue); font-weight: 600; font-size: 1rem;">FREE</span>
          </div>
          <div class="cart-summary-row total-row" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 1.2rem;">
            <span style="color: var(--text-primary); font-weight: 700; font-size: 1.3rem;">Total</span>
            <span style="color: var(--text-primary); font-weight: 800; font-size: 1.5rem;">${formattedSubtotal}</span>
          </div>
        </div>
      </div>
      
      <div class="cart-buttons-container" style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
        <button class="view-product-btn" onclick="alert('Proceeding to checkout secure payment gateway...') ; closeCartModal()" style="
                  width: 100%;
                  padding: 16px;
                  border: none;
                  border-radius: 30px;
                  font-weight: 600;
                  font-size: 1.1rem;
                  cursor: pointer;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  text-align: center;
                ">
          Proceed to Checkout
        </button>
        <button onclick="closeCartModal()" style="
                  background: transparent;
                  color: var(--text-secondary);
                  border: 1px solid var(--card-border);
                  padding: 14px;
                  border-radius: 30px;
                  font-weight: 600;
                  font-size: 1rem;
                  cursor: pointer;
                  transition: all 0.3s;
                " onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
          Continue Shopping
        </button>
      </div>
    </div>
  `;
  
  cartModal.classList.add("active");
  if (window.lenis) {
    window.lenis.stop();
  } else {
    document.body.style.overflow = "hidden";
  }
}

function closeCartModal() {
  const cartModal = document.getElementById("cartModal");
  if (cartModal) {
    cartModal.classList.remove("active");
  }
  if (window.lenis) {
    window.lenis.start();
  } else {
    document.body.style.overflow = "";
  }
}

// Bind "Add to Cart" and Variant price updates dynamically
document.addEventListener("DOMContentLoaded", () => {
  const handleVariantChange = (selectEl) => {
    const detailsContainer = selectEl.closest(".product-details");
    if (!detailsContainer) return;
    
    const titleEl = detailsContainer.querySelector("h2");
    const name = titleEl ? titleEl.textContent.trim() : "";
    
    if (name.toLowerCase() === "gutgenics") {
      const variant = selectEl.value;
      let salePrice = "Rs. 13,000.00";
      let originalPrice = "Rs. 18,000.00";
      
      if (variant === "Prime") {
        salePrice = "Rs. 15,000.00";
        originalPrice = "Rs. 20,000.00";
      } else if (variant === "Elite") {
        salePrice = "Rs. 20,000.00";
        originalPrice = "Rs. 22,000.00";
      }
      
      // Update display prices (first span is sale price, second is original crossed out price)
      if (titleEl) {
        const priceDiv = titleEl.nextElementSibling;
        if (priceDiv) {
          const spans = priceDiv.querySelectorAll("span");
          if (spans.length >= 2) {
            spans[0].textContent = salePrice;
            spans[1].textContent = originalPrice;
          }
        }
      }
    }
  };

  const bindListeners = () => {
    // 1. Add to Cart Listeners
    const addToCartBtns = document.querySelectorAll(".product-details button");
    addToCartBtns.forEach(btn => {
      if (btn.getAttribute("data-cart-bound")) return;
      btn.setAttribute("data-cart-bound", "true");
      
      btn.addEventListener("click", () => {
        const detailsContainer = btn.closest(".product-details");
        if (!detailsContainer) return;
        
        const titleEl = detailsContainer.querySelector("h2");
        const name = titleEl ? titleEl.textContent.trim() : "Diagnostic Kit";
        
        const selectEl = detailsContainer.querySelector("select");
        const variant = selectEl ? selectEl.value : "Standard";
        
        const qtyEl = detailsContainer.querySelector("input[type='number']");
        const qty = qtyEl ? parseInt(qtyEl.value) || 1 : 1;
        
        // Robust sale price parsing: find spans with Rs. or ₹ and no line-through text decoration
        let priceText = "";
        const spans = detailsContainer.querySelectorAll("span");
        for (const span of spans) {
          const text = span.textContent.trim();
          const hasPriceIndicator = text.includes("Rs.") || text.includes("₹") || text.includes("Rs") || text.includes("INR");
          const hasLineThrough = span.style.textDecoration.includes("line-through") || 
                                 span.getAttribute("style")?.includes("line-through");
          if (hasPriceIndicator && !hasLineThrough) {
            priceText = text;
            break;
          }
        }
        
        // Fallback defaults in case DOM query is empty or failed
        if (!priceText) {
          const lowerName = name.toLowerCase();
          if (lowerName.includes("gutgenics")) {
            priceText = "Rs. 13,000.00";
          } else if (lowerName.includes("combo")) {
            priceText = "Rs. 22,000.00";
          } else {
            priceText = "Rs. 15,000.00"; // WellGenics, FitGenics, MediGenics default
          }
        }
        
        const priceNum = parsePriceText(priceText) || 13000;
        
        addToCart(name, priceNum, qty, variant);
      });
    });

    // 2. Select Dropdown Listeners
    const selectDropdowns = document.querySelectorAll(".product-details select");
    selectDropdowns.forEach(select => {
      if (select.getAttribute("data-change-bound")) return;
      select.setAttribute("data-change-bound", "true");
      select.addEventListener("change", () => handleVariantChange(select));
    });
  };
  
  bindListeners();
  
  // Re-bind when a modal is opened
  const originalOpenShopModal = window.openShopModal;
  window.openShopModal = function(modalId) {
    if (typeof originalOpenShopModal === "function") {
      originalOpenShopModal(modalId);
    }
    bindListeners();
  };

  // Blog FAQ Accordion Toggle
  document.addEventListener('click', function(e) {
    const trigger = e.target.closest('.faq-question');
    if (trigger) {
      const item = trigger.closest('.faq-item');
      if (item) {
        item.classList.toggle('active');
        const answer = item.querySelector('.faq-answer');
        if (item.classList.contains('active')) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = '0';
        }
      }
    }
  });
});




