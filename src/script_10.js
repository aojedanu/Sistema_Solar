import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

let scene, renderer;
let camera;
let info, modeInfo;
let grid;
let estrella,
  Planetas = [],
  Lunas = [];
let t0 = 0;
let accglobal = 0.001;
let timestamp;
let orbitControls;

// Variables para modo nave
let shipMode = true;
let shipVelocity = new THREE.Vector3();
let shipSpeed = 0.05;
let shipRotationSpeed = 0.02;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
let rotateLeft = false, rotateRight = false, rotateUp = false, rotateDown = false;

// Raycaster para modo creación
let currentMode = 'orbital';
let planoInvisible;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

init();
animationLoop();

function init() {
  // Estilos globales
  const style = document.createElement('style');
  style.textContent = `
    .btn {
      position: absolute;
      top: 70px;
      padding: 10px 20px;
      color: white;
      border: none;
      cursor: pointer;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);

  // Info superior
  info = document.createElement("div");
  info.style.cssText = "position:absolute;top:30px;width:100%;text-align:center;color:#fff;font-weight:bold;z-index:1";
  info.innerHTML = "Sistema Solar - Modo Vista Orbital";
  document.body.appendChild(info);

  // Info de controles
  modeInfo = document.createElement("div");
  modeInfo.style.cssText = "position:absolute;bottom:30px;left:30px;color:#fff;background:rgba(0,0,0,0.7);padding:15px;z-index:1;font-size:12px";
  updateModeInfo();
  document.body.appendChild(modeInfo);

  // Boton modo nave
  const modeButton = document.createElement("button");
  modeButton.className = "btn";
  modeButton.style.cssText = "left:calc(50% - 100px);background:#4CAF50";
  modeButton.innerHTML = "Cambiar a Modo Nave";
  modeButton.onclick = toggleMode;
  document.body.appendChild(modeButton);
  window.modeButton = modeButton;

  // Boton modo creacion
  const createButton = document.createElement("button");
  createButton.className = "btn";
  createButton.style.cssText = "left:calc(50% + 100px);background:#9C27B0";
  createButton.innerHTML = "Modo Creación";
  createButton.onclick = toggleCreateMode;
  document.body.appendChild(createButton);
  window.createButton = createButton;

  // Escena
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 10);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  renderer.domElement.addEventListener("mousedown", onDocumentMouseDown);

  // Plano invisible
  const geometryPlane = new THREE.PlaneGeometry(100, 100);
  const materialPlane = new THREE.MeshBasicMaterial({ visible: false });
  planoInvisible = new THREE.Mesh(geometryPlane, materialPlane);
  scene.add(planoInvisible);

  // Rejilla
  grid = new THREE.GridHelper(20, 40);
  grid.geometry.rotateX(Math.PI / 2);
  grid.position.set(0, 0, 0.05);
  scene.add(grid);

  // Texturas
  const textura_tierra = new THREE.TextureLoader().load("src/earthmap.jpg");
  const textura_venus = new THREE.TextureLoader().load("src/venusmap.jpg");
  const textura_mercurio = new THREE.TextureLoader().load("src/mercurymap.jpg");
  const textura_marte = new THREE.TextureLoader().load("src/mars_thumbnail.jpg");
  const textura_jupiter = new THREE.TextureLoader().load("src/jupitermap.jpg");
  const textura_saturno = new THREE.TextureLoader().load("src/saturnmap.jpg");
  const textura_urano = new THREE.TextureLoader().load("src/uranusmap.jpg");
  const textura_neptuno = new THREE.TextureLoader().load("src/neptunemap.jpg");
  const textura_sol = new THREE.TextureLoader().load("src/sunmap.jpg");
  const textura_fondo = new THREE.TextureLoader().load("src/stars.jpg");
  scene.background = textura_fondo;

  // Crear sistema solar
  Estrella(1.5, textura_sol);
  Planeta(0.2, 1.0, 0.07, textura_mercurio, 0xb5b5b5, 4.0, 1.0, "Mercurio");
  Planeta(0.25, 1.6, 0.1, textura_venus, 0xeccc68, 3.5, -1.0, "Venus");
  Planeta(0.3, 2.3, 0.1, textura_tierra, 0x1e90ff, 3.0, 1.0, "Tierra");
  Planeta(0.25, 3.2, 0.2, textura_marte, 0xff4500, 2.5, 1.0, "Marte");
  Planeta(0.6, 4.5, 0.5, textura_jupiter, 0xffa500, 2.0, 1.0, "Júpiter");
  Planeta(0.5, 5.8, 1.0, textura_saturno, 0xf5deb3, 1.8, 1.0, "Saturno");
  Planeta(0.4, 7.0, 0.4, textura_urano, 0x40e0d0, 1.6, 1.0, "Urano");
  Planeta(0.4, 8.2, 0.7, textura_neptuno, 0x4169e1, 1.4, 1.0, "Neptuno");
  Luna(Planetas[2], 0.08, 0.45, -3.5, 0xcccccc, 0.0);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const luzAmbiente = new THREE.AmbientLight(0x222222, 0.5);
  scene.add(luzAmbiente);

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  t0 = Date.now();
}

function Estrella(rad, textura) {
  const geometry = new THREE.SphereGeometry(rad, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    emissive: 0xffff00,
    emissiveIntensity: 1.5,
    map: textura,
  });
  estrella = new THREE.Mesh(geometry, material);
  estrella.castShadow = false;
  estrella.receiveShadow = false;
  scene.add(estrella);

  const luzSol = new THREE.PointLight(0xffffff, 3, 100);
  luzSol.castShadow = true;
  luzSol.shadow.mapSize.width = 1024;
  luzSol.shadow.mapSize.height = 1024;
  luzSol.position.set(0, 0, 0);
  scene.add(luzSol);
}

function Planeta(radio, dist, vel, textura, col, f1, f2, nombre) {
  const geom = new THREE.SphereGeometry(radio, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    map: textura,
    color: col,
  });
  const planeta = new THREE.Mesh(geom, mat);
  planeta.userData.dist = dist;
  planeta.userData.speed = vel;
  planeta.userData.f1 = f1;
  planeta.userData.f2 = f2;
  planeta.userData.nombre = nombre;

  planeta.castShadow = true;
  planeta.receiveShadow = true;

  Planetas.push(planeta);
  scene.add(planeta);

  // Órbita
  const curve = new THREE.EllipseCurve(0, 0, dist * f1, dist * f2);
  const points = curve.getPoints(100);
  const geome = new THREE.BufferGeometry().setFromPoints(points);
  const mate = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  const orbita = new THREE.Line(geome, mate);
  scene.add(orbita);
}

function Luna(planeta, radio, dist, vel, col, angle) {
  const pivote = new THREE.Object3D();
  pivote.rotation.x = angle;
  planeta.add(pivote);
  const geom = new THREE.SphereGeometry(radio, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ color: col });
  const luna = new THREE.Mesh(geom, mat);
  luna.userData.dist = dist;
  luna.userData.speed = vel;
  luna.castShadow = true;
  luna.receiveShadow = true;

  Lunas.push(luna);
  pivote.add(luna);
}
function onDocumentMouseDown(event) {
  if (currentMode !== 'create') return;
  
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(planoInvisible);
  
  if (intersects.length > 0) {
    // === Configuración aleatoria ===
    const textura_random = new THREE.TextureLoader().load("src/moonmap.jpg");
    const colores = [0xff6b6b, 0x4ecdc4, 0x95e1d3, 0xffa07a, 0x9b59b6, 0x3498db];
    const color = colores[Math.floor(Math.random() * colores.length)];
    const radio = 0.2 + Math.random() * 0.4;

    // === Calcular parámetros orbitales ===
    const punto = intersects[0].point;
    const dist = punto.length(); // distancia desde el sol (0,0,0)
    const f1 = 1.0 + Math.random() * 1.5; // factor elíptico
    const f2 = 1.0 + Math.random() * 1.5;
    const speed = 0.3 + Math.random() * 0.5; // velocidad orbital

    // === Crear el planeta ===
    const geom = new THREE.SphereGeometry(radio, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ map: textura_random, color });
    const planeta = new THREE.Mesh(geom, mat);
    planeta.castShadow = true;
    planeta.receiveShadow = true;

    // Asignar datos orbitales
    planeta.userData = {
      dist,
      f1,
      f2,
      speed,
      nombre: "Planeta_random",
    };

    // Añadir a la escena y al array global
    scene.add(planeta);
    Planetas.push(planeta);

    // === Dibujar la órbita ===
    const curve = new THREE.EllipseCurve(0, 0, dist * f1, dist * f2);
    const points = curve.getPoints(100);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
    const orbit = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbit);

    console.log(`Nuevo planeta creado a ${dist.toFixed(2)} unidades del Sol.`);
  }
}


function toggleMode() {
  shipMode = !shipMode;

  if (shipMode) {
    currentMode = 'ship';
    orbitControls.enabled = false;
    info.innerHTML = "Sistema Solar - Modo Nave Espacial";
    window.modeButton.innerHTML = "Modo Orbital";
    window.modeButton.style.background = "#2196F3";
    grid.visible = false;
  } else {
    currentMode = 'orbital';
    orbitControls.enabled = true;
    info.innerHTML = "Sistema Solar - Modo Vista Orbital";
    window.modeButton.innerHTML = "Modo Nave";
    window.modeButton.style.background = "#4CAF50";
    grid.visible = true;
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }

  updateModeInfo();
}

function toggleCreateMode() {
  if (currentMode === 'create') {
    currentMode = 'orbital';
    orbitControls.enabled = true;
    info.innerHTML = "Sistema Solar - Modo Vista Orbital";
    window.createButton.innerHTML = "Modo Creación";
    window.createButton.style.background = "#9C27B0";
    grid.visible = true;
  } else {
    currentMode = 'create';
    orbitControls.enabled = false;
    shipMode = false;
    info.innerHTML = "Sistema Solar - Modo Creación";
    window.modeButton.innerHTML = "Modo Nave";
    window.createButton.innerHTML = "Modo Orbital";
    window.createButton.style.background = "#7B1FA2";
    grid.visible = false;
  }
  updateModeInfo();
}

function updateModeInfo() {
  if (shipMode && currentMode === 'ship') {
    modeInfo.innerHTML = "<strong>CONTROLES NAVE:</strong><br>W/S: Avanzar/Retroceder<br>A/D: Izquierda/Derecha<br>Q/E: Subir/Bajar<br>Flechas: Rotar<br>Espacio: Frenar";
  } else if (currentMode === 'create') {
    modeInfo.innerHTML = "<strong>MODO CREACIÓN:</strong><br>Click izquierdo: Crear planeta";
  } else {
    modeInfo.innerHTML = "<strong>CONTROLES ORBITAL:</strong><br>Click izq + arrastrar: Rotar<br>Rueda: Zoom<br>Click der + arrastrar: Pan";
  }
}

function onKeyDown(event) {
  if (!shipMode) return;
  
  switch(event.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyD': moveRight = true; break;
    case 'KeyQ': moveUp = true; break;
    case 'KeyE': moveDown = true; break;
    case 'ArrowLeft': rotateLeft = true; break;
    case 'ArrowRight': rotateRight = true; break;
    case 'ArrowUp': rotateUp = true; break;
    case 'ArrowDown': rotateDown = true; break;
    case 'Space': 
      shipVelocity.set(0, 0, 0);
      event.preventDefault();
      break;
  }
}

function onKeyUp(event) {
  if (!shipMode) return;
  
  switch(event.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyD': moveRight = false; break;
    case 'KeyQ': moveUp = false; break;
    case 'KeyE': moveDown = false; break;
    case 'ArrowLeft': rotateLeft = false; break;
    case 'ArrowRight': rotateRight = false; break;
    case 'ArrowUp': rotateUp = false; break;
    case 'ArrowDown': rotateDown = false; break;
  }
}

function updateShipControls() {
  if (!shipMode) return;

  if (rotateLeft) camera.rotation.z += shipRotationSpeed;
  if (rotateRight) camera.rotation.z -= shipRotationSpeed;
  if (rotateUp) camera.rotation.x += shipRotationSpeed;
  if (rotateDown) camera.rotation.x -= shipRotationSpeed;

  const direction = new THREE.Vector3();
  
  if (moveForward) {
    camera.getWorldDirection(direction);
    shipVelocity.add(direction.multiplyScalar(shipSpeed * 0.1));
  }
  if (moveBackward) {
    camera.getWorldDirection(direction);
    shipVelocity.add(direction.multiplyScalar(-shipSpeed * 0.1));
  }
  if (moveLeft) {
    direction.set(-1, 0, 0).applyQuaternion(camera.quaternion);
    shipVelocity.add(direction.multiplyScalar(shipSpeed * 0.1));
  }
  if (moveRight) {
    direction.set(1, 0, 0).applyQuaternion(camera.quaternion);
    shipVelocity.add(direction.multiplyScalar(shipSpeed * 0.1));
  }
  if (moveUp) {
    direction.set(0, 1, 0).applyQuaternion(camera.quaternion);
    shipVelocity.add(direction.multiplyScalar(shipSpeed * 0.1));
  }
  if (moveDown) {
    direction.set(0, -1, 0).applyQuaternion(camera.quaternion);
    shipVelocity.add(direction.multiplyScalar(shipSpeed * 0.1));
  }

  camera.position.add(shipVelocity);
}

function animationLoop() {
  timestamp = (Date.now() - t0) * accglobal;
  requestAnimationFrame(animationLoop);

  for (let object of Planetas) {
    if (object.userData.dist > 0) {
      object.position.x = Math.cos(timestamp * object.userData.speed) * object.userData.f1 * object.userData.dist;
      object.position.y = Math.sin(timestamp * object.userData.speed) * object.userData.f2 * object.userData.dist;
    }
    object.rotation.y += object.userData.rotSpeed || 0.01;
  }

  for (let object of Lunas) {
    object.position.x = Math.cos(timestamp * object.userData.speed) * object.userData.dist;
    object.position.y = Math.sin(timestamp * object.userData.speed) * object.userData.dist;
  }

  if (estrella) estrella.rotation.y += 0.001;
  if (shipMode) updateShipControls();

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});