(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      emailjs.sendForm('service_3lz61dk', 'template_hwpdata', this)
        .then(function() {
          document.getElementById('form-status').textContent = "Message sent successfully!";
          form.reset();
        }, function(error) {
          document.getElementById('form-status').textContent = "Failed to send message. Try again later.";
        });
    });
  }
})();
