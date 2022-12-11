import * as THREE from 'three';
import geometries from './rooms/2.json';
import textures from './rooms/1.json';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setClearColor(0xffffff, 1);

const controls = new OrbitControls(camera, renderer.domElement)

const rooms = Object.entries(geometries.rooms);
const corners = geometries.corners;
const texturesData = Object.keys(textures.tour.rooms).map(key => textures.tour.rooms[key].url);

// add walls using corners in geometries
const addWall = (id, thickness) => {
  const startX = corners.find(corner => corner.wallStarts.find(wallStarts => wallStarts.id === id)).x;
  const startY = corners.find(corner => corner.wallStarts.find(wallStarts => wallStarts.id === id)).y;
  const endX = corners.find(corner => corner.wallEnds.find(wallEnds => wallEnds.id === id)).x;
  const endY = corners.find(corner => corner.wallEnds.find(wallEnds => wallEnds.id === id)).y;
  const geometry = new THREE.BoxGeometry(Math.abs(startX - endX) + thickness, 100, Math.abs(startY - endY) + thickness);
  const material = new THREE.MeshNormalMaterial();
  const wall = new THREE.Mesh(geometry, material);
  wall.position.x = (startX + endX) / 2;
  wall.position.z = (startY + endY) / 2;
  scene.add(wall);
}

corners.forEach(corner => {
  addWall(corner.wallStarts[0].id, corner.wallStarts[0].thickness);
  addWall(corner.wallEnds[0].id, corner.wallEnds[0].thickness);
});

// add interior walls to paint them with textures from texturesData
const addInteriorWalls = (startX, startY, endX, endY, texture) => {
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const geometry = new THREE.BoxGeometry(Math.abs(startX - endX) + 5, 100, Math.abs(startY - endY) + 5);
  const wall = new THREE.Mesh(geometry, material);
  wall.position.x = (startX + endX) / 2;
  wall.position.z = (startY + endY) / 2;
  scene.add(wall);
}

// for each room in geometries, build interior walls with textures from texturesData
rooms.forEach(([key, room]) => {
  const texture = new THREE.TextureLoader().load(texturesData[key]);
  room.interiorCorners.forEach((corner, index) => {
    if (index === 0) {
      return;
    }
    const startX = room.interiorCorners[index - 1].x;
    const startY = room.interiorCorners[index - 1].y;
    const endX = corner.x;
    const endY = corner.y;
    addInteriorWalls(startX, startY, endX, endY, texture);
  });
  addInteriorWalls(room.interiorCorners[0].x, room.interiorCorners[0].y, room.interiorCorners[room.interiorCorners.length - 1].x, room.interiorCorners[room.interiorCorners.length - 1].y, texture); 
})

camera.position.z = 5

const animate = function () {
  requestAnimationFrame(animate)

  controls.update()

  renderer.render(scene, camera)
}

animate()