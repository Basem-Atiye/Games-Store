$(document).ready(function() {
  // Set current year
  $('#year').text(new Date().getFullYear());
  
  // Setup tabs
  setupTabs();
  
  // Setup forms
  setupForms();
  
  // Setup popup
  setupPopup();
});

function setupTabs() {
  // Tab button click
  $('.tab-btn').click(function() {
    const formType = $(this).data('form');
    showForm(formType);
  });
  
  // Switch link click
  $('.switch-text a').click(function(e) {
    e.preventDefault();
    const formType = $(this).data('form');
    showForm(formType);
  });
}

function showForm(formType) {
  // Hide all forms
  $('.auth-form').removeClass('active');
  
  // Remove active from tabs
  $('.tab-btn').removeClass('active');
  
  // Show selected form
  $('#' + formType + '-form').addClass('active');
  
  // Activate selected tab
  $('[data-form="' + formType + '"]').addClass('active');
  
  // Clear errors
  $('.error').hide();
  $('.error').text('');
}

function setupForms() {
  // Login form
  $('#loginForm').submit(function(e) {
    e.preventDefault();
    login();
  });
  
  // Signup form
  $('#signupForm').submit(function(e) {
    e.preventDefault();
    signup();
  });
}

function login() {
  const email = $('#login-email').val().trim();
  const password = $('#login-password').val().trim();
  
  // Clear errors
  $('#login-form .error').hide();
  
  // Check inputs
  let ok = true;
  
  if (!email) {
    $('#login-email-error').text('Enter email').show();
    ok = false;
  }
  
  if (!password) {
    $('#login-password-error').text('Enter password').show();
    ok = false;
  }
  
  if (!ok) return;
  
  // Check users
  const users = JSON.parse(localStorage.getItem('gamenova_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Save current user
    localStorage.setItem('gamenova_user', JSON.stringify({
      name: user.name,
      email: user.email,
      time: new Date().toISOString()
    }));
    
    // Show success
    showPopup('Welcome back!', 'Login successful');
    
    // Go to store
    setTimeout(function() {
      window.location.href = 'index.html';
    }, 1500);
    
  } else {
    $('#login-password-error').text('Wrong email or password').show();
  }
}

function signup() {
  const name = $('#signup-name').val().trim();
  const email = $('#signup-email').val().trim();
  const password = $('#signup-password').val().trim();
  const confirm = $('#signup-confirm').val().trim();
  
  // Clear errors
  $('#signup-form .error').hide();
  
  // Check inputs
  let ok = true;
  
  if (!name) {
    $('#signup-name-error').text('Enter name').show();
    ok = false;
  }
  
  if (!email) {
    $('#signup-email-error').text('Enter email').show();
    ok = false;
  }
  
  if (!password) {
    $('#signup-password-error').text('Enter password').show();
    ok = false;
  } else if (password.length < 6) {
    $('#signup-password-error').text('Password too short (6+ chars)').show();
    ok = false;
  }
  
  if (password !== confirm) {
    $('#signup-confirm-error').text('Passwords do not match').show();
    ok = false;
  }
  
  if (!ok) return;
  
  // Check if email exists
  const users = JSON.parse(localStorage.getItem('gamenova_users') || '[]');
  const emailExists = users.some(u => u.email === email);
  
  if (emailExists) {
    $('#signup-email-error').text('Email already registered').show();
    return;
  }
  
  // Create user
  const newUser = {
    name: name,
    email: email,
    password: password,
    created: new Date().toISOString()
  };
  
  // Save user
  users.push(newUser);
  localStorage.setItem('gamenova_users', JSON.stringify(users));
  
  // Login automatically
  localStorage.setItem('gamenova_user', JSON.stringify({
    name: name,
    email: email,
    time: new Date().toISOString()
  }));
  
  // Show success
  showPopup('Welcome ' + name + '!', 'Account created');
  
  // Go to store
  setTimeout(function() {
    window.location.href = 'index.html';
  }, 1500);
}

function setupPopup() {
  // Close button
  $('#popup-close').click(function() {
    $('#popup').hide();
  });
  
  // Close on click outside
  $('#popup').click(function(e) {
    if (e.target === this) {
      $(this).hide();
    }
  });
}

function showPopup(title, text) {
  $('#popup-title').text(title);
  $('#popup-text').text(text);
  $('#popup').show();
}