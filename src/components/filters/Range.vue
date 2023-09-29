<template>
  <div>
    <p class="h6 text-center">
      {{ dataType === "vertex" ? "Vertex" : "Edge" }} Range Filter:
    </p>

    <div class="form-group">
      <select class="form-control form-control-sm" v-model="selectedParam">
        <option :value="null" disabled>Filter Parameter</option>
        <option v-for="param in params" :key="param.id" :value="param">{{
          param.label
        }}</option>
      </select>
    </div>

    <div :id="graphId"></div>
  </div>
</template>

<script>
import * as utils from "@/utils.js";
import * as d3 from "d3";

export default {
  name: "EdgeRange",

  props: {
    filterId: String,
    dataType: String,
    transformVertexParams: Array,
    transformEdgeParams: Array,
    transformVertices: Array,
    transformEdges: Array
  },

  data: () => ({
    margin: { top: 10, right: 10, bottom: 20, left: 10 },
    numTicks: 5,
    numSubTicks: 10,
    availableParams: ["int", "date", "float"],
    selectedParam: null,
    errors: {},
    filterFrom: null,
    filterTo: null
  }),

  watch: {
    selectedParam: function() {
      this.initGraphData();

      this.resize();
    },

    transformVertices: function() {
      this.initGraphData();

      this.resize();
    }
  },

  computed: {
    graphId() {
      return "graph-" + this.filterId;
    },

    data() {
      if (this.dataType === "edge") return this.transformEdges;
      else return this.transformVertices;
    },

    params() {
      var transformParams = {};

      if (this.dataType === "vertex") {
        transformParams = this.transformVertexParams.filter(i => {
          return (
            this.availableParams.filter(j => i.type === j).length > 0 &&
            !i.hidden
          );
        });
      } else if (this.dataType === "edge") {
        transformParams = this.transformEdgeParams.filter(i => {
          return (
            this.availableParams.filter(j => i.type === j).length > 0 &&
            !i.hidden
          );
        });
      }

      return transformParams;
    }
  },

  mounted() {
    window.addEventListener("resize", this.resize);
  },

  beforeDestroy() {},

  activated() {
    this.resize();

    window.addEventListener("resize", this.resize);
  },

  deactivated() {
    window.removeEventListener("resize", this.resize);
  },

  methods: {
    resize() {
      console.log("Resizing range");
      var vm = this;

      this.$nextTick(() => {
        vm.width = this.$el.clientWidth - vm.margin.left - vm.margin.right;

        vm.initGraph();
      });
    },

    initGraphData() {
      if (!this.selectedParam) return;

      this.filterFrom = null;
      this.filterTo = null;

      const graphData = [];

      if (
        this.selectedParam.type === "int" ||
        this.selectedParam.type === "float"
      ) {
        const data = this.data;

        var smallestNum = Infinity;
        var largestNum = -Infinity;

        for (let i = 0, len = data.length; i < len; i++) {
          const e = data[i];

          const num = e[this.selectedParam.id];

          if (num < smallestNum) {
            smallestNum = num;
          }

          if (num > largestNum) {
            largestNum = num;
          }

          graphData.push(num);
        }

        this.smallestValue = smallestNum;
        this.largestValue = largestNum;
        this.graphData = graphData;

        this.calculateGroupedData();
      } else if (this.selectedParam.type === "date") {
        const data = this.data;

        var smallestDate = new Date(-8640000000000000);
        var largestDate = new Date(8640000000000000);

        //graphData.push(smallestDate);

        for (let i = 0, len = data.length; i < len; i++) {
          const e = data[i];

          const date = new Date(e[this.selectedParam.id]);

          if (date.getTime() < smallestDate.getTime()) {
            smallestDate = date;
          }

          if (date.getTime() > largestDate.getTime()) {
            largestDate = date;
          }

          graphData.push(date);
        }

        this.smallestValue = smallestDate;
        this.largestValue = largestDate;
        this.graphData = graphData;

        this.calculateGroupedData();
      }
    },

    calculateGroupedData() {
      // divide time groups in numDataTicks subsections with values for each subsections
      // (corr) to how many points lie in subsection
      const groupedData = [];

      const numDataTicks = this.numTicks * this.numSubTicks;

      const data = this.graphData;

      //TODO: const range = [this.smallestValue, this.largestValue];
      const range = d3.extent(data);

      if (this.selectedParam.type === "date") {
        var splitTime = d3
          .scaleTime()
          .domain(range)
          .range([0, numDataTicks]);
      } else {
        var splitTime = d3
          .scaleLinear()
          .domain(range)
          .range([0, numDataTicks]);
      }

      for (let i = 0, len = numDataTicks; i < len; i++) {
        groupedData.push({ value: i, frequency: 0 });
      }

      for (let i = 0, len = data.length; i < len; i++) {
        const d = data[i];

        const p = Math.floor(splitTime(d));

        if (p >= 0 && p < numDataTicks) groupedData[p].frequency++;
        else if (p >= numDataTicks) groupedData[numDataTicks - 1].frequency++;
      }

      this.groupedData = groupedData;
    },

    initGraph() {
      console.log("Initialising range graph");

      var vm = this;

      if (!this.groupedData || !this.graphData) {
        return;
      }

      var prevFilterFrom = null;
      var prevFilterTo = null;

      if (this.filterFrom && this.filterTo) {
        prevFilterFrom = this.filterFrom;
        prevFilterTo = this.filterTo;
      }

      d3.select("#" + this.graphId)
        .selectAll("*")
        .remove();

      if (!this.width) {
        var width = 190 - this.margin.left - this.margin.right,
          height = 75 - this.margin.top - this.margin.bottom;
      } else {
        var width = this.width;
        var height = 75 - this.margin.top - this.margin.bottom;
      }

      var svg = d3
        .select("#" + this.graphId)
        .append("svg")
        .attr("width", width + this.margin.left + this.margin.right)
        .attr("height", height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      const data = this.graphData;

      if (this.selectedParam.type === "date") {
        var x = d3
          .scaleTime()
          .domain(d3.extent(data))
          .range([0, width]);
      } else {
        var x = d3
          .scaleLinear()
          .domain(d3.extent(data))
          .range([0, width]);
      }

      const domain = this.groupedData.map(d => d.value);

      // Arbitrary values for range
      var bandX = d3
        .scaleBand()
        .domain(domain)
        .range([0, width]) // + 0.75 * width / (this.numTicks * this.numSubTicks)])
        .align(0)
        .paddingInner(0.3);

      var xAxis = d3.axisBottom(x).ticks(this.numTicks);

      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      var yDomain = d3.max(this.groupedData, function(d) {
        return d.frequency;
      });

      if (yDomain === 0) yDomain = 1;

      var y = d3
        .scaleSqrt()
        .domain([0, yDomain])
        .range([height, 0]);

      svg
        .selectAll(".bar")
        .data(this.groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
          return bandX(d.value);
        })
        .attr("y", function(d) {
          return y(d.frequency);
        })
        .attr("width", bandX.bandwidth())
        .attr("height", function(d) {
          return height - y(d.frequency);
        })
        .attr("fill", "#535253");

      function brushEnd() {
        if (
          d3.event &&
          d3.event.sourceEvent &&
          d3.event.sourceEvent.type === "zoom"
        )
          return;

        var s = d3.event && d3.event.selection ? d3.event.selection : x.range();

        vm.filterFrom = x.invert(s[0]);
        vm.filterTo = x.invert(s[1]);

        vm.emit(null, null);
      }

      var brush = d3
        .brushX()
        .extent([
          [0, 0],
          [width, height]
        ])
        .on("end", brushEnd);

      svg
        .append("g")
        .attr("class", "brush")
        .call(brush);

      if (this.filterFrom !== null && this.filterTo !== null ) {
        var xFromPos = x(vm.filterFrom);
        var xToPos = x(vm.filterTo);

        if (xFromPos < 0) xFromPos = 0;
        if (xToPos > width) xToPos = width;

        if (xFromPos > width || xToPos < 0) {
          brushEnd();
          return;
        }

        d3.select("#" + this.graphId).select(".brush").call(brush.move, [xFromPos, xToPos]);
      } else {
        brushEnd();
      }
    },

    emit(e, args) {
      this.$emit("change", e, args);
    },

    filterData(vertices, edges) {
      if (
        !this.selectedParam ||
        this.filterFrom === null ||
        this.filterTo === null
      )
        return null;

      const newVertices = [];
      const addedVertices = new Set();

      var newEdges = [];

      var data = [];

      if (this.dataType === "edge") {
        data = edges;
      } else if (this.dataType === "vertex") {
        data = vertices;
      }

      for (let i = 0, len = data.length; i < len; i++) {
        const e = data[i];

        if (
          this.selectedParam.type === "int" ||
          this.selectedParam.type === "float"
        ) {
          if (
            !(
              e[this.selectedParam.id] >= this.filterFrom &&
              e[this.selectedParam.id] <= this.filterTo
            )
          )
            continue;
        } else if (this.selectedParam.type === "date") {
          const date = new Date(e[this.selectedParam.id]);

          if (
            !(
              date.getTime() >= this.filterFrom.getTime() &&
              date.getTime() <= this.filterTo.getTime()
            )
          )
            continue;
        }

        if (this.dataType === "edge") {
          if (!addedVertices.has(e.source.id)) {
            newVertices.push(e.source);

            addedVertices.add(e.source.id);
          }

          if (!addedVertices.has(e.target.id)) {
            newVertices.push(e.target);

            addedVertices.add(e.target.id);
          }

          newEdges.push(e);
        } else if (this.dataType === "vertex") {
          if (!addedVertices.has(e.id)) {
            newVertices.push(e);

            addedVertices.add(e.id);
          }
        }
      }

      if (this.dataType === "vertex") {
        newEdges = utils.rebuildEdges(newVertices, edges);
      }

      return { filteredVertices: newVertices, filteredEdges: newEdges };
    }
  }
};
</script>
