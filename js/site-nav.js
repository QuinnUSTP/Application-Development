/**
 * Shared Site Navigation Helper
 * Keeps menu behavior and shared page links consistent across pages
 */

class SiteNav {
  static init() {
    document.addEventListener('DOMContentLoaded', () => {
      SiteNav.bindMenuToggle();
      SiteNav.bindCurrentPageState();
    });
  }

  static bindMenuToggle() {
    const menuItems = document.getElementById('MenuItems');
    const menuIcon = document.querySelector('.menu-icon');

    if (menuItems) {
      if (!menuItems.style.maxHeight) {
        menuItems.style.maxHeight = '0px';
      }

      if (menuIcon && !menuIcon.dataset.siteNavBound) {
        menuIcon.addEventListener('click', () => {
          if (window.UIUtils && typeof UIUtils.toggleMenu === 'function') {
            UIUtils.toggleMenu();
          } else {
            if (menuItems.style.maxHeight === '0px' || !menuItems.style.maxHeight) {
              menuItems.style.maxHeight = '200px';
            } else {
              menuItems.style.maxHeight = '0px';
            }
          }
        });
        menuIcon.dataset.siteNavBound = 'true';
      }
    }
  }

  static bindCurrentPageState() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('#MenuItems a');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const normalizedHref = href.split('#')[0];
      if (normalizedHref === currentPath) {
        link.classList.add('nav-active');
      }
    });
  }
}

SiteNav.init();