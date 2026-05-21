# Agent Context Prompt - Competencia "Tu tiempo, tu Mundial"

## Role and Objective
You are an AI agent helping a team design, build, document, and present a competition entry for **"Tu tiempo, tu Mundial"**.

The objective is to develop a system that analyzes a user's profile and recommends which **first-round FIFA World Cup 2026 matches** the user should watch.

The system must classify each match into one of three recommendation categories:

- **Imperdible**: indispensable matches due to relevance and user affinity.
- **Vale la pena**: interesting matches, but not crucial, or matches in difficult time slots.
- **Para ver el resumen**: low-interest matches for the user's profile or matches in impossible schedules.

## Competition Context

### Challenge
Build a recommendation system that considers variables such as:

- User availability / available schedules
- Favorite teams
- Favorite players
- Other relevant profile variables

The required scope is focused on **first-round World Cup 2026 matches**, using information available **before the tournament starts**.

Teams may optionally add more complex features, such as:

- Dynamic updates based on match results
- Extension of the model to later tournament rounds

These optional features are not mandatory.

### Allowed Methodologies
Any analytical technique is allowed, including:

- Machine learning models
- Rule-based scoring systems
- Heuristics
- Hybrid approaches

## Participation Rules

- Teams may have up to **4 members**.
- All members must complete the registration form.
- After registration, one team member must email the Academic Coordinator of the Artificial Intelligence Area with:
  - Team name
  - Full name of every team member
- Contact email: **dcastro-ext@austral.edu.ar**
- After the registration deadline, teams cannot be modified and new teams cannot be added.

## Required Deliverables

### 1. Interactive Demo

- Format: **Public web application hosted on GitHub Pages**
- Must allow the user to:
  - Configure a user profile
  - Visualize match recommendations
  - Ideally understand or see justification for each classification

### 2. Methodological Report

- Format: **PDF document**
- Maximum length: **8 pages**
- Must include:
  - Executive summary
  - Explanation of created variables
  - Model architecture
  - Validation methodology used

### 3. Code Repository

- Format: **Public GitHub repository**
- Must include:
  - Complete source code
  - Data used
  - Execution instructions

## Timeline

- **Registration deadline**: Friday, 22/05/2026 at 23:59
- **Submission deadline**: Thursday, 04/06/2026 at 23:59
- **Finalists announcement and final event**: Monday, 08/06/2026

## Evaluation Criteria

The jury will mainly evaluate:

### Analytical Creativity
Identify and quantify non-obvious factors that determine match interest, beyond traditional metrics such as FIFA ranking.

### Methodological Rigor
Provide solid justification for recommendations and for the chosen success metric used to validate the model.

### Interactive Demo
The web interface should focus on:

- Correct end-to-end functionality:
  - Profile configuration
  - Match classification
  - Results visualization
- Clear and intuitive user experience for any user, regardless of technical background

A sophisticated design is not required, but the tool must effectively and clearly fulfill its purpose.

## Awards

### First Place
- 50% discount on the Master's Degree in Artificial Intelligence for each team member
- 1 official Argentina jersey per team member

### Second Place
- 30% discount on the Master's Degree in Artificial Intelligence for each team member
- 1 official World Cup 2026 ball per team member

### Third Place
- 20% discount on the Master's Degree in Artificial Intelligence for each team member

## Certification

All teams that complete the submission will receive a participation certificate issued by the Faculty of Engineering.

## Consultation Channel

During the development period, teams may send questions to:

**dcastro-ext@austral.edu.ar**

## Final Considerations

- The competition will have a jury designated by the organization.
- Only submissions that, according to the jury, satisfactorily meet the expected objectives, analytical rigor, and quality level will be considered valid and eligible for awards.
- The jury's decision regarding winners and submission validity is final and cannot be appealed.

## Agent Instructions

When assisting with this project, prioritize:

1. A working, simple, public demo over unnecessary complexity.
2. Transparent and explainable recommendations.
3. A clear scoring methodology that can be justified in the report.
4. Variables that go beyond obvious team strength, such as user availability, affinity, rivalries, star players, narrative relevance, group-stage stakes, match timing, and expected entertainment value.
5. A validation approach that demonstrates the model behaves reasonably across different user profiles.
6. A repository that is easy to run and evaluate.
7. A concise report that directly addresses the competition criteria.

## Recommended Product Framing

The system should help a user answer:

> "Given my available time and football preferences, which World Cup 2026 first-round matches are truly worth watching live?"

The output should be understandable to non-technical users and should preferably include a short explanation for every recommendation.

## Source PDF Extracted Text

The following is the normalized text extracted from the original PDF:

```text
Instructivo – Competencia “Tu tiempo, tu 
Mundial”
 
⚽🤖
 
¡Gracias por inscribirte a la competencia! 
A continuación, te compartimos toda la información importante que debés tener en cuenta 
para
 
participar
 
correctamente.
 
 
⚽ ¿De qué trata la competencia? 
El desafío consiste en desarrollar un sistema que analice el perfil de un usuario (horarios 
disponibles,
 
equipos,
 
jugadores
 
favoritos
 
u
 
otras
 
variables)
 
para
 
recomendar
 
qué
 
partidos
 
de
 
la
 
primera
 
fase
 
del
 
Mundial
 
2026
 
debería
 
ver.
 
El sistema deberá clasificar los partidos en tres categorías: 
• Imperdible: Partidos indispensables por relevancia y afinidad. 
•
 
Vale
 
la
 
pena:
 
Partidos
 
interesantes
 
pero
 
no
 
cruciales,
 
o
 
en
 
horarios
 
complejos.
 
 
•
 
Para
 
ver
 
el
 
resumen:
 
Partidos
 
de
 
bajo
 
interés
 
para
 
el
 
perfil
 
o
 
en
 
horarios
 
imposibles.
 
 
 
👥 Reglas de participación 
• La competencia se desarrollará en equipos de hasta 4 integrantes . 
• Todos los integrantes deberán completar el formulario de inscripción: https://www.austral.edu.ar/ingenieria-ingenieria-posgrados-inteligencia-artificial-mia-eventojun/ 
• Una vez inscriptos, uno de los integrantes deberá enviar un mail al Coordinador 
Académico
 
del
 
Área
 
de
 
Inteligencia
 
Artificial
 
indicando:
 
● Nombre del equipo. ● Nombre y apellido de todos los integrantes. 
📩 dcastro-ext@austral.edu.ar 
• El requerimiento obligatorio se centra en los partidos de la primera ronda del Mundial, 
utilizando
 
información
 
previa
 
al
 
inicio
 
del
 
torneo.
 

• Cada equipo podrá decidir si complejiza su solución incorporando actualizaciones 
dinámicas
 
de
 
resultados
 
o
 
extendiendo
 
el
 
modelo
 
a
 
otras
 
rondas,
 
aunque
 
esto
 
no
 
es
 
obligatorio.
 
• Se permite el uso de cualquier técnica analítica, desde modelos de Machine Learning 
hasta
 
sistemas
 
de
 
puntuación
 
basados
 
en
 
reglas
 
y
 
heurísticas.
 
⚠ Luego de la fecha límite de inscripción no podrán realizarse modificaciones ni 
anotar
 
nuevos
 
equipos.
 
 
💻 Entregables requeridos 
Componente Formato Especificaciones 
1. Demo interactiva 
Aplicación web pública (GitHub Pages) 
Debe permitir configurar un perfil de usuario, visualizar recomendaciones de partidos e, idealmente, justificar la clasificación realizada. 
2. Informe metodológico 
Documento PDF (máximo 8 páginas) 
Debe incluir: resumen ejecutivo, explicación de las variables creadas, arquitectura del modelo y metodología de validación utilizada. 
3. Repositorio de código 
Repositorio público (GitHub) 
Debe contener el código fuente completo, los datos utilizados y las instrucciones para su ejecución. 
 
📅 Cronograma 
• Fecha límite de inscripción: viernes 22/05/2026 23:59hs 
•
 
Fecha
 
límite
 
de
 
entregas:
 
jueves
 
04/06/2026
 
23:59hs
 
•
 
Anuncio
 
de
 
finalistas
 
y
 
evento
 
final
:
 
lunes
 
08/06/2026
 
 

🧠 Criterios de evaluación 
El jurado evaluará principalmente: 
• Creatividad analítica: Identificación y cuantificación de factores no evidentes que 
determinan
 
el
 
interés
 
de
 
un
 
partido,
 
más
 
allá
 
de
 
métricas
 
tradicionales
 
como
 
el
 
ranking
 
FIFA.
 
• Rigor metodológico: Solidez en la justificación de las recomendaciones y la métrica del 
éxito
 
elegida
 
para
 
validar
 
el
 
modelo.
 
 
• Demo interactiva: Interfaz web con foco en dos aspectos: que el sistema funcione 
correctamente
 
de
 
punta
 
a
 
punta
 
(configuración
 
de
 
perfil,
 
clasificación
 
de
 
partidos
 
y
 
visualización
 
de
 
resultados)
 
y
 
que
 
la
 
experiencia
 
de
 
uso
 
sea
 
clara
 
e
 
intuitiva
 
para
 
cualquier
 
usuario,
 
independientemente
 
de
 
su
 
perfil
 
técnico.
 
No
 
se
 
requiere
 
un
 
diseño
 
sofisticado,
 
pero
 
sí
 
una
 
herramienta
 
que
 
cumpla
 
su
 
propósito
 
de
 
forma
 
efectiva
 
y
 
comprensible.
 
 
 
🏆 Premios 
🥇 Primer puesto 
50%
 
de
 
descuento
 
en
 
el
 
valor
 
de
 
la
 
Maestría
 
en
 
Inteligencia
 
Artificial
 
para
 
cada
 
integrante
 
del
 
equipo
 
+
 
1
 
camiseta
 
oficial
 
de
 
Argentina
 
por
 
integrante.
 
🥈 Segundo puesto 
30%
 
de
 
descuento
 
en
 
el
 
valor
 
de
 
la
 
Maestría
 
en
 
Inteligencia
 
Artificial
 
para
 
cada
 
integrante
 
del
 
equipo
 
+
 
1
 
pelota
 
oficial
 
del
 
Mundial
 
2026
 
por
 
integrante.
 
🥉 Tercer puesto 
20%
 
de
 
descuento
 
en
 
el
 
valor
 
de
 
la
 
Maestría
 
en
 
Inteligencia
 
Artificial
 
para
 
cada
 
integrante
 
del
 
equipo.
 
📜 Certificación 
Todos
 
los
 
equipos
 
que
 
completen
 
la
 
entrega
 
recibirán
 
certificado
 
de
 
participación
 
emitido
 
por
 
la
 
Facultad
 
de
 
Ingeniería.
 
 
📩 Canal de consultas 
Durante el período de desarrollo, los equipos podrán canalizar sus consultas a través del 
siguiente
 
mail:
 
📩 dcastro-ext@austral.edu.ar 

 
📌 Consideraciones finales 
• La competencia contará con un jurado evaluador designado por la organización. Sólo se 
considerarán
 
válidas
 
y
 
susceptibles
 
de
 
premiación
 
aquellas
 
entregas
 
que,
 
a
 
exclusivo
 
criterio
 
de
 
este
 
jurado,
 
cumplan
 
satisfactoriamente
 
con
 
los
 
objetivos,
 
el
 
rigor
 
analítico
 
y
 
el
 
nivel
 
de
 
calidad
 
esperado.
 
• El fallo emitido por el jurado evaluador sobre la elección de los ganadores y la validez de 
los
 
trabajos
 
será
 
definitivo
 
e
 
inapelable.
 
 
 
¡MUCHOS
 
ÉXITOS
 
A
 
TODOS!
```
