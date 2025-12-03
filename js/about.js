document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('year').textContent = new Date().getFullYear();
  
  setupTableOfContents();
  
  setupSmoothScrolling();
  
  setupSectionHighlighting();
});

function setupTableOfContents() {
  const tocLinks = document.querySelectorAll('.toc a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        tocLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        
        smoothScrollTo(targetElement);
        
        updateUrlHash(targetId);
      }
    });
  });
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          smoothScrollTo(target);
          updateUrlHash(href);
        }
      }
    });
  });
}

function setupSectionHighlighting() {
  const sections = document.querySelectorAll('.doc-card h2');
  const tocLinks = document.querySelectorAll('.toc a');
  
  window.addEventListener('scroll', function() {
    let currentSection = '';
    const scrollPosition = window.scrollY + 100;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop) {
        currentSection = sectionId;
      }
    });
    
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSection) {
        link.classList.add('active');
      }
    });
    
    if (!currentSection && tocLinks.length > 0) {
      tocLinks[0].classList.add('active');
    }
  });
  
  const hash = window.location.hash;
  if (hash) {
    const activeLink = document.querySelector(`.toc a[href="${hash}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  } else if (tocLinks.length > 0) {
    tocLinks[0].classList.add('active');
  }
}

function smoothScrollTo(element) {
  const offset = 80;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

function updateUrlHash(hash) {
  if (history.pushState) {
    history.pushState(null, null, hash);
  } else {
    window.location.hash = hash;
  }
}

document.head.appendChild(style);