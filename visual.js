function showData(data) {
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
    let xScale = d3.scaleLinear()
        .domain([1980, 2018])
        .range([0, config.width]);
    let yScale = d3.scaleLinear()
        .domain([0, 18000])
        .range([config.height, 0]);
    let originY = yScale.copy();
    let xAx = d3.axisBottom(xScale)
        .tickFormat(d3.format('Y'))
        .ticks(39);
    let yAx = d3.axisLeft(yScale);
    let xAxGroup = overview
        .append('g')
        .style('transform', `translate(${config.margin.left}px,${config.height + config.margin.top}px)`)
        .call(xAx);
    let yAxGroup = overview
        .append('g')
        .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
        .call(yAx);
    colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)
        .domain(Object.keys(data));
    let brush = d3.brushY()
        .extent([[0, 0], [config.width, config.height]])
        .on('end', brushEnd);
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
    drawOverViewLines(data);
    // Depleted zoom
    let zoom = d3.zoom()
        .scaleExtent([1, 200])
        .translateExtent([[config.margin.left, config.margin.right], [config.margin.left + config.width, config.height]])
        .extent([[config.margin.left, config.margin.right], [config.margin.left + config.width, config.height]])
        .on('zoom', function () {
                let newYScaleZoom = d3.event.transform.rescaleY(yScale);
                let yu = Math.min(newYScaleZoom.domain()[1], 18000);
                let yl = Math.max(0, newYScaleZoom.domain()[0]);
                // let yl = Math.
                newYScaleZoom.domain([yl, yu]);
                newYScale = newYScaleZoom.copy();
                yAx.scale(newYScaleZoom);
                yAxGroup.transition()
                    .call(yAx);

                let line = d3.line()
                    .x(d => xScale(d['Year']))
                    .y(d => newYScaleZoom(d['Total']));
                lineChart.selectAll('.line')
                    .transition()
                    .attr('d', line)
            }
        );

    overview.on('dblclick', d => {
        // console.log('inevent');
        yAx.scale(yScale);
        yAxGroup.transition()
            .call(yAx);
        let line = d3.line()
            .x(d => xScale(d['Year']))
            .y(d => originY(d['Total']));
        lineChart.selectAll('.line')
            .transition()
            .attr('d', line);
        yScale = originY.copy();
        newYScale = originY.copy();
        })
        .on('mousemove', function () {
            let x = d3.mouse(this)[0];
            let y = d3.mouse(this)[1];
            helperLineVertical.attr('transform', `translate(${x - config.margin.left},0)`);
            helperLineHorizontal.attr('transform', `translate(0,${y - config.margin.top})`);
        });

    let idleTimeout;

    function idled() {
        idleTimeout = null;
    }

    let newYScale;

    function brushEnd(data) {
        let extent = d3.event.selection;
        // console.log(extent);
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
            // xScale.domain()
        } else {
            // console.log('second');
            newYScale = newYScale || yScale.copy();
            newYScale.domain([newYScale.invert(extent[1]), newYScale.invert(extent[0])]);
            console.log(newYScale.domain());
            overview.select('.brush').call(brush.move, null);
        }
        // console.log(newYScale.domain());
        yAxGroup
            .transition()
            .call(d3.axisLeft(newYScale));

        lineChart.selectAll('.line')
            .transition()
            .attr('d', d3.line()
                .x(d => xScale(d['Year']))
                .y(d => newYScale(+d['Total'])));
    }

    // overview.call(zoom);


    function drawOverViewLines(data) {
        for (let d of Object.keys(data)) drawOverViewLineSub(d, data[d]);
    }

    function drawOverViewLineSub(college, data) {
        let line = d3.line()
            .x(d => xScale(d['Year']))
            .y(d => yScale(d['Total']));
        lineChart
            .append('path')
            .style('transform', `translate(${config.margin.left}px,${config.margin.top}px)`)
            // .style('transform', `translate(${config.margin.left}px,0px)`)
            .datum(data)
            .attr('d', line)
            .attr('class', 'line')
            .style('stroke', d => colorScale(college))
            .on('mouseover', function () {
                this.style['stroke-width'] = '8px'
            })
            .on('mouseout', function () {
                this.style['stroke-width'] = '4px'
            })
            .on('mouseenter', function (d) {
                showTooltip(d[0]['College'], [d3.event.clientX, d3.event.clientY], this)
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                    .style('display', 'none')
            })
            .on('click', showDetailed)
            .on('blur', () => {
                d3.select('#detailed').style('visibility', 'hidden')
            });
    }

    function showTooltip(clg, coords, client) {
        // let year = coords[0] - config.margin.left;
        // console.log(year);
        // let y = xScale(Math.round(year));
        // console.log(y);
        d3.select('#tooltip').text(`College of ${clg}`)
            .style('top', `${coords[1] - 50}px`)
            .style('left', `${coords[0] + 50}px`)
            .style('display', 'block');
    }


}

function showDetailed(data) {
    console.log(data);
    d3.select('#detailed').style('visibility', 'visible');
}


function groupByCollege(data) {
    return data.reduce((accumulator, d) => {
        let college = d.College;
        let crtData = accumulator[college] || [];
        crtData.push(d);
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


let width = Math.floor(2 * window.innerWidth / 3) - 50;
let height = window.innerHeight - 175;
console.log(width);
console.log(height);
let margin = {
    top: 10,
    bot: 30,
    left: 40,
    right: 15
};
let config = {
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bot,
    margin: margin
};
let overview = d3.select('#Left')
    .attr('width', width)
    .attr('height', height);
let detailed = d3.select('#Right')
    .attr('width', width / 2)
    .attr('height', height);
let colorScale;
$(loadData().then(d => {
    console.log(d);

    showData(d);
}));