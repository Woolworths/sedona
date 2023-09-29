<template>
  <div id="graph-item">
    <script type="x-shader/x-vertex" id="vs">

      precision mediump float;

      attribute vec3 color;
      attribute float size;
      attribute float opacity;

      uniform float scale;
      uniform vec3 backgroundColor;

      varying vec3 vBackgroundColor;
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        vBackgroundColor = backgroundColor;
        vColor = color;
        vOpacity = opacity;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        gl_PointSize = 2.0 * size * scale;
      }
    </script>

    <script type="x-shader/x-fragment" id="fs">

      precision highp float;

      varying vec3 vBackgroundColor;
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        delta = fwidth(r);

        alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
        float stroke = 1.0 - smoothstep(0.65 - delta, 0.65 + delta, r);

        if (alpha < 0.1)
          discard;

        gl_FragColor = vec4(mix(vBackgroundColor, vColor, stroke * vOpacity), alpha);
      }
    </script>

    <script type="x-shader/x-vertex" id="hpvs">

      precision mediump float;

      attribute float size;
      attribute vec3 indexColor;

      uniform float scale;

      varying vec3 vIndexColor;

      void main() {
        vIndexColor = indexColor;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        gl_PointSize = 2.0 * size * scale;
      }
    </script>

    <script type="x-shader/x-fragment" id="hpfs">

      precision highp float;

      varying vec3 vIndexColor;

      void main() {
        float r = 0.0, delta = 0.0, alpha = 1.0;

        vec2 cxy = 2.0 * gl_PointCoord - 1.0;

        r = dot(cxy, cxy);

        if (r > 1.0) {
            discard;
        }

        gl_FragColor = vec4(vIndexColor, 1.0);
      }
    </script>

    <script type="x-shader/x-vertex" id="evs">
      attribute vec3 color;
      attribute float opacity;

      uniform float scale;

      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        vColor = color;
        vOpacity = opacity;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    </script>

    <script type="x-shader/x-fragment" id="efs">
      varying vec3 vColor;
      varying float vOpacity;

      void main() {
        gl_FragColor = vec4(vColor, vOpacity);
      }
    </script>

    <div class="h-100 w-100" id="stage"></div>

    <div
      id="tooltip"
      style="display: none; position: absolute; pointer-events: none; font-size: 13px; width: 120px; text-align: center; line-height: 1; padding: 4px; background: white; font-family: sans-serif;"
    >
      <div id="tooltipId" style="padding: 4px;"></div>
    </div>
  </div>
</template>

<script>
import * as utils from "@/utils.js";
import * as force from "@/simulations/force.js";
import * as d3 from "d3";
import * as THREE from "three";
import Papa from 'papaparse';
import _ from 'lodash';
import uuid from "uuid/v4";

import { mapActions } from "vuex";

import * as degree from "@/statistics/degree.js";

export default {
  name: "GraphItem",

  // DO NOT define simulation, renderer, etc. in here... It will make them reactive
  data: () => ({
    width: 850,
    height: 600,
    fov: null,
    aspect: null,
    near: null,
    far: null,
    backgroundColor: new THREE.Color(0xf7f7f7),
    scaleFactor: 1,
    lastFrameUpdatedTime: null,
    activeVertex: null,
    highlightedVertices: new Set(),
    rendererNeedsUpdate: false,
    simulationNeedsUpdate: false,
    mouseNeedsUpdate: false,
    vertexPropertiesNeedUpdate: false,
    vertexOpacitiesNeedUpdate: false,
    vertexPositionsNeedsUpdate: false,
    edgesNeedsUpdate: false,
    dataLoading: true,
  }),

  mounted() {
    console.log("Mounted");

    this.dataLoading = true;

    var vm = this;

    this.resize();

    let fov = 27;
    let aspect = this.width / this.height;
    let near = 50;
    let far = 25000;

    vm.fov = fov;
    vm.aspect = aspect;
    vm.near = near;
    vm.far = far;

    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;

    let scene = new THREE.Scene();
    scene.background = this.backgroundColor;
    this.scene = scene;

    //let canvas = document.createElement('canvas');
    //let context = canvas.getContext('webgl2', { alpha: false });

    let renderer = new THREE.WebGLRenderer({
      //canvas: canvas,
      //context: context,
      antialias: false,
      //alpha: true,
      //premultipliedAlpha: false
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(vm.width, vm.height);
    this.renderer = renderer;

    const mousePos = new THREE.Vector2();
    this.mousePos = mousePos;

    d3.select("#stage")
      .node()
      .appendChild(renderer.domElement);

    function zoomed(transform) {
      //if (!vm.draggingVertex) {
        let x = -(transform.x - vm.width / 2) / transform.k;
        let y = (transform.y - vm.height / 2) / transform.k;
        let z = vm.getZFromScale(transform.k);

        vm.camera.position.set(x, y, z);

        vm.scaleFactor = transform.k;

        vm.rendererNeedsUpdate = true;

        updateTooltip(null, null);
      //}
    }

    function zoomFilter() {
      return !d3.event.ctrlKey && !d3.event.button// && !vm.draggingVertex;
    }

    const nS = vm.getScaleFromZ(near * 1.5)
    const fS = vm.getScaleFromZ(far * 0.85)

    const zoom = d3
      .zoom()
      .scaleExtent([fS, nS])
      .on("zoom", () => { zoomed(d3.event.transform) })
      .filter(zoomFilter);

    this.zoom = zoom;

    d3.select("#stage")
      .call(zoom)
      .on("dblclick.zoom", null);

    function mouseMove(event) {
      vm.mousePos.x = d3.event.offsetX;
      vm.mousePos.y = d3.event.offsetY;

      vm.mouseNeedsUpdate = true;
    }

    function mouseLeave(event) {
      vm.activeVertex = null;

      updateTooltip(null, null);
    }

    function updateTooltip(vertex, mouse) {
      const tooltip = d3.select("#tooltip");
      const tooltipId = d3.select("#tooltipId");

      if (vertex) {
        tooltip.style("display", "block");
        tooltip.style("left", mouse.x + "px");
        tooltip.style("top", mouse.y + 5 + "px");
        tooltipId.text(vertex.id);
        tooltipId.style("color", utils.invertColor(vm.vertexColour(vertex), true));
        tooltipId.style("background", vm.vertexColour(vertex));
        //groupTip.text("x: " + vertex.x + " y: " + vertex.y);
      } else {
        tooltip.style("display", "none");
      }
    }

    function mouseClick(event) {
      if (vm.activeVertex && vm.activeVertex !== vm.selectedObject) {
        updateIntersects();

        if (!vm.selectedObject) {
          vm.setPrevActiveTab(null);
        }

        vm.setSelectedObject(vm.activeVertex);
        vm.setSelectedObjectType("vertex");

        if (!vm.prevActiveTab) {
          vm.setPrevActiveTab(vm.activeTab);
          vm.setActiveTab("Details");
        }
      } else {
        if (vm.selectedObject) {
          if (vm.prevActiveTab) {
            vm.setActiveTab(vm.prevActiveTab);
          }
        }

        vm.setPrevActiveTab(null);

        vm.setSelectedObject(null);
        vm.setSelectedObjectType(null);
      }
    }

    var ctx = renderer.getContext();

    vm.pickingScene = new THREE.Scene();
    vm.pickingScene.autoUpdate = false;
    vm.pickingTexture = new THREE.WebGLRenderTarget(1, 1);

    function updateIntersects() {
      if(ctx.checkFramebufferStatus(ctx.FRAMEBUFFER) !== ctx.FRAMEBUFFER_COMPLETE)
        return;

      if (!vm.mousePos.x || !vm.mousePos.y)
        return;

      const pixelBuffer = new Uint8Array(4);

      const pixelRatio = vm.renderer.getPixelRatio();

      vm.camera.setViewOffset(
        ctx.drawingBufferWidth,
        ctx.drawingBufferHeight,
        (vm.mousePos.x * pixelRatio) | 0,
        (vm.mousePos.y * pixelRatio) | 0,
        1,
        1
      );

      vm.renderer.setRenderTarget(vm.pickingTexture);
      vm.renderer.render(vm.pickingScene, vm.camera);
      renderer.setRenderTarget(null);

      vm.camera.clearViewOffset();

      vm.renderer.readRenderTargetPixels(
        vm.pickingTexture,
        0,
        0,
        1,
        1,
        pixelBuffer
      );

      const id =
        (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2] << 0);

      if (pixelBuffer[3] > 0 && id >= 0 && id < vm.indexedVertices.length) {
        const v = vm.indexedVertices[id];

        if (vm.activeVertex !== v) {
          vm.activeVertex = v;
        }

        updateTooltip(v, vm.mousePos);
      } else {
        vm.activeVertex = null;

        updateTooltip(null, null);
      }

      vm.rendererNeedsUpdate = true;
    }

    d3.select("#stage")
      .on("mousemove", mouseMove)
      .on("mouseleave", mouseLeave)
      .on("click", mouseClick);
      // touchstart support?? https://jsfiddle.net/greggman/74jtp2fb/

    function initGraph() {
      vm.fullDrawNeedsUpdate = true;

      vm.loadDefaultData();

      vm.simulationNeedsUpdate = true;
      vm.centerGraphNeedsUpdate = true;
      vm.rendererNeedsUpdate = true;
    }

    try {
      requestIdleCallback(initGraph);
    } catch (err) {
      console.warn(err);

      initGraph();
    }

    function animate() {
      requestAnimationFrame(animate);

      if (vm.graphActivated === false) return;

      if (vm.fullDrawNeedsUpdate) {
        vm.fullDrawNeedsUpdate = false;

        vm.fullDraw();
      }

      // Always render on Safari to prevent flickering
      if (vm.renderer && (vm.rendererNeedsUpdate ||  /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor))) {
        vm.rendererNeedsUpdate = false;

        vm.renderer.render(vm.scene, vm.camera);
      }

      if (vm.dataLoading === true) return;

      if (vm.mouseNeedsUpdate) {
        vm.mouseNeedsUpdate = false;

        updateIntersects();
      }

      if (vm.simulationNeedsUpdate) {
        vm.simulationNeedsUpdate = false;

        vm.restartSimulation();
      }

      if (vm.vertexPropertiesNeedsUpdate) {
        vm.vertexPropertiesNeedsUpdate = false;

        vm.updateVertexProperties();
      }

      if (vm.vertexOpacitiesNeedsUpdate) {
        vm.vertexOpacitiesNeedsUpdate = false;

        vm.updateVertexOpacities();
      }

      if (vm.vertexPositionsNeedsUpdate) {
        vm.vertexPositionsNeedsUpdate = false;

        vm.updateVertexPositions();
      }

      if (vm.edgesNeedsUpdate) {
        vm.edgesNeedsUpdate = false;

        vm.updateEdges();
      }

      if (vm.centerGraphNeedsUpdate) {
        vm.centerGraphNeedsUpdate = false;

        vm.centerView();
      }
    }

    animate();

    window.addEventListener("resize", this.resize, {
      capture: false,
      passive: true
    });
    window.addEventListener("keydown", this.keydown);
  },

  computed: {
    graphActivated() {
      return this.$store.state.graphActivated;
    },

    activeTab() {
      return this.$store.state.activeTab;
    },

    prevActiveTab() {
      return this.$store.state.prevActiveTab;
    },

    transformVertices() {
      return this.$store.state.transformVertices;
    },

    transformEdges() {
      return this.$store.state.transformEdges;
    },

    animateGraph() {
      return this.$store.state.animateGraph;
    },

    showEdges() {
      return this.$store.state.showEdges;
    },

    highlightVertices() {
      return this.$store.state.highlightVertices;
    },

    centerGraph() {
      return this.$store.state.centerGraph;
    },

    vertexPropertiesChanged() {
      return this.$store.state.vertexPropertiesChanged;
    },

    filteringObject() {
      return this.$store.state.filteringObject;
    },

    selectingObject() {
      if (this.selectedObject && this.selectedObjectType === "vertex" && this.highlightVertices) {
        return true;
      }

      return false;
    },

    selectedObject() {
      return this.$store.state.selectedObject;
    },
 
    selectedObjectType() {
      return this.$store.state.selectedObjectType;
    },

    linkColour() {
      return this.$store.state.linkColour;
    },

    linkOpacity() {
      return this.$store.state.linkOpacity;
    },

    linkStrength() {
      return this.$store.state.linkStrength;
    },

    vertexStrength() {
      return this.$store.state.vertexStrength;
    },

    theta() {
      return this.$store.state.theta;
    }
 },

  watch: {
    graphActivated: function() {
      this.fullDrawNeedsUpdate = true;

      if (this.graphActivated == false) {
        this.simulationNeedsUpdate = true;
      } else {
        this.resize();
      }
    },

    transformVertices: function() {
      this.fullDrawNeedsUpdate = true;

      this.simulationNeedsUpdate = true;
    },

    transformEdges: function() {
      this.simulationNeedsUpdate = true;

      this.initEdges();

      this.rendererNeedsUpdate = true;
    },

    animateGraph: function() {
      this.simulationNeedsUpdate = true;
    },

    showEdges: function() {
      this.initEdges();

      this.rendererNeedsUpdate = true;
    },

    linkColour: function() {
      this.edgesNeedsUpdate = true;
    },

    linkOpacity: function() {
      this.edgesNeedsUpdate = true;
    },

    highlightVertices: function() {
      if (!this.highlightVertices) {
        this.highlightedVertices = new Set();

        this.vertexOpacitiesNeedsUpdate = true;
        this.edgesNeedsUpdate = true;
        this.rendererNeedsUpdate = true;
      } else {
        this.selectObject();
      }
    },

    centerGraph: function() {
      this.centerGraphNeedsUpdate = true;
      this.rendererNeedsUpdate = true;
    },

    vertexPropertiesChanged: function() {
      this.vertexPropertiesNeedsUpdate = true;

      this.vertexPositionsNeedsUpdate = true;
      this.edgesNeedsUpdate = true;
    },

    scaleFactor: function() {
      if (this.uniforms) {
        this.uniforms.scale.value = this.scaleFactor;
      }
    },

    selectedObject: function() {
      this.selectObject();
    }
  },

  methods: {
    ...mapActions([
      "setTransformVertices",
      "setTransformEdges",
      "setGraphActivated",
      "setActiveTab",
      "setPrevActiveTab",
      "setAnimateGraph",
      "setShowEdges",
      "setSelectedObject",
      "setSelectedObjectType",
      "removeSelectedVertex",
      "triggerVertexPropertiesChanged",
      "setLinkOpacity",
      "setLinkStrength",
      "setVertexStrength",

      "addDataVertexParam",
      "addDataEdgeParam",
      "addTransformVertexParam",
      "addTransformEdgeParam",
      "triggerCenterGraph"
    ]),

    loadDefaultData() {
      var vm = this;

      if (this.transformVertices.length !== 0) {
        vm.dataLoading = false;

        return;
      }

      const verticesUrl = import.meta.env.BASE_URL + 'datasets/intro_vertices_power.csv'
      const edgesUrl = import.meta.env.BASE_URL + 'datasets/intro_edges_power.csv'

      const vM = new Map();

      const urls = [verticesUrl, edgesUrl]

      Promise.all(
        urls
        .map(
          url =>
            new Promise(
              (resolve, reject)=>
                d3.text(url).then(a => Papa.parse(
                  a,
                  {
                    worker: true,
                    skipEmptyLines: true,
                    complete:resolve,
                    error:reject
                  }
                )
              )
            )
        )
      )
      .then(
        function (results) {
          const v = [];

          const vertices = results[0].data;

          const max_v = 2500;

          for (let i = 0; i < vertices.length && i < max_v; i++) {
            const id = parseInt(vertices[i][0]);
            const pagerank = parseFloat(vertices[i][1]);
            const inDegree = parseInt(vertices[i][2]);
            const outDegree = parseInt(vertices[i][3]);
            const degree = parseInt(vertices[i][4]);
            const radius = parseFloat(vertices[i][5]);
            const colour = vertices[i][6];

            const nV = {'id': id, 'index': i, '_pageRank': pagerank, '_inDegree': inDegree, '_outDegree': outDegree, '_degree': degree, 'selected': true, 'radius': radius, 'colour': colour};

            v.push(nV);
            vM.set(id, nV);
          }

          const e = [];

          const edges = results[1].data;

          for (let i = 0; i < edges.length; i++) {
            const f = parseInt(edges[i][0]);
            const t = parseInt(edges[i][1]);

            if (vM.has(f) && vM.has(t)) {
              e.push({'id': uuid(), 'source': vM.get(f), 'target': vM.get(t), '_source': f, '_target': t})
            }
          }

          const idParam = { id: "id", label: "Id", type: "int" };
          vm.addTransformVertexParam(idParam);

          const inDegreeParam = { id: "_inDegree", label: "In Degree", type: "int" };
          vm.addTransformVertexParam(inDegreeParam);

          const outDegreeParam = { id: "_outDegree", label: "Out Degree", type: "int" };
          vm.addTransformVertexParam(outDegreeParam);

          const degreeParam = { id: "_degree", label: "Degree", type: "int" };
          vm.addTransformVertexParam(degreeParam);

          const pageRankParam = { id: "_pageRank", label: "PageRank", type: "float" };
          vm.addTransformVertexParam(pageRankParam);

          const sourceParam = { id: "_source", label: "Source", type: "int" };
          vm.addTransformEdgeParam(sourceParam);

          const targetParam = { id: "_target", label: "Target", type: "int" };
          vm.addTransformEdgeParam(targetParam);

          vm.setTransformVertices(v)
          vm.setTransformEdges(e)

          vm.dataLoading = false;

          vm.setLinkOpacity(0.5);
          //vm.setLinkStrength(0.45); // 0.5
          //vm.setVertexStrength(-55); // -55
          vm.scalingRatio = 0.70;

          vm.centerGraphNeedsUpdate = true;
          vm.rendererNeedsUpdate = true;
        }
      )
      .catch(
        err => console.warn(err)
      )
    },

    resize() {
      var vm = this;

      vm.$nextTick(() => {
        const graphContainer = d3.select("#graph-container").node();
        vm.width = graphContainer.clientWidth;
        vm.height = graphContainer.clientHeight;

        // Approximation for Safari
        if (/Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
          vm.height = window.innerHeight - 92;
          d3.select('#graph-item').node().style.position = 'initial';
          //vm.renderer.domElement.style.height = vm.height.toString() + 'px';
        }

        vm.renderer.setSize(vm.width, vm.height);
        vm.camera.aspect = vm.width / vm.height;
        vm.camera.updateProjectionMatrix();

        const x = vm.camera.position.x;
        const y = vm.camera.position.y;

        var transform = d3.zoomIdentity
          .translate(
            -(vm.scaleFactor * x - this.width / 2),
            vm.scaleFactor * y + this.height / 2
          )
          .scale(vm.scaleFactor);

        d3.select("#stage").call(this.zoom.transform, transform);

        vm.rendererNeedsUpdate = true;
      })
    },

    centerView() {
      var minX = Infinity;
      var minY = Infinity;
      var maxX = -Infinity;
      var maxY = -Infinity;

      const vertices = this.transformVertices;
      for (let i = 0, len = vertices.length; i < len; i++) {
        const v = vertices[i];

        if (v.x && v.x < minX) {
          minX = v.x;
        }

        if (v.y && v.y < minY) {
          minY = v.y;
        }

        if (v.x && v.x > maxX) {
          maxX = v.x;
        }

        if (v.y && v.y > maxY) {
          maxY = v.y;
        }
      }

      if (vertices.length === 0) {
        minX = 0;
        minY = 0;
        maxX = 0;
        maxY = 0;
      }

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      const graphWidthRatio = this.width / graphWidth;
      const graphHeightRatio = this.height / graphHeight;

      var scalingRatio = 0.80; //0.85

      if (this.scalingRatio) {
        scalingRatio = this.scalingRatio;
      }

      const ratio = Math.min(graphWidthRatio, graphHeightRatio) * scalingRatio;

      let x = minX + graphWidth / 2;
      let y = minY + graphHeight / 2;
      let z = this.getZFromScale(ratio);

      if (z > this.far) z = this.far - 1;
      if (z < this.near) z = this.near + 1;

      this.scaleFactor = this.getScaleFromZ(z);

      var transform = d3.zoomIdentity
        .translate(
          -(this.scaleFactor * x - this.width / 2),
          this.scaleFactor * y + this.height / 2
        )
        .scale(this.scaleFactor);

      d3.select("#stage").call(this.zoom.transform, transform);
    },

    keydown(event) {
      if (event.target.tagName === "INPUT") return;

      console.log('Keydown event: ' + event.keyCode);

      if (event.keyCode === 67) {
        this.centerGraphNeedsUpdate = true;
      } else if (event.keyCode === 72) {
        this.setShowEdges(!this.showEdges);
      } else if (event.keyCode === 83) {
        this.setAnimateGraph(!this.animateGraph);
      }
    },

    initVertices() {
      if (this.graphActivated === false || this.dataLoading) return;

      console.log("Initialising " + this.transformVertices.length + " vertices");

      let vm = this;

      vm.scene.remove(vm.points);
      vm.pickingScene.remove(vm.hoverPoints);
      
      if (this.transformVertices.length === 0) return;

      var geometry = new THREE.BufferGeometry();
      vm.geometry = geometry;

      var indexColors = [];
      var positions = [];
      var colors = [];
      var sizes = [];
      var opacities = [];

      var color = new THREE.Color();

      const vertices = vm.transformVertices;

      // How large we want to make the default width and length
      const lenV = 65 * Math.floor(Math.sqrt(vertices.length) / 2); // 80

      for (let i = 0, len = vertices.length; i < len; i++) {
        const v = vertices[i];

        color.setHex(v.index);
        indexColors.push(color.r, color.g, color.b);

        if (!v.x || !v.y) {
          v.x = Math.random() * (lenV) - (lenV / 2);
          v.y = Math.random() * (lenV) - (lenV / 2);
        }

        var x = v.x;
        var y = v.y;

        var z = this.vertexZ(v);

        positions.push(x, y, z);

        const c = vm.vertexColour(v);

        color.set(c);
        colors.push(color.r, color.g, color.b);

        var size = vm.vertexRadius(v);

        sizes.push(size);

        var opacity = vm.vertexOpacity(v);

        opacities.push(opacity);
      }

      // Most disgusting way to fix the gpu selecting bug
      indexColors.push(0, 0, 0);
      positions.push(0, 0, -100000);
      colors.push(0, 0, 0);
      sizes.push(0);
      opacities.push(0);

      // TODO: dynamic true will hinder perf
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
      );
      geometry.setAttribute(
        "indexColor",
        new THREE.Float32BufferAttribute(indexColors, 3)
      );
      geometry.setAttribute(
        "size",
        new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage)
      );
      geometry.setAttribute(
        "opacity",
        new THREE.Float32BufferAttribute(opacities, 1).setUsage(THREE.DynamicDrawUsage)
      );

      geometry.computeBoundingSphere();

      var uniforms = {
        backgroundColor: { value: vm.backgroundColor },
        scale: { value: vm.scaleFactor }
      };

      this.uniforms = uniforms;

      var material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById("vs").textContent.trim(),
        fragmentShader: document.getElementById("fs").textContent.trim(),
        transparent: true
      });

      material.extensions = {
        derivatives: true
      };

      var points = new THREE.Points(geometry, material);
      this.points = points;

      points.renderOrder = 1;

      vm.scene.add(points);

      // Invisible hover points
      var hoverMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById("hpvs").textContent.trim(),
        fragmentShader: document.getElementById("hpfs").textContent.trim(),
        transparent: true
      });

      var hoverPoints = new THREE.Points(geometry, hoverMaterial);
      vm.hoverPoints = hoverPoints;

      hoverPoints.renderOrder = 2;

      vm.pickingScene.add(hoverPoints);
      //vm.scene.add(hoverPoints);

      vm.rendererNeedsUpdate = true;
    },

    updateVertexProperties() {
      if (this.geometry && this.transformVertices.length > 0) {
        //console.log("Updating vertex properties");

        var colors = this.geometry.attributes.color.array;
        var sizes = this.geometry.attributes.size.array;
        var opacities = this.geometry.attributes.opacity.array;

        const vertices = this.transformVertices;

        let color = new THREE.Color();

        for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          const posOffset = i * 3;

          const c = this.vertexColour(v);

          color.set(c);

          colors[posOffset] = color.r;
          colors[posOffset + 1] = color.g;
          colors[posOffset + 2] = color.b;

          sizes[i] = this.vertexRadius(v);

          opacities[i] = this.vertexOpacity(v);
        }

        this.geometry.attributes.color.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.opacity.needsUpdate = true;

        // this.geometry.computeBoundingSphere();

        this.rendererNeedsUpdate = true;
      }
    },

    updateVertexOpacities() {
      if (this.geometry && this.transformVertices.length > 0) {
        console.log("Updating vertex opacities");

        var opacities = this.geometry.attributes.opacity.array;

        const vertices = this.transformVertices;

        for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          const posOffset = i * 3;

          opacities[i] = this.vertexOpacity(v);
        }

        this.geometry.attributes.opacity.needsUpdate = true;

        this.rendererNeedsUpdate = true;
      }
    },

    updateVertexPositions() {
      if (this.geometry && this.transformVertices.length > 0) {
        //console.log('Updating vertex positions');

        var positions = this.geometry.attributes.position.array;

        const vertices = this.transformVertices;

        for (let i = 0, len = vertices.length; i < len; i++) {
          const v = vertices[i];

          const posOffset = i * 3;

          if (v.x && v.y) {
            positions[posOffset] = v.x;
            positions[posOffset + 1] = v.y;
          } else {
            positions[posOffset] = 0;
            positions[posOffset + 1] = 0;
          }

          var z = this.vertexZ(v);

          positions[posOffset + 2] = z;

          this.geometry.attributes.position.needsUpdate = true;

          //this.geometry.computeBoundingSphere();

          this.rendererNeedsUpdate = true;
        }
      }
    },

    initEdges() {
      if (this.graphActivated === false || this.dataLoading) return;

      this.scene.remove(this.lineSegments);

      if (!this.showEdges || this.transformEdges.length === 0) return;

      console.log("Initialising " + this.transformEdges.length + " edges");

      var edgeGeometry = new THREE.BufferGeometry();
      this.edgeGeometry = edgeGeometry;

      var bufferPositions = [];
      var bufferColors = [];
      var bufferOpacities = [];

      var edgeColor = new THREE.Color();

      // Go through edges, set x and y position of every edge, then add links in indicies.
      const edges = this.transformEdges;

      for (let i = 0, len = edges.length; i < len; i++) {
        const e = edges[i];

        const posOffset = i * 6;

        var z = 0;
        z = this.edgeZ(e);

        bufferPositions.push(
          e.source.x,
          e.source.y,
          z,
          e.target.x,
          e.target.y,
          z
        );

        const c = this.edgeColour(e);

        edgeColor.set(c);
        bufferColors.push(edgeColor.r, edgeColor.g, edgeColor.b);
        bufferColors.push(edgeColor.r, edgeColor.g, edgeColor.b);

        const opacity = this.edgeOpacity(e);
        bufferOpacities.push(opacity, opacity);
      }

      edgeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(bufferPositions, 3).setUsage(THREE.DynamicDrawUsage)
      );
      edgeGeometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(bufferColors, 3).setUsage(THREE.DynamicDrawUsage)
      );
      edgeGeometry.setAttribute(
        "opacity",
        new THREE.Float32BufferAttribute(bufferOpacities, 1).setUsage(THREE.DynamicDrawUsage)
      );

      edgeGeometry.computeBoundingSphere();

      var edgeShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: document.getElementById("evs").textContent.trim(),
        fragmentShader: document.getElementById("efs").textContent.trim(),
        //blending: THREE.AdditiveBlending,
        //depthTest: false,
        transparent: true
      });

      var lineSegments = new THREE.LineSegments(
        edgeGeometry,
        edgeShaderMaterial
      );
      this.lineSegments = lineSegments;

      lineSegments.renderOrder = 0;

      this.scene.add(lineSegments);
    },

    updateEdges() {
      if (this.geometry && this.edgeGeometry && 
        this.transformEdges.length > 0 &&
        this.showEdges) {
        console.log("Updating " + this.transformEdges.length + " edges");

        //this.edgeGeometry.attributes.position.array = this.geometry.attributes.position.array;

        var positions = this.edgeGeometry.attributes.position.array;
        var colors = this.edgeGeometry.attributes.color.array;
        var opacities = this.edgeGeometry.attributes.opacity.array;

        const edges = this.transformEdges;

        let color = new THREE.Color();

        for (let i = 0, len = edges.length; i < len; i++) {
          const e = edges[i];

          const posOffset = i * 6;

          var z = 0;
          z = this.edgeZ(e);

          positions[posOffset] = e.source.x;
          positions[posOffset + 1] = e.source.y;
          positions[posOffset + 2] = z;
          positions[posOffset + 3] = e.target.x;
          positions[posOffset + 4] = e.target.y;
          positions[posOffset + 5] = z;

          color.set(this.edgeColour(e));

          colors[posOffset] = color.r;
          colors[posOffset + 1] = color.g;
          colors[posOffset + 2] = color.b;
          colors[posOffset + 3] = color.r;
          colors[posOffset + 4] = color.g;
          colors[posOffset + 5] = color.b;

          const opacity = this.edgeOpacity(e);
          opacities[i * 2] = opacity;
          opacities[i * 2 + 1] = opacity;
        }

        this.edgeGeometry.attributes.position.needsUpdate = true;
        this.edgeGeometry.attributes.color.needsUpdate = true;
        this.edgeGeometry.attributes.opacity.needsUpdate = true;

        this.rendererNeedsUpdate = true;
      }
    },

    generateIndexedVertices() {
      const indexedVertices = [];

      for (let i = 0, len = this.transformVertices.length; i < len; i++) {
        const v = this.transformVertices[i];

        v.index = i;

        indexedVertices.push(v);
      }

      this.indexedVertices = indexedVertices;
    },

    restartSimulation() {
      var vm = this;

      if (!this.graphActivated || this.dataLoading) {
        console.log('Not starting simulation');

        return;
      }

      console.log('Starting/restarting simulation');

      if (this.simulation) {
        this.simulation.terminate();

        this.simulation = null;
      }

      if (!this.simulation && this.animateGraph) {
        const workerURL = URL.createObjectURL(
          new Blob(["(", force.forceSim.toString(), ")()"], {
            type: "application/javascript"
          })
        );

        this.simulation = new Worker(workerURL);

        var returnData = false;

        if (typeof SharedArrayBuffer === "undefined") {
          console.warn("SharedArrayBuffer is undefined");

          returnData = true;
        }

        var verticesBuffer = null;
        
        if (returnData === false) {
          verticesBuffer = new SharedArrayBuffer(
            this.transformVertices.length * (4 * 4)
          );
        } else {
          verticesBuffer = new ArrayBuffer(
            this.transformVertices.length * (4 * 4)
          );
        }

        this.simulation.onmessage = function(event) {
          if (event.data.type === "tick") {
            var vB = null;

            if (typeof SharedArrayBuffer !== "undefined") {
              vB = verticesBuffer;
            } else {
              vB = event.data.verticesBuffer;
            }

            const vDV = new DataView(vB);

            for (let i = 0, bLen = vB.byteLength; i < bLen; i = i + 4 * 4) {
              const index = vDV.getUint32(i);
              const x = vDV.getFloat32(i + 4);
              const y = vDV.getFloat32(i + 8);

              const v = vm.indexedVertices[index];

              v.x = x;
              v.y = y;
            }

            vm.vertexPositionsNeedsUpdate = true;
            vm.edgesNeedsUpdate = true;
            vm.rendererNeedsUpdate = true;
          }
        };

        for (let i = 0, len = this.indexedVertices.length; i < len; i++) {
          const v = this.transformVertices[i];

          const offset = i * (4 * 4);

          const dV = new DataView(verticesBuffer);
          dV.setUint32(offset, v.index);
          dV.setFloat32(offset + 4, v.x);
          dV.setFloat32(offset + 8, v.y);
          dV.setFloat32(offset + 12, vm.vertexRadius(v));
        }

        var edgesBuffer = null;

        if (returnData === false) {
          edgesBuffer = new SharedArrayBuffer(
            this.transformEdges.length * (4 + 4)
          );
        } else {
          edgesBuffer = new ArrayBuffer(
            this.transformEdges.length * (4 + 4)
          );
        }

        for (let i = 0, len = this.transformEdges.length; i < len; i++) {
          const v = this.transformEdges[i];

          const offset = i * (4 + 4);

          const dV = new DataView(edgesBuffer);
          dV.setUint32(offset, v.source.index);
          dV.setUint32(offset + 4, v.target.index);
        }

        this.simulation.postMessage({
          verticesBuffer: verticesBuffer,
          edgesBuffer: edgesBuffer,
          returnData: returnData,
          linkStrength: this.linkStrength,
          theta: this.theta,
          vertexStrength: this.vertexStrength
        });

        URL.revokeObjectURL(workerURL);
      }
    },

    fullDraw() {
      if (this.graphActivated === false) return;

      console.log("Full draw");

      this.generateIndexedVertices();

      this.initVertices();
      this.initEdges();

      this.simulationNeedsUpdate = true;

      this.mouseNeedsUpdate = true;
      this.vertexPropertiesNeedsUpdate = true;
      this.vertexPositionsNeedsUpdate = true;
      this.rendererNeedsUpdate = true;
    },
    
    selectObject() {
      if (this.highlightVertices) {
        this.highlightedVertices = new Set();

        if (this.selectedObject &&
          this.selectedObjectType === "vertex") {
          this.highlightedVertices.add(this.selectedObject.id);

          const edges = this.transformEdges;

          for (let i = 0, len = edges.length; i < len; i++) {
            const e = edges[i];

            if (
              e.source.id === this.selectedObject.id ||
              e.target.id === this.selectedObject.id
            ) {
              this.highlightedVertices.add(e.source.id);
              this.highlightedVertices.add(e.target.id);
            }
          }
        }

        this.vertexPositionsNeedsUpdate = true;
        this.vertexOpacitiesNeedsUpdate = true;
        this.edgesNeedsUpdate = true;
      }
    },

    getScaleFromZ(camera_z_position) {
      let half_fov = this.fov / 2;
      let half_fov_radians = this.toRadians(half_fov);
      let half_fov_height = Math.tan(half_fov_radians) * camera_z_position;
      let fov_height = half_fov_height * 2;
      let scale = this.height / fov_height;

      return scale;
    },

    getZFromScale(scale) {
      let half_fov = this.fov / 2;
      let half_fov_radians = this.toRadians(half_fov);
      let scale_height = this.height / scale;
      let camera_z_position = scale_height / (2 * Math.tan(half_fov_radians));

      return camera_z_position;
    },

    toRadians(angle) {
      return angle * (Math.PI / 180);
    },

    edgeZ(edge) {
      if (this.selectingObject) {
        if (
          edge.source.id === this.selectedObject.id ||
          edge.target.id === this.selectedObject.id
        ) {
          return 0.2;
        }
      } else {
        if (this.filteringObject) {
          if (edge.source["selected"] && edge.target["selected"]) {
            return 0.1;
          }
        }
      }

      return 0;
    },

    edgeOpacity(edge) {
      if (this.selectingObject) {
        if (edge.source.id === this.selectedObject.id || edge.target.id === this.selectedObject.id) {
          return 1.0;
        } else {
          return 0.15;
        }
      }

      if (this.filteringObject) {
        if (edge.source["selected"] && edge.target["selected"]) {
          return 1.0;
        } else {
          return 0.15;
        }
      }

      if (this.linkOpacity)
        return this.linkOpacity;

      // Default value
      return 0.8;
    },

    edgeColour(edge) {
      if (this.linkColour)
        return this.linkColour;

      return "#8f8f8f";
    },

    vertexZ(vertex) {
      if (this.highlightedVertices.has(vertex.id)) 
        return 0.2;

      if (vertex["selected"])
        return 0.1;

      return 0;
    },

    vertexRadius(vertex) {
      if (vertex["radius"]) {
        return vertex["radius"];
      }

      return 8;
    },

    vertexColour(vertex) {
      if (vertex["colour"]) {
        return utils.rgbToHex(vertex["colour"]);
      }

      return "#535253";
    },

    vertexOpacity(vertex) {
      if (this.highlightedVertices.size > 0 && this.highlightVertices) {
        if (this.highlightedVertices.has(vertex.id)) {
          return 1.0;
        }

        return 0.1;
      }

      if (!vertex["selected"]) {
        return 0.1;
      }

      return 1.0;
    }
  },

  beforeDestroy() {
    console.log("Before destroy")
    if (this.simulation) this.simulation.terminate();

    //this.stage.removeChildren();
    //this.stage.destroy({ children: true, texture: true, baseTexture: true });

    window.removeEventListener("resize", this.resize);
    window.removeEventListener("keydown", this.keydown);

    this.renderer = null;
    this.stage = null;
    this.simulation = null;
  }
};
</script>

<style>
#graph-item {
  line-height: 0;
  position: absolute;
}
</style>
