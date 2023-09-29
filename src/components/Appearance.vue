<template>
  <div class="content-wrapper">
    <div class="align-items-center">
      <nav class="navbar navbar-default navbar-xs navbar-subnav">
        <div class="flex-column">
          <ul class="navbar-nav nav nav-tabs flex-row">
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveAppearanceTab('VertexRadius')"
                :class="
                  'nav-link' + (activeAppearanceTab === 'VertexRadius' ? ' active' : '')
                "
                >Vertex Radius</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setActiveAppearanceTab('VertexColour')"
                :class="
                  'nav-link' + (activeAppearanceTab === 'VertexColour' ? ' active' : '')
                "
                >Vertex Colour</a
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="overflow-container">
      <div class="container-fluid content-wrapper" :style="[activeAppearanceTab !== 'VertexRadius' ? { display: 'none' } : {}]">
        <div class="flex-row padding-bottom">
          <div id="accordionVertexRadius" class="accordion">
            <div class="card">
              <div id="headingRadiusMatching" class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseRadiusMatching"
                    aria-expanded="false"
                    aria-controls="collapseRadiusMatching"
                  >
                    Matching
                  </button>
                </h2>
              </div>

              <div
                id="collapseRadiusMatching"
                class="collapse show"
                aria-labelledby="headingRadiusMatching"
                data-parent="#accordionVertexRadius"
              >
                <div class="card-body">
                  <form>
                    <div class="form form-row row">
                      <div class="col-lg-9">
                        <input
                          type="number"
                          v-model.number="matchingRadius"
                          min="0"
                          class="form-control form-control-sm mb-2 mr-sm-4"
                          placeholder="Radius"
                        />
                      </div>
                      <div class="col-lg-3">
                        <button
                          type="button"
                          @click="setMatchingRadius"
                          class="btn btn-outline-primary btn-sm mb-2"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="card">
              <div id="headingRadiusGradient" class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseRadiusGradient"
                    aria-expanded="false"
                    aria-controls="collapseRadiusGradient"
                  >
                    Gradient
                  </button>
                </h2>
              </div>

              <div
                id="collapseRadiusGradient"
                class="collapse"
                aria-labelledby="headingRadiusGradient"
                data-parent="#accordionVertexRadius"
              >
                <div class="card-body">
                  <form>
                    <div class="form-group form-row row">
                      <label for="radiusGradientParameter" class="col-lg-4 col-form-label col-form-label-sm">Parameter</label>
                      <div class="col-lg-8">
                        <select
                          id="radiusGradientParameter"
                          v-model="selectedParamRadius"
                          class="form-control form-control-sm"
                        >
                          <option disabled>Choose Parameter</option>
                          <option v-for="param in params" :value="param">{{
                            param.label
                          }}</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <label class="col-lg-4 col-form-label col-form-label-sm">Range</label>
                      <div class="col-lg-4">
                        <input
                          type="number"
                          v-model.number="minRadius"
                          min="0"
                          class="form-control form-control-sm"
                          placeholder="Min Radius"
                        />
                      </div>
                      <div class="col-lg-4">
                        <input
                          type="number"
                          v-model.number="maxRadius"
                          class="form-control form-control-sm"
                          placeholder="Max Radius"
                        />
                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <label for="radiusGradientPower" class="col-lg-4 col-form-label col-form-label-sm">Power</label>
                      <div class="col-lg-8">
                        <input
                          type="number"
                          id="radiusGradientPower"
                          min="0"
                          step="any"
                          v-model.number="powRadius"
                          class="form-control form-control-sm"
                        />

                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <div class="col-lg-4">
                        <button
                        type="button"
                        @click="setUniqueRadius"
                        class="btn btn-outline-primary btn-sm"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="container-fluid content-wrapper" :style="[activeAppearanceTab !== 'VertexColour' ? { display: 'none' } : {}]">
        <div class="flex-row padding-bottom">
          <div id="accordionVertexColour" class="accordion">
            <div class="card">
              <div id="headingColourMatching" class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseColourMatching"
                    aria-expanded="false"
                    aria-controls="collapseColourMatching"
                  >
                    Matching
                  </button>
                </h2>
              </div>

              <div
                id="collapseColourMatching"
                class="collapse show"
                aria-labelledby="headingColourMatching"
                data-parent="#accordionVertexColour"
              >
                <div class="card-body">
                  <form>
                    <div class="form form-row row">
                      <div class="col-lg-9">
                        <input
                          type="color"
                          v-model="matchingColour"
                          class="form-control form-control-sm mb-2 mr-sm-4"
                        />
                      </div>

                      <div class="col-lg-3">
                        <button
                          type="button"
                          @click="setMatchingColour"
                          class="btn btn-outline-primary btn-sm mb-2"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="card">
              <div id="headingColourUnique" class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseColourUnique"
                    aria-expanded="false"
                    aria-controls="collapseColourUnique"
                  >
                    Unique
                  </button>
                </h2>
              </div>

              <div
                id="collapseColourUnique"
                class="collapse"
                aria-labelledby="headingColourUnique"
                data-parent="#accordionVertexColour"
              >
                <div class="card-body">
                  <form>
                    <div class="form form-row row">
                      <div class="col-lg-9">
                        <select
                          v-model="selectedParamColourUnique"
                          class="form-control form-control-sm mb-2 mr-sm-4"
                        >
                          <option disabled value="">Choose Parameter</option>
                          <option v-for="param in params" :value="param">{{
                            param.label
                          }}</option>
                        </select>
                      </div>

                      <div class="col-lg-3">
                        <button
                          type="button"
                          @click="setUniqueColour"
                          class="btn btn-outline-primary btn-sm mb-2"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div class="card">
              <div id="headingColourGradient" class="card-header">
                <h2 class="mb-0">
                  <button
                    class="btn btn-link collapsed"
                    type="button"
                    data-toggle="collapse"
                    data-target="#collapseColourGradient"
                    aria-expanded="false"
                    aria-controls="collapseColourGradient"
                  >
                    Gradient
                  </button>
                </h2>
              </div>

              <div
                id="collapseColourGradient"
                class="collapse"
                aria-labelledby="headingColourUnique"
                data-parent="#accordionVertexColour"
              >
                <div class="card-body">
                  <form>
                    <div class="form-group form-row row">
                      <label for="colourGradientParameter" class="col-lg-4 col-form-label col-form-label-sm">Parameter</label>
                      <div class="col-lg-8">
                        <select
                          id="colourGradientParameter"
                          v-model="selectedParamColourGradient"
                          class="form-control form-control-sm"
                        >
                          <option disabled>Choose Parameter</option>
                          <option v-for="param in params" :value="param">{{
                            param.label
                          }}</option>
                        </select>
                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <label class="col-lg-4 col-form-label col-form-label-sm">Range</label>
                      <div class="col-lg-4">
                        <input
                          type="color"
                          v-model="gradientColourFrom"
                          class="form-control form-control-sm"
                        />
                      </div>
                      <div class="col-lg-4">
                        <input
                          type="color"
                          v-model="gradientColourTo"
                          class="form-control form-control-sm"
                        />
                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <label for="colourGradientPower" class="col-lg-4 col-form-label col-form-label-sm">Power</label>
                      <div class="col-lg-8">
                        <input
                          type="number"
                          id="colourGradientPower"
                          min="0"
                          step="any"
                          v-model.number="powGradient"
                          class="form-control form-control-sm"
                        />
                      </div>
                    </div>

                    <div class="form-group form-row row">
                      <div class="col-lg-4">
                        <button
                        type="button"
                        @click="setGradientColour"
                        class="btn btn-outline-primary btn-sm"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src

import * as d3 from "d3";
import { mapActions } from "vuex";

export default {
  name: "Appearance",

  data: () => ({
    activeAppearanceTab: "VertexRadius",
    matchingRadius: null,
    availableParams: ["int", "float"],
    selectedParamRadius: null,
    minRadius: null,
    maxRadius: null,
    powRadius: 0.5,
    matchingColour: "#666666",
    selectedParamColourUnique: null,
    selectedParamColourGradient: null,
    gradientColourFrom: "#BAEFA7",
    gradientColourTo: "#689D38",
    powGradient: 0.5,
  }),

  computed: {
    transformVertexParams() {
      return this.$store.state.transformVertexParams;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    params() {
      return this.$store.state.transformVertexParams.filter(
        i =>
          this.availableParams.filter(j => i.type === j).length > 0 && !i.hidden
      );
    }
  },

  methods: {
    ...mapActions([
      "addTransformVertexParam",
      "setTransformVertices",
      "triggerVertexPropertiesChanged"
    ]),

    setActiveAppearanceTab(tab) {
      this.activeAppearanceTab = tab;
    },

    setMatchingRadius() {
      const param = { id: "radius", label: "Radius", type: "float", hidden: true };
      this.addTransformVertexParam(param);

      const vertices = this.transformVertices;

      const radiusSize = this.matchingRadius;

      var vm = this;

      for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          v[param.id] = radiusSize;
      }

      this.triggerVertexPropertiesChanged();
    },

    setUniqueRadius() {
      const param = { id: "radius", label: "Radius", type: "float", hidden: true };
      this.addTransformVertexParam(param);

      const vertices = this.transformVertices;

      const selectedParam = this.selectedParamRadius;

      const min = this.minRadius;
      const max = this.maxRadius;

      const min_v = Math.min(
        ...vertices.map(i => i[selectedParam.id]).filter(i => i != null)
      );
      const max_v = Math.max(
        ...vertices.map(i => i[selectedParam.id]).filter(i => i != null)
      );

      var powerScale = d3
        .scalePow()
        .exponent(this.powRadius)
        .domain([min_v, max_v])
        .range([min, max]);

      var vm = this;

      for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          v[param.id] = powerScale(v[selectedParam.id]);
      }

      //console.log(vertices.map(e => e.radius));

      this.triggerVertexPropertiesChanged();
    },

    setMatchingColour() {
      const param = { id: "colour", label: "Colour", type: "string", hidden: true };
      this.addTransformVertexParam(param);

      const vertices = this.transformVertices;

      const colourHex = this.matchingColour;

      var vm = this;

      for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          v[param.id] = colourHex;
      }

      this.triggerVertexPropertiesChanged();
    },

    setUniqueColour() {
      const param = { id: "colour", label: "Colour", type: "string", hidden: true };
      this.addTransformVertexParam(param);

      const vertices = this.transformVertices;

      const selectedParam = this.selectedParamColourUnique;

      const scaleOrdinal = d3.scaleOrdinal(d3.schemeCategory10);

      var vm = this;

      for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          v[param.id] = scaleOrdinal(v[selectedParam.id]);
      }

      this.triggerVertexPropertiesChanged();
    },

    setGradientColour() {
      const param = { id: "colour", label: "Colour", type: "string", hidden: true };
      this.addTransformVertexParam(param);

      const vertices = this.transformVertices;

      const selectedParam = this.selectedParamColourGradient;

      const min_v = Math.min(
        ...vertices.map(i => i[selectedParam.id]).filter(i => i != null)
      );
      const max_v = Math.max(
        ...vertices.map(i => i[selectedParam.id]).filter(i => i != null)
      );

      const scalePow = d3
        .scalePow()
        .exponent(this.powGradient)
        .domain([min_v, max_v])
        .range([this.gradientColourFrom, this.gradientColourTo]);

      var vm = this;

      for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          v[param.id] = scalePow(v[selectedParam.id]);
      }

      //console.log(vertices.map(e => d3.rgb(e.colour).formatHex()));

      this.triggerVertexPropertiesChanged();
    }
  }
};
</script>

<style scoped>
.accordion {
  padding-bottom: 10px;
  text-align: center;
}
</style>
