# Sistema_Solar

## Descripción 
Este código implementa una simulación interactiva de un sistema solar en Three.js https://codesandbox.io/p/sandbox/ig2526-s6-forked-4kc9cq. https://4kc9cq.csb.app/
El programa crea una escena tridimensional donde se representan el Sol, los planetas, y la luna. Además, permite al usuario explorar el sistema solar de tres maneras distintas: modo orbital, modo nave espacial, y modo creación.
En el modo orbital, se pueden observar las órbitas y moverse libremente con el ratón; en el modo nave, el usuario controla la cámara como si pilotara una nave; y en el modo creación, puede crear nuevos planetas haciendo clic en el espacio. 

Desde este enlace se puede acceder a un video de demostración  https://youtu.be/6hdR6sbAoqo

El codigo cuenta con varias funciones, en la funcion init() se inicializa toda la escena.
Crea los elementos HTML para mostrar información y botones de control, configura el renderer, la cámara y la escena de Three.js, agrega las luces, carga las texturas, crea el Sol y los planetas, y añade los controles orbitales.
También define los eventos de teclado y ratón, y establece las condiciones iniciales para la animación.

## Creación de objetos de la escena
La creación de los objetos visibles se ha delegado en tres funciones: 

Estrella() 
Crea la estrella principal (el Sol) del sistema.
Genera una esfera con una textura y un material emisivo (brillante) que simula la luz del Sol.
Además, añade una luz puntual que ilumina toda la escena.

Planeta()
Crea un planeta con los parámetros indicados.
Genera una esfera con una textura y color, le asigna su distancia al Sol, velocidad de rotación y órbita, y dibuja una línea que representa su trayectoria elíptica.
Cada planeta se guarda en el arreglo global Planetas.

Luna()
Crea una luna asociada a un planeta.
Añade un objeto que orbita alrededor del planeta padre, utilizando un pivote que permite la rotación orbital.
La luna también se almacena en el arreglo Lunas.

## Manejo de modos de visualización 

El proyecto cuenta con tres modos de visualización, para manejar cada modo se han definido dos variables globales que son controladas por las siguientes funcones:

toggleMode()
Permite alternar entre el modo orbital y el modo nave espacial.
En modo nave, los controles del ratón se desactivan y se activan los movimientos con teclado; en modo orbital, se vuelve al control con el ratón y la cámara regresa a su posición inicial.
También actualiza los textos informativos y los colores de los botones.

toggleCreateMode()
Activa o desactiva el modo de creación de planetas.
Desactiva los controles orbitales y permite que los clics creen nuevos cuerpos.
También cambia los textos y botones correspondientes para reflejar el modo actual.

updateModeInfo()
Actualiza el texto informativo en pantalla dependiendo del modo activo (orbital, nave o creación).
Muestra las instrucciones de control específicas de cada modo.

### Manejo de eventos

onKeyDown(event) y onKeyUp(event)
Estas funciones manejan las teclas presionadas y soltadas en el modo nave.
Detectan las teclas de movimiento (W, A, S, D, Q, E) y las flechas para rotar la cámara, permitiendo moverse en cualquier dirección y rotar como si fuera una nave espacial.
La barra espaciadora detiene el movimiento.


onDocumentMouseDown(event)
Se ejecuta cuando el usuario hace clic con el ratón.
Solo funciona en el modo "creación".
Usa un raycaster (una especie de rayo invisible) para detectar la posición del clic sobre un plano invisible, y en ese punto genera un nuevo planeta con características aleatorias (color, tamaño, velocidad y distancia).
También dibuja su órbita y lo añade al sistema solar.

updateShipControls()
Actualiza la posición y orientación de la cámara según las teclas presionadas en el modo nave.
Calcula la dirección actual de la cámara y ajusta su velocidad y rotación, simulando la física de una nave en el espacio.
La velocidad se acumula progresivamente, generando un movimiento suave.

animationLoop()
Es el bucle principal de animación.
Actualiza la posición de los planetas y lunas en función del tiempo, rotando sus órbitas de forma continua.
También llama a updateShipControls() si está activo el modo nave, y finalmente renderiza la escena en cada fotograma.

window.addEventListener('resize', ...)
Ajusta la cámara y el tamaño del renderizado cuando el usuario cambia el tamaño de la ventana, para mantener las proporciones correctas de la escena.

 


