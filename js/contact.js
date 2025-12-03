$(function() {
  $('#year').text(new Date().getFullYear());
  
  loadMessages();
  
  $('#contactForm').submit(function(e) {
    e.preventDefault();
    saveMessage();
  });
  
  $('#clearBtn').click(function() {
    if (confirm('Clear all saved messages?')) {
      localStorage.removeItem('gamenova_contacts');
      loadMessages();
      showMessage('All messages cleared', 'info');
    }
  });
});

function saveMessage() {
  const name = $('#cname').val().trim();
  const email = $('#cemail').val().trim();
  const message = $('#message').val().trim();
  
  if (!name) {
    showMessage('Please enter your name', 'error');
    return;
  }
  if (!email) {
    showMessage('Please enter your email', 'error');
    return;
  }
  if (!email.includes('@')) {
    showMessage('Please enter a valid email', 'error');
    return;
  }
  if (!message) {
    showMessage('Please enter your message', 'error');
    return;
  }
  if (message.length < 10) {
    showMessage('Message must be at least 10 characters', 'error');
    return;
  }

  const messages = JSON.parse(localStorage.getItem('gamenova_contacts') || '[]');
  
  messages.unshift({
    name: name,
    email: email,
    message: message,
    time: new Date().toLocaleString()
  });
  
  localStorage.setItem('gamenova_contacts', JSON.stringify(messages.slice(0, 50)));
  
  $('#contactForm')[0].reset();
  loadMessages();
  
  showMessage('Message saved!', 'success');
}

function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('gamenova_contacts') || '[]');
  const $list = $('#sentList');
  
  if (messages.length === 0) {
    $list.html('<div class="no-messages"><p>No saved messages yet.</p></div>');
    return;
  }
  
  let html = '';
  messages.forEach(msg => {
    html += `
      <div class="message-item">
        <div class="message-header">
          <span class="message-name">${msg.name}</span>
          <span class="message-email">(${msg.email})</span>
          <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-content">${msg.message}</div>
      </div>
    `;
  });
  
  $list.html(html);
}

function showMessage(text, type) {
  $('.popup-message').remove();
  
  $('body').addClass('popup-active');
  
  const $popup = $(`
    <div class="popup-message popup-${type}">
      <div class="popup-content">${text}</div>
      <button class="popup-close">×</button>
    </div>
  `);
  
  $('body').append($popup);
  
  $popup.find('.popup-close').click(function() {
    $('body').removeClass('popup-active');
    $popup.remove();
  });
  
  setTimeout(function() {
    $('body').removeClass('popup-active');
    $popup.fadeOut(300, function() {
      $(this).remove();
    });
  }, 4000);
}