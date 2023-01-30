const bounds = [
  // Southwest coordinates
  [62.314453, 5.222247],
  [94.570313, 37.649034], // Northeast coordinates
];

var center = [-26.15201784411545, 35.843022330935014];
var zoom = 2;
mapboxgl.accessToken = "pk.eyJ1IjoidmluY2Vuem8tbSIsImEiOiJjbGQ3bHFqMnEwdzR4M29tbWRsbjIwZTFqIn0.5u7trm5vT8LxangZowzgEA";
const map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/vincenzo-m/cld7lormc002401lh6zl8vmrw",
  center: center,
  zoom: zoom,
  //minZoom: 4,
  maxZoom: 6,
  //maxBounds: bounds, // Set the map's geographical boundaries.
});

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

function numberWithCommasK(x) {
  if (x < 100000) {
    x = Math.round(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    x = x * 0.001;

    x = parseFloat(x).toFixed(0);
    //return x + "K";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "K";
  }
}

function formatNum(x, fix) {
  if (x > 999) {
    x = Math.round(x);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    var roundedString = x.toFixed(fix);
    var rounded = Number(roundedString);
    return rounded;
  }
}

function numberWithCommasM(x) {
  x = x * 0.000001;

  x = parseFloat(x).toFixed(0);
  //return x + " Million";
  // x = parseInt(x);

  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " Million";
  // return x;
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
// regionFiltered = regionFiltered.filter(onlyUnique);

function getAllIndexes(arr, val) {
  var indexes = [],
    i;
  for (i = 0; i < arr.length; i++) if (arr[i] === val) indexes.push(i);
  return indexes;
}

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: true,
  //anchor: "top",
  //offset: [200, 0],
});

map.on("load", function () {
  d3.csv("data/Upwork Dataset-4.csv").then(function (dataCsv) {
    console.log(dataCsv);
    var statesCsv = [];
    for (var i = 0; i < dataCsv.length; i++) {
      statesCsv.push(dataCsv[i]["ISO Country code_"]);
    }
    console.log(statesCsv);
    // d3.json("data/ne_10m_admin_0_countries_lakes (1).geojson").then(function (data) {
    //   var dataFiltered = data.features.filter(function (d) {
    //     return d.properties[SOVEREIGNT] == India;
    //   });

    //   console.log(dataFiltered);
    // });
    d3.json("data/WORLDCOUNTRIES.geojson").then(function (data) {
      console.log(data);

      var object1 = dataCsv[0];
      var csvKeys = Object.keys(object1);
      var categCsv = Object.values(dataCsv[0]);
      var indicator = Object.values(dataCsv[1]);

      console.log(object1);
      console.log(csvKeys);

      console.log(dataCsv["indicator"]);

      data.features = data.features.map(function (d, index) {
        d.id = index;

        var iCsv = statesCsv.indexOf(d.properties["ISO_A3"]);

        if (iCsv == -1) {
          d.properties.st_nmMatch = "none";

          csvKeys.forEach(function (item, index) {
            d.properties[item] = 0;
          });
        } else {
          d.properties.st_nmMatch = statesCsv[i];

          csvKeys.forEach(function (item, index) {
            var element = dataCsv[iCsv][item];

            element = element.replace(",", "");
            if (element == "..." || element == "" || element == "-") {
              element = "nd";
            }

            var number = +element;

            if (item == "") {
              var nameKeyProp = d.properties[csvKeys[index - 1]];
            } else {
              var nameKeyProp = d.properties[item];
            }

            var propName = item;

            if (isNaN(number)) {
              d.properties[propName] = element;
            } else {
              d.properties[propName] = number;
            }
          });
        }

        var pop = d.properties.population_;
        d.properties.population_ = Number(d.properties.population_);
        return d;
      });
      console.log(data);

      data.features = data.features.filter(function (d) {
        return d.properties.st_nmMatch != "none";
      });
      console.log(data);

      var dataFiltered = data.features.filter(function (d) {
        return d.properties["ISO_A3"] == "CAN";
      });

      console.log(dataFiltered);

      var listDemo = ["GDP per capita in $ (PPP)", "Economic Growth", "health expenditure per person", "Education as % of GDP", "% of seats held by women in national parliaments"];

      var categories = ["index", "economic", "health", "education", "poverty", "rights", "energy", "other"];

      // categories.forEach(function (item, index) {
      //   var newElement = document.createElement("li");
      //   newElement.className = "dropdown-submenu";
      //   //newElement.id = item.toLowerCase();
      //   newElement.innerHTML = '<a class="test" tabindex="-1" href="#">' + item + ' <span class="caret"></span></a>' + '<ul class="dropdown-menu" id="subDrop-' + index + '"></ul>';
      //   document.getElementById("mySelect0").appendChild(newElement);

      //   var occ = getAllIndexes(categCsv, item);

      //   var labelsCustom = [];

      //   occ.forEach(function (el) {
      //     labelsCustom.push(indicator[el]);
      //   });

      //   labelsCustom = labelsCustom.filter(onlyUnique);

      //   labelsCustom.forEach(function (element) {
      //     var newElement2 = document.createElement("li");
      //     newElement2.className = "sele";
      //     newElement2.innerHTML = '<a  tabindex="-1" href="#">' + element + "</a>";
      //     document.getElementById("subDrop-" + index).appendChild(newElement2);
      //   });
      // });

      map.addSource("states", {
        type: "geojson",
        data: data,
      });

      map.addLayer(
        {
          id: "states",
          type: "fill",
          source: "states",
          // maxzoom: zoomSwitch,
          paint: {
            //"fill-color": ["interpolate", ["linear"], ["get", "total"], min, colors[0], max * 0.7, colors[1]],
            //"fill-color": ["get", "color"],
            "fill-color": "#686868",
            //"fill-opacity": ["interpolate", ["linear"], ["get", "total"], min, 0.2, max, 0.9],
            "fill-opacity": 1,
          },
          layout: {
            visibility: "visible",
          },
        },
        "poi-label"
      );

      map.addLayer(
        {
          id: "boundaries",
          type: "line",
          source: "states",
          layout: { visibility: "visible" },
          paint: {
            "line-color": "#fff",
            "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 1.5, 0],
          },
        },
        "poi-label"
      );

      let hoveredStateId = null;

      map.on("click", "states", function (e) {
        var callP = e.features[0].properties;
        console.log(callP);

        var infoShow = [];

        var arr1 = csvKeys.slice(0, 3);
        var arr2 = csvKeys.slice(3, csvKeys.length - 1);
        console.log(csvKeys);
        console.log(arr1);
        console.log(arr2);

        var nowSel = gloParam + "_" + gloYear;
        var nowIndex = arr2.indexOf(nowSel);
        console.log(nowIndex);
        var removed = arr2.splice(nowIndex, 1); // Removes the third element
        console.log(arr2);
        arr1.push(removed[0]);
        console.log(arr1);
        var keysN = arr1.concat(arr2.sort());
        console.log(keysN);
        infoShow.push("<h2 class='popA'>" + "Year" + "</h2>" + "<h2 class='popB'>" + gloYear + "</h2>");

        keysN.forEach(function (item, i) {
          if (keysN == "") {
          } else {
            if (isNaN(callP[item])) {
              var inside = callP[item];
            } else {
              var inside = formatNum(callP[item], 2);
            }

            // if (gloYear == "") {
            //   var year = "2021";
            // } else {
            //   var year = gloYear;
            // }

            //

            var split = item.split("_");

            if (i == 3) {
              var info = "<h2 class='popAbold'>" + split[0] + "</h2>" + "<h2 class='popBbold'>" + inside + "</h2>";
              infoShow.push(info);
            } else {
              if (split[1] == gloYear || i < 3) {
                var info = "<h2 class='popA'>" + split[0] + "</h2>" + "<h2 class='popB'>" + inside + "</h2>";
                infoShow.push(info);
              }
            }
          }
        });

        //var infoShow = ["<h2 class='popC'>" + callP["ADMIN"] + "</h2>"];

        // keys.forEach(function (item, i) {
        //   var info = "<h2 class='popA'>" + item + "</h2>" + "<h2 class='popB'>" + callP[item] + "</h2>";
        //   infoShow.push(info);
        // });

        // var red = gloParam + "_" + gloYear;
        // var info = "<h2 class='popA'>" + gloParam + " (" + gloYear + ")</h2>" + "<h2 class='popB'>" + formatNum(callP[red], 2) + "</h2>";
        // infoShow.push(info);

        var infoJoin = infoShow.join("<br>");

        popup.setLngLat(e.lngLat).setHTML(infoJoin).addTo(map);
      });

      map.on("mouseenter", "states", function (e) {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mousemove", "states", (e) => {
        //document.getElementById("console-hover").style.display = "block";

        map.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          if (hoveredStateId !== null) {
            map.setFeatureState({ source: "states", id: hoveredStateId }, { hover: false });
          }
          hoveredStateId = e.features[0].id;
          map.setFeatureState({ source: "states", id: hoveredStateId }, { hover: true });
        }
      });

      map.on("mouseleave", "states", () => {
        // document.getElementById("console-hover").style.display = "none";
        map.getCanvas().style.cursor = "";
        if (hoveredStateId !== null) {
          map.setFeatureState({ source: "states", id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
        //popup.remove();
      });

      var gradientPurple = ["#202672", "#6A2D6B", "#C33764"];
      var gradientGreen = ["#49ECBE", "#239B94", "#1E333C"];
      var gradient = ["#4cb4ac", "-", "#f59709"];

      var gloParam = "population";
      var gloYear = "2021";

      function updatePanel() {
        map.flyTo({
          center: center,
          zoom: zoom,
        });
        //var key = listDemo[keyVal];

        var key = gloParam + "_" + gloYear;

        document.getElementById("year").textContent = "YEAR " + gloYear;

        console.log(key);

        var UNSORTED = [];
        var CORRECT_ORDER = [];

        data.features.map(function (d) {
          var val = d.properties[key];
          if (val != "nd") {
            UNSORTED.push({ admin: d.properties["indicator_data year"], number: val });
            CORRECT_ORDER.push(val);
          }
        });

        var minMax = UNSORTED.sort((a, b) => a.number - b.number);
        var sorted = minMax.reverse();

        console.log(UNSORTED[0]);
        console.log(CORRECT_ORDER);

        var co1 = CORRECT_ORDER.sort();
        var co2 = co1.reverse();
        console.log(co2);

        console.log(sorted);

        var max = d3.max(data.features, function (d) {
          return d.properties[key];
        });

        var min = d3.min(data.features, function (d) {
          return d.properties[key];
        });

        var listAllYear = [];
        data.features.map(function (d, index) {
          for (i = 2014; i < 2022; i++) {
            var thatYear = d.properties[gloParam + "_" + i];
            if ((thatYear != null) & (thatYear != "nd")) {
              listAllYear.push(thatYear);
            }
          }
        });
        console.log(listAllYear);

        var maxT = Math.max(...listAllYear);
        var minT = Math.min(...listAllYear);

        console.log(min + " + " + max);
        console.log(minT + " + " + maxT);

        var minC = minT * 1.0;
        var maxC = maxT * 1.0;
        var medC = minC + [maxC - minC] / 2;

        if (max == null) {
          map.setPaintProperty("states", "fill-color", "#C4C4C4");

          document.getElementById("legend-grad").style.display = "none";
          document.getElementById("first3-tot").style.display = "none";
        } else {
          //map.setPaintProperty("states", "fill-color", ["match", ["get", key], "nd", "#C4C4C4", ["interpolate", ["linear"], ["get", key], minC, gradient[0], medC, gradient[1], maxC, gradient[2]]]);
          map.setPaintProperty("states", "fill-color", ["match", ["get", key], "nd", "#C4C4C4", ["interpolate", ["linear"], ["get", key], minC, gradient[0], maxC, gradient[2]]]);
          document.getElementById("l1").innerHTML = formatNum(minC, 1);
          document.getElementById("l2").innerHTML = formatNum(maxC, 1);

          document.getElementById("legend-grad").style.display = "block";
          document.getElementById("first3-tot").style.display = "block";

          for (i = 0; i < 3; i++) {
            console.log(sorted[i]["number"]);
            document.getElementById("first3-label-" + i).innerHTML = sorted[i]["admin"];
            document.getElementById("first3-val-" + i).innerHTML = formatNum(sorted[i]["number"], 2);
          }
        }
      }

      map.on("click", "states3d", (e) => {
        document.getElementById("bar-group").innerHTML = "";

        var callP = e.features[0];
        console.log(callP.id);
        updatePanel(callP.id);
        document.getElementById("mySelect1").selectedIndex = callP.id + 1;
      });
      updatePanel();

      var narrative = [
        "By analysing the major metrics of data relating to various elements (such as Education, GDP, Economic Growth, Health expenditure, % of seats held by women in national parliaments etc ) by a single country or by region-wise, this interactive dashboard enables the head of the decision maker to achieve how the nation and its populace are succeeding in the present and the future.",
        "With a surface area of just under 40,000 sq. km, <span class='nar-bold'>Switzerland</span> tops the list of countries in the <span class='nar-bold'>Happy Planet Index</span> indicators for the years 2017 to 2020, which range from 34 to 62.The vast majority of the countries on the list are from <span class='nar-bold'>Europe</span>, including New Zealand, Germany, the Netherlands, the United Kingdom, Spain, Finland, France, and so on.",
        "The <span class='nar-bold'>Human Development Index</span> clearly correlates to <span class='nar-bold'>Switzerland’s</span> ranking as the happiest planet constantly over few years, making <span class='nar-bold'>European</span> countries the top-performing continent. While several <span class='nar-bold'>African</span> countries are at the <span class='nar-bold'>bottom of the list. </span>",
        "<span class='nar-bold'>Maldives</span> is rated as having the highest <span class='nar-bold'>GDP Annual Growth</span> rate by 2021, showing a significant improvement over the previous year, going from -33.50 to nearly 42. Alongside these top 10 nations, nations like Libya, Guyana, Macedonia, Panama, Belize, and Moldova collaborate in a sharp increase in GDP, turning negative figures into positive ones.",
        "In terms of <span class='nar-bold'>health expenditure per person</span> in the post-pandemic era, the <span class='nar-bold'>United States</span> leads the pack with the highest yearly expenditure per person, followed by five <span class='nar-bold'>European</span> countries in that order. In contrast to what was stated above, <span class='nar-bold'>China's per-person health expenditure decreased year by year nearing Covid Outbreak.",
        "While overall <span class='nar-bold'>government spending on education</span> is rising gradually, there are a few notable exceptions, like Sri Lanka, Indonesia, Zambia, Malaysia, Kenya, and some nations that have experienced a post-pandemic decline.",
        "<span class='nar-bold'>Economic growth for the high-income group</span> fell sharply in the pandemic year 2020 compared to that of lower middle income  between -4.3 and -3.2 index.  <span class='nar-bold'>Europe and Central Asia</span> experienced a sharp decline of -5.2 compared to the <span class='nar-bold'>Arab region's</span> -4.8, with a global decline of -3.1 index. <span class='nar-bold'>China</span> tops the list of nations whose economies have declined, with <span class='nar-bold'>Maldives</span> coming in second at noticeably -54.2 and 33.5, respectively.",
        "From 2016 to 2019, the <span class='nar-bold'>unemployment</span> rate fluctuated between 5.7 and 5.4, but the post-pandemic effect allowed it to sharply increase by 2020, reaching 6.6 index. South Africa and the Middle East & North Africa, Latin America & Caribbean and Europe & Central Asia regions with the most severely affected nations (Excluding high income) ",
        "Sweden ranks top in <span class='nar-bold'>Political rights</span> score while Syria at the bottom.",
        "<span class='nar-bold'>On civil liberties score</span> European countries such as Sweden, Norway , Finland and more  ranks top 10 countries while few Arab nations (like Saudi Arabia, Yemen ) and central African countries lies in bottom.",
        "The five nations with the most <span class='nar-bold'>political stability and a lack of violence</span> in the past year were Singapore, New Zealand, Iceland, Luxembourg, and Brunei, while the lowest five were Iraq, Afghanistan, Yemen, Syria, and Somalia.",
        "The <span class='nar-bold'>Government effectiveness</span> (such as quality of public services, civil service, policy creation, and government commitment) were noticeably high in <span class='nar-bold'>Singapore, Switzerland, Denmark, Finland, and Norway</span> in recent years, whereas Venezuela, Somalia, Haiti, Yemen, and South Sudan lie in the lowest five rankings. While <span class='nar-bold'>China places #37, the United States is at #21 and the UAE comes in at #18. </span>",
        "Oman, Turkmenistan, Korea, and Malaysia have all witnessed modest increases in <span class='nar-bold'>CO2 emissions</span> over a long period of time, bringing the global score to 4.4. Qatar has the highest emission in 2019, measuring 32.8 on a scale, while African nations have the lowest emission.",
        "Globally, the <span class='nar-bold'>percentage of seats held by women in national parliaments</span> has increased from 12% in 1997 to 26% in 2021. The United Arab Emirates is ranked fourth overall, behind Rwanda, Cuba, and Nicaragua. Nigeria, Oman, Kuwait, Papua New Guinea, and Yemen need to improve in order to achieve balance.",
        "Since 1949, the United States of America has spent 14, 088 dollars on its <span class='nar-bold'>annual military expenditures</span>, and in recent years, approximately 800,672 dollars have been spent, bringing the United States to number one on the list of militaries. Following China, India, and the UK in the top 10 global rankings are Russia, France, Germany, Saudi Arabia, Japan, and South Korea.",
        "It <span class='nar-bold'>took 12 years</span> for the leading country in population and second largest in surface area to grow from 1.3 to 1.4 billion by 2021 (while global population from 8 to 9 billion or Arab World from 355 to 456 million by 2021 data ).  It is estimated to grow up by 2.8 billion close to 2080 and stay up there until 2100”. While it took the same 12 years by the leading country in surface area and ninth largest in population to grow merely half a million by 2021.",
      ];

      const boxes = Array.from(document.getElementsByClassName("sub"));

      $(".sele").on("click", function (e) {
        popup.remove();

        var valAdj = $(this).html();
        var nar = $(this).attr("data-nar");
        var yea = $(this).attr("data-year");

        console.log(valAdj);
        console.log(nar);
        document.getElementById("slider").value = yea;
        gloParam = valAdj;
        gloYear = yea;
        updatePanel();
        document.getElementById("dropdownTitle").innerText = valAdj.replace("&amp;", "&");

        if (nar == null) {
          document.getElementById("narrativeSel").innerHTML = narrative[0];
        } else {
          document.getElementById("narrativeSel").innerHTML = narrative[nar];
        }

        // document.getElementById("mySelect0").style.display = "none";
        document.getElementById("dropdown").className = "dropdown";

        boxes.forEach((box) => {
          box.style.display = "none";
        });

        e.stopPropagation();
        e.preventDefault();
      });

      $(document).ready(function () {
        $(".dropdown-submenu a.test").on("click", function (e) {
          boxes.forEach((box) => {
            box.style.display = "none";
          });

          $(this).next("ul").toggle();
          e.stopPropagation();
          e.preventDefault();
        });
      });

      var sliderCount = 0;

      document.getElementById("slider").addEventListener("input", function (e) {
        popup.remove();
        var getVal = parseInt(e.target.value, 10);
        sliderCount++;
        gloYear = getVal;
        console.log(sliderCount);

        var startingTitle = document.getElementById("dropdownTitle").innerHTML;
        if ((sliderCount == 1) & (startingTitle == "Visualize colors by...")) {
          document.getElementById("narrativeSel").innerHTML = narrative[15];
          document.getElementById("dropdownTitle").innerText = "Population";
        }
        updatePanel();
      });
    });
  });
});
