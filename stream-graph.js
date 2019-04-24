
function renderStreamGraph(collegeName, rawdata, width, height, margin) {
  d32.csv('/stream-graph/data.csv', chart)

  function chart(data) {
    let datearray = []
    let colorrange = ['#045A8D', '#2B8CBE', '#74A9CF', '#A6BDDB', '#D0D1E6', '#F1EEF6']
    let strokecolor = colorrange[0]

    let format = d32.time.format('%y')
    let tooltip = d32.select('body')
        .append('div')
        .attr('class', 'remove')
        .style('position', 'absolute')
        .style('z-index', '20')
        .style('visibility', 'hidden')
        .style('top', '30px')
        .style('left', '55px')

    let x = d32.time.scale()
        .range([0, width])

    let y = d32.scale.linear()
        .range([height-10, 0])

    let z = d32.scale.ordinal()
        .range(colorrange)

    let xAxis = d32.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(d32.time.years)

    let yAxis = d32.svg.axis()
        .scale(y)

    let yAxisr = d32.svg.axis()
        .scale(y)

    let stack = d32.layout.stack()
        .offset('silhouette')
        .values(function(d) { return d.values })
        .x(function(d) { return d.date })
        .y(function(d) { return d.value })

    let nest = d32.nest()
        .key(function(d) { return d.key })

    let area = d32.svg.area()
        .interpolate('cardinal')
        .x(function(d) { return x(d.date) })
        .y0(function(d) { return y(d.y0) })
        .y1(function(d) { return y(d.y0 + d.y) })

    let svg = d32.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    data.forEach(function(d) {
      d.date = format.parse(d.date)
      d.value = +d.value
    })
    let layers = stack(nest.entries(data))

    x.domain(d32.extent(data, function(d) { return d.date }))
    y.domain([0, d32.max(data, function(d) { return d.y0 + d.y })])

    svg.selectAll('.layer')
      .data(layers)
      .enter().append('path')
      .attr('class', 'layer')
      .attr('d', function(d) {
        return area(d.values)
      })
      .style('fill', function(d, i) { return z(i) })

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)

    svg.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + width + ', 0)')
      .call(yAxis.orient('right'))

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis.orient('left'))

    svg.selectAll('.layer')
      .attr('opacity', 1)
      .on('mouseover', function(d, i) {
        svg.selectAll('.layer').transition()
          .duration(250)
          .attr('opacity', function(d, j) {
            return j != i ? 0.6 : 1
          })})

      .on('mousemove', function(d, i) {
        mousex = d32.mouse(this)
        mousex = mousex[0]
        let invertedx = x.invert(mousex)
        invertedx = invertedx.getMonth() + invertedx.getDate()
        let selected = (d.values)
        for (let k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].date
          datearray[k] = datearray[k].getMonth() + datearray[k].getDate()
        }

        mousedate = datearray.indexOf(invertedx)
        pro = d.values[mousedate].value

        d32.select(this)
          .classed('hover', true)
          .attr('stroke', strokecolor)
          .attr('stroke-width', '0.5px'),
        tooltip.html( '<p>' + d.key + '<br>' + pro + '</p>' ).style('visibility', 'visible')

      })
      .on('mouseout', function(d, i) {
        svg.selectAll('.layer')
          .transition()
          .duration(250)
          .attr('opacity', '1')
        d32.select(this)
          .classed('hover', false)
          .attr('stroke-width', '0px'), tooltip.html( '<p>' + d.key + '<br>' + pro + '</p>' ).style('visibility', 'hidden')
      })

    let vertical = d32.select('#chart')
        .append('div')
        .attr('class', 'remove')
        .style('position', 'absolute')
        .style('z-index', '19')
        .style('width', '1px')
        .style('height', '380px')
        .style('top', '10px')
        .style('bottom', '30px')
        .style('left', '0px')
        .style('background', '#fff')

    d32.select('#chart')
      .on('mousemove', function(){
        mousex = d32.mouse(this)
        mousex = mousex[0] + 5
        vertical.style('left', mousex + 'px' )})
      .on('mouseover', function(){
        mousex = d32.mouse(this)
        mousex = mousex[0] + 5
        vertical.style('left', mousex + 'px')})
  }
}

renderStreamGraph(null, null, 800, 400, { left: 20, right: 20, top: 20, bottom: 20 })
