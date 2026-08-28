/**
 * VANTA DETAILING - Master Vanilla JavaScript Engine
 * Handles Navigation, Before/After Slider, Counters, Form Validation, Modals, Gallery Filters, & Estimator
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollEffects();
  initNavbar();
  initBeforeAfterSlider();
  initStatsCounters();
  initGalleryFilter();
  initBookingForm();
  initEstimatorWidget();
  initCoverageChecker();
  initPreselectionFromParams();
});

/* 1. Scroll Progress & Sticky Navbar */
function initScrollEffects() {
  const progressBar = document.getElementById('scroll-progress');
  const navbar = document.querySelector('.navbar-vanta');

  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    
    if (progressBar) {
      progressBar.style.width = scrolled + '%';
    }

    if (navbar) {
      if (winScroll > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });
}

/* 2. Navbar active state & mobile close on click */
function initNavbar() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link-vanta');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html') || (href === './' && currentPath === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile menu close on click
  const navCollapse = document.querySelector('.navbar-collapse');
  if (navCollapse) {
    const navItems = navCollapse.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 992) {
          const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
          if (bsCollapse) {
            bsCollapse.hide();
          }
        }
      });
    });
  }
}

/* 3. Interactive Before / After Image Comparison Slider */
function initBeforeAfterSlider() {
  const container = document.getElementById('beforeAfterSlider');
  if (!container) return;

  const beforeWrap = container.querySelector('.before-img-wrap');
  const handle = container.querySelector('.ba-slider-handle');
  const beforeImg = beforeWrap ? beforeWrap.querySelector('img') : null;

  if (!beforeWrap || !handle || !beforeImg) return;

  let isDragging = false;

  function updateSliderWidth() {
    const containerWidth = container.offsetWidth;
    beforeImg.style.width = containerWidth + 'px';
  }

  function setSliderPosition(x) {
    const rect = container.getBoundingClientRect();
    let posX = x - rect.left;
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;

    const percentage = (posX / rect.width) * 100;
    beforeWrap.style.width = percentage + '%';
    handle.style.left = percentage + '%';
  }

  // Initial sizing
  updateSliderWidth();
  window.addEventListener('resize', updateSliderWidth);

  // Mouse & Touch events
  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    setSliderPosition(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    setSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches && e.touches[0]) {
      setSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) {
      setSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });
}

/* 4. Animated Stats Counters */
function initStatsCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const duration = 2000;
        const startTime = performance.now();

        function animate(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentVal = easeOut * target;

          el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
          }
        }

        requestAnimationFrame(animate);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  statNumbers.forEach(stat => observer.observe(stat));
}

/* 5. Gallery Filter */
function initGalleryFilter() {
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (btn.getAttribute('data-filter') !== 'all' && item.getAttribute('data-category') !== btn.getAttribute('data-filter')) {
              item.style.display = 'none';
            }
          }, 200);
        }
      });
    });
  });
}

/* 6. Contact / Booking Form Validation & Interactive Feedback */
function initBookingForm() {
  const form = document.getElementById('vantaBookingForm');
  if (!form) return;

  // Set minimum date to today
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      return;
    }

    // Capture values
    const fullName = document.getElementById('fullName')?.value || 'Valued Client';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const vehicle = `${document.getElementById('vehicleYear')?.value || ''} ${document.getElementById('vehicleMake')?.value || ''} ${document.getElementById('vehicleModel')?.value || ''}`.trim();
    const service = document.getElementById('serviceType')?.value || 'Detailing Service';
    const date = document.getElementById('bookingDate')?.value || 'Flexible';
    const time = document.getElementById('bookingTime')?.value || 'Morning (8am - 12pm)';
    const location = document.getElementById('locationPostcode')?.value || 'Customer Location';

    // Show booking confirmation in modal
    const summaryTarget = document.getElementById('bookingSummaryDetails');
    if (summaryTarget) {
      summaryTarget.innerHTML = `
        <div class="p-3 mb-3" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
          <div class="row g-2 text-start font-monospace" style="font-size: 0.88rem;">
            <div class="col-sm-6"><strong class="text-white">Client:</strong> <span class="text-secondary">${fullName}</span></div>
            <div class="col-sm-6"><strong class="text-white">Contact:</strong> <span class="text-secondary">${email}</span></div>
            <div class="col-sm-6"><strong class="text-white">Vehicle:</strong> <span class="text-secondary">${vehicle || 'Specified at service'}</span></div>
            <div class="col-sm-6"><strong class="text-white">Package:</strong> <span style="color: var(--accent-champagne);">${service}</span></div>
            <div class="col-sm-6"><strong class="text-white">Date & Slot:</strong> <span class="text-secondary">${date} (${time})</span></div>
            <div class="col-sm-6"><strong class="text-white">Location:</strong> <span class="text-secondary">${location}</span></div>
          </div>
        </div>
      `;
    }

    const modalEl = document.getElementById('bookingConfirmationModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      form.reset();
      form.classList.remove('was-validated');
    }
  });
}

/* 7. Interactive Instant Price Estimator */
function initEstimatorWidget() {
  const estimator = document.getElementById('priceEstimatorWidget');
  if (!estimator) return;

  const vehiclePills = estimator.querySelectorAll('.vehicle-pill');
  const servicePills = estimator.querySelectorAll('.service-pill');
  const priceDisplay = document.getElementById('estimatedPrice');
  const timeDisplay = document.getElementById('estimatedTime');
  const ctaBtn = document.getElementById('estimatorBookBtn');

  const pricingData = {
    'sedan': {
      'exterior': { price: '£95 / $125', time: '1.5 - 2 Hours', slug: 'exterior-detail' },
      'interior': { price: '£120 / $155', time: '2 - 2.5 Hours', slug: 'interior-detail' },
      'full': { price: '£195 / $250', time: '3.5 - 4.5 Hours', slug: 'full-detail' },
      'ceramic': { price: '£495 / $640', time: '1 - 2 Days', slug: 'paint-protection' }
    },
    'suv': {
      'exterior': { price: '£115 / $145', time: '2 - 2.5 Hours', slug: 'exterior-detail' },
      'interior': { price: '£140 / $180', time: '2.5 - 3 Hours', slug: 'interior-detail' },
      'full': { price: '£235 / $300', time: '4 - 5 Hours', slug: 'full-detail' },
      'ceramic': { price: '£575 / $740', time: '1 - 2 Days', slug: 'paint-protection' }
    },
    'supercar': {
      'exterior': { price: '£145 / $190', time: '2.5 - 3 Hours', slug: 'exterior-detail' },
      'interior': { price: '£165 / $215', time: '2.5 - 3 Hours', slug: 'interior-detail' },
      'full': { price: '£295 / $385', time: '5 - 6 Hours', slug: 'full-detail' },
      'ceramic': { price: '£695 / $890', time: '2 Days', slug: 'paint-protection' }
    },
    'large': {
      'exterior': { price: '£135 / $175', time: '2.5 - 3 Hours', slug: 'exterior-detail' },
      'interior': { price: '£165 / $215', time: '3 - 4 Hours', slug: 'interior-detail' },
      'full': { price: '£275 / $350', time: '5 - 6 Hours', slug: 'full-detail' },
      'ceramic': { price: '£650 / $840', time: '2 Days', slug: 'paint-protection' }
    }
  };

  let selectedVehicle = 'sedan';
  let selectedService = 'full';

  function updateEstimate() {
    const data = pricingData[selectedVehicle][selectedService];
    if (priceDisplay) priceDisplay.textContent = data.price;
    if (timeDisplay) timeDisplay.textContent = data.time;
    if (ctaBtn) {
      ctaBtn.href = `contact.html?service=${data.slug}&vehicle=${selectedVehicle}`;
    }
  }

  vehiclePills.forEach(pill => {
    pill.addEventListener('click', () => {
      vehiclePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedVehicle = pill.getAttribute('data-vehicle');
      updateEstimate();
    });
  });

  servicePills.forEach(pill => {
    pill.addEventListener('click', () => {
      servicePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedService = pill.getAttribute('data-service');
      updateEstimate();
    });
  });

  updateEstimate();
}

/* 8. Service Coverage Area Checker */
function initCoverageChecker() {
  const input = document.getElementById('coverageSearchInput');
  const btn = document.getElementById('coverageSearchBtn');
  const resultDiv = document.getElementById('coverageSearchResult');

  if (!input || !btn || !resultDiv) return;

  btn.addEventListener('click', checkCoverage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkCoverage();
  });

  function checkCoverage() {
    const val = input.value.trim().toUpperCase();
    if (!val) {
      resultDiv.innerHTML = `<span class="text-warning"><i class="bi bi-exclamation-triangle me-1"></i> Please enter your postcode or town.</span>`;
      return;
    }

    resultDiv.innerHTML = `
      <div class="p-2 mt-2" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px; color: #4ade80; font-size: 0.9rem;">
        <i class="bi bi-check-circle-fill me-1"></i> <strong>Mobile Unit Available:</strong> We provide fully-equipped mobile service to <strong>${val}</strong> with zero travel surcharge!
      </div>
    `;
  }
}

/* 9. Preselect Service in Contact Form from Query Params */
function initPreselectionFromParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  const selectEl = document.getElementById('serviceType');

  if (serviceParam && selectEl) {
    const mapping = {
      'exterior-detail': 'Exterior Detail',
      'interior-detail': 'Interior Detail',
      'full-detail': 'Full Detail (Interior & Exterior)',
      'paint-protection': 'Paint Protection & Ceramic Coating',
      'maintenance': 'Maintenance Program'
    };

    if (mapping[serviceParam]) {
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].text.includes(mapping[serviceParam]) || selectEl.options[i].value === mapping[serviceParam]) {
          selectEl.selectedIndex = i;
          break;
        }
      }
    }
  }
}
