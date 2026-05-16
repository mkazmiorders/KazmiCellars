(function () {
  var footer = `
    <footer class="site-footer" style="text-align:center;">
      <span class="footer-logo">Kazmi Cellars</span>
      <ul class="footer-links" style="justify-content:center;margin:.8rem 0;">
        <li><a href="contact.html" style="color:var(--cream);opacity:1;">Contact</a></li>
        <li><a href="terms.html" style="color:var(--cream);opacity:1;">Terms &amp; Conditions</a></li>
        <li><a href="privacy.html" style="color:var(--cream);opacity:1;">Privacy Policy</a></li>
        <li><a href="editorial.html" style="color:var(--cream);opacity:1;">Editorial Policy</a></li>
      </ul>
      <hr class="footer-divider">
      <div class="footer-bottom">
        <span class="footer-copy" style="color:var(--cream);opacity:1;">© 2026 Kazmi Cellars · All Rights Reserved</span>
        <span class="footer-social" style="color:var(--cream);opacity:1;">
          <a href="mailto:contact@kazmicellars.com" style="color:var(--cream);text-decoration:underline;text-underline-offset:3px;">contact@kazmicellars.com</a>
          &nbsp;·&nbsp;
          <a href="https://instagram.com/kazmicellars" target="_blank" rel="noopener" style="color:var(--cream);text-decoration:underline;text-underline-offset:3px;">@kazmicellars</a>
        </span>
      </div>
    </footer>
  `;

  document.body.insertAdjacentHTML('beforeend', footer);
})();
