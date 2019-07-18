function setDefaultDate() {
  const date = new Date();
  document.getElementById('day').value = date.getDate();
  document.getElementById('month').value = date.getMonth() + 1;
  document.getElementById('year').value = date.getFullYear();
}

function setLastWorkout(lastWorkout) {
  document.getElementById('previous-type').innerText = `(Previous - ${lastWorkout.type})`;
}

function checkDeadlift() {
  Array.from(document.getElementsByClassName('exercise-input')).forEach((exerciseInputElement) => {
    if (exerciseInputElement.value === 'Deadlift') {
      const unusedSets = Array
        .from(exerciseInputElement.parentElement.parentElement.children)
        .slice(2);

      unusedSets.forEach((unusedSet) => {
        Array.from(unusedSet.getElementsByTagName('input')).forEach((inputElement) => {
          inputElement.value = null;
          inputElement.setAttribute('disabled', true);
          if (inputElement.type === 'checkbox') {
            inputElement.checked = false;
          } else {

            document.getElementsByName(`previous-${inputElement.name}`)[0].innerText = null;
          }
        });
      });

      exerciseInputElement
        .parentElement
        .nextElementSibling
        .getElementsByClassName('amrap-input')[0]
        .checked = true;
    } else {
      const allSets = exerciseInputElement.parentElement.parentElement.children;
      Array.from(allSets).forEach((setElement) => {
        Array.from(setElement.getElementsByTagName('input'))
          .forEach(el => el.removeAttribute('disabled'));
      });
    }
  });
}

function populateDefaultExercises(workouts) {
  const type = document.getElementById('workout-type').value;
  const defaultWorkout = getDefaultWorkout(type);

  defaultWorkout.exercises.forEach((exercise, i) => {
    const lastWorkoutInstance = getPreviousExerciseInstanceWorkout(exercise.name, workouts);
    const lastExerciseInstance = getPreviousExerciseInstance(exercise.name, workouts);

    document.getElementsByName(`exercise-${i}`)[0].value = exercise.getDisplayName();

    if (lastWorkoutInstance) {
      document.getElementsByName(`previous-date-${i}`)[0].innerText = `Previous: ${lastWorkoutInstance.date.toISOString().slice(0, 10)}`;
    } else {
      document.getElementsByName(`previous-date-${i}`)[0].innerText = 'Previous: Never';
    }

    exercise.sets.forEach((set, j) => {
      document.getElementsByName(`weight-${i}-${j}`)[0].value = set.weight;
      document.getElementsByName(`reps-${i}-${j}`)[0].value = set.reps;
      document.getElementsByName(`amrap-${i}-${j}`)[0].checked = set.amrap;

      if (lastExerciseInstance) {
        document.getElementsByName(`previous-weight-${i}-${j}`)[0].innerText = `${lastExerciseInstance.sets[j].weight}kg`;
        document.getElementsByName(`previous-reps-${i}-${j}`)[0].innerText = lastExerciseInstance.sets[j].reps;
      } else {
        document.getElementsByName(`previous-weight-${i}-${j}`)[0].innerText = null;
        document.getElementsByName(`previous-reps-${i}-${j}`)[0].innerText = null;
      }
    });
  });

  checkDeadlift();
}

function workoutTypeChanged() {
  const workouts = getWorkouts();
  populateDefaultExercises(workouts);
}

function exerciseNameChanged(input) {
  const name = input.value.toLowerCase();
  const workouts = getWorkouts();
  const exerciseRow = Number(input.name.slice(-1));

  const lastWorkoutInstance = getPreviousExerciseInstanceWorkout(name, workouts);
  const lastExerciseInstance = getPreviousExerciseInstance(name, workouts);

  const map = setMap[name];
  const nextWeight = map ? getNextWeight(lastExerciseInstance, map) : null;
  const reps = map ? map.reps : null;
  const amrap = map ? map.amrap : null;

  if (lastWorkoutInstance) {
    document.getElementsByName(`previous-date-${exerciseRow}`)[0].innerText = `Previous: ${lastWorkoutInstance.date.slice(0, 10)}`;
  } else {
    document.getElementsByName(`previous-date-${exerciseRow}`)[0].innerText = null;
  }

  if (lastExerciseInstance) {
    lastExerciseInstance.sets.forEach((set, j) => {
      document.getElementsByName(`weight-${exerciseRow}-${j}`)[0].value = nextWeight;
      document.getElementsByName(`reps-${exerciseRow}-${j}`)[0].value = reps;
      document.getElementsByName(`amrap-${exerciseRow}-${j}`)[0].checked = false;

      document.getElementsByName(`previous-weight-${exerciseRow}-${j}`)[0].innerText = `${set.weight}kg`;
      document.getElementsByName(`previous-reps-${exerciseRow}-${j}`)[0].innerText = set.reps;
    });

    document.getElementsByName(`weight-${exerciseRow}-2`)[0].setAttribute('data-amrap', amrap);
    document.getElementsByName(`reps-${exerciseRow}-2`)[0].setAttribute('data-amrap', amrap);
  } else {
    for (let j = 0; j < 3; j += 1) {
      document.getElementsByName(`weight-${exerciseRow}-${j}`)[0].value = null;
      document.getElementsByName(`reps-${exerciseRow}-${j}`)[0].value = null;
      document.getElementsByName(`amrap-${exerciseRow}-${j}`)[0].checked = false;

      document.getElementsByName(`previous-weight-${exerciseRow}-${j}`)[0].innerText = null;
      document.getElementsByName(`previous-reps-${exerciseRow}-${j}`)[0].innerText = null;
    }
  }

  checkDeadlift();
}

function setupNew() {
  const workouts = getWorkouts();
  const lastWorkout = workouts[0];

  setDefaultDate();
  setLastWorkout(lastWorkout);
  populateDefaultExercises(workouts);
}

function submitWorkout() {
  const date = new Date(
    document.getElementById('year').value,
    document.getElementById('month').value - 1,
    document.getElementById('day').value,
  );
  const type = document.getElementById('workout-type').value;
  const exerciseRows = document.getElementsByClassName('exercise-row');

  const exercises = [];
  Array.from(exerciseRows).forEach((exerciseRow, i) => {
    const sets = [];
    for (let j = 0; j < 3; j += 1) {
      const weightInput = document.getElementsByName(`weight-${i}-${j}`)[0];
      const repsInput = document.getElementsByName(`reps-${i}-${j}`)[0];
      const amrapInput = document.getElementsByName(`amrap-${i}-${j}`)[0];
      if (!weightInput.disabled && !repsInput.disabled && !amrapInput.disabled) {
        sets.push(new ExerciseSet(weightInput.value, repsInput.value, amrapInput.checked));
      }
    }

    const exerciseName = exerciseRow.getElementsByClassName('exercise-input')[0].value;
    exercises.push(new Exercise(exerciseName, sets));
  });

  const workout = new Workout(date, type, exercises);
  let workouts = getWorkouts();
  let done = false;

  workouts = workouts.reduce((acc, curr) => {
    if (!done && curr.date < workout.date) {
      done = true;
      return acc.concat(workout, curr);
    }
    return acc.concat(curr);
  }, []);

  if (!done) {
    workouts.push(workout);
  }

  console.log(workouts);
}
