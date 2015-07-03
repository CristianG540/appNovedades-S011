$(document).ready(function () {
  $('#login_form').validate();
  $('#sign_up_form').validate({
    rules: {
      username: {
        required: true,
        maxlength: 20,
        minlength: 5
      },
      password_confirmation: {
        equalTo: '#password'
      }
    }
  });
  $('#profile_settings_form').validate({
    rules: {
      password_confirmation: {
        equalTo: '#password'
      }
    }
  });
  $('#reset_pass_form').validate({
    rules: {
      confirm: {
        equalTo: '#password'
      }
    }
  });
});
