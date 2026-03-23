/**
 * UI Utilities Module
 * Handles common UI operations and DOM manipulation
 */

class UIUtils {
  /**
   * Render star rating
   * @param {number} rating - Rating value (0-5)
   * @returns {string} HTML string with star icons
   */
  static renderStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        starsHtml += '<i class="fa fa-star"></i>';
      } else if (i - rating < 1) {
        starsHtml += '<i class="fa fa-star-half-o"></i>';
      } else {
        starsHtml += '<i class="fa fa-star-o"></i>';
      }
    }
    return starsHtml;
  }

  /**
   * Format price with currency
   * @param {number} price
   * @returns {string}
   */
  static formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }

  /**
   * Render product card HTML
   * @param {Object} product
   * @param {Object} [options]
   * @param {boolean} [options.showAddToCart=true]
   * @returns {string}
   */
  static renderProductCard(product, options = {}) {
    const { showAddToCart = true } = options;
    // Use MongoDB _id if available, fallback to id
    const productId = product._id || product.id;
    
    return `
      <div class="col-4">
        <a href="products-details.html?id=${productId}">
          <img src="${product.image}" alt="${product.name}">
        </a>
        <a href="products-details.html?id=${productId}">
          <h4>${product.name}</h4>
        </a>
        <div class="rating">
          ${UIUtils.renderStars(product.rating)}
        </div>
        <p>${UIUtils.formatPrice(product.price)}</p>
        ${showAddToCart ? `<button class="btn-add-cart" data-product-id="${productId}">Add to Cart</button>` : ''}
      </div>
    `;
  }

  /**
   * Get URL query parameter
   * @param {string} param
   * @returns {string|null}
   */
  static getQueryParam(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
  }

  /**
   * Toggle mobile menu
   * @param {string} menuId
   */
  static toggleMenu(menuId = 'MenuItems') {
    const menu = document.getElementById(menuId);
    if (menu) {
      if (menu.style.maxHeight === '0px' || !menu.style.maxHeight) {
        menu.style.maxHeight = '200px';
      } else {
        menu.style.maxHeight = '0px';
      }
    }
  }

  /**
   * Show notification
   * @param {string} message
   * @param {string} type - 'success', 'error', 'info'
   * @param {number} duration - milliseconds
   */
  static showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease-in;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  /**
   * Format date
   * @param {Date|string} date
   * @returns {string}
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

// Add CSS animations to head
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
