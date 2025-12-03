$(function() {
  $('#year').text(new Date().getFullYear());
  
  $('.toc a').on('click', function(e) {
    e.preventDefault();
    
    const targetId = $(this).attr('href');
    const $target = $(targetId);
    
    if ($target.length) {
      $('.toc a').removeClass('active');
      $(this).addClass('active');
      
      $('html, body').animate({
        scrollTop: $target.offset().top - 80
      }, 400);
      
      if (history.pushState) {
        history.pushState(null, null, targetId);
      } else {
        window.location.hash = targetId;
      }
    }
  });

  const sections = $('.doc-card h2, .doc-card h3');
  const navLinks = $('.toc a');
  
  $(window).on('scroll', function() {
    let current = '';
    const scrollPosition = $(window).scrollTop() + 100;
    
    sections.each(function() {
      const sectionTop = $(this).offset().top;
      const sectionId = $(this).attr('id');
      
      if (scrollPosition >= sectionTop) {
        current = sectionId;
      }
    });
    
    navLinks.removeClass('active');
    if (current) {
      $(`.toc a[href="#${current}"]`).addClass('active');
    }
  });
  
  const hash = window.location.hash;
  if (hash) {
    $(`.toc a[href="${hash}"]`).addClass('active');
  } else {
    $('.toc a').first().addClass('active');
  }
  $('<style>').text(`
    .toc a.active {
      color: var(--accent) !important;
      background: rgba(139, 92, 246, 0.1) !important;
      border-left-color: var(--accent) !important;
      font-weight: 600;
    }
    
    /* Highlight current section in content */
    .doc-card h2:target,
    .doc-card h3:target {
      animation: highlightSection 1.5s ease;
    }
    
    @keyframes highlightSection {
      0%, 100% { background-color: transparent; }
      50% { background-color: rgba(139, 92, 246, 0.1); }
    }
  `).appendTo('head');
});