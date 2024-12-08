[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ZUtYscbQ)

# Final Project - Berlima: Drone Simulator Game

## Team Member

| Name                         | NRP        | Class               |
| ---------------------------- | ---------- | ------------------- |
| Ainun Nadhifah Syamsiyah     | 5025221053 | Computer Graphics B |
| Muhammad Ihsan Al Khwaritsmi | 5025221211 | Computer Graphics B |
| Putu Indra Mahendra          | 5025221215 | Computer Graphics B |
| Garda Sudarmanto             | 5025221268 | Computer Graphics B |
| Yosua Hares                  | 5025221270 | Computer Graphics B |

## Background

The Drone Simulator Game using Three.js is a web-based 3D flying experience that allows players to control a virtual drone in a browser environment. The game focuses on realistic drone flight physics, where players navigate through various outdoor and indoor settings like cityscapes, forests, and obstacle courses. The use of Three.js ensures that the game runs smoothly on the web, offering lightweight yet immersive 3D graphics and dynamic environments.

Players will complete a series of missions, including navigating through challenging terrain, delivering packages, and racing against AI or other players. Each mission will require players to handle real-world physics, such as managing the drone's speed, altitude, and battery life while also adapting to wind or weather effects. Players can view the game from a first-person camera mounted on the drone or a third-person perspective for a broader view of their surroundings.

Technically, the game will leverage Three.js for rendering 3D environments, while physics and flight dynamics will be simulated using JavaScript libraries. The project will be optimized for web browsers, ensuring accessibility on different devices. It will also include features like responsive controls, customizable drones, and interactive multiplayer modes, making it an exciting and interactive drone flying experience for users on the web.

## Development Process

1. Importing the envmap and the Landscape

   The envmap is used to enhance the realism of materials by simulating reflections or lighting from the surrounding environment. to do this we need to import the `envmap.jpg` and then map it into a sphere.

   ![alt text](<img/Screenshot from 2024-11-30 16-33-59.png>)

   The sphere is then used to render the environment by making it as if the observer were inside of the envmap-sphere. Which we then used to give a sense of realism to landscape.
   ![alt text](<img/Screenshot from 2024-11-30 17-51-55.png>)
   The landscape was rendered with this tools called `GLTF` to render the `scene.glb`.

2. Importing the airplane
   spawn the airplane
   ![alt text](<img/Screenshot from 2024-11-30 21-24-56.png>)

   Reposition the airplane
   ![alt text](<img/Screenshot from 2024-11-30 21-40-35.png>)

3. Set the camera FOV
   ![alt text](<img/Screenshot from 2024-12-01 00-15-04.png>)
