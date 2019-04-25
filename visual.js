function loadData() {
  return d3.json('out.json').then(groupData);
  // return d3.json('by_college_3.json').then(groupData);
}

function groupData(data) {
  let collegeNames = [];
  for (let d of data) {
    collegeNames.push(d['College']);
    d['total'] = d['Major']['Total'];
    delete d['Major']['Total'];
  }
  colorScale = d3.scaleOrdinal()
    .range(d3.schemeCategory10)
    .domain(collegeNames);
  console.log(data);
  return data;
}


function showData(data) {
  let width = overviewConfig.width;
  let height = overviewConfig.height;
  let config = overviewConfig;
  let helperLineVertical;
  let helperLineHorizontal;

  function showTooltip(college, coords) {
    d3.select('#tooltip')
      .text(`College of ${college}`)
      .style('top', `${coords[1] - 50}px`)
      .style('left', `${coords[0] + 50}px`)
      .style('display', 'block');
  }

  function showLineChart(data) {
    function draw(datum, college) {
      let number = datum['total'];

      let line = d3.line()
          .x(d => xScale(d['Fall']))
          .y(d => yScale(d['Total']));
      lineChart.append('path')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
        .datum(number)
        .attr('d', line)
        .attr('class', 'line')
        .style('fill', 'none')
        .style('stroke-width', '2px')
        .style('stroke', () => colorScale(college))
        .on('mouseover', function () {
          this.style['stroke-width'] = '4px';
        })
        .on('mouseout', function () {
          this.style['stroke-width'] = '2px';
        })
        .on('mouseenter', function (d) {
          showTooltip(datum['College'], [d3.event.clientX, d3.event.clientY]);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip')
            .style('display', 'none')
        })
        .on('click', () => {
          showDetailed(college, datum['Major'], detailConfig);
        })
        .on('blur', () => {
          d3.select('#svg-container')
            .style('visibility', 'hidden');
          d3.select('#college-name').text("Detailed")
        });
    }

    for (let d of data) {
      draw(d, d['College']);
    }
  }


  function showHelperLine(config) {
    helperLineVertical = overview.append('g')
      .attr('transform', `translate(${config.margin.left},0)`)
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', 'red')
      .attr('stroke-width', '2px');
    helperLineHorizontal = overview.append('g')
      .attr('transform', `translate(0,${config.margin.top})`)
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', 'red')
      .attr('stroke-width', '2px');
  }

  function addBrush(config) {
    let brush = d3.brushY()
        .extent([[0, 0], [config.bodyWidth, config.bodyHeight]])
        .on('end', () => {
          let extent = d3.event.selection;
          if (extent) {
            tempYScale.domain([tempYScale.invert(extent[1]), tempYScale.invert(extent[0])]);
            overview.select('.brush').call(brush.move, null);
          }
          yAxGroup
            .transition()
            .call(d3.axisLeft(tempYScale));
          lineChart.selectAll('.line')
            .transition()
            .attr('d', d3.line()
                  .x(d => xScale(d['Fall']))
                  .y(d => tempYScale(+d['Total'])));
        });
    overview.append('g')
      .attr('class', 'brush')
      .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`)
      .call(brush);
  }

  // Make the x and y label
  overview.append('text')
    .attr('transform', `translate(${width / 2},${config.bodyHeight + config.margin.top + config.margin.bot})`)
    .style("text-anchor", "middle")
    .text('Year');
  overview.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -config.bodyHeight / 2)
    .attr('y', 5)
    .attr('dy', '1em')
    .style("text-anchor", "middle")
    .text('Number of Students Enrolled');

  // showHelperLine(config);     // Depleted now

  overview.append("defs").append("svg:clipPath")  // Make sure all the lines be inside the svg
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", config.bodyWidth)
    .attr("height", config.bodyHeight)
    .attr("x", config.margin.left)
    .attr("y", config.margin.top);

  overview.on('dblclick', () => {
    tempYScale = yScale.copy();
    yAx.scale(yScale);
    yAxGroup.transition()
      .call(yAx);
    let line = d3.line()
        .x(d => xScale(d['Fall']))
        .y(d => yScale(d['Total']));
    lineChart.selectAll('.line')
      .transition()
      .attr('d', line);
  });

  let xScale = d3.scaleLinear()
      .domain([1980, 2018])
      .range([0, config.bodyWidth]);
  let yScale = d3.scaleLinear()
      .domain([0, 18000])
      .range([config.bodyHeight, 0]);
  let tempYScale = yScale.copy(); //This is for db-click to zoom back

  let yAx = d3.axisLeft(yScale);

  let tickNumber;
  if (+config.bodyWidth > 350) {
    tickNumber = 13;
  } else {
    tickNumber = 8;
  }
  overview.append('g')    // Call x axis
    .style('transform', `translate(${config.margin.left}px,${config.bodyHeight + config.margin.top}px)`)
    .call(
      d3.axisBottom(xScale)
        .tickFormat(d3.format('Y'))
        .ticks(tickNumber)
    );
  let yAxGroup = overview.append('g')
      .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
      .call(yAx);
  addBrush(config);
  console.log(data);
  let lineChart = overview        // Put it here to make sure I can interact with this
      .append('g')
      .attr('id', 'lineChart')
      .attr('clip-path', 'url(#clip)');
  showLineChart(data);
}

function showDetailed(college, data, config) {
  renderStreamGraph(college, data, config)
}

let colorScale;  // A color scale for beautiful colors

// Left part(college overview) config settings
let overview = d3.select("#left");
let width = $("#colleges > .visu").width();
let height = $("#colleges > .visu").height();
let margin = {
  top: 10,
  bot: 40,
  left: 65,
  right: 15
};
let overviewConfig = {
  margin: margin,
  bodyWidth: width - margin.left - margin.right,
  bodyHeight: height - margin.top - margin.bot,
  width: width,
  height: height
};
overview.attr('width', width)
  .attr('height', height);

// Right part(major details) config settings
let detail = d3.select("#right");
width = $("#majors > .visu").width();
height = $("#majors > .visu").height();
margin = {
  top: 10,
  bot: 60,
  left: 65,
  right: 65
};
let detailConfig = {
  margin: margin,
  bodyWidth: width - margin.left - margin.right,
  bodyHeight: height - margin.top - margin.bot,
  width: width,
  height: height
};
detail.attr('width', width)
  .attr('height', height);

let tooltip = d3.select('#tooltip')
    .style('display', 'none');
$(loadData().then(d => {
  console.log(d);
  showData(d);
}));
