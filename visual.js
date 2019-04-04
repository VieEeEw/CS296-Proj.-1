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
        .ticks(19);
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
                this.style['stroke-width'] = '4px'
            })
            .on('mouseout', function () {
                this.style['stroke-width'] = '2px'
            })
            .on('mouseenter', function (d) {
                showTooltip(d[0]['College'], [d3.event.clientX, d3.event.clientY], this)
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                    .style('display', 'none')
            })
            .on('click', () => {
                showDetailed(college);
            })
        // Depleted on blur
        // .on('blur', () => {
        //     d3.select('#detailed').style('visibility', 'hidden')
        // });
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

function showDetailed(clg) {
    d3.select('#college-name').text(`College of ${clg}`);
    d3.select('#detailed').style('visibility', 'visible');
    window.drawSlopeGraph(clg);
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


let width = Math.floor(window.innerWidth / 2) - 50;
let height = window.innerHeight - 175;
console.log(width);
console.log(height);
let margin = {
    top: 10,
    bot: 40,
    left: 60,
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
let detailedWidth = width;
let detailedHeight = height;
d3.select('#detailed')
    .attr('width', detailedWidth)
    .attr('height', height);
let colorScale;



// Slope credit to Ajay
(function () {
    let margin = {top: 50, right: 150, bottom: 40, left: 150};

    d3.select('#svg-container').attr('width', detailedWidth)
        .attr('height', detailedHeight);

    let width = detailedWidth - margin.left - margin.right,
        height = detailedHeight - margin.top - margin.bottom;

    let config = {
        xOffset: 0,
        yOffset: 0,
        width: width,
        height: height,
        labelPositioning: {
            alpha: 1.0,
            spacing: 18
        },
        leftTitle: "1980",
        rightTitle: "2018",
        labelGroupOffset: 5,
        labelKeyOffset: 50,
        radius: 6,
        unfocusOpacity: 0.2
    }

    window.drawSlopeGraph = (college) => {
        let url = '/296proj/data_by_college.json';

        d3.select('#slopegraph-svg').remove()

        let svg = d3
            .select("#svg-container")
            .append('svg')
            .attr('id', 'slopegraph-svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        let y1 = d3.scaleLinear()
            .range([height, 0]);

        d3.json(url).then((data) => {
            data = data[college]

            console.log(data);

            // Combine totals into a single array
            let totals = [];
            for (let key in data['1980'][0]) {
                let total = data['1980'][0][key].Total
                let obj = {
                    'Major Name': key,
                    year: '1980',
                    Total: Math.trunc((total / data['1980'][1]) * 1000) / 10
                }
                totals.push(obj)
            }
            for (let key in data['2018'][0]) {
                let total = data['2018'][0][key].Total
                let obj = {
                    'Major Name': key,
                    year: '2018',
                    Total: Math.trunc((total / data['2018'][1]) * 1000) / 10
                }
                totals.push(obj)
            }

            // for debugging
            window.totals = totals

            // Nest by major name
            totals = d3.nest()
                .key(function (d) {
                    return d['Major Name']
                })
                .entries(totals);
            totals = totals.filter(function (d) {
                return d.values.length > 1;
            });

            // find min and max based on totals
            let y1Min = d3.min(totals, function (d) {
                return Math.min(d.values[0].Total, d.values[1].Total)
            });
            let y1Max = d3.max(totals, function (d) {
                return Math.max(d.values[0].Total, d.values[1].Total)
            });

            // Calculate y domain for totals
            y1.domain([y1Min, y1Max]);

            let yScale = y1;

            let voronoi = d3.voronoi()
                .x(d => d.year == "1980" ? 0 : width)
                .y(d => yScale(d.Total))
                .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

            let borderLines = svg.append("g")
                .attr("class", "border-lines")
            borderLines.append("line")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", 0).attr("y2", config.height);
            borderLines.append("line")
                .attr("x1", width).attr("y1", 0)
                .attr("x2", width).attr("y2", config.height);

            let slopeGroups = svg.append("g")
                .selectAll("g")
                .data(totals)
                .enter().append("g")
                .attr("class", "slope-group")
                .attr("id", function (d, i) {
                    d.id = "group" + i;
                    d.values[0].group = this;
                    d.values[1].group = this;
                });

            let slopeLines = slopeGroups.append("line")
                .attr("class", "slope-line")
                .attr("x1", 0)
                .attr("y1", function (d) {
                    return y1(d.values[0].Total);
                })
                .attr("x2", config.width)
                .attr("y2", function (d) {
                    return y1(d.values[1].Total);
                });

            let leftSlopeCircle = slopeGroups.append("circle")
                .attr("r", config.radius)
                .attr("cy", d => y1(d.values[0].Total));

            let leftSlopeLabels = slopeGroups.append("g")
                .attr("class", "slope-label-left")
                .each(function (d) {
                    d.xLeftPosition = -config.labelGroupOffset;
                    d.yLeftPosition = y1(d.values[0].Total);
                });

            leftSlopeLabels.append("text")
                .attr("x", d => d.xLeftPosition)
                .attr("y", d => d.yLeftPosition)
                .attr("dx", -10)
                .attr("dy", 3)
                .attr("text-anchor", "end")
                .text(d => d.values[0].Total + ' ' + d.key);

            let rightSlopeCircle = slopeGroups.append("circle")
                .attr("r", config.radius)
                .attr("cx", config.width)
                .attr("cy", d => y1(d.values[1].Total));

            let rightSlopeLabels = slopeGroups.append("g")
                .attr("class", "slope-label-right")
                .each(function (d) {
                    d.xRightPosition = width + config.labelGroupOffset;
                    d.yRightPosition = y1(d.values[1].Total);
                });

            rightSlopeLabels.append("text")
                .attr("x", d => d.xRightPosition)
                .attr("y", d => d.yRightPosition)
                .attr("dx", 10)
                .attr("dy", 3)
                .attr("text-anchor", "start")
                .text(d => d.values[1].Total + ' ' + d.key);

            let titles = svg.append("g")
                .attr("class", "slopegraph-title");

            titles.append("text")
                .attr("text-anchor", "end")
                .attr("dx", -10)
                .attr("dy", -margin.top / 2)
                .text(config.leftTitle);

            titles.append("text")
                .attr("x", config.width)
                .attr("dx", 10)
                .attr("dy", -margin.top / 2)
                .text(config.rightTitle);

            // relax(leftSlopeLabels, "yLeftPosition");
            leftSlopeLabels.selectAll("text")
                .attr("y", d => d.yLeftPosition);

            // relax(rightSlopeLabels, "yRightPosition");
            rightSlopeLabels.selectAll("text")
                .attr("y", d => d.yRightPosition);

            d3.selectAll(".slope-group")
                .attr("opacity", config.unfocusOpacity);

            let voronoiGroup = svg.append("g")
                .attr("class", "voronoi");

            voronoiGroup.selectAll("path")
                .data(voronoi.polygons(d3.merge(totals.map(d => d.values))))
                .enter().append("path")
                .attr("d", function (d) {
                    return d ? "M" + d.join("L") + "Z" : null;
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        });
    };

    function mouseover(d) {
        d3.select(d.data.group).attr("opacity", 1)
    }

    function mouseout(d) {
        d3.selectAll(".slope-group")
            .attr("opacity", config.unfocusOpacity);
    }
})();

$(loadData().then(d => {
    console.log(d);
    d3.select('.x-label')
        .style('transform', `translate()`);
    showData(d);
}));
