// Constants
const PAGINATE_BY = 2;

function classifyStorage(workouts) {
  const newWorkouts = [];
  workouts.forEach((workout) => {
    const newExercises = [];

    workout.exercises.forEach((exercise) => {
      const newSets = [];

      exercise.sets.forEach((set) => {
        newSets.push(new ExerciseSet(set.weight, set.reps, set.amrap));
      });

      newExercises.push(new Exercise(exercise.name, newSets));
    });

    newWorkouts.push(new Workout(workout.date, workout.type, newExercises));
  });

  return newWorkouts;
}

function getWorkouts(page) {
  let workouts = JSON.parse(
    localStorage.getItem('workouts'),
  );

  if (!workouts) {
    workouts = [];
    localStorage.setItem('workouts', workouts);
  }

  if (page) {
    workouts = workouts.slice((page - 1) * PAGINATE_BY, (page - 1) * PAGINATE_BY + PAGINATE_BY);
  }

  workouts = workouts.reduce((acc, curr) => {
    curr.date = new Date(curr.date);
    return acc.concat(curr);
  }, []);

  return classifyStorage(workouts);
}

function populateWorkoutHistory() {
  const url = new URL(window.location);
  const page = Number(url.searchParams.get('page')) || 1;
  const workouts = getWorkouts(page);

  workouts.forEach((workout) => {
    document.getElementById('workout-list').appendChild(workout.html());
  });

  const pagination = getPagination(page, workouts);
  document.body.appendChild(pagination);
}

function getPagination(page) {
  const workouts = getWorkouts();
  const minPage = Math.max(page - 2, 1);
  const totalPages = Math.ceil(workouts.length / PAGINATE_BY);
  const maxPage = Math.min(page + 2, totalPages);

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  if (page > 1) {
    const prev = document.createElement('a');
    prev.className = 'pagination-button';
    prev.href = `index.html?page=${page - 1}`;
    prev.innerText = '<';
    pagination.appendChild(prev);
  }

  for (let i = minPage; i <= maxPage; i += 1) {
    const a = document.createElement('a');
    a.className = `pagination-button ${i === page ? 'active' : ''}`;
    a.href = `index.html?page=${i}`;
    a.innerText = i;
    pagination.appendChild(a);
  }

  if (page < totalPages) {
    const next = document.createElement('a');
    next.className = 'pagination-button';
    next.href = `index.html?page=${page + 1}`;
    next.innerText = '>';
    pagination.appendChild(next);
  }

  return pagination;
}
