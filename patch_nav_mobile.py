import re

path = r"C:\Users\Lenovo\Desktop\carte_visite\index_saas.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# ══════════════════════════════════════════════════════════════
# 1. REMPLACER LA NAV PAR UNE VERSION RESPONSIVE MOBILE
# ══════════════════════════════════════════════════════════════

OLD_NAV = re.search(r'<!-- ─── NAV ─── -->.*?</nav>', content, re.DOTALL)

NEW_NAV = """<!-- ─── NAV ─── -->
<nav>
  <a href="#" class="nav-logo">Carte<span>Viz</span></a>

  <!-- Burger menu (mobile) -->
  <button class="nav-burger" id="nav-burger" onclick="toggleMenu()" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>

  <!-- Links desktop -->
  <div class="nav-links" id="nav-links">
    <a href="#comment" onclick="closeMenu()">Comment ça marche</a>
    <a href="#creer" onclick="closeMenu()">Créer</a>
    <a href="#tarifs" onclick="closeMenu()">Tarifs</a>
    <a href="#creer" class="btn-nav" onclick="closeMenu()">Commencer — Gratuit</a>
  </div>
</nav>"""

if OLD_NAV:
    content = content[:OLD_NAV.start()] + NEW_NAV + content[OLD_NAV.end():]
    print("✅ NAV remplacée")

# ══════════════════════════════════════════════════════════════
# 2. STYLES NAV RESPONSIVE
# ══════════════════════════════════════════════════════════════
NEW_NAV_CSS = """
    /* ─── NAV ─── */
    nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 clamp(1.2rem, 4vw, 3rem);
      height: 64px;
      background: rgba(10,10,20,0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
    }
    .nav-logo {
      font-family: var(--jakarta); font-size: 1.25rem; font-weight: 800;
      color: var(--text); text-decoration: none; letter-spacing: -0.03em;
      flex-shrink: 0;
    }
    .nav-logo span { color: var(--accent); }

    /* Desktop links */
    .nav-links {
      display: flex; gap: 1.75rem; align-items: center;
    }
    .nav-links a {
      color: var(--muted); text-decoration: none; font-size: .88rem;
      font-weight: 500; transition: color .2s; white-space: nowrap;
    }
    .nav-links a:hover { color: var(--text); }
    .btn-nav {
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      color: #fff !important;
      padding: .45rem 1.1rem; border-radius: 8px;
      font-weight: 700 !important; font-size: .82rem !important;
      text-decoration: none; transition: opacity .2s; white-space: nowrap;
    }
    .btn-nav:hover { opacity: .88; }

    /* Burger button */
    .nav-burger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 4px;
    }
    .nav-burger span {
      display: block; width: 22px; height: 2px;
      background: var(--text); border-radius: 2px;
      transition: all .3s;
    }
    .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-burger.open span:nth-child(2) { opacity: 0; }
    .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile */
    @media (max-width: 700px) {
      .nav-burger { display: flex; }
      .nav-links {
        display: none; flex-direction: column; gap: 0;
        position: absolute; top: 64px; left: 0; right: 0;
        background: rgba(10,10,20,0.97);
        border-bottom: 1px solid var(--border);
        padding: 1rem 1.5rem 1.5rem;
        backdrop-filter: blur(20px);
      }
      .nav-links.open { display: flex; }
      .nav-links a {
        padding: .75rem 0; font-size: 1rem;
        border-bottom: 1px solid var(--border);
        width: 100%;
      }
      .nav-links a:last-child { border-bottom: none; }
      .btn-nav {
        margin-top: .5rem; text-align: center;
        padding: .75rem !important; font-size: .95rem !important;
        border-radius: 10px;
      }
    }
"""

# Remplacer l'ancien CSS nav
old_nav_css = re.search(r'/\* ─── NAV ─── \*/.*?\.btn-nav:hover \{ opacity: \.88; \}', content, re.DOTALL)
if old_nav_css:
    content = content[:old_nav_css.start()] + NEW_NAV_CSS.strip() + content[old_nav_css.end():]
    print("✅ CSS nav remplacé")
else:
    content = content.replace('    /* ─── HERO ─── */', NEW_NAV_CSS + '\n    /* ─── HERO ─── */')
    print("✅ CSS nav injecté (fallback)")

# ══════════════════════════════════════════════════════════════
# 3. JS BURGER MENU
# ══════════════════════════════════════════════════════════════
BURGER_JS = """
  // ── NAV BURGER ────────────────────────────────────────────
  function toggleMenu() {
    const links = document.getElementById('nav-links');
    const burger = document.getElementById('nav-burger');
    links.classList.toggle('open');
    burger.classList.toggle('open');
  }
  function closeMenu() {
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('nav-burger').classList.remove('open');
  }
  // Fermer au clic extérieur
  document.addEventListener('click', function(e) {
    const nav = document.querySelector('nav');
    if (!nav.contains(e.target)) closeMenu();
  });
  // ── END NAV BURGER ─────────────────────────────────────────
"""

content = content.replace('  // Init preview\n  updatePreview();',
                           BURGER_JS + '\n  // Init preview\n  updatePreview();')
print("✅ JS burger ajouté")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("\n🎉 Nav responsive mobile installée !")
print("Fais : git add . && git commit -m 'fix: nav responsive mobile' && git push")
