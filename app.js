function finalProject(){
    var filePath="data/data.csv";
    vis0(filePath);
    vis1(filePath);
    vis2(filePath);
    vis3(filePath);
    vis4(filePath);
    vis5(filePath);
}

var vis0=function(filePath){
    //Add analysis by appending span
    d3.select('#intro_analysis').append('span').text("In the following visualizations, I will be analyzing traffic stops in the state of California made available by the Stanford Open Policing Project. Since there are too many data entries to smoothly render on an average computer, I only used the records in the month of January 2016. Even that was relatively large, so I took a random subsample of the data to end with a little over 50,000 entries. Conveniently all of the data I needed was available in this dataset, so I just needed to clean a few columns such as the date, which I did in my JavaScript file.");

    d3.csv(filePath).then(function(data){
        console.log(data)
    });
}



var vis1=function(filePath){
    //Add analysis by appending span
    d3.select('#vis1_analysis').append('span').text("In this scatter plot, we can see the relationship between driver age and the date of the month, with each point representing one (or more) police incident(s). Since age and date are both integers, we have many data points which map to the exact same position, even after filtering for only stops made in the city of San Diego. To counteract potential information loss, I added a slider below the visualization that increments the minimum count of data points required at a coordinate to display the point, which is set to a default value of 1. This also allows us to better see patterns in the data, as setting the slider to 2 or 3 reduces the noise of outlier data points. This reveals an interesting but perhaps not so surprising trend—there is a cyclic correlation between drivers being pulled over and the day of the week. January 1, 2016 happens to be a Friday, which is the start of the weekend, which tends to have fewer police incidents than during the weekdays, when incidents peak. There is both a lower maximum and higher minimum age during the weekends, so the observed cyclical pattern could simply be due to lower police activity or fewer drivers on the road rather than ages directly correlating with the days of the week.");
    //d3.select('#vis1_analysis2').append('span').text("I simply chose a color that would display well over my background, and I didn't use multiple colors since this plot has 0 keys and 2 values. This visualization uses points as marks and its channel is encoded as horizontal and vertical position. As mentioned earlier, I implemented a slider to help the user visualize the density of points in specific regions.");

    d3.csv(filePath).then(function(data){
        //Define svg dimensions
        const svgwidth = 1000;
        const svgheight = 600;
        const left = 80;
        const bottom = 80;
        const right = 50;
        const top = 40;
        const height = svgheight - bottom - top;
        const width = svgwidth - left - right;
        const padding = 25;

        //Initialize svg
        let svg = d3.select("#no_keys_2_values")
            .append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight)
            .append("g").attr("transform", "translate(" + left + "," + top + ")");

        //Get dates from date objects
        const cleanedData = data.map(d => {
            const dayString = d.stop_date.split('-')[2];
            const dayFloat = parseFloat(dayString);
            return { ...d, day: dayFloat };
            });
        
        //Filter and clean data
        let san_diego = cleanedData.filter(d => d.location_raw == "San Diego");
        let raw_counts = d3.rollup(san_diego, v => { return { day: d3.max(v, d => d.day), age: d3.max(v, d => d.driver_age), count: v.length}; }, d => d.day, d => d.driver_age);

        //Get counts for each 
        let sd_counts = [];
        raw_counts.forEach(function(subMap) {
            subMap.forEach(function(value) {
                sd_counts.push(value);
            });
        });
        console.log(sd_counts);

        //Set up dynamic scaling
        let xScale = d3.scaleLinear()
            .domain([1, d3.max(sd_counts, d => d.day)])
            .range([5, width]);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(sd_counts, d => d.age)])
            .range([height, 0]);

        //Set up axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom((xScale)).ticks(31))
            .selectAll("text")
            .attr("font-size", "11")
            .attr("dx", "-5")
            .attr("dy", "15")
            .attr("transform", "rotate(-20)");
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10));

        //Bind scatter plot to svg
        svg.selectAll('.scatter').data(sd_counts).enter().append("circle")
            .attr('class', 'scatter')
            .attr("cx", function(d, i) { return xScale(d.day); })
            .attr("cy", function(d, i) { return yScale(d.age); })
            .attr("r", 3)
            .style('fill', 'salmon');

        //Create functionality of slider
        var slider = d3.select('#slider_vis1')
            .attr('id', 'vis1').on("input", function (d) {
                //Get current data for slider input
                min_val = d.target.value; 
                min_counts = sd_counts.filter(d => d.count >= min_val);

                //Remove all previous elements
                svg.selectAll('.scatter').remove();

                //Update scatterplot elements
                svg.selectAll('.scatter').data(min_counts).enter().append("circle")
                    .attr('class', 'scatter')
                    .attr("cx", function(d, i) { return xScale(d.day); })
                    .attr("cy", function(d, i) { return yScale(d.age); })
                    .attr("r", 3)
                    .style('fill', 'salmon');
                
                //Update the value display
                d3.select("#slider_value").text(`Minimum count of incidents: ${min_val}`);
                });   
        
        // Set the initial value of the slider display
        d3.select("#slider_value").text('Drag to filter minimum incident count');
                
        //Add visualization title and axis titles
        let titles = [
            {title: "Traffic Incidents in San Diego by Age and Date in January 2016"}, 
            {xaxis: "Date of Month of January"}, 
            {yaxis: "Driver Age"}];
        svg.selectAll(".title").data(titles).enter().append("text")
            .attr("class", "title")
            .attr("x", svgwidth / 10)
            .attr("y", -top / 2)
            .attr("font-size", 28)
            .attr("font-family", "Open Sans")
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(titles).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2 - 95)
            .attr("y", height + bottom - padding / 2)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(titles).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -left + padding)
            .text(function(d) { return d.yaxis; });
    });
}



var vis2=function(filePath){
    //Add analysis by appending span
    d3.select('#vis2_analysis').append('span').text("In this visualization, we now plot the count of a specific category of violations against the date. We are no longer plotting individual points, so I included every city available on top of San Diego. Since my main motive was to analyze if there was a correlation between DUI incidents and New Years, I wanted to be able to clearly separate the categories. To accommodate this feature, I added checkboxes allowing us to select violations from specific categories we only want to see, or even combine them for more complex interactions and analysis. This visualization clearly and effectively captures my main motive of analyzing DUI patterns, as the graph peaks on January 1st as expected. However, as we recall from earlier it was a weekend, but even then we can see that it is still significantly more frequent than on the average weekend, and the incidents start tapering off around the third weekend of the year. This is an effective visualization showing the increased risks of driving around New Years, as twice the DUIs are reported compared to the average weekend and almost 4 times that of the typical weekday.");
    //d3.select('#vis2_analysis2').append('span').text("Again, I chose my color scheme to create an aesthetically pleasing soft pastel theme, as there was no specific motivation for certain colors. This visualization uses points and lines as marks, which are encoded through the horizontal/vertical position and tilt channels. The points of the graph clearly show the counts of incidents for a certain day, and the tilt of the line connecting them creates a slope which visually communicates the change in incidents between days.");

    d3.csv(filePath).then(function(data){
        //Define svg dimensions
        const svgwidth = 1000;
        const svgheight = 700;
        const left = 80;
        const bottom = 80;
        const right = 50;
        const top = 80;
        const height = svgheight - bottom - top;
        const width = svgwidth - left - right;
        const padding = 25;

        //Initialize svg
        let svg = d3.select("#one_key_1_value")
            .append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight)
            .append("g").attr("transform", "translate(" + left + "," + top + ")");
        
        //Get dates from date objects
        const cleanedData = data.map(d => {
            const dayString = d.stop_date.split('-')[2];
            const dayFloat = parseFloat(dayString);
            return { ...d, day: dayFloat };
            });
        
        //Filter and format data
        let raw_counts = d3.rollup(cleanedData, v => v.length, d => d.day, d => d.violation);
        let dayCounts = [];
        for (let [day, subMap] of raw_counts) {
            let entry = {}
            entry['day'] = day;
            for (let [gender, count] of subMap) {
                entry[gender] = count;
            }
            dayCounts.push(entry);
        }
        dayCounts.sort((a, b) => a.day - b.day);
        console.log(dayCounts)

        //Set up dynamic scaling
        let xScale = d3.scaleLinear()
            .domain(d3.extent(dayCounts, d => d.day))
            .range([5, width]);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(dayCounts, d => d.DUI)])
            .range([height, 0]);

        //Set up axes
        let xAxis = d3.axisBottom(xScale).ticks(31);
        let yAxis = d3.axisLeft(yScale);
        svg.append("g")
            .attr("class","xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("font-size", "11")
            .attr("dx", "-5")
            .attr("dy", "15")
            .attr("transform", "rotate(-20)");
        svg.append("g")
            .attr("class","yAxis")
            .call(yAxis);

        //Add streamgraph plot to svg
        let area = svg.selectAll("area").data([dayCounts]).enter().append("path")
            .style("fill", 'lightgreen')
            .attr("d", d3.area()
                .x(function(d, i)  { return xScale(d.day); })
                .y0(function(d, i) { return yScale(0); })
                .y1(function(d, i) { return yScale(d.DUI); }));

        //Create checked box functionality
        d3.select("#misc").on("change", updateSvg);
        d3.select("#moving").on("change", updateSvg);
        d3.select("#equip").on("change", updateSvg);
        d3.select("#dui").on("change", updateSvg);

        //Create update function
        function updateSvg() {
            //Get the state of the boxes
            let miscChecked = d3.select("#misc").property("checked");
            let movingChecked = d3.select("#moving").property("checked");
            let equipChecked = d3.select("#equip").property("checked");
            let duiChecked = d3.select("#dui").property("checked");
        
            // Update the data used by the selectAll method based on the box state
            let newData = [];
            dayCounts.forEach(function(subMap) {
                let count = 0;
                if (miscChecked) { count += subMap['Other']; }
                if (movingChecked) { count += subMap['Moving violation']; }
                if (equipChecked) { count += subMap['Equipment']; }
                if (duiChecked) { count += subMap['DUI']; }
                newData.push({"day": subMap['day'], "count": count});
            });

            let yScale = d3.scaleLinear()
                .domain([0, d3.max(newData, d => d.count)])
                .range([height, 0]);
            yAxis = d3.axisLeft(yScale);

            //Call transition on axes
            d3.selectAll("g.yAxis")
                .transition()
                .duration(2000)
                .call(yAxis);

            //Update streamgraph plot with new data
            area.data([newData]).transition().duration(2000)
                .attr("d", d3.area()
                    .x(function(d, i)  { return xScale(d.day); })
                    .y0(function(d, i) { return yScale(0); })
                    .y1(function(d, i) { return yScale(d.count); }));
        }
        
        //Add visualization title and axis titles
        let titles = [
            {title: "Traffic Incidents by Category and Date in January 2016"}, 
            {xaxis: "Date of Month of January"}, 
            {yaxis: "Incident Count"}];
        svg.selectAll(".title").data(titles).enter().append("text")
            .attr("class", "title")
            .attr("x", svgwidth / 8)
            .attr("y", -30)
            .attr("font-size", 28)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(titles).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2 - 3 * padding)
            .attr("y", height + bottom - padding / 2)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(titles).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2 - 2 * padding)
            .attr("y", -left + padding)
            .text(function(d) { return d.yaxis; });
    });
}



var vis3=function(filePath){
    //Add analysis by appending span
    d3.select('#vis3_analysis').append('span').text("After being able to play around with the categories, we can see them side to side in the format of a bar plot. This graph is more intuitive to read, showing the counts of incidents in the month of January against the specific category of violation. I also stacked the bars by gender, showing the proportion of the incidents that were attributed to males and females. While it may initially seem like men are clearly worse and more reckless drivers, it would be unfair to jump to conclusions from this chart since they may also contribute to the majority of individuals on the road. Without a more complete analysis, it would be hard to tell.");
    //d3.select('#vis3_analysis2').append('span').text("For this plot, I used an intuitive color scheme to represent the genders, with blue representing males and pink females, while using agreeable shades to stay consistent with the pastel color theme. The bars could be represented as point marks, which are encoded through the vertical position channel, and I used a color channel to differentiate between the genders. Finally, I included a tooltip so that users can see the exact counts and proportions of incidents belonging to either gender.");

    d3.csv(filePath).then(function(data){
        //Define svg dimensions
        const svgwidth = 800;
        const svgheight = 600;
        const left = 80;
        const bottom = 80;
        const right = 50;
        const top = 60;
        const height = svgheight - bottom - top;
        const width = svgwidth - left - right;
        const padding = 25;

        //Initialize svg
        let svg = d3.select("#two_keys_1_value")
            .append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight)
            .append("g").attr("transform", "translate(" + left + "," + top + ")");
        
        //Filter and format data
        let raw_counts = d3.rollup(data, v => v.length, d => d.violation, d => d.driver_gender);
        let res = [];
        for (let [violation, subMap] of raw_counts) {
            let entry = {}
            entry['violation'] = violation;
            for (let [gender, count] of subMap) {
                entry[gender] = count;
            }
            res.push(entry);
        }

        //Stack data
        const key = ['M', 'F'];
        const stack = d3.stack().keys(key);
        const stackedData = stack(res);
        console.log(stackedData);

        //Set up dynamic scaling
        let xScale = d3.scaleBand()
            .domain(raw_counts.keys())
            .range([0, width])
            .padding(0.1);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(raw_counts, d => d3.sum(d[1].values()))])
            .range([height, 0]);

        //Set up axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", 14)
            .call(d3.axisBottom(xScale));
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10));
        
        //Initialize color map
        let color = d3.scaleOrdinal()
            .domain(['M', 'F'])
            .range(['lightblue', 'pink']);
        
        //Initialize tooltip
        let Tooltip = d3.select("#two_keys_1_value").append("div").style("opacity", 0).attr("class", "tooltip");

        //Add stacked bar plot to svg while implementing tooltip
        svg.selectAll('.bar').data(stackedData).enter()
            .append('g').attr('class', 'bar')
            .style('fill', function(d, i) { return color(d.key); })
            .selectAll('rect').data(function(d, i) { return d; }).enter().append('rect')
            .attr('x', function(d, i) { return xScale(d.data.violation); })
            .attr('y', function(d, i) { return yScale(d[1]); })
            .attr('height', function(d, i) { return yScale(d[0]) - yScale(d[1]); })
            .attr('width', xScale.bandwidth())
            .on("mouseover", function (e, d) {
                let total = d.data['M'] + d.data['F'];
                let proportion = (d[1] - d[0]) / total;
                Tooltip.transition().duration(200).style("opacity", 0.9);
                Tooltip.html(`Total Incidents: ${d[1] - d[0]} <br> Gender proportion: ${proportion.toFixed(2)}`)
                    .style("left", e.pageX-100)
                    .style("top", e.pageY-45);
            })
            .on("mousemove", function (e, d) {
                let total = d.data['M'] + d.data['F'];
                let proportion = (d[1] - d[0]) / total;
                Tooltip.html(`Total Incidents: ${d[1] - d[0]} <br> Gender proportion: ${proportion.toFixed(2)}`)
                    .style("left", e.pageX-100)
                    .style("top", e.pageY-45);
            })
            .on("mouseout", function (e, d) {
                Tooltip.transition().duration(200).style("opacity", 0);
            });

        //Add visualization title and axis titles
        let titles = [
            {title: "Violation Count by Category and Gender"}, 
            {xaxis: "Violation"}, 
            {yaxis: "Incident Count"}];
        svg.selectAll(".title").data(titles).enter().append("text")
            .attr("class", "title")
            .attr("x", svgwidth / 7)
            .attr("y", -40)
            .attr("font-size", 28)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(titles).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2 - padding)
            .attr("y", height + bottom - padding)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(titles).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2 - padding)
            .attr("y", -left + padding)
            .text(function(d) { return d.yaxis; });

        //Add legend to visualization
        let legendData = [
            {color: "pink", label: "Females"}, 
            {color: "lightblue", label: "Males"}];
        let legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(25,25)");
        let items = legend.selectAll(".legend").data(legendData).enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        items.append("rect")
            .attr("x", width - 115)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d) { return d.color; });
        items.append("text")
            .attr("x", width - 100)
            .attr("y", 10)
            .text(function(d) { return d.label; });
    });
}



var vis4=function(filePath){
    //Add analysis by appending span
    d3.select('#vis4_analysis').append('span').text("In this final visualization, I plotted the counts of violations by county on a geomap, while also dividing each county's count into subgroups by race. I was motivated to create this plot to analyze if there was a relationship between geographic location, the number of traffic incidents, and race, and surprisingly (or not), there were multiple relationships! Southern counties not only consisted of a much greater proportion of minorities, but there was also more police activity as well. Initially, I wanted to create a colormap indicating which individual race contributed to the most incidents for each county, but every county was either heavily White or Hispanic dominated. Therefore, I created new categories to describe the counties that were in the middle of the spectrum. The 'White Majority' category means that there were more incidents recorded for white people than that of every other group combined, 'White Dominated' indicates that white people led in counts compared to every other racial group, and finally 'Minority Dominated' describes the remaining counties in which white people do not contribute to the most incidents.");
    //d3.select('#vis4_analysis2').append('span').text("I chose a darker color for this geomap since it was one of the more complex and more visually impressive visualizations in this project and wanted it to draw more attention to it. I also used a slightly darker color in the previous boxplot to create a gradient for a smoother transition. I also used straightforward colors to represent the distribution of races; one of colors is actually exactly the same as the race! The map of California itself doesn't convey relevant information, but the circles employ the area mark. It encodes information through the position, area, and color channels. The position indicates which county the data is from, the area tells the user how many incidents were recorded in the specified region, and the color provides insight about the distribution of incidents between races for each county. I used a tooltip appended to the circles to reveal relevant information for each county including the county name and the counts of recorded incidents for each race to allow curious users to further investigate counties of interest.");

    d3.csv(filePath).then(function(data){
        //Define and initialize svg
        const width = 800;
        const height = 740
        let svg = d3.select("#geometric_visualization")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        //Clean county data for dictionary
        const cleanedData = data.map(d => {
            const cleanedCounty = d.county_name.replace(/ County/g, '');
            return { ...d, county: cleanedCounty };
            });
        
        //Filter then format data
        let raw_counts = d3.rollup(cleanedData, v => v.length, d => d.county, d => d.driver_race);
        let counties = [];
        for (let [county, subMap] of raw_counts) {
            let entry = {}
            entry['County'] = county;
            for (let [gender, count] of subMap) {
                entry[gender] = count;
            }
            counties.push(entry);
        }
        console.log(counties);

        //Create projection and pathgeo variables for CA map
        const projection = d3.geoMercator()
            .center([-119, 37.5])
            .scale(2800)
            .translate([width/2, height/2]);
        const pathgeo = d3.geoPath().projection(projection);

        //Load JSON file and create the map
        const CAmap = d3.json('data/ca.json');
        CAmap.then(function (map) {
            //Map of counties
            const countyCoords = {
                "Alameda": [-121.9167, 37.6485],
                "Alpine": [-119.8205, 38.5976],
                "Amador": [-120.6660, 38.4092],
                "Butte": [-121.537, 39.6254],
                "Calaveras": [-120.561, 38.1839],
                "Colusa": [-122.2654, 39.1041],
                "Contra Costa": [-121.9018, 37.8534],
                "Del Norte": [-123.8972, 41.7422],
                "El Dorado": [-120.4358, 38.7426],
                "Fresno": [-119.2321, 36.9859],
                "Glenn": [-122.3922, 39.5989],
                "Humboldt": [-123.8695, 40.745],
                "Imperial": [-115.4734, 33.0118],
                "Inyo": [-117.4106, 36.5113],
                "Kern": [-118.7271, 35.3438],
                "Kings": [-119.8155, 36.0741],
                "Lake": [-122.7537, 39.0968],
                "Lassen": [-120.4778, 40.6639],
                "Los Angeles": [-118.2282, 34.3083],
                "Madera": [-119.6963, 37.2519],
                "Marin": [-122.7203, 38.0712],
                "Mariposa": [-119.8815, 37.5128],
                "Mendocino": [-123.4384, 39.5501],
                "Merced": [-120.7120, 37.2010],
                "Modoc": [-120.5439, 41.4882],
                "Mono": [-118.8864, 37.9399],
                "Monterey": [-121.3256, 36.2331],
                "Napa": [-122.2654, 38.5025],
                "Nevada": [-121.1710, 39.1347],
                "Orange": [-117.8311, 33.7175],
                "Placer": [-120.8039, 39.0916],
                "Plumas": [-120.838, 40.0034],
                "Riverside": [-115.9936, 33.7432],
                "Sacramento": [-121.3542, 38.4747],
                "San Benito": [-121.0745, 36.603],
                "San Bernardino": [-116.1784, 34.8414],
                "San Diego": [-116.7353, 33.0341],
                "San Francisco": [-122.4194, 37.7749],
                "San Joaquin": [-121.2714, 37.9349],
                "San Luis Obispo": [-120.4358, 35.3102],
                "San Mateo": [-122.4014, 37.4337],
                "Santa Barbara": [-119.7871, 34.4367],
                "Santa Clara": [-121.7195, 37.2939],
                "Santa Cruz": [-122.017, 37.0516],
                "Shasta": [-122.392, 40.7909],
                "Sierra": [-120.522, 39.5806],
                "Siskiyou": [-122.5428, 41.5982],
                "Solano": [-121.9018, 38.3105],
                "Sonoma": [-122.9888, 38.578],
                "Stanislaus": [-120.9876, 37.5091],
                "Sutter": [-121.6739, 39.0220],
                "Tehama": [-122.237, 40.1256],
                "Trinity": [-123.1187, 40.6058],
                "Tulare": [-118.8026, 36.2203],
                "Tuolumne": [-119.9526, 38.0265],
                "Ventura": [-119.0911, 34.4447],
                "Yolo": [-121.9017, 38.6828],
                "Yuba": [-121.3516, 39.2546]
            };
            
            //Create map of CA
            svg.selectAll('path').data(map.features).enter()
                .append('path')
                .attr('d', pathgeo)
                .attr('fill', 'cadetblue')
                .attr('stroke', 'black')
                .attr('stroke-width', 0.8);

            //Create a scale for circles
            let sqrtScale = d3.scaleSqrt()
                .domain([d3.min(counties, d => d.Asian + d.Black + d.Hispanic + d.Other + d.White), d3.max(counties, d => d.Asian + d.Black + d.Hispanic + d.Other + d.White)])
                .range([3, 15]);
            
            //Initialize tooltip
            let Tooltip = d3.select("#geometric_visualization").append("div").style("opacity", 0).attr("class", "tooltip");

            //Create circles on map
            let circles = svg.selectAll('circle').data(counties).enter()
                .append('circle')
                .attr('cx', d => projection(countyCoords[d.County])[0])
                .attr('cy', d => projection(countyCoords[d.County])[1])
                .attr('r', d => sqrtScale(d.Asian + d.Black + d.Hispanic + d.Other + d.White))
                .attr('fill', function(d){
                    if (d.White > (d.Asian + d.Black + d.Hispanic + d.Other)) {
                        return 'white';
                    } else if (d.White > d.Hispanic) {
                        return 'bisque';
                    } else {
                        return 'chocolate';
                    }})
                .on("mouseover", function (e, d) {
                    Tooltip.transition().duration(100).style("opacity", 0.9);
                    Tooltip.html(`${d.County} County <br> White: ${d.White} <br> Hispanic: ${d.Hispanic} <br> Black: ${d.Black} <br> Asian: ${d.Asian} <br> Other: ${d.Other}`)
                        .style("left", e.pageX-25)
                        .style("top", e.pageY-130);
                })
                .on("mousemove", function (e, d) {
                    Tooltip.html(`${d.County} County <br> White: ${d.White} <br> Hispanic: ${d.Hispanic} <br> Black: ${d.Black} <br> Asian: ${d.Asian} <br> Other: ${d.Other}`)
                        .style("left", e.pageX-40)
                        .style("top", e.pageY-145);
                })
                .on("mouseout", function (e, d) {
                    Tooltip.transition().duration(100).style("opacity", 0);
                });
            
            //Add visualization title and axis titles
            let titles = [
                {title: "Traffic Incidents by County and Race"}];
            svg.selectAll(".title").data(titles).enter().append("text")
                .attr("class", "title")
                .attr("x", width / 4)
                .attr("y", 20)
                .attr("font-size", 28)
                .text(function(d) { return d.title; });

            //Add legend to visualization
            let legendData = [
                {color: "white", label: "White Majority"}, 
                {color: "bisque", label: "White Dominated"}, 
                {color: "chocolate", label: "Minority Dominated"}];
            let legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(25,25)");
            let items = legend.selectAll(".legend").data(legendData).enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
            items.append("rect")
                .attr("x", 500)
                .attr("y", 100)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", function(d) { return d.color; });
            items.append("text")
                .attr("x", 515)
                .attr("y", 110)
                .text(function(d) { return d.label; });
        });
    });
}



var vis5=function(filePath){
    //Add analysis by appending span
    d3.select('#vis5_analysis').append('span').text("So far, we have analyzed interactions involving violation categories and the driver ages, but never directly against each other. We now have a box plot showing the direct relationship between these two features, but unfortunately, the visual difference was not as big as I was hoping for. Upon initial inspection, we can only see that the DUI category seems to have a smaller range, which makes sense since most people are not exposed to alcohol at an extremely early age and older people are (hopefully) more responsible. The entire distribution for the 'Other' category seems to be higher than that of the other distributions, possibly owing to the fact that they account for stops unrelated to serious violations. Besides these differences, it was hard to see the differences between the categories, so I added a line which moves over the graph horizontally while also displaying the exact age to help us analyze smaller yet statistically significant differences between groups.");
    //d3.select('#vis5_analysis2').append('span').text("For this plot, I again chose colors that would fit in with the pastel theme but a little darker than previous plots to help transition into the final visualization. Similar to the barplot we used above, the marks are points, encoded through the vertical position channel. For this visualization, I added not one, but two tooltips—one for the horizontal reference line which also displays age and another to show the attributes of each individual bar plot. I made the reference line by appending a rectangle in the background of the svg, then mapping the y coordinates of the cursor to the corresponding age using a linear function. If for some reason the ages are not accurate, it is likely because the svg position changed relative to the page after the function was implemented, or because of some formatting discrepancies between different pages.");

    d3.csv(filePath).then(function(data){
        //Define svg dimensions
        const svgwidth = 800;
        const svgheight = 800;
        const left = 80;
        const bottom = 120;
        const right = 50;
        const top = 20;
        const height = svgheight - bottom - top;
        const width = svgwidth - left - right;
        const padding = 25;

        //Initialize svg
        let svg = d3.select("#box_plot")
            .append("svg")
            .attr("width", svgwidth)
            .attr("height", svgheight)
            .append("g").attr("transform", "translate(" + left + "," + top + ")");
        
        //Get data to construct boxplot
        const categories = ['Other', 'Moving violation', 'Equipment', 'DUI'];
        let boxData = [];
        categories.forEach(function(category) {
            let categoryData = data.filter(d => d.violation == category);
            let ageList = categoryData.map(d => d.driver_age);
            let dataSorted = ageList.sort(d3.ascending);
            let min = d3.quantile(dataSorted, 0);
            let q1 = d3.quantile(dataSorted, .25);
            let median = d3.quantile(dataSorted, .5);
            let q3 = d3.quantile(dataSorted, .75);
            let max = q3 + (q3 - q1) * 1.5;
            boxData.push({category: category, min: min, q1: q1, median: median, q3: q3, max: max});
        });
        console.log(boxData);

        //Set up dynamic scaling
        let xScale = d3.scaleBand()
            .domain(boxData.map(d => d.category))
            .range([0, width])
            .padding(0.6);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.driver_age)])
            .range([height, 0]);

        //Set up axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style("font-size", 14)
            .call(d3.axisBottom(xScale));
        svg.append("g")
            .call(d3.axisLeft(yScale).ticks(10));
        
        //Initialize tooltip with line class
        let Tooltip_line = d3.select("#box_plot").append("div").style("opacity", 0).attr("class", "tooltip-line");

        //Plot background rectangle to implement tooltip
        svg.append('rect')
            .attr("x", 1)
            .attr("y", 0)
            .attr("height", height - 1)
            .attr("width", width)
            .attr("fill", "lightcyan")
            .on("mouseover", function (e, d) {
                Tooltip_line.transition().duration(100).style("opacity", 0.9);
                Tooltip_line.html(`Age: ${(-0.14706*e.pageY + 570.44118).toFixed(0)}`)
                    .style("left", e.pageX-1500)
                    .style("top", e.pageY-20);
            })
            .on("mousemove", function (e, d) {
                Tooltip_line.html(`Age: ${(-0.14706*e.pageY + 570.44118).toFixed(0)}`)
                    .style("left", e.pageX-1500)
                    .style("top", e.pageY-20);
            })
            .on("mouseout", function (e, d) {
                Tooltip_line.transition().duration(100).style("opacity", 0);
            });

        //Plot vertical line
        svg.append("g").selectAll("vertical").data(boxData).enter()
            .append('line')
            .attr("x1", d => xScale(d.category) + xScale.bandwidth() / 2)
            .attr("x2", d => xScale(d.category) + xScale.bandwidth() / 2)
            .attr("y1", d => yScale(d.min) )
            .attr("y2", d => yScale(d.max) )
            .attr("stroke", "black");

        //Initialize tooltip for box plot
        let Tooltip = d3.select("#box_plot").append("div").style("opacity", 0).attr("class", "left-tooltip");

        //Plot boxes
        svg.append("g").selectAll('rect').data(boxData).enter()
            .append('rect')
            .attr("x", d => xScale(d.category))
            .attr("y", d => yScale(d.q3) )
            .attr("height", d => (yScale(d.q1) - yScale(d.q3)))
            .attr("width", xScale.bandwidth())
            .attr("stroke", "black")
            .style("fill", "#69b3a1")
            .on("mouseover", function (e, d) {
                Tooltip.transition().duration(100).style("opacity", 0.9);
                Tooltip.html(`Min: ${d.min} <br> Q1: ${d.q1} <br> Median: ${d.median} <br> Q3: ${d.q3} <br> Max: ${d.max}`)
                    .style("left", e.pageX-50)
                    .style("top", e.pageY-100);
            })
            .on("mousemove", function (e, d) {
                Tooltip.html(`Min: ${d.min} <br> Q1: ${d.q1} <br> Median: ${d.median} <br> Q3: ${d.q3} <br> Max: ${d.max}`)
                    .style("left", e.pageX-50)
                    .style("top", e.pageY-100);
            })
            .on("mouseout", function (e, d) {
                Tooltip.transition().duration(100).style("opacity", 0);
            });;
        
        //Plot max markers
        svg.selectAll("horizontal").data(boxData).enter()
            .append("line")
            .attr("x1", d => xScale(d.category))
            .attr("x2", d => xScale(d.category) + xScale.bandwidth())
            .attr("y1", d => yScale(d.max))
            .attr("y2", d => yScale(d.max))
            .attr("stroke", "black");
        
        //Plot median markers
        svg.selectAll("horizontal").data(boxData).enter()
            .append("line")
            .attr("x1", d => xScale(d.category))
            .attr("x2", d => xScale(d.category) + xScale.bandwidth())
            .attr("y1", d => yScale(d.median))
            .attr("y2", d => yScale(d.median))
            .attr("stroke", "black");
        
        //Plot min markers
        svg.selectAll("horizontal").data(boxData).enter()
            .append("line")
            .attr("x1", d => xScale(d.category))
            .attr("x2", d => xScale(d.category) + xScale.bandwidth())
            .attr("y1", d => yScale(d.min))
            .attr("y2", d => yScale(d.min))
            .attr("stroke", "black");

        //Add visualization title and axis titles
        let titles = [
            {title: "Box Plot of Distribution of Ages for Each Violation"}, 
            {xaxis: "Violation Category"}, 
            {yaxis: "Driver Age"}];
        svg.selectAll(".title").data(titles).enter().append("text")
            .attr("class", "title")
            .attr("x", 2 * padding)
            .attr("y", 0)
            .attr("font-size", 28)
            .text(function(d) { return d.title; });
        svg.selectAll(".x-axis-title").data(titles).enter().append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2 - 2 * padding)
            .attr("y", height + bottom - 2 * padding)
            .text(function(d) { return d.xaxis; });
        svg.selectAll(".y-axis-title").data(titles).enter().append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2 - 2 * padding)
            .attr("y", -left + padding)
            .text(function(d) { return d.yaxis; });
    });
}
