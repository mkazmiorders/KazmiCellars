(function () {
  var footer = `
    <footer class="site-footer" style="text-align:center;">
      <div class="footer-dedication" style="max-width:640px;margin:0 auto 2rem;padding-bottom:2rem;border-bottom:1px solid rgba(245,240,232,0.15);">
        <p style="font-family:'Cormorant Garamond',serif;font-size:.7rem;letter-spacing:.3em;text-transform:uppercase;color:var(--gold-light);margin:0 0 1rem;">In Loving Memory</p>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-style:italic;color:var(--cream);line-height:1.8;margin:0;">
          This site is dedicated to my brother <span style="font-style:normal;color:var(--gold-light);">Ghazi Kazmi</span>, who left us far too soon. He loved wine but in the simplest way. He never once sniffed a glass, swirled it, or tried to identify a note. He knew what he liked, ordered it, and drank it.
        </p>
        <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-style:italic;color:var(--gold-light);margin:1rem 0 0;">
          Love you, bro.
        </p>
      </div>
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
