function drawOverView(data) {
    let width = Math.floor(this.innerWidth / 2) - 50;
    let height = this.innerHeight - 175;
    let margin = {
        top: 10,
        bot: 50,
        left: 20,
        right: 5
    };
    let config = {
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bot,
        margin: margin
    };
}

function showData(data) {
    let overviewData = Object.keys(data)
        .map(d => {

        });
    drawOverView(overviewData);
    let overview = d3.select('#Left')
        .attr('width', width)
        .attr('height', height);
    let yScale = d3.scaleLinear()
        .domain([25000, d3.max(data, d => d.number)])
        .range([0, config.width]);

    let xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, config.height])
        .padding(0.2);
    let body = overview
        .append('g')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`);
    body.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('height', yScale.bandwidth)
        .attr('y', d => yScale(d.year))
        .attr('width', d => xScale(d.number))
        .attr('fill', '#2a5599');
    let xAx = d3.axisBottom(xScale)
        .ticks(5);
    //  .tickValues([])
    let yAx = d3.axisLeft(yScale);
    overview
        .append('g')
        .style('transform', `translate(${config.margin.left}px,${config.height + config.margin.top}px)`)
        .call(xAx);
    overview
        .append('g')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
        .call(yAx);
}




function groupByCollege(data) {
    return data.reduce((accumulator, d) => {
        let college = d.College;
        let year = d.Year;
        let crtData = accumulator[college] || {};
        crtData[year] = d;
        accumulator[college] = crtData;
        return accumulator;
    }, {});
}

function loadData() {
    return d3.csv("cleaned.csv").then(d => {
        console.log(d[0]);
        return groupByCollege(d);
    });
}

$(loadData().then(d => {
    console.log(d);
    showData(d);
}));
