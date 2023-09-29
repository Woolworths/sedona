<template>
  <div id="app" class="box">
    <div id="nav" class="main-row header">
      <router-link to="/about">About</router-link> |
      <router-link to="/graph">Graph</router-link> |
      <router-link to="/data">Data</router-link>
    </div>

    <div class="main-row content">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<style>
/* https://stackoverflow.com/questions/90178/make-a-div-fill-the-height-of-the-remaining-screen-space */
html,
body {
  height: 100%;
  max-height: 100%;
  margin: 0;
}

.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}

.box .main-row.header {
  flex: 0 1 auto;
  border-bottom: 1px dotted grey;
}

.box .main-row.content {
  flex: 1 1 auto;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  text-align: center;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
