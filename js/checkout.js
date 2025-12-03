document.addEventListener('DOMContentLoaded', function () {
  const cart = JSON.parse(localStorage.getItem('gamenova_cart') || '{}');
  const cartItemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('subtotal');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('total');

  fetch('data/games.json')
    .then(response => response.json())
    .then(data => {
      const games = data.games;
      let subtotal = 0;
      cartItemsEl.innerHTML = '';
      Object.keys(cart).forEach(id => {
        const game = games.find(g => g.id === Number(id));
        if (!game) return;
        const qty = cart[id];
        const itemTotal = game.price * qty;
        subtotal += itemTotal;
        cartItemsEl.innerHTML += `
          <div class="cart-item">
            <img src="${game.img}" alt="${game.title}" />
            <div>
              <div class="title">${game.title}</div>
              <div class="muted">$${game.price.toFixed(2)} × ${qty}</div>
            </div>
            <div class="muted">$${itemTotal.toFixed(2)}</div>
          </div>
        `;
      });
      const tax = subtotal * 0.10;
      const total = subtotal + tax;
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      taxEl.textContent = `$${tax.toFixed(2)}`;
      totalEl.textContent = `$${total.toFixed(2)}`;
    });
});

$(document).ready(function() {
  var $form = $('#checkoutForm');
  var $card = $('#card');
  var $expiry = $('#expiry');
  var $successModal = $('#successModal');

  $card.on('input', function() {
    var v = $(this).val().replace(/\D/g, '');
    $(this).val(v.replace(/(\d{4})/g, '$1 ').trim());
  });

  $expiry.on('input', function() {
    var v = $(this).val().replace(/\D/g, '');
    if(v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
    $(this).val(v);
  });

  $form.on('submit', function(e) {
    e.preventDefault();
    var cardNum = $card.val().replace(/\s/g, '');
    if(cardNum.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }
    if($expiry.val().length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    var orderNum = Math.random().toString(36).slice(2, 8).toUpperCase();
    $('#orderNumber').text(orderNum);
    $successModal.attr('aria-hidden', 'false');
    localStorage.removeItem('gamenova_cart');
  });
});