import Vue from "vue";
import Vuex from "vuex";

import * as d3 from "d3";

Vue.use(Vuex);

let initialState = {
  // types: ['int', 'float', 'date', 'bool', 'str']
  dataVertexParams: new Array(),
  dataEdgeParams: new Array(),
  dataVertices: new Array(),
  dataEdges: new Array(),
  transformVertexParams: new Array(),
  transformEdgeParams: new Array(),
  transformVertices: new Array(),
  transformEdges: new Array(),
  graphActivated: false,
  activeTab: "Transform",
  prevActiveTab: null,
  selectedObject: null,
  selectedObjectType: null,
  filteringObject: false,
  animateGraph: true,
  showEdges: true,
  highlightVertices: true,
  centerGraph: 0,
  vertexPropertiesChanged: 0,

  linkColour: "#8f8f8f",
  linkOpacity: 0.8,
  linkStrength: null,
  vertexStrength: null,
  theta: null
}

export default new Vuex.Store({
  state: JSON.parse(JSON.stringify(initialState)),

  mutations: {
    resetState(state) {
      /*for (let f in state) {
        Vue.set(state, f, JSON.parse(JSON.stringify(initialState[f])))
       }*/

      state.dataVertexParams = new Array();
      state.dataEdgeParams = new Array();
      state.dataVertices = new Array();
      state.dataEdges = new Array();
      state.transformVertices = new Array();
      state.transformEdges = new Array();
      state.transformEdgeParams = new Array();
      state.transformVertexParams = new Array();
      state.graphActivated = false;
      state.activeTab = "Transform";
      state.prevActiveTab = null;
      state.selectedObject = null;
      state.selectedObjectType = null;
      state.filteringObject = false;
      state.animateGraph = true;
      state.showEdges = true;
      state.highlightVertices = true;
      state.centerGraph++;
      state.vertexPropertiesChanged++;
      state.linkColour = "#8f8f8f";
      state.linkOpacity = 0.8;
      state.linkStrength = null;
      state.vertexStrength = null;
      state.theta = null;
    },

    addDataVertex(state, vertex) {
      state.dataVertices.push(vertex);
    },

    setDataVertices(state, value) {
      state.dataVertices = value;
    },

    addDataEdge(state, edge) {
      state.dataEdges.push(edge);
    },

    setDataEdges(state, value) {
      //Vue.set(state, "dataEdges", value);
      state.dataEdges = value;
    },

    removeDataVertex(state, vertex) {
      state.dataVertices.splice(state.dataVertices.indexOf(vertex), 1);
    },

    removeDataEdge(state, edge) {
      state.dataEdges.splice(state.dataEdges.indexOf(edge), 1);
    },

    addDataVertexParam(state, param) {
      if (state.dataVertexParams.filter(i => i.id === param.id).length > 0) {
        return;
      }

      state.dataVertexParams.push(param);
    },

    addDataEdgeParam(state, param) {
      if (state.dataEdgeParams.filter(i => i.id === param.id).length > 0) {
        return;
      }

      state.dataEdgeParams.push(param);
    },

    setTransformVertices(state, value) {
      //Vue.set(state, "transformVertices", value);
      state.transformVertices = value;
    },

    // Add transform vertex from data vertex
    addTransformVertex(state, vertex) {
      state.transformVertices.push(vertex);
    },

    removeTransformVertex(state, vertexId) {
      let index = state.transformVertices.findIndex(
        vertex => vertex.id === vertexId
      );

      //state.transformVertices.splice(index, 1)
      Vue.delete(state.transformVertices, index);
    },

    setTransformEdges(state, value) {
      Vue.set(state, "transformEdges", value);
    },

    addTransformEdge(state, edge) {
      state.transformEdges.push(edge);
    },

    removeTransformEdge(state, edge) {
      state.transformEdges.splice(state.transformEdges.indexOf(edge), 1);
    },

    addTransformVertexParam(state, param) {
      if (
        state.transformVertexParams.filter(i => i.id === param.id).length > 0
      ) {
        return;
      }

      state.transformVertexParams.push(param);
    },

    addTransformEdgeParam(state, param) {
      if (state.transformEdgeParams.filter(i => i.id === param.id).length > 0) {
        return;
      }

      state.transformEdgeParams.push(param);
    },

    setGraphActivated(state, value) {
      Vue.set(state, "graphActivated", value);
    },

    setActiveTab(state, value) {
      state.activeTab = value;
    },

    setPrevActiveTab(state, value) {
      state.prevActiveTab = value;
    },

    setSelectedObject(state, value) {
      Vue.set(state, "selectedObject", value);
    },

    setSelectedObjectType(state, value) {
      Vue.set(state, "selectedObjectType", value);
    },

    setFilteringObject(state, value) {
      Vue.set(state, "filteringObject", value);
    },

    setAnimateGraph(state, value) {
      Vue.set(state, "animateGraph", value);
    },

    setShowEdges(state, value) {
      Vue.set(state, "showEdges", value);
    },

    setHighlightVertices(state, value) {
      Vue.set(state, "highlightVertices", value);
    },

    triggerCenterGraph(state) {
      state.centerGraph++;
    },

    triggerVertexPropertiesChanged(state) {
      state.vertexPropertiesChanged++;
    },

    setLinkColour(state, value) {
      Vue.set(state, "linkColour", value);
    },
 
    setLinkOpacity(state, value) {
      Vue.set(state, "linkOpacity", value);
    },
 
    setLinkStrength(state, value) {
      Vue.set(state, "linkStrength", value);
    },
 
    setVertexStrength(state, value) {
      Vue.set(state, "vertexStrength", value);
    },

    setTheta(state, value) {
      Vue.set(state, "theta", value);
    }
  },
  actions: {
    resetState({ commit }) {
      commit("resetState");
    },

    addDataVertex({ commit }, vertex) {
      commit("addDataVertex", vertex);
    },

    setDataVertices({ commit }, value) {
      commit("setDataVertices", value);
    },

    addDataEdge({ commit }, edge) {
      commit("addDataEdge", edge);
    },

    setDataEdges({ commit }, value) {
      commit("setDataEdges", value);
    },

    removeDataVertex({ commit }, vertex) {
      commit("removeDataVertex", vertex);
    },

    removeDataEdge({ commit }, edge) {
      commit("removeDataEdge", edge);
    },

    addDataVertexParam({ commit }, param) {
      commit("addDataVertexParam", param);
    },

    addDataEdgeParam({ commit }, param) {
      commit("addDataEdgeParam", param);
    },

    setTransformVertices({ commit }, value) {
      commit("setTransformVertices", value);
    },

    addTransformVertex({ commit }, vertex) {
      commit("addTransformVertex", vertex);
    },

    removeTransformVertex({ commit }, vertex) {
      commit("removeTransformVertex", vertex);
    },

    setTransformEdges({ commit }, value) {
      commit("setTransformEdges", value);
    },

    addTransformEdge({ commit }, edge) {
      commit("addTransformEdge", edge);
    },

    removeTransformEdge({ commit }, edge) {
      commit("removeTransformEdge", edge);
    },

    addTransformVertexParam({ commit }, param) {
      commit("addTransformVertexParam", param);
    },

    addTransformEdgeParam({ commit }, param) {
      commit("addTransformEdgeParam", param);
    },

    setGraphActivated({ commit }, value) {
      commit("setGraphActivated", value);
    },

    setActiveTab({ commit }, value) {
      commit("setActiveTab", value);
    },

    setPrevActiveTab({ commit }, value) {
      commit("setPrevActiveTab", value);
    },

    setSelectedObject({ commit }, value) {
      commit("setSelectedObject", value);
    },

    setSelectedObjectType({ commit }, type) {
      commit("setSelectedObjectType", type);
    },

    setFilteringObject({ commit }, type) {
      commit("setFilteringObject", type);
    },

    setAnimateGraph({ commit }, value) {
      commit("setAnimateGraph", value);
    },

    setShowEdges({ commit }, value) {
      commit("setShowEdges", value);
    },

    setHighlightVertices({ commit }, value) {
      commit("setHighlightVertices", value);
    },

    triggerCenterGraph({ commit }) {
      commit("triggerCenterGraph");
    },

    triggerVertexPropertiesChanged({ commit }) {
      commit("triggerVertexPropertiesChanged");
    },

    setLinkColour({ commit }, value) {
      commit("setLinkColour", value);
    },

    setLinkOpacity({ commit }, value) {
      commit("setLinkOpacity", value);
    },

    setLinkStrength({ commit }, value) {
      commit("setLinkStrength", value);
    },

    setVertexStrength({ commit }, value) {
      commit("setVertexStrength", value);
    },

    setTheta({ commit }, value) {
      commit("setTheta", value);
    }
 }
});
