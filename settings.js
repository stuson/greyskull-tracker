function exportWorkouts() {
  let workouts = localStorage.getItem('workouts');

  if (!workouts) {
    workouts = [];
    localStorage.setItem('workouts', workouts);
  }

  const b64 = btoa(workouts);
  const textElement = document.getElementById('workout-data');

  textElement.value = b64;
  textElement.select();
  document.execCommand('copy');

  showMessage(document.getElementById('copied-alert'));
}

function importWorkouts() {
  const textElement = document.getElementById('workout-data');
  const b64 = textElement.value;

  let workouts = '';
  try {
    workouts = atob(b64);
  } catch (e) {
    showMessage(document.getElementById('imported-error-alert'));
    throw (e);
  }

  if (workouts) {
    try {
      JSON.parse(workouts);
    } catch (e) {
      showMessage(document.getElementById('imported-error-alert'));
      throw (e);
    }
    localStorage.setItem('workouts', workouts);
    showMessage(document.getElementById('imported-alert'));
  }
}

function showMessage(messageElement) {
  messageElement.classList.remove('fading-out');
  messageElement.classList.add('fading-in');
  setTimeout(hideMessage.bind(null, messageElement), 2000);
}

function hideMessage(messageElement) {
  messageElement.classList.remove('fading-in');
  messageElement.classList.add('fading-out');
}