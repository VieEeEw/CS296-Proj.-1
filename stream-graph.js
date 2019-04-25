
function renderStreamGraph(collegeName, rawdata, config) {
  d32.select('#chart').html('')
  d32.select('#chart-tooltip').html('')

  let data = []
  let margin = config.margin
  let width = config.width
  let height = config.height

  for (let key in rawdata) {
    rawdata[key].map(function (yearObj) {
      data.push({
        key: key,
        date: yearObj.Fall.toString(),
        value: yearObj.Total
      })
    })
  }

  chart(data)

  function chart(data) {
    let datearray = []
    let colorrange = [
      '#13294b',
      '#DAEAFA'
    ]
    let strokecolor = colorrange[0]

    let tooltip = d32.select('#chart-tooltip')
        .append('div')
        .attr('class', 'remove')
        .style('position', 'relative')
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
        .attr('height', height + margin.top + margin.bot)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    data.forEach(function(d) {
      d.date = new Date(d.date)
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
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(90)")
      .style("text-anchor", "start");

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
        invertedx = invertedx.getYear()
        let selected = d.values
        for (let k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].date.getYear()
        }

        mousedate = datearray.indexOf(invertedx)
        pro = d.values[mousedate].value

        d32.select(this)
          .classed('hover', true)
          .attr('stroke', strokecolor)
          .attr('stroke-width', '0.5px'),
        tooltip.html('<p class="tooltip">' + d.key + '<br>' + pro + '</p>' ).style('visibility', 'visible')
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
  }
}
