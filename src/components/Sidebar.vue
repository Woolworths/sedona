<template>
  <div class="main-container">
    <div>
      <nav class="navbar navbar-default navbar-xs" role="navigation">
        <div class="flex-column">
          <ul class="navbar-nav nav nav-tabs flex-row">
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('Details')"
                :class="'nav-link' + (activeTab === 'Details' ? ' active' : '')"
                >Details</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('Transform')"
                :class="
                  'nav-link' + (activeTab === 'Transform' ? ' active' : '')
                "
                >Search</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('Appearance')"
                :class="
                  'nav-link' + (activeTab === 'Appearance' ? ' active' : '')
                "
                >Appearance</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('FilterData')"
                :class="
                  'nav-link' + (activeTab === 'FilterData' ? ' active' : '')
                "
                >Filter</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('Statistics')"
                :class="
                  'nav-link' + (activeTab === 'Statistics' ? ' active' : '')
                "
                >Statistics</a
              >
            </li>
            <li class="nav-item">
              <a
                href="#"
                @click="setTab('Layout')"
                :class="'nav-link' + (activeTab === 'Layout' ? ' active' : '')"
                >Layout</a
              >
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="content-wrapper container-fluid">
      <keep-alive>
        <component :is="activeTab"></component>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Details from "@/components/Details.vue";
import Transform from "@/components/Transform.vue";
import Appearance from "@/components/Appearance.vue";
import FilterData from "@/components/FilterData.vue";
import Statistics from "@/components/Statistics.vue";
import Layout from "@/components/Layout.vue";
import { mapActions } from "vuex";

export default {
  name: "Sidebar",

  components: {
    Details,
    Transform,
    Appearance,
    FilterData,
    Statistics,
    Layout
  },

  computed: {
    transformVertices() {
      return this.$store.state.transformVertices;
    },

    activeTab() {
      return this.$store.state.activeTab;
    }
  },

  methods: {
    ...mapActions([
      "setActiveTab",
      "setPrevActiveTab"
    ]),

    setTab(tab) {
      this.setPrevActiveTab(tab);

      this.setActiveTab(tab);
    }
  }
};
</script>

<style>
.navbar-xs {
  min-height: 22px;
  -webkit-border-radius: 0;
  -moz-border-radius: 0;
  border-radius: 0;
}

.navbar-subnav {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding-top: 0px;
}

.navbar-xs .navbar-nav > li > a {
  padding-right: 6px;
  padding-left: 6px;
  padding-top: 6px;
  padding-bottom: 7px;
  line-height: 18px;
  text-align: center;
}

.main-container {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  left: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0px;
  min-width: 0px;
}

.overflow-container {
  flex: 1 1 auto;
  overflow: auto;
}

.overflow-content {
  height: 100%;
  width: 100%;
}
</style>
