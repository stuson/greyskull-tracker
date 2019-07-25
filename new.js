function setDefaultDate() {
  const date = new Date();
  document.getElementById('day').value = date.getDate();
  document.getElementById('month').value = date.getMonth() + 1;
  document.getElementById('year').value = date.getFullYear();
}

function setLastWorkout(lastWorkout) {
  if (lastWorkout) {
    document.getElementById('previous-type').innerText = `(Previous - ${lastWorkout.type})`;
  } else {
    document.getElementById('previous-type').innerText = 'Previous - Never';
  }
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
  const nextWeight = map && lastExerciseInstance ? getNextWeight(lastExerciseInstance, map) : null;
  const reps = map ? map.reps : null;
  const amrap = map ? map.amrap : null;

  if (lastWorkoutInstance) {
    document.getElementsByName(`previous-date-${exerciseRow}`)[0].innerText = `Previous: ${lastWorkoutInstance.date.toISOString().slice(0, 10)}`;
  } else {
    document.getElementsByName(`previous-date-${exerciseRow}`)[0].innerText = 'Previous: Never';
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

function addExercise() {
  const rowNum = 1 + Math.max(
    ...Array.from(document.getElementsByClassName('exercise-input'))
      .map(el => Number(el.name.slice(-1))),
  );

  function createExerciseNameInputSection() {
    const section = document.createElement('div');
    section.className = 'three columns';

    const label = document.createElement('label');
    label.innerText = 'Exercise';
    section.appendChild(label);

    const exerciseInput = document.createElement('input');
    exerciseInput.className = 'exercise-input';
    exerciseInput.name = `exercise-${rowNum}`;
    exerciseInput.type = 'text';
    exerciseInput.setAttribute('list', 'exercises');
    exerciseInput.setAttribute('onchange', 'exerciseNameChanged(this)');
    section.appendChild(exerciseInput);

    return section;
  }

  function createSetsSection(i) {
    const section = document.createElement('div');
    section.className = 'three columns';

    const label = document.createElement('label');
    label.innerText = 'Set 1';
    section.appendChild(label);

    const label2 = document.createElement('label');
    label2.className = 'amrap-label';
    label2.innerText = 'AMRAP';
    section.appendChild(label2);

    const amrapInput = document.createElement('input');
    amrapInput.name = `amrap-${rowNum}-${i}`;
    amrapInput.className = 'amrap-input';
    amrapInput.type = 'checkbox';
    section.appendChild(amrapInput);

    const br = document.createElement('br');
    section.appendChild(br);

    const weightInput = document.createElement('input');
    weightInput.name = `weight-${rowNum}-${i}`;
    weightInput.type = 'number';
    weightInput.className = 'input-sm';
    weightInput.placeholder = 'kg';
    section.appendChild(weightInput);

    const repsInput = document.createElement('input');
    repsInput.name = `reps-${rowNum}-${i}`;
    repsInput.type = 'number';
    repsInput.className = 'input-sm';
    repsInput.placeholder = 'reps';
    section.appendChild(repsInput);

    return section;
  }

  function createExerciseRow() {
    const row = document.createElement('div');
    row.className = 'row exercise-row';

    const exerciseNameInputSection = createExerciseNameInputSection();
    row.appendChild(exerciseNameInputSection);

    for (let i = 0; i < 3; i += 1) {
      row.appendChild(createSetsSection(i));
    }

    return row;
  }

  function createPreviousDateSection() {
    const section = document.createElement('div');
    section.className = 'three columns previous-date-container';

    const span = document.createElement('span');
    span.setAttribute('name', `previous-date-${rowNum}`);
    span.className = 'previous-date';
    section.appendChild(span);

    return section;
  }

  function createPreviousSetsSection(i) {
    const section = document.createElement('div');
    section.className = 'three columns';

    const set = document.createElement('div');
    set.className = 'previous-set';

    const weight = document.createElement('span');
    weight.setAttribute('name', `previous-weight-${rowNum}-${i}`);
    weight.className = 'previous-set-weight';
    set.appendChild(weight);

    const reps = document.createElement('span');
    reps.setAttribute('name', `previous-reps-${rowNum}-${i}`);
    reps.className = 'previous-set-reps';
    set.appendChild(reps);

    section.appendChild(set);

    return section;
  }

  function createPreviousExerciseRow() {
    const row = document.createElement('div');
    row.className = 'row previous-exercise';

    const previousDateSection = createPreviousDateSection();
    row.appendChild(previousDateSection);

    for (let i = 0; i < 3; i += 1) {
      row.appendChild(createPreviousSetsSection(i));
    }

    return row;
  }

  const frag = document.createDocumentFragment();

  const row = createExerciseRow();
  frag.appendChild(row);

  const previousRow = createPreviousExerciseRow();
  frag.appendChild(previousRow);

  document
    .getElementById('new-workout-container')
    .insertBefore(frag, document.getElementById('first-button'));
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

  let workouts = getWorkouts();
  const workout = new Workout(date, type, exercises, getMaxWorkoutId(workouts) + 1);
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

  localStorage.setItem('workouts', JSON.stringify(workouts));
  window.location = 'index.html';
}
