<template>
  <transition name="modal">
    <div class="modal-mask">
      <div class="card modal-container">
        <div class="card-body modal-body h-100 ">
          <div class="card-title container-fluid">
              <div class="d-flex flex-row-reverse">
                <button
                  type="button"
                  @click="close"
                  class="close"
                >
                  <i class="material-icons">close</i>
                </button>
              </div>
          </div>
          <div class="container-fluid h-100 overflow-auto" v-if="rawCsvData.length === 0">
            <div class="container-fluid" style="padding-bottom:15px;">
              <div class="file-input form-group border rounded"
                style="cursor:pointer;"
                v-cloak
                @drop.prevent="processCsv"
                @dragover.prevent>
                <input type="file"
                  id="csvFile"
                  style="display:none;"
                  @change="processCsv"></input>
                <label for="csvFile"
                  class="h2"
                  style="padding:15px;cursor:pointer;">
                  <i class="material-icons" style="font-size:24px;">insert_drive_file</i> Drag or Click To Import CSV
                </label>
              </div>
            </div>

            <div>
              <p class="h6">No data? No worries. Try these examples:</p>
              <ul class="list-unstyled">
                <li><a href="#" @click="importCSVData('ia-crime-moreno.csv')">Crime Network (Recommended)</a></li>
                <li><a href="#" @click="importTimeData">Test Dataset With Time on Edges</a></li>
                <li><a href="#" @click="importLMData">Les Miserables Dataset</a></li>
                <li><a href="#" @click="importCSVData('bn-fly-drosophila_medulla_1.csv')">Fly Drosophilia Brain Network</a></li>
                <li><a href="#" @click="importCSVData('cit-DBLP.csv')">DBLP Citation Network</a></li>
                <li><a href="#" @click="importCSVData('ia-email-EU.csv')">Email Network (Large)</a></li>
                <li><a href="#" @click="importCSVData('eco-everglades.csv')">Everglades Ecological Network</a></li>
                <li><a href="#" @click="importCSVData('econ-poli.csv')">Economic Network</a></li>
                <li><a href="#" @click="importCSVData('ENZYMES_g296.csv')">Enzyme G296 Cheminformatic Network</a></li>
                <li><a href="#" @click="importCSVData('inf-USAir97.csv')">US Air Force Infrastructure Network</a></li>
                <li><a href="#" @click="importCSVData('mammalia-voles-bhp-trapping.csv')">Animal Social Network</a></li>
                <li><a href="#" @click="importCSVData('power-US-Grid.csv')">US Power Grid Network</a></li>
              </ul>
            </div>
         </div>

          <div class="container-fluid h-100 overflow-auto" v-else>
            <div class="row container-fluid">
              <div class="col-lg-6">
                  <div class="row">
                    <label class="col-sm-4 col-form-label" for="dataType">Type: </label>
                    <select class="form-control form-control-sm col-sm-4" id="dataType" v-model="dataType">
                      <option value="vertices">Vertices</option>
                      <option value="edges">Edges</option>
                    </select>
                  </div>

                <div class="text-left">
                  <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="containsHeaderRow" v-model="containsHeaderRow">
                    <label class="form-check-label" for="containsHeaderRow">CSV contains header row?</label>
                  </div>

                  <div class="form-group form-check" v-if="dataType === 'edges'">
                    <input type="checkbox" class="form-check-input" id="addMissingVertices" v-model="addMissingVertices">
                    <label class="form-check-label" for="addMissingVertices">Automatically add missing vertices?</label>
                  </div>

                  <div class="form-group form-check" v-if="dataType === 'edges'">
                    <input type="checkbox" class="form-check-input" id="skipDuplicateEdges" v-model="skipDuplicateEdges">
                    <label class="form-check-label" for="skipDuplicateEdges">Automatically remove duplicate edges?</label>
                  </div>
                </div>
                
                <div class="form-group" v-for="param in dataParams">
                  <div class="form-inline">
                    <div class="row form-row">
                      <label class="col-4">Label:</label>
                      <input class="col-4 form-control form-control-sm" type="text" v-model="param.label"></input>
                      <select class="col-4 form-control form-control-sm" v-model="param.type">
                        <option value="int">Integer</option>
                        <option value="float">Float</option>
                        <option value="date">Date</option>
                        <option value="bool">Boolean</option>
                        <option value="str">String</option>
                      </select>
                    </div>
                  </div>

                  <div class="row form-row text-left">
                    <div class="col-lg-4"></div>

                    <template v-if="dataType === 'vertices'" class="form-group">
                      <input class="col-4 form-check-input" type="checkbox" :checked="idParam === param" @change="idParam = param"></input>
                      <label class="form-check-label" for="">Id</label>
                    </template>

                    <template v-else>
                      <div class="col-lg-4">
                        <input class="form-check-input" type="checkbox" :checked="sourceParam === param" @change="sourceParam = param">
                        <label class="form-check-label" for="">Source</label>
                      </div>

                      <div class="col-lg-4">
                        <input class="form-check-input" type="checkbox" :checked="targetParam === param" @change="targetParam = param">
                        <label class="form-check-label" for="">Target</label>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <p class="h6">Preview:</p>
                <div class="overflow-auto">
                  <table class="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th v-for="(key, i) in dataParams" :key="i" scope="col">
                          <p class="h6">{{ key.label }}</p>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr v-for="(row, i) in csvData" v-if="i < 10" :key="i">
                        <td
                          v-for="(col, j) in row"
                          class="overflow-text"
                          :key="j"
                        >
                          {{ col }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="row align-bottom d-flex flex-row-reverse" style="padding-bottom:15px;">
              <div class="btn-group align-bottom">
                <button type="button" class="btn btn-primary" @click="importData">Import</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// @ is an alias to /src
import * as utils from "@/utils.js";
import * as d3 from 'd3';
import { mapActions } from "vuex";
import Papa from 'papaparse';
import uuid from 'uuid/v4';
import Vue from "vue";

export default {
  name: "ImportData",

  data: () => ({
    rawCsv: null,
    rawCsvData: [],
    containsHeaderRow: true,
    addMissingVertices: true,
    skipDuplicateEdges: true,
    dataType: "vertices",
    dataParams: [],
    idParam: null,
    sourceParam: null,
    targetParam: null
  }),

  computed: {
    dataVertexParams() {
      return this.$store.state.dataVertexParams;
    },

    dataVertices() {
      return this.$store.state.dataVertices;
    },

    dataEdges() {
      return this.$store.state.dataEdges;
    },

    csvParams() {
      if (this.containsHeaderRow) {
        return this.rawCsvData[0];
      }

      return this.rawCsvData[0].map(v => "");
    },

    csvData() {
      var newCsvData = [...this.rawCsvData];

      if (this.containsHeaderRow) {
        newCsvData.shift();
      }

      return newCsvData;
    }
  },

  watch: {
    csvParams: function() {
      this.updateDataParams();
    },

    dataType: function() {
      this.updateDataParams();
    }
  },

  methods: {
    ...mapActions([
      "setDataVertices",
      "setDataEdges",
      "addDataVertex",
      "addDataVertexParam",
      "addDataEdge",
      "addDataEdgeParam"
    ]),

    importDefault() {
      this.importCSVData('ia-crime-moreno.csv')
    },

    close() {
      this.rawCsv = null;
      this.rawCsvData = [];
      this.containsHeaderRow = true;
      this.addMissingVertices = true;
      this.skipDuplicateEdges = true;
      this.dataType = "vertices";
      this.dataParams = [];
      this.idParam = null;
      this.sourceParam = null;
      this.targetParam = null;

      this.$emit('close');
    },

    processCsv(event) {
      if (event.dataTransfer)
        var rawCsv = event.dataTransfer.files[0];
      else if(event.target)
        var rawCsv = event.target.files[0];
      else
        return;

      var vm = this;

      Papa.parse(rawCsv, {
        worker: true,
        skipEmptyLines: true,
        complete: function(results) {
          vm.rawCsvData = results.data;
        }
      });
    },

    updateDataParams() {
      this.dataParams = [];

      var vm = this;

      if (!this.csvParams) return;

      this.csvParams.forEach(param_id => {
        var newParam;

        if (vm.dataType === "vertices") newParam = utils.createVertexParam(null, param_id, "int", false);
        else newParam = utils.createEdgeParam(null, param_id, "int", false);

        vm.dataParams.push(newParam);
      });

      // Set up default parameters very roughly...
      if (vm.dataType === "vertices") {
        vm.idParam = vm.dataParams[0];
      } else {
        if (vm.dataParams.length >= 2) {
          vm.sourceParam = vm.dataParams[0];
          vm.targetParam = vm.dataParams[1];
        }
      }
    },
    
    // Set new Vertex/Edge based on old data for a given param.
    parseData(newData, oldValue, param) {
      var value = null;

      if (param.type === "int") {
        value = parseInt(oldValue);
      } else if (param.type === "float") {
        value = parseFloat(oldValue);
      } else if (param.type === "date") {
        if (!isNaN(oldValue))
          value = new Date(parseInt(oldValue));
        else
          value = Date.parse(oldValue);
      } else if (param.type === "str") {
        value = new String(oldValue);
      } else if (param.type === "bool") {
        value = new Boolean(oldValue);
      }

      newData[param.id] = value;
    },

    importData() {
      for (var i = 0, len = this.dataParams.length; i < len; i++) {
        const p = this.dataParams[i];

        if (p === this.idParam) {
          p.id = "id";
        } else if (p === this.sourceParam) {
          p.id = "source";
        } else if (p === this.targetParam) {
          p.id = "target";
        } else {
          // user make names: label lowercase with _ prepended
          p.id = uuid();
        }

        if (this.dataType === "vertices")
          this.addDataVertexParam(p);
        else
          this.addDataEdgeParam(p);
      }

      if (this.dataType === "vertices") {
        var newVertices = [];

        for (let i = 0, len_i = this.csvData.length; i < len_i; i++) {
          const d = this.csvData[i];
          var newData = {};

          for (var j = 0, len_j = this.dataParams.length; j < len_j; j++) {
            const p = this.dataParams[j];

            this.parseData(newData, d[j], p);
          };

          newVertices.push(newData);
        }

        utils.addDataVertices(newVertices);
      } else if (this.dataType === "edges") {
        var newVertices = [];
        var newEdges = [];

        if (this.addMissingVertices) {
          this.idParam = utils.createVertexParam("id", "Id", this.sourceParam.type, false);

          this.addDataVertexParam(this.idParam);

          var s = new Set();

          for (let i = 0, len = this.dataVertices.length; i < len; i++) {
            s.add(this.dataVertices[i].id);
          }
        }

        if (this.skipDuplicateEdges) {
          var eM = new Map();
        }

        for (let i = 0, len_i = this.csvData.length; i < len_i; i++) {
          const d = this.csvData[i];

          var newData = {};

          for (var j = 0, len_j = this.dataParams.length; j < len_j; j++) {
            const p = this.dataParams[j];

            this.parseData(newData, d[j], p);
          }

          if (this.addMissingVertices) {
            if (!s.has(newData['source'])) {
              var basicVertex = {};
              this.parseData(basicVertex, newData["source"], this.idParam);

              newVertices.push(basicVertex);
              s.add(newData['source']);
            } 

            if (!s.has(newData['target'])) {
              var basicVertex = {};
              this.parseData(basicVertex, newData["target"], this.idParam);

              newVertices.push(basicVertex);
              s.add(newData['target']);
            }
          }

          if (this.skipDuplicateEdges) {
            var sS = eM.get(newData.source);
            var tS = eM.get(newData.target);

            if (sS === undefined) {
              const nS = new Set();

              eM.set(newData.source, nS);
              
              sS = nS;
            }

            if (tS === undefined) {
              const nT = new Set();

              eM.set(newData.source, nT);

              tS = nT;
            }

            if (!sS.has(newData.target) && !tS.has(newData.source)) {
              newEdges.push(newData);

              sS.add(newData.target);
            }
          } else {
            newEdges.push(newData);
          }
        }

        if (this.addMissingVertices)
          utils.addDataVertices(newVertices);

        utils.addDataEdges(newEdges);
      }

      this.close();
    },

    importTestData () {
      const dataVertexParams = [
        { id: "id", label: "Id", type: "int", hidden: false },
        { id: "group", label: "Group", type: "int", hidden: false },
      ];

      for (let i = 0, len = dataVertexParams.length; i < len; i++) {
        const p = dataVertexParams[i];

        this.addDataVertexParam(p);
      }

      const dataEdgeParams = [
        { id: "source", label: "Source", type: "int" },
        { id: "target", label: "Target", type: "int" },
        { id: "directed", label: "Directed", type: "bool" },
        { id: "value", label: "Value", type: "int" }
      ];

      for (let i = 0, len = dataEdgeParams.length; i < len; i++) {
        const p = dataEdgeParams[i];

        this.addDataEdgeParam(p);
      }

      const dataVertices = [];

      for (let i = 0, len = 50000; i < len; i++) {
        const v = {
          id: i,
          group: Math.floor(Math.sqrt(i))
        }

        dataVertices.push(v);
      }

      const dataEdges = [];

      for (let i = 0, len = 49999; i < len; i++) {
        const e = {
          source: Math.floor(Math.sqrt(i)),
          target: i + 1,
          directed: false,
          value: Math.floor(Math.sqrt(i))
        }

        dataEdges.push(e);
      }

      utils.addDataVertices(dataVertices);
      utils.addDataEdges(dataEdges);

      this.close();
    },

    importLMData () {
      const dataVertexParams = [
        { id: "id", label: "Id", type: "str", hidden: false },
        { id: "group", label: "Group", type: "int", hidden: false },
      ];

      for (let i = 0, len = dataVertexParams.length; i < len; i++) {
        const p = dataVertexParams[i];

        this.addDataVertexParam(p);
      }

      const dataEdgeParams = [
        { id: "source", label: "Source", type: "str" },
        { id: "target", label: "Target", type: "str" },
        { id: "directed", label: "Directed", type: "bool" },
        { id: "value", label: "Value", type: "int" }
      ];

      for (let i = 0, len = dataEdgeParams.length; i < len; i++) {
        const p = dataEdgeParams[i];

        this.addDataEdgeParam(p);
      }

      d3.json("/datasets/miserables.json").then(a => {
        utils.addDataVertices(a.nodes);
        utils.addDataEdges(a.links);
      })

      this.close();
    },
 
    importTimeData () {
      const dataVertexParams = [
        { id: "id", label: "Id", type: "int", hidden: false },
        { id: "date", label: "Date", type: "date", hidden: false },
        { id: "value", label: "Value", type: "int", hidden: false },
      ];

      for (let i = 0, len = dataVertexParams.length; i < len; i++) {
        const p = dataVertexParams[i];

        this.addDataVertexParam(p);
      }

      const dataEdgeParams = [
        { id: "source", label: "Source", type: "int" },
        { id: "target", label: "Target", type: "int" },
        { id: "directed", label: "Directed", type: "bool" },
        { id: "date", label: "Date", type: "date" }
      ];

      for (let i = 0, len = dataEdgeParams.length; i < len; i++) {
        const p = dataEdgeParams[i];

        this.addDataEdgeParam(p);
      }

      function randomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      }

      const dataVertices = [];

      for (let i = 0, len = 1000; i < len; i++) {
        const v = {
          id: i,
          date: randomDate(new Date(2015, 0, 1), new Date(2016, 10, 9)).toISOString(),
          value: Math.floor(Math.sqrt(i))
        }

        dataVertices.push(v);
      }

      const dataEdges = [];

      for (let i = 0, len = 999; i < len; i++) {
        const e = {
          source: Math.floor(Math.sqrt(i)),
          target: i + 1,
          directed: true,
          date: randomDate(new Date(2012, 0, 1), new Date(2012, 3, 9)).toISOString()
        }

        dataEdges.push(e);
      }

      utils.addDataVertices(dataVertices);
      utils.addDataEdges(dataEdges);

      this.close();
    },

    importCSVData(fileName) {
      var vm = this;

      this.dataType = "edges";

      var fileUrl = `/datasets/${fileName}`;

      d3.text(fileUrl).then(a => {
        Papa.parse(a, {
          worker: true,
          skipEmptyLines: true,
          complete: function(results) {
            vm.rawCsvData = results.data;
          }
        });
      })
    }
  }
};
</script>

<style>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    transition: opacity .3s ease;
}

.modal-container {
    width: 70%;
    max-width: 900px;
    height: 90%;
    margin: 30px auto 0;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.modal-body {
    margin: 20px 0;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.file-input {
  max-width: max-content;
  margin: 0px auto;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

</style>
