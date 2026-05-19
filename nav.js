(function () {
  var page = (window.location.pathname.split('/').pop() || 'index').replace('.html', '');

  // All "Learn With Us" sub-pages highlight the Learn With Us nav item
  var learnPages = {
    'tools': 1,
    'pairing': 1,
    'aromas': 1,
    'palate': 1,
    'pronunciation': 1,
    'education': 1,
    'glossary': 1,
    'descriptors': 1,
    'winemaking': 1,
    'wine-labels': 1
  };

  var links = [
    ['learn-with-us.html', 'Learn With Us'],
    ['bottles.html',       'Bottles'],
    ['restaurants.html',   'Restaurants'],
    ['wineries.html',      'Wineries'],
    ['regions.html',       'Regions'],
    ['posts.html',         'Posts'],
    ['wine-ink.html',      'Wine Ink'],
    ['cellar.html',        'The Cellar'],
    ['our-story.html',     'Our Story'],
  ];

  function isActive(href) {
    var slug = href.replace('.html', '');
    if (learnPages[page] && slug === 'learn-with-us') return true;
    return page === slug;
  }

  var items = links.map(function (l) {
    return '<li><a href="' + l[0] + '"' + (isActive(l[0]) ? ' class="active"' : '') + '>' + l[1] + '</a></li>';
  }).join('');

  document.body.insertAdjacentHTML('afterbegin',
    '<header class="site-header">' +
      '<div class="header-grid">' +
        '<a href="index.html" class="header-icon header-icon-left"><img src="logo-glass-1.png" alt="Kazmi Cellars"></a>' +
        '<a href="index.html" class="header-brand">' +
          '<img src="kazmi-cellars-logo.png" alt="Kazmi Cellars">' +
          '<span class="logo-tagline">Journey Through Wine With Us</span>' +
        '</a>' +
        '<a href="index.html" class="header-icon header-icon-right"><img src="logo-glass-1.png" alt="Kazmi Cellars"></a>' +
      '</div>' +
      '<nav><ul class="nav-links">' + items + '</ul></nav>' +
    '</header>'
  );
})();
