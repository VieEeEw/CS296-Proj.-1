function loadData() {
    return d3.json('by_college_3.json').then(d => groupData(d["children"]));
}

function groupData(data) {
    return data;
}

function showHelperLine(config) {
    let helperLineVertical = overview.append('g')
        .attr('transform', `translate(${config.margin.left},0)`)
        .append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', 'red')
        .attr('stroke-width', '2px');
    let helperLineHorizontal = overview.append('g')
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
        .on('end', d => {       // FIXME

        });
    overview.append('g')
        .attr('class', 'brush')
        .attr('transform', `translate(${config.margin.left}, ${config.margin.top})`)
        .call(brush);
    overview.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", config.width)
        .attr("height", config.height)
        .attr("x", config.margin.left)
        .attr("y", config.margin.top);
    let lineChart = overview
        .append('g')
        .attr('id', 'lineChart')
        .attr('clip-path', 'url(#clip)');
}

function showLineChart(data) {
    for (let d of data)
        draw(d['count'], d['Name']);
}
function draw(number, college) {
    let
}

function showData(data) {
    let width = overviewConfig.width;
    let height = overviewConfig.height;
    let config = overviewConfig;
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

    showHelperLine(config);

    let xScale = d3.scaleLinear()
        .domain([1980, 2018])
        .range([0, config.bodyWidth]);
    let yScale = d3.scaleLinear()
        .domain([0, 18000])
        .range([config.height, 0]);
    let tempYScale = yScale.copy(); //This is for db-click to zoom back

    let yAx = d3.axisLeft(yScale);

    overview.append('g')    // Call x axis
        .style('transform', `translate(${config.margin.left}px,${config.height + config.margin.top}px)`)
        .call(
            d3.axisBottom(xScale)
                .tickFormat(d3.format('Y'))
                .ticks(19)
        );
    let yAxGroup = overview.append('g')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
        .call(yAx);

    showLineChart(data);
}

let colorScale = d3.scaleOrdinal()  // A color scale for beautiful colors
    .range(d3.schemeCategory10)
    .domain(Object.keys(data));
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
    bot: 40,
    left: 65,
    right: 15
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
console.log(detailConfig);

$(loadData().then(d => {
    console.log(d);
    showData(d);
}));