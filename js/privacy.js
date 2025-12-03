/*
 * Legal Pages JavaScript
 * Shared functionality for Terms and Privacy Policy pages
 */

$(function() {
  // Initialize legal page
  initLegalPage();
  
  function initLegalPage() {
    // Update year in footer
    updateFooterYear();
    
    // Initialize table of contents
    initTableOfContents();
    
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize section highlighting
    initSectionHighlighting();
    
    // Add active class for current hash
    highlightCurrentSection();
  }
  
  function updateFooterYear() {
    $('#year').text(new Date().getFullYear());
  }
  
  function initTableOfContents() {
    // Add click handler for TOC links
    $('.toc a').on('click', function(e) {
      e.preventDefault();
      
      const targetId = $(this).attr('href');
      const $target = $(targetId);
      
      if ($target.length) {
        // Update active link
        updateActiveLink($(this));
        
        // Smooth scroll to section
        smoothScrollTo($target);
        
        // Update URL without jump
        updateUrlHash(targetId);
      }
    });
  }
  
  function updateActiveLink($clickedLink) {
    $('.toc a').removeClass('active');
    $clickedLink.addClass('active');
  }
  
  function smoothScrollTo($element) {
    const offset = 80; // Account for fixed header
    const duration = 500;
    
    $('html, body').animate({
      scrollTop: $element.offset().top - offset
    }, duration);
  }
  
  function updateUrlHash(hash) {
    if (history.pushState) {
      history.pushState(null, null, hash);
    } else {
      window.location.hash = hash;
    }
  }
  
  function initSmoothScrolling() {
    // Add smooth scrolling for all anchor links within the document
    $('a[href^="#"]').not('.toc a').on('click', function(e) {
      const href = $(this).attr('href');
      if (href !== '#') {
        e.preventDefault();
        const $target = $(href);
        if ($target.length) {
          smoothScrollTo($target);
          updateUrlHash(href);
        }
      }
    });
  }
  
  function initSectionHighlighting() {
    const $sections = $('.doc-card h2, .doc-card h3');
    const $navLinks = $('.toc a');
    
    $(window).on('scroll', debounce(function() {
      highlightActiveSection($sections, $navLinks);
    }, 100));
  }
  
  function highlightActiveSection($sections, $navLinks) {
    let currentSection = '';
    const scrollPosition = $(window).scrollTop() + 100;
    
    $sections.each(function() {
      const sectionTop = $(this).offset().top;
      const sectionId = $(this).attr('id');
      
      if (scrollPosition >= sectionTop) {
        currentSection = sectionId;
      }
    });
    
    $navLinks.removeClass('active');
    if (currentSection) {
      $(`.toc a[href="#${currentSection}"]`).addClass('active');
    }
  }
  
  function highlightCurrentSection() {
    const hash = window.location.hash;
    if (hash) {
      $(`.toc a[href="${hash}"]`).addClass('active');
    } else {
      $('.toc a').first().addClass('active');
    }
  }
  
  // Utility function: debounce
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
  
  // Add CSS for animations
  $('<style>').text(`
    /* Highlight animation for target sections */
    .doc-card h2:target,
    .doc-card h3:target {
      animation: highlightSection 2s ease;
    }
    
    @keyframes highlightSection {
      0%, 100% { 
        background-color: transparent; 
        box-shadow: none;
      }
      50% { 
        background-color: rgba(139, 92, 246, 0.1); 
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.2);
      }
    }
    
    /* Code block styling */
    .doc-card code {
      transition: all 0.3s ease;
    }
    
    .doc-card code:hover {
      background: rgba(139, 92, 246, 0.15);
      border-color: var(--accent);
    }
    
    /* Pill styling for policy meta */
    .policy-meta .pill {
      transition: all 0.3s ease;
    }
    
    .policy-meta .pill:hover {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
    }
  `).appendTo('head');
});