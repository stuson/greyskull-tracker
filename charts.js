class HistoryChart {
  constructor(exercises) {
    this.exercises = exercises;
  }

  draw() {
    const flatExercises = this.exercises.map(x => x.exercises);
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

    this.margin = {
      top: 20, right: 80, bottom: 30, left: 50,
    };
    this.legendMargin = {
      top: 10, right: 80, bottom: 10, left: 50,
    };

    this.width = document.getElementById('charts-container').clientWidth - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;

    this.x = d3.scaleTime().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    const maxDate = new Date(Math.max(...flatDates));
    const thirtyDaysAgo = new Date(maxDate - 1000 * 60 * 60 * 24 * 30)
    const minDate = new Date(Math.max(Math.min(...flatDates), thirtyDaysAgo));
    this.x.domain([minDate, maxDate]);
    this.y.domain([0, d3.max(flatWeights) + 10]);

    this.legendSvg = d3.select('#charts-container').append('svg')
      .attr('width', this.width + this.legendMargin.left + this.legendMargin.right)
      .attr('height', Math.floor(this.exercises.length * 140 / this.width) * 20 + this.legendMargin.top + this.legendMargin.bottom)
      .append('g')
      .attr('transform', `translate(${this.legendMargin.left}, ${this.legendMargin.top})`);

    this.svg = d3.select('#charts-container').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .call(
        d3.zoom()
          .scaleExtent([0.02, 3.2])
          .translateExtent([[this.x(minDate) - this.width * 3, 0], [this.x(maxDate) + this.width * 3, 0]])
          .on('zoom', (_) => {
            const newX = d3.event.transform.rescaleX(this.x);
            const newLine = d3.line()
              .x((d) => {
                return newX(d.date);
              })
              .y((d) => {
                return this.y(d.weight);
              })
              .curve(d3.curveCatmullRom.alpha(0.9));
            this.svg.selectAll('circle').attr('cx', d => newX(d.date));
            this.paths.attr('d', d => newLine(d.exercises));
            this.svg.select('#xAxis').call(this.xAxis.scale(newX));
            this.xAxis
              .ticks(d3.timeDay.every(Math.ceil(1 / d3.event.transform.k)))
              .tickFormat((d, i) => i % Math.ceil(1600 / (d3.event.transform.k * this.width)) === 0 ? d.toLocaleDateString('en-GB') : '');
          }),
      )
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    const lg = this.legendSvg.selectAll('g')
      .data(this.exercises);

    const g = this.svg.selectAll('g')
      .data(this.exercises);

    this.legend = lg.enter()
      .append('g')
      .attr('class', 'legend')
      .style('fill', '#FFFFFF');

    this.legend.append('rect')
      .attr('x', (d, i) => (i * 140) % (140 * Math.round(this.width / 140)))
      .attr('y', (d, i) => Math.floor(i * 140 / this.width) * 20 - this.legendMargin.top)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', d => d.color);

    this.legend.append('text')
      .attr('x', (d, i) => (i * 140 + 20) % (140 * Math.round(this.width / 140)))
      .attr('y', (d, i) => 10 + Math.floor(i * 140 / this.width) * 20 - this.legendMargin.top)
      .text(d => d.name);

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
      .scale(this.x)
      .ticks(d3.timeDay.every(1))
      .tickSizeInner(-this.height, 0)
      .tickFormat((d, i) => i % Math.ceil(1600 / this.width) === 0 ? d.toLocaleDateString('en-GB') : '');

    this.yAxis = d3.axisLeft()
      .scale(this.y);

    this.svg.append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .attr('id', 'xAxis')
      .call(this.xAxis);

    this.svg.append('g')
      .call(this.yAxis);

    this.dots = g.enter().selectAll('circle')
      .data(d => d.exercises)
      .enter()
      .append('circle')
      .attr('r', 6)
      .attr('cx', d => this.x(d.date))
      .attr('cy', d => this.y(d.weight))
      .style('fill', d => d.color);

    this.clip = this.svg.append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.width)
      .attr('height', this.height);
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

function redrawChart(chart) {
  const svgs = document.getElementsByTagName('svg');
  Array.from(svgs).forEach(svg => svg.remove());
  chart.draw()
}

function createCharts() {
  const workouts = getWorkouts();
  const exercises = mapWorkoutsForChart(workouts);
  const chart = new HistoryChart(exercises);
  chart.draw();

  window.addEventListener('resize', redrawChart.bind(null, chart));
}
