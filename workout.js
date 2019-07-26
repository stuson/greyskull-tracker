class Workout {
  constructor(date, type, exercises, id) {
    this.date = date;
    this.type = type.toUpperCase();
    this.exercises = exercises;
    this.id = id;
  }

  html() {
    const container = document.createElement('div');
    container.className = 'workout';

    const head = document.createElement('div');
    head.className = 'workout-header';

    const title = document.createElement('h4');
    title.innerHTML = `${new Date(this.date).toLocaleDateString('en-GB')} <small>${this.type}</small>`;
    head.appendChild(title);

    const btn = document.createElement('button');
    btn.className = 'button-delete button-warn';
    btn.innerText = 'Delete';
    btn.dataset.workoutId = this.id;
    btn.setAttribute('onclick', 'confirmDeleteWorkout(this)');
    head.appendChild(btn);

    container.appendChild(head);

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

class Exercise {
  constructor(name, sets) {
    this.name = name;
    this.sets = sets;
  }

  html() {
    const element = document.createElement('li');
    element.className = 'exercise three columns';
    element.innerHTML = `<strong>${this.name}</strong>`;

    const sets = document.createElement('ol');
    sets.className = 'set-list';
    this.sets.forEach((set) => {
      sets.appendChild(set.html());
    });
  }

  getDisplayName() {
    return `${this.name[0].toUpperCase()}${this.name.slice(1)}`;
  }
}

class ExerciseSet {
  constructor(weight, reps, amrap) {
    this.weight = weight;
    this.reps = reps;
    this.amrap = amrap;
  }

  html() {
    const el = document.createElement('li');
    el.innerText = `${this.weight}kg - ${this.reps}`;
    return el;
  }
}

const setMap = {
  bench: { sets: 3, reps: 5, amrap: true },
  'overhead press': { sets: 3, reps: 5, amrap: true },
  squat: { sets: 3, reps: 5, amrap: true },
  row: { sets: 3, reps: 5, amrap: true },
  'supinating curl': { sets: 3, reps: 10, amrap: false },
  deadlift: { sets: 1, reps: 5, amrap: true },
  'closegrip bench': { sets: 3, reps: 10, amrap: false },
  'lateral raises': { sets: 3, reps: 10, amrap: false },
  'hammer curl': { sets: 3, reps: 10, amrap: false },
};

function getPreviousExerciseInstanceWorkout(exerciseName, workoutHistory) {
  return workoutHistory.find(
    workout => workout.exercises.some(exercise => exercise.name === exerciseName),
  );
}

function getPreviousExerciseInstance(exerciseName, workoutHistory) {
  return workoutHistory
    .reduce((acc, curr) => acc.concat(curr.exercises), [])
    .find(ex => ex.name === exerciseName);
}

function getDefaultWorkout(type) {
  const workoutType = type.slice(0, 1);
  const workoutVariant = type.slice(1);

  let exercises;

  if (workoutType === 'A') {
    exercises = ['', 'squat', 'row', 'supinating curl'];
  } else if (workoutType === 'B') {
    exercises = ['', 'deadlift', 'closegrip bench', 'lateral raises'];
  } else if (workoutType === 'C') {
    exercises = ['', 'squat', 'row', 'hammer curl'];
  }

  if (workoutVariant === '1') {
    exercises[0] = 'bench';
  } else if (workoutVariant === '2') {
    exercises[0] = 'overhead press';
  }

  const defaultExercises = []
  exercises.forEach((exercise) => {
    defaultExercises.push(
      new Exercise(exercise, getDefaultSets(exercise))
    );
  });

  const workouts = getWorkouts();
  return new Workout(new Date(), type, defaultExercises, getMaxWorkoutId(workouts) + 1);
}

function getNextWeight(previousInstance, map) {
  const minWeight = previousInstance
    .sets
    .reduce((acc, curr) => Math.min(acc, curr.weight), Infinity);

  // TODO: More complicated nextWeight calculation
  const nextWeight = minWeight + 2.5 * previousInstance.sets.reduce(
    (acc, curr) => {
      return acc && curr.reps >= map.reps;
    },
    true,
  );

  return nextWeight;
}

function getDefaultSets(exercise) {
  const workoutHistory = getWorkouts();
  const previousInstance = getPreviousExerciseInstance(exercise, workoutHistory);
  const map = setMap[exercise];
  const sets = [];

  if (previousInstance) {
    const nextWeight = getNextWeight(previousInstance, map);
    for (let i = 0; i < map.sets; i += 1) {
      sets.push(
        new ExerciseSet(nextWeight, map.reps, i === (map.sets - 1) && map.amrap),
      );
    }
  } else {
    for (let i = 0; i < map.sets; i += 1) {
      sets.push(
        new ExerciseSet(null, map.reps, i === (map.sets - 1) && map.amrap),
      );
    }
  }

  return sets;
}
