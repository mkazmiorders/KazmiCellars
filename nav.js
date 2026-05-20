(function () {
  var page = (window.location.pathname.split('/').pop() || 'index').replace('.html', '');

  // Sub-pages that highlight "Learn With Us"
  var learnPages = {
    'tools': 1, 'pairing': 1, 'aromas': 1, 'palate': 1, 'pronunciation': 1,
    'education': 1, 'glossary': 1, 'descriptors': 1, 'winemaking': 1, 'wine-labels': 1
  };

  // Sub-pages that highlight "Experiences"
  var experiencePages = {
    'wineries': 1, 'regions': 1, 'restaurants': 1, 'bottles': 1
  };

  function isActive(slug) {
    if (page === slug) return true;
    if (slug === 'learn-with-us' && learnPages[page]) return true;
    return false;
  }

  function isExperiencesActive() {
    return experiencePages[page] === 1;
  }

  // Nav structure
  var navItems = [
    { type: 'link',     href: 'learn-with-us.html', label: 'Learn With Us' },
    { type: 'dropdown', label: 'Experiences', children: [
      { href: 'wineries.html',    label: 'Wineries' },
      { href: 'regions.html',     label: 'Regions' },
      { href: 'restaurants.html', label: 'Restaurants' },
      { href: 'bottles.html',     label: 'Bottles' },
    ]},
    { type: 'link', href: 'posts.html',      label: 'Posts' },
    { type: 'link', href: 'wine-ink.html',   label: 'Wine Ink' },
    { type: 'link', href: 'cellar.html',     label: 'The Cellar' },
    { type: 'link', href: 'our-story.html',  label: 'Our Story' },
  ];

  var navHtml = navItems.map(function(item) {
    if (item.type === 'link') {
      var slug = item.href.replace('.html', '');
      var active = isActive(slug);
      return '<li><a href="' + item.href + '"' + (active ? ' class="active"' : '') + '>' + item.label + '</a></li>';
    }
    if (item.type === 'dropdown') {
      var groupActive = isExperiencesActive();
      var subItems = item.children.map(function(child) {
        var childSlug = child.href.replace('.html', '');
        var childActive = page === childSlug;
        return '<li><a href="' + child.href + '"' + (childActive ? ' class="active"' : '') + '>' + child.label + '</a></li>';
      }).join('');
      return '<li class="nav-dropdown' + (groupActive ? ' active' : '') + '">' +
             '<button class="nav-dropdown-toggle" type="button" aria-label="Toggle Experiences submenu">' +
               '<span>' + item.label + '</span>' +
               '<span class="dropdown-arrow">▾</span>' +
             '</button>' +
             '<ul class="nav-dropdown-menu">' + subItems + '</ul>' +
             '</li>';
    }
    return '';
  }).join('');

  // Inline styles for hamburger + dropdown
  var navStyles =
    '.nav-toggle{display:none;background:none;border:none;cursor:pointer;padding:.5rem;width:44px;height:44px;flex-direction:column;justify-content:center;align-items:center;gap:5px;position:absolute;top:1.2rem;right:1rem;z-index:10}' +
    '.nav-toggle span{display:block;width:24px;height:2px;background:var(--text-dark);transition:all .3s;border-radius:1px}' +
    '.site-header.menu-open .nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}' +
    '.site-header.menu-open .nav-toggle span:nth-child(2){opacity:0}' +
    '.site-header.menu-open .nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}' +
    '.nav-dropdown{position:relative;display:inline-block;list-style:none}' +
    '.nav-dropdown-toggle{background:none;border:none;cursor:pointer;font:inherit;color:var(--text-dark);font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;padding:.3rem 0;display:inline-flex;align-items:center;gap:.3rem;font-family:"Raleway",sans-serif;line-height:1.5}' +
    '.nav-dropdown.active .nav-dropdown-toggle{color:var(--gold)}' +
    '.nav-dropdown-toggle:hover{color:var(--gold)}' +
    '.dropdown-arrow{font-size:.7rem;transition:transform .2s;line-height:1}' +
    '.nav-dropdown-menu{position:absolute;top:100%;left:50%;transform:translateX(-50%);background:var(--cream);border:1px solid var(--border);list-style:none;padding:.5rem 0;min-width:180px;opacity:0;visibility:hidden;transition:opacity .15s,visibility .15s;z-index:100;margin:0;box-shadow:0 4px 12px rgba(60,40,20,.08)}' +
    '.nav-dropdown:hover .nav-dropdown-menu{opacity:1;visibility:visible}' +
    '.nav-dropdown-menu li{text-align:center}' +
    '.nav-dropdown-menu a{display:block;padding:.6rem 1.4rem;font-size:.65rem;letter-spacing:.18em;text-transform:uppercase;color:var(--text-dark);font-weight:600;text-decoration:none;font-family:"Raleway",sans-serif}' +
    '.nav-dropdown-menu a:hover,.nav-dropdown-menu a.active{color:var(--gold)}' +
    '@media (max-width: 760px){' +
      '.site-header{position:relative}' +
      '.nav-toggle{display:flex}' +
      '.header-icon-right{display:none}' +
      '.header-grid{grid-template-columns:auto 1fr 44px}' +
      '.nav-links{display:none !important;flex-direction:column;width:100%;border-top:1px solid var(--border);padding:0;margin:0;gap:0}' +
      '.site-header.menu-open .nav-links{display:flex !important}' +
      '.nav-links > li{width:100%;border-bottom:1px solid var(--border);padding:0;list-style:none}' +
      '.nav-links > li:last-child{border-bottom:none}' +
      '.nav-links > li > a{display:block;width:100%;padding:1rem 1.5rem;text-align:center;font-size:.75rem;letter-spacing:.2em}' +
      '.nav-dropdown{display:block;width:100%}' +
      '.nav-dropdown-toggle{width:100%;justify-content:center;padding:1rem 1.5rem;font-size:.75rem;letter-spacing:.2em}' +
      '.nav-dropdown-menu{position:static;opacity:1;visibility:visible;transform:none;border:none;border-top:1px solid var(--border);background:var(--cream-dark);padding:0;width:100%;max-height:0;overflow:hidden;transition:max-height .3s ease;box-shadow:none;min-width:0}' +
      '.nav-dropdown.open .nav-dropdown-menu{max-height:500px}' +
      '.nav-dropdown.open .dropdown-arrow{transform:rotate(180deg)}' +
      '.nav-dropdown-menu li{border-bottom:1px solid rgba(212,196,168,0.5)}' +
      '.nav-dropdown-menu li:last-child{border-bottom:none}' +
      '.nav-dropdown-menu a{padding:.9rem 1.5rem;font-size:.7rem}' +
    '}';

  var headerHtml =
    '<style>' + navStyles + '</style>' +
    '<header class="site-header">' +
      '<div class="header-grid">' +
        '<a href="index.html" class="header-icon header-icon-left"><img src="logo-glass-1.png" alt="Kazmi Cellars"></a>' +
        '<a href="index.html" class="header-brand">' +
          '<img src="kazmi-cellars-logo.png" alt="Kazmi Cellars">' +
          '<span class="logo-tagline">Journey Through Wine With Us</span>' +
        '</a>' +
        '<a href="index.html" class="header-icon header-icon-right"><img src="logo-glass-1.png" alt="Kazmi Cellars"></a>' +
        '<button class="nav-toggle" type="button" aria-label="Toggle menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</div>' +
      '<nav><ul class="nav-links">' + navHtml + '</ul></nav>' +
    '</header>';

  document.body.insertAdjacentHTML('afterbegin', headerHtml);

  // Hamburger toggle
  var toggle = document.querySelector('.nav-toggle');
  var header = document.querySelector('.site-header');
  if (toggle && header) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      header.classList.toggle('menu-open');
    });
  }

  // Mobile dropdown toggle (Experiences expand/collapse on tap)
  var dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
  for (var i = 0; i < dropdownToggles.length; i++) {
    dropdownToggles[i].addEventListener('click', function(e) {
      if (window.innerWidth <= 760) {
        e.preventDefault();
        e.stopPropagation();
        this.parentElement.classList.toggle('open');
      }
    });
  }

  // Close mobile menu when tapping outside header
  document.addEventListener('click', function(e) {
    if (header && !header.contains(e.target)) {
      header.classList.remove('menu-open');
    }
  });
})();
