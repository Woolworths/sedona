import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    { path: '/', redirect: '/graph' },

    {
      path: "/about",
      name: "home",
      component: Home
    },
    {
      path: "/graph",
      name: "graph",
      component: () =>
        import(/* webpackChunkName: "graph" */ "./views/Graph.vue")
    },
    {
      path: "/data",
      name: "data",
      component: () =>
        import(/* webpackChunkName: "data" */ "./views/DataTable.vue")
    }
  ]
});

export default router
