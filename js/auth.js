$(document).ready(function() {

  $('#year').text(new Date().getFullYear());
  
  setupTabs();
  
  setupForms();
});

function setupTabs() {
 
  $('.tab-btn').click(function() {
    const formType = $(this).data('form');
    showForm(formType);
  });
  
  $('.switch-text a').click(function(e) {
    e.preventDefault();
    const formType = $(this).data('form');
    showForm(formType);
  });
}

function showForm(formType) {

  $('.auth-form').removeClass('active');
  
  $('.tab-btn').removeClass('active');
  
  $('#' + formType + '-form').addClass('active');
  
  $('[data-form="' + formType + '"]').addClass('active');
  
  $('.error').hide();
  $('.error').text('');
}

function setupForms() {

  $('#loginForm').submit(function(e) {
    e.preventDefault();
    login();
  });
  
  $('#signupForm').submit(function(e) {
    e.preventDefault();
    signup();
  });
}

function login() {
  const email = $('#login-email').val().trim();
  const password = $('#login-password').val().trim();
  
  $('#login-form .error').hide();
  
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
  
  const users = JSON.parse(localStorage.getItem('gamenova_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    localStorage.setItem('gamenova_user', JSON.stringify({
      name: user.name,
      email: user.email,
      time: new Date().toISOString()
    }));
    
    window.location.href = 'index.html';
    
  } else {
    $('#login-password-error').text('Wrong email or password').show();
  }
}

function signup() {
  const name = $('#signup-name').val().trim();
  const email = $('#signup-email').val().trim();
  const password = $('#signup-password').val().trim();
  const confirm = $('#signup-confirm').val().trim();
  
  $('#signup-form .error').hide();
  
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
  
  const users = JSON.parse(localStorage.getItem('gamenova_users') || '[]');
  const emailExists = users.some(u => u.email === email);
  
  if (emailExists) {
    $('#signup-email-error').text('Email already registered').show();
    return;
  }
  
  const newUser = {
    name: name,
    email: email,
    password: password,
    created: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('gamenova_users', JSON.stringify(users));

  localStorage.setItem('gamenova_user', JSON.stringify({
    name: name,
    email: email,
    time: new Date().toISOString()
  }));
  
  window.location.href = 'index.html';
}