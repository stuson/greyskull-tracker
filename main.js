// Constants
const PAGINATE_BY = 10;

class WorkoutElement {
  constructor(data) {
    Object.assign(this, data);
  }

  html() {
    const container = document.createElement('div');
    container.className = 'workout';

    const title = document.createElement('h4');
    title.innerHTML = `${new Date(this.date).toLocaleDateString('en-GB')} <small>${this.type}</small>`;
    container.appendChild(title);

    const exerciseList = document.createElement('ul');
    exerciseList.className = 'exercise-list row';

    this.exercises.forEach((exercise) => {
      const element = document.createElement('li');
      element.className = 'exercise three columns';
      element.innerHTML = `<strong>${exercise.name}</strong>`;

      const sets = document.createElement('ol');
      sets.className = 'set-list';
      exercise.sets.forEach((set) => {
        const el = document.createElement('li');
        el.innerText = `${set.weight}kg - ${set.reps}`;
        sets.appendChild(el);
      });

      element.appendChild(sets);
      exerciseList.appendChild(element);
    });

    container.appendChild(exerciseList);
    return container;
  }
}

function populateWorkoutHistory() {
  const url = new URL(window.location);
  const page = url.searchParams.get('page') || 1;
  const workouts = JSON.parse(
    localStorage.getItem('workouts'),
  ).slice((page - 1) * PAGINATE_BY, PAGINATE_BY);

  workouts.forEach((workout) => {
    const workoutElement = new WorkoutElement(workout);
    document.getElementById('workout-list').appendChild(workoutElement.html());
  });
}


populateWorkoutHistory();