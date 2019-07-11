// Constants
const PAGINATE_BY = 2;

function classifyStorage(workouts) {
  const newWorkouts = [];
  workouts.forEach((workout) => {
    const newExercises = []

    workout.exercises.forEach((exercise) => {
      const newSets = []

      exercise.sets.forEach((set) => {
        newSets.push(new ExerciseSet(set.weight, set.reps, set.amrap));
      });

      newExercises.push(new Exercise(exercise.name, newSets));
    });

    newWorkouts.push(new Workout(workout.date, workout.type, newExercises));
  });

  return newWorkouts;
}

function getWorkouts(page = 1) {
  const workouts = JSON.parse(
    localStorage.getItem('workouts'),
  ).slice((page - 1) * PAGINATE_BY, (page - 1) * PAGINATE_BY + PAGINATE_BY);

  return classifyStorage(workouts);
}

function populateWorkoutHistory() {
  const url = new URL(window.location);
  const page = url.searchParams.get('page') || 1;
  const workouts = getWorkouts(page);

  workouts.forEach((workout) => {
    document.getElementById('workout-list').appendChild(workout.html());
  });
}

populateWorkoutHistory();