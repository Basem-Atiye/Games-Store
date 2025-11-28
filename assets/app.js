(function(){
  let GAMES = [];

  let state = {
    query: '',
    genre: 'all',
    sort: 'featured',
    cart: JSON.parse(localStorage.getItem('gamenova_cart')||'{}'),
    wishlist: JSON.parse(localStorage.getItem('gamenova_wl')||'{}')
  };

  let $gamesGrid = $('#gamesGrid');
  let $genreFilter = $('#genreFilter');
  let $sortSelect = $('#sortSelect');
  let $searchInput = $('#searchInput');
  let $resultsInfo = $('#resultsInfo');
  let $cartCount = $('#cartCount');
  let $wishlistCount = $('#wishlistCount');
  let $gameModal = $('#gameModal');
  let $modalContent = $('#modalContent');
  let $modalClose = $('#modalClose');
  let $cartDrawer = $('#cartDrawer');
  let $wishDrawer = $('#wishDrawer');
  let $cartItemsEl = $('#cartItems');
  let $wishItemsEl = $('#wishItems');
  let $cartTotalEl = $('#cartTotal');

  let lastFocused = null;

async function loadGames() {
  try {
    const response = await fetch('data/games.json');
    if (!response.ok) {
      console.error('Failed to fetch games.json. Status:', response.status);
      return;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      GAMES = data;
    } else if (data.games && Array.isArray(data.games)) {
      GAMES = data.games;
    } else {
      console.error('Invalid games.json format.');
      return;
    }

    init();

  } catch (err) {
    console.error('Error loading games.json:', err);
  }
}


  function init(){
    populateGenres();
    bind();
    render();
    $('#year').text(new Date().getFullYear());
  }

  function populateGenres(){
    let genres = [];
    for(let i = 0; i < GAMES.length; i++){
      let g = GAMES[i].genre;
      if($.inArray(g, genres) === -1) genres.push(g);
    }
    for(let j = 0; j < genres.length; j++){
      $genreFilter.append($('<option>').val(genres[j]).text(genres[j]));
    }
  }

  function bind(){
    $searchInput.on('input', function() {
      state.query = $(this).val().toLowerCase();
      render();
    });

    $genreFilter.on('change', function() {
      state.genre = $(this).val();
      render();
    });

    $sortSelect.on('change', function() {
      state.sort = $(this).val();
      render();
    });

    $modalClose.on('click', closeModal);
    $(window).on('click', function(e) {
      if(e.target === $gameModal[0]) closeModal();
    });

    $(document).on('keydown', function(e) {
      if(e.key === 'Escape') {
        closeModal();
        closeDrawers();
      }
    });

    $('#cartBtn').on('click', function(){ openDrawer('cart'); });
    $('#wishlistBtn').on('click', function(){ openDrawer('wish'); });
    $('#cartClose').on('click', function(){ closeDrawer('cart'); });
    $('#wishClose').on('click', function(){ closeDrawer('wish'); });

    $('#diagBtn').on('click', runDiagnostics);
    $('#checkoutBtn').on('click', function() {
      window.location.href = 'checkout.html';
    });
  }

  function render(){
    let filtered = [];
    for(let i = 0; i < GAMES.length; i++){
      let g = GAMES[i];
      if(state.genre !== 'all' && g.genre !== state.genre) continue;
      if(state.query){
        let hay = (g.title + ' ' + g.genre + ' ' + (g.desc || '')).toLowerCase();
        if(hay.indexOf(state.query) === -1) continue;
      }
      filtered.push(g);
    }

    let sorted = filtered.slice().sort(function(a, b){
      switch(state.sort){
        case 'popular': return ((b.popular?1:0) - (a.popular?1:0)) || (b.rating - a.rating);
        case 'newest': return b.id - a.id;
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return b.rating - a.rating;
      }
    });

    $gamesGrid.empty();
    for(let i = 0; i < sorted.length; i++){
      let game = sorted[i];
      let $card = createCard(game);
      $gamesGrid.append($card);
    }

    $resultsInfo.text(sorted.length + ' game' + (sorted.length !== 1 ? 's' : ''));
    updateCounts();
    renderCart();
    renderWishlist();
  }

  function createCard(game){
    let $card = $('<article>').addClass('card').attr('tabindex', 0);

    let html = '';
    html += '<div class="thumb"><img src="' + game.img + '" alt="' + game.title + ' cover"/></div>';
    html += '<div class="meta">';
    html += '  <div>';
    html += '    <div class="title">' + game.title + '</div>';
    html += '    <div class="pill muted">' + game.genre + ' • ⭐' + game.rating + '</div>';
    html += '  </div>';
    html += '  <div class="price">$' + game.price.toFixed(2) + '</div>';
    html += '</div>';
    html += '<div class="card-footer">';
    html += '  <div class="pill">' + (game.popular ? 'Popular' : 'Indie') + '</div>';
    html += '  <div>';
    html += '    <button class="btn small" data-action="view" data-id="' + game.id + '">View</button>';
    html += '    <button class="btn small" data-action="cart" data-id="' + game.id + '">Add</button>';
    html += '  </div>';
    html += '</div>';

    $card.html(html);

    $card.on('click', function(e) {
      let $btn = $(e.target).closest('button');
      if($btn.length) {
        let act = $btn.data('action');
        let id = Number($btn.data('id'));
        if(act === 'view') openModal(id);
        if(act === 'cart') toggleCart(id);
      } else {
        openModal(game.id);
      }
    });

    return $card;
  }

  function openModal(id){
    let g = null;
    for(let i = 0; i < GAMES.length; i++){
      if(GAMES[i].id === id){ g = GAMES[i]; break; }
    }
    if(!g) return;

    let html = '';
    html += '<h2 id="modalTitle">' + g.title + ' — <span class="muted">' + g.genre + '</span></h2>';
    html += '<p class="muted">⭐ ' + g.rating + ' • $' + g.price.toFixed(2) + '</p>';
    html += '<div style="display:flex;gap:18px;align-items:center;margin-top:12px">';
    html += '  <div style="flex:0 0 200px;height:120px;border-radius:10px;overflow:hidden"><img src="' + g.img + '" alt="' + g.title + ' cover" style="width:100%;height:100%;object-fit:cover"></div>';
    html += '  <div>' + g.desc + '</div>';
    html += '</div>';
    html += '<div style="margin-top:16px;display:flex;gap:12px">';
    html += '  <button class="btn primary" id="modalAdd">Add to Cart — $' + g.price.toFixed(2) + '</button>';
    html += '  <button class="btn outline" id="modalWish">' + (state.wishlist[g.id] ? 'Remove from Wishlist' : 'Add to Wishlist') + '</button>';
    html += '</div>';

    $modalContent.html(html);

    $('#modalAdd').on('click', function() {
      toggleCart(g.id);
    });

    $('#modalWish').on('click', function() {
      toggleWishlist(g.id);
      render();
      openModal(g.id);
    });

    lastFocused = document.activeElement;
    $gameModal.attr('aria-hidden', 'false');
    trapFocus($gameModal[0]);
  }

  function closeModal(){
    $gameModal.attr('aria-hidden', 'true');
    releaseFocusTrap();
    if(lastFocused) lastFocused.focus();
  }

  function openDrawer(which){
    lastFocused = document.activeElement;
    if(which === 'cart'){
      $cartDrawer.attr('aria-hidden', 'false');
      trapFocus($cartDrawer[0]);
    } else {
      $wishDrawer.attr('aria-hidden', 'false');
      trapFocus($wishDrawer[0]);
    }
    render();
  }

  function closeDrawer(which){
    if(which === 'cart') $cartDrawer.attr('aria-hidden', 'true');
    else $wishDrawer.attr('aria-hidden', 'true');
    releaseFocusTrap();
    if(lastFocused) lastFocused.focus();
  }

  function closeDrawers(){
    $cartDrawer.attr('aria-hidden', 'true');
    $wishDrawer.attr('aria-hidden', 'true');
    releaseFocusTrap();
  }

  let trapElement = null;
  let trapKeyHandler = null;

  function trapFocus(el){
    trapElement = el;
    let focusable = $(el)
      .find('a,button,input,select,textarea,[tabindex]:not([tabindex="#-1"])')
      .filter(function() { return !$(this).prop('disabled'); })
      .toArray();
    
    if(focusable.length) focusable[0].focus();
    
    trapKeyHandler = function(e){
      if(e.key !== 'Tab') return;
      let focusableNow = $(el)
        .find('a,button,input,select,textarea,[tabindex]:not([tabindex="#-1"])')
        .filter(function() { return !$(this).prop('disabled'); })
        .toArray();
      
      if(!focusableNow.length) return;
      let first = focusableNow[0];
      let last = focusableNow[focusableNow.length - 1];
      
      if(e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    $(document).on('keydown', trapKeyHandler);
  }

  function releaseFocusTrap(){
    if(trapKeyHandler) $(document).off('keydown', trapKeyHandler);
    trapElement = null;
    trapKeyHandler = null;
  }

  function toggleCart(id){
    if(state.cart[id]) delete state.cart[id];
    else state.cart[id] = (state.cart[id] || 0) + 1;
    localStorage.setItem('gamenova_cart', JSON.stringify(state.cart));
    updateCounts();
    renderCart();
  }

  function toggleWishlist(id){
    if(state.wishlist[id]) delete state.wishlist[id];
    else state.wishlist[id] = true;
    localStorage.setItem('gamenova_wl', JSON.stringify(state.wishlist));
    updateCounts();
    renderWishlist();
  }

  function updateCounts(){
    $cartCount.text(Object.keys(state.cart).length);
    $wishlistCount.text(Object.keys(state.wishlist).length);
  }

  function renderCart(){
    $cartItemsEl.empty();
    let ids = [];
    for(let k in state.cart){ if(state.cart.hasOwnProperty(k)) ids.push(Number(k)); }
    let total = 0;

    for(let i = 0; i < ids.length; i++){
      let id = ids[i];
      let game = null;
      for(let j = 0; j < GAMES.length; j++){ if(GAMES[j].id === id){ game = GAMES[j]; break; } }
      if(!game) continue;
      let qty = state.cart[id];
      total += game.price * qty;

      let $row = $('<div>').addClass('cart-row');
      let inner = '';
      inner += '<div style="display:flex;gap:8px;align-items:center">';
      inner += '<img src="' + game.img + '" alt="' + game.title + '" style="width:48px;height:36px;object-fit:cover;border-radius:6px">';
      inner += '<div><div class="title">' + game.title + '</div>';
      inner += '<div class="muted">$' + game.price.toFixed(2) + ' × ' + qty + '</div></div>';
      inner += '</div>';
      inner += '<div><button class="btn small" data-action="remove" data-id="' + id + '">Remove</button></div>';

      $row.html(inner);

      (function(theId){
        $row.find('[data-action="remove"]').on('click', function() {
          delete state.cart[theId];
          localStorage.setItem('gamenova_cart', JSON.stringify(state.cart));
          render();
        });
      })(id);

      $cartItemsEl.append($row);
    }

    $cartTotalEl.text('$' + total.toFixed(2));
  }

  function renderWishlist(){
    $wishItemsEl.empty();
    let ids = [];
    for(let k in state.wishlist){ if(state.wishlist.hasOwnProperty(k)) ids.push(Number(k)); }

    for(let i = 0; i < ids.length; i++){
      let id = ids[i];
      let game = null;
      for(let j = 0; j < GAMES.length; j++){ if(GAMES[j].id === id){ game = GAMES[j]; break; } }
      if(!game) continue;

      let $row = $('<div>').addClass('wish-row');
      let inner = '';
      inner += '<div style="display:flex;gap:8px;align-items:center">';
      inner += '<img src="' + game.img + '" alt="' + game.title + '" style="width:48px;height:36px;object-fit:cover;border-radius:6px">';
      inner += '<div><div class="title">' + game.title + '</div>';
      inner += '<div class="muted">$' + game.price.toFixed(2) + '</div></div>';
      inner += '</div>';
      inner += '<div>';
      inner += '<button class="btn small" data-action="add" data-id="' + id + '">Add</button>';
      inner += '<button class="btn small" data-action="remove" data-id="' + id + '">Remove</button>';
      inner += '</div>';

      $row.html(inner);

      (function(theId){
        $row.find('[data-action="add"]').on('click', function() { toggleCart(theId); });
        $row.find('[data-action="remove"]').on('click', function() {
          delete state.wishlist[theId];
          localStorage.setItem('gamenova_wl', JSON.stringify(state.wishlist));
          render();
        });
      })(id);

      $wishItemsEl.append($row);
    }
  }

  function runDiagnostics(){
    let results = [];
    try {
      let cardCount = $('.card').length;
      results.push({
        name: 'render-cards',
        ok: cardCount === GAMES.length,
        detail: 'rendered ' + cardCount + '/' + GAMES.length
      });

      let cart = JSON.parse(localStorage.getItem('gamenova_cart') || '{}');
      let wl = JSON.parse(localStorage.getItem('gamenova_wl') || '{}');
      results.push({
        name: 'localStorage',
        ok: typeof cart === 'object' && typeof wl === 'object',
        detail: 'cart:' + Object.keys(cart).length + ', wl:' + Object.keys(wl).length
      });

      let $imgs = $('.thumb img');
      let loaded = $imgs.filter(function() { return this.naturalWidth > 0; }).length;
      results.push({
        name: 'images',
        ok: loaded === $imgs.length && $imgs.length > 0,
        detail: loaded + '/' + $imgs.length + ' loaded'
      });
    } catch(err) {
      results.push({name: 'exception', ok: false, detail: err.message});
    }

    let $panel = $('.diag-panel');
    if(!$panel.length) {
      $panel = $('<div>').addClass('diag-panel').appendTo('body');
    }
    
    let html = '<strong>Diagnostics</strong><ul>';
    for(let i = 0; i < results.length; i++){
      let r = results[i];
      let color = r.ok ? '#9fe6c1' : '#ff9a9a';
      html += '<li style="color:' + color + '">' + r.name + ': ' + r.detail + '</li>';
    }
    html += '</ul>';

    $panel.html(html);
  }

  $(document).ready(function() {
    loadGames();
  });

})();
