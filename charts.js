class HistoryChart {
  constructor(exercises) {
    this.exercises = exercises;
  }

  draw() {
    this.margin = {
      top: 20, right: 80, bottom: 30, left: 50,
    };

    this.width = document.getElementById('charts-container').clientWidth - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
    this.svg = d3.select('#charts-container').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const flatExercises = this.exercises.map(x => x.exercises)
    const flatWeights = flatExercises.reduce(
      (acc, curr) => [
        ...acc,
        ...curr.map(set => set.weight),
      ],
      [],
    );

    const flatDates = flatExercises.reduce(
      (acc, curr) => [
        ...acc,
        ...curr.map(set => set.date),
      ],
      [],
    );

    const g = this.svg.selectAll('g')
      .data(this.exercises);

    this.legend = g.enter()
      .append('g')
      .attr('class', 'legend')
      .style('fill', '#FFFFFF');

    this.legend.append('rect')
      .attr('x', this.width - 50)
      .attr('y', (d, i) => i * 20)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', d => d.color);

    this.legend.append('text')
      .attr('x', this.width - 28)
      .attr('y', (d, i) => i * 20 + 9)
      .text(d => d.name);

    this.x.domain(d3.extent(flatDates));
    this.y.domain([0, d3.max(flatWeights)]);

    this.line = d3.line()
      .x((d) => {
        return this.x(d.date);
      })
      .y((d) => {
        return this.y(d.weight);
      })
      .curve(d3.curveCatmullRom.alpha(0.9));

    this.paths = g.enter()
      .append('path')
      .attr('class', 'line')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 3)
      .attr('d', d => this.line(d.exercises));

    this.xAxis = d3.axisBottom()
      .scale(this.x);

    this.yAxis = d3.axisLeft()
      .scale(this.y);

    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(this.xAxis);

    this.svg.append('g')
      .call(this.yAxis);

    this.dots = g.enter().selectAll('circle')
      .data(d => d.exercises)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('cx', d => this.x(d.date))
      .attr('cy', d => this.y(d.weight))
      .style('fill', d => d.color);
  }
}

function mapWorkoutsForChart(workouts) {
  const colors = d3.schemeCategory10;
  let i = 0;
  const exercises = workouts.reduce(
    (acc, curr) => {
      curr.exercises.forEach((ex) => {
        const exercise = {
          date: curr.date,
          weight: Math.min(...ex.sets.map(set => set.weight)),
        };

        const thisExercise = acc.find(x => x.name === ex.name);
        if (thisExercise) {
          exercise.color = thisExercise.color;
          thisExercise.exercises = [...thisExercise.exercises, exercise];
        } else {
          exercise.color = colors[i % colors.length];
          acc = [
            ...acc,
            {
              name: ex.name,
              color: colors[i % colors.length],
              exercises: [exercise],
            },
          ];
          i += 1;
        }
      });

      return acc;
    },
    [],
  );

  exercises.forEach((ex) => {
    ex.exercises.sort((a, b) => a.date - b.date);
  });

  return exercises;
}

function createCharts() {
  const workouts = getWorkouts();
  const exercises = mapWorkoutsForChart(workouts);
  const chart = new HistoryChart(exercises);
  chart.draw();
}
